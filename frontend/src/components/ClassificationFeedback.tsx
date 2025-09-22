'use client';

import React, { useState } from 'react';
import { aiClassificationService } from '@/lib/services/ai-classification';

interface ClassificationFeedbackProps {
  prediction: {
    animalType: string;
    breedName: string;
    confidence: number;
  };
  onFeedbackSubmitted?: () => void;
}

export const ClassificationFeedback: React.FC<ClassificationFeedbackProps> = ({
  prediction,
  onFeedbackSubmitted
}) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [actualAnimal, setActualAnimal] = useState('');
  const [actualBreed, setActualBreed] = useState('');
  const [userComments, setUserComments] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = () => {
    if (isCorrect === false && actualAnimal) {
      // Record the correction
      aiClassificationService.recordUserFeedback(
        prediction.animalType,
        actualAnimal,
        prediction.confidence,
        [], // Features would be extracted from the original classification
        userComments
      );
      
      setSubmitted(true);
      onFeedbackSubmitted?.();
      
      // Show tips if buffalo was misclassified
      if (actualAnimal === 'buffalo' && prediction.animalType === 'cattle') {
        setShowTips(true);
      }
    } else if (isCorrect === true) {
      // Record correct prediction
      aiClassificationService.recordUserFeedback(
        prediction.animalType,
        prediction.animalType,
        prediction.confidence,
        [],
        'User confirmed correct classification'
      );
      setSubmitted(true);
      onFeedbackSubmitted?.();
    }
  };

  const BuffaloDetectionTips = () => {
    const tips = aiClassificationService.getBuffaloDetectionTips();
    
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          🐃 Tips for Better Buffalo Detection
        </h4>
        <ul className="space-y-1 text-sm text-blue-700">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-xs text-blue-600">
          💡 <strong>Pro tip:</strong> Take photos in good lighting showing the animal's profile 
          and distinctive features like horns and body structure.
        </div>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-700 font-medium">
            Thank you for your feedback! This helps improve our AI model.
          </span>
        </div>
        {showTips && <BuffaloDetectionTips />}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📊 Help Improve AI Accuracy
      </h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Is this classification correct?
          </p>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="correctness"
                checked={isCorrect === true}
                onChange={() => setIsCorrect(true)}
                className="mr-2 text-green-600"
              />
              <span className="text-sm">✅ Yes, correct</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="correctness"
                checked={isCorrect === false}
                onChange={() => setIsCorrect(false)}
                className="mr-2 text-red-600"
              />
              <span className="text-sm">❌ No, incorrect</span>
            </label>
          </div>
        </div>

        {isCorrect === false && (
          <div className="space-y-3 pl-4 border-l-4 border-yellow-400 bg-yellow-50 p-3 rounded">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What is the correct animal type?
              </label>
              <select
                value={actualAnimal}
                onChange={(e) => setActualAnimal(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select correct animal</option>
                <option value="cattle">Cattle/Cow</option>
                <option value="buffalo">Buffalo</option>
                <option value="goat">Goat</option>
                <option value="sheep">Sheep</option>
              </select>
            </div>
            
            {actualAnimal && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What is the correct breed? (optional)
                </label>
                <input
                  type="text"
                  value={actualBreed}
                  onChange={(e) => setActualBreed(e.target.value)}
                  placeholder="e.g., Murrah, Gir, Holstein"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional comments (optional)
              </label>
              <textarea
                value={userComments}
                onChange={(e) => setUserComments(e.target.value)}
                placeholder="What features made you identify this differently?"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20"
              />
            </div>
          </div>
        )}

        <div>
          <button
            onClick={handleSubmitFeedback}
            disabled={isCorrect === null || (isCorrect === false && !actualAnimal)}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Submit Feedback
          </button>
        </div>

        {prediction.animalType === 'cattle' && (
          <div className="mt-4">
            <button
              onClick={() => setShowTips(!showTips)}
              className="text-blue-600 text-sm underline hover:text-blue-800"
            >
              🐃 Having trouble distinguishing buffalo from cattle? Click for tips
            </button>
            {showTips && <BuffaloDetectionTips />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassificationFeedback;