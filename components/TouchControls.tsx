'use client';

import React from 'react';
import { ArrowUp, ArrowDown, ChevronsUp } from 'lucide-react';

interface TouchControlsProps {
  onJump: (power: 1 | 2) => void;
  onDuck: (enable: boolean) => void;
}

export function TouchControls({ onJump, onDuck }: TouchControlsProps) {
  return (
    <div className="absolute bottom-3 left-0 w-full px-4 z-20 flex justify-between items-end pointer-events-none">
      {/* Left thumb: Duck / Slide Button */}
      <div className="pointer-events-auto">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onDuck(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onDuck(false);
          }}
          onMouseDown={() => onDuck(true)}
          onMouseUp={() => onDuck(false)}
          onMouseLeave={() => onDuck(false)}
          aria-label="Agachar ou Deslizar"
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-900/85 active:bg-amber-600/60 border-2 border-amber-500/50 text-amber-300 active:scale-95 transition-transform flex flex-col items-center justify-center shadow-lg shadow-black/50 select-none cursor-pointer"
        >
          <ArrowDown className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          <span className="text-[10px] font-orbitron font-bold uppercase mt-0.5">Deslizar</span>
        </button>
      </div>

      {/* Right thumbs: Jump and Super Jump */}
      <div className="pointer-events-auto flex gap-3">
        {/* Normal Jump */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJump(1);
          }}
          onClick={() => onJump(1)}
          aria-label="Pulo Normal"
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-900/85 active:bg-cyan-600/60 border-2 border-cyan-500/50 text-cyan-300 active:scale-95 transition-transform flex flex-col items-center justify-center shadow-lg shadow-black/50 select-none cursor-pointer"
        >
          <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          <span className="text-[10px] font-orbitron font-bold uppercase mt-0.5">Pulo</span>
        </button>

        {/* Super Jump */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJump(2);
          }}
          onClick={() => onJump(2)}
          aria-label="Super Pulo Alto"
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-pink-900/80 to-slate-900/90 active:from-pink-600/80 active:to-slate-900 border-2 border-pink-500/60 text-pink-300 active:scale-95 transition-transform flex flex-col items-center justify-center shadow-lg shadow-pink-500/20 select-none cursor-pointer"
        >
          <ChevronsUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          <span className="text-[9px] font-orbitron font-bold uppercase mt-0.5">Super Pulo</span>
        </button>
      </div>
    </div>
  );
}
