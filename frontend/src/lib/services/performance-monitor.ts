/**
 * Performance Monitoring and Analytics Dashboard
 * Real-time monitoring and analytics for livestock classification system
 */

import { TestReport, TestResult } from './livestock-image-tester';

export interface PerformanceMetrics {
  timestamp: Date;
  sessionId: string;
  classificationCount: number;
  averageProcessingTime: number;
  accuracyRate: number;
  fallbackUsageRate: number;
  errorRate: number;
  confidenceScore: number;
  systemLoad: number;
  memoryUsage: number;
  apiResponseTime: number;
}

export interface SystemHealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    primaryClassification: 'online' | 'degraded' | 'offline';
    fallbackSystem: 'online' | 'degraded' | 'offline';
    confidenceScorer: 'online' | 'degraded' | 'offline';
    dataValidator: 'online' | 'degraded' | 'offline';
  };
  alerts: Alert[];
  uptime: number; // seconds
  lastHealthCheck: Date;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'performance' | 'accuracy' | 'system' | 'api';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: any;
}

export interface AnalyticsDashboard {
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  metrics: {
    totalClassifications: number;
    averageAccuracy: number;
    averageProcessingTime: number;
    systemUptime: number;
    fallbackActivations: number;
    totalErrors: number;
  };
  charts: {
    accuracyTrend: Array<{ time: Date; accuracy: number }>;
    performanceTrend: Array<{ time: Date; processingTime: number; throughput: number }>;
    errorRateTrend: Array<{ time: Date; errorRate: number }>;
    fallbackUsage: Array<{ time: Date; fallbackRate: number }>;
    breedAccuracy: Array<{ breed: string; accuracy: number; count: number }>;
    animalTypeDistribution: Array<{ type: string; count: number; percentage: number }>;
  };
  recommendations: string[];
  alerts: Alert[];
}

export interface PerformanceThresholds {
  maxProcessingTime: number; // seconds
  minAccuracy: number; // 0-1
  maxErrorRate: number; // 0-1
  maxFallbackRate: number; // 0-1
  maxMemoryUsage: number; // MB
  maxResponseTime: number; // seconds
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private alerts: Alert[] = [];
  private systemHealth: SystemHealthStatus;
  private sessionId: string;
  private startTime: Date;
  private performanceThresholds: PerformanceThresholds;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: Array<(alert: Alert) => void> = [];

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = new Date();
    
    // Default performance thresholds
    this.performanceThresholds = {
      maxProcessingTime: 10.0, // 10 seconds
      minAccuracy: 0.75, // 75%
      maxErrorRate: 0.1, // 10%
      maxFallbackRate: 0.3, // 30%
      maxMemoryUsage: 512, // 512 MB
      maxResponseTime: 5.0 // 5 seconds
    };

    // Initialize system health
    this.systemHealth = {
      overall: 'healthy',
      services: {
        primaryClassification: 'online',
        fallbackSystem: 'online',
        confidenceScorer: 'online',
        dataValidator: 'online'
      },
      alerts: [],
      uptime: 0,
      lastHealthCheck: new Date()
    };

