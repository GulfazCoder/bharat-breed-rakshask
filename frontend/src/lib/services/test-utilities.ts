/**
 * Test Image Utilities and Batch Processing
 * Comprehensive tools for loading, processing, and reporting on livestock image tests
 */

import { livestockImageTester, TestImage, TestResult, TestReport, TestSuite } from './livestock-image-tester';
import { AIClassificationService } from './ai-classification';

export interface BatchProcessingOptions {
  batchSize: number;
  maxConcurrency: number;
  delayBetweenBatches: number; // milliseconds
  retryFailedImages: boolean;
  saveIntermediateResults: boolean;
  generateProgressReports: boolean;
}

export interface ImageProcessingStats {
  totalImages: number;
  processedImages: number;
  failedImages: number;
  averageProcessingTime: number;
  totalProcessingTime: number;
  startTime: Date;
  endTime?: Date;
  throughput: number; // images per minute
}

export interface TestDatasetInfo {
  name: string;
  totalImages: number;
  animalTypeBreakdown: { [animalType: string]: number };
  breedBreakdown: { [breed: string]: number };
  qualityBreakdown: { [quality: string]: number };
  sourceBreakdown: { [source: string]: number };
}

export class TestUtilities {
  private processingStats: ImageProcessingStats | null = null;
  private currentBatch: number = 0;
  private progressCallbacks: Array<(progress: any) => void> = [];

  constructor() {}

  /**
   * Load test images from various sources
   */
  async loadTestImagesFromDirectory(
    directoryPath: string,
    options: {
      includeSubdirectories?: boolean;
      fileExtensions?: string[];
      maxImages?: number;
      shuffleResults?: boolean;
    } = {}
  ): Promise<TestImage[]> {
    const {
      includeSubdirectories = true,
      fileExtensions = ['.jpg', '.jpeg', '.png', '.webp'],
      maxImages = 1000,
      shuffleResults = false
    } = options;

    console.log(`📁 Loading test images from directory: ${directoryPath}`);

    // Mock implementation - in production would scan actual directory
    const mockImages = await this.generateMockTestDataset(
      Math.min(maxImages, 50), // Limit for demo
      directoryPath
    );

    if (shuffleResults) {
      return mockImages.sort(() => Math.random() - 0.5);
    }

    return mockImages;
  }

  /**
   * Load test images from CSV file
   */
  async loadTestImagesFromCSV(csvPath: string): Promise<TestImage[]> {
    console.log(`📊 Loading test images from CSV: ${csvPath}`);
    
    // Mock CSV parsing - in production would read actual CSV
    const csvData = `
id,filepath,filename,animalType,breed,age,gender,health,confidence,source,imageQuality,lighting,angle
test_gir_001,/images/gir_001.jpg,gir_001.jpg,cattle,Gir,adult,female,healthy,0.95,expert,high,good,frontal
test_murrah_001,/images/murrah_001.jpg,murrah_001.jpg,buffalo,Murrah,adult,male,healthy,0.90,expert,medium,fair,side
test_jersey_001,/images/jersey_001.jpg,jersey_001.jpg,cattle,Jersey,young adult,female,good,0.85,database,high,good,multiple
test_mixed_001,/images/mixed_001.jpg,mixed_001.jpg,cattle,Mixed Breed,adult,unknown,unknown,0.70,crowdsource,low,poor,rear
`;

    const lines = csvData.trim().split('\n').slice(1); // Skip header
    const testImages: TestImage[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      
      const [id, filepath, filename, animalType, breed, age, gender, health, confidence, source, imageQuality, lighting, angle] = line.split(',');
      
      testImages.push({
        id: id.trim(),
        filepath: filepath.trim(),
        filename: filename.trim(),
        groundTruth: {
          animalType: animalType.trim(),
          breed: breed.trim(),
          age: age.trim() || undefined,
          gender: gender.trim() || undefined,
          health: health.trim() || undefined,
          confidence: parseFloat(confidence),
          source: source.trim() as 'expert' | 'database' | 'crowdsource'
        },
        metadata: {
          imageQuality: imageQuality.trim() as 'high' | 'medium' | 'low',
          lighting: lighting.trim() as 'good' | 'fair' | 'poor',
          angle: angle.trim() as 'frontal' | 'side' | 'rear' | 'multiple',
          background: 'unknown' as 'clean' | 'cluttered' | 'natural',
          animalVisibility: 'full' as 'full' | 'partial' | 'obscured',
          resolution: { width: 1920, height: 1080 },
          fileSize: 2048000
        }
      });
    }

    return testImages;
  }

