import { DegreeValueItem, ExactValueItem, GameDifficulty, ProblemCategory, RadianValueItem, TrigProblem } from '../types/trig';

// Standard values for answers in sin & cos
export const SIN_COS_VALUES: ExactValueItem[] = [
  { key: '-1', label: '-1', isNegative: true, valueNumeric: -1, type: 'sin_cos', shortcutKey: 'Z' },
  { key: '-sqrt3/2', label: '-√3/2', numerator: '√3', denominator: '2', isNegative: true, valueNumeric: -Math.sqrt(3) / 2, type: 'sin_cos', shortcutKey: 'X' },
  { key: '-sqrt2/2', label: '-√2/2', numerator: '√2', denominator: '2', isNegative: true, valueNumeric: -Math.SQRT1_2, type: 'sin_cos', shortcutKey: 'C' },
  { key: '-1/2', label: '-1/2', numerator: '1', denominator: '2', isNegative: true, valueNumeric: -0.5, type: 'sin_cos', shortcutKey: 'V' },
  { key: '0', label: '0', valueNumeric: 0, type: 'sin_cos', shortcutKey: 'A' },
  { key: '1/2', label: '1/2', numerator: '1', denominator: '2', valueNumeric: 0.5, type: 'sin_cos', shortcutKey: 'S' },
  { key: 'sqrt2/2', label: '√2/2', numerator: '√2', denominator: '2', valueNumeric: Math.SQRT1_2, type: 'sin_cos', shortcutKey: 'D' },
  { key: 'sqrt3/2', label: '√3/2', numerator: '√3', denominator: '2', valueNumeric: Math.sqrt(3) / 2, type: 'sin_cos', shortcutKey: 'F' },
  { key: '1', label: '1', valueNumeric: 1, type: 'sin_cos', shortcutKey: 'G' },
];

// Standard values for answers in tan
export const TAN_VALUES: ExactValueItem[] = [
  { key: '-sqrt3', label: '-√3', isNegative: true, numerator: '√3', valueNumeric: -Math.sqrt(3), type: 'tan', shortcutKey: 'Q' },
  { key: '-1', label: '-1', isNegative: true, valueNumeric: -1, type: 'tan', shortcutKey: 'W' },
  { key: '-1/sqrt3', label: '-1/√3', numerator: '1', denominator: '√3', isNegative: true, valueNumeric: -1 / Math.sqrt(3), type: 'tan', shortcutKey: 'E' },
  { key: '0', label: '0', valueNumeric: 0, type: 'tan', shortcutKey: 'R' },
  { key: '1/sqrt3', label: '1/√3', numerator: '1', denominator: '√3', valueNumeric: 1 / Math.sqrt(3), type: 'tan', shortcutKey: 'T' },
  { key: '1', label: '1', valueNumeric: 1, type: 'tan', shortcutKey: 'Y' },
  { key: 'sqrt3', label: '√3', valueNumeric: Math.sqrt(3), type: 'tan', shortcutKey: 'U' },
  { key: 'undefined', label: 'なし', isUndefined: true, valueNumeric: null, type: 'tan', shortcutKey: 'I' },
];

export interface AngleInfo {
  radStr: string;
  degree: number;
  radNum: number;
  quadrant: 1 | 2 | 3 | 4 | 'axis';
  sinKey: string;
  cosKey: string;
  tanKey: string;
  sinDisplay: string;
  cosDisplay: string;
  tanDisplay: string;
  explanation: {
    sin: string;
    cos: string;
    tan: string;
  };
  triangleNote?: string;
}

