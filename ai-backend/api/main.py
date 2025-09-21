"""
FastAPI Backend for Bharat Breed Rakshask AI Classification
Provides endpoints for cattle and buffalo breed recognition
"""

import os
import sys
import io
import json
import numpy as np
from PIL import Image
import cv2
from typing import Dict, List, Optional
import logging

# FastAPI and related imports
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.multi_task_model import MultiTaskBovineClassifier
from utils.config import API_CONFIG, CONFIDENCE_THRESHOLDS, CATTLE_BREEDS, BUFFALO_BREEDS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Bharat Breed Rakshask AI",
    description="AI-powered cattle and buffalo breed classification system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=API_CONFIG["cors_origins"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Global model instance
model: Optional[MultiTaskBovineClassifier] = None

# Pydantic models for request/response
class ClassificationResponse(BaseModel):
    success: bool
    data: Dict
    message: str
    processing_time: float

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    supported_breeds: Dict[str, int]

class BatchClassificationRequest(BaseModel):
    images: List[str]  # Base64 encoded images

# Helper functions
def preprocess_image(image: Image.Image) -> np.ndarray:
    """
    Preprocess uploaded image for model prediction
    
    Args:
        image: PIL Image object
        
    Returns:
        Preprocessed numpy array
    """
    try:
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size
        image = image.resize((224, 224))
        
        # Convert to numpy array
        img_array = np.array(image)
        
        return img_array
    
    except Exception as e:
        logger.error(f"Image preprocessing error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Image preprocessing failed: {str(e)}")

def validate_image(file: UploadFile) -> bool:
    """
    Validate uploaded image file
    
    Args:
        file: Uploaded file
        
    Returns:
        True if valid, raises HTTPException if not
    """
    # Check file size
    if file.size and file.size > API_CONFIG["max_file_size"]:
        raise HTTPException(
            status_code=413, 
            detail=f"File size too large. Maximum size: {API_CONFIG['max_file_size']/1024/1024}MB"
        )
    
    # Check file extension
    if file.filename:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in API_CONFIG["allowed_extensions"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file format. Allowed formats: {API_CONFIG['allowed_extensions']}"
            )
    
    return True

def get_confidence_level(confidence: float) -> str:
    """
    Determine confidence level based on score
    
    Args:
        confidence: Confidence score (0-1)
        
    Returns:
        Confidence level string
    """
    if confidence >= CONFIDENCE_THRESHOLDS["high_confidence"]:
        return "high"
    elif confidence >= CONFIDENCE_THRESHOLDS["medium_confidence"]:
        return "medium"
    elif confidence >= CONFIDENCE_THRESHOLDS["low_confidence"]:
        return "low"
    else:
        return "uncertain"

def enhance_prediction_results(results: Dict) -> Dict:
    """
    Enhance prediction results with additional information
    
    Args:
        results: Raw prediction results from model
        
    Returns:
        Enhanced results with confidence levels and breed info
    """
    enhanced = results.copy()
    
    # Add confidence levels
    for task, task_results in enhanced.items():
        if isinstance(task_results, dict) and 'confidence' in task_results:
            task_results['confidence_level'] = get_confidence_level(task_results['confidence'])
    
    # Add breed information if confidence is sufficient
    if enhanced['breed']['confidence'] >= CONFIDENCE_THRESHOLDS["low_confidence"]:
        breed_name = enhanced['breed']['prediction']
        # You could add breed details from database here
        enhanced['breed']['needs_verification'] = enhanced['breed']['confidence'] < CONFIDENCE_THRESHOLDS["high_confidence"]
    else:
        enhanced['breed']['needs_verification'] = True
        enhanced['breed']['suggestion'] = "Image quality may be poor or animal pose may not be optimal for classification"
    
    return enhanced

# API Endpoints

@app.on_event("startup")
async def startup_event():
    """Initialize the AI model on startup"""
    global model
    try:
        logger.info("Loading AI model...")
        model = MultiTaskBovineClassifier(variant="lightweight")
        model.build_model()
        model.compile_model()
        logger.info("AI model loaded successfully")
        
        # TODO: Load pre-trained weights when available
        # model.load_model("/path/to/trained/model")
        
    except Exception as e:
        logger.error(f"Failed to load AI model: {str(e)}")
        # Model will be None, endpoints will return appropriate errors

