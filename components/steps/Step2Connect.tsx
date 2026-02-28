'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoStore } from '@/store/demoStore';
import { mockConnectLiabilities } from '@/lib/mock-api';

const INSTITUTIONS = [
  { name: 'Aidvantage', icon: '🎓', delay: 0 },
  { name: 'Chase Bank', icon: '🏦', delay: 0.15 },
  { name: 'Toyota Financial', icon: '🚗', delay: 0.3 },
  { name: 'Wells Fargo', icon: '🏠', delay: 0.45 },
  { name: 'SoFi', icon: '💰', delay: 0.6 },
  { name: 'American Express', icon: '💳', delay: 0.75 },
];

function ScanningAnimation({ phase }: { phase: 'scanning' | 'done' }) {
  return (
    <div className="py-6 space-y-2.5">
      {INSTITUTIONS.map((inst, idx) => (
        <motion.div
          key={inst.name}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.12 }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-gray-100 shadow-sm"
        >
          <span className="text-lg">{inst.icon}</span>
          <span className="text-sm text-gray-700 flex-1">{inst.name}</span>
          {phase === 'done' ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.08 + 0.1, type: 'spring', stiffness: 300 }}
              className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
            >
              <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.span>
          ) : (
            <motion.div
              className="w-4 h-4 rounded-full border-2 border-indigo-300 border-t-indigo-600 flex-shrink-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear', delay: idx * 0.1 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default function Step2Connect() {
  const { entityId, setAccountIds, addApiLog, setLoading, setError, isLoading, error, setStep, accountIds } =
    useDemoStore();
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle');

  async function handleConnect() {
    if (!entityId) return;
    setLoading(true);
    setError(null);
    setPhase('scanning');
    try {
      const { data, log } = await mockConnectLiabilities(entityId);
      addApiLog(log);
      setPhase('done');
      setAccountIds(data.accounts);
    } catch {
      setError('Failed to connect accounts');
      setPhase('idle');
    } finally {
      setLoading(false);
    }
  }

  if (accountIds.length > 0 && phase === 'idle') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center p-8"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">Accounts Connected</h3>
        <p className="text-sm text-gray-500">{accountIds.length} liabilities discovered</p>
      </motion.div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Connect Liabilities</h2>
          <p className="text-sm text-gray-500 mt-1">
            Scan and connect to the borrower&apos;s existing liability accounts across institutions.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === 'idle' ? (
              <motion.div key="idle" className="p-8 text-center" exit={{ opacity: 0, y: -8 }}>
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔗</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Connect</h3>
                <p className="text-sm text-gray-500 mb-1">
                  Method will search for all liability accounts linked to:
                </p>
                <code className="text-xs bg-indigo-50 border border-indigo-100 px-2 py-1 rounded font-mono text-indigo-700">
                  {entityId}
                </code>
                <div className="mt-6">
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-200 active:scale-95"
                  >
                    Connect Accounts →
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="scanning" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5">
                <div className="text-center mb-2">
                  {phase === 'done' ? (
                    <p className="text-sm font-semibold text-green-700">✅ {INSTITUTIONS.length} accounts found</p>
                  ) : (
                    <p className="text-sm font-semibold text-gray-700 animate-pulse">Scanning institutions…</p>
                  )}
                </div>
                <ScanningAnimation phase={phase === 'done' ? 'done' : 'scanning'} />
                {phase === 'done' && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-center space-y-2">
                    <p className="text-xs text-gray-400">Review the API response on the right, then continue.</p>
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-200 active:scale-95"
                    >
                      Continue to Retrieve Accounts →
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
