'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas, GameCanvasHandle } from '@/components/GameCanvas';
import { Header } from '@/components/Header';
import { GameHUD } from '@/components/GameHUD';
import { MainMenu } from '@/components/MainMenu';
import { CharacterSelectModal } from '@/components/CharacterSelectModal';
import { ScenarioSelectModal } from '@/components/ScenarioSelectModal';
import { ArmoryModal } from '@/components/ArmoryModal';
import { StatsModal } from '@/components/StatsModal';
import { ControlsModal } from '@/components/ControlsModal';
import { GameOverModal } from '@/components/GameOverModal';
import { TouchControls } from '@/components/TouchControls';
import { usePersistentState } from '@/lib/storage';
import {
  CharacterId,
  ScenarioId,
  UpgradesState,
  RunRecord,
  CHARACTERS,
  SCENARIOS,
} from '@/lib/gameTypes';
import { soundFX } from '@/lib/audioEngine';
import { Play } from 'lucide-react';

export default function HomePage() {
  const canvasRef = useRef<GameCanvasHandle | null>(null);

  // Game Lifecycle State
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'>('MENU');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Persistent States (hydrates synchronously from server snapshot to eliminate hydration mismatch)
  const [characterId, setCharacterId] = usePersistentState<CharacterId>('velocity_dash_char', 'kai');
  const [scenarioId, setScenarioId] = usePersistentState<ScenarioId>('velocity_dash_scenario', 'road');
  const [highScore, setHighScore] = usePersistentState<number>('velocity_dash_highscore', 0);
  const [totalOrbs, setTotalOrbs] = usePersistentState<number>('velocity_dash_total_orbs', 0);
  const [upgrades, setUpgrades] = usePersistentState<UpgradesState>('velocity_dash_upgrades', {
    shieldDuration: 0,
    magnetRadius: 0,
    scoreMultiplier: 0,
    boostDuration: 0,
  });
  const [history, setHistory] = usePersistentState<RunRecord[]>('velocity_dash_history', []);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Run In-Game Stats
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [runOrbs, setRunOrbs] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [activePowerUp, setActivePowerUp] = useState<'shield' | 'magnet' | 'boost' | null>(null);
  const [powerUpDurationRatio, setPowerUpDurationRatio] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Modals Visibility
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isArmoryOpen, setIsArmoryOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Fullscreen event listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSelectCharacter = (id: CharacterId) => {
    setCharacterId(id);
  };

  const handleSelectScenario = (id: ScenarioId) => {
    setScenarioId(id);
  };

  // Upgrades purchase
  const handleUpgrade = (type: keyof UpgradesState, cost: number) => {
    if (totalOrbs < cost) return;
    setTotalOrbs((prev) => prev - cost);
    setUpgrades((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  // Audio Toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.setMuted(!next);
    soundFX.setMusicMuted(!next);
  };

  // Start / Restart Game
  const handleStartGame = useCallback(() => {
    soundFX.init();
    if (soundEnabled) {
      soundFX.startBGM();
    }
    setCurrentScore(0);
    setCurrentLevel(1);
    setRunOrbs(0);
    setCombo(0);
    setMaxCombo(0);
    setIsNewHighScore(false);
    setGameState('PLAYING');
  }, [soundEnabled]);

  // Pause / Resume
  const handleTogglePause = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
    }
  };

  // Key shortcuts for Pause & Mute
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
          handleTogglePause();
        }
      } else if (e.code === 'KeyM') {
        handleToggleSound();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Score HUD update callback from GameCanvas
  const handleScoreUpdate = useCallback(
    (stats: {
      score: number;
      level: number;
      orbs: number;
      speed: number;
      combo: number;
      activePowerUp: 'shield' | 'magnet' | 'boost' | null;
      powerUpDurationRatio: number;
    }) => {
      setCurrentScore(stats.score);
      setCurrentLevel(stats.level);
      setRunOrbs(stats.orbs);
      setSpeedMultiplier(stats.speed);
      setCombo(stats.combo);
      setActivePowerUp(stats.activePowerUp);
      setPowerUpDurationRatio(stats.powerUpDurationRatio);
    },
    []
  );

  // Game Over Handler
  const handleGameOver = useCallback(
    (stats: { score: number; level: number; orbs: number; maxCombo: number }) => {
      soundFX.stopBGM();
      const finalScore = stats.score;
      let newHigh = false;

      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('velocity_dash_highscore', String(finalScore));
        newHigh = true;
      }
      setIsNewHighScore(newHigh);

      setTotalOrbs((prev) => prev + stats.orbs);

      const record: RunRecord = {
        id: `${Date.now()}`,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        score: finalScore,
        level: stats.level,
        orbs: stats.orbs,
        scenarioId,
        characterId,
        maxCombo: stats.maxCombo,
      };

      setHistory((prev) => [record, ...prev].slice(0, 15));
      setGameState('GAME_OVER');
    },
    [highScore, setHighScore, setTotalOrbs, setHistory, scenarioId, characterId]
  );

  // Clear Stats
  const handleClearStats = () => {
    setHighScore(0);
    setTotalOrbs(0);
    setHistory([]);
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden flex flex-col bg-[#05050d] text-slate-100 select-none">
      {/* Top Bar strictly respecting the 3-Zone Top Bar Contract */}
      <Header
        orbsBalance={totalOrbs}
        onOpenCharacterSelect={() => setIsCharModalOpen(true)}
        onOpenScenarioSelect={() => setIsScenarioModalOpen(true)}
        onOpenArmory={() => setIsArmoryOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenControls={() => setIsControlsOpen(true)}
        onPlayClick={handleStartGame}
        isPlaying={gameState === 'PLAYING'}
      />

      {/* Main Full-Screen Game Arena */}
      <main className="relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center">
        {/* Full Viewport Canvas */}
        <GameCanvas
          ref={canvasRef}
          characterId={characterId}
          scenarioId={scenarioId}
          upgrades={upgrades}
          isRunning={gameState === 'PLAYING' || gameState === 'PAUSED'}
          isPaused={gameState === 'PAUSED'}
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
        />

        {/* Active Gameplay HUD */}
        {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
          <GameHUD
            score={currentScore}
            highScore={highScore}
            level={currentLevel}
            speed={speedMultiplier}
            orbs={runOrbs}
            combo={combo}
            activePowerUp={activePowerUp}
            powerUpDurationRatio={powerUpDurationRatio}
            isPaused={gameState === 'PAUSED'}
            soundEnabled={soundEnabled}
            isFullscreen={isFullscreen}
            onTogglePause={handleTogglePause}
            onToggleSound={handleToggleSound}
            onToggleFullScreen={handleToggleFullScreen}
          />
        )}

        {/* Gesture Instruction Overlay Badge */}
        {gameState === 'PLAYING' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-80 transition-opacity">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30 text-cyan-300 font-orbitron text-[11px] shadow-lg shadow-black/60">
              <span>1 Toque: Pulo</span>
              <span className="text-slate-600">·</span>
              <span className="text-pink-300">2 Toques: Pulo Alto</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-300">Deslizar ↓: Abaixar</span>
            </div>
          </div>
        )}

        {/* Touch Action Buttons for Mobile / Tablet */}
        {gameState === 'PLAYING' && (
          <TouchControls
            onJump={(power) => canvasRef.current?.jump(power)}
            onDuck={(enable) => canvasRef.current?.duck(enable)}
          />
        )}

        {/* Paused Overlay Screen */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
            <h3 className="text-4xl font-orbitron font-black text-cyan-400 neon-text-blue mb-4">
              JOGO PAUSADO
            </h3>
            <p className="text-xs text-slate-400 font-rajdhani mb-6">
              Pressione Continuar ou a tecla P / Esc
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleTogglePause}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-sm rounded-xl transition cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-black stroke-none" />
                <span>Continuar</span>
              </button>
              <button
                onClick={() => {
                  soundFX.stopBGM();
                  setGameState('MENU');
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-orbitron font-semibold text-sm rounded-xl transition cursor-pointer"
              >
                Menu Principal
              </button>
            </div>
          </div>
        )}

        {/* Main Title Menu Overlay */}
        {gameState === 'MENU' && (
          <MainMenu
            characterId={characterId}
            scenarioId={scenarioId}
            highScore={highScore}
            totalOrbs={totalOrbs}
            onStartGame={handleStartGame}
            onOpenCharacterSelect={() => setIsCharModalOpen(true)}
            onOpenScenarioSelect={() => setIsScenarioModalOpen(true)}
            onOpenArmory={() => setIsArmoryOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenControls={() => setIsControlsOpen(true)}
          />
        )}

        {/* Game Over Modal */}
        <GameOverModal
          isOpen={gameState === 'GAME_OVER'}
          characterId={characterId}
          score={currentScore}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          level={currentLevel}
          orbs={runOrbs}
          maxCombo={maxCombo}
          onRestart={handleStartGame}
          onGoHome={() => setGameState('MENU')}
          onOpenArmory={() => setIsArmoryOpen(true)}
        />
      </main>

      {/* Modals */}
      <CharacterSelectModal
        isOpen={isCharModalOpen}
        selectedId={characterId}
        onSelect={handleSelectCharacter}
        onClose={() => setIsCharModalOpen(false)}
      />

      <ScenarioSelectModal
        isOpen={isScenarioModalOpen}
        selectedId={scenarioId}
        onSelect={handleSelectScenario}
        onClose={() => setIsScenarioModalOpen(false)}
      />

      <ArmoryModal
        isOpen={isArmoryOpen}
        orbsBalance={totalOrbs}
        upgrades={upgrades}
        onUpgrade={handleUpgrade}
        onClose={() => setIsArmoryOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        history={history}
        highScore={highScore}
        totalOrbs={totalOrbs}
        onClearStats={handleClearStats}
        onClose={() => setIsStatsOpen(false)}
      />

      <ControlsModal
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
      />
    </div>
  );
}
