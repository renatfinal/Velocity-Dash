'use client';

import React from 'react';
import { X, Shield, Magnet, TrendingUp, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { UpgradesState } from '@/lib/gameTypes';
import { soundFX } from '@/lib/audioEngine';

interface ArmoryModalProps {
  isOpen: boolean;
  orbsBalance: number;
  upgrades: UpgradesState;
  onUpgrade: (type: keyof UpgradesState, cost: number) => void;
  onClose: () => void;
}

const UPGRADE_COSTS: Record<number, number> = {
  0: 40,
  1: 100,
  2: 220,
  3: 450,
};

export function ArmoryModal({
  isOpen,
  orbsBalance,
  upgrades,
  onUpgrade,
  onClose,
}: ArmoryModalProps) {
  if (!isOpen) return null;

  const items = [
    {
      id: 'shieldDuration' as keyof UpgradesState,
      title: 'Escudo de Energia',
      desc: 'Inicia com barreira protetora que absorve colisões fatais.',
      level: upgrades.shieldDuration,
      maxLevel: 4,
      icon: <Shield className="w-5 h-5 text-sky-400" />,
      color: '#38bdf8',
    },
    {
      id: 'magnetRadius' as keyof UpgradesState,
      title: 'Ímã Quântico',
      desc: 'Aumenta o alcance de atração automática de Nano-Orbs.',
      level: upgrades.magnetRadius,
      maxLevel: 4,
      icon: <Magnet className="w-5 h-5 text-emerald-400" />,
      color: '#34d399',
    },
    {
      id: 'scoreMultiplier' as keyof UpgradesState,
      title: 'Multiplicador de Pontos',
      desc: 'Concede bônus contínuo de +25% de pontuação por nível.',
      level: upgrades.scoreMultiplier,
      maxLevel: 4,
      icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
      color: '#fbbf24',
    },
    {
      id: 'boostDuration' as keyof UpgradesState,
      title: 'Hiper Turbo Overdrive',
      desc: 'Prolonga o tempo de velocidade invulnerável das cápsulas de turbo.',
      level: upgrades.boostDuration,
      maxLevel: 4,
      icon: <Zap className="w-5 h-5 text-rose-400" />,
      color: '#f43f5e',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel-elevated rounded-2xl p-4 sm:p-6 border border-emerald-500/40 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Oficina Cibernética
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-rajdhani">
              Aprimore seus módulos cibernéticos gastando Nano-Orbs coletados
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-orbitron font-bold text-amber-300 text-sm tabular-nums">
                {orbsBalance}
              </span>
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
        </div>

        {/* Upgrades List */}
        <div className="space-y-3 my-5 max-h-[60vh] overflow-y-auto pr-1">
          {items.map((item) => {
            const isMax = item.level >= item.maxLevel;
            const cost = isMax ? 0 : UPGRADE_COSTS[item.level] || 500;
            const canAfford = orbsBalance >= cost && !isMax;

            return (
              <div
                key={item.id}
                className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-white text-sm flex items-center gap-2">
                      {item.title}
                      <span className="text-xs font-normal text-slate-400">
                        (Nvl {item.level}/{item.maxLevel})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-rajdhani mt-0.5">{item.desc}</p>

                    {/* Level Pips */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {Array.from({ length: item.maxLevel }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 w-6 rounded-full transition-colors ${
                            idx < item.level ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upgrade Button */}
                <div className="sm:self-center shrink-0">
                  {isMax ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-orbitron px-3 py-2 bg-emerald-950/40 rounded-lg border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>MAXIMIZADO</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          soundFX.playPowerUp();
                          onUpgrade(item.id, cost);
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl font-orbitron font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Aprimorar ({cost})</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
            Fechar Oficina
          </button>
        </div>
      </div>
    </div>
  );
}
