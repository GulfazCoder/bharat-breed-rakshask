'use client';

import React, { useState, useEffect } from 'react';
import { aiClassificationService } from '@/lib/services/ai-classification';

interface ClassificationStatsProps {
  refreshTrigger?: number;
}

export const ClassificationStats: React.FC<ClassificationStatsProps> = ({
  refreshTrigger = 0
}) => {
  const [stats, setStats] = useState({
    totalFeedback: 0,
    buffaloAsCattle: 0,
    cattleAsBuffalo: 0,
    accuracyRate: 0,
    commonMisclassifications: []
  });

  useEffect(() => {
    const updateStats = () => {
      const newStats = aiClassificationService.getMisclassificationStats();
      setStats(newStats);
    };

    updateStats();
  }, [refreshTrigger]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'green' | 'red' | 'blue' | 'yellow';
    icon?: string;
  }> = ({ title, value, subtitle, color = 'blue', icon }) => {
    const colorClasses = {
      green: 'bg-green-50 border-green-200 text-green-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };

    return (
      <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs">{subtitle}</p>}
          </div>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
      </div>
    );
  };

  if (stats.totalFeedback === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Classification Data Yet</h3>
        <p className="text-sm text-gray-500">
          Start by uploading images and providing feedback to see classification statistics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          📈 Classification Performance Analytics
        </h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Feedback"
          value={stats.totalFeedback}
          subtitle="Classifications reviewed"
          color="blue"
          icon="📊"
        />
        
        <StatCard
          title="Accuracy Rate"
          value={`${stats.accuracyRate.toFixed(1)}%`}
          subtitle="Overall classification accuracy"
          color={stats.accuracyRate >= 80 ? 'green' : stats.accuracyRate >= 60 ? 'yellow' : 'red'}
          icon="🎯"
        />
        
        <StatCard
          title="Buffalo → Cattle"
          value={stats.buffaloAsCattle}
          subtitle="Buffalo misclassified as cattle"
          color="red"
          icon="🐃➡️🐄"
        />
        
        <StatCard
          title="Cattle → Buffalo"
          value={stats.cattleAsBuffalo}
          subtitle="Cattle misclassified as buffalo"
          color="yellow"
          icon="🐄➡️🐃"
        />
      </div>

      {/* Misclassification Analysis */}
      {stats.commonMisclassifications.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            🔍 Common Misclassification Patterns
          </h3>
          
          <div className="space-y-3">
            {stats.commonMisclassifications.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-gray-600">{pattern.pattern}</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {pattern.count} cases
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights and Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          💡 AI Performance Insights
        </h3>
        
        <div className="space-y-3 text-sm text-blue-700">
          {stats.buffaloAsCattle > stats.cattleAsBuffalo ? (
            <div className="flex items-start">
              <span className="mr-2">⚠️</span>
              <div>
                <strong>Buffalo Detection Issue:</strong> Buffalo are being misclassified as cattle more often than the reverse. 
                This suggests the AI model needs better buffalo feature recognition.
              </div>
            </div>
          ) : stats.cattleAsBuffalo > stats.buffaloAsCattle ? (
            <div className="flex items-start">
              <span className="mr-2">⚠️</span>
              <div>
                <strong>Cattle Detection Issue:</strong> Cattle are being misclassified as buffalo more often. 
                The model may be over-sensitive to buffalo features.
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <span className="mr-2">✅</span>
              <div>
                <strong>Balanced Performance:</strong> The misclassification rate is roughly equal between 
                buffalo and cattle, indicating the model has balanced sensitivity.
              </div>
            </div>
          )}

          {stats.accuracyRate < 70 && (
            <div className="flex items-start">
              <span className="mr-2">🎯</span>
              <div>
                <strong>Accuracy Improvement Needed:</strong> Current accuracy is below 70%. 
                Consider improving image quality, lighting, and angle for better results.
              </div>
            </div>
          )}

          {stats.totalFeedback >= 10 && (
            <div className="flex items-start">
              <span className="mr-2">📈</span>
              <div>
                <strong>Sufficient Data:</strong> You have provided enough feedback for meaningful analysis. 
                These insights can help guide model improvements.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips for Better Classification */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">
          📸 Tips for Better Classification Results
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-yellow-700">
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="mr-2">📱</span>
              <span>Take clear, high-resolution photos</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">☀️</span>
              <span>Ensure good lighting conditions</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">👁️</span>
              <span>Capture the animal's profile view</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="mr-2">🔍</span>
              <span>Show distinctive features (horns, ears, body shape)</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">📏</span>
              <span>Keep the animal centered and well-framed</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">🚫</span>
              <span>Avoid blurry or distant shots</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassificationStats;