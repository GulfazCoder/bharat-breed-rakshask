"""
Configuration file for Bharat Breed Rakshask AI Classification System
Contains breed mappings, model parameters, and dataset configurations
"""

import os
from typing import Dict, List, Tuple

# Base Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
LOGS_DIR = os.path.join(PROJECT_ROOT, "logs")

# Model Configuration
MODEL_CONFIG = {
    "input_size": (224, 224, 3),
    "batch_size": 32,
    "learning_rate": 0.001,
    "epochs": 100,
    "patience": 15,
    "validation_split": 0.2,
    "test_split": 0.1,
    "random_state": 42
}

# EfficientNet Model Variants (for different deployment scenarios)
EFFICIENTNET_VARIANTS = {
    "lightweight": "efficientnet_b0",    # For mobile/edge deployment
    "balanced": "efficientnet_b2",       # For server deployment
    "accurate": "efficientnet_b4"        # For maximum accuracy
}

# Data Augmentation Configuration
AUGMENTATION_CONFIG = {
    "rotation_range": 20,
    "width_shift_range": 0.2,
    "height_shift_range": 0.2,
    "shear_range": 0.2,
    "zoom_range": 0.2,
    "horizontal_flip": True,
    "brightness_range": [0.8, 1.2],
    "contrast_range": [0.8, 1.2],
    "saturation_range": [0.8, 1.2],
    "hue_range": [-0.1, 0.1]
}

# Cattle Breeds (47 breeds from database)
CATTLE_BREEDS = [
    "Amritmahal", "Bachaur", "Bargur", "Dangi", "Deoni", "Gaolao", "Gir", 
    "Hallikar", "Hariana", "Kangayam", "Kankrej", "Kherigarh", "Khillari",
    "Krishna Valley", "Malnad Gidda", "Malvi", "Mewati", "Nagori", "Nellore",
    "Nimari", "Ongole", "Ponwar", "Pulikulam", "Rathi", "Red Kandhari",
    "Red Sindhi", "Sahiwal", "Siri", "Tharparkar", "Umblachery", "Vechur",
    "Alambadi", "Bargur", "Belahi", "Binjharpuri", "Gangatiri", "Gobra",
    "Kachcha", "Kenwariya", "Kosali", "Lohani", "Malnad Gidda", "Mandvi",
    "Nagauri", "Palamedu", "Punganur", "Vadiya"
]

# Buffalo Breeds (31 breeds from database)
BUFFALO_BREEDS = [
    "Bhadawari", "Jaffarabadi", "Mehsana", "Murrah", "Nili-Ravi", "Pandharpuri",
    "Surti", "Toda", "Bargur", "Kalahandi", "Marathwada", "Nagpuri", "Godavari",
    "Chilika", "Dibrugarh", "Jerangi", "Lakhimi", "Swamp Buffalo", "Tarai",
    "Banni", "Gojri", "Kundi", "Lime", "Manda", "Manipuri", "Nagpuri",
    "Sambalpuri", "Chhattisgarhi", "Dharwadi", "Ellichpur", "Pandharpuri"
]

# Complete breed mapping with IDs
BREED_MAPPING = {
    **{f"cattle_{i}": breed for i, breed in enumerate(CATTLE_BREEDS)},
    **{f"buffalo_{i}": breed for i, breed in enumerate(BUFFALO_BREEDS)}
}

# Reverse mapping for classification
ID_TO_BREED = {v: k for k, v in BREED_MAPPING.items()}

# Visual features for feature extraction
VISUAL_FEATURES = {
    "body_color": ["grey", "white", "reddish", "brown", "black", "dun"],
    "horn_shape": ["curved", "forward", "upward", "lateral", "thick", "short"],
    "hump_type": ["small", "prominent", "large", "well_defined"],
    "ear_type": ["large", "medium", "pendulous", "drooping", "upright", "folded"],
    "body_size": ["small", "medium", "large"],
    "markings": ["spots", "patches", "solid", "mixed"]
}

# Age estimation ranges
AGE_RANGES = {
    "young": (1, 3),      # 1-3 years
    "adult": (3, 8),      # 3-8 years
    "mature": (8, 15),    # 8-15 years
    "old": (15, 25)       # 15+ years
}

# Health indicators
HEALTH_INDICATORS = {
    "coat_condition": ["healthy", "dull", "rough"],
    "body_condition": ["thin", "normal", "overweight"],
    "posture": ["alert", "normal", "lethargic"],
    "eyes": ["bright", "normal", "dull"]
}

# Gender classification
GENDER_CLASSES = ["male", "female"]

# Dataset URLs from curated list
DATASET_URLS = {
    "indian_bovine_breeds": "https://www.kaggle.com/datasets/lukex9442/indian-bovine-breeds",
    "cows_buffalo_cv": "https://www.kaggle.com/datasets/raghavdharwal/cows-and-buffalo-computer-vision-dataset",
    "roboflow_bovine": "https://universe.roboflow.com/chad-teeru/indian-bovine-breed-recognition-hen07-zls8t",
    "roboflow_pib": "https://universe.roboflow.com/pib-e46kr/indian-bovine",
    "cows_detection": "https://www.kaggle.com/datasets/trainingdatapro/cows-detection-dataset",
    "cattle_breeds": "https://www.kaggle.com/datasets/priyanshu594/cattle-breeds",
    "mmcows": "https://www.kaggle.com/datasets/hienvuvg/mmcows"
}

# Confidence thresholds
CONFIDENCE_THRESHOLDS = {
    "high_confidence": 0.85,
    "medium_confidence": 0.65,
    "low_confidence": 0.45,
    "uncertain": 0.45
}

# Model output structure
MODEL_OUTPUTS = {
    "breed_classification": len(CATTLE_BREEDS) + len(BUFFALO_BREEDS),
    "animal_type": 2,  # cattle vs buffalo
    "age_estimation": len(AGE_RANGES),
    "gender_detection": len(GENDER_CLASSES),
    "health_assessment": 3  # healthy, moderate, poor
}

# API Configuration
API_CONFIG = {
    "host": "0.0.0.0",
    "port": 8000,
    "reload": True,
    "max_file_size": 10 * 1024 * 1024,  # 10MB
    "allowed_extensions": [".jpg", ".jpeg", ".png", ".bmp"],
    "cors_origins": ["http://localhost:3000", "https://your-domain.com"]
}

# Deployment configurations
DEPLOYMENT_CONFIG = {
    "tfjs_model_path": os.path.join(MODELS_DIR, "tfjs_model"),
    "saved_model_path": os.path.join(MODELS_DIR, "saved_model"),
    "checkpoint_path": os.path.join(MODELS_DIR, "checkpoints"),
    "tensorboard_logs": os.path.join(LOGS_DIR, "tensorboard")
}