export const ANGLE_DATABASE: AngleInfo[] = [
  // 0 / 2π
  {
    radStr: '0',
    degree: 0,
    radNum: 0,
    quadrant: 'axis',
    sinKey: '0',
    cosKey: '1',
    tanKey: '0',
    sinDisplay: '0',
    cosDisplay: '1',
    tanDisplay: '0',
    explanation: {
      sin: '角0はx軸正の向き。単位円上の点(1, 0)のy座標は 0 です。',
      cos: '角0はx軸正の向き。単位円上の点(1, 0)のx座標は 1 です。',
      tan: '傾き(y/x) = 0/1 = 0 です。',
    },
    triangleNote: 'x軸上 (1, 0)',
  },
  // π/6 (30°)
  {
    radStr: 'π/6',
    degree: 30,
    radNum: Math.PI / 6,
    quadrant: 1,
    sinKey: '1/2',
    cosKey: 'sqrt3/2',
    tanKey: '1/sqrt3',
    sinDisplay: '1/2',
    cosDisplay: '√3/2',
    tanDisplay: '1/√3',
    explanation: {
      sin: '第1象限の30°。縦(y座標)は短く 1/2 です。',
      cos: '第1象限の30°。横(x座標)は長く √3/2 です。',
      tan: '傾きは 1/√3 (√3/3) です。',
    },
    triangleNote: '30°-60°-90° 直角三角形 (1:2:√3)',
  },
  // π/4 (45°)
  {
    radStr: 'π/4',
    degree: 45,
    radNum: Math.PI / 4,
    quadrant: 1,
    sinKey: 'sqrt2/2',
    cosKey: 'sqrt2/2',
    tanKey: '1',
    sinDisplay: '√2/2',
    cosDisplay: '√2/2',
    tanDisplay: '1',
    explanation: {
      sin: '第1象限の45°。直角二等辺三角形より y = 1/√2 = √2/2 です。',
      cos: '第1象限の45°。直角二等辺三角形より x = 1/√2 = √2/2 です。',
      tan: '45°の傾きは 1 です。',
    },
    triangleNote: '45°-45°-90° 直角二等辺三角形 (1:1:√2)',
  },
  // π/3 (60°)
  {
    radStr: 'π/3',
    degree: 60,
    radNum: Math.PI / 3,
    quadrant: 1,
    sinKey: 'sqrt3/2',
    cosKey: '1/2',
    tanKey: 'sqrt3',
    sinDisplay: '√3/2',
    cosDisplay: '1/2',
    tanDisplay: '√3',
    explanation: {
      sin: '第1象限の60°。縦(y座標)は長く √3/2 です。',
      cos: '第1象限の60°。横(x座標)は短く 1/2 です。',
      tan: '急な傾きで √3 です。',
    },
    triangleNote: '30°-60°-90° 直角三角形 (1:2:√3)',
  },
  // π/2 (90°)
  {
    radStr: 'π/2',
    degree: 90,
    radNum: Math.PI / 2,
    quadrant: 'axis',
    sinKey: '1',
    cosKey: '0',
    tanKey: 'undefined',
    sinDisplay: '1',
    cosDisplay: '0',
    tanDisplay: 'なし',
    explanation: {
      sin: '角π/2(90°)はy軸の真上。単位円上の点(0, 1)のy座標は 1 です。',
      cos: '角π/2(90°)はy軸上。単位円上の点(0, 1)のx座標は 0 です。',
      tan: 'x=0のため tan = y/x は定義されません（なし）。',
    },
    triangleNote: 'y軸真上 (0, 1)',
  },
  // 2π/3 (120°)
  {
    radStr: '2π/3',
    degree: 120,
    radNum: (2 * Math.PI) / 3,
    quadrant: 2,
    sinKey: 'sqrt3/2',
    cosKey: '-1/2',
    tanKey: '-sqrt3',
    sinDisplay: '√3/2',
    cosDisplay: '-1/2',
    tanDisplay: '-√3',
    explanation: {
      sin: '第2象限でy座標はプラス、高さは √3/2 です。',
      cos: '第2象限でx座標はマイナス、横幅は -1/2 です。',
      tan: '第2象限の急な右下がりの傾きで -√3 です。',
    },
    triangleNote: '基準角 60° (第2象限)',
  },
  // 3π/4 (135°)
  {
    radStr: '3π/4',
    degree: 135,
    radNum: (3 * Math.PI) / 4,
    quadrant: 2,
    sinKey: 'sqrt2/2',
    cosKey: '-sqrt2/2',
    tanKey: '-1',
    sinDisplay: '√2/2',
    cosDisplay: '-√2/2',
    tanDisplay: '-1',
    explanation: {
      sin: '第2象限の135°。y座標はプラスで √2/2 です。',
      cos: '第2象限の135°。x座標はマイナスで -√2/2 です。',
      tan: '傾きは -1 です。',
    },
    triangleNote: '基準角 45° (第2象限)',
  },
  // 5π/6 (150°)
  {
    radStr: '5π/6',
    degree: 150,
    radNum: (5 * Math.PI) / 6,
    quadrant: 2,
    sinKey: '1/2',
    cosKey: '-sqrt3/2',
    tanKey: '-1/sqrt3',
    sinDisplay: '1/2',
    cosDisplay: '-√3/2',
    tanDisplay: '-1/√3',
    explanation: {
      sin: '第2象限の150°。y座標は短いプラスの 1/2 です。',
      cos: '第2象限の150°。x座標は長いマイナスの -√3/2 です。',
      tan: '傾きは緩やかな負で -1/√3 です。',
    },
    triangleNote: '基準角 30° (第2象限)',
  },
  // π (180°)
  {
    radStr: 'π',
    degree: 180,
    radNum: Math.PI,
    quadrant: 'axis',
    sinKey: '0',
    cosKey: '-1',
    tanKey: '0',
    sinDisplay: '0',
    cosDisplay: '-1',
    tanDisplay: '0',
    explanation: {
      sin: '角πはx軸負の向き。単位円上の点(-1, 0)のy座標は 0 です。',
      cos: '角πはx軸負の向き。単位円上の点(-1, 0)のx座標は -1 です。',
      tan: '傾きは 0/-1 = 0 です。',
    },
    triangleNote: 'x軸負の向き (-1, 0)',
  },
  // 7π/6 (210°)
  {
    radStr: '7π/6',
    degree: 210,
    radNum: (7 * Math.PI) / 6,
    quadrant: 3,
    sinKey: '-1/2',
    cosKey: '-sqrt3/2',
    tanKey: '1/sqrt3',
    sinDisplay: '-1/2',
    cosDisplay: '-√3/2',
    tanDisplay: '1/√3',
    explanation: {
      sin: '第3象限でy座標はマイナス、縦は短く -1/2 です。',
      cos: '第3象限でx座標はマイナス、横は長く -√3/2 です。',
      tan: '第3象限は(-)/(-)でプラス、傾きは 1/√3 です。',
    },
    triangleNote: '基準角 30° (第3象限)',
  },
  // 5π/4 (225°)
  {
    radStr: '5π/4',
    degree: 225,
    radNum: (5 * Math.PI) / 4,
    quadrant: 3,
    sinKey: '-sqrt2/2',
    cosKey: '-sqrt2/2',
    tanKey: '1',
    sinDisplay: '-√2/2',
    cosDisplay: '-√2/2',
    tanDisplay: '1',
    explanation: {
      sin: '第3象限の225°。y座標は -√2/2 です。',
      cos: '第3象限の225°。x座標は -√2/2 です。',
      tan: '傾きは (-)/(-) = +1 です。',
    },
    triangleNote: '基準角 45° (第3象限)',
  },
  // 4π/3 (240°)
  {
    radStr: '4π/3',
    degree: 240,
    radNum: (4 * Math.PI) / 3,
    quadrant: 3,
    sinKey: '-sqrt3/2',
    cosKey: '-1/2',
    tanKey: 'sqrt3',
    sinDisplay: '-√3/2',
    cosDisplay: '-1/2',
    tanDisplay: '√3',
    explanation: {
      sin: '第3象限の240°。縦は長くマイナスで -√3/2 です。',
      cos: '第3象限の240°。横は短くマイナスで -1/2 です。',
      tan: '急な右上がりの傾きで +√3 です。',
    },
    triangleNote: '基準角 60° (第3象限)',
  },
  // 3π/2 (270°)
  {
    radStr: '3π/2',
    degree: 270,
    radNum: (3 * Math.PI) / 2,
    quadrant: 'axis',
    sinKey: '-1',
    cosKey: '0',
    tanKey: 'undefined',
    sinDisplay: '-1',
    cosDisplay: '0',
    tanDisplay: 'なし',
    explanation: {
      sin: '角3π/2(270°)はy軸の真下。単位円上の点(0, -1)のy座標は -1 です。',
      cos: '角3π/2(270°)はy軸上。単位円上の点(0, -1)のx座標は 0 です。',
      tan: 'x=0のため tan は定義されません（なし）。',
    },
    triangleNote: 'y軸真下 (0, -1)',
  },
  // 5π/3 (300°)
  {
    radStr: '5π/3',
    degree: 300,
    radNum: (5 * Math.PI) / 3,
    quadrant: 4,
    sinKey: '-sqrt3/2',
    cosKey: '1/2',
    tanKey: '-sqrt3',
    sinDisplay: '-√3/2',
    cosDisplay: '1/2',
    tanDisplay: '-√3',
    explanation: {
      sin: '第4象限でy座標はマイナス、縦は長く -√3/2 です。',
      cos: '第4象限でx座標はプラス、横は短く 1/2 です。',
      tan: '急な右下がりの傾きで -√3 です。',
    },
    triangleNote: '基準角 60° (第4象限)',
  },
  // 7π/4 (315°)
  {
    radStr: '7π/4',
    degree: 315,
    radNum: (7 * Math.PI) / 4,
    quadrant: 4,
    sinKey: '-sqrt2/2',
    cosKey: 'sqrt2/2',
    tanKey: '-1',
    sinDisplay: '-√2/2',
    cosDisplay: '√2/2',
    tanDisplay: '-1',
    explanation: {
      sin: '第4象限の315°。y座標は -√2/2 です。',
      cos: '第4象限の315°。x座標はプラスで √2/2 です。',
      tan: '傾きは -1 です。',
    },
    triangleNote: '基準角 45° (第4象限)',
  },
  // 11π/6 (330°)
  {
    radStr: '11π/6',
    degree: 330,
    radNum: (11 * Math.PI) / 6,
    quadrant: 4,
    sinKey: '-1/2',
    cosKey: 'sqrt3/2',
    tanKey: '-1/sqrt3',
    sinDisplay: '-1/2',
    cosDisplay: '√3/2',
    tanDisplay: '-1/√3',
    explanation: {
      sin: '第4象限の330°。y座標は浅いマイナスの -1/2 です。',
      cos: '第4象限の330°。x座標は長いプラスの √3/2 です。',
      tan: '傾きは緩やかな負で -1/√3 です。',
    },
    triangleNote: '基準角 30° (第4象限)',
  },
  // 2π (360°)
  {
    radStr: '2π',
    degree: 360,
    radNum: 2 * Math.PI,
    quadrant: 'axis',
    sinKey: '0',
    cosKey: '1',
    tanKey: '0',
    sinDisplay: '0',
    cosDisplay: '1',
    tanDisplay: '0',
    explanation: {
      sin: '角2πは1周して角0と同じ点(1, 0)。y座標は 0 です。',
      cos: '角2πは点(1, 0)。x座標は 1 です。',
      tan: '傾きは 0/1 = 0 です。',
    },
    triangleNote: '1周して (1, 0)',
  },
];