@app.get("/", response_model=Dict)
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Bharat Breed Rakshask AI API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "classify": "/classify",
            "classify_batch": "/classify/batch",
            "health": "/health",
            "breeds": "/breeds"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy" if model is not None else "model_not_loaded",
        model_loaded=model is not None,
        supported_breeds={
            "cattle": len(CATTLE_BREEDS),
            "buffalo": len(BUFFALO_BREEDS),
            "total": len(CATTLE_BREEDS) + len(BUFFALO_BREEDS)
        }
    )

@app.get("/breeds", response_model=Dict)
async def get_supported_breeds():
    """Get list of all supported breeds"""
    return {
        "success": True,
        "data": {
            "cattle_breeds": CATTLE_BREEDS,
            "buffalo_breeds": BUFFALO_BREEDS,
            "total_breeds": len(CATTLE_BREEDS) + len(BUFFALO_BREEDS)
        }
    }

@app.post("/classify", response_model=ClassificationResponse)
async def classify_image(file: UploadFile = File(...)):
    """
    Classify a single cattle/buffalo image
    
    Args:
        file: Uploaded image file
        
    Returns:
        Classification results with breed, age, gender, health assessment
    """
    import time
    start_time = time.time()
    
    # Check if model is loaded
    if model is None:
        raise HTTPException(
            status_code=503, 
            detail="AI model not loaded. Please check server status."
        )
    
    try:
        # Validate the uploaded file
        validate_image(file)
        
        # Read and process the image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Preprocess image
        processed_image = preprocess_image(image)
        
        # Make prediction
        logger.info(f"Classifying image: {file.filename}")
        predictions = model.predict_single(processed_image)
        
        # Enhance results
        enhanced_results = enhance_prediction_results(predictions)
        
        processing_time = time.time() - start_time
        
        return ClassificationResponse(
            success=True,
            data=enhanced_results,
            message="Classification completed successfully",
            processing_time=round(processing_time, 3)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@app.post("/classify/batch")
async def classify_batch_images(files: List[UploadFile] = File(...)):
    """
    Classify multiple images in batch
    
    Args:
        files: List of uploaded image files
        
    Returns:
        Batch classification results
    """
    import time
    start_time = time.time()
    
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="AI model not loaded. Please check server status."
        )
    
    if len(files) > 10:  # Limit batch size
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 images allowed per batch request"
        )
    
    results = []
    
    try:
        for i, file in enumerate(files):
            try:
                # Validate and process each image
                validate_image(file)
                image_data = await file.read()
                image = Image.open(io.BytesIO(image_data))
                processed_image = preprocess_image(image)
                
                # Make prediction
                predictions = model.predict_single(processed_image)
                enhanced_results = enhance_prediction_results(predictions)
                
                results.append({
                    "filename": file.filename,
                    "index": i,
                    "success": True,
                    "results": enhanced_results
                })
                
            except Exception as e:
                results.append({
                    "filename": file.filename,
                    "index": i,
                    "success": False,
                    "error": str(e)
                })
        
        processing_time = time.time() - start_time
        
        return {
            "success": True,
            "data": {
                "results": results,
                "total_images": len(files),
                "successful_classifications": len([r for r in results if r["success"]]),
                "failed_classifications": len([r for r in results if not r["success"]])
            },
            "processing_time": round(processing_time, 3)
        }
        
    except Exception as e:
        logger.error(f"Batch classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch classification failed: {str(e)}")

@app.post("/classify/url")
async def classify_image_from_url(image_url: str):
    """
    Classify image from URL
    
    Args:
        image_url: URL of the image to classify
        
    Returns:
        Classification results
    """
    import requests
    import time
    
    start_time = time.time()
    
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="AI model not loaded. Please check server status."
        )
    
    try:
        # Download image from URL
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        
        # Process image
        image = Image.open(io.BytesIO(response.content))
        processed_image = preprocess_image(image)
        
        # Make prediction
        predictions = model.predict_single(processed_image)
        enhanced_results = enhance_prediction_results(predictions)
        
        processing_time = time.time() - start_time
        
        return ClassificationResponse(
            success=True,
            data=enhanced_results,
            message="URL image classification completed successfully",
            processing_time=round(processing_time, 3)
        )
        
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image: {str(e)}")
    except Exception as e:
        logger.error(f"URL classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"URL classification failed: {str(e)}")

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "status_code": 500
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=API_CONFIG["host"],
        port=API_CONFIG["port"],
        reload=API_CONFIG["reload"]
    )