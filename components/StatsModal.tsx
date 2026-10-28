'use client';

import React, { useState } from 'react';
import { X, Trophy, Flame, Sparkles, Award, Trash2 } from 'lucide-react';
import { RunRecord, CHARACTERS, SCENARIOS } from '@/lib/gameTypes';
import { soundFX } from '@/lib/audioEngine';

interface StatsModalProps {
  isOpen: boolean;
  history: RunRecord[];
  highScore: number;
  totalOrbs: number;
  onClearStats: () => void;
  onClose: () => void;
}

export function StatsModal({
  isOpen,
  history,
  highScore,
  totalOrbs,
  onClearStats,
  onClose,
}: StatsModalProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'achievements'>('history');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const totalRuns = history.length;
  const maxLevel = history.reduce((max, r) => Math.max(max, r.level), 1);
  const maxCombo = history.reduce((max, r) => Math.max(max, r.maxCombo || 0), 0);

  const achievements = [
    {
      id: 'first_run',
      title: 'Primeira Arrancada',
      desc: 'Complete sua primeira corrida no Velocity Dash.',
      done: totalRuns >= 1,
    },
    {
      id: 'lvl_5',
      title: 'Hiper-Velocidade',
      desc: 'Alcance o Nível 5 em uma única corrida.',
      done: maxLevel >= 5,
    },
    {
      id: 'score_1000',
      title: 'Milestone Cibernético',
      desc: 'Ultrapasse 1.000 pontos em uma corrida.',
      done: highScore >= 1000,
    },
    {
      id: 'combo_10',
      title: 'Mestre do Combo',
      desc: 'Realize uma sequência contínua de 10x combo.',
      done: maxCombo >= 10,
    },
    {
      id: 'orbs_100',
      title: 'Caçador de Dados',
      desc: 'Acumule mais de 100 Nano-Orbs.',
      done: totalOrbs >= 100,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-2xl p-4 sm:p-6 border border-cyan-500/40 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Estatísticas & Conquistas
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-rajdhani">
              Histórico operacional de corridas e medalhas desbloqueadas
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

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-[11px] text-slate-400 font-orbitron uppercase">Total Corridas</span>
            <span className="text-xl font-orbitron font-bold text-white tabular-nums mt-0.5">{totalRuns}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-[11px] text-amber-400 font-orbitron uppercase">Recorde</span>
            <span className="text-xl font-orbitron font-bold text-amber-300 tabular-nums mt-0.5">{highScore}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-[11px] text-rose-400 font-orbitron uppercase">Maior Nível</span>
            <span className="text-xl font-orbitron font-bold text-rose-400 tabular-nums mt-0.5">LVL {maxLevel}</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col">
            <span className="text-[11px] text-cyan-400 font-orbitron uppercase">Nano-Orbs</span>
            <span className="text-xl font-orbitron font-bold text-cyan-300 tabular-nums mt-0.5">{totalOrbs}</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
          <button
            onClick={() => {
              soundFX.playButtonClick();
              setActiveTab('history');
            }}
            className={`px-3 py-1.5 text-xs font-orbitron font-semibold rounded-lg transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Últimas Corridas
          </button>
          <button
            onClick={() => {
              soundFX.playButtonClick();
              setActiveTab('achievements');
            }}
            className={`px-3 py-1.5 text-xs font-orbitron font-semibold rounded-lg transition cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Conquistas ({achievements.filter((a) => a.done).length}/{achievements.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[220px] max-h-[45vh] overflow-y-auto pr-1">
          {activeTab === 'history' ? (
            history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 text-xs">
                <Trophy className="w-8 h-8 stroke-1 mb-2 opacity-50" />
                <p>Nenhuma corrida registrada ainda.</p>
                <p>Inicie sua primeira arrancada no menu principal!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-rajdhani">
                  <thead className="text-slate-400 border-b border-slate-800 text-[11px] uppercase font-orbitron">
                    <tr>
                      <th className="pb-2">Data</th>
                      <th className="pb-2">Corredor</th>
                      <th className="pb-2">Cenário</th>
                      <th className="pb-2">Nível</th>
                      <th className="pb-2">Orbs</th>
                      <th className="pb-2 text-right">Pontos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/60 transition">
                        <td className="py-2.5 text-slate-400">{item.date}</td>
                        <td className="py-2.5 font-orbitron text-xs text-white">
                          {CHARACTERS[item.characterId]?.name || 'Kai'}
                        </td>
                        <td className="py-2.5 text-cyan-400 font-semibold">
                          {SCENARIOS[item.scenarioId]?.name || item.scenarioId}
                        </td>
                        <td className="py-2.5 text-rose-400 font-orbitron font-bold">LVL {item.level}</td>
                        <td className="py-2.5 text-amber-300 tabular-nums">{item.orbs}</td>
                        <td className="py-2.5 text-right font-orbitron font-bold text-yellow-400 tabular-nums">
                          {item.score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="space-y-2.5">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    ach.done
                      ? 'bg-slate-900/80 border-amber-500/40'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        ach.done ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-orbitron font-bold text-white text-xs">{ach.title}</h4>
                      <p className="text-xs text-slate-400 font-rajdhani mt-0.5">{ach.desc}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-orbitron px-2 py-0.5 rounded uppercase shrink-0 ${
                      ach.done
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {ach.done ? 'Concluído' : 'Bloqueado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Clear Data */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400 font-orbitron">Confirmar exclusão?</span>
              <button
                onClick={() => {
                  soundFX.playButtonClick();
                  onClearStats();
                  setConfirmClear(false);
                }}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-orbitron text-[11px] rounded transition cursor-pointer"
              >
                Sim, Limpar
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-orbitron text-[11px] rounded transition cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-xs text-red-400/80 hover:text-red-400 flex items-center gap-1 font-orbitron transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Dados</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFX.playButtonClick();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-orbitron font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
