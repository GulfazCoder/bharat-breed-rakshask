"""
Multi-Task Neural Network for Indian Bovine Breed Classification
Includes: Breed Classification, Age Estimation, Gender Detection, Health Assessment
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import EfficientNetB0, EfficientNetB2, EfficientNetB4
import numpy as np
from typing import Dict, Tuple, List
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.config import (
    MODEL_CONFIG, EFFICIENTNET_VARIANTS, MODEL_OUTPUTS,
    CATTLE_BREEDS, BUFFALO_BREEDS, AGE_RANGES, GENDER_CLASSES
)

class MultiTaskBovineClassifier:
    """
    Multi-task learning model for comprehensive bovine analysis
    """
    
    def __init__(self, variant: str = "lightweight"):
        """
        Initialize the multi-task model
        
        Args:
            variant: Model variant (lightweight, balanced, accurate)
        """
        self.variant = variant
        self.input_shape = MODEL_CONFIG["input_size"]
        self.model = None
        
        # Output dimensions
        self.num_breeds = MODEL_OUTPUTS["breed_classification"]
        self.num_animal_types = MODEL_OUTPUTS["animal_type"]
        self.num_age_groups = MODEL_OUTPUTS["age_estimation"]
        self.num_genders = MODEL_OUTPUTS["gender_detection"]
        self.num_health_levels = MODEL_OUTPUTS["health_assessment"]
        
    def _get_base_model(self) -> Model:
        """Get the appropriate EfficientNet base model"""
        
        model_mapping = {
            "lightweight": EfficientNetB0,
            "balanced": EfficientNetB2,
            "accurate": EfficientNetB4
        }
        
        base_model_class = model_mapping.get(self.variant, EfficientNetB0)
        
        # Load pre-trained EfficientNet
        base_model = base_model_class(
            weights='imagenet',
            include_top=False,
            input_shape=self.input_shape
        )
        
        # Fine-tune from a certain layer
        if self.variant == "lightweight":
            # For mobile deployment, freeze more layers
            for layer in base_model.layers[:-20]:
                layer.trainable = False
        else:
            # For server deployment, fine-tune more layers
            for layer in base_model.layers[:-40]:
                layer.trainable = False
                
        return base_model
    
    def _create_attention_module(self, features: tf.Tensor, name: str) -> tf.Tensor:
        """
        Create attention mechanism for feature focusing
        """
        # Global average pooling to get feature summary
        gap = layers.GlobalAveragePooling2D()(features)
        
        # Attention weights
        attention = layers.Dense(features.shape[-1] // 4, activation='relu', name=f'{name}_attention_1')(gap)
        attention = layers.Dense(features.shape[-1], activation='sigmoid', name=f'{name}_attention_2')(attention)
        
        # Reshape for broadcasting
        attention = layers.Reshape((1, 1, features.shape[-1]))(attention)
        
        # Apply attention
        attended_features = layers.Multiply(name=f'{name}_attended_features')([features, attention])
        
        return attended_features
    
    def build_model(self) -> Model:
        """
        Build the complete multi-task model
        """
        
        # Input layer
        inputs = layers.Input(shape=self.input_shape, name='image_input')
        
        # Data preprocessing
        preprocessed = layers.Lambda(
            lambda x: tf.cast(x, tf.float32) / 255.0,
            name='preprocessing'
        )(inputs)
        
        # Base EfficientNet model
        base_model = self._get_base_model()
        base_features = base_model(preprocessed, training=False)
        
        # === Shared Feature Processing ===
        # Global features for all tasks
        global_pool = layers.GlobalAveragePooling2D(name='global_pool')(base_features)
        global_features = layers.Dropout(0.3, name='global_dropout')(global_pool)
        
        # Breed-specific feature extraction
        breed_conv = layers.Conv2D(256, 3, padding='same', activation='relu', name='breed_conv')(base_features)
        breed_pool = layers.GlobalAveragePooling2D(name='breed_pool')(breed_conv)
        breed_pool = layers.Dropout(0.3, name='breed_dropout')(breed_pool)
        
        # === Task-Specific Heads ===
        
        # 1. Animal Type Classification (Cattle vs Buffalo)
        animal_type = layers.Dense(64, activation='relu', name='animal_type_dense1')(global_features)
        animal_type = layers.Dropout(0.2, name='animal_type_dropout')(animal_type)
        animal_type_output = layers.Dense(
            self.num_animal_types,
            activation='softmax',
            name='animal_type_output'
        )(animal_type)
        
        # 2. Breed Classification (Main task)
        breed_dense = layers.Dense(512, activation='relu', name='breed_dense1')(breed_pool)
        breed_dense = layers.Dropout(0.4, name='breed_dense_dropout')(breed_dense)
        breed_dense = layers.Dense(256, activation='relu', name='breed_dense2')(breed_dense)
        breed_output = layers.Dense(
            self.num_breeds,
            activation='softmax',
            name='breed_output'
        )(breed_dense)
        
        # 3. Age Estimation
        age_features = layers.Concatenate(name='age_concat')([global_features, breed_pool])
        age_dense = layers.Dense(128, activation='relu', name='age_dense1')(age_features)
        age_dense = layers.Dropout(0.3, name='age_dropout')(age_dense)
        age_output = layers.Dense(
            self.num_age_groups,
            activation='softmax',
            name='age_output'
        )(age_dense)
        
        # 4. Gender Detection
        gender_features = layers.Concatenate(name='gender_concat')([global_features, breed_pool])
        gender_dense = layers.Dense(64, activation='relu', name='gender_dense1')(gender_features)
        gender_dense = layers.Dropout(0.2, name='gender_dropout')(gender_dense)
        gender_output = layers.Dense(
            self.num_genders,
            activation='softmax',
            name='gender_output'
        )(gender_dense)
        
        # 5. Health Assessment
        health_features = layers.Concatenate(name='health_concat')([global_features, breed_pool])
        health_dense = layers.Dense(128, activation='relu', name='health_dense1')(health_features)
        health_dense = layers.Dropout(0.3, name='health_dropout')(health_dense)
        health_output = layers.Dense(
            self.num_health_levels,
            activation='softmax',
            name='health_output'
        )(health_dense)
        
        # Create the model
        model = Model(
            inputs=inputs,
            outputs={
                'animal_type': animal_type_output,
                'breed': breed_output,
                'age': age_output,
                'gender': gender_output,
                'health': health_output
            },
            name=f'MultitaskBovineClassifier_{self.variant}'
        )
        
        self.model = model
        return model
    
    def compile_model(self, learning_rate: float = 0.001):
        """Compile the model with appropriate loss functions and metrics"""
        
        if self.model is None:
            raise ValueError("Model must be built before compilation")
        
        # Define loss weights (breed classification is most important)
        loss_weights = {
            'animal_type': 0.2,
            'breed': 0.4,
            'age': 0.2,
            'gender': 0.1,
            'health': 0.1
        }
        
        # Compile with multiple losses
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
            loss={
                'animal_type': 'categorical_crossentropy',
                'breed': 'categorical_crossentropy',
                'age': 'categorical_crossentropy',
                'gender': 'categorical_crossentropy',
                'health': 'categorical_crossentropy'
            },
            loss_weights=loss_weights,
            metrics={
                'animal_type': ['accuracy'],
                'breed': ['accuracy', 'top_k_categorical_accuracy'],
                'age': ['accuracy'],
                'gender': ['accuracy'],
                'health': ['accuracy']
            }
        )
    
    def predict_single(self, image: np.ndarray) -> Dict:
        """Make prediction on a single image"""
        if self.model is None:
            raise ValueError("Model must be built and loaded first")
        
        # Preprocess image
        if len(image.shape) == 3:
            image = np.expand_dims(image, axis=0)
        
        # Make prediction
        predictions = self.model.predict(image, verbose=0)
        
        # Process results
        results = {
            'animal_type': {
                'prediction': 'cattle' if np.argmax(predictions['animal_type']) == 0 else 'buffalo',
                'confidence': float(np.max(predictions['animal_type']))
            },
            'breed': {
                'prediction': self._get_breed_name(np.argmax(predictions['breed'])),
                'confidence': float(np.max(predictions['breed'])),
                'top_3': self._get_top_k_breeds(predictions['breed'], k=3)
            },
            'age': {
                'prediction': list(AGE_RANGES.keys())[np.argmax(predictions['age'])],
                'confidence': float(np.max(predictions['age']))
            },
            'gender': {
                'prediction': GENDER_CLASSES[np.argmax(predictions['gender'])],
                'confidence': float(np.max(predictions['gender']))
            },
            'health': {
                'prediction': ['healthy', 'moderate', 'poor'][np.argmax(predictions['health'])],
                'confidence': float(np.max(predictions['health']))
            }
        }
        
        return results
    
    def _get_breed_name(self, breed_index: int) -> str:
        """Get breed name from index"""
        all_breeds = CATTLE_BREEDS + BUFFALO_BREEDS
        if 0 <= breed_index < len(all_breeds):
            return all_breeds[breed_index]
        return "Unknown"
    
    def _get_top_k_breeds(self, breed_predictions: np.ndarray, k: int = 3) -> List[Dict]:
        """Get top-k breed predictions"""
        top_indices = np.argsort(breed_predictions[0])[-k:][::-1]
        top_breeds = []
        
        for idx in top_indices:
            top_breeds.append({
                'breed': self._get_breed_name(idx),
                'confidence': float(breed_predictions[0][idx])
            })
        
        return top_breeds


def create_model(variant: str = "lightweight") -> MultiTaskBovineClassifier:
    """Factory function to create and build the model"""
    classifier = MultiTaskBovineClassifier(variant=variant)
    classifier.build_model()
    classifier.compile_model()
    return classifier