import React, { useMemo } from 'react';
import { ExtractedField } from '../types';

interface VerificationFieldProps {
  fieldKey: string;
  data: ExtractedField;
  onChange: (value: string) => void;
}

const VerificationField: React.FC<VerificationFieldProps> = ({ fieldKey, data, onChange }) => {
  
  // Real-time validation logic
  const validationError = useMemo(() => {
    const value = data.value ? data.value.trim() : '';
    if (!value) return null; // Skip validation for empty fields (or handle as required if needed)

    switch (fieldKey) {
      case 'email':
        // Basic email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : 'Invalid email format';
      
      case 'phone':
      case 'phoneNumber':
        // Phone: Allow digits, spaces, dashes, parentheses, plus sign. Min length 7.
        const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
        return phoneRegex.test(value) ? null : 'Invalid phone number format';
        
      case 'age':
        const age = parseInt(value, 10);
        return (!isNaN(age) && age > 0 && age < 120) ? null : 'Invalid age (must be 1-120)';

      case 'gender':
        // Case-insensitive check for common gender terms
        const g = value.toLowerCase();
        return ['male', 'female', 'other', 'non-binary'].includes(g) ? null : 'Unrecognized gender value';
      
      default:
        return null;
    }
  }, [fieldKey, data.value]);

  // Determine styles based on Validation Error AND Confidence
  let borderColor = 'border-gray-300';
  let ringColor = 'focus:ring-blue-500 focus:border-blue-500';
  let badgeColor = 'bg-gray-100 text-gray-600';
  let confidenceLabel = 'Unknown';

  if (validationError) {
    // Error state takes precedence
    borderColor = 'border-red-500';
    ringColor = 'focus:ring-red-500 focus:border-red-500';
  } else if (data.confidence >= 90) {
    borderColor = 'border-green-500';
    ringColor = 'focus:ring-green-500 focus:border-green-500';
    badgeColor = 'bg-green-100 text-green-800';
    confidenceLabel = 'High';
  } else if (data.confidence >= 70) {
    borderColor = 'border-yellow-400';
    ringColor = 'focus:ring-yellow-400 focus:border-yellow-400';
    badgeColor = 'bg-yellow-100 text-yellow-800';
    confidenceLabel = 'Medium';
  } else {
    borderColor = 'border-red-300'; // Warning state (low confidence but valid format)
    ringColor = 'focus:ring-red-300 focus:border-red-300';
    badgeColor = 'bg-red-100 text-red-800';
    confidenceLabel = 'Low';
  }

  const formatLabel = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="mb-4 group">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          {formatLabel(fieldKey)}
          {data.isHandwritten && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200" title="Detected as Handwritten">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Handwritten
            </span>
          )}
        </label>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeColor}`}>
          {Math.round(data.confidence)}% ({confidenceLabel})
        </span>
      </div>
      <div className="relative">
        <input
          type="text"
          value={data.value}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full sm:text-sm rounded-md shadow-sm p-2.5 border ${borderColor} transition-all duration-200 outline-none ring-1 ring-transparent ${ringColor}`}
        />
        
        {/* Status Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {validationError ? (
             <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
          ) : data.confidence < 70 ? (
             <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
          ) : null}
        </div>
      </div>
      
      {/* Validation Error Message */}
      {validationError && (
        <p className="mt-1 text-xs text-red-600 font-medium animate-pulse flex items-center">
          {validationError}
        </p>
      )}
    </div>
  );
};

export default VerificationField;