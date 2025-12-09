import React from 'react';
import { QualityMetrics } from '../types';

interface QualityIndicatorProps {
  metrics: QualityMetrics;
}

const QualityIndicator: React.FC<QualityIndicatorProps> = ({ metrics }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 animate-fade-in">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Capture Quality Score
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blur Score */}
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Sharpness</span>
              <span className={`text-sm font-bold ${getTextColor(metrics.blurScore)}`}>
                {metrics.blurScore}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${getScoreColor(metrics.blurScore)}`} 
                style={{ width: `${metrics.blurScore * 10}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Lighting Score */}
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Lighting</span>
              <span className={`text-sm font-bold ${getTextColor(metrics.lightingScore)}`}>
                {metrics.lightingScore}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${getScoreColor(metrics.lightingScore)}`} 
                style={{ width: `${metrics.lightingScore * 10}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {metrics.issues.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
           <p className="text-xs text-red-500 font-medium">
             Detected Issues: {metrics.issues.join(', ')}
           </p>
        </div>
      )}
    </div>
  );
};

export default QualityIndicator;