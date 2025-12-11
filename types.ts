export interface ExtractedField {
  value: string;
  confidence: number; // 0-100
  label: string;
  isHandwritten?: boolean;
  boundingBox?: number[]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  sourcePageIdx?: number; // Index of the page where this field was found
}

export interface QualityMetrics {
  blurScore: number; // 0-10 (0 is very blurry, 10 is sharp)
  lightingScore: number; // 0-10 (0 is poor/dark/glare, 10 is perfect)
  isReadable: boolean;
  issues: string[];
}

export interface OCRResult {
  fields: {
    [key: string]: ExtractedField;
  };
  quality: QualityMetrics;
  detectedLanguage: string;
  documentType: string;
}

export enum AppState {
  IDLE,
  MODE_SELECTION,
  INPUT_DATA,     // User entering data for verification
  GENERATING_FORM,
  ANALYZING,
  VERIFYING,
  SUBMITTING,
  SUCCESS
}

export enum AppMode {
  EXTRACTION, // API 1
  VERIFICATION // API 2
}

export interface DocumentFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'pdf';
}

export interface UserSubmittedData {
  name: string;
  age: string;
  gender: string;
  address: string;
  idNumber: string;
  email: string;
  phone: string;
}

export interface FieldComparisonResult {
  fieldKey: string;
  claimedValue: string;
  extractedValue: string;
  matchScore: number; // 0-100
  status: 'MATCH' | 'MISMATCH' | 'PARTIAL' | 'MISSING';
  isHandwritten?: boolean;
  confidence: number; // OCR Confidence
}