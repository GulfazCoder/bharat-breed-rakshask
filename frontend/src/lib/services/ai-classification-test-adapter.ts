import { aiClassificationService } from './ai-classification';

/**
 * AI Classification Test Adapter
 * 
 * This adapter exposes internal methods from the AI Classification service for testing purposes
 */
class AIClassificationTestAdapter {
  /**
   * Process Vision API response directly for testing
   */
  async processVisionResponse(visionResponse: any) {
    // Access the private method via a publicly exposed wrapper
    return (aiClassificationService as any).processVisionResults(visionResponse, Date.now());
  }

  /**
   * Get the AI classification service instance
   */
  getService() {
    return aiClassificationService;
  }
}

export const aiClassification = new AIClassificationTestAdapter();