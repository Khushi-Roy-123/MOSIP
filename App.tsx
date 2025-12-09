import React, { useState, useRef } from 'react';
import { processDocumentsWithGemini } from './services/geminiService';
import { AppState, OCRResult, DocumentFile } from './types';
import QualityIndicator from './components/QualityIndicator';
import VerificationField from './components/VerificationField';
import ImageViewer from './components/ImageViewer';

// Ensure API key is present
if (!process.env.API_KEY) {
  console.error("Missing API_KEY in environment variables.");
}

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (newFiles) {
      const newDocumentFiles: DocumentFile[] = Array.from(newFiles).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        type: file.type === 'application/pdf' ? 'pdf' : 'image'
      }));
      setFiles(prev => [...prev, ...newDocumentFiles]);
      setAppState(AppState.IDLE);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  };

  const startExtraction = async () => {
    if (files.length === 0) return;

    setAppState(AppState.ANALYZING);
    setLoadingMessage("Analyzing document quality...");

    try {
      const rawFiles = files.map(f => f.file);

      setLoadingMessage("Extracting text, detecting handwriting & language...");
      const result = await processDocumentsWithGemini(rawFiles);
      
      setOcrResult(result);
      setAppState(AppState.VERIFYING);
    } catch (error) {
      console.error(error);
      alert("Extraction failed. Please ensure the image is clear and try again.");
      setAppState(AppState.IDLE);
    }
  };

  const handleFieldChange = (key: string, newValue: string) => {
    if (!ocrResult) return;
    setOcrResult({
      ...ocrResult,
      fields: {
        ...ocrResult.fields,
        [key]: {
          ...ocrResult.fields[key],
          value: newValue,
        }
      }
    });
  };

  const handleMOSIPSubmit = async () => {
    setAppState(AppState.SUBMITTING);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAppState(AppState.SUCCESS);
  };

  const handleExportJSON = () => {
    if (!ocrResult) return;
    const dataStr = JSON.stringify(ocrResult, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mosip_ocr_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setFiles([]);
    setOcrResult(null);
    setActiveFileIndex(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-mosip-orange to-mosip-blue flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              MOSIP <span className="font-light text-mosip-orange">Decode</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 hidden sm:inline-block">
               v2.0.1 (Sandbox Env)
             </span>
             <div className="text-sm text-gray-500 hidden sm:block">
               OCR & Data Verification Module
             </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[95%] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Empty State */}
        {appState === AppState.IDLE && files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
            <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">
              Intelligent Document Digitization
            </h1>
            <p className="text-lg text-gray-600 text-center max-w-2xl mb-10">
              Seamlessly extract text from scanned documents, auto-fill forms, and verify data accuracy with our advanced OCR engine. Supports multi-page forms, IDs, and handwritten notes.
            </p>

            <div 
              className="w-full max-w-xl border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center bg-white hover:bg-gray-50 hover:border-mosip-blue transition-all cursor-pointer group"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 bg-blue-50 text-mosip-blue rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 mt-2">Images or PDFs. Multi-page supported.</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*,application/pdf" 
                multiple
                className="hidden" 
              />
            </div>
          </div>
        )}

        {/* Preview State */}
        {appState === AppState.IDLE && files.length > 0 && (
          <div className="animate-fade-in max-w-5xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">Review Selection</h2>
                   <p className="text-sm text-gray-500">{files.length} document(s) loaded</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => fileInputRef.current?.click()} className="text-sm text-mosip-blue hover:underline font-medium px-3">
                     Add more pages
                   </button>
                   <button onClick={resetApp} className="text-sm text-red-600 hover:text-red-800 font-medium px-3">
                     Clear All
                   </button>
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*,application/pdf" 
                    multiple
                    className="hidden" 
                  />
                </div>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {files.map((file, idx) => (
                  <div key={file.id} className="relative group aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                     <img src={file.preview} className="w-full h-full object-cover" alt="Preview" />
                     <button 
                        onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                     <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs p-1 text-center truncate">
                        {file.file.name}
                     </div>
                  </div>
                ))}
             </div>

             <div className="flex justify-center">
                 <button 
                   onClick={startExtraction}
                   className="w-full md:w-auto min-w-[300px] bg-mosip-blue text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center transform hover:-translate-y-1"
                 >
                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   Process {files.length} Document{files.length > 1 ? 's' : ''}
                 </button>
             </div>
          </div>
        )}

        {/* Loading State */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
            <div className="w-20 h-20 border-4 border-mosip-blue border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Documents</h2>
            <p className="text-gray-500">{loadingMessage}</p>
            <div className="mt-4 flex gap-2">
               <span className="w-2 h-2 bg-mosip-orange rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-mosip-orange rounded-full animate-bounce delay-150"></span>
               <span className="w-2 h-2 bg-mosip-orange rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}

        {/* Verification State */}
        {appState === AppState.VERIFYING && ocrResult && (
          <div className="animate-fade-in pb-10 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Data Verification</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                   <span>Type: <span className="font-semibold text-gray-700">{ocrResult.documentType || 'Unknown'}</span></span>
                   <span>•</span>
                   <span>Language: <span className="font-semibold text-gray-700">{ocrResult.detectedLanguage || 'English'}</span></span>
                </div>
              </div>
              <div className="flex gap-3">
                 <button onClick={resetApp} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                   Cancel
                 </button>
                 <button onClick={handleExportJSON} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center">
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   Export JSON
                 </button>
                 <button onClick={handleMOSIPSubmit} className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 shadow text-sm font-bold flex items-center">
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                   Verify & Submit
                 </button>
              </div>
            </div>

            {/* Layout: Left = Image Viewer, Right = Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
              
              {/* Left Column: Source Image Viewer */}
              <div className="lg:col-span-7 flex flex-col h-full gap-4">
                 {/* Main Viewer */}
                 <div className="flex-grow h-full overflow-hidden relative rounded-xl shadow-lg border border-gray-200">
                    <ImageViewer 
                      src={files[activeFileIndex].preview} 
                      alt="Source Document" 
                    />
                 </div>
                 
                 {/* Thumbnails (if multiple) */}
                 {files.length > 1 && (
                   <div className="flex gap-2 overflow-x-auto pb-2 h-24">
                      {files.map((file, idx) => (
                        <div 
                          key={file.id} 
                          onClick={() => setActiveFileIndex(idx)}
                          className={`flex-shrink-0 cursor-pointer w-20 rounded-md overflow-hidden border-2 transition-all ${activeFileIndex === idx ? 'border-mosip-blue ring-2 ring-blue-200' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                        >
                          <img src={file.preview} className="w-full h-full object-cover" />
                        </div>
                      ))}
                   </div>
                 )}
              </div>

              {/* Right Column: Extraction Form */}
              <div className="lg:col-span-5 bg-white rounded-xl shadow-lg border border-gray-200 overflow-y-auto h-full p-6">
                
                {/* Quality Score Badge */}
                <QualityIndicator metrics={ocrResult.quality} />

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                    <span>Extracted Data</span>
                    <span className="text-xs font-normal text-gray-400">Edit to correct errors</span>
                  </h3>
                  
                  {Object.entries(ocrResult.fields).map(([key, field]) => (
                    <VerificationField
                      key={key}
                      fieldKey={key}
                      data={field}
                      onChange={(val) => handleFieldChange(key, val)}
                    />
                  ))}
                  
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submitting State */}
        {appState === AppState.SUBMITTING && (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Syncing with MOSIP</h2>
            <p className="text-gray-500">Pushing verified data to Pre-Registration module...</p>
          </div>
        )}

        {/* Success State */}
        {appState === AppState.SUCCESS && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 max-w-lg text-center mb-8">
              The data has been verified and successfully submitted to the MOSIP Pre-Registration Packet Handler. 
              Packet ID: <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">PR-2025-882910</span>
            </p>
            <div className="flex gap-4">
              <button 
                onClick={resetApp}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Process New Packet
              </button>
              <a 
                href="#"
                className="px-6 py-3 bg-mosip-blue text-white font-bold rounded-lg hover:bg-blue-700 shadow transition-colors"
              >
                View in Registration Client
              </a>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            &copy; 2025 MOSIP Decode Challenge. Powered by Gemini 3 Pro.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
