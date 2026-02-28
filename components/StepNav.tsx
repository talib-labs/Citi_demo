'use client';

import { motion } from 'framer-motion';
import { useDemoStore } from '@/store/demoStore';

const STEPS = [
  { label: 'Create Entity', icon: '👤', description: 'Borrower onboarding' },
  { label: 'Connect Liabilities', icon: '🔗', description: 'Discover accounts' },
  { label: 'Retrieve Accounts', icon: '📋', description: 'Review & select' },
  { label: 'Subscribe Updates', icon: '🔔', description: 'Webhooks & subscriptions' },
  { label: 'Payment Instruments', icon: '🏦', description: 'Generate routing' },
  { label: 'Disburse Funds', icon: '💸', description: 'Create payment' },
];

export default function StepNav() {
  const { currentStep } = useDemoStore();


  return (
    <div className="h-full bg-white border-t border-gray-200 flex items-center px-4">
      <div className="flex items-center w-full">
        {STEPS.map((step, idx) => {
          const active = idx === currentStep;
          const completed = idx < currentStep;

          return (
            <div key={idx} className="flex items-center flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                {/* Circle */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                      active
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                        : completed
                          ? 'bg-indigo-100 border-indigo-400 text-indigo-700'
                          : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}
                    animate={active ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {completed ? '✓' : idx + 1}
                  </motion.div>
                  {active && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-indigo-400 opacity-30"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Label — hide on smaller viewports */}
                <div className="hidden lg:block min-w-0">
                  <p className={`text-xs font-semibold truncate leading-none ${active ? 'text-indigo-700' : completed ? 'text-indigo-500' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400 truncate leading-tight mt-0.5">{step.description}</p>
                </div>
              </div>

              {/* Connector */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className="h-0.5 bg-gray-200 relative overflow-hidden rounded-full">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-indigo-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: completed ? '100%' : '0%' }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
