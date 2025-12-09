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

const processDocumentsWithGemini = async (files: File[]): Promise<OCRResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
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
          name: {
            type: Type.OBJECT,
            properties: {
              value: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              label: { type: Type.STRING },
              isHandwritten: { type: Type.BOOLEAN, description: "True if this specific field value is handwritten" }
            }
          },
          age: {
            type: Type.OBJECT,
            properties: {
              value: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              label: { type: Type.STRING },
              isHandwritten: { type: Type.BOOLEAN }
            }
          },
          gender: {
            type: Type.OBJECT,
            properties: {
              value: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              label: { type: Type.STRING },
              isHandwritten: { type: Type.BOOLEAN }
            }
          },
          address: {
            type: Type.OBJECT,
            properties: {
              value: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              label: { type: Type.STRING },
              isHandwritten: { type: Type.BOOLEAN }
            }
          },
          idNumber: {
            type: Type.OBJECT,
            properties: {
              value: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              label: { type: Type.STRING },
              isHandwritten: { type: Type.BOOLEAN }
            }
          },
          email: {
            type: Type.OBJECT,
            properties: {
              value: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              label: { type: Type.STRING },
              isHandwritten: { type: Type.BOOLEAN }
            }
          },
          phone: {
            type: Type.OBJECT,
            properties: {
              value: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              label: { type: Type.STRING },
              isHandwritten: { type: Type.BOOLEAN }
            }
          }
        }
      }
    }
  };

  try {
    const modelId = "gemini-3-pro-preview";
    
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
            5. **Language**: Detect the primary language. If it is non-Latin (e.g., Arabic, Hindi), transiterate keys to English but keep values in original script unless it's a standard field like 'Gender' which should be normalized to English.
            6. **Confidence**: Provide a confidence score (0-100) based on clarity and ambiguity.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 } // Increased budget for multi-page reasoning
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");

    return JSON.parse(jsonText) as OCRResult;

  } catch (error) {
    console.error("OCR Extraction Error:", error);
    throw error;
  }
};

export { processDocumentsWithGemini };
