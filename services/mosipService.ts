import { OCRResult } from "../types";

export interface MosipIdentityJSON {
  identity: {
    fullName: { value: string; language: string }[];
    dateOfBirth?: string;
    age?: string;
    gender: { value: string; language: string }[];
    addressLine1: { value: string; language: string }[];
    residenceStatus: { value: string; language: string }[];
    phone: string;
    email: string;
  };
}

// Maps the flat OCR extracted fields into the hierarchical MOSIP ID Schema
export const mapToMosipSchema = (ocrResult: OCRResult): MosipIdentityJSON => {
  const language = ocrResult.detectedLanguage || 'eng';
  
  return {
    identity: {
      fullName: [
        { 
          value: ocrResult.fields.name?.value || "", 
          language: language 
        }
      ],
      age: ocrResult.fields.age?.value,
      gender: [
        { 
          value: ocrResult.fields.gender?.value || "", 
          language: "eng" // Gender codes usually normalized
        }
      ],
      addressLine1: [
        { 
          value: ocrResult.fields.address?.value || "", 
          language: language 
        }
      ],
      residenceStatus: [
         { value: "Resident", language: "eng" }
      ],
      phone: ocrResult.fields.phone?.value || "",
      email: ocrResult.fields.email?.value || ""
    }
  };
};

export interface APIResponse {
  status: string;
  prid: string;
  timestamp: string;
}

// Simulates the API call to the MOSIP Pre-Registration Service
export const simulatePreRegSubmission = async (payload: MosipIdentityJSON): Promise<APIResponse> => {
  // Simulate network latency and processing steps
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  await delay(1000); // Handshake
  await delay(1500); // Schema Validation
  await delay(1000); // Packet Creation

  return {
    status: "Created",
    prid: `29${Math.floor(100000000000 + Math.random() * 900000000000)}`, // Random 14 digit PRID
    timestamp: new Date().toISOString()
  };
};