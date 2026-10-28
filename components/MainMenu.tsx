'use client';

import React from 'react';
import { Play, User, MapPin, Wrench, Trophy, HelpCircle, Sparkles, ChevronRight } from 'lucide-react';
import { CharacterId, ScenarioId, CHARACTERS, SCENARIOS } from '@/lib/gameTypes';
import { soundFX } from '@/lib/audioEngine';

interface MainMenuProps {
  characterId: CharacterId;
  scenarioId: ScenarioId;
  highScore: number;
  totalOrbs: number;
  onStartGame: () => void;
  onOpenCharacterSelect: () => void;
  onOpenScenarioSelect: () => void;
  onOpenArmory: () => void;
  onOpenStats: () => void;
  onOpenControls: () => void;
}

export function MainMenu({
  characterId,
  scenarioId,
  highScore,
  totalOrbs,
  onStartGame,
  onOpenCharacterSelect,
  onOpenScenarioSelect,
  onOpenArmory,
  onOpenStats,
  onOpenControls,
}: MainMenuProps) {
  const char = CHARACTERS[characterId];
  const scn = SCENARIOS[scenarioId];

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between items-center p-4 sm:p-8 bg-black/75 backdrop-blur-md">
      {/* Top Banner Stats */}
      <div className="w-full max-w-lg flex justify-between items-center text-xs font-orbitron">
        <div className="flex items-center gap-1.5 text-amber-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-amber-500/30">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Recorde:</span>
          <span className="font-bold tabular-nums text-amber-300">{highScore}</span>
        </div>

        <div className="flex items-center gap-1.5 text-cyan-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-cyan-500/30">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Orbs:</span>
          <span className="font-bold tabular-nums text-cyan-300">{totalOrbs}</span>
        </div>
      </div>

      {/* Hero Title Section */}
      <div className="text-center my-auto max-w-md">
        <h1 className="text-4xl sm:text-6xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400 tracking-wider neon-text-blue leading-tight">
          VELOCITY DASH
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-rajdhani uppercase tracking-[0.25em] mt-1">
          Endless Cyber Runner Pro
        </p>

        {/* Selected Config Strip */}
        <div className="grid grid-cols-2 gap-2 mt-5 text-left text-xs font-rajdhani">
          <button
            onClick={() => {
              soundFX.playButtonClick();
              onOpenCharacterSelect();
            }}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800/90 rounded-xl border border-pink-500/30 hover:border-pink-500 transition cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-pink-500/40 shrink-0 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={char.avatarImage}
                alt={char.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <span className="text-[10px] text-pink-400 font-orbitron uppercase block">Corredor</span>
              <span className="font-orbitron font-bold text-white text-xs truncate block">{char.name}</span>
            </div>
            <User className="w-4 h-4 text-pink-400 shrink-0" />
          </button>

          <button
            onClick={() => {
              soundFX.playButtonClick();
              onOpenScenarioSelect();
            }}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800/90 rounded-xl border border-amber-500/30 hover:border-amber-500 transition cursor-pointer flex items-center justify-between"
          >
            <div className="min-w-0 pr-1">
              <span className="text-[10px] text-amber-400 font-orbitron uppercase block">Cenário</span>
              <span className="font-orbitron font-bold text-white text-xs truncate block">{scn.name}</span>
            </div>
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Main Buttons Grid */}
      <div className="w-full max-w-md space-y-2.5">
        {/* Play Button */}
        <button
          onClick={() => {
            soundFX.playButtonClick();
            onStartGame();
          }}
          className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-black text-lg sm:text-xl rounded-xl shadow-lg shadow-cyan-500/40 uppercase tracking-wider transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-black stroke-none" />
          <span>Iniciar Corrida</span>
        </button>

        {/* Action Row */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              soundFX.playButtonClick();
              onOpenArmory();
            }}
            className="py-2.5 bg-slate-900/80 hover:bg-slate-800 text-emerald-400 font-orbitron font-semibold text-xs rounded-xl border border-emerald-500/30 hover:border-emerald-500 transition cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <Wrench className="w-4 h-4" />
            <span>Oficina</span>
          </button>

          <button
            onClick={() => {
              soundFX.playButtonClick();
              onOpenStats();
            }}
            className="py-2.5 bg-slate-900/80 hover:bg-slate-800 text-amber-400 font-orbitron font-semibold text-xs rounded-xl border border-amber-500/30 hover:border-amber-500 transition cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <Trophy className="w-4 h-4" />
            <span>Rankings</span>
          </button>

          <button
            onClick={() => {
              soundFX.playButtonClick();
              onOpenControls();
            }}
            className="py-2.5 bg-slate-900/80 hover:bg-slate-800 text-cyan-400 font-orbitron font-semibold text-xs rounded-xl border border-cyan-500/30 hover:border-cyan-500 transition cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Como Jogar</span>
          </button>
        </div>

        {/* Quick controls hint */}
        <p className="text-[11px] text-center text-slate-400 font-rajdhani pt-1">
          Dica: Pressione <strong className="text-cyan-300 font-orbitron">Espaço</strong> para Pular,{' '}
          <strong className="text-pink-300 font-orbitron">W</strong> para Super Pulo, e{' '}
          <strong className="text-amber-300 font-orbitron">S</strong> para Deslizar.
        </p>
      </div>
    </div>
  );
}
