export interface ExtractedField {
  value: string;
  confidence: number; // 0-100
  label: string;
  isHandwritten?: boolean;
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
  ANALYZING,
  VERIFYING,
  SUBMITTING,
  SUCCESS
}

export interface DocumentFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'pdf';
}