  /**
   * Generate comprehensive test datasets
   */
  async generateMockTestDataset(count: number, basePath: string = '/test-images'): Promise<TestImage[]> {
    const images: TestImage[] = [];
    
    const animalTypes = ['cattle', 'buffalo'];
    const breeds = {
      cattle: ['Gir', 'Sahiwal', 'Holstein Friesian', 'Jersey', 'Red Sindhi', 'Tharparkar', 'Mixed Breed Cattle'],
      buffalo: ['Murrah', 'Nili Ravi', 'Surti', 'Jaffarabadi', 'Mehsana', 'Mixed Breed Buffalo']
    };
    const ages = ['calf', 'young adult', 'adult', 'mature'];
    const genders = ['male', 'female'];
    const healthStates = ['healthy', 'good', 'fair', 'poor'];
    const sources: Array<'expert' | 'database' | 'crowdsource'> = ['expert', 'database', 'crowdsource'];
    const qualities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
    const lightingConditions: Array<'good' | 'fair' | 'poor'> = ['good', 'fair', 'poor'];
    const angles: Array<'frontal' | 'side' | 'rear' | 'multiple'> = ['frontal', 'side', 'rear', 'multiple'];

    for (let i = 0; i < count; i++) {
      const animalType = animalTypes[Math.floor(Math.random() * animalTypes.length)];
      const breedList = breeds[animalType as keyof typeof breeds];
      const breed = breedList[Math.floor(Math.random() * breedList.length)];
      const age = ages[Math.floor(Math.random() * ages.length)];
      const gender = Math.random() > 0.5 ? genders[Math.floor(Math.random() * genders.length)] : undefined;
      const health = Math.random() > 0.3 ? healthStates[Math.floor(Math.random() * healthStates.length)] : undefined;
      const source = sources[Math.floor(Math.random() * sources.length)];
      const quality = qualities[Math.floor(Math.random() * qualities.length)];
      const lighting = lightingConditions[Math.floor(Math.random() * lightingConditions.length)];
      const angle = angles[Math.floor(Math.random() * angles.length)];

      // Generate confidence based on source and quality
      let baseConfidence = 0.7;
      if (source === 'expert') baseConfidence += 0.2;
      if (quality === 'high') baseConfidence += 0.1;
      if (lighting === 'good') baseConfidence += 0.05;
      
      const confidence = Math.min(baseConfidence + (Math.random() * 0.1 - 0.05), 0.98);

      images.push({
        id: `test_${animalType}_${breed.toLowerCase().replace(/ /g, '_')}_${String(i + 1).padStart(3, '0')}`,
        filepath: `${basePath}/${animalType}/${breed.toLowerCase().replace(/ /g, '_')}_${String(i + 1).padStart(3, '0')}.jpg`,
        filename: `${breed.toLowerCase().replace(/ /g, '_')}_${String(i + 1).padStart(3, '0')}.jpg`,
        groundTruth: {
          animalType,
          breed,
          age,
          gender,
          health,
          confidence,
          source,
          verifiedBy: source === 'expert' ? `Expert_${Math.floor(Math.random() * 10) + 1}` : undefined,
          notes: this.generateRandomNotes(quality, lighting, angle)
        },
        metadata: {
          imageQuality: quality,
          lighting,
          angle,
          background: ['clean', 'cluttered', 'natural'][Math.floor(Math.random() * 3)] as 'clean' | 'cluttered' | 'natural',
          animalVisibility: ['full', 'partial', 'obscured'][Math.floor(Math.random() * 3)] as 'full' | 'partial' | 'obscured',
          resolution: {
            width: [1920, 1280, 800][Math.floor(Math.random() * 3)],
            height: [1080, 720, 600][Math.floor(Math.random() * 3)]
          },
          fileSize: Math.floor(Math.random() * 3000000) + 500000, // 500KB - 3.5MB
          captureDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          location: ['Gujarat, India', 'Punjab, India', 'Haryana, India', 'Uttar Pradesh, India'][Math.floor(Math.random() * 4)]
        }
      });
    }

    return images;
  }

