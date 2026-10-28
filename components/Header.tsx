'use client';

import React from 'react';
import { Play, Sparkles } from 'lucide-react';
import { soundFX } from '@/lib/audioEngine';

interface HeaderProps {
  orbsBalance: number;
  onOpenCharacterSelect: () => void;
  onOpenScenarioSelect: () => void;
  onOpenArmory: () => void;
  onOpenStats: () => void;
  onOpenControls: () => void;
  onPlayClick: () => void;
  isPlaying: boolean;
}

export function Header({
  orbsBalance,
  onOpenCharacterSelect,
  onOpenScenarioSelect,
  onOpenArmory,
  onOpenStats,
  onOpenControls,
  onPlayClick,
  isPlaying,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3 border-b border-slate-800 bg-[#070913]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <span className="text-base sm:text-lg font-orbitron font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 whitespace-nowrap shrink-0">
        VELOCITY DASH
      </span>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-orbitron font-semibold text-slate-400">
        <button
          onClick={() => {
            soundFX.playButtonClick();
            onOpenCharacterSelect();
          }}
          className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Corredores
        </button>
        <button
          onClick={() => {
            soundFX.playButtonClick();
            onOpenScenarioSelect();
          }}
          className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Cenários
        </button>
        <button
          onClick={() => {
            soundFX.playButtonClick();
            onOpenArmory();
          }}
          className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Oficina
        </button>
        <button
          onClick={() => {
            soundFX.playButtonClick();
            onOpenStats();
          }}
          className="hover:text-yellow-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Rankings
        </button>
        <button
          onClick={() => {
            soundFX.playButtonClick();
            onOpenControls();
          }}
          className="hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Controles
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-orbitron text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="tabular-nums font-bold">{orbsBalance}</span>
        </div>

        <button
          onClick={() => {
            soundFX.playButtonClick();
            onPlayClick();
          }}
          className="px-4 py-1.5 text-xs font-orbitron font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
        >
          <Play className="w-3.5 h-3.5 fill-black stroke-none" />
          <span>{isPlaying ? 'Reiniciar' : 'Jogar Agora'}</span>
        </button>
      </div>
    </header>
  );
}
