'use client';

import React from 'react';
import { X, ArrowUp, ArrowDown, Hand, Keyboard, Smartphone, Sparkles, Shield, Zap, Magnet } from 'lucide-react';
import { soundFX } from '@/lib/audioEngine';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ControlsModal({ isOpen, onClose }: ControlsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel-elevated rounded-2xl p-4 sm:p-6 border border-cyan-500/40 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
              Manual de Pilotagem
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-rajdhani">
              Domine os controles de corrida para ultrapassar qualquer obstáculo
            </p>
          </div>
          <button
            onClick={() => {
              soundFX.playButtonClick();
              onClose();
            }}
            aria-label="Fechar"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Controls Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Keyboard */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-orbitron font-bold text-xs mb-3">
                <Keyboard className="w-4 h-4" />
                <span>Teclado (Computador)</span>
              </div>
              <ul className="space-y-2 text-xs font-rajdhani text-slate-300">
                <li className="flex items-center justify-between">
                  <span>Pulo Normal:</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-orbitron text-cyan-300">Espaço</kbd>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-orbitron text-cyan-300">↑</kbd>
                  </div>
                </li>
                <li className="flex items-center justify-between">
                  <span>Super Pulo (Alto):</span>
                  <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-orbitron text-pink-300">W</kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>Agachar / Deslizar:</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-orbitron text-amber-300">↓</kbd>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-orbitron text-amber-300">S</kbd>
                  </div>
                </li>
                <li className="flex items-center justify-between">
                  <span>Pausar / Retomar:</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-orbitron">P</kbd>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-orbitron">Esc</kbd>
                  </div>
                </li>
              </ul>
            </div>

            {/* Touch / Mobile */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-pink-400 font-orbitron font-bold text-xs mb-3">
                <Smartphone className="w-4 h-4" />
                <span>Toque & Gestos (Mobile)</span>
              </div>
              <ul className="space-y-2 text-xs font-rajdhani text-slate-300">
                <li className="flex items-center justify-between">
                  <span>Pulo Normal:</span>
                  <span className="text-cyan-300 font-orbitron text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">1 Toque na Tela</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Super Pulo:</span>
                  <span className="text-pink-300 font-orbitron text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">2 Toques Rápidos</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Agachar / Deslizar:</span>
                  <span className="text-amber-300 font-orbitron text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Deslizar o Dedo ↓</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Botões em Tela:</span>
                  <span className="text-slate-400 font-orbitron text-[11px]">Disponíveis na base</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Power-ups Guide */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
            <h4 className="font-orbitron font-bold text-xs text-white uppercase tracking-wider mb-2.5">
              Itens Especiais em Pista
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-orbitron font-bold text-sky-300 block text-[11px]">Escudo</span>
                  <span className="text-slate-400 text-[11px] leading-tight block">Protege contra 1 batida letal.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <Magnet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-orbitron font-bold text-emerald-300 block text-[11px]">Ímã Quântico</span>
                  <span className="text-slate-400 text-[11px] leading-tight block">Atrai todos os orbs próximos.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <Zap className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-orbitron font-bold text-rose-300 block text-[11px]">Hiper Turbo</span>
                  <span className="text-slate-400 text-[11px] leading-tight block">Velocidade máxima invulnerável!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundFX.playButtonClick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-orbitron font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
