"""
Dataset Collection and Preprocessing Pipeline
Handles data from multiple sources: Kaggle, Roboflow, GitHub
"""

import os
import sys
import json
import requests
import zipfile
import numpy as np
import pandas as pd
from PIL import Image
import cv2
from typing import Dict, List, Tuple, Optional
import logging
from pathlib import Path
import shutil
from tqdm import tqdm
import albumentations as A
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight
import tensorflow as tf

# Add parent directory for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.config import (
    DATA_DIR, DATASET_URLS, CATTLE_BREEDS, BUFFALO_BREEDS,
    AUGMENTATION_CONFIG, MODEL_CONFIG
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatasetManager:
    """
    Manages dataset collection, preprocessing, and augmentation
    """
    
    def __init__(self, data_dir: str = None):
        """
        Initialize dataset manager
        
        Args:
            data_dir: Directory to store datasets
        """
        self.data_dir = Path(data_dir) if data_dir else Path(DATA_DIR)
        self.raw_data_dir = self.data_dir / "raw"
        self.processed_data_dir = self.data_dir / "processed"
        self.augmented_data_dir = self.data_dir / "augmented"
        
        # Create directories
        for dir_path in [self.raw_data_dir, self.processed_data_dir, self.augmented_data_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
        
        # All supported breeds
        self.all_breeds = CATTLE_BREEDS + BUFFALO_BREEDS
        self.breed_to_idx = {breed: idx for idx, breed in enumerate(self.all_breeds)}
        
        # Dataset statistics
        self.dataset_stats = {}
        
    def download_kaggle_dataset(self, dataset_name: str, dataset_id: str) -> bool:
        """
        Download dataset from Kaggle using API
        
        Args:
            dataset_name: Name for local storage
            dataset_id: Kaggle dataset ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if kaggle API is configured
            import kaggle
            
            output_dir = self.raw_data_dir / dataset_name
            output_dir.mkdir(exist_ok=True)
            
            logger.info(f"Downloading Kaggle dataset: {dataset_id}")
            
            # Download and extract
            kaggle.api.dataset_download_files(
                dataset_id, 
                path=str(output_dir),
                unzip=True
            )
            
            logger.info(f"Successfully downloaded {dataset_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to download {dataset_name}: {str(e)}")
            logger.info("Make sure you have configured Kaggle API credentials")
            return False
    
    def download_roboflow_dataset(self, project_id: str, version: str = "1") -> bool:
        """
        Download dataset from Roboflow Universe
        
        Args:
            project_id: Roboflow project ID
            version: Dataset version
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # For now, provide instructions for manual download
            logger.info(f"For Roboflow dataset {project_id}:")
            logger.info("1. Go to the Roboflow Universe project page")
            logger.info("2. Download the dataset in 'Classification' format")
            logger.info(f"3. Extract to {self.raw_data_dir / f'roboflow_{project_id}'}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to setup Roboflow download: {str(e)}")
            return False
    
    def collect_all_datasets(self) -> Dict[str, bool]:
        """
        Collect all datasets from curated sources
        
        Returns:
            Dictionary with dataset names and success status
        """
        results = {}
        
        # Kaggle datasets
        kaggle_datasets = {
            "indian_bovine_breeds": "lukex9442/indian-bovine-breeds",
            "cows_buffalo_cv": "raghavdharwal/cows-and-buffalo-computer-vision-dataset",
            "cattle_breeds": "priyanshu594/cattle-breeds",
            "cows_detection": "trainingdatapro/cows-detection-dataset",
            "mmcows": "hienvuvg/mmcows"
        }
        
        for name, dataset_id in kaggle_datasets.items():
            results[name] = self.download_kaggle_dataset(name, dataset_id)
        
        # Roboflow datasets (manual download instructions)
        roboflow_projects = {
            "indian_bovine_recognition": "chad-teeru/indian-bovine-breed-recognition-hen07-zls8t",
            "indian_bovine_pib": "pib-e46kr/indian-bovine"
        }
        
        for name, project_id in roboflow_projects.items():
            results[name] = self.download_roboflow_dataset(project_id)
        
        return results
    
    def create_augmentation_pipeline(self) -> A.Compose:
        """
        Create image augmentation pipeline using Albumentations
        
        Returns:
            Augmentation pipeline
        """
        transform = A.Compose([
            # Geometric transformations
            A.Rotate(
                limit=AUGMENTATION_CONFIG["rotation_range"], 
                p=0.7
            ),
            A.ShiftScaleRotate(
                shift_limit=0.1,
                scale_limit=0.1,
                rotate_limit=15,
                p=0.5
            ),
            A.HorizontalFlip(p=0.5),
            
            # Color augmentations
            A.RandomBrightnessContrast(
                brightness_limit=0.2,
                contrast_limit=0.2,
                p=0.6
            ),
            A.HueSaturationValue(
                hue_shift_limit=20,
                sat_shift_limit=30,
                val_shift_limit=20,
                p=0.5
            ),
            
            # Noise and blur
            A.OneOf([
                A.GaussNoise(var_limit=(10.0, 50.0)),
                A.GaussianBlur(blur_limit=3),
                A.MotionBlur(blur_limit=3),
            ], p=0.3),
            
            # Weather effects (for outdoor images)
            A.OneOf([
                A.RandomShadow(p=0.3),
                A.RandomSunFlare(p=0.2),
                A.RandomRain(p=0.2),
            ], p=0.2),
            
            # Final resize and normalization
            A.Resize(224, 224),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        return transform
    
    def preprocess_single_dataset(self, dataset_path: Path, dataset_name: str) -> pd.DataFrame:
        """
        Preprocess a single dataset folder
        
        Args:
            dataset_path: Path to dataset folder
            dataset_name: Name of the dataset
            
        Returns:
            DataFrame with image paths and labels
        """
        data_records = []
        
        try:
            # Different folder structures for different datasets
            if dataset_name == "indian_bovine_breeds":
                # Structure: breed_folders/images
                for breed_folder in dataset_path.iterdir():
                    if breed_folder.is_dir():
                        breed_name = breed_folder.name
                        
                        # Clean breed name
                        breed_name = self._clean_breed_name(breed_name)
                        
                        if breed_name in self.all_breeds:
                            for img_file in breed_folder.glob("*.jpg"):
                                data_records.append({
                                    "image_path": str(img_file),
                                    "breed": breed_name,
                                    "animal_type": "cattle" if breed_name in CATTLE_BREEDS else "buffalo",
                                    "dataset_source": dataset_name
                                })
            
            elif dataset_name in ["cows_buffalo_cv", "cattle_breeds"]:
                # Structure: train/breed_folders/images or similar
                for subfolder in dataset_path.rglob("*"):
                    if subfolder.is_dir() and any(subfolder.glob("*.jpg")):
                        breed_name = self._clean_breed_name(subfolder.name)
                        
                        if breed_name in self.all_breeds:
                            for img_file in subfolder.glob("*.jpg"):
                                data_records.append({
                                    "image_path": str(img_file),
                                    "breed": breed_name,
                                    "animal_type": "cattle" if breed_name in CATTLE_BREEDS else "buffalo",
                                    "dataset_source": dataset_name
                                })
            
            # Handle other dataset structures as needed
            
        except Exception as e:
            logger.error(f"Error preprocessing {dataset_name}: {str(e)}")
        
        df = pd.DataFrame(data_records)
        logger.info(f"Processed {len(df)} images from {dataset_name}")
        
        return df
    
    def _clean_breed_name(self, raw_name: str) -> str:
        """
        Clean and standardize breed names
        
        Args:
            raw_name: Raw breed name from dataset
            
        Returns:
            Cleaned breed name
        """
        # Convert to title case and remove extra characters
        cleaned = raw_name.strip().replace("_", " ").title()
        
        # Handle specific mappings
        breed_mappings = {
            "Red Sindhi": "Red Sindhi",
            "Gir": "Gir",
            "Sahiwal": "Sahiwal",
            "Murrah": "Murrah",
            "Nili Ravi": "Nili-Ravi",
            "Nili-Ravi": "Nili-Ravi",
            "Hariana": "Hariana",
            "Tharparkar": "Tharparkar",
            # Add more mappings as needed
        }
        
        return breed_mappings.get(cleaned, cleaned)
    
    def process_all_datasets(self) -> pd.DataFrame:
        """
        Process all available datasets and combine them
        
        Returns:
            Combined DataFrame with all processed data
        """
        all_dataframes = []
        
        # Process each dataset
        for dataset_folder in self.raw_data_dir.iterdir():
            if dataset_folder.is_dir():
                dataset_name = dataset_folder.name
                logger.info(f"Processing dataset: {dataset_name}")
                
                df = self.preprocess_single_dataset(dataset_folder, dataset_name)
                if not df.empty:
                    all_dataframes.append(df)
        
        if not all_dataframes:
            logger.warning("No datasets found to process")
            return pd.DataFrame()
        
        # Combine all datasets
        combined_df = pd.concat(all_dataframes, ignore_index=True)
        
        # Remove duplicates based on image content (if possible) or path
        combined_df = combined_df.drop_duplicates(subset=['image_path'])
        
        # Filter only supported breeds
        combined_df = combined_df[combined_df['breed'].isin(self.all_breeds)]
        
        # Add breed indices
        combined_df['breed_idx'] = combined_df['breed'].map(self.breed_to_idx)
        
        # Save processed dataset info
        processed_file = self.processed_data_dir / "combined_dataset.csv"
        combined_df.to_csv(processed_file, index=False)
        
        # Generate dataset statistics
        self._generate_dataset_stats(combined_df)
        
        logger.info(f"Combined dataset: {len(combined_df)} images, {combined_df['breed'].nunique()} breeds")
        
        return combined_df
    
    def _generate_dataset_stats(self, df: pd.DataFrame):
        """
        Generate and save dataset statistics
        
        Args:
            df: Dataset DataFrame
        """
        stats = {
            "total_images": len(df),
            "total_breeds": df['breed'].nunique(),
            "cattle_images": len(df[df['animal_type'] == 'cattle']),
            "buffalo_images": len(df[df['animal_type'] == 'buffalo']),
            "breed_distribution": df['breed'].value_counts().to_dict(),
            "dataset_sources": df['dataset_source'].value_counts().to_dict(),
            "images_per_breed": {
                "min": df['breed'].value_counts().min(),
                "max": df['breed'].value_counts().max(),
                "mean": df['breed'].value_counts().mean(),
                "median": df['breed'].value_counts().median()
            }
        }
        
        self.dataset_stats = stats
        
        # Save stats
        stats_file = self.processed_data_dir / "dataset_stats.json"
        with open(stats_file, 'w') as f:
            json.dump(stats, f, indent=2)
        
        logger.info(f"Dataset statistics saved to {stats_file}")
    
    def create_balanced_dataset(self, df: pd.DataFrame, min_samples_per_breed: int = 50) -> pd.DataFrame:
        """
        Create a balanced dataset by handling class imbalance
        
        Args:
            df: Input DataFrame
            min_samples_per_breed: Minimum samples per breed
            
        Returns:
            Balanced DataFrame
        """
        balanced_data = []
        
        for breed in df['breed'].unique():
            breed_data = df[df['breed'] == breed].copy()
            
            if len(breed_data) >= min_samples_per_breed:
                # If we have enough samples, use all
                balanced_data.append(breed_data)
            elif len(breed_data) >= 20:  # Minimum threshold
                # Use what we have and mark for augmentation
                breed_data['needs_augmentation'] = True
                balanced_data.append(breed_data)
            else:
                # Too few samples, skip this breed for now
                logger.warning(f"Skipping breed {breed} - only {len(breed_data)} samples")
        
        if not balanced_data:
            return pd.DataFrame()
        
        balanced_df = pd.concat(balanced_data, ignore_index=True)
        logger.info(f"Balanced dataset: {len(balanced_df)} images, {balanced_df['breed'].nunique()} breeds")
        
        return balanced_df
    
    def split_dataset(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Split dataset into train, validation, and test sets
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (train_df, val_df, test_df)
        """
        # Stratified split to maintain breed distribution
        train_val_df, test_df = train_test_split(
            df, 
            test_size=MODEL_CONFIG["test_split"],
            stratify=df['breed'],
            random_state=MODEL_CONFIG["random_state"]
        )
        
        train_df, val_df = train_test_split(
            train_val_df,
            test_size=MODEL_CONFIG["validation_split"] / (1 - MODEL_CONFIG["test_split"]),
            stratify=train_val_df['breed'],
            random_state=MODEL_CONFIG["random_state"]
        )
        
        # Save splits
        train_df.to_csv(self.processed_data_dir / "train_dataset.csv", index=False)
        val_df.to_csv(self.processed_data_dir / "val_dataset.csv", index=False)
        test_df.to_csv(self.processed_data_dir / "test_dataset.csv", index=False)
        
        logger.info(f"Dataset split - Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")
        
        return train_df, val_df, test_df
    
    def create_tensorflow_dataset(self, df: pd.DataFrame, batch_size: int = 32, 
                                augment: bool = False) -> tf.data.Dataset:
        """
        Create TensorFlow Dataset from DataFrame
        
        Args:
            df: Input DataFrame
            batch_size: Batch size
            augment: Whether to apply augmentation
            
        Returns:
            TensorFlow Dataset
        """
        def load_and_preprocess_image(image_path, breed_idx, animal_type, age, gender, health):
            # Load image
            image = tf.io.read_file(image_path)
            image = tf.image.decode_jpeg(image, channels=3)
            image = tf.image.resize(image, [224, 224])
            image = tf.cast(image, tf.float32) / 255.0
            
            # Create multi-task labels
            labels = {
                'breed': tf.one_hot(breed_idx, len(self.all_breeds)),
                'animal_type': tf.one_hot(0 if animal_type == 'cattle' else 1, 2),
                'age': tf.one_hot(age, 4),  # 4 age groups
                'gender': tf.one_hot(gender, 2),
                'health': tf.one_hot(health, 3)  # 3 health levels
            }
            
            return image, labels
        
        # For now, create dummy labels for age, gender, health
        # In production, these would come from dataset annotations
        df = df.copy()
        df['age'] = np.random.randint(0, 4, len(df))  # Random age groups
        df['gender'] = np.random.randint(0, 2, len(df))  # Random gender
        df['health'] = np.random.randint(0, 3, len(df))  # Random health
        
        dataset = tf.data.Dataset.from_tensor_slices({
            'image_path': df['image_path'].values,
            'breed_idx': df['breed_idx'].values,
            'animal_type': df['animal_type'].values,
            'age': df['age'].values,
            'gender': df['gender'].values,
            'health': df['health'].values
        })
        
        dataset = dataset.map(
            lambda x: load_and_preprocess_image(
                x['image_path'], x['breed_idx'], x['animal_type'],
                x['age'], x['gender'], x['health']
            ),
            num_parallel_calls=tf.data.AUTOTUNE
        )
        
        if augment:
            # Apply augmentation here if needed
            pass
        
        dataset = dataset.batch(batch_size).prefetch(tf.data.AUTOTUNE)
        
        return dataset
    
    def get_class_weights(self, df: pd.DataFrame) -> Dict[int, float]:
        """
        Calculate class weights for handling imbalanced data
        
        Args:
            df: Dataset DataFrame
            
        Returns:
            Dictionary of class weights
        """
        breed_counts = df['breed'].value_counts()
        class_weights = compute_class_weight(
            'balanced',
            classes=np.unique(df['breed_idx']),
            y=df['breed_idx']
        )
        
        return {i: weight for i, weight in enumerate(class_weights)}

def setup_complete_dataset() -> DatasetManager:
    """
    Setup complete dataset pipeline
    
    Returns:
        Configured DatasetManager instance
    """
    manager = DatasetManager()
    
    logger.info("Starting dataset collection and preprocessing...")
    
    # Step 1: Collect datasets (manual for now)
    logger.info("Step 1: Collect datasets")
    collection_results = manager.collect_all_datasets()
    
    # Step 2: Process all datasets
    logger.info("Step 2: Process datasets")
    combined_df = manager.process_all_datasets()
    
    if combined_df.empty:
        logger.warning("No datasets processed successfully")
        return manager
    
    # Step 3: Create balanced dataset
    logger.info("Step 3: Balance dataset")
    balanced_df = manager.create_balanced_dataset(combined_df)
    
    # Step 4: Split dataset
    logger.info("Step 4: Split dataset")
    train_df, val_df, test_df = manager.split_dataset(balanced_df)
    
    logger.info("Dataset setup complete!")
    logger.info(f"Final dataset: {len(balanced_df)} images, {balanced_df['breed'].nunique()} breeds")
    
    return manager

if __name__ == "__main__":
    # Setup complete dataset
    dataset_manager = setup_complete_dataset()
    
    # Print statistics
    if dataset_manager.dataset_stats:
        print("\n=== Dataset Statistics ===")
        for key, value in dataset_manager.dataset_stats.items():
            print(f"{key}: {value}")