  /**
   * Generate random notes based on image characteristics
   */
  private generateRandomNotes(quality: string, lighting: string, angle: string): string {
    const notes: string[] = [];
    
    if (quality === 'high') notes.push('Excellent image quality');
    if (quality === 'low') notes.push('Image quality needs improvement');
    if (lighting === 'poor') notes.push('Poor lighting conditions');
    if (angle === 'rear') notes.push('Challenging angle for classification');
    if (Math.random() > 0.7) notes.push('Ideal for training data');
    if (Math.random() > 0.8) notes.push('Contains multiple animals');

    return notes.length > 0 ? notes.join(', ') : undefined;
  }

  /**
   * Analyze test dataset for insights
   */
  analyzeTestDataset(images: TestImage[]): TestDatasetInfo {
    const info: TestDatasetInfo = {
      name: `Dataset_${new Date().toISOString().split('T')[0]}`,
      totalImages: images.length,
      animalTypeBreakdown: {},
      breedBreakdown: {},
      qualityBreakdown: {},
      sourceBreakdown: {}
    };

    images.forEach(image => {
      // Animal type breakdown
      const animalType = image.groundTruth.animalType;
      info.animalTypeBreakdown[animalType] = (info.animalTypeBreakdown[animalType] || 0) + 1;

      // Breed breakdown
      const breed = image.groundTruth.breed;
      info.breedBreakdown[breed] = (info.breedBreakdown[breed] || 0) + 1;

      // Quality breakdown
      const quality = image.metadata.imageQuality;
      info.qualityBreakdown[quality] = (info.qualityBreakdown[quality] || 0) + 1;

      // Source breakdown
      const source = image.groundTruth.source;
      info.sourceBreakdown[source] = (info.sourceBreakdown[source] || 0) + 1;
    });

    console.log('📊 Dataset Analysis:', info);
    return info;
  }

