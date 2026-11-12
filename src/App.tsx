import React, { useState, useEffect, useCallback } from 'react';
import { GameCanvas, SpeedSetting } from './components/GameCanvas';
import { InputPalette } from './components/InputPalette';
import { UnitCircleExplorer } from './components/UnitCircleExplorer';
import { PracticeMode } from './components/PracticeMode';
import { GameOverModal } from './components/GameOverModal';
import { Header } from './components/Header';
import { TrigTableModal } from './components/TrigTableModal';
import { ScoreRankingBoard } from './components/ScoreRankingBoard';
import { GameDifficulty, GameMode, GameStats, ProblemCategory, RankedScore, TrigFunc, TrigProblem } from './types/trig';
import { sounds } from './utils/audio';
import { loadTopScores, recordScoreResult } from './utils/scoreStorage';
import {
  Shield,
  Zap,
  Clock,
  BookOpen,
  Compass,
  Trophy,
  Flame,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Layers,
  Table,
} from 'lucide-react';

export type DifficultyScores = Record<GameDifficulty, { survival: number; timeattack: number; practice?: number }>;

const DIFFICULTIES: GameDifficulty[] = ['beginner', 'standard', 'advanced', 'supreme'];

const loadDifficultyScores = (): DifficultyScores => {
  const initial: DifficultyScores = {
    beginner: { survival: 0, timeattack: 0 },
    standard: { survival: 0, timeattack: 0 },
    advanced: { survival: 0, timeattack: 0 },
    supreme: { survival: 0, timeattack: 0 },
  };

  if (typeof window === 'undefined') return initial;

  for (const diff of DIFFICULTIES) {
    const survKey = `trig_hs_survival_${diff}`;
    const timeKey = `trig_hs_timeattack_${diff}`;
    const survVal = Number(localStorage.getItem(survKey) || '0');
    const timeVal = Number(localStorage.getItem(timeKey) || '0');
    initial[diff] = {
      survival: isNaN(survVal) ? 0 : survVal,
      timeattack: isNaN(timeVal) ? 0 : timeVal,
    };
  }

  // Fallback migration for legacy global scores
  const legacySurv = Number(localStorage.getItem('trig_high_score_survival') || '0');
  if (legacySurv > 0 && initial.standard.survival === 0) {
    initial.standard.survival = legacySurv;
  }
  const legacyTime = Number(localStorage.getItem('trig_high_score_timeattack') || '0');
  if (legacyTime > 0 && initial.standard.timeattack === 0) {
    initial.standard.timeattack = legacyTime;
  }

  return initial;
};

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'arcade' | 'timeattack' | 'practice' | 'unitcircle'>('arcade');
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'gameover'>('lobby');
  const [showTrigTable, setShowTrigTable] = useState<boolean>(false);

  // Game Configuration
  const [difficulty, setDifficulty] = useState<GameDifficulty>('standard');
  const [speedSetting, setSpeedSetting] = useState<SpeedSetting>('slow');
  const [gameMode, setGameMode] = useState<GameMode>('survival');
  const [category, setCategory] = useState<ProblemCategory>('trig');
  const [includeTan, setIncludeTan] = useState<boolean>(false);
  const [currentTargetFunc, setCurrentTargetFunc] = useState<TrigFunc>('sin');

  // Audio State
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());

  // Input value dispatched from InputPalette to GameCanvas
  const [selectedValueKey, setSelectedValueKey] = useState<string | null>(null);

  // Game Results
  const [lastStats, setLastStats] = useState<GameStats | null>(null);

  // Top 3 Ranked Scores state (Total 3 scores with ranks 1位, 2位, 3位 for current difficulty)
  const [topScores, setTopScores] = useState<RankedScore[]>(() => loadTopScores('standard'));
  const [achievedRank, setAchievedRank] = useState<1 | 2 | 3 | null>(null);

  // Local Storage High Scores by Difficulty
  const [difficultyScores, setDifficultyScores] = useState<DifficultyScores>(loadDifficultyScores);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // How to play toggle modal
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // In-Game Unit Circle Assist state (pre-game toggle, persisted to localStorage)
  const [showUnitCircleAssist, setShowUnitCircleAssist] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('trig_show_circle_assist');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleUnitCircleAssist = (val: boolean) => {
    setShowUnitCircleAssist(val);
    localStorage.setItem('trig_show_circle_assist', String(val));
  };

  // Dynamic landscape detection for tablet 1-screen optimization
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth > window.innerHeight;
  });

  // Centralized difficulty selector that automatically selects 'supreme' speed when 最上級 is chosen
  const handleSelectDifficulty = useCallback((newDiff: GameDifficulty) => {
    setDifficulty(newDiff);
    if (newDiff === 'supreme') {
      setSpeedSetting('supreme');
      setIncludeTan(true);
    }
  }, []);

  // Guarantee that whenever difficulty becomes 'supreme', the speed setting is set to 'supreme' (最上級速 / 5秒)
  useEffect(() => {
    if (difficulty === 'supreme') {
      setSpeedSetting('supreme');
      setIncludeTan(true);
    }
  }, [difficulty]);

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const toggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const handleStartGame = useCallback((mode: GameMode, diff?: GameDifficulty, cat?: ProblemCategory) => {
    const targetDiff = diff || difficulty;
    if (diff) {
      setDifficulty(diff);
      if (diff === 'supreme') {
        setSpeedSetting('supreme');
        setIncludeTan(true);
      }
    }
    if (cat) setCategory(cat);
    if (targetDiff === 'supreme') {
      setSpeedSetting('supreme');
      setIncludeTan(true);
    }
    setGameMode(mode);
    setGameState('playing');
    setSelectedValueKey(null);
  }, [difficulty]);

  const handleGameOver = useCallback((stats: GameStats) => {
    setLastStats(stats);
    setGameState('gameover');

    const currentDiff = difficulty;
    const currentMode: 'survival' | 'timeattack' = gameMode === 'timeattack' ? 'timeattack' : 'survival';
    const currentScore = stats.score;

    // Record score in Top 3 ranking for this difficulty (up to 3 scores total with 1位, 2位, 3位)
    const rankResult = recordScoreResult(stats, currentDiff, currentMode, category);
    setTopScores(rankResult.diffTopScores);
    setAchievedRank(rankResult.achievedDiffRank);
    setIsNewRecord(rankResult.isNewDiffFirst);

    setDifficultyScores(prev => {
      const prevBest = prev[currentDiff]?.[currentMode] || 0;
      const isNew = currentScore > prevBest;
      if (isNew) {
        localStorage.setItem(`trig_hs_${currentMode}_${currentDiff}`, String(currentScore));
        if (currentMode === 'survival') {
          const legacy = Number(localStorage.getItem('trig_high_score_survival') || '0');
          if (currentScore > legacy) localStorage.setItem('trig_high_score_survival', String(currentScore));
        } else {
          const legacy = Number(localStorage.getItem('trig_high_score_timeattack') || '0');
          if (currentScore > legacy) localStorage.setItem('trig_high_score_timeattack', String(currentScore));
        }
        return {
          ...prev,
          [currentDiff]: {
            ...prev[currentDiff],
            [currentMode]: currentScore,
          },
        };
      }
      return prev;
    });
  }, [difficulty, gameMode, category]);


  const handleQuitGame = useCallback(() => {
    setGameState('lobby');
  }, []);

  const handleValueProcessed = useCallback(() => {
    setSelectedValueKey(null);
  }, []);

  const handleWeaknessDrill = (problems: TrigProblem[]) => {
    // Jump straight into practice with focus
    setGameState('lobby');
    setActiveTab('practice');
  };

  return (
    <div className="h-screen h-[100dvh] max-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* 3-Zone Top Bar - Hidden during active gameplay to maximize 16:9 view real estate */}
      {gameState !== 'playing' && (
        <Header
          activeTab={activeTab}
          onSelectTab={tab => {
            setActiveTab(tab);
            setGameState('lobby');
          }}
          onQuickStart={() => handleStartGame('survival', difficulty)}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {/* Main View Area */}
      <main
        className={`flex-1 min-h-0 w-full mx-auto ${
          gameState === 'playing'
            ? 'h-full max-h-full overflow-hidden p-1 sm:p-2 flex items-center justify-center'
            : 'max-w-6xl px-3 sm:px-6 py-2.5 sm:py-4 overflow-y-auto'
        }`}
      >
        {/* VIEW 1: GAME CANVAS & ACTIVE IN-GAME SCREEN (Strict 16:9 Aspect Ratio Container, All Objects Fit in Viewport) */}
        {gameState === 'playing' ? (
          <div className="w-full h-full flex items-center justify-center overflow-hidden select-none">
            <div className="relative aspect-[16/9] w-full max-w-full max-h-full flex flex-row gap-2 sm:gap-2.5 p-1.5 sm:p-2 bg-slate-950/95 rounded-2xl border border-slate-800/90 shadow-2xl overflow-hidden items-stretch justify-between">
              {/* Left Arena: Game Canvas (Hero Battlefield with full vertical drop room) */}
              <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
                <GameCanvas
                  difficulty={difficulty}
                  mode={gameMode}
                  category={category}
                  includeTan={includeTan || difficulty === 'advanced' || difficulty === 'supreme'}
                  onGameOver={handleGameOver}
                  onQuit={handleQuitGame}
                  externalSelectedValueKey={selectedValueKey}
                  onValueProcessed={handleValueProcessed}
                  showUnitCircleAssist={showUnitCircleAssist}
                  onTargetChange={setCurrentTargetFunc}
                  initialSpeedSetting={speedSetting}
                />
              </div>

              {/* Right Panel: Tactical Interception Console & Keypad (Fixed within 16:9) */}
              <div className="w-[310px] sm:w-[340px] md:w-[370px] lg:w-[400px] xl:w-[430px] max-w-[42%] shrink-0 h-full p-2 bg-slate-900/95 rounded-2xl border border-slate-800/90 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden">
                <InputPalette
                  onSelectValue={val => setSelectedValueKey(val)}
                  includeTan={includeTan || difficulty === 'advanced' || difficulty === 'supreme'}
                  activeTargetFunc={currentTargetFunc}
                  showShortcuts={true}
                  isSidebar={true}
                />
              </div>
            </div>
          </div>
        ) : activeTab === 'practice' ? (
          /* VIEW 2: STEP PRACTICE MODE */
          <PracticeMode onStartArcade={() => handleStartGame('survival', 'standard')} />
        ) : activeTab === 'unitcircle' ? (
          /* VIEW 3: UNIT CIRCLE INTERACTIVE EXPLORER */
          <div className="space-y-6">
            <UnitCircleExplorer initialAngle="π/3" compact={false} />
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">理解できたら防衛戦へ！</h4>
                <p className="text-xs text-slate-400">直感でsin/cos/tanの値が浮かぶようになるまで鍛えよう</p>
              </div>
              <button
                onClick={() => handleStartGame('survival', 'standard')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-lg shadow transition-colors"
              >
                サバイバル戦を開始
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 4: LOBBY & MODE SELECTION */
          <div className="space-y-6">
            {/* Hero Banner Section */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-5 md:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl relative z-10 space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-mono">
                  <Zap className="w-3.5 h-3.5" />
                  <span>体力制・反射神経数学アクション</span>
                </div>

                <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  三角比などを落ち着いて迎撃せよ。
                </h1>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  上から<span className="text-indigo-300 font-semibold">1問ずつゆっくり</span>落下してくる{' '}
                  <span className="text-emerald-400 font-mono font-bold">sin π/2</span> や{' '}
                  <span className="text-amber-400 font-mono font-bold">sin <span className="math-theta">θ</span> = 1/2</span> (度数法で回答)、{' '}
                  <span className="text-cyan-400 font-mono font-bold">π/3 rad</span> (度数法で回答)、{' '}
                  <span className="text-violet-400 font-mono font-bold">60°</span> (弧度法で回答) を迎撃！
                </p>

                {/* Primary CTA and Quick Guide Button */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    onClick={() => handleStartGame('survival', difficulty, category)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    ゲーム開始
                  </button>

                  <button
                    onClick={() => {
                      setDifficulty('supreme');
                      setSpeedSetting('supreme');
                      setIncludeTan(true);
                      handleStartGame('survival', 'supreme');
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-95 border border-rose-400/30"
                  >
                    <Flame className="w-4 h-4 fill-current text-amber-200" />
                    最上級モード (HP1 / 5秒落下)
                  </button>

                  <button
                    onClick={() => handleStartGame('timeattack', difficulty, category)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-colors"
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    30秒タイムアタック
                  </button>

                  <button
                    onClick={() => setShowTrigTable(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 font-semibold text-xs sm:text-sm rounded-xl border border-cyan-800/80 transition-colors"
                  >
                    <Table className="w-4 h-4" />
                    三角比早見表
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleUnitCircleAssist(!showUnitCircleAssist)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                      showUnitCircleAssist
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700 hover:bg-cyan-900/90 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                    title="ゲーム中の画面左下に問題の角度を示す単位円レーダーを表示します"
                  >
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>単位円アシスト: {showUnitCircleAssist ? '表示 ON' : '非表示 OFF'}</span>
                  </button>

                  <button
                    onClick={() => setShowHowToPlay(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    遊び方・コツ
                  </button>
                </div>
              </div>

              {/* High Scores by Difficulty Overview Section */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>各難易度の最高スコア記録</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                    ※防衛戦 & 30秒タイムアタックの各難易度自己ベスト
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  {[
                    { id: 'beginner' as const, label: '初級', color: 'text-emerald-400', border: 'border-emerald-800/60' },
                    { id: 'standard' as const, label: '中級', color: 'text-cyan-400', border: 'border-cyan-800/60' },
                    { id: 'advanced' as const, label: '上級', color: 'text-amber-400', border: 'border-amber-800/60' },
                    { id: 'supreme' as const, label: '最上級', color: 'text-rose-300 font-extrabold', border: 'border-rose-600/80' },
                  ].map(d => {
                    const surv = difficultyScores[d.id]?.survival || 0;
                    const time = difficultyScores[d.id]?.timeattack || 0;
                    const isSelected = difficulty === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => handleSelectDifficulty(d.id)}
                        className={`p-2 rounded-xl bg-slate-950/80 border transition-all cursor-pointer ${
                          isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-950/30' : `${d.border} hover:border-slate-600`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold ${d.color}`}>{d.label}</span>
                          {isSelected && <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 rounded">選択中</span>}
                        </div>
                        <div className="text-[11px] text-slate-300 flex items-center justify-between">
                          <span className="text-slate-400 text-[10px]">防衛:</span>
                          <span className="font-bold text-white tabular-nums">{surv > 0 ? `${surv.toLocaleString()}点` : '-'}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 flex items-center justify-between mt-0.5">
                          <span className="text-slate-400 text-[10px]">30s:</span>
                          <span className="font-bold text-amber-400 tabular-nums">{time > 0 ? `${time.toLocaleString()}点` : '-'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* TOP 3 Score Ranking Board (難易度別 1位, 2位, 3位の順位付き記録) */}
            <ScoreRankingBoard
              currentDifficulty={difficulty}
              onDifficultyChange={handleSelectDifficulty}
              onScoresReset={() => setTopScores(loadTopScores(difficulty))}
            />

            {/* Problem Type / Category Selector */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>出題コンテンツ（回答形式・タイプ）</span>
                </h3>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  度数法・弧度法変換 ＆ 三角方程式 ＆ 三角比の値を選択可能
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {/* 1. 三角方程式 角度当て (度数法) */}
                <button
                  type="button"
                  onClick={() => setCategory('inverse_deg')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    category === 'inverse_deg'
                      ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm text-amber-300">① 方程式 (度数法回答)</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                      解が2つ (度数法)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    <span className="text-white font-mono">cos θ = -1/2</span> から <span className="text-white font-mono">θ = 120°, 240°</span> など、方程式の2つの解を度数法で両方答えて迎撃！
                  </p>
                </button>

                {/* 2. 弧度法 ➔ 度数法 */}
                <button
                  type="button"
                  onClick={() => setCategory('radian')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    category === 'radian'
                      ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm text-cyan-300">② 弧度法 ➔ 度数法</span>
                    <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded">
                      度数法回答
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    <span className="text-white font-mono">π/4</span> や <span className="text-white font-mono">2π/3</span> (rad) が降下。度数法（<span className="text-white font-mono">45°, 120°</span>）で迎撃！
                  </p>
                </button>

                {/* 3. 度数法 ➔ 弧度法 */}
                <button
                  type="button"
                  onClick={() => setCategory('deg_to_rad')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    category === 'deg_to_rad'
                      ? 'bg-violet-950/50 border-violet-500 ring-2 ring-violet-500/20 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm text-violet-300">③ 度数法 ➔ 弧度法</span>
                    <span className="text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 px-1.5 py-0.2 rounded">
                      弧度法回答
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    <span className="text-white font-mono">60°</span> や <span className="text-white font-mono">135°</span> が降下。弧度法（<span className="text-white font-mono">π/3, 3π/4</span>）キーで迎撃！
                  </p>
                </button>

                {/* 4. 三角方程式 角度当て (弧度法) [新] */}
                <button
                  type="button"
                  onClick={() => setCategory('inverse_rad')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    category === 'inverse_rad'
                      ? 'bg-violet-950/50 border-violet-500 ring-2 ring-violet-500/20 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm text-violet-300">④ 方程式 (弧度法回答) [新]</span>
                    <span className="text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 px-1.5 py-0.2 rounded">
                      解が2つ (弧度法)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    <span className="text-white font-mono">sin θ = 1/2</span> から <span className="text-white font-mono">θ = π/6, 5π/6</span> など、方程式の2つの解を両方入力して迎撃！
                  </p>
                </button>

                {/* 5. 三角関数の値 (弧度法) */}
                <button
                  type="button"
                  onClick={() => setCategory('trig')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    category === 'trig'
                      ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm text-emerald-300">⑤ 三角関数の値 (弧度法)</span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                      値で回答
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    <span className="text-white font-mono">sin π/3</span> や <span className="text-white font-mono">cos 5π/6</span> が降下。数値キー（<span className="text-white font-mono">√3/2</span>など）で迎撃！
                  </p>
                </button>

                {/* 6. 三角比の値 (度数法) */}
                <button
                  type="button"
                  onClick={() => setCategory('deg_trig')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    category === 'deg_trig'
                      ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm text-emerald-300">⑥ 三角比の値 (度数法)</span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                      値で回答
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    問題が度数法で表記（<span className="text-white font-mono">sin 60°</span> や <span className="text-white font-mono">cos 150°</span>）。数値キーで迎撃！
                  </p>
                </button>
              </div>
            </div>

            {/* Speed Selection Section - Configured to exact user times */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>落下速度を選択 (ゲーム開始前の速度設定)</span>
                </h3>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  ※ゲーム開始前に選択した速度でプレイします（ゲーム中の誤操作防止）
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  {
                    id: 'very_slow' as const,
                    name: '最遅',
                    time: '約25秒',
                    desc: '超ゆったり。考えながら解きたい方向け',
                    borderActive: 'border-emerald-500 ring-emerald-500/30 bg-emerald-950/40',
                    tagBg: 'bg-emerald-950 text-emerald-300 border-emerald-800',
                    textColor: 'text-emerald-400',
                  },
                  {
                    id: 'slow' as const,
                    name: 'ゆっくり',
                    time: '15秒',
                    desc: '15秒かけてゆっくり落下（落ち着いて計算）',
                    borderActive: 'border-teal-500 ring-teal-500/30 bg-teal-950/40',
                    tagBg: 'bg-teal-950 text-teal-300 border-teal-800',
                    textColor: 'text-teal-400',
                  },
                  {
                    id: 'normal' as const,
                    name: 'ふつう',
                    time: '10秒',
                    desc: '10秒で落下（標準スピード）',
                    borderActive: 'border-cyan-500 ring-cyan-500/30 bg-cyan-950/40',
                    tagBg: 'bg-cyan-950 text-cyan-300 border-cyan-800',
                    textColor: 'text-cyan-400',
                  },
                  {
                    id: 'fast' as const,
                    name: '速い',
                    time: '6秒',
                    desc: '6秒で落下（ハイスピード反射勝負！）',
                    borderActive: 'border-rose-500 ring-rose-500/30 bg-rose-950/40',
                    tagBg: 'bg-rose-950 text-rose-300 border-rose-800',
                    textColor: 'text-rose-400',
                  },
                  {
                    id: 'supreme' as const,
                    name: '最上級速',
                    time: '5秒',
                    desc: '5秒で落下（最上級モード標準・極限の超高速反射！）',
                    borderActive: 'border-rose-500 ring-rose-500/50 bg-rose-950/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
                    tagBg: 'bg-rose-900 text-rose-200 border-rose-500',
                    textColor: 'text-rose-300 font-extrabold',
                  },
                ].map(opt => {
                  const isSelected = speedSetting === opt.id;
                  const isMatchedToSupreme = difficulty === 'supreme' && opt.id === 'supreme';
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSpeedSetting(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? `${opt.borderActive} ring-2 text-white`
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-sm ${opt.textColor} flex items-center gap-1`}>
                          <span>{opt.name}</span>
                          {isMatchedToSupreme && (
                            <span className="text-[8px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 py-0.2 rounded font-mono font-bold">
                              連動中
                            </span>
                          )}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${opt.tagBg}`}>
                          {opt.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selection Cards */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>出題範囲・難易度を選択</span>
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Unit Circle Assist toggle */}
                  <label className={`flex items-center gap-2 cursor-pointer text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                    showUnitCircleAssist
                      ? 'bg-cyan-950/70 text-cyan-300 border-cyan-700/80 shadow-xs'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={showUnitCircleAssist}
                      onChange={e => handleToggleUnitCircleAssist(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-800"
                    />
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ゲーム中 単位円アシスト: {showUnitCircleAssist ? 'ON' : 'OFF'}</span>
                  </label>

                  {/* Tan toggle */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeTan}
                      onChange={e => setIncludeTan(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                    />
                    <span>tan (正接・傾き) も出題に含める</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Beginner */}
                <div
                  onClick={() => handleSelectDifficulty('beginner')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    difficulty === 'beginner'
                      ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm sm:text-base">初級 (基本)</span>
                      <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                        HP 5
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      角度: <span className="font-mono text-slate-200">0 〜 π/2 (90°)</span>
                      <br />
                      第1象限の基本角 (0, π/6, π/4, π/3, π/2) のみ。sin & cos の基本値を固めるのに最適。
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>最高:</span>
                    </span>
                    <span className="text-white font-bold tabular-nums">
                      {difficultyScores.beginner.survival > 0 ? `${difficultyScores.beginner.survival.toLocaleString()}点` : '未挑戦'}
                    </span>
                    <span className="text-amber-400 font-bold ml-1 tabular-nums">
                      (30s: {difficultyScores.beginner.timeattack > 0 ? `${difficultyScores.beginner.timeattack.toLocaleString()}点` : '-'})
                    </span>
                  </div>
                </div>

                {/* Standard */}
                <div
                  onClick={() => handleSelectDifficulty('standard')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    difficulty === 'standard'
                      ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm sm:text-base">中級 (標準)</span>
                      <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded">
                        HP 4
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      角度: <span className="font-mono text-slate-200">0 〜 π (180°)</span>
                      <br />
                      第1・第2象限。cosの負の値 (-1/2, -√3/2 など) が混ざり、符号の判断力が試されます。
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>最高:</span>
                    </span>
                    <span className="text-white font-bold tabular-nums">
                      {difficultyScores.standard.survival > 0 ? `${difficultyScores.standard.survival.toLocaleString()}点` : '未挑戦'}
                    </span>
                    <span className="text-amber-400 font-bold ml-1 tabular-nums">
                      (30s: {difficultyScores.standard.timeattack > 0 ? `${difficultyScores.standard.timeattack.toLocaleString()}点` : '-'})
                    </span>
                  </div>
                </div>

                {/* Advanced */}
                <div
                  onClick={() => handleSelectDifficulty('advanced')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    difficulty === 'advanced'
                      ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm sm:text-base">上級 (実戦)</span>
                      <span className="text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded">
                        HP 3
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      角度: <span className="font-mono text-slate-200">0 〜 2π (360°)</span>
                      <br />
                      全4象限を網羅。sin, cos, tan 全てが出題。大学入試・共通テスト対策に直結！
                    </p>
                    <div className="text-[11px] font-mono text-amber-400">全方位・tan含む</div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>最高:</span>
                    </span>
                    <span className="text-white font-bold tabular-nums">
                      {difficultyScores.advanced.survival > 0 ? `${difficultyScores.advanced.survival.toLocaleString()}点` : '未挑戦'}
                    </span>
                    <span className="text-amber-400 font-bold ml-1 tabular-nums">
                      (30s: {difficultyScores.advanced.timeattack > 0 ? `${difficultyScores.advanced.timeattack.toLocaleString()}点` : '-'})
                    </span>
                  </div>
                </div>

                {/* Supreme - 最上級 */}
                <div
                  onClick={() => handleSelectDifficulty('supreme')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                    difficulty === 'supreme'
                      ? 'bg-gradient-to-b from-rose-950/70 to-slate-950 border-rose-500 ring-2 ring-rose-500/50 shadow-xl shadow-rose-950/80'
                      : 'bg-slate-900/80 border-slate-800 hover:border-rose-900/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-rose-300 text-sm sm:text-base flex items-center gap-1">
                        <Flame className="w-4 h-4 text-rose-400 fill-current" />
                        <span>最上級 (極限)</span>
                      </span>
                      <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-600 px-1.5 py-0.5 rounded font-extrabold animate-pulse">
                        HP 1
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      <span className="text-rose-400 font-bold">HP 1（一撃死）</span>・<span className="text-amber-300 font-bold">5秒で超速落下</span>！
                      <br />
                      全範囲から出る総合問題（sin/cos/tan・度数法・弧度法変換・三角方程式）。
                    </p>
                    <div className="text-[11px] font-mono text-rose-400 font-extrabold flex items-center gap-1">
                      <span>⚡ 5秒超速・全範囲</span>
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-rose-900/60 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-rose-300 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>最高:</span>
                    </span>
                    <span className="text-white font-bold tabular-nums">
                      {difficultyScores.supreme.survival > 0 ? `${difficultyScores.supreme.survival.toLocaleString()}点` : '未挑戦'}
                    </span>
                    <span className="text-amber-400 font-bold ml-1 tabular-nums">
                      (30s: {difficultyScores.supreme.timeattack > 0 ? `${difficultyScores.supreme.timeattack.toLocaleString()}点` : '-'})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Practice & Unit Circle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setActiveTab('practice')}
                className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">ステップ学習 & 練習モード</h4>
                    <p className="text-xs text-slate-400">制限時間・体力減衰なしでじっくり確認</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  単位円のアシスト図を見ながら、第1象限から順番に解き進められます。問題ごとの詳しい解説付き。
                </p>
              </div>

              <div
                onClick={() => setActiveTab('unitcircle')}
                className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-cyan-600/10 text-cyan-400 rounded-lg group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">単位円インタラクティブ早見表</h4>
                    <p className="text-xs text-slate-400">円上の角をクリックして直感理解</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  x座標=cos、y座標=sin、傾き=tan の関係をカラーラインで可視化。有名三角形の比率もすぐ確認できます。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER MODAL */}
        {gameState === 'gameover' && lastStats && (
          <GameOverModal
            stats={lastStats}
            difficulty={difficulty}
            mode={gameMode}
            topScores={topScores}
            achievedRank={achievedRank}
            highScoreForDifficulty={
              difficultyScores[difficulty]?.[gameMode === 'timeattack' ? 'timeattack' : 'survival'] || 0
            }
            isNewRecord={isNewRecord}
            onRestart={() => handleStartGame(gameMode, difficulty)}
            onWeaknessDrill={handleWeaknessDrill}
            onOpenUnitCircle={() => {
              setGameState('lobby');
              setActiveTab('unitcircle');
            }}
            onBackToMenu={() => setGameState('lobby')}
          />
        )}

        {/* HOW TO PLAY MODAL */}
        {showHowToPlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden select-none">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg landscape:max-w-3xl w-full p-4 sm:p-6 text-slate-100 shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <span>遊び方 & 三角比などの攻略の極意</span>
                </h3>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="text-slate-400 hover:text-white text-xs sm:text-sm font-mono px-2 py-1"
                >
                  ✕ 閉じる
                </button>
              </div>

              <div className="grid grid-cols-1 landscape:grid-cols-2 gap-2.5 py-3 text-xs leading-relaxed text-slate-300 overflow-y-auto flex-1 min-h-0 pr-1">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">1. ルール (体力制防衛)</span>
                  上から落下してくる三角比など（例: <span className="font-mono text-white">sin π/2</span> や{' '}
                  <span className="font-mono text-white">cos π/3</span>）に対して、迎撃パレットから正しい値を選んで撃破します。
                  <strong className="text-rose-400">回答を間違えた場合や防衛ラインに到達された場合にHPが1減ります。</strong>HPが0になるとゲームオーバーです。
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-bold text-emerald-300 block mb-1">2. 単位円の基本イメージ</span>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <span className="font-mono font-bold text-cyan-300">cos <span className="math-theta">θ</span></span> = 単位円上の点の{' '}
                      <strong className="text-white">x座標 (横幅)</strong>
                    </li>
                    <li>
                      <span className="font-mono font-bold text-emerald-300">sin <span className="math-theta">θ</span></span> = 単位円上の点の{' '}
                      <strong className="text-white">y座標 (高さ)</strong>
                    </li>
                    <li>
                      <span className="font-mono font-bold text-amber-300">tan <span className="math-theta">θ</span></span> = 動径の{' '}
                      <strong className="text-white">傾き (y/x)</strong>
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-bold text-amber-300 block mb-1">3. 有名角の3段階の長さ</span>
                  30°, 45°, 60°の直角三角形では、長さは{' '}
                  <span className="font-mono text-white">1/2 (短い ≈ 0.5)</span>、
                  <span className="font-mono text-white">√2/2 (中間 ≈ 0.7)</span>、
                  <span className="font-mono text-white">√3/2 (長い ≈ 0.87)</span> の3種類だけ！
                  縦と横の長短を見極めれば一瞬で解けます。
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-bold text-indigo-300 block mb-1">4. キーボード操作（PC）</span>
                  画面クリックだけでなく、キーボードでも高速入力できます：
                  <br />
                  <span className="font-mono text-slate-300">
                    A: 0 / S: 1/2 / D: √2/2 / F: √3/2 / G: 1<br />
                    Z: -1 / X: -√3/2 / C: -√2/2 / V: -1/2
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white rounded-lg transition-colors shrink-0"
              >
                理解した！ゲームに戻る
              </button>
            </div>
          </div>
        )}

        {/* TRIGONOMETRIC RATIO QUICK REFERENCE TABLE MODAL */}
        <TrigTableModal isOpen={showTrigTable} onClose={() => setShowTrigTable(false)} />
      </main>

      {/* Footer - hidden during active play to ensure tablet 1-screen fit */}
      {gameState !== 'playing' && (
        <footer className="border-t border-slate-900 py-3 sm:py-4 text-center text-xs text-slate-400 font-mono shrink-0">
          Trigonometric functions GAME · 高校数学 三角比などの値(sin, cos, tan) 即答マスター
        </footer>
      )}
    </div>
  );
}
