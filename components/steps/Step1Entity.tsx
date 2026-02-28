'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDemoStore } from '@/store/demoStore';
import { mockCreateEntity } from '@/lib/mock-api';
import { BorrowerFormData } from '@/types';

const DEFAULT: BorrowerFormData = {
  first_name: 'Kevin',
  last_name: 'Doyle',
  phone: '+15121231113',
  dob: '1997-03-18',
  email: 'kevin.doyle@gmail.com',
  ssn: '123456789',
  line1: '3300 N Interstate 35',
  line2: '',
  city: 'Austin',
  state: 'TX',
  zip: '78705',
};

function Field({
  label, name, value, onChange, type = 'text', placeholder, required, mono,
}: {
  label: string;
  name: keyof BorrowerFormData;
  value: string;
  onChange: (n: keyof BorrowerFormData, v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent bg-white transition-shadow ${mono ? 'font-mono tracking-widest' : ''}`}
      />
    </div>
  );
}

export default function Step1Entity() {
  const { setEntity, addApiLog, setLoading, setError, isLoading, error, setStep, entity } =
    useDemoStore();
  const [form, setForm] = useState<BorrowerFormData>(DEFAULT);

  function handleChange(name: keyof BorrowerFormData, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const { data, log } = await mockCreateEntity(form);
      addApiLog(log);
      setEntity(data);
    } catch {
      setError('Failed to create entity');
    } finally {
      setLoading(false);
    }
  }

  if (entity) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center p-8"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">Entity Created</h3>
        <p className="text-sm text-gray-500 mb-3">
          {entity.individual.first_name} {entity.individual.last_name}
        </p>
        <div className="px-3 py-1.5 rounded-full bg-[#EEF4FB] border border-[#B8D4F0] text-xs font-mono text-[#003087]">
          {entity.id}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
          Review the API request &amp; response in the panel on the right, then continue.
        </p>
        <button
          onClick={() => setStep(1)}
          className="mt-4 px-6 py-2.5 rounded-xl bg-[#003087] hover:bg-[#002570] text-white font-semibold text-sm transition-all shadow-md shadow-blue-200 active:scale-95"
        >
          Continue to Connect Liabilities →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Borrower Onboarding</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create a verified entity for the borrower in Method&apos;s system.
          </p>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 mb-4">
          <span className="text-blue-500 flex-shrink-0 mt-0.5">ℹ️</span>
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">Note:</span> Citi will pass this borrower data via API — no manual user input required in production.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required />
            <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required />
          </div>
          <Field label="Email" name="email" value={form.email} onChange={handleChange} type="email" required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
            <Field label="Date of Birth" name="dob" value={form.dob} onChange={handleChange} type="date" required />
          </div>
          <Field label="SSN" name="ssn" value={form.ssn} onChange={handleChange} placeholder="9-digit SSN" mono required />

          <div className="pt-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Address</p>
            <div className="space-y-3">
              <Field label="Address Line 1" name="line1" value={form.line1} onChange={handleChange} required />
              <Field label="Address Line 2" name="line2" value={form.line2} onChange={handleChange} placeholder="Optional" />
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Field label="City" name="city" value={form.city} onChange={handleChange} required />
                </div>
                <Field label="State" name="state" value={form.state} onChange={handleChange} placeholder="TX" required />
                <Field label="ZIP" name="zip" value={form.zip} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </motion.div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#003087] hover:bg-[#002570] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-md shadow-blue-200 active:scale-95"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Entity…
              </span>
            ) : (
              'Create Borrower →'
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          Pre-filled with demo data — all fields are editable
        </p>
      </motion.div>
    </div>
  );
}
