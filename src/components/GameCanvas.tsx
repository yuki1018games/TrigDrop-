import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FallingItem, GameDifficulty, GameMode, GameStats, LaserBeam, Particle, ProblemCategory, SpeedSetting, TrigFunc, TrigProblem } from '../types/trig';
import { getRandomProblem } from '../utils/trigData';
import { sounds } from '../utils/audio';
import { TrigExpression, MathValueDisplay, FormattedMathText } from './MathDisplay';
import { TrigTableModal } from './TrigTableModal';
import { UnitCircleInGameAssist } from './UnitCircleInGameAssist';
import { Heart, Shield, Zap, Flame, AlertTriangle, Target, Table, Volume2, VolumeX, Clock, Sparkles, Compass } from 'lucide-react';

interface GameCanvasProps {
  difficulty: GameDifficulty;
  mode: GameMode;
  category?: ProblemCategory;
  includeTan: boolean;
  onGameOver: (stats: GameStats) => void;
  onQuit: () => void;
  externalSelectedValueKey: string | null;
  onValueProcessed: () => void;
  showUnitCircleAssist?: boolean;
  onTargetChange?: (func: TrigFunc) => void;
  initialSpeedSetting?: SpeedSetting;
}

export type { SpeedSetting };

// Vertical boundary constants
const SPAWN_Y = 14;
const DEFENSE_LINE_Y = 88; // Lowered to 88% so full capsule and contact point touch line cleanly

export const SPEED_DURATIONS: Record<SpeedSetting, number> = {
  very_slow: 25,
  slow: 15,
  normal: 10,
  fast: 6,
  supreme: 5,
};

/**
 * Score Multiplier tiers for consecutive correct answers:
 * - 1-2 Combo: 1.0x (Normal)
 * - 3-4 Combo: 1.2x (Combo Boost)
 * - 5-9 Combo: 1.5x (Fever)
 * - 10-14 Combo: 2.0x (Ultra Fever)
 * - 15-19 Combo: 2.5x (Max Fever)
 * - 20+ Combo: 3.0x (Legendary)
 */
export const getComboMultiplier = (combo: number): number => {
  if (combo >= 20) return 3.0;
  if (combo >= 15) return 2.5;
  if (combo >= 10) return 2.0;
  if (combo >= 5) return 1.5;
  if (combo >= 3) return 1.2;
  return 1.0;
};

