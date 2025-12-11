import React, { useState } from 'react';
import { UserSubmittedData } from '../types';

interface DataInputFormProps {
  onSubmit: (data: UserSubmittedData) => void;
  onBack: () => void;
}

const DataInputForm: React.FC<DataInputFormProps> = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState<UserSubmittedData>({
    name: '',
    age: '',
    gender: '',
    address: '',
    idNumber: '',
    email: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fillDummy = () => {
    setFormData({
      name: 'Ananya Sharma',
      age: '29',
      gender: 'Female',
      address: '123, MG Road, Bengaluru, Karnataka - 560001',
      idNumber: '99876543210',
      email: 'ananya.sharma@example.com',
      phone: '+91-9876543210'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8 animate-fade-in">
      <div className="mb-8 border-b border-gray-100 pb-4 flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Enter Claimed Identity</h2>
           <p className="text-gray-500 text-sm mt-1">Please fill in the data you wish to verify against the document.</p>
        </div>
        <button 
          type="button" 
          onClick={fillDummy} 
          className="text-sm text-mosip-blue font-medium hover:underline"
        >
          Auto-fill Demo Data
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-mosip-blue focus:ring-mosip-blue border p-2.5" placeholder="e.g. Ananya Sharma" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input required type="number" name="age" value={formData.age} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-mosip-blue focus:ring-mosip-blue border p-2.5" placeholder="e.g. 29" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-mosip-blue focus:ring-mosip-blue border p-2.5 bg-white">
              <option value="">Select...</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-mosip-blue focus:ring-mosip-blue border p-2.5" placeholder="Full Address" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number (Optional)</label>
            <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-mosip-blue focus:ring-mosip-blue border p-2.5" placeholder="Document ID Number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-mosip-blue focus:ring-mosip-blue border p-2.5" placeholder="email@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-mosip-blue focus:ring-mosip-blue border p-2.5" placeholder="+91 99999 99999" />
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <button type="button" onClick={onBack} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 font-medium hover:bg-gray-50 focus:outline-none">
            Back
          </button>
          <button type="submit" className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-bold bg-mosip-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Next: Upload Evidence
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataInputForm;