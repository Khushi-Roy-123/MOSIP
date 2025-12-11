
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { OCRResult } from "../types";

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const createFieldSchema = (description?: string) => ({
  type: Type.OBJECT,
  properties: {
    value: { type: Type.STRING, description },
    confidence: { type: Type.NUMBER },
    label: { type: Type.STRING },
    isHandwritten: { type: Type.BOOLEAN, description: "True if this specific field value is handwritten" },
    boundingBox: {
      type: Type.ARRAY,
      items: { type: Type.NUMBER },
      description: "Bounding box of the detected text in [ymin, xmin, ymax, xmax] format (scale 0-1000)."
    },
    sourcePageIdx: {
      type: Type.INTEGER,
      description: "The index of the page (0-based) where this field was found."
    }
  }
});

// Helper to retrieve API Key from various environment configurations
export const getEnvironmentApiKey = (): string | undefined => {
  // Check Vite (standard for modern React)
  const meta = import.meta as any;
  if (typeof meta !== 'undefined' && meta.env && meta.env.VITE_GEMINI_API_KEY) {
    return meta.env.VITE_GEMINI_API_KEY;
  }
  // Check Create React App
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GEMINI_API_KEY) {
    return process.env.REACT_APP_GEMINI_API_KEY;
  }
  // Check Node/Standard
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return undefined;
};

const processDocumentsWithGemini = async (files: File[], manualApiKey?: string): Promise<OCRResult> => {
  const apiKey = manualApiKey || getEnvironmentApiKey();
  
  if (!apiKey) {
    throw new Error("API Key not found. Please configure VITE_GEMINI_API_KEY in .env or provide it manually.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Schema definition for structured output
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      quality: {
        type: Type.OBJECT,
        properties: {
          blurScore: { type: Type.NUMBER, description: "Score from 0 (unreadable) to 10 (sharp)" },
          lightingScore: { type: Type.NUMBER, description: "Score from 0 (bad) to 10 (perfect)" },
          isReadable: { type: Type.BOOLEAN },
          issues: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of quality issues (e.g., 'Glare', 'Blur', 'Folded')"
          }
        },
        required: ["blurScore", "lightingScore", "isReadable", "issues"]
      },
      detectedLanguage: { type: Type.STRING, description: "The primary language of the document (e.g., 'English', 'Arabic', 'Hindi')" },
      documentType: { type: Type.STRING, description: "Type of document (e.g., 'National ID', 'Passport', 'Utility Bill', 'Handwritten Note')" },
      fields: {
        type: Type.OBJECT,
        description: "Extracted fields. Consolidate info if multiple pages.",
        properties: {
          name: createFieldSchema("Full Name"),
          age: createFieldSchema("Age"),
          gender: createFieldSchema("Gender"),
          address: createFieldSchema("Full Address"),
          idNumber: createFieldSchema("ID Number"),
          email: createFieldSchema("Email Address"),
          phone: createFieldSchema("Phone Number")
        }
      }
    }
  };

  try {
    const modelId = "gemini-2.5-flash";
    
    // Prepare all file parts
    const fileParts = await Promise.all(files.map(f => fileToGenerativePart(f)));

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          ...fileParts,
          {
            text: `Analyze the provided document image(s). These may be printed forms, ID cards, or handwritten notes.
            
            1. **Quality Analysis**: Evaluate if the image is suitable for official processing (blur, lighting).
            2. **Extraction**: Extract Name, Age (or calculate from DOB), Gender, Address, ID Number, Email, and Phone.
            3. **Consolidation**: If multiple images are provided (e.g., front/back or multiple pages), combine the information into a single record.
            4. **Handwriting**: Explicitly flag if specific fields are handwritten.
            5. **Language**: Detect the primary language.
            6. **Confidence & Zoning**: Provide a confidence score (0-100). CRITICAL: Provide the 'boundingBox' [ymin, xmin, ymax, xmax] (0-1000 scale) for where the text was found on the image. Identify which page index (0, 1, etc.) the data came from.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");

    const parsedResult = JSON.parse(jsonText);

    // Defensive Coding: Ensure 'quality' and 'fields' exist even if model hallucinates partial structure
    const safeResult: OCRResult = {
      detectedLanguage: parsedResult.detectedLanguage || "Unknown",
      documentType: parsedResult.documentType || "Unknown",
      fields: parsedResult.fields || {},
      quality: parsedResult.quality || {
        blurScore: 0,
        lightingScore: 0,
        isReadable: false,
        issues: ["Quality metrics not returned by AI"]
      }
    };

    return safeResult;

  } catch (error) {
    console.error("OCR Extraction Error:", error);
    throw error;
  }
};

export { processDocumentsWithGemini };
