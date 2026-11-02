export type TrigFunc =
  | 'sin'
  | 'cos'
  | 'tan'
  | 'rad'
  | 'deg_to_rad'
  | 'inv_sin'
  | 'inv_cos'
  | 'inv_tan'
  | 'inv_rad_sin'
  | 'inv_rad_cos'
  | 'inv_rad_tan';

export type ProblemCategory =
  | 'trig'
  | 'deg_trig'
  | 'radian'
  | 'deg_to_rad'
  | 'inverse_deg'
  | 'inverse_rad'
  | 'degree_all';

export type ExactValueKey =
  | '-1'
  | '-sqrt3/2'
  | '-sqrt2/2'
  | '-1/2'
  | '0'
  | '1/2'
  | 'sqrt2/2'
  | 'sqrt3/2'
  | '1'
  | '-sqrt3'
  | '-1_tan'
  | '-1/sqrt3'
  | '0_tan'
  | '1/sqrt3'
  | '1_tan'
  | 'sqrt3'
  | 'undefined';

export interface ExactValueItem {
  key: string; // e.g. "sqrt3/2", "-1/2", "undefined"
  label: string; // Plain text fallback
  numerator?: string; // for rendering fraction numerator (e.g. "√3")
  denominator?: string; // (e.g. "2")
  isNegative?: boolean;
  isUndefined?: boolean;
  valueNumeric: number | null; // numeric approx for comparisons
  type: 'sin_cos' | 'tan' | 'both';
  shortcutKey?: string; // keyboard shortcut
}

export interface DegreeValueItem {
  degree: number;
  label: string; // e.g. "60°"
  key: string; // e.g. "deg_60"
  radRef: string; // e.g. "π/3"
  shortcutKey?: string;
}

export interface RadianValueItem {
  radStr: string;
  label: string; // e.g. "π/3"
  key: string; // e.g. "rad_π/3"
  degree: number; // e.g. 60
  shortcutKey?: string;
}

export interface TrigProblem {
  id: string;
  func: TrigFunc;
  problemType: 'trig_value' | 'rad_to_deg' | 'deg_to_rad' | 'deg_trig_value' | 'inverse_to_deg' | 'inverse_to_rad';
  angleRad: string; // e.g. "π/3", "3π/4", "0"
  angleDegree: number; // e.g. 60
  angleNumericRad: number; // e.g. Math.PI / 3
  givenValueDisplay?: string; // e.g. "1/2" for sin θ = 1/2
  correctValueKey: string; // matched against ExactValueItem.key or DegreeValueItem.key or RadianValueItem.key
  correctDisplay: string; // e.g. "√3/2" or "60°" or "30°, 150°"
  correctValueKeys?: string[]; // for multi-answer equations, e.g. ["deg_30", "deg_150"]
  correctDisplays?: string[]; // e.g. ["30°", "150°"]
  expectedAnswersCount?: number; // 1 or 2 answers required
  quadrant: 1 | 2 | 3 | 4 | 'axis';
  explanation: string;
  triangleHint?: string; // e.g. "30°-60°-90° (1:2:√3)"
  domainHint?: string; // e.g. "0° ≦ θ < 360°"
}

export interface FallingItem {
  id: string;
  problem: TrigProblem;
  xPercent: number; // 10% to 90%
  yPercent: number; // 0% (top) to 100% (hit line)
  speed: number; // % per second
  durationSeconds: number; // exact seconds to reach defense line
  elapsedSeconds?: number;
  hpMax: number;
  hpCurrent: number;
  isTargeted?: boolean;
  hitState?: 'normal' | 'hit' | 'wrong';
  createdAt: number;
  answeredKeys?: string[]; // keys already successfully answered for multi-answer problems
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface LaserBeam {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  color: string;
  progress: number; // 0 to 1
  createdAt: number;
}

export type SpeedSetting = 'very_slow' | 'slow' | 'normal' | 'fast' | 'supreme';
export type GameDifficulty = 'beginner' | 'standard' | 'advanced' | 'supreme';
export type GameMode = 'survival' | 'timeattack' | 'practice';

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  wrongCount: number;
  missedCount: number;
  accuracy: number;
  timeSurvivedSeconds: number;
  level: number;
  missedProblems: Array<{
    problem: TrigProblem;
    userAnswer?: string;
    reason: 'timeout' | 'wrong';
  }>;
}

export interface RankedScore {
  id: string;
  rank: 1 | 2 | 3;
  score: number;
  difficulty: GameDifficulty;
  mode: GameMode;
  category?: ProblemCategory;
  accuracy: number;
  maxCombo: number;
  correctCount: number;
  date: string;
  timestamp: number;
}

