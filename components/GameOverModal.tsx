'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Wrench, Trophy, Sparkles, Flame } from 'lucide-react';
import { soundFX } from '@/lib/audioEngine';

import { CharacterId, CHARACTERS } from '@/lib/gameTypes';

interface GameOverModalProps {
  isOpen: boolean;
  characterId: CharacterId;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  level: number;
  orbs: number;
  maxCombo: number;
  onRestart: () => void;
  onGoHome: () => void;
  onOpenArmory: () => void;
}

export function GameOverModal({
  isOpen,
  characterId,
  score,
  highScore,
  isNewHighScore,
  level,
  orbs,
  maxCombo,
  onRestart,
  onGoHome,
  onOpenArmory,
}: GameOverModalProps) {
  useEffect(() => {
    if (isOpen && isNewHighScore) {
      // Fire festive cyber confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ff0055', '#ffd700', '#39ff14'],
      });
    }
  }, [isOpen, isNewHighScore]);

  if (!isOpen) return null;

  const char = CHARACTERS[characterId];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm glass-panel-elevated rounded-2xl p-5 sm:p-7 border border-red-500/50 text-center my-auto">
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-orbitron font-black text-rose-500 neon-text-pink tracking-wider">
          FIM DE JOGO
        </h2>

        {/* Character Badge */}
        <div className="flex items-center justify-center gap-2 mt-1 mb-2">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-700 shadow-sm shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={char?.avatarImage}
              alt={char?.name || ''}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <span className="text-xs font-orbitron font-semibold text-slate-300">
            {char?.name} · {char?.tagline}
          </span>
        </div>

        {isNewHighScore && (
          <div className="my-3 py-1.5 px-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 animate-pulse">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>NOVO RECORDE HISTÓRICO!</span>
          </div>
        )}

        {/* Stats card */}
        <div className="my-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5 text-xs font-rajdhani">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 font-orbitron uppercase text-[11px]">Pontuação Final</span>
            <span className="text-2xl font-orbitron font-black text-cyan-400 tabular-nums">
              {score}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Recorde Máximo:</span>
            <span className="font-orbitron font-bold text-amber-400 tabular-nums text-sm">
              {highScore}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Nível Alcançado:</span>
            <span className="font-orbitron font-bold text-rose-400 text-sm">
              LVL {level}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Nano-Orbs Coletados:</span>
            <span className="font-orbitron font-bold text-amber-300 flex items-center gap-1 text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{orbs}</span>
            </span>
          </div>

          {maxCombo > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Maior Sequência Combo:</span>
              <span className="font-orbitron font-bold text-emerald-400 flex items-center gap-1 text-sm">
                <Flame className="w-3.5 h-3.5" />
                <span>{maxCombo}x</span>
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => {
              soundFX.playButtonClick();
              onRestart();
            }}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Jogar Novamente</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundFX.playButtonClick();
                onOpenArmory();
              }}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-orbitron font-semibold text-xs rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Oficina</span>
            </button>

            <button
              onClick={() => {
                soundFX.playButtonClick();
                onGoHome();
              }}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-orbitron font-semibold text-xs rounded-xl border border-slate-700 hover:border-slate-600 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
