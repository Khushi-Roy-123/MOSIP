import React, { useState } from 'react';

interface FormGeneratorProps {
  onBack: () => void;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const autoFill = () => {
    setFormData({
      fullName: 'Sarah Jennifer Connor',
      dob: '1985-05-12',
      gender: 'Female',
      address: '42 Tech Plaza, Silicon Valley',
      city: 'San Francisco',
      zipCode: '94016',
      phone: '+1 555-0199',
      email: 'sarah.connor@example.com'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Control Bar - Hidden when printing */}
      <div className="print:hidden bg-white border-b border-gray-200 p-4 mb-6 flex justify-between items-center rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900 flex items-center font-medium">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Upload
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h2 className="text-lg font-bold text-gray-800">Form Generator</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={autoFill}
            className="px-4 py-2 bg-purple-50 text-purple-700 font-medium rounded-lg hover:bg-purple-100 transition-colors text-sm"
          >
            Auto-fill Dummy Data
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-mosip-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center text-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print / Save as PDF
          </button>
        </div>
      </div>
      
      {/* Instruction Banner - Hidden when printing */}
      <div className="print:hidden bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-800">
        <p className="font-bold mb-1">How to use:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Digital Test:</strong> Fill the form using the inputs below, then "Save as PDF" and upload it to the app.</li>
          <li><strong>Handwriting Test:</strong> Leave fields blank, print the form, fill it with a pen, scan/photograph it, and upload.</li>
        </ul>
      </div>

      {/* The Printable Form */}
      <div className="flex-grow flex justify-center overflow-y-auto bg-gray-100 print:bg-white p-4">
        <div className="bg-white w-full max-w-[210mm] min-h-[297mm] p-10 shadow-xl print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0 box-border text-black">
          
          {/* Form Header */}
          <div className="border-b-4 border-black pb-4 mb-8 flex justify-between items-end">
             <div>
               <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">Resident Enrollment Form</h1>
               <p className="text-sm font-semibold uppercase tracking-widest">Pre-Registration Module</p>
             </div>
             <div className="text-right">
                <div className="border-2 border-black p-2 w-32 h-32 flex items-center justify-center bg-gray-50 text-xs text-gray-400 text-center mb-1">
                  Paste Photo<br/>Here
                </div>
             </div>
          </div>

          {/* Form Content */}
          <div className="space-y-8">
             
             {/* Section 1 */}
             <div className="mb-6">
                <h3 className="bg-black text-white px-2 py-1 font-bold uppercase text-sm mb-4 inline-block">1. Personal Information</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Full Name (Block Letters)</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. JOHN DOE"
                      className="w-full border-b-2 border-black border-dashed bg-transparent outline-none py-1 text-xl font-mono uppercase tracking-widest placeholder-gray-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* DOB */}
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Date of Birth (YYYY-MM-DD)</label>
                      <input 
                        type="text" 
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        placeholder="YYYY-MM-DD"
                        className="w-full border-b-2 border-black border-dashed bg-transparent outline-none py-1 text-xl font-mono placeholder-gray-200"
                      />
                    </div>
                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Gender</label>
                      <div className="flex gap-8 items-center pt-2">
                         <label className="flex items-center gap-2">
                           <div className={`w-4 h-4 border border-black ${formData.gender === 'Male' ? 'bg-black' : 'bg-white'}`}></div>
                           <span className="font-mono text-lg">MALE</span>
                         </label>
                         <label className="flex items-center gap-2">
                           <div className={`w-4 h-4 border border-black ${formData.gender === 'Female' ? 'bg-black' : 'bg-white'}`}></div>
                           <span className="font-mono text-lg">FEMALE</span>
                         </label>
                         <label className="flex items-center gap-2">
                           <div className={`w-4 h-4 border border-black ${formData.gender === 'Other' ? 'bg-black' : 'bg-white'}`}></div>
                           <span className="font-mono text-lg">OTHER</span>
                         </label>
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             {/* Section 2 */}
             <div className="mb-6">
                <h3 className="bg-black text-white px-2 py-1 font-bold uppercase text-sm mb-4 inline-block">2. Contact Information</h3>
                
                <div className="grid grid-cols-1 gap-6">
                   {/* Address */}
                   <div>
                    <label className="block text-xs font-bold uppercase mb-1">Permanent Address</label>
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border-b-2 border-black border-dashed bg-transparent outline-none py-1 text-xl font-mono mb-2 placeholder-gray-200"
                    />
                    <div className="grid grid-cols-2 gap-8">
                       <input 
                        type="text" 
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full border-b-2 border-black border-dashed bg-transparent outline-none py-1 text-xl font-mono placeholder-gray-200"
                      />
                       <input 
                        type="text" 
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="Postal Code"
                        className="w-full border-b-2 border-black border-dashed bg-transparent outline-none py-1 text-xl font-mono placeholder-gray-200"
                      />
                    </div>
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">Phone Number</label>
                        <input 
                          type="text" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full border-b-2 border-black border-dashed bg-transparent outline-none py-1 text-xl font-mono placeholder-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-1">Email Address</label>
                        <input 
                          type="text" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full border-b-2 border-black border-dashed bg-transparent outline-none py-1 text-xl font-mono placeholder-gray-200"
                        />
                      </div>
                   </div>
                </div>
             </div>

             {/* Footer / Official Use */}
             <div className="mt-12 pt-6 border-t-2 border-black">
                <h4 className="font-bold uppercase text-xs mb-4">For Official Use Only</h4>
                <div className="grid grid-cols-3 gap-4">
                   <div className="border border-black h-16 p-1">
                     <span className="text-[10px] uppercase block">Date Received</span>
                   </div>
                   <div className="border border-black h-16 p-1">
                     <span className="text-[10px] uppercase block">Officer Signature</span>
                   </div>
                   <div className="border border-black h-16 p-1">
                     <span className="text-[10px] uppercase block">Stamp</span>
                   </div>
                </div>
             </div>
             
             <div className="mt-8 text-center text-xs text-gray-500">
               <p>MOSIP Sandbox Enrollment Form - Form ID: MS-2025-ENR</p>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FormGenerator;