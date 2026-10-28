'use client';

import React from 'react';
import { X, Check, MapPin, AlertTriangle, Flame, Trees, Car, Sun, Trophy } from 'lucide-react';
import { ScenarioId, SCENARIOS, ScenarioDef } from '@/lib/gameTypes';
import { soundFX } from '@/lib/audioEngine';

interface ScenarioSelectModalProps {
  isOpen: boolean;
  selectedId: ScenarioId;
  onSelect: (id: ScenarioId) => void;
  onClose: () => void;
}

export function ScenarioSelectModal({
  isOpen,
  selectedId,
  onSelect,
  onClose,
}: ScenarioSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-2xl p-4 sm:p-6 border border-amber-500/40 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
              Setores & Cenários
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-rajdhani">
              Selecione o bioma para sua corrida com física, obstáculos e estética exclusivos
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

        {/* Scenarios List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-5 max-h-[62vh] overflow-y-auto pr-1">
          {Object.values(SCENARIOS).map((scn) => {
            const isSelected = scn.id === selectedId;
            return (
              <ScenarioCard
                key={scn.id}
                scenario={scn}
                isSelected={isSelected}
                onSelect={() => {
                  soundFX.playButtonClick();
                  onSelect(scn.id);
                }}
              />
            );
          })}
        </div>

        {/* Footer Confirmation */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={() => {
              soundFX.playButtonClick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-orbitron font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Confirmar Cenário
          </button>
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  isSelected,
  onSelect,
}: {
  scenario: ScenarioDef;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const getIcon = () => {
    switch (scenario.id) {
      case 'desert':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'track':
        return <Trophy className="w-5 h-5 text-rose-400" />;
      case 'road':
        return <Car className="w-5 h-5 text-cyan-400" />;
      case 'forest':
        return <Trees className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-slate-900/90 border-amber-400 ring-2 ring-amber-500/30'
          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
      }`}
    >
      <div>
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-white text-sm">{scenario.name}</h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{scenario.location}</span>
              </div>
            </div>
          </div>

          <span
            className="text-[10px] font-orbitron px-2 py-0.5 rounded border uppercase shrink-0"
            style={{
              borderColor: `${scenario.accentHex}40`,
              color: scenario.accentHex,
              backgroundColor: `${scenario.accentHex}10`,
            }}
          >
            {scenario.difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 font-rajdhani mt-2.5 line-clamp-2">
          {scenario.description}
        </p>

        {/* Hazards Preview */}
        <div className="mt-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1 text-[11px] font-orbitron text-slate-400 mb-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Perigos no Caminho</span>
          </div>
          <div className="flex flex-wrap gap-1 text-[11px] text-slate-300">
            {scenario.hazards.map((hz, idx) => (
              <span key={idx} className="bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                {hz}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mini Color Strip representing the environment */}
      <div className="mt-3 h-1.5 w-full rounded-full overflow-hidden flex">
        <div className="flex-1" style={{ backgroundColor: scenario.skyColors[0] }} />
        <div className="flex-1" style={{ backgroundColor: scenario.skyColors[1] }} />
        <div className="flex-1" style={{ backgroundColor: scenario.skyColors[2] }} />
        <div className="flex-1" style={{ backgroundColor: scenario.groundColor }} />
      </div>
    </div>
  );
}
