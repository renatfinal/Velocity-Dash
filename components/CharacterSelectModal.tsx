'use client';

import React from 'react';
import { X, Check, Zap, Gauge, Wind } from 'lucide-react';
import { CharacterId, CHARACTERS, CharacterDef } from '@/lib/gameTypes';
import { soundFX } from '@/lib/audioEngine';

interface CharacterSelectModalProps {
  isOpen: boolean;
  selectedId: CharacterId;
  onSelect: (id: CharacterId) => void;
  onClose: () => void;
}

export function CharacterSelectModal({
  isOpen,
  selectedId,
  onSelect,
  onClose,
}: CharacterSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-2xl p-4 sm:p-6 border border-cyan-500/40 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
              Hangar de Corredores
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-rajdhani">
              Escolha seu corredor cibernético com atributos e vantagens únicas
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

        {/* Characters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-5 max-h-[62vh] overflow-y-auto pr-1">
          {Object.values(CHARACTERS).map((char) => {
            const isSelected = char.id === selectedId;
            return (
              <CharacterCard
                key={char.id}
                character={char}
                isSelected={isSelected}
                onSelect={() => {
                  soundFX.playButtonClick();
                  onSelect(char.id);
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
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Confirmar Corredor
          </button>
        </div>
      </div>
    </div>
  );
}

function CharacterCard({
  character,
  isSelected,
  onSelect,
}: {
  character: CharacterDef;
  isSelected: boolean;
  onSelect: () => void;
}) {

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-slate-900/90 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/40'
          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Realistic Character Portrait Box */}
        <div className="w-20 h-24 bg-slate-900 rounded-xl border border-slate-700/80 shrink-0 overflow-hidden relative shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={character.avatarImage}
            alt={character.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
          />
          {isSelected && (
            <div className="absolute top-1.5 right-1.5 bg-cyan-400 text-black p-0.5 rounded-full shadow">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
          <div
            className="absolute bottom-0 inset-x-0 h-1"
            style={{ backgroundColor: character.accentHex }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-orbitron font-bold text-white text-base truncate">{character.name}</h3>
            <span
              className="text-[10px] font-orbitron px-1.5 py-0.5 rounded border uppercase shrink-0"
              style={{
                borderColor: `${character.accentHex}40`,
                color: character.accentHex,
                backgroundColor: `${character.accentHex}10`,
              }}
            >
              {character.gender === 'male' ? 'Piloto' : 'Pilota'}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-rajdhani mt-0.5">{character.tagline}</p>

          <div className="mt-2 text-[11px] text-slate-300 bg-slate-900/80 p-1.5 rounded border border-slate-800/60">
            <span className="font-orbitron font-semibold block text-[10px]" style={{ color: character.accentHex }}>
              {character.specialPerk}
            </span>
            <span className="text-slate-400 leading-tight block mt-0.5">{character.perkDescription}</span>
          </div>
        </div>
      </div>

      {/* Stat Meters */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[10px] font-orbitron">
        <div>
          <div className="flex items-center gap-1 text-slate-400 mb-0.5">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span>Velocidade</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${(character.stats.speed / 5) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-slate-400 mb-0.5">
            <Wind className="w-3 h-3 text-pink-400" />
            <span>Agilidade</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-400 rounded-full"
              style={{ width: `${(character.stats.agility / 5) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 text-slate-400 mb-0.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Especial</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${(character.stats.perkPower / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