  /**
   * Process images in batches with comprehensive monitoring
   */
  async processBatchImages(
    testSuiteId: string,
    options: Partial<BatchProcessingOptions> = {}
  ): Promise<{
    report: TestReport;
    stats: ImageProcessingStats;
  }> {
    const defaultOptions: BatchProcessingOptions = {
      batchSize: 5,
      maxConcurrency: 3,
      delayBetweenBatches: 1000,
      retryFailedImages: true,
      saveIntermediateResults: true,
      generateProgressReports: true
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    console.log('🚀 Starting batch processing with options:', finalOptions);

    // Initialize processing stats
    this.processingStats = {
      totalImages: 0,
      processedImages: 0,
      failedImages: 0,
      averageProcessingTime: 0,
      totalProcessingTime: 0,
      startTime: new Date(),
      throughput: 0
    };

    // Run the test suite
    const report = await livestockImageTester.runTestSuite(testSuiteId);
    
    // Update final stats
    this.processingStats.endTime = new Date();
    this.processingStats.totalImages = report.summary.totalImages;
    this.processingStats.processedImages = report.summary.successfulClassifications;
    this.processingStats.failedImages = report.summary.failedClassifications;
    this.processingStats.averageProcessingTime = report.performanceMetrics.averageProcessingTime;
    this.processingStats.totalProcessingTime = (this.processingStats.endTime.getTime() - this.processingStats.startTime.getTime()) / 1000;
    this.processingStats.throughput = (this.processingStats.processedImages / this.processingStats.totalProcessingTime) * 60; // per minute

    console.log('✅ Batch processing completed:', this.processingStats);

    return {
      report,
      stats: this.processingStats
    };
  }

  /**
   * Generate comprehensive test report with visualizations
   */
  async generateComprehensiveReport(
    reports: TestReport[],
    outputFormat: 'json' | 'html' | 'csv' = 'json'
  ): Promise<string> {
    const comprehensiveData = {
      executionDate: new Date(),
      totalTestRuns: reports.length,
      aggregatedMetrics: this.aggregateReports(reports),
      individualReports: reports,
      trends: this.analyzeTrends(reports),
      recommendations: this.generateAggregatedRecommendations(reports),
      dataVisualization: this.prepareVisualizationData(reports)
    };

    switch (outputFormat) {
      case 'html':
        return this.generateHTMLReport(comprehensiveData);
      case 'csv':
        return this.generateCSVReport(comprehensiveData);
      default:
        return JSON.stringify(comprehensiveData, null, 2);
    }
  }

  /**
   * Aggregate metrics from multiple reports
   */
  private aggregateReports(reports: TestReport[]): any {
    if (reports.length === 0) return null;

    const totals = {
      totalImages: 0,
      successfulClassifications: 0,
      fallbackUsed: 0,
      averageAccuracy: 0,
      averageProcessingTime: 0,
      totalApiCalls: 0,
      errorRate: 0
    };

    const accuracyTotals = {
      animalTypeAccuracy: 0,
      breedAccuracy: 0,
      ageAccuracy: 0,
      genderAccuracy: 0,
      healthAccuracy: 0,
      overallAccuracy: 0
    };

    reports.forEach(report => {
      totals.totalImages += report.summary.totalImages;
      totals.successfulClassifications += report.summary.successfulClassifications;
      totals.fallbackUsed += report.summary.fallbackUsed;
      totals.averageProcessingTime += report.performanceMetrics.averageProcessingTime;
      totals.totalApiCalls += report.performanceMetrics.totalApiCalls;
      totals.errorRate += report.performanceMetrics.errorRate;

      accuracyTotals.animalTypeAccuracy += report.accuracyMetrics.animalTypeAccuracy;
      accuracyTotals.breedAccuracy += report.accuracyMetrics.breedAccuracy;
      accuracyTotals.ageAccuracy += report.accuracyMetrics.ageAccuracy;
      accuracyTotals.genderAccuracy += report.accuracyMetrics.genderAccuracy;
      accuracyTotals.healthAccuracy += report.accuracyMetrics.healthAccuracy;
      accuracyTotals.overallAccuracy += report.accuracyMetrics.overallAccuracy;
    });

    return {
      summary: {
        totalImages: totals.totalImages,
        successfulClassifications: totals.successfulClassifications,
        fallbackUsed: totals.fallbackUsed,
        averageProcessingTime: totals.averageProcessingTime / reports.length,
        totalApiCalls: totals.totalApiCalls,
        errorRate: totals.errorRate / reports.length
      },
      accuracyMetrics: {
        animalTypeAccuracy: accuracyTotals.animalTypeAccuracy / reports.length,
        breedAccuracy: accuracyTotals.breedAccuracy / reports.length,
        ageAccuracy: accuracyTotals.ageAccuracy / reports.length,
        genderAccuracy: accuracyTotals.genderAccuracy / reports.length,
        healthAccuracy: accuracyTotals.healthAccuracy / reports.length,
        overallAccuracy: accuracyTotals.overallAccuracy / reports.length
      }
    };
  }

  /**
   * Analyze trends across multiple test runs
   */
  private analyzeTrends(reports: TestReport[]): any {
    if (reports.length < 2) return { message: 'Need at least 2 reports for trend analysis' };

    const trends = {
      accuracyTrend: this.calculateTrend(reports.map(r => r.accuracyMetrics.overallAccuracy)),
      performanceTrend: this.calculateTrend(reports.map(r => r.performanceMetrics.averageProcessingTime)),
      errorRateTrend: this.calculateTrend(reports.map(r => r.performanceMetrics.errorRate)),
      fallbackUsageTrend: this.calculateTrend(reports.map(r => r.summary.fallbackUsed / r.summary.totalImages))
    };

    return trends;
  }

  /**
   * Calculate trend (improving, declining, stable)
   */
  private calculateTrend(values: number[]): { direction: string; changePercentage: number } {
    if (values.length < 2) return { direction: 'unknown', changePercentage: 0 };

    const first = values[0];
    const last = values[values.length - 1];
    const changePercentage = ((last - first) / first) * 100;

    let direction = 'stable';
    if (changePercentage > 5) direction = 'improving';
    else if (changePercentage < -5) direction = 'declining';

    return { direction, changePercentage };
  }

  /**
   * Generate aggregated recommendations
   */
  private generateAggregatedRecommendations(reports: TestReport[]): string[] {
    const allRecommendations = reports.flatMap(r => r.recommendations);
    const recommendationCounts = new Map<string, number>();

    allRecommendations.forEach(rec => {
      recommendationCounts.set(rec, (recommendationCounts.get(rec) || 0) + 1);
    });

    // Sort by frequency and return top recommendations
    return Array.from(recommendationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([rec, count]) => `${rec} (mentioned in ${count} reports)`);
  }

  /**
   * Prepare data for visualization
   */
  private prepareVisualizationData(reports: TestReport[]): any {
    return {
      accuracyOverTime: reports.map((r, i) => ({
        testRun: i + 1,
        overallAccuracy: r.accuracyMetrics.overallAccuracy,
        animalTypeAccuracy: r.accuracyMetrics.animalTypeAccuracy,
        breedAccuracy: r.accuracyMetrics.breedAccuracy
      })),
      performanceOverTime: reports.map((r, i) => ({
        testRun: i + 1,
        processingTime: r.performanceMetrics.averageProcessingTime,
        errorRate: r.performanceMetrics.errorRate
      })),
      issueBreakdown: this.aggregateIssues(reports)
    };
  }

  /**
   * Aggregate issues across all reports
   */
  private aggregateIssues(reports: TestReport[]): any {
    const allIssues = reports.flatMap(r => r.issuesFound);
    const issueCounts = new Map<string, number>();

    allIssues.forEach(issue => {
      const key = `${issue.category}: ${issue.severity}`;
      issueCounts.set(key, (issueCounts.get(key) || 0) + 1);
    });

    return Array.from(issueCounts.entries()).map(([issue, count]) => ({
      issue,
      count
    }));
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Livestock Classification Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 8px; }
        .metric { display: inline-block; margin: 20px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2196F3; }
        .metric-label { color: #666; }
        .section { margin: 30px 0; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .trend-up { color: green; } .trend-down { color: red; } .trend-stable { color: orange; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐄 Livestock Classification Test Report</h1>
        <p>Generated on ${data.executionDate.toISOString()}</p>
        <p>Total Test Runs: ${data.totalTestRuns}</p>
    </div>
    
    <div class="section">
        <h2>📊 Overall Metrics</h2>
        <div class="metric">
            <div class="metric-value">${(data.aggregatedMetrics.accuracyMetrics.overallAccuracy * 100).toFixed(1)}%</div>
            <div class="metric-label">Overall Accuracy</div>
        </div>
        <div class="metric">
            <div class="metric-value">${data.aggregatedMetrics.summary.totalImages}</div>
            <div class="metric-label">Total Images Tested</div>
        </div>
        <div class="metric">
            <div class="metric-value">${data.aggregatedMetrics.summary.averageProcessingTime.toFixed(2)}s</div>
            <div class="metric-label">Avg Processing Time</div>
        </div>
        <div class="metric">
            <div class="metric-value">${(data.aggregatedMetrics.summary.errorRate * 100).toFixed(1)}%</div>
            <div class="metric-label">Error Rate</div>
        </div>
    </div>

    <div class="section recommendations">
        <h2>💡 Top Recommendations</h2>
        <ul>
            ${data.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>📈 Trends</h2>
        ${Object.entries(data.trends).map(([metric, trend]: [string, any]) => `
            <p><strong>${metric}:</strong> 
            <span class="trend-${trend.direction}">${trend.direction}</span> 
            (${trend.changePercentage.toFixed(1)}% change)</p>
        `).join('')}
    </div>
</body>
</html>`;
  }

  /**
   * Generate CSV report
   */
  private generateCSVReport(data: any): string {
    let csv = 'Test Run,Overall Accuracy,Animal Type Accuracy,Breed Accuracy,Processing Time,Error Rate,Fallback Used\n';
    
    data.individualReports.forEach((report: TestReport, index: number) => {
      csv += [
        index + 1,
        (report.accuracyMetrics.overallAccuracy * 100).toFixed(2),
        (report.accuracyMetrics.animalTypeAccuracy * 100).toFixed(2),
        (report.accuracyMetrics.breedAccuracy * 100).toFixed(2),
        report.performanceMetrics.averageProcessingTime.toFixed(2),
        (report.performanceMetrics.errorRate * 100).toFixed(2),
        report.summary.fallbackUsed
      ].join(',') + '\n';
    });

    return csv;
  }

  /**
   * Export test results in various formats
   */
  async exportTestResults(
    testSuiteId: string,
    format: 'json' | 'csv' | 'html',
    includeImages: boolean = false
  ): Promise<{ filename: string; content: string }> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `livestock_test_${testSuiteId}_${timestamp}.${format}`;
    
    console.log(`📤 Exporting test results to ${format.toUpperCase()}...`);
    
    // Mock export - in production would write actual files
    const content = await livestockImageTester.exportResults(testSuiteId, format);
    
    return {
      filename,
      content: `Exported results for ${testSuiteId} in ${format} format`
    };
  }

  /**
   * Compare multiple test runs
   */
  compareTestRuns(reports: TestReport[]): any {
    if (reports.length < 2) {
      return { error: 'Need at least 2 test runs to compare' };
    }

    const comparisons = [];
    for (let i = 1; i < reports.length; i++) {
      comparisons.push(livestockImageTester.compareTestRuns(reports[i - 1], reports[i]));
    }

    return {
      comparisons,
      trends: this.analyzeTrends(reports),
      summary: `Compared ${reports.length} test runs with ${comparisons.length} pair-wise comparisons`
    };
  }

  /**
   * Add progress callback for batch processing
   */
  onProgress(callback: (progress: any) => void): void {
    this.progressCallbacks.push(callback);
  }

  /**
   * Get current processing statistics
   */
  getProcessingStats(): ImageProcessingStats | null {
    return this.processingStats;
  }

  /**
   * Reset processing statistics
   */
  resetStats(): void {
    this.processingStats = null;
    this.currentBatch = 0;
  }

  /**
   * Generate test summary dashboard data
   */
  generateDashboardData(reports: TestReport[]): any {
    return {
      summary: {
        totalTestRuns: reports.length,
        totalImagesProcessed: reports.reduce((sum, r) => sum + r.summary.totalImages, 0),
        averageAccuracy: reports.reduce((sum, r) => sum + r.accuracyMetrics.overallAccuracy, 0) / reports.length,
        averageProcessingTime: reports.reduce((sum, r) => sum + r.performanceMetrics.averageProcessingTime, 0) / reports.length
      },
      recentTrends: this.analyzeTrends(reports.slice(-5)), // Last 5 runs
      topIssues: this.aggregateIssues(reports).slice(0, 5),
      recommendations: this.generateAggregatedRecommendations(reports).slice(0, 5)
    };
  }
}

// Export singleton instance
export const testUtilities = new TestUtilities();