export const DEGREE_VALUES: DegreeValueItem[] = [
  // 0 to 180°
  { degree: 0, label: '0°', key: 'deg_0', radRef: '0', shortcutKey: '1' },
  { degree: 30, label: '30°', key: 'deg_30', radRef: 'π/6', shortcutKey: '2' },
  { degree: 45, label: '45°', key: 'deg_45', radRef: 'π/4', shortcutKey: '3' },
  { degree: 60, label: '60°', key: 'deg_60', radRef: 'π/3', shortcutKey: '4' },
  { degree: 90, label: '90°', key: 'deg_90', radRef: 'π/2', shortcutKey: '5' },
  { degree: 120, label: '120°', key: 'deg_120', radRef: '2π/3', shortcutKey: '6' },
  { degree: 135, label: '135°', key: 'deg_135', radRef: '3π/4', shortcutKey: '7' },
  { degree: 150, label: '150°', key: 'deg_150', radRef: '5π/6', shortcutKey: '8' },
  { degree: 180, label: '180°', key: 'deg_180', radRef: 'π', shortcutKey: '9' },
  // 210 to 360°
  { degree: 210, label: '210°', key: 'deg_210', radRef: '7π/6', shortcutKey: 'Q' },
  { degree: 225, label: '225°', key: 'deg_225', radRef: '5π/4', shortcutKey: 'W' },
  { degree: 240, label: '240°', key: 'deg_240', radRef: '4π/3', shortcutKey: 'E' },
  { degree: 270, label: '270°', key: 'deg_270', radRef: '3π/2', shortcutKey: 'R' },
  { degree: 300, label: '300°', key: 'deg_300', radRef: '5π/3', shortcutKey: 'T' },
  { degree: 315, label: '315°', key: 'deg_315', radRef: '7π/4', shortcutKey: 'Y' },
  { degree: 330, label: '330°', key: 'deg_330', radRef: '11π/6', shortcutKey: 'U' },
  { degree: 360, label: '360°', key: 'deg_360', radRef: '2π', shortcutKey: 'O' },
];

