import { NextApiRequest, NextApiResponse } from 'next';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { imageData, annotation, metadata } = req.body;
      
      // Validate required fields
      if (!imageData || !annotation || !annotation.breed || !annotation.animalType) {
        return res.status(400).json({ 
          error: 'Missing required fields: imageData, breed, and animalType are required' 
        });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `training_${timestamp}.json`;
      
      // Prepare training record
      const trainingRecord = {
        id: timestamp,
        imageData: imageData,
        annotation: {
          breed: annotation.breed.trim(),
          animalType: annotation.animalType,
          age: annotation.age || 'unknown',
          gender: annotation.gender || 'unknown',
          health: annotation.health || 'unknown',
          location: annotation.location || 'unknown',
          farmerName: annotation.farmerName || '',
          notes: annotation.notes || ''
        },
        metadata: {
          captureDate: new Date().toISOString(),
          deviceInfo: req.headers['user-agent'] || 'unknown',
          ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          farmerInfo: {
            name: annotation.farmerName,
            contact: annotation.phoneNumber
          },
          submissionSource: 'web_app'
        },
        validation: {
          status: 'pending',
          validatedBy: null,
          validationDate: null,
          confidence: annotation.confidence || 1.0,
          isUserSubmitted: true
        }
      };
      
      // Ensure training directory exists
      const trainingDir = path.join(process.cwd(), 'data', 'training');
      if (!existsSync(trainingDir)) {
        mkdirSync(trainingDir, { recursive: true });
      }
      
      // Save to training data directory
      const trainingDataPath = path.join(trainingDir, filename);
      writeFileSync(trainingDataPath, JSON.stringify(trainingRecord, null, 2));
      
      console.log(`✅ Training data saved: ${filename}`);
      console.log(`   Breed: ${annotation.breed}, Type: ${annotation.animalType}`);
      
      res.status(200).json({ 
        success: true, 
        id: timestamp,
        message: 'Training data submitted successfully'
      });
      
    } catch (error) {
      console.error('Error saving training data:', error);
      res.status(500).json({ 
        error: 'Failed to save training data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