export const GameCanvas: React.FC<GameCanvasProps> = ({
  difficulty,
  mode,
  category = 'trig',
  includeTan,
  onGameOver,
  onQuit,
  externalSelectedValueKey,
  onValueProcessed,
  onTargetChange,
  showUnitCircleAssist = false,
  initialSpeedSetting = 'slow',
}) => {
  // Unit Circle Assist In-Game Display State
  const [unitCircleAssistEnabled, setUnitCircleAssistEnabled] = useState<boolean>(Boolean(showUnitCircleAssist));

  useEffect(() => {
    setUnitCircleAssistEnabled(Boolean(showUnitCircleAssist));
  }, [showUnitCircleAssist]);

  // Game Settings: 最上級は一撃死のHP 1、初級5、中級4、その他3
  const maxHp = difficulty === 'supreme' ? 1 : difficulty === 'beginner' ? 5 : difficulty === 'standard' ? 4 : 3;
  const [hp, setHp] = useState<number>(maxHp);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [timeSurvived, setTimeSurvived] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30); // 30秒タイムアタック

  // Trig Table Modal state
  const [showTrigTable, setShowTrigTable] = useState<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = showTrigTable;
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());

  // Speed is purely determined by the user's selected speed setting (independent of difficulty)
  const [speedSetting] = useState<SpeedSetting>(initialSpeedSetting);

  // Next spawn delay timestamp
  const nextSpawnTimeRef = useRef<number>(0);
  const [isWaitingNext, setIsWaitingNext] = useState<boolean>(false);

  // Missed flash notification
  const [missNotification, setMissNotification] = useState<{
    problem: TrigProblem;
    timestamp: number;
  } | null>(null);

  // Recovery notification
  const [healNotification, setHealNotification] = useState<boolean>(false);

  // Screen shake
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // High Combo & Fever Visual Effects state with real score multipliers
  const [activeComboNotice, setActiveComboNotice] = useState<{
    id: string;
    combo: number;
    tier: 1 | 2 | 3 | 4;
    points: number;
    multiplier: number;
    bonusPoints?: number;
    x?: number;
    y?: number;
  } | null>(null);

  const [feverMilestoneBanner, setFeverMilestoneBanner] = useState<{
    text: string;
    subtext: string;
    tier: 1 | 2;
  } | null>(null);

  // Internal state refs for 60fps loop
  const containerRef = useRef<HTMLDivElement>(null);
  const fallingItemsRef = useRef<FallingItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lasersRef = useRef<LaserBeam[]>([]);
  const shockwavesRef = useRef<Array<{
    id: string;
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    alpha: number;
    lineWidth: number;
  }>>([]);
  const comboRef = useRef<number>(0);
  comboRef.current = combo;
  const emberCounterRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);

  // Store props and dynamic configs in stable refs to prevent effect tear-down and freezes
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  const onTargetChangeRef = useRef(onTargetChange);
  onTargetChangeRef.current = onTargetChange;
  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;
  const categoryRef = useRef(category);
  categoryRef.current = category;
  const includeTanRef = useRef(includeTan);
  includeTanRef.current = includeTan;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const speedSettingRef = useRef(speedSetting);
  speedSettingRef.current = speedSetting;
  const levelRef = useRef(level);
  levelRef.current = level;
  const timeSurvivedRef = useRef<number>(0);
  const timeLeftRef = useRef<number>(30);

  // Dedicated lightweight render ticker (60fps) to schedule visual re-render without tearing down loops
  const [, setRenderTick] = useState<number>(0);

  const statsRef = useRef<GameStats>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    wrongCount: 0,
    missedCount: 0,
    accuracy: 100,
    timeSurvivedSeconds: 0,
    level: 1,
    missedProblems: [],
  });

  const hpRef = useRef<number>(maxHp);
  hpRef.current = hp;

  // Track primary targeted item
  const [targetedItemId, setTargetedItemId] = useState<string | null>(null);

  // Spawn a SINGLE new item in the central lane with exact durationSeconds
  const spawnItem = useCallback(() => {
    // Enforce strictly one item at a time!
    if (fallingItemsRef.current.length > 0) return;

    const problem = getRandomProblem(
      difficultyRef.current,
      includeTanRef.current,
      categoryRef.current,
      []
    );

    // Strictly center lane (50%) for clear focus and direct alignment with cannon
    const x = 50;
    const durationSeconds = SPEED_DURATIONS[speedSettingRef.current] || 10;
    const speed = (DEFENSE_LINE_Y - SPAWN_Y) / durationSeconds;

    const newItem: FallingItem = {
      id: problem.id,
      problem,
      xPercent: x,
      yPercent: SPAWN_Y,
      speed,
      durationSeconds,
      elapsedSeconds: 0,
      hpMax: 1,
      hpCurrent: 1,
      createdAt: performance.now(),
      answeredKeys: [],
    };

    fallingItemsRef.current = [newItem];
    setIsWaitingNext(false);
    onTargetChangeRef.current?.(newItem.problem.func);
  }, []);

  const spawnItemRef = useRef(spawnItem);
  spawnItemRef.current = spawnItem;

  // Create explosion particles and shockwaves at (x%, y%) scaled by combo count
  const createExplosion = useCallback((xPercent: number, yPercent: number, color: string, comboCount = 0) => {
    const isUltra = comboCount >= 10;
    const isFever = comboCount >= 5;
    const count = isUltra ? 48 : isFever ? 32 : 18;
    const speedMult = isUltra ? 2.4 : isFever ? 1.7 : 1.0;

    const feverColors = ['#f59e0b', '#fbbf24', '#ef4444', '#f97316', '#ffffff'];
    const ultraColors = ['#06b6d4', '#a855f7', '#f43f5e', '#fbbf24', '#38bdf8', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (1.5 + Math.random() * 4.5) * speedMult;
      const pColor = isUltra
        ? ultraColors[Math.floor(Math.random() * ultraColors.length)]
        : isFever
        ? feverColors[Math.floor(Math.random() * feverColors.length)]
        : color;

      particlesRef.current.push({
        id: Math.random().toString(),
        x: xPercent,
        y: yPercent,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: pColor,
        size: (isUltra ? 4 : isFever ? 3.5 : 3) + Math.random() * (isUltra ? 5 : 4),
        alpha: 1,
        life: 0,
        maxLife: (isUltra ? 35 : isFever ? 30 : 25) + Math.random() * 15,
      });
    }

    // Add shockwave ring for combo >= 5
    if (isFever) {
      shockwavesRef.current.push({
        id: Math.random().toString(),
        x: xPercent,
        y: yPercent,
        radius: 2,
        maxRadius: isUltra ? 28 : 18,
        color: isUltra ? '#06b6d4' : '#f59e0b',
        alpha: 1,
        lineWidth: isUltra ? 3.5 : 2.5,
      });
    }
  }, []);

  // Handle player answer attempt
  const handleAnswerInput = useCallback((valueKey: string) => {
    if (fallingItemsRef.current.length === 0) return;

    // Find the item to check: first check currently targeted item, otherwise lowest item
    const sorted = [...fallingItemsRef.current].sort((a, b) => b.yPercent - a.yPercent);
    const target = sorted[0];

    const expectedKeys = (target.problem.correctValueKeys && target.problem.correctValueKeys.length > 0)
      ? target.problem.correctValueKeys
      : [target.problem.correctValueKey];
    const currentAnswered = target.answeredKeys || [];

    // Check if correct
    if (expectedKeys.includes(valueKey)) {
      if (currentAnswered.includes(valueKey)) {
        // Already inputted this angle for this question! Friendly reminder sound without penalty
        sounds.playLaser();
        return;
      }

      const nextAnswered = [...currentAnswered, valueKey];
      target.answeredKeys = nextAnswered;

      // Check if all required answers have been given
      const requiredAnswersCount = Math.max(
        target.problem.expectedAnswersCount || 1,
        expectedKeys.length
      );

      if (nextAnswered.length < requiredAnswersCount) {
        // PARTIAL HIT (e.g. 1 of 2 answered!)
        sounds.playLaser();
        lasersRef.current.push({
          id: Math.random().toString(),
          startX: 50,
          startY: 94,
          targetX: target.xPercent,
          targetY: target.yPercent,
          color: target.problem.func.includes('sin')
            ? '#10b981'
            : target.problem.func.includes('cos')
            ? '#06b6d4'
            : '#a855f7',
          progress: 1,
          createdAt: performance.now(),
        });
        createExplosion(
          target.xPercent,
          target.yPercent,
          target.problem.func.includes('sin') ? '#34d399' : '#38bdf8'
        );
        // Partial bonus points
        const partialPoints = 60;
        setScore(s => s + partialPoints);
        statsRef.current.score += partialPoints;
        // The capsule stays falling and now prompts for the 2nd answer!
        return;
      }

      // FULL HIT! All answers (1 or 2) provided!
      sounds.playLaser();
      sounds.playHit();

      // Create laser beam to target
      lasersRef.current.push({
        id: Math.random().toString(),
        startX: 50,
        startY: 94,
        targetX: target.xPercent,
        targetY: target.yPercent,
        color:
          target.problem.func.includes('sin')
            ? '#10b981'
            : target.problem.func.includes('cos')
            ? '#06b6d4'
            : target.problem.func === 'rad'
            ? '#818cf8'
            : target.problem.func === 'deg_to_rad' || target.problem.func.startsWith('inv_rad')
            ? '#a855f7'
            : '#f59e0b',
        progress: 1,
        createdAt: performance.now(),
      });

      // Score calculation & Combo Escalation with Multipliers
      const currentCombo = statsRef.current.combo + 1;
      comboRef.current = currentCombo;
      const basePoints = (target.problem.expectedAnswersCount && target.problem.expectedAnswersCount > 1) ? 180 : 100;
      const speedBonus = Math.max(10, Math.floor((100 - target.yPercent) * 1.5));
      const rawPoints = basePoints + speedBonus;

      // Real multiplier calculation based on combo count (1.2x at 3+, 1.5x at 5+, 2.0x at 10+, 2.5x at 15+, 3.0x at 20+)
      const multiplier = getComboMultiplier(currentCombo);
      const multipliedPoints = Math.round(rawPoints * multiplier);
      const comboStreakBonus = currentCombo * 20;
      const totalGained = multipliedPoints + comboStreakBonus;
      const multiplierBonus = multipliedPoints - rawPoints;

      // Explosion with combo scaling
      createExplosion(
        target.xPercent,
        target.yPercent,
        target.problem.func.includes('sin')
          ? '#34d399'
          : target.problem.func.includes('cos')
          ? '#38bdf8'
          : target.problem.func === 'rad'
          ? '#a5b4fc'
          : target.problem.func === 'deg_to_rad' || target.problem.func.startsWith('inv_rad')
          ? '#c084fc'
          : '#fbbf24',
        currentCombo
      );

      setScore(s => s + totalGained);
      setCombo(currentCombo);
      setMaxCombo(mc => Math.max(mc, currentCombo));

      statsRef.current.score += totalGained;
      statsRef.current.combo = currentCombo;
      statsRef.current.maxCombo = Math.max(statsRef.current.maxCombo, currentCombo);
      statsRef.current.correctCount += 1;

      // Play combo sound
      sounds.playCombo(currentCombo);

      // Trigger High Combo / Fever Milestones with Multiplier Notices
      if (currentCombo === 5) {
        sounds.playFever(1);
        setFeverMilestoneBanner({
          text: '🔥 FEVER MODE START!',
          subtext: 'スコア 1.5倍 倍率ボーナス適用中！',
          tier: 1,
        });
        setTimeout(() => setFeverMilestoneBanner(null), 1800);
      } else if (currentCombo === 10) {
        sounds.playFever(2);
        setFeverMilestoneBanner({
          text: '⚡ ULTRA FEVER START!! ⚡',
          subtext: '超フィーバー！スコア 2.0倍 加算中！',
          tier: 2,
        });
        setTimeout(() => setFeverMilestoneBanner(null), 2200);
      } else if (currentCombo === 15) {
        sounds.playFever(2);
        setFeverMilestoneBanner({
          text: '💥 MAX FEVER START!!! 💥',
          subtext: '極限突入！スコア 2.5倍 加算中！',
          tier: 2,
        });
        setTimeout(() => setFeverMilestoneBanner(null), 2200);
      } else if (currentCombo === 20) {
        sounds.playFever(2);
        setFeverMilestoneBanner({
          text: '👑 LEGENDARY COMBO!!!! 👑',
          subtext: '神域の領域！スコア 3.0倍 加算中！',
          tier: 2,
        });
        setTimeout(() => setFeverMilestoneBanner(null), 2500);
      }

      // Show on-screen combo pop notice if combo >= 2 (anchored safely on side flank)
      if (currentCombo >= 2) {
        const noticeId = Math.random().toString();
        setActiveComboNotice({
          id: noticeId,
          combo: currentCombo,
          tier: currentCombo >= 15 ? 4 : currentCombo >= 10 ? 3 : currentCombo >= 5 ? 2 : 1,
          points: totalGained,
          multiplier,
          bonusPoints: multiplierBonus,
        });
        setTimeout(() => {
          setActiveComboNotice(curr => curr && curr.id === noticeId ? null : curr);
        }, 1200);
      }

      // Combo heal every 10 combo
      if (currentCombo > 0 && currentCombo % 10 === 0 && hpRef.current < maxHp) {
        setHp(h => Math.min(maxHp, h + 1));
        setHealNotification(true);
        setTimeout(() => setHealNotification(false), 2000);
      }

      // Check level up every 5 correct
      if (statsRef.current.correctCount % 5 === 0) {
        setLevel(lvl => {
          const next = lvl + 1;
          levelRef.current = next;
          sounds.playLevelUp();
          return next;
        });
      }

      // Remove target and set pause before next question (tuned to speed setting)
      fallingItemsRef.current = [];
      setIsWaitingNext(true);
      const delayMs = {
        very_slow: 800,
        slow: 600,
        normal: 450,
        fast: 320,
        supreme: 320,
      }[speedSettingRef.current] || 320;
      nextSpawnTimeRef.current = performance.now() + delayMs;
    } else {
      // Wrong answer - user explicitly requested: "間違えたら、体力が減るようにして"
      sounds.playWrong();
      setCombo(0);
      comboRef.current = 0;
      setActiveComboNotice(null);
      statsRef.current.combo = 0;
      statsRef.current.wrongCount += 1;
      statsRef.current.missedProblems.push({
        problem: target.problem,
        userAnswer: valueKey,
        reason: 'wrong',
      });

      // Show temporary shake on the target
      target.hitState = 'wrong';
      setTimeout(() => {
        if (target) target.hitState = 'normal';
      }, 300);

      // Decrement HP if in survival mode
      if (modeRef.current === 'survival') {
        sounds.playDamage();
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 350);

        setHp(currentHp => {
          const newHp = currentHp - 1;
          if (newHp <= 0) {
            // Game Over!
            sounds.playGameOver();
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            statsRef.current.timeSurvivedSeconds = Math.floor(timeSurvivedRef.current);
            statsRef.current.level = levelRef.current;
            onGameOverRef.current(statsRef.current);
          }
          return newHp;
        });
      } else if (modeRef.current === 'timeattack') {
        // Time penalty in time attack mode (-2 seconds)
        timeLeftRef.current = Math.max(0, timeLeftRef.current - 2);
        setTimeLeft(Math.ceil(timeLeftRef.current));
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 300);
      }
    }

    // Update accuracy
    const totalAnswers = statsRef.current.correctCount + statsRef.current.wrongCount + statsRef.current.missedCount;
    statsRef.current.accuracy = totalAnswers > 0
      ? Math.round((statsRef.current.correctCount / totalAnswers) * 100)
      : 100;
  }, [maxHp, createExplosion]);

  // Process external input (from buttons or keyboard)
  useEffect(() => {
    if (externalSelectedValueKey) {
      handleAnswerInput(externalSelectedValueKey);
      onValueProcessed();
    }
  }, [externalSelectedValueKey, handleAnswerInput, onValueProcessed]);

  // Main Game Loop (60 FPS) - Clean & isolated from state update tear-down loops
  useEffect(() => {
    // Reset runtime states for new game
    fallingItemsRef.current = [];
    particlesRef.current = [];
    lasersRef.current = [];
    timeSurvivedRef.current = 0;
    timeLeftRef.current = 30;
    nextSpawnTimeRef.current = 0;
    setIsWaitingNext(false);

    // Initial spawn
    spawnItemRef.current();

    let animId = 0;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      // Pause game physics and timers when Cheat Sheet is open
      if (isPausedRef.current) {
        lastTime = currentTime;
        animId = requestAnimationFrame(loop);
        return;
      }

      const rawDt = (currentTime - lastTime) / 1000;
      const dt = Math.min(Math.max(rawDt, 0), 0.1); // clamp to 0-100ms
      lastTime = currentTime;

      // 1. Strictly ONE-AT-A-TIME Spawning logic
      if (fallingItemsRef.current.length === 0) {
        if (currentTime >= nextSpawnTimeRef.current) {
          spawnItemRef.current();
        }
      }

      // 2. Move the active single item down & check for timeout / defense line breach
      const defenseLineY = DEFENSE_LINE_Y;
      const survivingItems: FallingItem[] = [];

      for (const item of fallingItemsRef.current) {
        item.elapsedSeconds = (item.elapsedSeconds ?? 0) + dt;
        const progress = Math.min(1, item.elapsedSeconds / item.durationSeconds);
        item.yPercent = SPAWN_Y + (defenseLineY - SPAWN_Y) * progress;

        // Did it reach 0 seconds or hit the defense line?
        const isTimeOut = item.elapsedSeconds >= item.durationSeconds || item.yPercent >= defenseLineY;

        if (isTimeOut) {
          // Break / explode falling object and damage base
          sounds.playDamage();
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 350);

          setMissNotification({
            problem: item.problem,
            timestamp: currentTime,
          });
          setTimeout(() => {
            setMissNotification(curr => (curr && curr.timestamp === currentTime ? null : curr));
          }, 3600);

          statsRef.current.missedCount += 1;
          statsRef.current.combo = 0;
          setCombo(0);
          comboRef.current = 0;
          setActiveComboNotice(null);
          statsRef.current.missedProblems.push({
            problem: item.problem,
            reason: 'timeout',
          });

          // Violent red breach explosion & shockwave right at the contact line
          createExplosion(item.xPercent, defenseLineY, '#ef4444');
          shockwavesRef.current.push({
            id: Math.random().toString(),
            x: item.xPercent,
            y: defenseLineY,
            radius: 2,
            maxRadius: 26,
            color: '#ef4444',
            alpha: 1,
            lineWidth: 3.5,
          });

          // Schedule next question after a 2.5s breather so user can read explanation
          nextSpawnTimeRef.current = currentTime + 2500;
          setIsWaitingNext(true);

          // Decrement HP if in survival mode
          if (modeRef.current === 'survival') {
            setHp(currentHp => {
              const newHp = currentHp - 1;
              if (newHp <= 0) {
                // Game Over!
                sounds.playGameOver();
                cancelAnimationFrame(animId);
                statsRef.current.timeSurvivedSeconds = Math.floor(timeSurvivedRef.current);
                statsRef.current.level = levelRef.current;
                onGameOverRef.current(statsRef.current);
              }
              return newHp;
            });
          } else if (modeRef.current === 'timeattack') {
            timeLeftRef.current = Math.max(0, timeLeftRef.current - 2);
            setTimeLeft(Math.ceil(timeLeftRef.current));
          }
        } else {
          survivingItems.push(item);
        }
      }
      fallingItemsRef.current = survivingItems;

      // Update primary target
      if (survivingItems.length > 0) {
        setTargetedItemId(survivingItems[0].id);
        onTargetChangeRef.current?.(survivingItems[0].problem.func);
      } else {
        setTargetedItemId(null);
      }

      // 3. Update particles
      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx * 0.15,
          y: p.y + p.vy * 0.15,
          alpha: 1 - p.life / p.maxLife,
          life: p.life + 1,
        }))
        .filter(p => p.life < p.maxLife);

      // 4. Update shockwaves
      shockwavesRef.current = shockwavesRef.current
        .map(s => ({
          ...s,
          radius: s.radius + 1.2,
          alpha: Math.max(0, s.alpha - 0.05),
        }))
        .filter(s => s.alpha > 0 && s.radius < s.maxRadius);

      // 5. Update ember sparks when in Fever (combo >= 5)
      if (comboRef.current >= 5) {
        emberCounterRef.current = (emberCounterRef.current + 1) % 4;
        if (emberCounterRef.current === 0) {
          const isUltra = comboRef.current >= 10;
          const emberColors = isUltra
            ? ['#38bdf8', '#c084fc', '#f43f5e', '#fbbf24', '#ffffff']
            : ['#f59e0b', '#fbbf24', '#ef4444', '#f97316'];
          particlesRef.current.push({
            id: Math.random().toString(),
            x: 50 + (Math.random() - 0.5) * 8,
            y: 93,
            vx: (Math.random() - 0.5) * 1.4,
            vy: -(1.6 + Math.random() * 2.8),
            color: emberColors[Math.floor(Math.random() * emberColors.length)],
            size: (isUltra ? 3.5 : 2.5) + Math.random() * 2.5,
            alpha: 1,
            life: 0,
            maxLife: (isUltra ? 35 : 25) + Math.random() * 15,
          });
        }
      }

      // 6. Update lasers
      lasersRef.current = lasersRef.current.filter(l => currentTime - l.createdAt < 220);

      // 5. Update timers
      timeSurvivedRef.current += dt;
      if (modeRef.current === 'timeattack') {
        timeLeftRef.current = Math.max(0, timeLeftRef.current - dt);
        const intTime = Math.ceil(timeLeftRef.current);
        setTimeLeft(prev => prev !== intTime ? intTime : prev);

        if (timeLeftRef.current <= 0) {
          sounds.playLevelUp();
          cancelAnimationFrame(animId);
          statsRef.current.timeSurvivedSeconds = 30;
          statsRef.current.level = levelRef.current;
          onGameOverRef.current(statsRef.current);
          return;
        }
      }

      // 6. Schedule smooth 60fps render
      setRenderTick(t => (t + 1) & 0xffff);

      animId = requestAnimationFrame(loop);
    };

    animationFrameId.current = animId;
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []); // Run on mount only! Game loop runs continuously without teardown.

  // Current primary targeted item
  const primaryTarget = fallingItemsRef.current.find(i => i.id === targetedItemId);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[220px] bg-slate-950 rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300 flex flex-col mx-auto ${
        combo >= 10
          ? 'border-cyan-400 ring-4 ring-cyan-500/40 shadow-[inset_0_0_40px_rgba(6,182,212,0.35),0_0_35px_rgba(168,85,247,0.35)]'
          : combo >= 5
          ? 'border-amber-500/80 ring-2 ring-amber-500/35 shadow-[inset_0_0_25px_rgba(245,158,11,0.25)]'
          : 'border-slate-800/90'
      } ${screenShake ? 'translate-x-1 -translate-y-1' : ''}`}
    >
      {/* Background Starfield / Radial Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Top HUD Bar */}
      <div className="relative z-20 flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900/80 border-b border-slate-800 backdrop-blur-sm">
        {/* Left: Mode & HP */}
        <div className="flex items-center gap-3">
          {mode === 'survival' ? (
            <div className="flex items-center gap-1.5" title="防衛シールド / 体力">
              <span className="text-xs font-mono text-slate-400 mr-1">HP:</span>
              {Array.from({ length: maxHp }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-5 h-5 transition-transform duration-200 ${
                    idx < hp
                      ? 'fill-rose-500 text-rose-500 scale-100'
                      : 'fill-slate-800 text-slate-700 scale-90'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs text-slate-400">残り時間:</span>
              <span className={`text-lg font-bold ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                {Math.ceil(timeLeft)}s
              </span>
            </div>
          )}

          {/* Level indicator */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
            <span>LV.</span>
            <span className="font-bold text-indigo-400">{level}</span>
          </div>
        </div>

        {/* Center: Combo notification & Speed Selector */}
        <div className="flex items-center gap-3">
          {/* Speed Indicator Badge (Read-only as selected in lobby) */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] sm:text-[11px] font-mono shadow-inner">
            <span className="text-slate-400">速度:</span>
            <span className={`font-bold ${
              speedSetting === 'supreme'
                ? 'text-rose-400 font-extrabold'
                : speedSetting === 'fast'
                ? 'text-amber-400'
                : speedSetting === 'normal'
                ? 'text-cyan-400'
                : speedSetting === 'very_slow'
                ? 'text-emerald-400'
                : 'text-teal-400'
            }`}>
              {speedSetting === 'supreme'
                ? '最上級速 (5s)'
                : speedSetting === 'fast'
                ? '速い (6s)'
                : speedSetting === 'normal'
                ? 'ふつう (10s)'
                : speedSetting === 'very_slow'
                ? '最遅 (25s)'
                : 'ゆっくり (15s)'}
            </span>
          </div>

          {combo > 1 && (
            <div className={`flex items-center gap-1 font-mono text-xs sm:text-sm font-extrabold px-2 py-0.5 rounded-lg border animate-bounce ${
              combo >= 10
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                : combo >= 5
                ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-slate-800/80 border-slate-700 text-amber-400'
            }`}>
              {combo >= 10 ? (
                <Zap className="w-4 h-4 fill-cyan-400 text-cyan-300 animate-pulse" />
              ) : (
                <Flame className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
              )}
              <span>{combo} COMBO!</span>
              {combo >= 10 && <span className="text-[10px] text-pink-400 font-black ml-0.5">ULTRA</span>}
              {combo >= 5 && combo < 10 && <span className="text-[10px] text-amber-300 font-black ml-0.5">FEVER</span>}
            </div>
          )}
          {healNotification && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded animate-pulse">
              +1 HP 回復!
            </span>
          )}
        </div>

        {/* Right: Score, Cheat Sheet & Surrender */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">SCORE</span>
            <span className="text-base md:text-xl font-extrabold text-white tabular-nums tracking-tight">
              {score.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setUnitCircleAssistEnabled(prev => !prev)}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
              unitCircleAssistEnabled
                ? 'text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border-cyan-700 shadow-sm'
                : 'text-slate-400 bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
            title={unitCircleAssistEnabled ? '単位円アシストを隠す' : '単位円アシストを表示'}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">単位円:</span>
            <span>{unitCircleAssistEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTrigTable(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-mono text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800/80 rounded transition-colors"
            title="三角比早見表を開く（ゲーム一時停止）"
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">早見表</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = sounds.toggleMute();
              setIsMuted(next);
            }}
            className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            title={isMuted ? 'ミュート解除' : 'ミュート'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onQuit}
            className="px-2 sm:px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            終了
          </button>
        </div>
      </div>

      {/* Miss / Explanation notification banner */}
      {missNotification && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 max-w-md w-[92%] bg-rose-950/95 border border-rose-600/80 rounded-xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-white flex items-center gap-2 mb-1 flex-wrap">
                <span className="shrink-0">防衛ライン突破!</span>
                <div className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm bg-rose-900/60 px-2 py-0.5 rounded border border-rose-700/60">
                  <TrigExpression
                    func={missNotification.problem.func}
                    angleRad={missNotification.problem.angleRad}
                    angleDegree={missNotification.problem.angleDegree}
                    givenValueDisplay={missNotification.problem.givenValueDisplay}
                    problemType={missNotification.problem.problemType}
                    size="sm"
                  />
                  <span className="text-rose-300 font-bold">➔</span>
                  <span className="font-bold text-emerald-300">
                    <MathValueDisplay label={missNotification.problem.correctDisplay} size="sm" />
                  </span>
                </div>
              </div>
              <FormattedMathText
                text={missNotification.problem.explanation}
                className="text-rose-200/90 text-[11px] leading-tight block"
                fractionSize="xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Arena: Left Dock (Unit Circle Assist) + Center Battlefield (Falling items, cannon, defense) */}
      <div className="relative w-full flex-1 min-h-0 flex flex-row overflow-hidden">
        {/* Left Side: Dedicated Unit Circle Radar Assist Dock (Strictly separated from falling corridor) */}
        {unitCircleAssistEnabled && (
          <div className="shrink-0 h-full flex flex-col z-20 pointer-events-auto">
            <UnitCircleInGameAssist
              currentProblem={fallingItemsRef.current[0]?.problem}
              enabled={unitCircleAssistEnabled}
              onToggleEnabled={() => setUnitCircleAssistEnabled(false)}
            />
          </div>
        )}

        {/* Center/Right: Interactive Battlefield Area */}
        <div className="relative flex-1 h-full min-w-0 pointer-events-none overflow-hidden">
        {/* On-Screen Persistent Arcade Combo & Multiplier Gauge (Right Screen Edge) */}
        {combo >= 2 && (() => {
          const currentMultiplier = getComboMultiplier(combo);
          const nextTarget = combo < 3 ? 3 : combo < 5 ? 5 : combo < 10 ? 10 : combo < 15 ? 15 : 20;
          const nextMultiplier = combo < 3 ? 1.2 : combo < 5 ? 1.5 : combo < 10 ? 2.0 : combo < 15 ? 2.5 : 3.0;
          const prevTarget = combo < 3 ? 0 : combo < 5 ? 3 : combo < 10 ? 5 : combo < 15 ? 10 : 15;
          const progressPercent = combo >= 20 ? 100 : Math.min(100, Math.max(0, ((combo - prevTarget) / (nextTarget - prevTarget)) * 100));

          return (
            <div
              key={`combo_edge_display_${combo}`}
              className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3.5 z-25 pointer-events-none flex flex-col items-end transition-all duration-200 select-none ${
                combo >= 15
                  ? 'scale-105 drop-shadow-[0_0_25px_rgba(244,63,94,0.9)] animate-pulse'
                  : combo >= 10
                  ? 'scale-105 drop-shadow-[0_0_20px_rgba(6,182,212,0.85)]'
                  : combo >= 5
                  ? 'scale-100 drop-shadow-[0_0_15px_rgba(245,158,11,0.7)]'
                  : ''
              }`}
            >
              <div className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border-2 flex items-center gap-2 backdrop-blur-md shadow-2xl transition-all ${
                combo >= 15
                  ? 'bg-gradient-to-r from-rose-950/95 via-purple-950/95 to-slate-950/95 border-rose-400 text-white'
                  : combo >= 10
                  ? 'bg-gradient-to-r from-cyan-950/95 via-purple-950/95 to-pink-950/95 border-cyan-400 text-white'
                  : combo >= 5
                  ? 'bg-gradient-to-r from-amber-950/95 via-orange-950/95 to-red-950/95 border-amber-400 text-amber-200'
                  : 'bg-slate-900/95 border-amber-500/80 text-amber-300'
              }`}>
                {/* Icon */}
                {combo >= 15 ? (
                  <Flame className="w-5 h-5 text-rose-400 fill-rose-500 animate-bounce" />
                ) : combo >= 10 ? (
                  <Zap className="w-5 h-5 text-cyan-300 fill-cyan-400 animate-bounce" />
                ) : combo >= 5 ? (
                  <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
                ) : (
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                )}

                {/* Digits & COMBO Label */}
                <div className="flex flex-col items-start leading-none">
                  <div className="flex items-baseline gap-1">
                    <span className={`font-mono font-black text-2xl sm:text-3xl tracking-tighter tabular-nums ${
                      combo >= 15
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-200 to-yellow-300'
                        : combo >= 10
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-200 to-pink-300 animate-pulse'
                        : combo >= 5
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400'
                        : 'text-white'
                    }`}>
                      {combo}
                    </span>
                    <span className="font-mono font-extrabold text-xs sm:text-sm uppercase tracking-wider text-amber-300">
                      COMBO!
                    </span>

                    {/* Multiplier Badge */}
                    {currentMultiplier > 1.0 && (
                      <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-black border shadow-sm ${
                        combo >= 15
                          ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                          : combo >= 10
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 animate-pulse'
                          : combo >= 5
                          ? 'bg-amber-400 text-slate-950 border-amber-200'
                          : 'bg-indigo-500 text-white border-indigo-300'
                      }`}>
                        x{currentMultiplier.toFixed(1)}倍
                      </span>
                    )}
                  </div>

                  <span className={`text-[9px] sm:text-[10px] font-mono font-bold tracking-tight mt-0.5 ${
                    combo >= 15 ? 'text-rose-300' : combo >= 10 ? 'text-cyan-300' : combo >= 5 ? 'text-amber-300' : 'text-slate-400'
                  }`}>
                    {combo >= 20
                      ? '👑 MAX FEVER x3.0倍スコア加算中!'
                      : combo >= 15
                      ? '💥 MAX FEVER x2.5倍スコア加算中!'
                      : combo >= 10
                      ? '⚡ ULTRA FEVER x2.0倍スコア加算中!'
                      : combo >= 5
                      ? '🔥 FEVER x1.5倍スコア加算中!'
                      : combo >= 3
                      ? '✨ x1.2倍スコア加算中!'
                      : 'あと1問で x1.2倍スコア!'}
                  </span>
                </div>
              </div>

              {/* Fever Streak Progress Bar */}
              <div className="w-full h-1.5 bg-slate-950/90 rounded-full mt-1 overflow-hidden border border-slate-700/80 shadow-inner">
                <div
                  className={`h-full transition-all duration-200 ${
                    combo >= 15
                      ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-yellow-300'
                      : combo >= 10
                      ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse'
                      : combo >= 5
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'bg-amber-400'
                  }`}
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />
              </div>
            </div>
          );
        })()}

        {/* Milestone Celebration Banner (5, 10, 15, 20 Combo) - Top-Left Flank away from central lane */}
        {feverMilestoneBanner && (
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3.5 z-30 pointer-events-none select-none max-w-[220px] sm:max-w-[280px] animate-in slide-in-from-left-6 fade-in duration-200">
            <div className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border-2 flex flex-col items-start shadow-2xl backdrop-blur-md ${
              feverMilestoneBanner.tier === 2
                ? 'bg-gradient-to-r from-cyan-950/95 via-purple-950/95 to-pink-950/95 border-cyan-400 text-white ring-2 ring-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.8)]'
                : 'bg-gradient-to-r from-amber-950/95 via-orange-950/95 to-red-950/95 border-amber-400 text-amber-100 ring-2 ring-amber-500/40 shadow-[0_0_28px_rgba(245,158,11,0.7)]'
            }`}>
              <div className="flex items-center gap-1.5">
                {feverMilestoneBanner.tier === 2 ? (
                  <Zap className="w-4 h-4 text-cyan-300 fill-cyan-400 animate-bounce shrink-0" />
                ) : (
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce shrink-0" />
                )}
                <span className="text-xs sm:text-sm font-black font-mono tracking-tight whitespace-nowrap">
                  {feverMilestoneBanner.text}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold mt-0.5 text-slate-200 leading-tight">
                {feverMilestoneBanner.subtext}
              </span>
            </div>
          </div>
        )}

        {/* Floating Combo Score Pop Notice - Positioned on Right Flank below Combo Gauge */}
        {activeComboNotice && (
          <div
            key={activeComboNotice.id}
            className="absolute right-2.5 sm:right-3.5 top-[76px] sm:top-[86px] z-25 pointer-events-none select-none flex flex-col items-end animate-out fade-out slide-out-to-top duration-1000 fill-mode-forwards"
          >
            <div className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border shadow-2xl flex items-center gap-1.5 backdrop-blur-md animate-bounce ${
              activeComboNotice.tier >= 3
                ? 'bg-gradient-to-r from-cyan-950/95 via-indigo-950/95 to-pink-950/95 border-cyan-300 text-white shadow-[0_0_25px_rgba(6,182,212,0.8)]'
                : activeComboNotice.tier === 2
                ? 'bg-gradient-to-r from-amber-950/95 to-orange-950/95 border-amber-300 text-white shadow-[0_0_20px_rgba(245,158,11,0.7)]'
                : 'bg-slate-900/95 border-amber-400 text-amber-300 shadow-xl'
            }`}>
              <span className="font-mono font-black text-xs sm:text-sm tracking-tight text-white flex items-center gap-1">
                {activeComboNotice.tier >= 2 ? (
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                ) : null}
                +{activeComboNotice.points}pt
              </span>
              {activeComboNotice.multiplier > 1.0 && (
                <span className="text-[10px] font-mono font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 px-1.5 py-0.2 rounded shadow-sm">
                  x{activeComboNotice.multiplier.toFixed(1)}倍加算
                </span>
              )}
              <span className="text-[10px] sm:text-[11px] font-mono font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded">
                {activeComboNotice.combo} COMBO!
              </span>
            </div>
          </div>
        )}

        {/* Breather transition message between questions */}
        {isWaitingNext && fallingItemsRef.current.length === 0 && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-mono text-indigo-300 animate-pulse bg-indigo-950/60 border border-indigo-800/60 px-4 py-2 rounded-xl backdrop-blur-xs">
            次の問題 準備中...
          </div>
        )}

        {fallingItemsRef.current.map(item => {
          const isSin = item.problem.func === 'sin' || item.problem.func === 'inv_sin' || item.problem.func === 'inv_rad_sin';
          const isCos = item.problem.func === 'cos' || item.problem.func === 'inv_cos' || item.problem.func === 'inv_rad_cos';
          const isTan = item.problem.func === 'tan' || item.problem.func === 'inv_tan' || item.problem.func === 'inv_rad_tan';
          const isDegToRad = item.problem.func === 'deg_to_rad' || item.problem.problemType === 'inverse_to_rad';

          const duration = item.durationSeconds || SPEED_DURATIONS[speedSettingRef.current] || 10;
          const elapsed = item.elapsedSeconds ?? 0;
          const remainingSeconds = Math.max(0, duration - elapsed);
          const progress = Math.min(1, Math.max(0, elapsed / duration));
          const remainingPercent = Math.max(0, Math.min(100, (remainingSeconds / duration) * 100));

          const themeBorder = isSin
            ? 'border-emerald-400 ring-4 ring-emerald-500/35 shadow-[0_0_35px_rgba(16,185,129,0.55)]'
            : isCos
            ? 'border-cyan-400 ring-4 ring-cyan-500/35 shadow-[0_0_35px_rgba(6,182,212,0.55)]'
            : isTan
            ? 'border-amber-400 ring-4 ring-amber-500/35 shadow-[0_0_35px_rgba(245,158,11,0.55)]'
            : isDegToRad
            ? 'border-violet-400 ring-4 ring-violet-500/35 shadow-[0_0_35px_rgba(168,85,247,0.55)]'
            : 'border-indigo-400 ring-4 ring-indigo-500/35 shadow-[0_0_35px_rgba(99,102,241,0.55)]';

          const themeHeaderBg = isSin
            ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/60'
            : isCos
            ? 'bg-cyan-950/95 text-cyan-300 border-cyan-500/60'
            : isTan
            ? 'bg-amber-950/95 text-amber-300 border-amber-500/60'
            : isDegToRad
            ? 'bg-violet-950/95 text-violet-300 border-violet-500/60'
            : 'bg-indigo-950/95 text-indigo-300 border-indigo-500/60';

          return (
            <div
              key={item.id}
              style={{
                left: `${item.xPercent}%`,
                top: `calc(8px + (${DEFENSE_LINE_Y}% - 8px) * ${progress})`,
                transform: `translate3d(-50%, calc(-100% * ${progress}), 0)`,
                willChange: 'top, transform',
              }}
              className={`absolute flex flex-col items-center select-none ${
                item.hitState === 'wrong' ? 'animate-bounce text-rose-400' : ''
              }`}
            >
              {/* Target Type Pill above the capsule */}
              {item.problem.expectedAnswersCount && item.problem.expectedAnswersCount > 1 ? (
                (item.answeredKeys && item.answeredKeys.length > 0) ? (
                  <div className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-extrabold uppercase tracking-wider border border-emerald-400 bg-emerald-950/95 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-1.5 mb-2 animate-pulse">
                    <span className="bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded text-[9px] font-black">
                      1つ目正解 ✓
                    </span>
                    <span>残り1つの解を入力して撃破！</span>
                  </div>
                ) : (
                  <div className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-extrabold uppercase tracking-wider border shadow-lg flex items-center gap-1.5 mb-2 whitespace-nowrap flex-nowrap ${themeHeaderBg}`}>
                    <Target className="w-3.5 h-3.5 animate-pulse shrink-0" />
                    <span>
                      {item.problem.problemType === 'inverse_to_rad'
                        ? '弧度法 [ rad ] で2つ答えよ'
                        : '度数法 [ ° ] で2つ答えよ'}
                    </span>
                    <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[9px] font-black animate-pulse ml-0.5 shrink-0">
                      解が2つ (2つ入力！)
                    </span>
                  </div>
                )
              ) : (
                <div className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-extrabold uppercase tracking-wider border shadow-lg flex items-center gap-1.5 mb-2 whitespace-nowrap flex-nowrap ${themeHeaderBg}`}>
                  <Target className="w-3.5 h-3.5 animate-pulse shrink-0" />
                  <span>
                    {item.problem.problemType === 'inverse_to_rad'
                      ? '弧度法 [ rad ] で答えよ'
                      : item.problem.problemType === 'inverse_to_deg'
                      ? '度数法 [ ° ] で答えよ'
                      : item.problem.func === 'rad'
                      ? '度数法 [ ° ] に変換'
                      : item.problem.func === 'deg_to_rad'
                      ? '弧度法 [ rad ] に変換'
                      : `${item.problem.func.toUpperCase()} の値を答えよ`}
                  </span>
                </div>
              )}

              {/* Problem Capsule - Large, Vibrant, High-Contrast */}
              <div
                className={`relative px-5 py-3 sm:px-7 sm:py-3.5 rounded-2xl border-2 flex items-center justify-center gap-3 sm:gap-4 bg-slate-900/98 backdrop-blur-md ${themeBorder}`}
              >
                <TrigExpression
                  func={item.problem.func}
                  angleRad={item.problem.angleRad}
                  angleDegree={item.problem.angleDegree}
                  givenValueDisplay={item.problem.givenValueDisplay}
                  domainHint={item.problem.domainHint}
                  problemType={item.problem.problemType}
                  size="xl"
                />

                {/* Subtitle / Multi-answer status badge */}
                <div className="text-xs font-mono text-slate-200 flex flex-col items-center leading-tight border-l border-slate-700/80 pl-3">
                  {item.problem.expectedAnswersCount && item.problem.expectedAnswersCount > 1 ? (
                    item.answeredKeys && item.answeredKeys.length > 0 ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/80 px-1.5 py-0.5 rounded font-mono">
                          {item.problem.correctDisplays?.[item.problem.correctValueKeys?.indexOf(item.answeredKeys[0]) ?? -1] || '済'} ✓
                        </span>
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/80 px-1.5 py-0.5 rounded font-mono animate-pulse">
                          あと 1 つ！
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="font-extrabold text-amber-300 text-xs sm:text-sm">
                          2つの解
                        </span>
                        <span className="text-[9px] text-amber-200 mt-0.5 bg-amber-950/80 border border-amber-600/50 px-1.5 py-0.5 rounded font-bold">
                          2回入力必須
                        </span>
                      </>
                    )
                  ) : (
                    <>
                      <span className="font-extrabold text-white text-xs sm:text-sm">
                        {item.problem.problemType === 'inverse_to_rad'
                          ? '弧度法'
                          : item.problem.problemType === 'inverse_to_deg'
                          ? '度数法'
                          : item.problem.func === 'rad'
                          ? '弧度法'
                          : item.problem.func === 'deg_to_rad'
                          ? '度数法'
                          : `${item.problem.angleDegree}°`}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 bg-slate-800/80 px-1.5 py-0.5 rounded">
                        {item.problem.quadrant === 'axis' ? '軸上の角' : `第${item.problem.quadrant}象限`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Remaining Time Bar & Seconds Display (Strictly matches defense line arrival) */}
              <div className="w-48 sm:w-60 mt-2 flex flex-col items-center gap-1 bg-slate-950/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-lg backdrop-blur-xs">
                <div className="w-full flex items-center justify-between font-mono text-[11px] sm:text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>残り時間</span>
                  </span>
                  <span
                    className={`font-bold tabular-nums ${
                      remainingSeconds <= 3
                        ? 'text-rose-400 animate-pulse font-extrabold text-xs sm:text-sm'
                        : remainingSeconds <= duration * 0.5
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {remainingSeconds.toFixed(1)} 秒
                  </span>
                </div>

                {/* Progress Gauge (Depletes from 100% to 0% in exact sync with remainingSeconds) */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/90 shadow-inner">
                  <div
                    className={`h-full ${
                      remainingPercent <= 25
                        ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                        : remainingPercent <= 50
                        ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                    }`}
                    style={{
                      width: `${remainingPercent}%`,
                      transition: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Defense Contact Point Marker (touches the defense line precisely at remaining = 0s) */}
              <div className="flex flex-col items-center -mt-0.5">
                <div
                  className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${
                    remainingSeconds <= 3 ? 'border-t-rose-500 animate-bounce' : 'border-t-indigo-400'
                  }`}
                />
              </div>
            </div>
          );
        })}

        {/* Lasers & Shockwaves SVG Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
          {shockwavesRef.current.map(s => (
            <circle
              key={s.id}
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={`${s.radius}%`}
              fill="none"
              stroke={s.color}
              strokeWidth={s.lineWidth}
              opacity={s.alpha}
            />
          ))}
          {lasersRef.current.map(laser => (
            <line
              key={laser.id}
              x1={`${laser.startX}%`}
              y1={`${laser.startY}%`}
              x2={`${laser.targetX}%`}
              y2={`${laser.targetY}%`}
              stroke={laser.color}
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-pulse"
            />
          ))}
        </svg>

        {/* Explosion & Ember Particles */}
        {particlesRef.current.map(p => (
          <div
            key={p.id}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.alpha,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute rounded-full pointer-events-none shadow-[0_0_8px_currentColor]"
          />
        ))}

        {/* Defense Barrier Line - Lowered for maximum vertical drop room */}
        <div
          style={{ top: `${DEFENSE_LINE_Y}%` }}
          className="absolute left-0 right-0 border-t-2 border-dashed border-rose-500/70 flex items-center justify-between px-3 sm:px-4 text-[10px] sm:text-xs font-mono text-rose-300 pointer-events-none select-none -translate-y-1/2 z-10"
        >
          <span className="bg-slate-950/90 px-2 sm:px-2.5 py-0.5 rounded border border-rose-900/80 flex items-center gap-1.5 shadow backdrop-blur-xs">
            <Shield className="w-3.5 h-3.5 text-rose-400" /> 防衛ライン
          </span>
          <span className="bg-slate-950/90 px-2 sm:px-2.5 py-0.5 rounded border border-rose-900/80 shadow backdrop-blur-xs">
            到達でダメージ (-1 HP)
          </span>
        </div>

        {/* Bottom Defense Battery / Cannon - Hyper-Energized on Combos */}
        <div className="absolute bottom-1 sm:bottom-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
          <div className="relative">
            <div className={`w-12 h-6 rounded-t-full flex items-center justify-center transition-all duration-300 ${
              combo >= 10
                ? 'bg-gradient-to-t from-cyan-500 via-indigo-500 to-pink-500 shadow-[0_0_35px_rgba(6,182,212,0.95)] animate-pulse'
                : combo >= 5
                ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-[0_0_28px_rgba(245,158,11,0.85)]'
                : 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)]'
            }`}>
              {combo >= 10 ? (
                <Zap className="w-4 h-4 text-white animate-bounce" />
              ) : combo >= 5 ? (
                <Flame className="w-4 h-4 text-white animate-bounce" />
              ) : (
                <Zap className="w-4 h-4 text-white animate-pulse" />
              )}
            </div>
          </div>
          <div className={`w-24 h-1.5 rounded-full border transition-colors duration-300 ${
            combo >= 10
              ? 'bg-cyan-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
              : combo >= 5
              ? 'bg-amber-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.7)]'
              : 'bg-slate-800 border-slate-700'
          }`} />
        </div>

        </div>
      </div>

      {/* Trigonometric Quick Reference Table Modal */}
      <TrigTableModal isOpen={showTrigTable} onClose={() => setShowTrigTable(false)} />
    </div>
  );
};
