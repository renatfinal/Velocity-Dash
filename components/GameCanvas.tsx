'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { CharacterId, ScenarioId, CHARACTERS, SCENARIOS, UpgradesState } from '@/lib/gameTypes';
import { soundFX } from '@/lib/audioEngine';

interface GameCanvasProps {
  characterId: CharacterId;
  scenarioId: ScenarioId;
  upgrades: UpgradesState;
  isRunning: boolean;
  isPaused: boolean;
  onGameOver: (stats: { score: number; level: number; orbs: number; maxCombo: number }) => void;
  onScoreUpdate: (stats: {
    score: number;
    level: number;
    orbs: number;
    speed: number;
    combo: number;
    activePowerUp: 'shield' | 'magnet' | 'boost' | null;
    powerUpDurationRatio: number;
  }) => void;
}

export interface GameCanvasHandle {
  jump: (power: 1 | 2) => void;
  duck: (enable: boolean) => void;
}

export const GameCanvas = React.forwardRef<GameCanvasHandle, GameCanvasProps>(function GameCanvas(
  { characterId, scenarioId, upgrades, isRunning, isPaused, onGameOver, onScoreUpdate },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game runtime state
  const stateRef = useRef({
    virtualWidth: 1024,
    virtualHeight: 576,
    groundY: 460,

    score: 0,
    orbsCollected: 0,
    currentLevel: 1,
    gameSpeed: 6.8,
    distanceTraveled: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,

    // Power-ups
    shieldActive: false,
    magnetTimer: 0,
    boostTimer: 0,
    maxPowerUpDuration: 320,

    // Player Physics & Anatomy
    player: {
      x: 140,
      y: 460 - 84,
      width: 48,
      height: 84,
      normalHeight: 84,
      duckHeight: 42,
      vy: 0,
      gravity: 0.88,
      isGrounded: true,
      isDucking: false,
      animTimer: 0,
      dustParticles: [] as Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        alpha: number;
        color?: string;
      }>,
      trailGhosts: [] as Array<{
        x: number;
        y: number;
        alpha: number;
        isDucking: boolean;
        animTimer: number;
      }>,
    },

    // Parallax
    bgX1: 0,
    bgX2: 1024,
    midX1: 0,
    midX2: 1024,

    // Entities
    obstacles: [] as Array<{
      id: number;
      type: 'low' | 'high' | 'wide';
      x: number;
      y: number;
      width: number;
      height: number;
      animTimer: number;
    }>,
    orbs: [] as Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      baseY: number;
      animOffset: number;
    }>,
    powerUpItems: [] as Array<{
      id: number;
      type: 'shield' | 'magnet' | 'boost';
      x: number;
      y: number;
      size: number;
      animOffset: number;
    }>,
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      decay: number;
    }>,

    obstacleTimer: 0,
    orbTimer: 0,
    powerUpTimer: 0,
    nextEntityId: 1,
  });

  // Jump logic
  const performJump = useCallback(
    (power: 1 | 2) => {
      const state = stateRef.current;
      const p = state.player;
      if (!p.isGrounded && power === 1) return;

      const char = CHARACTERS[characterId];
      const agilityBonus = char.id === 'nova' ? 1.15 : 1.0;
      // Normal Jump (power 1) vs Super/High Jump (power 2)
      const impulse = power === 1 ? -14.6 * agilityBonus : -19.4 * agilityBonus;

      p.isDucking = false;
      p.height = p.normalHeight;
      p.vy = impulse;
      p.isGrounded = false;

      soundFX.playJump(power === 2);

      // Jet/Dust burst beneath boots
      const count = power === 2 ? 18 : 10;
      for (let i = 0; i < count; i++) {
        p.dustParticles.push({
          x: p.x + p.width / 2,
          y: state.groundY - 4,
          vx: (Math.random() - 0.5) * 6 - state.gameSpeed * 0.2,
          vy: -Math.random() * 4 - 1.5,
          size: Math.random() * 5 + 3,
          alpha: 0.9,
          color: power === 2 ? char.accentHex : 'rgba(255,255,255,0.7)',
        });
      }
    },
    [characterId]
  );

  // Duck logic
  const performDuck = useCallback((enable: boolean) => {
    const state = stateRef.current;
    const p = state.player;
    if (enable && !p.isDucking) {
      p.isDucking = true;
      p.height = p.duckHeight;
      if (p.isGrounded) {
        p.y = state.groundY - p.duckHeight;
        soundFX.playDuck();
      } else {
        // Fast fall mid-air
        p.vy += 9.5;
      }
    } else if (!enable && p.isDucking) {
      p.isDucking = false;
      p.height = p.normalHeight;
      p.y = state.groundY - p.normalHeight;
    }
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      jump: performJump,
      duck: performDuck,
    }),
    [performJump, performDuck]
  );

  // Reset Game
  const resetGame = useCallback(() => {
    const char = CHARACTERS[characterId];
    const initialShield = char.id === 'volt' || upgrades.shieldDuration > 0;
    const gY = stateRef.current.groundY;

    stateRef.current.score = 0;
    stateRef.current.orbsCollected = 0;
    stateRef.current.currentLevel = 1;
    stateRef.current.gameSpeed = 6.8;
    stateRef.current.distanceTraveled = 0;
    stateRef.current.combo = 0;
    stateRef.current.maxCombo = 0;
    stateRef.current.comboTimer = 0;

    stateRef.current.shieldActive = initialShield;
    stateRef.current.magnetTimer = 0;
    stateRef.current.boostTimer = 0;
    stateRef.current.maxPowerUpDuration = 320 + upgrades.boostDuration * 60;

    stateRef.current.player = {
      x: 140,
      y: gY - 84,
      width: 48,
      height: 84,
      normalHeight: 84,
      duckHeight: 42,
      vy: 0,
      gravity: 0.88,
      isGrounded: true,
      isDucking: false,
      animTimer: 0,
      dustParticles: [],
      trailGhosts: [],
    };

    stateRef.current.obstacles = [];
    stateRef.current.orbs = [];
    stateRef.current.powerUpItems = [];
    stateRef.current.particles = [];
    stateRef.current.obstacleTimer = 0;
    stateRef.current.orbTimer = 0;
    stateRef.current.powerUpTimer = 0;
  }, [characterId, upgrades]);

  // Touch & Pointer Gesture Listeners:
  // 1 touch = normal jump
  // 2 quick touches (double tap) = super/high jump
  // swipe finger down = duck/slide
  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;
    let hasSwipedDown = false;
    let lastTapTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRunning || isPaused) return;

      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        performJump(1);
      } else if (e.code === 'KeyW') {
        e.preventDefault();
        performJump(2);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        performDuck(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        performDuck(false);
      }
    };

    const canvas = canvasRef.current;
    if (!canvas) return;

    // TOUCH START / POINTER DOWN
    const onTouchStart = (e: TouchEvent) => {
      if (!isRunning || isPaused) return;
      soundFX.init();
      const t = e.touches[0];
      touchStartY = t.clientY;
      touchStartX = t.clientX;
      touchStartTime = Date.now();
      hasSwipedDown = false;

      const now = Date.now();
      const tapInterval = now - lastTapTime;

      if (tapInterval < 280 && tapInterval > 40) {
        // 2 TAPS RAPIDOS -> PULO MAIS ALTO (SUPER JUMP)
        performJump(2);
        lastTapTime = 0;
      } else {
        // 1 TOQUE -> PULO NORMAL
        performJump(1);
        lastTapTime = now;
      }
    };

    // TOUCH MOVE (detect swipe down to duck)
    const onTouchMove = (e: TouchEvent) => {
      if (!isRunning || isPaused) return;
      const t = e.touches[0];
      const deltaY = t.clientY - touchStartY;
      const deltaX = Math.abs(t.clientX - touchStartX);

      // Deslizar o dedo para baixo
      if (deltaY > 26 && deltaY > deltaX && !hasSwipedDown) {
        hasSwipedDown = true;
        performDuck(true);
      }
    };

    // TOUCH END
    const onTouchEnd = () => {
      if (!isRunning || isPaused) return;
      if (hasSwipedDown || stateRef.current.player.isDucking) {
        performDuck(false);
      }
      hasSwipedDown = false;
    };

    // MOUSE POINTER SUPPORT (works identically on desktop when clicking/dragging)
    let isMouseDown = false;
    let mouseStartY = 0;
    let lastClickTime = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (!isRunning || isPaused) return;
      soundFX.init();
      isMouseDown = true;
      mouseStartY = e.clientY;
      const now = Date.now();
      const clickInterval = now - lastClickTime;

      if (clickInterval < 280 && clickInterval > 40) {
        performJump(2); // Double click: high jump
        lastClickTime = 0;
      } else {
        performJump(1); // Single click: normal jump
        lastClickTime = now;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isRunning || isPaused || !isMouseDown) return;
      if (e.clientY - mouseStartY > 26) {
        performDuck(true);
      }
    };

    const onMouseUp = () => {
      isMouseDown = false;
      performDuck(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isRunning, isPaused, performJump, performDuck]);

  // Main 60fps Animation Loop with Dynamic Full-screen Canvas Resolution
  useEffect(() => {
    if (!isRunning) return;
    resetGame();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const scenario = SCENARIOS[scenarioId];
    const character = CHARACTERS[characterId];

    // Resize handler for Full Screen
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(800, Math.floor(rect.width));
      const h = Math.max(450, Math.floor(rect.height));
      const dpr = window.devicePixelRatio || 1;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      const state = stateRef.current;
      state.virtualWidth = w;
      state.virtualHeight = h;
      state.groundY = Math.floor(h * 0.81);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    let lastFrameTime = performance.now();

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);
      if (isPaused) {
        lastFrameTime = time;
        return;
      }

      const dt = Math.min((time - lastFrameTime) / 16.666, 2.0);
      lastFrameTime = time;

      const state = stateRef.current;
      const p = state.player;
      const vW = state.virtualWidth;
      const vH = state.virtualHeight;
      const gY = state.groundY;

      // Power-up durations
      const isBoosting = state.boostTimer > 0;
      if (state.boostTimer > 0) state.boostTimer -= dt;
      if (state.magnetTimer > 0) state.magnetTimer -= dt;

      // Speed progression
      const baseSpeed = 6.8 + (state.currentLevel - 1) * 0.75;
      const effectiveSpeed = isBoosting ? baseSpeed * 1.55 : baseSpeed;
      state.gameSpeed = effectiveSpeed;

      state.distanceTraveled += effectiveSpeed * 0.1 * dt;

      // Score
      const multiplier = 1 + upgrades.scoreMultiplier * 0.25 + (character.id === 'cipher' ? 0.25 : 0);
      state.score += 0.28 * state.currentLevel * multiplier * dt;

      // Level progression
      const nextLevel = Math.floor(state.score / 280) + 1;
      if (nextLevel > state.currentLevel) {
        state.currentLevel = nextLevel;
        soundFX.playLevelUp();

        for (let i = 0; i < 30; i++) {
          state.particles.push({
            x: vW / 2,
            y: vH / 2,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.5) * 14,
            size: Math.random() * 6 + 3,
            alpha: 1,
            color: character.accentHex,
            decay: 0.02,
          });
        }
      }

      // Combo Decay
      if (state.comboTimer > 0) {
        state.comboTimer -= dt;
        if (state.comboTimer <= 0) state.combo = 0;
      }

      // Parallax update
      state.bgX1 -= effectiveSpeed * 0.2 * dt;
      state.bgX2 -= effectiveSpeed * 0.2 * dt;
      if (state.bgX1 <= -vW) state.bgX1 = vW + state.bgX2 - effectiveSpeed * 0.2;
      if (state.bgX2 <= -vW) state.bgX2 = vW + state.bgX1 - effectiveSpeed * 0.2;

      state.midX1 -= effectiveSpeed * 0.48 * dt;
      state.midX2 -= effectiveSpeed * 0.48 * dt;
      if (state.midX1 <= -vW) state.midX1 = vW + state.midX2 - effectiveSpeed * 0.48;
      if (state.midX2 <= -vW) state.midX2 = vW + state.midX1 - effectiveSpeed * 0.48;

      // Player Physics
      p.vy += p.gravity * dt;
      p.y += p.vy * dt;

      const currentTargetHeight = p.isDucking ? p.duckHeight : p.normalHeight;
      if (p.y >= gY - currentTargetHeight) {
        p.y = gY - currentTargetHeight;
        p.vy = 0;
        if (!p.isGrounded) {
          for (let i = 0; i < 6; i++) {
            p.dustParticles.push({
              x: p.x + p.width / 2,
              y: gY - 4,
              vx: (Math.random() - 0.5) * 4 - effectiveSpeed * 0.2,
              vy: -Math.random() * 2 - 0.5,
              size: Math.random() * 4 + 2,
              alpha: 0.8,
            });
          }
        }
        p.isGrounded = true;
      }

      p.animTimer += dt * (effectiveSpeed / 6.8);

      // Trail Ghosts
      if (isBoosting || state.currentLevel >= 4) {
        if (Math.random() < 0.6) {
          p.trailGhosts.push({
            x: p.x,
            y: p.y,
            alpha: 0.7,
            isDucking: p.isDucking,
            animTimer: p.animTimer,
          });
        }
      }

      // Update Particles
      for (let i = p.dustParticles.length - 1; i >= 0; i--) {
        const d = p.dustParticles[i];
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.alpha -= 0.04 * dt;
        if (d.alpha <= 0) p.dustParticles.splice(i, 1);
      }

      for (let i = p.trailGhosts.length - 1; i >= 0; i--) {
        const g = p.trailGhosts[i];
        g.x -= effectiveSpeed * 0.5 * dt;
        g.alpha -= 0.06 * dt;
        if (g.alpha <= 0) p.trailGhosts.splice(i, 1);
      }

      // Spawners: Obstacles
      state.obstacleTimer += dt;
      const spawnInterval = Math.max(50, 115 - state.currentLevel * 6);
      if (state.obstacleTimer > spawnInterval) {
        state.obstacleTimer = 0;
        const rand = Math.random();
        let type: 'low' | 'high' | 'wide' = 'low';
        if (rand > 0.65) type = 'high';
        else if (rand > 0.38) type = 'wide';

        let width = 38;
        let height = 46;
        let y = gY - 46;

        if (type === 'high') {
          width = 56;
          height = 36;
          y = gY - 96; // Suspended: requires slide
        } else if (type === 'wide') {
          width = 96;
          height = 32;
          y = gY - 32; // Wide: requires super jump
        }

        state.obstacles.push({
          id: state.nextEntityId++,
          type,
          x: vW + 60,
          y,
          width,
          height,
          animTimer: 0,
        });
      }

      // Spawners: Nano Orbs
      state.orbTimer += dt;
      const orbInterval = character.id === 'cipher' ? 60 : 85;
      if (state.orbTimer > orbInterval) {
        state.orbTimer = 0;
        const heights = [gY - 30, gY - 75, gY - 130];
        const chosenY = heights[Math.floor(Math.random() * heights.length)];
        state.orbs.push({
          id: state.nextEntityId++,
          x: vW + 50,
          y: chosenY,
          baseY: chosenY,
          size: 18,
          animOffset: Math.random() * Math.PI * 2,
        });
      }

      // Spawners: Power-ups
      state.powerUpTimer += dt;
      if (state.powerUpTimer > 520) {
        state.powerUpTimer = 0;
        const types: Array<'shield' | 'magnet' | 'boost'> = ['shield', 'magnet', 'boost'];
        state.powerUpItems.push({
          id: state.nextEntityId++,
          type: types[Math.floor(Math.random() * types.length)],
          x: vW + 50,
          y: gY - 85,
          size: 26,
          animOffset: 0,
        });
      }

      // Update Obstacles
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        obs.x -= effectiveSpeed * dt;
        obs.animTimer += dt;
        if (obs.x + obs.width < -80) state.obstacles.splice(i, 1);
      }

      // Update Orbs & Magnet Pull
      const magnetRange = 130 + upgrades.magnetRadius * 55;
      const hasMagnet = state.magnetTimer > 0;

      for (let i = state.orbs.length - 1; i >= 0; i--) {
        const orb = state.orbs[i];
        orb.x -= effectiveSpeed * dt;
        orb.animOffset += 0.05 * dt;
        orb.y = orb.baseY + Math.sin(orb.animOffset) * 6;

        if (hasMagnet) {
          const dx = p.x + p.width / 2 - orb.x;
          const dy = p.y + p.height / 2 - orb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < magnetRange) {
            orb.x += (dx / dist) * 13 * dt;
            orb.y += (dy / dist) * 13 * dt;
          }
        }

        // Collection check
        if (
          p.x < orb.x + orb.size &&
          p.x + p.width > orb.x - orb.size &&
          p.y < orb.y + orb.size &&
          p.y + p.height > orb.y - orb.size
        ) {
          state.orbsCollected += 1;
          state.score += 25 * state.currentLevel;
          state.combo += 1;
          state.comboTimer = 180;
          if (state.combo > state.maxCombo) state.maxCombo = state.combo;

          soundFX.playCollectOrb();

          for (let k = 0; k < 8; k++) {
            state.particles.push({
              x: orb.x,
              y: orb.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              size: Math.random() * 4 + 2,
              alpha: 1,
              color: '#ffd700',
              decay: 0.05,
            });
          }

          state.orbs.splice(i, 1);
          continue;
        }

        if (orb.x < -50) state.orbs.splice(i, 1);
      }

      // Update Power-up items
      for (let i = state.powerUpItems.length - 1; i >= 0; i--) {
        const item = state.powerUpItems[i];
        item.x -= effectiveSpeed * dt;
        item.animOffset += 0.04 * dt;
        item.y += Math.sin(item.animOffset) * 0.4;

        if (
          p.x < item.x + item.size &&
          p.x + p.width > item.x - item.size &&
          p.y < item.y + item.size &&
          p.y + p.height > item.y - item.size
        ) {
          soundFX.playPowerUp();
          if (item.type === 'shield') state.shieldActive = true;
          else if (item.type === 'magnet') state.magnetTimer = state.maxPowerUpDuration;
          else if (item.type === 'boost') state.boostTimer = 180 + upgrades.boostDuration * 60;

          for (let k = 0; k < 16; k++) {
            state.particles.push({
              x: item.x,
              y: item.y,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              size: Math.random() * 5 + 3,
              alpha: 1,
              color: item.type === 'shield' ? '#38bdf8' : item.type === 'magnet' ? '#34d399' : '#f43f5e',
              decay: 0.03,
            });
          }

          state.powerUpItems.splice(i, 1);
          continue;
        }

        if (item.x < -60) state.powerUpItems.splice(i, 1);
      }

      // Obstacle Collisions
      const pBox = {
        x: p.x + 8,
        y: p.y + 6,
        width: p.width - 16,
        height: p.height - 10,
      };

      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        const oBox = {
          x: obs.x + 4,
          y: obs.y + 4,
          width: obs.width - 8,
          height: obs.height - 8,
        };

        const isColliding =
          pBox.x < oBox.x + oBox.width &&
          pBox.x + pBox.width > oBox.x &&
          pBox.y < oBox.y + oBox.height &&
          pBox.y + pBox.height > oBox.y;

        if (isColliding) {
          if (isBoosting) {
            soundFX.playShieldBreak();
            for (let k = 0; k < 16; k++) {
              state.particles.push({
                x: obs.x + obs.width / 2,
                y: obs.y + obs.height / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 5 + 3,
                alpha: 1,
                color: '#f43f5e',
                decay: 0.04,
              });
            }
            state.obstacles.splice(i, 1);
            continue;
          }

          if (state.shieldActive) {
            state.shieldActive = false;
            soundFX.playShieldBreak();
            for (let k = 0; k < 20; k++) {
              state.particles.push({
                x: p.x + p.width / 2,
                y: p.y + p.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 5 + 3,
                alpha: 1,
                color: '#00f0ff',
                decay: 0.03,
              });
            }
            state.obstacles.splice(i, 1);
            continue;
          }

          // Game over
          soundFX.playHit();
          onGameOver({
            score: Math.floor(state.score),
            level: state.currentLevel,
            orbs: state.orbsCollected,
            maxCombo: state.maxCombo,
          });
          cancelAnimationFrame(animId);
          return;
        }
      }

      // Update General Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.alpha -= pt.decay * dt;
        if (pt.alpha <= 0) state.particles.splice(i, 1);
      }

      // HUD Callback
      let activePowerUp: 'shield' | 'magnet' | 'boost' | null = null;
      let powerUpRatio = 0;
      if (isBoosting) {
        activePowerUp = 'boost';
        powerUpRatio = state.boostTimer / (180 + upgrades.boostDuration * 60);
      } else if (state.magnetTimer > 0) {
        activePowerUp = 'magnet';
        powerUpRatio = state.magnetTimer / state.maxPowerUpDuration;
      } else if (state.shieldActive) {
        activePowerUp = 'shield';
        powerUpRatio = 1;
      }

      onScoreUpdate({
        score: Math.floor(state.score),
        level: state.currentLevel,
        orbs: state.orbsCollected,
        speed: Number((effectiveSpeed / 6.8).toFixed(1)),
        combo: state.combo,
        activePowerUp,
        powerUpDurationRatio: powerUpRatio,
      });

      // ==========================================
      // RENDERING CANVAS (Full Screen Edge-to-Edge)
      // ==========================================
      ctx.clearRect(0, 0, vW, vH);

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, vH);
      skyGrad.addColorStop(0, scenario.skyColors[0]);
      skyGrad.addColorStop(0.65, scenario.skyColors[1]);
      skyGrad.addColorStop(1, scenario.skyColors[2]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, vW, vH);

      // Sun/Moon
      ctx.save();
      if (scenario.id === 'desert') {
        const sunGrad = ctx.createRadialGradient(vW * 0.75, 110, 10, vW * 0.75, 110, 110);
        sunGrad.addColorStop(0, 'rgba(255, 245, 200, 0.95)');
        sunGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.45)');
        sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(vW * 0.75, 110, 110, 0, Math.PI * 2);
        ctx.fill();
      } else if (scenario.id === 'road') {
        const moonGrad = ctx.createRadialGradient(vW * 0.8, 100, 5, vW * 0.8, 100, 80);
        moonGrad.addColorStop(0, 'rgba(0, 240, 255, 0.95)');
        moonGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.25)');
        moonGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(vW * 0.8, 100, 80, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Distant Parallax
      drawDistantScenery(ctx, scenario.id, state.bgX1, vW, gY);
      drawDistantScenery(ctx, scenario.id, state.bgX2, vW, gY);

      // Midground
      drawMidScenery(ctx, scenario.id, state.midX1, vW, gY);
      drawMidScenery(ctx, scenario.id, state.midX2, vW, gY);

      // Ground Floor
      drawGround(ctx, scenario, state.distanceTraveled, vW, vH, gY);

      // Obstacles
      for (const obs of state.obstacles) {
        drawObstacle(ctx, obs, scenario.id, gY);
      }

      // Orbs
      for (const orb of state.orbs) {
        drawOrb(ctx, orb);
      }

      // Power-ups
      for (const item of state.powerUpItems) {
        drawPowerUpItem(ctx, item);
      }

      // Trail Ghosts
      for (const g of p.trailGhosts) {
        ctx.save();
        ctx.globalAlpha = g.alpha * 0.35;
        ctx.fillStyle = character.accentHex;
        if (g.isDucking) {
          ctx.fillRect(g.x, gY - p.duckHeight, p.width, p.duckHeight);
        } else {
          ctx.fillRect(g.x, g.y, p.width, p.normalHeight);
        }
        ctx.restore();
      }

      // REALISTIC CHARACTER RENDERING
      drawRealisticPlayer(ctx, p, character, state.shieldActive, state.magnetTimer > 0, isBoosting, gY);

      // Particles
      for (const pt of state.particles) {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isRunning, isPaused, characterId, scenarioId, upgrades, onGameOver, onScoreUpdate, resetGame]);

  // Distant Background
  function drawDistantScenery(
    ctx: CanvasRenderingContext2D,
    scnId: ScenarioId,
    offsetX: number,
    vW: number,
    gY: number
  ) {
    ctx.save();
    if (scnId === 'desert') {
      ctx.fillStyle = 'rgba(180, 83, 9, 0.28)';
      ctx.beginPath();
      ctx.moveTo(offsetX, gY);
      ctx.lineTo(offsetX + 180, gY - 160);
      ctx.lineTo(offsetX + 360, gY);
      ctx.lineTo(offsetX + 540, gY - 120);
      ctx.lineTo(offsetX + 720, gY);
      ctx.closePath();
      ctx.fill();
    } else if (scnId === 'road') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(offsetX + 30, gY - 280, 90, 280);
      ctx.fillRect(offsetX + 150, gY - 340, 110, 340);
      ctx.fillRect(offsetX + 290, gY - 230, 80, 230);
      ctx.fillRect(offsetX + 390, gY - 310, 100, 310);
      ctx.fillRect(offsetX + 520, gY - 260, 120, 260);

      ctx.fillStyle = 'rgba(0, 240, 255, 0.65)';
      ctx.fillRect(offsetX + 200, gY - 360, 4, 24);
      ctx.fillRect(offsetX + 435, gY - 330, 4, 24);
    } else if (scnId === 'track') {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.38)';
      ctx.fillRect(offsetX + 40, gY - 240, 28, 240);
      ctx.fillRect(offsetX + 320, gY - 240, 28, 240);
      ctx.fillRect(offsetX + 600, gY - 240, 28, 240);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.arc(offsetX + 54, gY - 240, 44, 0, Math.PI * 2);
      ctx.arc(offsetX + 334, gY - 240, 44, 0, Math.PI * 2);
      ctx.arc(offsetX + 614, gY - 240, 44, 0, Math.PI * 2);
      ctx.fill();
    } else if (scnId === 'forest') {
      ctx.fillStyle = 'rgba(6, 78, 59, 0.35)';
      for (let i = 0; i < 5; i++) {
        const tx = offsetX + i * 260;
        ctx.beginPath();
        ctx.moveTo(tx, gY);
        ctx.lineTo(tx + 70, gY - 240);
        ctx.lineTo(tx + 140, gY);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Midground
  function drawMidScenery(
    ctx: CanvasRenderingContext2D,
    scnId: ScenarioId,
    offsetX: number,
    vW: number,
    gY: number
  ) {
    ctx.save();
    if (scnId === 'road') {
      ctx.fillStyle = 'rgba(30, 27, 75, 0.65)';
      ctx.fillRect(offsetX + 120, gY - 150, 160, 150);
      ctx.fillRect(offsetX + 420, gY - 170, 140, 170);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX + 140, gY - 130, 110, 42);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.fillRect(offsetX + 140, gY - 130, 110, 42);
    } else if (scnId === 'desert') {
      ctx.fillStyle = 'rgba(146, 64, 14, 0.5)';
      ctx.beginPath();
      ctx.moveTo(offsetX, gY);
      ctx.lineTo(offsetX + 100, gY - 90);
      ctx.lineTo(offsetX + 220, gY);
      ctx.fill();
    } else if (scnId === 'track') {
      ctx.fillStyle = 'rgba(51, 65, 85, 0.5)';
      ctx.fillRect(offsetX + 140, gY - 90, 90, 90);
    } else if (scnId === 'forest') {
      ctx.fillStyle = 'rgba(4, 120, 87, 0.45)';
      for (let i = 0; i < 4; i++) {
        const tx = offsetX + i * 340;
        ctx.beginPath();
        ctx.moveTo(tx, gY);
        ctx.lineTo(tx + 45, gY - 150);
        ctx.lineTo(tx + 90, gY);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Ground Floor
  function drawGround(
    ctx: CanvasRenderingContext2D,
    scenario: (typeof SCENARIOS)[ScenarioId],
    distance: number,
    vW: number,
    vH: number,
    gY: number
  ) {
    ctx.save();
    ctx.fillStyle = scenario.groundColor;
    ctx.fillRect(0, gY, vW, vH - gY);

    // Glowing speed line strip
    ctx.strokeStyle = scenario.laneColor;
    ctx.lineWidth = 5;
    ctx.setLineDash([40, 28]);
    ctx.lineDashOffset = -distance * 2.6;

    ctx.beginPath();
    ctx.moveTo(0, gY + 14);
    ctx.lineTo(vW, gY + 14);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2;
    ctx.setLineDash([24, 24]);
    ctx.beginPath();
    ctx.moveTo(0, gY + 48);
    ctx.lineTo(vW, gY + 48);
    ctx.stroke();

    ctx.restore();
  }

  // Obstacles
  function drawObstacle(
    ctx: CanvasRenderingContext2D,
    obs: { type: 'low' | 'high' | 'wide'; x: number; y: number; width: number; height: number; animTimer: number },
    scnId: ScenarioId,
    gY: number
  ) {
    ctx.save();
    if (scnId === 'road') {
      if (obs.type === 'low') {
        ctx.fillStyle = '#ff6b00';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, gY);
        ctx.lineTo(obs.x, gY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(obs.x + 8, obs.y + 20, obs.width - 16, 8);
      } else if (obs.type === 'high') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(obs.x + 4, obs.y + obs.height - 6, obs.width - 8, 4);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      } else {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(obs.x, gY - 30, obs.width, 30, 6);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(obs.x + 20, gY - 2, 9, 0, Math.PI * 2);
        ctx.arc(obs.x + obs.width - 20, gY - 2, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(obs.x + 22, gY - 26, obs.width - 44, 11);
      }
    } else if (scnId === 'desert') {
      if (obs.type === 'low') {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(obs.x + 9, obs.y, obs.width - 18, obs.height);
        ctx.fillRect(obs.x - 4, obs.y + 11, 13, 9);
        ctx.fillRect(obs.x + obs.width - 9, obs.y + 20, 13, 9);
      } else if (obs.type === 'high') {
        const flyY = obs.y + Math.sin(obs.animTimer * 0.16) * 9;
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, flyY + 12, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(obs.x - 14, flyY + 8, obs.width + 28, 7);
      } else {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(obs.x, gY);
        ctx.lineTo(obs.x + 18, obs.y);
        ctx.lineTo(obs.x + obs.width - 18, obs.y);
        ctx.lineTo(obs.x + obs.width, gY);
        ctx.closePath();
        ctx.fill();
      }
    } else if (scnId === 'track') {
      if (obs.type === 'low') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(obs.x, obs.y, obs.width, 9);
        ctx.fillRect(obs.x + 4, obs.y, 7, obs.height);
        ctx.fillRect(obs.x + obs.width - 11, obs.y, 7, obs.height);
      } else if (obs.type === 'high') {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Orbitron, sans-serif';
        ctx.fillText('APEX', obs.x + 8, obs.y + 23);
      } else {
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width / 2, gY - 4, obs.width / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (scnId === 'forest') {
      if (obs.type === 'low') {
        ctx.fillStyle = '#54361e';
        ctx.fillRect(obs.x, gY - 26, obs.width, 26);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(obs.x + 5, gY - 29, 18, 5);
      } else if (obs.type === 'high') {
        ctx.fillStyle = '#3f2512';
        ctx.fillRect(obs.x - 8, obs.y, obs.width + 16, 15);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(obs.x + 4, obs.y + 15, obs.width - 8, 17);
      } else {
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(obs.x, gY - 9, obs.width, 11);
        ctx.fillStyle = '#3f2512';
        ctx.fillRect(obs.x, gY - 15, 20, 9);
        ctx.fillRect(obs.x + obs.width - 20, gY - 15, 20, 9);
      }
    }
    ctx.restore();
  }

  // Collectible Orbs
  function drawOrb(ctx: CanvasRenderingContext2D, orb: { x: number; y: number; size: number }) {
    ctx.save();
    const glow = ctx.createRadialGradient(orb.x, orb.y, 2, orb.x, orb.y, orb.size * 1.6);
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.95)');
    glow.addColorStop(0.5, 'rgba(255, 215, 0, 0.35)');
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.size * 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(orb.x, orb.y - orb.size / 2);
    ctx.lineTo(orb.x + orb.size / 2, orb.y);
    ctx.lineTo(orb.x, orb.y + orb.size / 2);
    ctx.lineTo(orb.x - orb.size / 2, orb.y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(orb.x - 2, orb.y - 2, 4, 4);
    ctx.restore();
  }

  // Power-Up items
  function drawPowerUpItem(
    ctx: CanvasRenderingContext2D,
    item: { type: 'shield' | 'magnet' | 'boost'; x: number; y: number; size: number }
  ) {
    ctx.save();
    const color = item.type === 'shield' ? '#38bdf8' : item.type === 'magnet' ? '#34d399' : '#f43f5e';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const symbol = item.type === 'shield' ? '🛡' : item.type === 'magnet' ? '🧲' : '⚡';
    ctx.fillText(symbol, item.x, item.y);
    ctx.restore();
  }

  // ==========================================
  // REALISTIC ANATOMICAL CHARACTER DRAWING
  // ==========================================
  function drawRealisticPlayer(
    ctx: CanvasRenderingContext2D,
    p: (typeof stateRef.current)['player'],
    char: (typeof CHARACTERS)[CharacterId],
    shieldActive: boolean,
    magnetActive: boolean,
    isBoosting: boolean,
    gY: number
  ) {
    ctx.save();

    // Dust particles
    for (const d of p.dustParticles) {
      ctx.save();
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = d.color || 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.translate(p.x, p.y);

    const mainColor = char.accentHex;
    const suitArmor = '#10141e';
    const suitFabric = '#1a2233';
    const skinTone = char.gender === 'male' ? '#d49b6a' : '#dfa579';
    const skinShadow = char.gender === 'male' ? '#a56c3d' : '#b2774c';

    if (p.isDucking) {
      // ----------------------------------------
      // REALISTIC SLIDING / DUCKING SPRINT POSE
      // ----------------------------------------
      // Torso reclined low, rear leg folded, lead leg extended forward skidding, sparks flying!

      // Extended front leg
      ctx.fillStyle = suitArmor;
      ctx.beginPath();
      ctx.roundRect(16, 26, 32, 10, 4);
      ctx.fill();

      // Running shoe lead
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(44, 28, 12, 8);
      ctx.fillStyle = mainColor;
      ctx.fillRect(44, 34, 12, 3); // Sole tread

      // Torso reclined
      ctx.fillStyle = suitArmor;
      ctx.beginPath();
      ctx.roundRect(6, 12, 30, 20, 5);
      ctx.fill();

      // Glowing suit energy line
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, 22);
      ctx.lineTo(34, 22);
      ctx.stroke();

      // Head forward
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(38, 16, 9, 0, Math.PI * 2);
      ctx.fill();

      // Visor
      ctx.fillStyle = mainColor;
      ctx.fillRect(36, 13, 10, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(38, 14, 6, 2);

      // Trailing arm dragging on ground with sparks
      ctx.fillStyle = suitFabric;
      ctx.fillRect(-6, 22, 16, 6);
      ctx.fillStyle = skinTone;
      ctx.fillRect(-8, 24, 6, 5);

      // Slide sparks
      ctx.fillStyle = '#ffd700';
      for (let s = 0; s < 4; s++) {
        ctx.fillRect(-12 - s * 6, p.duckHeight - 2 + (s % 2), 4, 2);
      }
    } else {
      // ----------------------------------------
      // REALISTIC RUNNING / JUMPING ANATOMY
      // ----------------------------------------
      const legStride = Math.sin(p.animTimer * 0.95);
      const armStride = Math.cos(p.animTimer * 0.95);

      // 1. Back Arm (swings opposite to front leg)
      ctx.save();
      ctx.fillStyle = suitFabric;
      if (!p.isGrounded) {
        // Jumping arm back balance
        ctx.fillRect(4, 26, 8, 22);
      } else {
        const backArmAngle = armStride * 0.55;
        ctx.translate(14, 26);
        ctx.rotate(backArmAngle);
        ctx.fillRect(-3, 0, 7, 15); // Upper arm
        ctx.fillStyle = suitArmor;
        ctx.fillRect(-2, 13, 6, 13); // Forearm
        ctx.fillStyle = skinTone;
        ctx.fillRect(-2, 24, 6, 6); // Hand
      }
      ctx.restore();

      // 2. Back Leg
      ctx.save();
      ctx.fillStyle = suitFabric;
      if (!p.isGrounded) {
        // Jumping bent leg
        ctx.fillRect(10, 52, 9, 18);
        ctx.fillRect(12, 68, 12, 10);
      } else {
        const backLegAngle = -legStride * 0.65;
        ctx.translate(18, 52);
        ctx.rotate(backLegAngle);
        ctx.fillRect(-4, 0, 9, 17); // Thigh
        // Knee armor
        ctx.fillStyle = suitArmor;
        ctx.fillRect(-3, 15, 8, 16); // Calf
        // Running shoe
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, 29, 11, 7);
        ctx.fillStyle = mainColor;
        ctx.fillRect(-3, 34, 11, 3);
      }
      ctx.restore();

      // 3. Torso & Muscular Anatomy
      // Waist and hips
      ctx.fillStyle = suitFabric;
      ctx.beginPath();
      ctx.roundRect(14, 42, 20, 14, 3);
      ctx.fill();

      // Chest plate / athletic V-taper
      ctx.fillStyle = suitArmor;
      ctx.beginPath();
      ctx.moveTo(10, 24);
      ctx.lineTo(38, 24);
      ctx.lineTo(34, 44);
      ctx.lineTo(14, 44);
      ctx.closePath();
      ctx.fill();

      // Carbon weave contours & Glowing suit lines
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(14, 26);
      ctx.lineTo(24, 36);
      ctx.lineTo(34, 26);
      ctx.stroke();

      // Chest Arc Reactor
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(24, 32, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(24, 32, 2, 0, Math.PI * 2);
      ctx.fill();

      // Tactical belt
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(12, 43, 24, 4);
      ctx.fillStyle = mainColor;
      ctx.fillRect(22, 43, 4, 4); // Buckle

      // 4. Front Leg (dynamic stride)
      ctx.save();
      ctx.fillStyle = suitArmor;
      if (!p.isGrounded) {
        // Airborne tuck
        ctx.fillRect(22, 52, 10, 16);
        ctx.fillRect(24, 66, 14, 10);
        // Thruster flame beneath sole during jump
        ctx.fillStyle = mainColor;
        ctx.fillRect(28, 76, 6, 8);
      } else {
        const frontLegAngle = legStride * 0.65;
        ctx.translate(28, 52);
        ctx.rotate(frontLegAngle);
        ctx.fillRect(-4, 0, 9, 17); // Thigh
        ctx.fillStyle = suitFabric;
        ctx.fillRect(-3, 15, 8, 16); // Calf
        // Athletic running sneaker
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, 29, 12, 7);
        ctx.fillStyle = mainColor;
        ctx.fillRect(-3, 34, 12, 3); // Grippy sole tread
      }
      ctx.restore();

      // 5. Front Arm (leading sprint drive)
      ctx.save();
      ctx.fillStyle = suitArmor;
      if (!p.isGrounded) {
        ctx.fillRect(26, 26, 8, 20);
      } else {
        const frontArmAngle = -armStride * 0.55;
        ctx.translate(30, 26);
        ctx.rotate(frontArmAngle);
        ctx.fillRect(-3, 0, 7, 15);
        ctx.fillStyle = suitFabric;
        ctx.fillRect(-2, 13, 6, 13);
        ctx.fillStyle = skinTone;
        ctx.fillRect(-2, 24, 6, 6); // Fist
      }
      ctx.restore();

      // 6. Anatomical Head, Visor & Character Features
      // Neck
      ctx.fillStyle = skinShadow;
      ctx.fillRect(21, 19, 6, 6);

      // Skull
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(24, 12, 11, 0, Math.PI * 2);
      ctx.fill();

      // Hair & Helmet per character
      ctx.fillStyle = '#1c1917';
      if (char.id === 'nova') {
        // High flowing ponytail with pink plasma highlights
        ctx.beginPath();
        ctx.arc(21, 8, 12, 0, Math.PI * 2);
        ctx.fill();

        // Ponytail waving in the wind
        ctx.fillStyle = mainColor;
        const wave = Math.sin(p.animTimer * 0.8) * 4;
        ctx.beginPath();
        ctx.moveTo(14, 5);
        ctx.quadraticCurveTo(0, 4 + wave, -16, 2 + wave);
        ctx.lineTo(-14, 8 + wave);
        ctx.quadraticCurveTo(2, 9 + wave, 14, 10);
        ctx.closePath();
        ctx.fill();
      } else if (char.id === 'kai') {
        // Textured short fade haircut
        ctx.fillRect(15, 2, 18, 7);
        ctx.fillRect(13, 5, 4, 6);
      } else if (char.id === 'cipher') {
        // Stealth cowl collar
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(16, 3, 16, 7);
        ctx.fillRect(13, 7, 7, 10);
      } else if (char.id === 'volt') {
        // Braided hair with gold accents
        ctx.fillStyle = '#292524';
        ctx.fillRect(14, 3, 18, 8);
        ctx.fillStyle = mainColor;
        ctx.fillRect(12, 6, 4, 3);
        ctx.fillRect(12, 10, 4, 3);
      }

      // Sleek Cybernetic Visor with specular reflection
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.roundRect(24, 9, 11, 6, 2);
      ctx.fill();

      // Visor white sheen reflection
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(26, 10, 7, 2);

      // Ear comm unit
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(17, 13, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shield Bubble if active
    if (shieldActive) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.width / 2, p.height / 2, Math.max(p.width, p.height) * 0.75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.fill();
    }

    // Magnet Aura if active
    if (magnetActive) {
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(p.width / 2, p.height / 2, Math.max(p.width, p.height) * 0.92, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Boost Plasma Trails
    if (isBoosting) {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(-18, p.height / 2);
      ctx.lineTo(0, p.height / 2 - 12);
      ctx.lineTo(0, p.height / 2 + 12);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block cursor-pointer select-none touch-none"
    />
  );
});
