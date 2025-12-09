# MosipOCR - Intelligent Verify

## Overview
**MosipOCR - Intelligent Verify** is a cutting-edge web application designed to automate the digitization of identity documents and forms. Built for the **MOSIP Decode Challenge**, this solution leverages **Google's Gemini 1.5 Pro/Flash (via Gemini 3 Pro Preview)** to perform high-accuracy Optical Character Recognition (OCR) on both printed and handwritten text.

It features a dual-interface for **Data Extraction** and **Data Verification**, allowing operators to seamlessly validate extracted data against original documents before submission to the MOSIP Pre-Registration system.

## Key Features

### 🧠 Advanced AI Extraction
*   **Powered by Gemini**: Uses the latest multimodal models to understand complex document layouts.
*   **Handwriting Recognition**: Specifically tuned to decipher handwritten notes and forms with high accuracy.
*   **Multi-Page Support**: Upload multiple files (images or PDFs) and consolidate them into a single identity record.
*   **Language Detection**: Automatically identifies the document language (supports Latin and non-Latin scripts like Arabic/Hindi).

### 🛡️ Robust Verification Interface
*   **Side-by-Side View**: Zoomable, rotatable document viewer next to the data form for ergonomic verification.
*   **Confidence Scoring**: Visual indicators (Green/Yellow/Red) showing the AI's confidence in each extracted field.
*   **Real-time Validation**: Instant feedback on data formats (Email, Phone, Age, Gender) to prevent entry errors.
*   **Quality Analysis**: Automatic assessment of image quality (Blur & Lighting scores) to ensure compliance standards.

### ⚙️ Workflow Integration
*   **JSON Export**: Download verified data in structured JSON format.
*   **MOSIP Simulation**: Simulates the submission workflow to a MOSIP Pre-Registration Packet Handler.

## Tech Stack
*   **Frontend**: React 18, TypeScript, Vite (implied by structure)
*   **Styling**: Tailwind CSS
*   **AI Engine**: Google Gemini API (`@google/genai` SDK)
*   **State Management**: React Hooks

## Prerequisites
Before running the project, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   A Google Cloud Project with the **Gemini API** enabled.
*   An API Key from [Google AI Studio](https://aistudio.google.com/).

## Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/mosip-ocr-verify.git
    cd mosip-ocr-verify
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    This project requires a Gemini API Key. Since it uses a bundler like Vite or Parcel, you typically set this in a `.env` file.
    
    Create a file named `.env` in the root directory:
    ```env
    # Note: For Vite, use VITE_API_KEY. For this specific build setup, 
    # the code expects 'process.env.API_KEY' to be replaced at build time 
    # or available via a define plugin.
    
    # If using Vite:
    VITE_GEMINI_API_KEY=your_actual_api_key_here
    ```

    *Note: In the provided source code, the API key is accessed via `process.env.API_KEY`. Ensure your bundler configuration (e.g., `vite.config.ts` or `webpack.config.js`) replaces this variable correctly.*

4.  **Run Locally**
    ```bash
    npm start
    # or
    npm run dev
    ```

5.  **Access the App**
    Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

## Usage Guide

1.  **Upload**: Drag and drop a scanned ID, form, or handwritten note onto the landing area. You can upload multiple pages.
2.  **Analyze**: Click "Process Documents". The AI will evaluate image quality and extract text.
3.  **Verify**:
    *   Review the **Capture Quality Score**. If the image is too blurry, consider re-uploading.
    *   Use the **Image Viewer** on the left to zoom into specific details.
    *   Check the **Extracted Data** on the right. Fields with low confidence or validation errors will be highlighted in red/yellow.
    *   Manually correct any mistakes.
4.  **Submit**: Once verified, click "Verify & Submit" to simulate sending the data to MOSIP, or "Export JSON" to save the record locally.

## License
This project is open-source and available under the MIT License.