export const RADIAN_VALUES: RadianValueItem[] = [
  // 0 to 180°
  { radStr: '0', label: '0', key: 'rad_0', degree: 0, shortcutKey: '1' },
  { radStr: 'π/6', label: 'π/6', key: 'rad_π/6', degree: 30, shortcutKey: '2' },
  { radStr: 'π/4', label: 'π/4', key: 'rad_π/4', degree: 45, shortcutKey: '3' },
  { radStr: 'π/3', label: 'π/3', key: 'rad_π/3', degree: 60, shortcutKey: '4' },
  { radStr: 'π/2', label: 'π/2', key: 'rad_π/2', degree: 90, shortcutKey: '5' },
  { radStr: '2π/3', label: '2π/3', key: 'rad_2π/3', degree: 120, shortcutKey: '6' },
  { radStr: '3π/4', label: '3π/4', key: 'rad_3π/4', degree: 135, shortcutKey: '7' },
  { radStr: '5π/6', label: '5π/6', key: 'rad_5π/6', degree: 150, shortcutKey: '8' },
  { radStr: 'π', label: 'π', key: 'rad_π', degree: 180, shortcutKey: '9' },
  // 210 to 360°
  { radStr: '7π/6', label: '7π/6', key: 'rad_7π/6', degree: 210, shortcutKey: 'Q' },
  { radStr: '5π/4', label: '5π/4', key: 'rad_5π/4', degree: 225, shortcutKey: 'W' },
  { radStr: '4π/3', label: '4π/3', key: 'rad_4π/3', degree: 240, shortcutKey: 'E' },
  { radStr: '3π/2', label: '3π/2', key: 'rad_3π/2', degree: 270, shortcutKey: 'R' },
  { radStr: '5π/3', label: '5π/3', key: 'rad_5π/3', degree: 300, shortcutKey: 'T' },
  { radStr: '7π/4', label: '7π/4', key: 'rad_7π/4', degree: 315, shortcutKey: 'Y' },
  { radStr: '11π/6', label: '11π/6', key: 'rad_11π/6', degree: 330, shortcutKey: 'U' },
  { radStr: '2π', label: '2π', key: 'rad_2π', degree: 360, shortcutKey: 'O' },
];

