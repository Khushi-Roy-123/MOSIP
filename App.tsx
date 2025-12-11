import React, { useState, useRef } from 'react';
import { processDocumentsWithGemini } from './services/geminiService';
import { AppState, OCRResult, DocumentFile, AppMode, UserSubmittedData, FieldComparisonResult } from './types';
import QualityIndicator from './components/QualityIndicator';
import VerificationField from './components/VerificationField';
import ImageViewer from './components/ImageViewer';
import WorkflowVisualizer from './components/WorkflowVisualizer';
import FormGenerator from './components/FormGenerator';
import DataInputForm from './components/DataInputForm';
import VerificationComparison from './components/VerificationComparison';
import { mapToMosipSchema, MosipIdentityJSON, APIResponse } from './services/mosipService';
import { compareData } from './utils/comparisonUtils';

// Ensure API key is present
if (!process.env.API_KEY) {
  console.error("Missing API_KEY in environment variables.");
}

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.MODE_SELECTION);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.EXTRACTION);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [mosipPayload, setMosipPayload] = useState<MosipIdentityJSON | null>(null);
  const [mosipResponse, setMosipResponse] = useState<APIResponse | null>(null);
  
  // Verification Mode State
  const [userData, setUserData] = useState<UserSubmittedData | null>(null);
  const [comparisonResults, setComparisonResults] = useState<FieldComparisonResult[]>([]);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectMode = (mode: AppMode) => {
    setAppMode(mode);
    setAppState(mode === AppMode.VERIFICATION ? AppState.INPUT_DATA : AppState.IDLE);
  };

  const handleUserDataSubmit = (data: UserSubmittedData) => {
    setUserData(data);
    setAppState(AppState.IDLE); // Proceed to file upload
  };

  const addFiles = (newFiles: FileList | null) => {
    if (newFiles) {
      const newDocumentFiles: DocumentFile[] = Array.from(newFiles).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        type: file.type === 'application/pdf' ? 'pdf' : 'image'
      }));
      setFiles(prev => [...prev, ...newDocumentFiles]);
      // Stay in IDLE to allow adding more files, or click process
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

      if (appMode === AppMode.VERIFICATION && userData) {
         setLoadingMessage("Cross-referencing claims with document evidence...");
         const comparisons = compareData(userData, result);
         setComparisonResults(comparisons);
      }
      
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

  const handleMOSIPSubmit = () => {
    if (!ocrResult) return;
    // Map current OCR state to MOSIP Schema
    const payload = mapToMosipSchema(ocrResult);
    setMosipPayload(payload);
    setAppState(AppState.SUBMITTING);
  };

  const handleWorkflowComplete = (response: APIResponse) => {
    setMosipResponse(response);
    setAppState(AppState.SUCCESS);
  };

  const handleExportJSON = () => {
    if (!ocrResult) return;
    const dataStr = JSON.stringify({
        mode: appMode === AppMode.VERIFICATION ? 'verification' : 'digitization',
        userInput: userData,
        extraction: ocrResult,
        comparison: comparisonResults
    }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mosip_${appMode === AppMode.VERIFICATION ? 'verify' : 'ocr'}_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetApp = () => {
    setAppState(AppState.MODE_SELECTION);
    setFiles([]);
    setOcrResult(null);
    setMosipPayload(null);
    setMosipResponse(null);
    setUserData(null);
    setComparisonResults([]);
    setActiveFileIndex(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      
      {/* Header - Hidden on Print */}
      <header className="bg-white shadow-sm sticky top-0 z-50 print:hidden">
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
               v2.1.0
             </span>
             {appMode === AppMode.VERIFICATION && userData && (
                 <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                     <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                     Verifying: <strong>{userData.name}</strong>
                 </div>
             )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[95%] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
        
        {/* Mode Selection Screen */}
        {appState === AppState.MODE_SELECTION && (
            <div className="flex flex-col items-center justify-center py-10 animate-fade-in-up">
                <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">
                  Select Operation Mode
                </h1>
                <p className="text-lg text-gray-600 text-center max-w-2xl mb-12">
                  Choose between digitizing a physical document or verifying data against a claim.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                    
                    {/* API 1: OCR Extraction */}
                    <div 
                        onClick={() => selectMode(AppMode.EXTRACTION)}
                        className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-mosip-blue hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center"
                    >
                        <div className="w-20 h-20 bg-blue-50 text-mosip-blue rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">OCR Digitization</h3>
                        <p className="text-gray-500 mb-4">Extract text from scanned PDFs or images and convert it into a digital format.</p>
                        <span className="text-sm font-bold text-mosip-blue uppercase tracking-wide">Select API 1 &rarr;</span>
                    </div>

                    {/* API 2: Data Verification */}
                    <div 
                        onClick={() => selectMode(AppMode.VERIFICATION)}
                        className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-green-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center"
                    >
                        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Data Verification</h3>
                        <p className="text-gray-500 mb-4">Compare user-submitted data against uploaded documents to find discrepancies.</p>
                        <span className="text-sm font-bold text-green-600 uppercase tracking-wide">Select API 2 &rarr;</span>
                    </div>
                </div>
            </div>
        )}

        {/* Verification Mode: Data Input Step */}
        {appState === AppState.INPUT_DATA && (
             <DataInputForm 
                onSubmit={handleUserDataSubmit} 
                onBack={() => setAppState(AppState.MODE_SELECTION)} 
             />
        )}

        {/* Form Generator State */}
        {appState === AppState.GENERATING_FORM && (
          <FormGenerator onBack={() => setAppState(AppState.IDLE)} />
        )}

        {/* File Upload State (Shared) */}
        {appState === AppState.IDLE && files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
               {appMode === AppMode.VERIFICATION ? 'Upload Proof of Identity' : 'Upload Documents to Digitize'}
            </h1>
            <p className="text-lg text-gray-600 text-center max-w-2xl mb-10">
               {appMode === AppMode.VERIFICATION 
                 ? `Please upload the ID card or form for ${userData?.name || 'the user'} to verify the submitted data.`
                 : 'Upload images or PDFs to extract text automatically.'
               }
            </p>

            <div 
              className="w-full max-w-xl border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center bg-white hover:bg-gray-50 hover:border-mosip-blue transition-all cursor-pointer group mb-8"
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
            
            {appMode === AppMode.EXTRACTION && (
                <div className="w-full max-w-xl flex flex-col items-center">
                <div className="relative flex py-2 items-center w-full mb-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or if you don't have a document</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                
                <button 
                    onClick={() => setAppState(AppState.GENERATING_FORM)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                    <svg className="w-5 h-5 text-mosip-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Create Sample Enrollment Form
                </button>
                </div>
            )}
            
            <button onClick={() => setAppState(AppState.MODE_SELECTION)} className="text-gray-400 hover:text-gray-600 mt-4 text-sm underline">Back to Mode Selection</button>
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
                  </div>
                ))}
             </div>

             <div className="flex justify-center">
                 <button 
                   onClick={startExtraction}
                   className={`w-full md:w-auto min-w-[300px] text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors flex items-center justify-center transform hover:-translate-y-1 ${appMode === AppMode.VERIFICATION ? 'bg-green-600 hover:bg-green-700' : 'bg-mosip-blue hover:bg-blue-700'}`}
                 >
                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   {appMode === AppMode.VERIFICATION ? 'Verify Data Match' : `Process Documents`}
                 </button>
             </div>
          </div>
        )}

        {/* Loading State */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
            <div className={`w-20 h-20 border-4 border-t-transparent rounded-full animate-spin mb-6 ${appMode === AppMode.VERIFICATION ? 'border-green-500' : 'border-mosip-blue'}`}></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Documents</h2>
            <p className="text-gray-500">{loadingMessage}</p>
          </div>
        )}

        {/* Verification State */}
        {appState === AppState.VERIFYING && ocrResult && (
          <div className="animate-fade-in pb-10 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    {appMode === AppMode.VERIFICATION ? 'Identity Verification Results' : 'Data Verification'}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                   <span>Type: <span className="font-semibold text-gray-700">{ocrResult.documentType || 'Unknown'}</span></span>
                   <span>•</span>
                   <span>Language: <span className="font-semibold text-gray-700">{ocrResult.detectedLanguage || 'English'}</span></span>
                </div>
              </div>
              <div className="flex gap-3">
                 <button onClick={resetApp} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                   New Session
                 </button>
                 <button onClick={handleExportJSON} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center">
                   Export JSON
                 </button>
                 <button onClick={handleMOSIPSubmit} className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 shadow text-sm font-bold flex items-center">
                   Submit to MOSIP
                 </button>
              </div>
            </div>

            {/* Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
              
              {/* Left Column: Source Image Viewer */}
              <div className="lg:col-span-6 flex flex-col h-full gap-4">
                 <div className="flex-grow h-full overflow-hidden relative rounded-xl shadow-lg border border-gray-200">
                    <ImageViewer 
                      src={files[activeFileIndex].preview} 
                      alt="Source Document" 
                      fields={ocrResult.fields}
                      activePageIndex={activeFileIndex}
                    />
                 </div>
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

              {/* Right Column: Results */}
              <div className="lg:col-span-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-y-auto h-full p-6">
                
                <QualityIndicator metrics={ocrResult.quality} />

                {appMode === AppMode.VERIFICATION ? (
                    // API 2 View: Comparison
                    <VerificationComparison results={comparisonResults} />
                ) : (
                    // API 1 View: Extraction Editing
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
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submitting / Workflow Visualizer State */}
        {appState === AppState.SUBMITTING && mosipPayload && (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Processing Packet</h2>
            <WorkflowVisualizer 
              payload={mosipPayload}
              onComplete={handleWorkflowComplete}
            />
          </div>
        )}

        {/* Success State */}
        {appState === AppState.SUCCESS && mosipResponse && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 max-w-lg text-center mb-8">
              Packet ID: <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded font-bold">{mosipResponse.prid}</span>
            </p>
            <button 
                onClick={resetApp}
                className="px-6 py-3 bg-mosip-blue text-white font-bold rounded-lg hover:bg-blue-700 shadow transition-colors"
            >
                Start New Session
            </button>
          </div>
        )}

      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            &copy; 2025 MOSIP Decode Challenge.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;