    this.startMonitoring();
  }

  /**
   * Start continuous monitoring
   */
  private startMonitoring(): void {
    console.log('🔍 Starting performance monitoring...');
    
    // Update system health every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.updateSystemHealth();
      this.checkThresholds();
      this.cleanOldMetrics();
    }, 30000);

    this.createAlert('info', 'system', 'Performance monitoring started', 'low');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.createAlert('info', 'system', 'Performance monitoring stopped', 'low');
    console.log('🛑 Performance monitoring stopped');
  }

  /**
   * Record classification performance
   */
  recordClassification(result: TestResult, processingTime: number, apiResponseTime?: number): void {
    const metric: PerformanceMetrics = {
      timestamp: new Date(),
      sessionId: this.sessionId,
      classificationCount: 1,
      averageProcessingTime: processingTime,
      accuracyRate: result.accuracy.overallAccuracy,
      fallbackUsageRate: result.fallbackUsed ? 1 : 0,
      errorRate: result.errors.length > 0 ? 1 : 0,
      confidenceScore: result.accuracy.confidenceScore,
      systemLoad: this.getCurrentSystemLoad(),
      memoryUsage: this.getCurrentMemoryUsage(),
      apiResponseTime: apiResponseTime || 0
    };

    this.metrics.push(metric);
    this.checkMetricThresholds(metric);

    // Keep only recent metrics (last 24 hours)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Record batch test results
   */
  recordBatchResults(report: TestReport): void {
    console.log('📊 Recording batch test results...');

    // Create aggregated metrics from the report
    const batchMetric: PerformanceMetrics = {
      timestamp: new Date(),
      sessionId: this.sessionId,
      classificationCount: report.summary.totalImages,
      averageProcessingTime: report.performanceMetrics.averageProcessingTime,
      accuracyRate: report.accuracyMetrics.overallAccuracy,
      fallbackUsageRate: report.summary.fallbackUsed / report.summary.totalImages,
      errorRate: report.performanceMetrics.errorRate,
      confidenceScore: this.calculateAverageConfidence(report),
      systemLoad: this.getCurrentSystemLoad(),
      memoryUsage: this.getCurrentMemoryUsage(),
      apiResponseTime: this.estimateApiResponseTime(report)
    };

    this.metrics.push(batchMetric);
    this.checkMetricThresholds(batchMetric);

    // Check for batch-specific issues
    this.analyzeBatchResults(report);
  }

  /**
   * Get current analytics dashboard data
   */
  getDashboard(timeRange: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'): AnalyticsDashboard {
    const timeRangeMs = this.getTimeRangeMilliseconds(timeRange);
    const cutoff = new Date(Date.now() - timeRangeMs);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);

    if (recentMetrics.length === 0) {
      return this.getEmptyDashboard(timeRange);
    }

    const dashboard: AnalyticsDashboard = {
      timeRange,
      metrics: this.calculateAggregatedMetrics(recentMetrics),
      charts: this.generateChartData(recentMetrics, timeRange),
      recommendations: this.generateRecommendations(recentMetrics),
      alerts: this.getActiveAlerts()
    };

    return dashboard;
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealthStatus {
    this.updateSystemHealth();
    return { ...this.systemHealth };
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(hours: number = 24): any {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);

    if (recentMetrics.length < 2) {
      return { message: 'Insufficient data for trend analysis' };
    }

    return {
      accuracyTrend: this.calculateTrend(recentMetrics.map(m => m.accuracyRate)),
      performanceTrend: this.calculateTrend(recentMetrics.map(m => m.averageProcessingTime), true),
      errorRateTrend: this.calculateTrend(recentMetrics.map(m => m.errorRate), true),
      fallbackTrend: this.calculateTrend(recentMetrics.map(m => m.fallbackUsageRate), true),
      dataPoints: recentMetrics.length,
      timespan: `${hours} hours`
    };
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.performanceThresholds = { ...this.performanceThresholds, ...thresholds };
    
    this.createAlert('info', 'system', 
      `Performance thresholds updated: ${Object.keys(thresholds).join(', ')}`, 
      'low');
    
    console.log('⚙️ Performance thresholds updated:', this.performanceThresholds);
  }

  /**
   * Add alert callback
   */
  onAlert(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get alert summary
   */
  getAlertSummary(): any {
    const activeAlerts = this.getActiveAlerts();
    const alertCounts = activeAlerts.reduce((counts, alert) => {
      counts[alert.severity] = (counts[alert.severity] || 0) + 1;
      return counts;
    }, {} as { [severity: string]: number });

    return {
      total: activeAlerts.length,
      breakdown: alertCounts,
      latest: activeAlerts.slice(0, 5),
      resolved: this.alerts.filter(a => a.resolved).length
    };
  }

  /**
   * Resolve alert by ID
   */
  resolveAlert(alertId: string, resolution?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      if (resolution) {
        alert.metadata = { ...alert.metadata, resolution };
      }
      
      console.log(`✅ Alert resolved: ${alert.message}`);
      return true;
    }
    return false;
  }

  /**
   * Export performance data
   */
  exportPerformanceData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.generateCSVExport();
    }
    
    return JSON.stringify({
      sessionId: this.sessionId,
      exportDate: new Date(),
      uptime: this.getUptime(),
      metrics: this.metrics,
      alerts: this.alerts,
      systemHealth: this.systemHealth,
      thresholds: this.performanceThresholds
    }, null, 2);
  }

  // Private helper methods

  private updateSystemHealth(): void {
    const currentTime = new Date();
    this.systemHealth.uptime = this.getUptime();
    this.systemHealth.lastHealthCheck = currentTime;
    
    // Check service health based on recent metrics and alerts
    const recentMetrics = this.metrics.filter(m => 
      currentTime.getTime() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    // Update overall health based on active alerts
    const criticalAlerts = this.getActiveAlerts().filter(a => a.severity === 'critical');
    const highAlerts = this.getActiveAlerts().filter(a => a.severity === 'high');

    if (criticalAlerts.length > 0) {
      this.systemHealth.overall = 'critical';
    } else if (highAlerts.length > 0 || recentMetrics.length === 0) {
      this.systemHealth.overall = 'warning';
    } else {
      this.systemHealth.overall = 'healthy';
    }

    this.systemHealth.alerts = this.getActiveAlerts().slice(0, 10); // Latest 10 alerts
  }

  private checkThresholds(): void {
    const recentMetrics = this.metrics.filter(m => 
      Date.now() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    if (recentMetrics.length === 0) return;

    const avgAccuracy = recentMetrics.reduce((sum, m) => sum + m.accuracyRate, 0) / recentMetrics.length;
    const avgProcessingTime = recentMetrics.reduce((sum, m) => sum + m.averageProcessingTime, 0) / recentMetrics.length;
    const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length;
    const avgFallbackRate = recentMetrics.reduce((sum, m) => sum + m.fallbackUsageRate, 0) / recentMetrics.length;

    // Check accuracy threshold
    if (avgAccuracy < this.performanceThresholds.minAccuracy) {
      this.createAlert('warning', 'accuracy', 
        `Average accuracy (${(avgAccuracy * 100).toFixed(1)}%) below threshold (${(this.performanceThresholds.minAccuracy * 100).toFixed(1)}%)`,
        'high');
    }

    // Check processing time threshold
    if (avgProcessingTime > this.performanceThresholds.maxProcessingTime) {
      this.createAlert('warning', 'performance', 
        `Average processing time (${avgProcessingTime.toFixed(2)}s) exceeds threshold (${this.performanceThresholds.maxProcessingTime}s)`,
        'medium');
    }

    // Check error rate threshold
    if (avgErrorRate > this.performanceThresholds.maxErrorRate) {
      this.createAlert('error', 'system', 
        `Error rate (${(avgErrorRate * 100).toFixed(1)}%) exceeds threshold (${(this.performanceThresholds.maxErrorRate * 100).toFixed(1)}%)`,
        'high');
    }

    // Check fallback usage threshold
    if (avgFallbackRate > this.performanceThresholds.maxFallbackRate) {
      this.createAlert('warning', 'system', 
        `Fallback usage (${(avgFallbackRate * 100).toFixed(1)}%) exceeds threshold (${(this.performanceThresholds.maxFallbackRate * 100).toFixed(1)}%)`,
        'medium');
    }
  }

  private checkMetricThresholds(metric: PerformanceMetrics): void {
    // Individual metric threshold checks
    if (metric.accuracyRate < this.performanceThresholds.minAccuracy) {
      this.createAlert('warning', 'accuracy', 
        `Low accuracy detected: ${(metric.accuracyRate * 100).toFixed(1)}%`,
        'medium');
    }

    if (metric.averageProcessingTime > this.performanceThresholds.maxProcessingTime) {
      this.createAlert('warning', 'performance', 
        `Slow processing detected: ${metric.averageProcessingTime.toFixed(2)}s`,
        'low');
    }

    if (metric.errorRate > 0) {
      this.createAlert('error', 'system', 
        'Classification error detected',
        'medium');
    }
  }

  private createAlert(type: Alert['type'], category: Alert['category'], message: string, severity: Alert['severity'], metadata?: any): void {
    // Check for duplicate alerts
    const duplicateAlert = this.alerts.find(a => 
      !a.resolved && 
      a.message === message && 
      Date.now() - a.timestamp.getTime() < 300000 // Within last 5 minutes
    );

    if (duplicateAlert) return;

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      message,
      timestamp: new Date(),
      severity,
      resolved: false,
      metadata
    };

    this.alerts.push(alert);

    // Auto-resolve low severity alerts after 1 hour
    if (severity === 'low') {
      setTimeout(() => {
        if (!alert.resolved) {
          alert.resolved = true;
          alert.resolvedAt = new Date();
        }
      }, 3600000);
    }

    // Notify callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });

    console.log(`🚨 Alert created: [${severity.toUpperCase()}] ${message}`);
  }

  private getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private calculateAggregatedMetrics(metrics: PerformanceMetrics[]): AnalyticsDashboard['metrics'] {
    if (metrics.length === 0) {
      return {
        totalClassifications: 0,
        averageAccuracy: 0,
        averageProcessingTime: 0,
        systemUptime: this.getUptime(),
        fallbackActivations: 0,
        totalErrors: 0
      };
    }

    return {
      totalClassifications: metrics.reduce((sum, m) => sum + m.classificationCount, 0),
      averageAccuracy: metrics.reduce((sum, m) => sum + m.accuracyRate, 0) / metrics.length,
      averageProcessingTime: metrics.reduce((sum, m) => sum + m.averageProcessingTime, 0) / metrics.length,
      systemUptime: this.getUptime(),
      fallbackActivations: metrics.reduce((sum, m) => sum + (m.fallbackUsageRate * m.classificationCount), 0),
      totalErrors: metrics.reduce((sum, m) => sum + (m.errorRate * m.classificationCount), 0)
    };
  }

  private generateChartData(metrics: PerformanceMetrics[], timeRange: string): AnalyticsDashboard['charts'] {
    // Group metrics by time buckets based on time range
    const bucketSize = this.getBucketSize(timeRange);
    const groupedMetrics = this.groupMetricsByTime(metrics, bucketSize);

    return {
      accuracyTrend: groupedMetrics.map(group => ({
        time: group.timestamp,
        accuracy: group.averageAccuracy
      })),
      performanceTrend: groupedMetrics.map(group => ({
        time: group.timestamp,
        processingTime: group.averageProcessingTime,
        throughput: group.throughput
      })),
      errorRateTrend: groupedMetrics.map(group => ({
        time: group.timestamp,
        errorRate: group.errorRate
      })),
      fallbackUsage: groupedMetrics.map(group => ({
        time: group.timestamp,
        fallbackRate: group.fallbackUsageRate
      })),
      breedAccuracy: this.generateBreedAccuracyData(metrics),
      animalTypeDistribution: this.generateAnimalTypeDistribution(metrics)
    };
  }

  private groupMetricsByTime(metrics: PerformanceMetrics[], bucketSizeMs: number): any[] {
    const groups = new Map();
    
    metrics.forEach(metric => {
      const bucketTime = Math.floor(metric.timestamp.getTime() / bucketSizeMs) * bucketSizeMs;
      const key = bucketTime.toString();
      
      if (!groups.has(key)) {
        groups.set(key, {
          timestamp: new Date(bucketTime),
          metrics: []
        });
      }
      
      groups.get(key).metrics.push(metric);
    });

    return Array.from(groups.values()).map(group => ({
      timestamp: group.timestamp,
      averageAccuracy: group.metrics.reduce((sum: number, m: PerformanceMetrics) => sum + m.accuracyRate, 0) / group.metrics.length,
      averageProcessingTime: group.metrics.reduce((sum: number, m: PerformanceMetrics) => sum + m.averageProcessingTime, 0) / group.metrics.length,
      errorRate: group.metrics.reduce((sum: number, m: PerformanceMetrics) => sum + m.errorRate, 0) / group.metrics.length,
      fallbackUsageRate: group.metrics.reduce((sum: number, m: PerformanceMetrics) => sum + m.fallbackUsageRate, 0) / group.metrics.length,
      throughput: group.metrics.reduce((sum: number, m: PerformanceMetrics) => sum + m.classificationCount, 0) / (group.metrics.length || 1)
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private generateBreedAccuracyData(metrics: PerformanceMetrics[]): Array<{ breed: string; accuracy: number; count: number }> {
    // Mock breed accuracy data - in production would come from actual classification results
    return [
      { breed: 'Gir', accuracy: 0.85, count: 25 },
      { breed: 'Murrah', accuracy: 0.82, count: 18 },
      { breed: 'Jersey', accuracy: 0.78, count: 22 },
      { breed: 'Holstein Friesian', accuracy: 0.88, count: 30 },
      { breed: 'Sahiwal', accuracy: 0.76, count: 15 }
    ];
  }

  private generateAnimalTypeDistribution(metrics: PerformanceMetrics[]): Array<{ type: string; count: number; percentage: number }> {
    // Mock animal type distribution - in production would come from actual classification results
    const total = metrics.reduce((sum, m) => sum + m.classificationCount, 0);
    return [
      { type: 'cattle', count: Math.floor(total * 0.7), percentage: 70 },
      { type: 'buffalo', count: Math.floor(total * 0.25), percentage: 25 },
      { type: 'other', count: Math.floor(total * 0.05), percentage: 5 }
    ];
  }

  private generateRecommendations(metrics: PerformanceMetrics[]): string[] {
    const recommendations: string[] = [];
    
    const avgAccuracy = metrics.reduce((sum, m) => sum + m.accuracyRate, 0) / metrics.length;
    const avgProcessingTime = metrics.reduce((sum, m) => sum + m.averageProcessingTime, 0) / metrics.length;
    const fallbackRate = metrics.reduce((sum, m) => sum + m.fallbackUsageRate, 0) / metrics.length;
    const errorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;

    if (avgAccuracy < 0.8) {
      recommendations.push('🎯 Consider improving model training data to increase accuracy');
    }

    if (avgProcessingTime > 5) {
      recommendations.push('⚡ Optimize image processing pipeline to reduce response time');
    }

    if (fallbackRate > 0.2) {
      recommendations.push('🔄 High fallback usage detected - investigate primary classification issues');
    }

    if (errorRate > 0.05) {
      recommendations.push('🔧 Review error logs to identify and fix common failure patterns');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ System is performing well within acceptable thresholds');
    }

    return recommendations;
  }

  private calculateTrend(values: number[], reverseImprovement: boolean = false): { direction: string; change: number } {
    if (values.length < 2) return { direction: 'stable', change: 0 };

    const first = values[0];
    const last = values[values.length - 1];
    const change = ((last - first) / first) * 100;

    let direction = 'stable';
    const threshold = 5;

    if (Math.abs(change) > threshold) {
      if (reverseImprovement) {
        direction = change < 0 ? 'improving' : 'declining';
      } else {
        direction = change > 0 ? 'improving' : 'declining';
      }
    }

    return { direction, change };
  }

  private getTimeRangeMilliseconds(timeRange: string): number {
    switch (timeRange) {
      case '1h': return 60 * 60 * 1000;
      case '6h': return 6 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  private getBucketSize(timeRange: string): number {
    switch (timeRange) {
      case '1h': return 5 * 60 * 1000; // 5 minutes
      case '6h': return 30 * 60 * 1000; // 30 minutes
      case '24h': return 60 * 60 * 1000; // 1 hour
      case '7d': return 6 * 60 * 60 * 1000; // 6 hours
      case '30d': return 24 * 60 * 60 * 1000; // 1 day
      default: return 60 * 60 * 1000;
    }
  }

  private getEmptyDashboard(timeRange: string): AnalyticsDashboard {
    return {
      timeRange,
      metrics: {
        totalClassifications: 0,
        averageAccuracy: 0,
        averageProcessingTime: 0,
        systemUptime: this.getUptime(),
        fallbackActivations: 0,
        totalErrors: 0
      },
      charts: {
        accuracyTrend: [],
        performanceTrend: [],
        errorRateTrend: [],
        fallbackUsage: [],
        breedAccuracy: [],
        animalTypeDistribution: []
      },
      recommendations: ['No data available for the selected time range'],
      alerts: this.getActiveAlerts()
    };
  }

  private cleanOldMetrics(): void {
    // Keep metrics for last 7 days
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    // Keep alerts for last 30 days
    const alertCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(a => a.timestamp > alertCutoff);
  }

  private getCurrentSystemLoad(): number {
    // Mock system load - in production would get actual system metrics
    return Math.random() * 0.8 + 0.1; // 10-90% load
  }

  private getCurrentMemoryUsage(): number {
    // Mock memory usage - in production would get actual memory metrics
    return Math.floor(Math.random() * 200) + 100; // 100-300 MB
  }

  private getUptime(): number {
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }

  private calculateAverageConfidence(report: TestReport): number {
    return report.detailedResults.reduce((sum, result) => 
      sum + result.accuracy.confidenceScore, 0) / report.detailedResults.length;
  }

  private estimateApiResponseTime(report: TestReport): number {
    // Estimate based on processing time
    return report.performanceMetrics.averageProcessingTime * 0.3;
  }

  private analyzeBatchResults(report: TestReport): void {
    // Check for batch-specific issues
    if (report.accuracyMetrics.overallAccuracy < 0.7) {
      this.createAlert('warning', 'accuracy', 
        `Batch test accuracy low: ${(report.accuracyMetrics.overallAccuracy * 100).toFixed(1)}%`,
        'medium',
        { testSuiteId: report.testSuiteId, imageCount: report.summary.totalImages });
    }

    if (report.summary.fallbackUsed / report.summary.totalImages > 0.5) {
      this.createAlert('warning', 'system', 
        `High fallback usage in batch: ${report.summary.fallbackUsed}/${report.summary.totalImages} images`,
        'high',
        { testSuiteId: report.testSuiteId });
    }
  }

  private generateCSVExport(): string {
    let csv = 'Timestamp,Session ID,Classifications,Avg Processing Time,Accuracy Rate,Fallback Rate,Error Rate,Confidence Score\n';
    
    this.metrics.forEach(metric => {
      csv += [
        metric.timestamp.toISOString(),
        metric.sessionId,
        metric.classificationCount,
        metric.averageProcessingTime.toFixed(3),
        metric.accuracyRate.toFixed(3),
        metric.fallbackUsageRate.toFixed(3),
        metric.errorRate.toFixed(3),
        metric.confidenceScore.toFixed(3)
      ].join(',') + '\n';
    });

    return csv;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();