// Generate an array of degree to radian conversion problems (e.g. 60° -> π/3)
export function getDegreeToRadianProblems(difficulty: GameDifficulty): TrigProblem[] {
  let angles = ANGLE_DATABASE;
  if (difficulty === 'beginner') {
    angles = ANGLE_DATABASE.filter(a => a.degree <= 90);
  } else if (difficulty === 'standard') {
    angles = ANGLE_DATABASE.filter(a => a.degree <= 180);
  }

  return angles.map(angle => ({
    id: `deg2rad_${angle.degree}`,
    func: 'deg_to_rad',
    problemType: 'deg_to_rad',
    angleRad: angle.radStr,
    angleDegree: angle.degree,
    angleNumericRad: angle.radNum,
    correctValueKey: `rad_${angle.radStr}`,
    correctDisplay: angle.radStr,
    quadrant: angle.quadrant,
    explanation: `${angle.degree}° を弧度法にするには 180 で割って π を掛けます: ${angle.degree}° × (π / 180°) = ${angle.radStr} rad です。`,
    triangleHint: `弧度法変換 (180° = π)`,
  }));
}

// Generate an array of radian to degree conversion problems
export function getRadianToDegreeProblems(difficulty: GameDifficulty): TrigProblem[] {
  let angles = ANGLE_DATABASE;
  if (difficulty === 'beginner') {
    angles = ANGLE_DATABASE.filter(a => a.degree <= 90);
  } else if (difficulty === 'standard') {
    angles = ANGLE_DATABASE.filter(a => a.degree <= 180);
  }

  return angles.map(angle => ({
    id: `rad2deg_${angle.radStr.replace('/', '_')}`,
    func: 'rad',
    problemType: 'rad_to_deg',
    angleRad: angle.radStr,
    angleDegree: angle.degree,
    angleNumericRad: angle.radNum,
    correctValueKey: `deg_${angle.degree}`,
    correctDisplay: `${angle.degree}°`,
    quadrant: angle.quadrant,
    explanation: `π = 180° なので、${angle.radStr} は 180° × (${angle.radStr.replace('π', '1')}) = ${angle.degree}° です。`,
    triangleHint: `度数法変換 (π = 180°)`,
  }));
}

