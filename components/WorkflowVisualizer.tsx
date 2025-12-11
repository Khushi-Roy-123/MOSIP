import React, { useEffect, useState } from 'react';
import { MosipIdentityJSON, APIResponse } from '../services/mosipService';

interface WorkflowVisualizerProps {
  payload: MosipIdentityJSON;
  onComplete: (response: APIResponse) => void;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ payload, onComplete }) => {
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  useEffect(() => {
    let mounted = true;

    const runSimulation = async () => {
      // Step 1: Data Transformation
      setStep(1);
      addLog("Initializing MOSIP Connector...");
      await new Promise(r => setTimeout(r, 800));
      
      if (!mounted) return;
      addLog("Mapping OCR Data to ID Schema (CBI)...");
      addLog(`Generated Identity JSON: ${JSON.stringify(payload.identity).substring(0, 60)}...`);
      await new Promise(r => setTimeout(r, 1000));

      // Step 2: Authentication
      if (!mounted) return;
      setStep(2);
      addLog("Authenticating with Pre-Registration Service...");
      addLog("POST /v1/authmanager/authenticate");
      await new Promise(r => setTimeout(r, 800));
      addLog("Auth Token Received: eyJhbGciOiJIUzI1NiIsInR5cCI...");

      // Step 3: Submission
      if (!mounted) return;
      setStep(3);
      addLog("Submitting Application Packet...");
      addLog("POST /pre-registration/v1/applications");
      await new Promise(r => setTimeout(r, 1500));
      
      // Step 4: Success
      if (!mounted) return;
      setStep(4);
      const prid = `29${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      addLog(`Response 200 OK. PRID Generated: ${prid}`);
      
      await new Promise(r => setTimeout(r, 800));
      if (mounted) {
        onComplete({
            status: "Success",
            prid: prid,
            timestamp: new Date().toISOString()
        });
      }
    };

    runSimulation();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col md:flex-row h-[500px]">
      
      {/* Visual Flow Diagram */}
      <div className="w-full md:w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-center relative border-r border-gray-200">
        <h3 className="text-lg font-bold text-gray-700 mb-8 absolute top-6">End-to-End Integration Flow</h3>
        
        {/* Step 1: Client */}
        <div className={`flex items-center gap-4 transition-all duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step === 1 ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50' : step > 1 ? 'bg-green-100 text-green-600' : 'bg-gray-200'}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div className="text-sm font-medium">Decode Client</div>
        </div>

        {/* Connection Line */}
        <div className={`h-12 w-0.5 my-1 transition-colors duration-500 ${step >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

        {/* Step 2: Gateway */}
        <div className={`flex items-center gap-4 transition-all duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step === 2 ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50' : step > 2 ? 'bg-green-100 text-green-600' : 'bg-gray-200'}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <div className="text-sm font-medium">API Gateway</div>
        </div>

        {/* Connection Line */}
        <div className={`h-12 w-0.5 my-1 transition-colors duration-500 ${step >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>

        {/* Step 3: Pre-Reg */}
        <div className={`flex items-center gap-4 transition-all duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-30'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step === 3 ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50' : step > 3 ? 'bg-green-100 text-green-600' : 'bg-gray-200'}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
          </div>
          <div className="text-sm font-medium">Pre-Registration DB</div>
        </div>
      </div>

      {/* Terminal / Code View */}
      <div className="w-full md:w-1/2 bg-gray-900 p-6 font-mono text-xs overflow-y-auto">
        <div className="flex justify-between items-center text-gray-400 mb-4 border-b border-gray-700 pb-2">
          <span>system-log.txt</span>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="text-green-400 font-light break-all animate-fade-in">
              <span className="text-blue-400">$</span> {log}
            </div>
          ))}
          <div className="w-2 h-4 bg-green-500 animate-pulse mt-2"></div>
        </div>

        {step >= 1 && (
          <div className="mt-8 pt-4 border-t border-gray-700">
            <div className="text-gray-400 mb-2">// Request Payload Preview</div>
            <pre className="text-yellow-100 opacity-80 whitespace-pre-wrap">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowVisualizer;