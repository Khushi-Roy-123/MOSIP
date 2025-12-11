import React from 'react';
import { FieldComparisonResult } from '../types';

interface VerificationComparisonProps {
  results: FieldComparisonResult[];
}

const VerificationComparison: React.FC<VerificationComparisonProps> = ({ results }) => {
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'MATCH':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
           MATCH
        </span>;
      case 'PARTIAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           PARTIAL
        </span>;
      case 'MISMATCH':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           MISMATCH
        </span>;
      case 'MISSING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
           MISSING
        </span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Verification Report</h3>
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">API 2: Data Verification</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50/50 border-r border-blue-100">User Claim</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider bg-green-50/50 border-l border-green-100">Document Evidence</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OCR Conf.</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((item, idx) => (
              <tr key={idx} className={item.status === 'MISMATCH' ? 'bg-red-50/30' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                  {item.fieldKey.replace(/([A-Z])/g, ' $1')}
                </td>
                
                <td className="px-6 py-4 text-sm text-gray-700 bg-blue-50/30 border-r border-blue-100">
                  {item.claimedValue || <span className="text-gray-400 italic">--</span>}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                   {getStatusBadge(item.status)}
                   {item.status !== 'MISSING' && (
                     <div className="text-[10px] text-gray-400 mt-1 font-mono">Sim: {item.matchScore}%</div>
                   )}
                </td>

                <td className="px-6 py-4 text-sm text-gray-700 bg-green-50/30 border-l border-green-100">
                  {item.extractedValue ? (
                    <span className={item.status === 'MATCH' ? 'text-green-900 font-medium' : item.status === 'MISMATCH' ? 'text-red-600 line-through' : ''}>
                      {item.extractedValue}
                    </span>
                  ) : <span className="text-gray-400 italic">Not found</span>}
                  
                  {item.isHandwritten && (
                     <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
                       Handwritten
                     </span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.extractedValue ? `${Math.round(item.confidence)}%` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          * Matches are calculated using fuzzy string logic to account for minor OCR typos. High confidence threshold is 90%.
        </p>
      </div>
    </div>
  );
};

export default VerificationComparison;