// Generate an array of all possible problems for a given difficulty
export function getProblemsForDifficulty(difficulty: GameDifficulty, includeTanOverride?: boolean): TrigProblem[] {
  const problems: TrigProblem[] = [];

  // Filter angles based on difficulty
  let angles: AngleInfo[] = [];
  let allowedFuncs: ('sin' | 'cos' | 'tan')[] = ['sin', 'cos'];

  switch (difficulty) {
    case 'beginner':
      // 0 to π/2 only (first quadrant + axes)
      angles = ANGLE_DATABASE.filter(a => a.degree <= 90);
      allowedFuncs = ['sin', 'cos'];
      break;
    case 'standard':
      // 0 to π (1st and 2nd quadrant)
      angles = ANGLE_DATABASE.filter(a => a.degree <= 180);
      allowedFuncs = includeTanOverride ? ['sin', 'cos', 'tan'] : ['sin', 'cos'];
      break;
    case 'advanced':
      // Full circle (0 to 2π) with sin, cos, and tan!
      angles = ANGLE_DATABASE;
      allowedFuncs = ['sin', 'cos', 'tan'];
      break;
    case 'supreme':
      // Supreme difficulty: full circle, all functions, extreme speed
      angles = ANGLE_DATABASE;
      allowedFuncs = ['sin', 'cos', 'tan'];
      break;
  }

  for (const angle of angles) {
    for (const f of allowedFuncs) {
      let correctKey = '';
      let correctDisplay = '';
      let explanation = '';

      if (f === 'sin') {
        correctKey = angle.sinKey;
        correctDisplay = angle.sinDisplay;
        explanation = angle.explanation.sin;
      } else if (f === 'cos') {
        correctKey = angle.cosKey;
        correctDisplay = angle.cosDisplay;
        explanation = angle.explanation.cos;
      } else {
        correctKey = angle.tanKey;
        correctDisplay = angle.tanDisplay;
        explanation = angle.explanation.tan;
      }

      problems.push({
        id: `${f}_${angle.radStr.replace('/', '_')}`,
        func: f,
        problemType: 'trig_value',
        angleRad: angle.radStr,
        angleDegree: angle.degree,
        angleNumericRad: angle.radNum,
        correctValueKey: correctKey,
        correctDisplay: correctDisplay,
        quadrant: angle.quadrant,
        explanation,
        triangleHint: angle.triangleNote,
      });
    }
  }

  return problems;
}

// Generate degree-based trig problems (e.g. sin(60°) = ?)
export function getDegreeTrigProblems(difficulty: GameDifficulty, includeTanOverride?: boolean): TrigProblem[] {
  const baseProblems = getProblemsForDifficulty(difficulty, includeTanOverride);
  return baseProblems.map(p => ({
    ...p,
    id: `degtrig_${p.id}`,
    problemType: 'deg_trig_value' as const,
    explanation: `${p.func} ${p.angleDegree}° は、${p.angleRad} rad と同じです。${p.explanation}`,
  }));
}

