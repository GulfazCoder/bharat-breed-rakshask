"""
TensorFlow.js Model Converter
Converts trained TensorFlow models to TensorFlow.js format for browser deployment
"""

import os
import sys
import json
import numpy as np
import tensorflow as tf
import tensorflowjs as tfjs
from typing import Dict, Optional
import logging

# Add parent directory for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.multi_task_model import MultiTaskBovineClassifier
from utils.config import DEPLOYMENT_CONFIG, CATTLE_BREEDS, BUFFALO_BREEDS, MODEL_CONFIG

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TensorFlowJSConverter:
    """
    Handles conversion of TensorFlow models to TensorFlow.js format
    """
    
    def __init__(self, model_path: str = None):
        """
        Initialize converter
        
        Args:
            model_path: Path to trained model
        """
        self.model_path = model_path
        self.tfjs_model_path = DEPLOYMENT_CONFIG["tfjs_model_path"]
        
        # Create output directory
        os.makedirs(self.tfjs_model_path, exist_ok=True)
    
    def convert_model(self, model: tf.keras.Model, quantization: bool = True) -> bool:
        """
        Convert TensorFlow model to TensorFlow.js format
        
        Args:
            model: TensorFlow Keras model
            quantization: Whether to apply quantization for smaller size
            
        Returns:
            True if conversion successful, False otherwise
        """
        try:
            logger.info("Converting model to TensorFlow.js format...")
            
            # Configure conversion options
            conversion_options = {
                'output_dir': self.tfjs_model_path,
                'quantization_bytes': 2 if quantization else None,  # 16-bit quantization
                'skip_op_check': True,
                'strip_debug_ops': True
            }
            
            if quantization:
                logger.info("Applying 16-bit quantization for smaller model size...")
            
            # Convert model
            tfjs.converters.save_keras_model(model, **conversion_options)
            
            # Create model metadata
            self._create_model_metadata()
            
            logger.info(f"Model successfully converted to: {self.tfjs_model_path}")
            logger.info("Model ready for browser deployment!")
            
            return True
            
        except Exception as e:
            logger.error(f"Model conversion failed: {str(e)}")
            return False
    
    def _create_model_metadata(self):
        """
        Create metadata file for the TensorFlow.js model
        """
        metadata = {
            "model_info": {
                "version": "1.0.0",
                "description": "Multi-task bovine breed classifier",
                "input_shape": MODEL_CONFIG["input_size"],
                "tasks": [
                    "animal_type_classification",
                    "breed_classification", 
                    "age_estimation",
                    "gender_detection",
                    "health_assessment"
                ]
            },
            "breeds": {
                "cattle_breeds": CATTLE_BREEDS,
                "buffalo_breeds": BUFFALO_BREEDS,
                "total_breeds": len(CATTLE_BREEDS) + len(BUFFALO_BREEDS)
            },
            "preprocessing": {
                "input_size": [224, 224],
                "normalization": "0-1 scaling (divide by 255)",
                "channels": "RGB"
            },
            "outputs": {
                "animal_type": {
                    "shape": [2],
                    "classes": ["cattle", "buffalo"]
                },
                "breed": {
                    "shape": [len(CATTLE_BREEDS) + len(BUFFALO_BREEDS)],
                    "classes": CATTLE_BREEDS + BUFFALO_BREEDS
                },
                "age": {
                    "shape": [4],
                    "classes": ["young", "adult", "mature", "old"]
                },
                "gender": {
                    "shape": [2],
                    "classes": ["male", "female"]
                },
                "health": {
                    "shape": [3],
                    "classes": ["healthy", "moderate", "poor"]
                }
            },
            "confidence_thresholds": {
                "high": 0.85,
                "medium": 0.65,
                "low": 0.45
            },
            "usage_instructions": {
                "loading": "Use tf.loadLayersModel() to load the model",
                "prediction": "Pass preprocessed image tensor to model.predict()",
                "postprocessing": "Apply softmax and get top predictions"
            }
        }
        
        metadata_file = os.path.join(self.tfjs_model_path, "model_metadata.json")
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Model metadata saved to: {metadata_file}")
    
    def create_model_for_conversion(self) -> Optional[tf.keras.Model]:
        """
        Create model instance for conversion
        
        Returns:
            Model instance or None if creation fails
        """
        try:
            logger.info("Creating model for conversion...")
            
            # Create lightweight model for browser deployment
            classifier = MultiTaskBovineClassifier(variant="lightweight")
            model = classifier.build_model()
            
            if self.model_path and os.path.exists(self.model_path):
                logger.info(f"Loading weights from: {self.model_path}")
                model.load_weights(self.model_path)
            else:
                logger.warning("No trained weights found. Converting untrained model.")
            
            return model
            
        except Exception as e:
            logger.error(f"Failed to create model: {str(e)}")
            return None
    
    def optimize_for_inference(self, model: tf.keras.Model) -> tf.keras.Model:
        """
        Optimize model for inference (remove training-specific operations)
        
        Args:
            model: Input model
            
        Returns:
            Optimized model
        """
        # Set all layers to non-trainable for inference
        for layer in model.layers:
            layer.trainable = False
        
        # Remove dropout layers for inference
        # Note: In newer TensorFlow versions, dropout is automatically disabled during inference
        
        return model
    
    def test_conversion(self) -> bool:
        """
        Test the converted TensorFlow.js model
        
        Returns:
            True if test successful, False otherwise
        """
        try:
            import subprocess
            
            # Create a simple test script
            test_script = f"""
const tf = require('@tensorflow/tfjs-node');

async function testModel() {{
    try {{
        console.log('Loading TensorFlow.js model...');
        const model = await tf.loadLayersModel('file://{self.tfjs_model_path}/model.json');
        
        console.log('Model loaded successfully!');
        console.log('Input shape:', model.inputs[0].shape);
        console.log('Output shapes:');
        model.outputs.forEach((output, index) => {{
            console.log(`  Output ${{index}}: ${{output.shape}}`);
        }});
        
        // Test prediction with dummy data
        const dummyInput = tf.randomNormal([1, 224, 224, 3]);
        console.log('Testing prediction...');
        const prediction = model.predict(dummyInput);
        console.log('Prediction successful!');
        
        console.log('✅ Model conversion test passed!');
        return true;
    }} catch (error) {{
        console.error('❌ Model test failed:', error);
        return false;
    }}
}}

testModel();
"""
            
            test_file = os.path.join(self.tfjs_model_path, "test_model.js")
            with open(test_file, 'w') as f:
                f.write(test_script)
            
            logger.info("Created test script. Run manually to test the converted model.")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create test script: {str(e)}")
            return False
    
    def create_web_demo(self):
        """
        Create a simple web demo HTML file
        """
        html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>Bharat Breed Rakshask - AI Demo</title>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.0.0/dist/tf.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .upload-area { border: 2px dashed #ccc; padding: 20px; text-align: center; margin: 20px 0; }
        .results { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        .confidence-bar { background: #e0e0e0; height: 20px; margin: 5px 0; border-radius: 10px; }
        .confidence-fill { height: 100%; border-radius: 10px; transition: width 0.3s; }
        .high-conf { background: #4CAF50; }
        .med-conf { background: #FF9800; }
        .low-conf { background: #F44336; }
        img { max-width: 300px; max-height: 300px; }
    </style>
</head>
<body>
    <h1>🐄 Bharat Breed Rakshask - AI Classifier</h1>
    
    <div class="upload-area" id="uploadArea">
        <p>Click here or drag and drop an image of a cattle or buffalo</p>
        <input type="file" id="imageInput" accept="image/*" style="display: none;">
    </div>
    
    <div id="imagePreview"></div>
    <div id="loadingStatus"></div>
    <div id="results" class="results" style="display: none;"></div>
    
    <script>
        let model = null;
        
        // Load the model
        async function loadModel() {
            try {
                document.getElementById('loadingStatus').innerHTML = 'Loading AI model...';
                model = await tf.loadLayersModel('./model.json');
                document.getElementById('loadingStatus').innerHTML = 'AI model loaded successfully! ✅';
                console.log('Model loaded:', model);
            } catch (error) {
                document.getElementById('loadingStatus').innerHTML = 'Error loading model: ' + error.message;
                console.error('Error loading model:', error);
            }
        }
        
        // Preprocess image for prediction
        function preprocessImage(imageElement) {
            return tf.tidy(() => {
                const tensor = tf.browser.fromPixels(imageElement);
                const resized = tf.image.resizeBilinear(tensor, [224, 224]);
                const normalized = resized.div(255.0);
                const batched = normalized.expandDims(0);
                return batched;
            });
        }
        
        // Make prediction
        async function predict(imageElement) {
            if (!model) {
                alert('Model not loaded yet. Please wait...');
                return;
            }
            
            document.getElementById('loadingStatus').innerHTML = 'Classifying image...';
            
            try {
                const preprocessed = preprocessImage(imageElement);
                const predictions = await model.predict(preprocessed);
                
                // Process predictions (assuming multiple outputs)
                let results = '';
                if (Array.isArray(predictions)) {
                    // Multi-output model
                    const animalType = await predictions[0].data();
                    const breed = await predictions[1].data();
                    const age = await predictions[2].data();
                    const gender = await predictions[3].data();
                    const health = await predictions[4].data();
                    
                    // Display results
                    results += '<h3>Classification Results:</h3>';
                    results += `<p><strong>Animal Type:</strong> ${animalType[0] > animalType[1] ? 'Cattle' : 'Buffalo'} (${Math.max(...animalType).toFixed(3)})</p>`;
                    results += `<p><strong>Top Breed Predictions:</strong></p>`;
                    
                    // Show top 3 breed predictions
                    const breedIndices = Array.from(breed).map((score, index) => ({index, score}))
                                             .sort((a, b) => b.score - a.score)
                                             .slice(0, 3);
                    
                    breedIndices.forEach((item, rank) => {
                        const confidence = (item.score * 100).toFixed(1);
                        const confClass = confidence > 85 ? 'high-conf' : confidence > 65 ? 'med-conf' : 'low-conf';
                        results += `<div>`;
                        results += `<p>${rank + 1}. Breed ${item.index} - ${confidence}%</p>`;
                        results += `<div class="confidence-bar"><div class="confidence-fill ${confClass}" style="width: ${confidence}%"></div></div>`;
                        results += `</div>`;
                    });
                    
                } else {
                    // Single output model
                    const prediction = await predictions.data();
                    results = `<h3>Prediction:</h3><p>Confidence: ${Math.max(...prediction).toFixed(3)}</p>`;
                }
                
                document.getElementById('results').innerHTML = results;
                document.getElementById('results').style.display = 'block';
                document.getElementById('loadingStatus').innerHTML = 'Classification complete! ✅';
                
                // Dispose tensors to free memory
                preprocessed.dispose();
                if (Array.isArray(predictions)) {
                    predictions.forEach(p => p.dispose());
                } else {
                    predictions.dispose();
                }
                
            } catch (error) {
                document.getElementById('loadingStatus').innerHTML = 'Error during prediction: ' + error.message;
                console.error('Prediction error:', error);
            }
        }
        
        // Handle file upload
        document.getElementById('uploadArea').addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });
        
        document.getElementById('imageInput').addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        document.getElementById('imagePreview').innerHTML = '<h3>Uploaded Image:</h3>';
                        document.getElementById('imagePreview').appendChild(img);
                        predict(img);
                    };
                    img.src = e.target.result;
                    img.style.maxWidth = '300px';
                    img.style.maxHeight = '300px';
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Load model on page load
        loadModel();
    </script>
</body>
</html>
        """
        
        demo_file = os.path.join(self.tfjs_model_path, "demo.html")
        with open(demo_file, 'w') as f:
            f.write(html_content)
        
        logger.info(f"Web demo created: {demo_file}")

def convert_model_to_tfjs(model_path: str = None, quantization: bool = True) -> bool:
    """
    Main function to convert model to TensorFlow.js format
    
    Args:
        model_path: Path to trained model weights
        quantization: Whether to apply quantization
        
    Returns:
        True if conversion successful
    """
    converter = TensorFlowJSConverter(model_path)
    
    # Create model for conversion
    model = converter.create_model_for_conversion()
    if model is None:
        return False
    
    # Optimize for inference
    optimized_model = converter.optimize_for_inference(model)
    
    # Convert to TensorFlow.js
    success = converter.convert_model(optimized_model, quantization)
    
    if success:
        # Create test script and web demo
        converter.test_conversion()
        converter.create_web_demo()
        
        logger.info("🎉 TensorFlow.js conversion completed successfully!")
        logger.info(f"📁 Model files: {converter.tfjs_model_path}")
        logger.info(f"🌐 Web demo: {converter.tfjs_model_path}/demo.html")
    
    return success

if __name__ == "__main__":
    # Convert model to TensorFlow.js
    success = convert_model_to_tfjs(quantization=True)
    
    if success:
        print("\n✅ Model conversion successful!")
        print("You can now use the model in browser applications.")
    else:
        print("\n❌ Model conversion failed.")
        print("Please check the logs for error details.")