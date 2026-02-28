'use client';

import { useDemoStore } from '@/store/demoStore';

export default function Header() {
  const { reset } = useDemoStore();

  return (
    <header className="h-14 flex-shrink-0 bg-[#003087] flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-3">
        {/* Citi wordmark */}
        <div className="flex items-center gap-1">
          <span className="text-white font-black text-lg tracking-tight">citi</span>
          <div className="w-2 h-2 rounded-full bg-[#E31837] ml-0.5" />
        </div>
        <div className="w-px h-5 bg-white/20" />
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs">powered by</span>
          <div className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://avatars.githubusercontent.com/u/66761576?s=32&v=4"
              alt="Method"
              className="w-5 h-5 rounded"
            />
            <span className="text-white/80 text-xs font-semibold">Method</span>
          </div>
        </div>
        <div className="w-px h-5 bg-white/20" />
        <span className="text-white/70 text-sm">Debt Disbursement — API Flow Demo</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/80 font-medium">Sandbox Mode</span>
        </div>
        <button
          onClick={reset}
          className="text-xs text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          Reset Demo
        </button>
      </div>
    </header>
  );
}