// Generate inverse trig degree problems (e.g. sin θ = 1/2 -> answers θ in degrees like 30°, 150°)
export function getInverseDegreeProblems(difficulty: GameDifficulty, includeTanOverride?: boolean): TrigProblem[] {
  let angles: AngleInfo[] = [];
  let allowedFuncs: ('inv_sin' | 'inv_cos' | 'inv_tan')[] = ['inv_sin', 'inv_cos'];
  let domain = '0° ≦ θ < 360°';

  if (difficulty === 'beginner') {
    domain = '0° ≦ θ ≦ 90°';
    angles = ANGLE_DATABASE.filter(a => a.degree <= 90);
    allowedFuncs = ['inv_sin', 'inv_cos'];
  } else if (difficulty === 'standard') {
    domain = '0° ≦ θ ≦ 180°';
    angles = ANGLE_DATABASE.filter(a => a.degree <= 180);
    allowedFuncs = includeTanOverride ? ['inv_sin', 'inv_cos', 'inv_tan'] : ['inv_sin', 'inv_cos'];
  } else {
    domain = '0° ≦ θ < 360°';
    angles = ANGLE_DATABASE.filter(a => a.degree < 360);
    allowedFuncs = includeTanOverride || difficulty === 'advanced' || difficulty === 'supreme'
      ? ['inv_sin', 'inv_cos', 'inv_tan']
      : ['inv_sin', 'inv_cos'];
  }

  const problems: TrigProblem[] = [];

  for (const f of allowedFuncs) {
    const isSin = f === 'inv_sin';
    const isCos = f === 'inv_cos';
    const funcLabel = isSin ? 'sin' : isCos ? 'cos' : 'tan';
    const displayProp = isSin ? 'sinDisplay' : isCos ? 'cosDisplay' : 'tanDisplay';

    // Collect all valid angles (filter out undefined for tan like 90° and 270°)
    const validAngles = angles.filter(a => {
      if (!isSin && !isCos && (a.degree === 90 || a.degree === 270)) return false;
      return true;
    });

    // Get unique target values for this function in the domain
    const uniqueValues = Array.from(new Set(validAngles.map(a => a[displayProp])));

    for (const givenVal of uniqueValues) {
      const matched = validAngles.filter(a => a[displayProp] === givenVal);
      if (matched.length === 0) continue;

      matched.sort((a, b) => a.degree - b.degree);

      const correctValueKeys = matched.map(a => `deg_${a.degree}`);
      const correctDisplays = matched.map(a => `${a.degree}°`);
      const correctDisplay = correctDisplays.join(', ');
      const answersCount = matched.length;

      const explanation = answersCount > 1
        ? `${funcLabel} θ = ${givenVal} を満たす角は、条件 ${domain} において θ = ${correctDisplay} の2つです。両方答えて迎撃！`
        : `${funcLabel} θ = ${givenVal} を満たす角は、条件 ${domain} において θ = ${correctDisplay} です。`;

      problems.push({
        id: `inv_${f}_val_${givenVal.replace(/[/√-]/g, '_')}`,
        func: f,
        problemType: 'inverse_to_deg',
        angleRad: matched[0].radStr,
        angleDegree: matched[0].degree,
        angleNumericRad: matched[0].radNum,
        givenValueDisplay: givenVal,
        correctValueKey: correctValueKeys[0],
        correctDisplay,
        correctValueKeys,
        correctDisplays,
        expectedAnswersCount: answersCount,
        quadrant: matched[0].quadrant,
        domainHint: domain,
        explanation,
        triangleHint: matched[0].triangleNote,
      });
    }
  }

  return problems;
}

// Generate inverse trig radian problems (e.g. sin θ = 1/2 -> answer θ in radians like π/6, 5π/6)
export function getInverseRadianProblems(difficulty: GameDifficulty, includeTanOverride?: boolean): TrigProblem[] {
  let angles: AngleInfo[] = [];
  let allowedFuncs: ('inv_rad_sin' | 'inv_rad_cos' | 'inv_rad_tan')[] = ['inv_rad_sin', 'inv_rad_cos'];
  let domain = '0 ≦ θ < 2π';

  if (difficulty === 'beginner') {
    domain = '0 ≦ θ ≦ π/2';
    angles = ANGLE_DATABASE.filter(a => a.degree <= 90);
    allowedFuncs = ['inv_rad_sin', 'inv_rad_cos'];
  } else if (difficulty === 'standard') {
    domain = '0 ≦ θ ≦ π';
    angles = ANGLE_DATABASE.filter(a => a.degree <= 180);
    allowedFuncs = includeTanOverride ? ['inv_rad_sin', 'inv_rad_cos', 'inv_rad_tan'] : ['inv_rad_sin', 'inv_rad_cos'];
  } else {
    domain = '0 ≦ θ < 2π';
    angles = ANGLE_DATABASE.filter(a => a.degree < 360);
    allowedFuncs = includeTanOverride || difficulty === 'advanced' || difficulty === 'supreme'
      ? ['inv_rad_sin', 'inv_rad_cos', 'inv_rad_tan']
      : ['inv_rad_sin', 'inv_rad_cos'];
  }

  const problems: TrigProblem[] = [];

  for (const f of allowedFuncs) {
    const isSin = f === 'inv_rad_sin';
    const isCos = f === 'inv_rad_cos';
    const funcLabel = isSin ? 'sin' : isCos ? 'cos' : 'tan';
    const displayProp = isSin ? 'sinDisplay' : isCos ? 'cosDisplay' : 'tanDisplay';

    const validAngles = angles.filter(a => {
      if (!isSin && !isCos && (a.degree === 90 || a.degree === 270)) return false;
      return true;
    });

    const uniqueValues = Array.from(new Set(validAngles.map(a => a[displayProp])));

    for (const givenVal of uniqueValues) {
      const matched = validAngles.filter(a => a[displayProp] === givenVal);
      if (matched.length === 0) continue;

      matched.sort((a, b) => a.degree - b.degree);

      const correctValueKeys = matched.map(a => `rad_${a.radStr}`);
      const correctDisplays = matched.map(a => a.radStr);
      const correctDisplay = correctDisplays.join(', ');
      const answersCount = matched.length;

      const explanation = answersCount > 1
        ? `${funcLabel} θ = ${givenVal} を満たす角は、条件 ${domain} において θ = ${correctDisplay} の2つです。両方答えて迎撃！`
        : `${funcLabel} θ = ${givenVal} を満たす角は、条件 ${domain} において θ = ${correctDisplay} です。`;

      problems.push({
        id: `invrad_${f}_val_${givenVal.replace(/[/√-]/g, '_')}`,
        func: f,
        problemType: 'inverse_to_rad',
        angleRad: matched[0].radStr,
        angleDegree: matched[0].degree,
        angleNumericRad: matched[0].radNum,
        givenValueDisplay: givenVal,
        correctValueKey: correctValueKeys[0],
        correctDisplay,
        correctValueKeys,
        correctDisplays,
        expectedAnswersCount: answersCount,
        quadrant: matched[0].quadrant,
        domainHint: domain,
        explanation,
        triangleHint: matched[0].triangleNote,
      });
    }
  }

  return problems;
}

