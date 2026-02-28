'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useDemoStore } from '@/store/demoStore';
import ApiInspector from './ApiInspector';
import StepNav from './StepNav';
import Step1Entity from './steps/Step1Entity';
import Step2Connect from './steps/Step2Connect';
import Step3Accounts from './steps/Step3Accounts';
import Step4Subscribe from './steps/Step4Subscribe';
import Step5Instruments from './steps/Step5Instruments';
import Step6Payment from './steps/Step6Payment';

const STEPS = [Step1Entity, Step2Connect, Step3Accounts, Step4Subscribe, Step5Instruments, Step6Payment];

export default function DemoShell() {
  const { currentStep } = useDemoStore();
  const StepComponent = STEPS[currentStep];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Split screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Lending Funnel (55%) */}
        <div className="w-[55%] flex flex-col bg-white border-r border-gray-200 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex-1 overflow-hidden"
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right — API Inspector (45%) */}
        <div className="w-[45%] flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex-1 overflow-hidden"
            >
              <ApiInspector />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom step nav */}
      <div className="h-20 flex-shrink-0">
        <StepNav />
      </div>
    </div>
  );
}
