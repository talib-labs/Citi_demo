'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoStore } from '@/store/demoStore';
import { mockCreatePaymentInstrument } from '@/lib/mock-api';
import { PaymentInstrumentData } from '@/types';

function CopyChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-50 border border-gray-200 font-mono text-xs text-gray-700 hover:border-[#7AB3E8] hover:bg-[#EEF4FB] hover:text-[#003087] transition-all group"
    >
      <span className="tracking-wider">{value}</span>
      <span className="text-gray-400 group-hover:text-[#0058A0] text-xs flex-shrink-0">
        {copied ? '✓' : '⎘'}
      </span>
    </button>
  );
}

interface CardProps {
  accountId: string;
  accountName: string;
  instrument: PaymentInstrumentData | null;
  index: number;
}

function InstrumentCard({ accountId, accountName, instrument, index }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏦</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{accountName}</p>
          <p className="text-xs font-mono text-gray-400 truncate">{accountId}</p>
        </div>
        {instrument ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex-shrink-0"
          >
            Generated
          </motion.span>
        ) : (
          <motion.div
            className="w-4 h-4 rounded-full border-2 border-[#7AB3E8] border-t-[#003087] flex-shrink-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      <AnimatePresence>
        {instrument && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Account Number</p>
                <CopyChip value={instrument.inbound_achwire_payment.account_number} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Routing Number</p>
                <CopyChip value={instrument.inbound_achwire_payment.routing_number} />
              </div>
              <div className="mt-2 p-2 rounded-lg bg-[#EEF4FB] border border-[#DCE9F8] text-center">
                <p className="text-xs text-[#003087] font-medium">✓ Ready for ACH/Wire disbursement</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Step5Instruments() {
  const { selectedAccountIds, accounts, paymentInstruments, addPaymentInstrument, addApiLog, setLoading, setError, isLoading, error, setStep } =
    useDemoStore();

  const [generating, setGenerating] = useState(false);
  const generatedIds = new Set(paymentInstruments.map((pi) => pi.account_id));

  const STEP = 4;

  function getLabel(id: string) {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return id;
    return `${acc.liability.name} ••••${acc.liability.mask}`;
  }

  async function handleGenerate() {
    setGenerating(true);
    setLoading(true);
    setError(null);

    for (const accountId of selectedAccountIds) {
      if (generatedIds.has(accountId)) continue;
      try {
        const { data: resp, log } = await mockCreatePaymentInstrument(accountId, STEP);
        addApiLog(log);
        addPaymentInstrument(resp.data);
      } catch {
        setError(`Failed for ${accountId}`);
      }
    }

    setLoading(false);
    setGenerating(false);
  }

  const allDone = selectedAccountIds.every((id) => generatedIds.has(id));

  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Payment Instruments</h2>
          <p className="text-sm text-gray-500 mt-1">
            Generate unique ACH/Wire routing details for each selected liability.
          </p>
        </div>

        <div className="space-y-3 mb-4">
          {selectedAccountIds.map((id, idx) => (
            <InstrumentCard
              key={id}
              accountId={id}
              accountName={getLabel(id)}
              instrument={paymentInstruments.find((pi) => pi.account_id === id) || null}
              index={idx}
            />
          ))}
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}

        {!allDone ? (
          <button
            onClick={handleGenerate}
            disabled={isLoading || generating}
            className="w-full py-3 rounded-xl bg-[#003087] hover:bg-[#002570] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-md shadow-blue-200 active:scale-95"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating Instruments…
              </span>
            ) : (
              `Generate ${selectedAccountIds.length} Payment Instrument${selectedAccountIds.length !== 1 ? 's' : ''} →`
            )}
          </button>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
              <p className="text-green-700 font-semibold text-sm">
                ✅ {paymentInstruments.length} payment instrument{paymentInstruments.length !== 1 ? 's' : ''} ready
              </p>
              <p className="text-xs text-green-600 mt-1">All accounts have unique ACH/Wire routing info</p>
            </div>
            <button
              onClick={() => setStep(5)}
              className="w-full py-3 rounded-xl bg-[#003087] hover:bg-[#002570] text-white font-semibold text-sm transition-all shadow-md shadow-blue-200 active:scale-95"
            >
              Disburse Funds →
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
