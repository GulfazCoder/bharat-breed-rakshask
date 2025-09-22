#!/usr/bin/env python3
"""
Quality Control Script for Training Data
Validates and organizes training data for AI model training
Simplified version without external dependencies
"""

import json
import os
import sys
from datetime import datetime
import base64

def validate_training_data():
    """Validate and clean training data"""
    print("🔍 Starting training data validation...")
    
    training_dir = 'data/training'
    validated_dir = 'data/validated'
    rejected_dir = 'data/rejected'
    
    # Create directories if they don't exist
    for directory in [validated_dir, rejected_dir]:
        os.makedirs(directory, exist_ok=True)
    
    if not os.path.exists(training_dir):
        print(f"❌ Training directory not found: {training_dir}")
        return
    
    files = [f for f in os.listdir(training_dir) if f.endswith('.json')]
    print(f"📄 Found {len(files)} training files to process")
    
    validated_count = 0
    rejected_count = 0
    
    for filename in files:
        filepath = os.path.join(training_dir, filename)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                record = json.load(f)
            
            # Quality checks
            quality_score, issues = check_data_quality(record)
            
            if quality_score >= 0.7:
                # Move to validated
                move_to_validated(record, filename, validated_dir)
                print(f"✅ {filename} - Quality Score: {quality_score:.2f}")
                validated_count += 1
            else:
                # Move to rejected
                move_to_rejected(record, filename, rejected_dir, issues)
                print(f"❌ {filename} - Quality Score: {quality_score:.2f} - Issues: {', '.join(issues)}")
                rejected_count += 1
                
        except Exception as e:
            print(f"💥 Error processing {filename}: {str(e)}")
            rejected_count += 1
    
    print(f"\n📊 Validation Summary:")
    print(f"   ✅ Validated: {validated_count}")
    print(f"   ❌ Rejected: {rejected_count}")
    
    total_count = validated_count + rejected_count
    if total_count > 0:
        success_rate = (validated_count / total_count) * 100
        print(f"   📈 Success Rate: {success_rate:.1f}%")
    else:
        print(f"   📈 Success Rate: N/A (No files to process)")

def check_data_quality(record):
    """Calculate quality score for training record"""
    score = 0.0
    issues = []
    
    # Image quality (40%)
    if 'imageData' in record and check_image_quality(record['imageData']):
        score += 0.4
    else:
        issues.append('Poor image quality')
    
    # Annotation completeness (40%)
    if (record.get('annotation', {}).get('breed') and 
        record.get('annotation', {}).get('animalType')):
        score += 0.3
        
        # Bonus for additional annotations
        additional_fields = ['age', 'gender', 'health']
        completed_fields = sum(1 for field in additional_fields 
                             if record.get('annotation', {}).get(field, '').lower() != 'unknown')
        score += (completed_fields / len(additional_fields)) * 0.1
    else:
        issues.append('Missing breed or animal type')
    
    # Metadata completeness (20%)
    if (record.get('metadata', {}).get('captureDate') and 
        record.get('metadata', {}).get('deviceInfo')):
        score += 0.2
    else:
        issues.append('Incomplete metadata')
    
    return score, issues

def check_image_quality(image_data):
    """Check if image meets quality standards (simplified version)"""
    try:
        # Handle data URL format
        if image_data.startswith('data:image'):
            # Check if it's a valid image data URL
            if not any(fmt in image_data for fmt in ['jpeg', 'jpg', 'png', 'webp']):
                return False
            image_data = image_data.split(',')[1]
        
        # Decode base64 image to check basic properties
        image_bytes = base64.b64decode(image_data)
        
        # Check file size (not too small, not too large)
        size_kb = len(image_bytes) / 1024
        if size_kb < 10:  # 10KB minimum
            return False
        if size_kb > 5000:  # 5MB maximum
            return False
        
        # Basic validation - check if decoding works
        if len(image_bytes) < 100:
            return False
            
        return True
    except Exception as e:
        print(f"Image quality check failed: {str(e)}")
        return False

def move_to_validated(record, filename, validated_dir):
    """Move validated record to validated directory"""
    # Add validation metadata
    record['validation']['status'] = 'validated'
    record['validation']['validationDate'] = datetime.now().isoformat()
    record['validation']['validatedBy'] = 'quality_control_script'
    
    # Save to validated directory
    validated_path = os.path.join(validated_dir, filename)
    with open(validated_path, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2, ensure_ascii=False)

def move_to_rejected(record, filename, rejected_dir, issues):
    """Move rejected record to rejected directory"""
    # Add rejection metadata
    record['validation']['status'] = 'rejected'
    record['validation']['rejectionDate'] = datetime.now().isoformat()
    record['validation']['rejectionReasons'] = issues
    
    # Save to rejected directory
    rejected_path = os.path.join(rejected_dir, filename)
    with open(rejected_path, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2, ensure_ascii=False)

def get_dataset_statistics():
    """Generate dataset statistics"""
    print("\n📊 Dataset Statistics:")
    
    for directory in ['data/training', 'data/validated', 'data/rejected']:
        if os.path.exists(directory):
            files = [f for f in os.listdir(directory) if f.endswith('.json')]
            print(f"   {directory}: {len(files)} files")
    
    # Breed distribution
    validated_dir = 'data/validated'
    if os.path.exists(validated_dir):
        breed_counts = {}
        animal_type_counts = {}
        
        for filename in os.listdir(validated_dir):
            if filename.endswith('.json'):
                try:
                    with open(os.path.join(validated_dir, filename), 'r') as f:
                        record = json.load(f)
                    
                    breed = record.get('annotation', {}).get('breed', 'unknown')
                    animal_type = record.get('annotation', {}).get('animalType', 'unknown')
                    
                    breed_counts[breed] = breed_counts.get(breed, 0) + 1
                    animal_type_counts[animal_type] = animal_type_counts.get(animal_type, 0) + 1
                except:
                    continue
        
        print(f"\n🐄 Animal Type Distribution:")
        for animal_type, count in animal_type_counts.items():
            print(f"   {animal_type}: {count}")
        
        print(f"\n🧬 Top Breeds:")
        sorted_breeds = sorted(breed_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        for breed, count in sorted_breeds:
            print(f"   {breed}: {count}")

if __name__ == "__main__":
    try:
        validate_training_data()
        get_dataset_statistics()
        print(f"\n✅ Quality control completed successfully!")
    except KeyboardInterrupt:
        print(f"\n⚠️  Process interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Error: {str(e)}")
        sys.exit(1)