// Quick random problem generator with category support
export function getRandomProblem(
  difficulty: GameDifficulty,
  includeTan = false,
  category: ProblemCategory = 'trig',
  excludeIds: string[] = []
): TrigProblem {
  let pool: TrigProblem[] = [];

  if (difficulty === 'supreme') {
    // Supreme: 全範囲から出る総合問題 (all problems: sin/cos/tan in rad, deg_trig, rad_to_deg, deg_to_rad, inverse in deg, inverse in rad)
    const trigPool = getProblemsForDifficulty('supreme', true);
    const degTrigPool = getDegreeTrigProblems('supreme', true);
    const radPool = getRadianToDegreeProblems('supreme');
    const degToRadPool = getDegreeToRadianProblems('supreme');
    const invDegPool = getInverseDegreeProblems('supreme', true);
    const invRadPool = getInverseRadianProblems('supreme', true);
    pool = [...trigPool, ...degTrigPool, ...radPool, ...degToRadPool, ...invDegPool, ...invRadPool];
  } else if (category === 'inverse_rad') {
    // Trig equation -> answer angle in RADIANS! e.g. sin θ = 1/2 -> π/6, 5π/6
    pool = getInverseRadianProblems(difficulty, includeTan);
  } else if (category === 'deg_to_rad') {
    // Degree to Radian (e.g. 60° -> π/3, answer in radians)
    pool = getDegreeToRadianProblems(difficulty);
  } else if (category === 'radian') {
    // Radian to Degree (e.g. π/3 -> 60°, answer in degrees)
    pool = getRadianToDegreeProblems(difficulty);
  } else if (category === 'inverse_deg') {
    // Trig equation -> find angle in degrees
    pool = getInverseDegreeProblems(difficulty, includeTan);
  } else if (category === 'degree_all') {
    // All questions where the user answers in DEGREES!
    const radPool = getRadianToDegreeProblems(difficulty);
    const invPool = getInverseDegreeProblems(difficulty, includeTan);
    pool = [...radPool, ...invPool];
  } else if (category === 'deg_trig') {
    // Trig question written in degrees: sin(60°) = ?
    pool = getDegreeTrigProblems(difficulty, includeTan);
  } else {
    // Standard trig in radians: sin(π/3) = ?
    pool = getProblemsForDifficulty(difficulty, includeTan);
  }

  const candidates = pool.filter(p => !excludeIds.includes(p.id));
  const finalPool = candidates.length > 0 ? candidates : pool;
  const index = Math.floor(Math.random() * finalPool.length);
  return {
    ...finalPool[index],
    id: `${finalPool[index].id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
}
