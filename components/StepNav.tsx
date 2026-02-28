'use client';

import { motion } from 'framer-motion';
import { useDemoStore } from '@/store/demoStore';

const STEPS = [
  'Create Entity',
  'Connect Liabilities',
  'Retrieve Accounts',
  'Subscribe Updates',
  'Payment Instruments',
  'Disburse Funds',
];

export default function StepNav() {
  const { currentStep } = useDemoStore();

  return (
    <div className="h-full bg-white border-t border-gray-200 flex flex-col justify-center px-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[#003087]">{STEPS[currentStep]}</span>
        <span className="text-xs text-gray-400">Step {currentStep + 1} of {STEPS.length}</span>
      </div>
      <div className="flex gap-1.5">
        {STEPS.map((_, idx) => (
          <div key={idx} className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-[#003087]"
              initial={false}
              animate={{ width: idx <= currentStep ? '100%' : '0%' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
