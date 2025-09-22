// Test AI service functionality within Next.js environment

import { aiClassificationService, ClassificationResult } from './services/ai-classification';

export async function testAIService(): Promise<{
  success: boolean;
  result?: ClassificationResult;
  error?: string;
}> {
  try {
    console.log('🧪 Testing AI Classification Service...');
    
    // Test with mock image data
    const mockImageData = 'data:image/jpeg;base64,mock-test-data';
    
    const result = await aiClassificationService.classifyImage(mockImageData);
    
    console.log('✅ Classification successful:', result);
    
    // Validate result structure
    if (!result.animal_type || !result.breed) {
      throw new Error('Invalid classification result structure');
    }
    
    return {
      success: true,
      result
    };
    
  } catch (error) {
    console.error('❌ AI Service test failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Test the service in browser environment
export async function testBrowserCompatibility(): Promise<boolean> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('Running in server environment');
      return false;
    }
    
    console.log('✅ Browser environment detected');
    
    // Test basic service instantiation
    const service = aiClassificationService;
    
    if (!service) {
      throw new Error('AI service not available');
    }
    
    console.log('✅ AI service instantiated successfully');
    
    return true;
    
  } catch (error) {
    console.error('❌ Browser compatibility test failed:', error);
    return false;
  }
}

export default {
  testAIService,
  testBrowserCompatibility
};