'use client';

import React from 'react';
import { Pause, Play, Volume2, VolumeX, Shield, Zap, Magnet, Sparkles, Maximize2, Minimize2 } from 'lucide-react';

interface GameHUDProps {
  score: number;
  highScore: number;
  level: number;
  speed: number;
  orbs: number;
  combo: number;
  activePowerUp: 'shield' | 'magnet' | 'boost' | null;
  powerUpDurationRatio: number;
  isPaused: boolean;
  soundEnabled: boolean;
  isFullscreen?: boolean;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onToggleFullScreen?: () => void;
}

export function GameHUD({
  score,
  highScore,
  level,
  speed,
  orbs,
  combo,
  activePowerUp,
  powerUpDurationRatio,
  isPaused,
  soundEnabled,
  isFullscreen,
  onTogglePause,
  onToggleSound,
  onToggleFullScreen,
}: GameHUDProps) {
  return (
    <div className="absolute top-0 left-0 w-full p-3 sm:p-5 z-20 flex justify-between items-start pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent">
      {/* Left side: Score and Highscore */}
      <div className="flex flex-col gap-1 pointer-events-auto">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs text-cyan-400 font-orbitron tracking-widest uppercase">
              Pontuação
            </span>
            <span className="text-2xl sm:text-3xl font-orbitron font-black text-white tabular-nums neon-text-blue leading-none">
              {String(score).padStart(6, '0')}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs text-amber-400 font-orbitron tracking-widest uppercase">
              Recorde
            </span>
            <span className="text-lg sm:text-xl font-orbitron font-bold text-amber-300 tabular-nums leading-none">
              {String(highScore).padStart(6, '0')}
            </span>
          </div>
        </div>

        {/* Orbs and Combo counter */}
        <div className="flex items-center gap-3 mt-1 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-orbitron font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="tabular-nums">{orbs}</span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1 text-emerald-400 font-orbitron font-bold animate-pulse">
              <span>{combo}x COMBO!</span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Power-up active indicator if any */}
      {activePowerUp && (
        <div className="pointer-events-auto flex flex-col items-center bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-orbitron font-bold uppercase">
            {activePowerUp === 'shield' && (
              <>
                <Shield className="w-4 h-4 text-sky-400" />
                <span className="text-sky-300">Escudo Ativo</span>
              </>
            )}
            {activePowerUp === 'magnet' && (
              <>
                <Magnet className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Ímã de Orbs</span>
              </>
            )}
            {activePowerUp === 'boost' && (
              <>
                <Zap className="w-4 h-4 text-rose-400" />
                <span className="text-rose-300">Turbo Overdrive</span>
              </>
            )}
          </div>
          {activePowerUp !== 'shield' && (
            <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  activePowerUp === 'boost' ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, powerUpDurationRatio * 100))}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Right side: Level, Speed, Audio & Pause buttons */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        <div className="flex flex-col items-end">
          <span className="text-[10px] sm:text-xs text-rose-400 font-orbitron tracking-widest uppercase">
            Nível
          </span>
          <span className="text-lg sm:text-xl font-orbitron font-black text-rose-400 leading-none">
            LVL {level}
          </span>
        </div>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] sm:text-xs text-emerald-400 font-orbitron tracking-widest uppercase">
            Velocidade
          </span>
          <span className="text-sm sm:text-base font-orbitron font-bold text-emerald-400 tabular-nums leading-none">
            {speed.toFixed(1)}x
          </span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
          className="p-2 sm:p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 transition cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Fullscreen Button */}
        {onToggleFullScreen && (
          <button
            onClick={onToggleFullScreen}
            aria-label={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
            className="p-2 sm:p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}

        {/* Pause Button */}
        <button
          onClick={onTogglePause}
          aria-label={isPaused ? 'Continuar Jogo' : 'Pausar Jogo'}
          className="p-2 sm:p-2.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded-lg border border-cyan-500/40 transition cursor-pointer"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
