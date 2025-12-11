import { OCRResult, UserSubmittedData, FieldComparisonResult } from "../types";

// Levenshtein distance implementation for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const normalize = (str: string) => {
  return str.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
};

const calculateSimilarity = (s1: string, s2: string): number => {
  const a = normalize(s1);
  const b = normalize(s2);
  
  if (!a && !b) return 100;
  if (!a || !b) return 0;
  if (a === b) return 100;

  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  
  return Math.round((1 - distance / maxLength) * 100);
};

export const compareData = (
  userData: UserSubmittedData,
  ocrResult: OCRResult
): FieldComparisonResult[] => {
  const fields = [
    { key: 'name', label: 'Full Name', userVal: userData.name },
    { key: 'age', label: 'Age', userVal: userData.age },
    { key: 'gender', label: 'Gender', userVal: userData.gender },
    { key: 'address', label: 'Address', userVal: userData.address },
    { key: 'idNumber', label: 'ID Number', userVal: userData.idNumber },
    { key: 'email', label: 'Email', userVal: userData.email },
    { key: 'phone', label: 'Phone', userVal: userData.phone },
  ];

  return fields.map(f => {
    const extractedField = ocrResult.fields[f.key];
    const extractedVal = extractedField?.value || '';
    
    // Custom logic for specific fields if needed (e.g., date parsing)
    let score = calculateSimilarity(f.userVal, extractedVal);

    // Boost score for exact substring matches (common in addresses)
    if (score < 100 && score > 40 && (normalize(extractedVal).includes(normalize(f.userVal)) || normalize(f.userVal).includes(normalize(extractedVal)))) {
        score = Math.max(score, 85);
    }

    let status: 'MATCH' | 'MISMATCH' | 'PARTIAL' | 'MISSING' = 'MISMATCH';

    if (!extractedVal) status = 'MISSING';
    else if (score >= 90) status = 'MATCH';
    else if (score >= 70) status = 'PARTIAL';
    else status = 'MISMATCH';

    return {
      fieldKey: f.key,
      claimedValue: f.userVal,
      extractedValue: extractedVal,
      matchScore: score,
      status,
      isHandwritten: extractedField?.isHandwritten,
      confidence: extractedField?.confidence || 0
    };
  });
};