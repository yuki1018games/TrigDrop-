import React from 'react';
import { TrigFunc } from '../types/trig';

export interface FractionProps {
  numerator: React.ReactNode;
  denominator: React.ReactNode;
  isNegative?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fractionLineColor?: string;
}

/**
 * Universal mathematical 2-story fraction component with a solid horizontal fraction bar (vinculum).
 * Never uses slashes!
 */
export const FractionDisplay: React.FC<FractionProps> = ({
  numerator,
  denominator,
  isNegative = false,
  size = 'md',
  className = '',
  fractionLineColor = 'border-current',
}) => {
  const sizeMap = {
    xs: {
      wrap: 'text-[11px]',
      num: 'text-[0.9em] pb-[1px]',
      den: 'text-[0.85em] pt-[1px]',
      line: 'border-b',
      minus: 'text-xs mr-0.5',
    },
    sm: {
      wrap: 'text-xs md:text-sm',
      num: 'text-[0.92em] pb-[1px]',
      den: 'text-[0.88em] pt-[1px]',
      line: 'border-b-[1.5px]',
      minus: 'text-sm mr-0.5 font-bold',
    },
    md: {
      wrap: 'text-sm md:text-base font-semibold',
      num: 'text-[0.92em] pb-[1.5px]',
      den: 'text-[0.88em] pt-[1.5px]',
      line: 'border-b-[1.5px]',
      minus: 'text-base mr-0.5 font-bold',
    },
    lg: {
      wrap: 'text-base md:text-lg font-bold',
      num: 'text-[0.95em] pb-[2px]',
      den: 'text-[0.9em] pt-[2px]',
      line: 'border-b-2',
      minus: 'text-lg mr-1 font-extrabold',
    },
    xl: {
      wrap: 'text-xl md:text-2xl font-extrabold',
      num: 'text-[0.95em] pb-[2px]',
      den: 'text-[0.9em] pt-[2px]',
      line: 'border-b-2',
      minus: 'text-2xl mr-1 font-extrabold',
    },
  }[size];

  return (
    <span className={`inline-flex items-center align-middle font-mono select-none ${sizeMap.wrap} ${className}`}>
      {isNegative && (
        <span className={`font-bold leading-none self-center text-rose-300 ${sizeMap.minus}`}>
          −
        </span>
      )}
      <span className="inline-flex flex-col items-center justify-center align-middle leading-none px-0.5 min-w-[1em]">
        <span className={`w-full text-center font-bold leading-none ${sizeMap.line} ${fractionLineColor} ${sizeMap.num}`}>
          {numerator}
        </span>
        <span className={`w-full text-center font-bold leading-none ${sizeMap.den}`}>
          {denominator}
        </span>
      </span>
    </span>
  );
};

export function renderRadical(text: string) {
  if (!text) return null;
  if (text.includes('√')) {
    const parts = text.split('√');
    return (
      <span className="inline-flex items-center leading-none">
        {parts[0]}
        <span className="inline-flex items-baseline leading-none">
          <span className="text-[1.05em] font-serif leading-none mr-[0.5px]">√</span>
          <span className="border-t-[1.5px] border-current pt-[0.5px] -ml-[0.5px] leading-none">
            {parts[1]}
          </span>
        </span>
      </span>
    );
  }
  return text;
}

export interface MathValueDisplayProps {
  label: string;
  numerator?: string;
  denominator?: string;
  isNegative?: boolean;
  isUndefined?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Universal math value component.
 * Automatically parses any string with '/' into a clean vertical fraction (e.g. "√3/2" -> √3 over 2).
 */
export const MathValueDisplay: React.FC<MathValueDisplayProps> = ({
  label,
  numerator,
  denominator,
  isNegative,
  isUndefined,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    xs: 'text-[11px]',
    sm: 'text-xs md:text-sm',
    md: 'text-sm md:text-base font-semibold',
    lg: 'text-base md:text-lg font-bold',
    xl: 'text-xl md:text-2xl font-extrabold',
  }[size];

  if (isUndefined || label === 'undefined' || label === 'なし') {
    return <span className={`font-mono text-slate-300 ${sizeStyles} ${className}`}>なし</span>;
  }

  // Handle comma-separated multiple answers (e.g. "30°, 150°" or "π/6, 5π/6")
  if (label && label.includes(',')) {
    const parts = label.split(',').map(s => s.trim());
    return (
      <span className={`inline-flex items-center gap-1 font-mono ${sizeStyles} ${className}`}>
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-slate-400 mr-0.5">,</span>}
            <MathValueDisplay label={part} size={size} />
          </React.Fragment>
        ))}
      </span>
    );
  }

  // 1. Direct numerator / denominator provided
  if (numerator && denominator) {
    return (
      <FractionDisplay
        numerator={renderRadical(numerator)}
        denominator={renderRadical(denominator)}
        isNegative={isNegative}
        size={size}
        className={className}
      />
    );
  }

  // 2. String label contains a slash '/' (e.g. "-√3/2", "1/2", "π/3", "-1/√3")
  if (label && label.includes('/')) {
    let clean = label.trim();
    const isNeg = isNegative || clean.startsWith('-') || clean.startsWith('−');
    if (clean.startsWith('-') || clean.startsWith('−')) {
      clean = clean.substring(1).trim();
    }
    const [numStr, denStr] = clean.split('/');

    return (
      <FractionDisplay
        numerator={renderRadical(numStr)}
        denominator={renderRadical(denStr)}
        isNegative={isNeg}
        size={size}
        className={className}
      />
    );
  }

  // 3. Simple scalar value (e.g. "0", "1", "-1", "√3", "-√3", "60°")
  const isNegScalar = isNegative || (label && (label.startsWith('-') || label.startsWith('−')));
  let cleanScalar = label;
  if (isNegScalar && (cleanScalar.startsWith('-') || cleanScalar.startsWith('−'))) {
    cleanScalar = cleanScalar.substring(1).trim();
  }

  return (
    <span className={`inline-flex items-center font-mono select-none ${sizeStyles} ${className}`}>
      {isNegScalar && <span className="font-bold mr-0.5 text-rose-300">−</span>}
      {renderRadical(cleanScalar)}
    </span>
  );
};

export interface DomainBadgeProps {
  domainHint?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Prominent, high-contrast badge for displaying angle ranges (e.g. 0° ≦ θ < 360° or 0 ≦ θ < 2π).
 * High-visibility styling ensures players can instantly read the range as problems fall.
 */
export const DomainBadge: React.FC<DomainBadgeProps> = ({ domainHint, size = 'md' }) => {
  if (!domainHint) return null;

  if (size === 'xl') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/90 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)] select-none whitespace-nowrap shrink-0 flex-nowrap align-middle">
        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-sans shrink-0">
          範囲
        </span>
        <span className="text-sm sm:text-base font-black text-amber-200 font-mono tracking-wide whitespace-nowrap shrink-0">
          {domainHint}
        </span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-950/85 border-2 border-amber-400/80 shadow-xs select-none whitespace-nowrap shrink-0 flex-nowrap align-middle">
        <span className="text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-sans shrink-0">
          範囲
        </span>
        <span className="text-xs sm:text-sm font-extrabold text-amber-200 font-mono whitespace-nowrap shrink-0">
          {domainHint}
        </span>
      </span>
    );
  }

  if (size === 'md') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-400/70 select-none whitespace-nowrap shrink-0 flex-nowrap align-middle">
        <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-sans shrink-0">
          範囲
        </span>
        <span className="text-xs font-bold text-amber-200 font-mono whitespace-nowrap shrink-0">
          {domainHint}
        </span>
      </span>
    );
  }

  // sm / xs
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-[10px] font-mono font-bold text-amber-200 whitespace-nowrap shrink-0 flex-nowrap align-middle">
      <span className="text-[8px] font-black text-amber-400 shrink-0">範囲:</span>
      <span className="whitespace-nowrap shrink-0">{domainHint}</span>
    </span>
  );
};

export interface TrigExpressionProps {
  func: TrigFunc;
  angleRad: string;
  angleDegree?: number;
  givenValueDisplay?: string;
  domainHint?: string;
  problemType?: 'trig_value' | 'rad_to_deg' | 'deg_to_rad' | 'deg_trig_value' | 'inverse_to_deg' | 'inverse_to_rad';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  colorScheme?: 'default' | 'cyan' | 'rose' | 'amber';
}

/**
 * Renders complete trigonometric expressions with vertical fractions in angles and values.
 * Never uses '/' slashes!
 */
export const TrigExpression: React.FC<TrigExpressionProps> = ({
  func,
  angleRad,
  angleDegree,
  givenValueDisplay,
  domainHint,
  problemType,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'text-[11px] sm:text-xs',
    sm: 'text-xs md:text-sm',
    md: 'text-sm md:text-base font-semibold',
    lg: 'text-base md:text-lg font-bold',
    xl: 'text-xl md:text-2xl font-extrabold',
  }[size];

  const funcColors: Record<string, string> = {
    sin: 'text-emerald-400',
    cos: 'text-cyan-400',
    tan: 'text-amber-400',
    inv_sin: 'text-emerald-300',
    inv_cos: 'text-cyan-300',
    inv_tan: 'text-amber-300',
    inv_rad_sin: 'text-emerald-300',
    inv_rad_cos: 'text-cyan-300',
    inv_rad_tan: 'text-amber-300',
    rad: 'text-indigo-400',
    deg_to_rad: 'text-violet-400',
  };

  // 1. Degree to radian conversion: e.g. 60° -> [ ? rad ]
  if (func === 'deg_to_rad' || problemType === 'deg_to_rad') {
    return (
      <span className={`inline-flex flex-col items-center select-none ${className}`}>
        <span className="text-[10px] font-mono font-bold text-violet-300 uppercase tracking-wider mb-0.5">
          弧度法 [ rad ] は？
        </span>
        <span className={`inline-flex items-center gap-1.5 font-mono tracking-tight font-extrabold text-violet-300 ${sizeClasses}`}>
          <span className="text-white font-extrabold">{angleDegree}°</span>
          <span className="text-xs text-slate-400 font-sans self-center">➔ rad</span>
        </span>
      </span>
    );
  }

  // 2. Radian to degree conversion: Show vertical fraction without slash!
  if (func === 'rad' || problemType === 'rad_to_deg') {
    return (
      <span className={`inline-flex flex-col items-center select-none ${className}`}>
        <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider mb-0.5">
          度数法 [ ° ] は？
        </span>
        <span className={`inline-flex items-center gap-1 font-mono tracking-tight font-extrabold text-cyan-300 ${sizeClasses}`}>
          <MathValueDisplay label={angleRad} size={size} className="text-cyan-300 font-extrabold" />
          <span className="text-xs text-slate-400 font-sans ml-1 self-center">rad</span>
        </span>
      </span>
    );
  }

  // 3. Inverse trig equation with RADIAN answer! e.g. sin θ = 1/2 -> θ = π/6, 5π/6 rad
  if (func.startsWith('inv_rad_') || problemType === 'inverse_to_rad') {
    const pureFunc = func.replace('inv_rad_', '');
    const pureColor = funcColors[pureFunc] || 'text-violet-400';

    return (
      <span className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none whitespace-nowrap flex-nowrap align-middle ${className}`}>
        <span className={`inline-flex items-center gap-1.5 font-mono tracking-tight ${sizeClasses} whitespace-nowrap shrink-0`}>
          <span className={`font-bold italic ${pureColor}`}>{pureFunc}</span>
          <span className="math-theta text-[1.25em] leading-none">θ</span>
          <span className="text-slate-400 font-bold">=</span>
          <span className="text-violet-300 font-bold inline-flex items-center">
            <MathValueDisplay label={givenValueDisplay || ''} size={size === 'xl' ? 'lg' : size} />
          </span>
        </span>
        {domainHint && <DomainBadge domainHint={domainHint} size={size} />}
      </span>
    );
  }

  // 4. Inverse trig equation with DEGREE answer! e.g. sin θ = 1/2 -> θ = 30°, 150°
  if (func.startsWith('inv_') || problemType === 'inverse_to_deg') {
    const pureFunc = func.replace('inv_', '');
    const pureColor = funcColors[pureFunc] || 'text-indigo-400';

    return (
      <span className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none whitespace-nowrap flex-nowrap align-middle ${className}`}>
        <span className={`inline-flex items-center gap-1.5 font-mono tracking-tight ${sizeClasses} whitespace-nowrap shrink-0`}>
          <span className={`font-bold italic ${pureColor}`}>{pureFunc}</span>
          <span className="math-theta text-[1.25em] leading-none">θ</span>
          <span className="text-slate-400 font-bold">=</span>
          <span className="text-amber-300 font-bold inline-flex items-center">
            <MathValueDisplay label={givenValueDisplay || ''} size={size === 'xl' ? 'lg' : size} />
          </span>
        </span>
        {domainHint && <DomainBadge domainHint={domainHint} size={size} />}
      </span>
    );
  }

  // 3. Degree-input trig problem: e.g. sin 60° (no parentheses!)
  if (problemType === 'deg_trig_value' && angleDegree !== undefined) {
    return (
      <span className={`inline-flex items-center gap-1 font-mono select-none tracking-tight ${sizeClasses} ${className}`}>
        <span className={`font-bold italic ${funcColors[func] || 'text-indigo-400'}`}>
          {func}
        </span>
        <span className="text-slate-100 font-bold ml-0.5">{angleDegree}°</span>
      </span>
    );
  }

  // 4. Standard trig expression with radian angle: e.g. sin π, sin π/3 (stacked fraction, NO parentheses!)
  return (
    <span className={`inline-flex items-center gap-1 font-mono select-none tracking-tight ${sizeClasses} ${className}`}>
      <span className={`font-bold italic ${funcColors[func] || 'text-indigo-400'}`}>
        {func}
      </span>
      <span className="text-slate-100 inline-flex items-center ml-0.5">
        <MathValueDisplay label={angleRad} size={size === 'xl' ? 'lg' : size} />
      </span>
    </span>
  );
};

/**
 * Renders any text containing mathematical formulas or explanations.
 * Automatically removes parentheses from trig functions (e.g. sin(π) -> sin π),
 * styles theta (θ) with a dedicated distinctive serif font,
 * and turns any slash fractions (e.g. 1/2, √3/2, π/3, y/x) into 2-story vertical fractions.
 */
export const FormattedMathText: React.FC<{
  text: string;
  className?: string;
  fractionSize?: 'xs' | 'sm' | 'md';
}> = ({ text, className = '', fractionSize = 'xs' }) => {
  if (!text) return null;

  // 1. Remove parentheses from sin(θ), cos(θ), tan(θ) etc.
  const cleanText = text
    .replace(/sin\(([^)]+)\)/g, 'sin $1')
    .replace(/cos\(([^)]+)\)/g, 'cos $1')
    .replace(/tan\(([^)]+)\)/g, 'tan $1');

  // 2. Tokenize by slash fraction pattern: e.g. -√3/2, 1/2, π/3, y/x, 0/1
  const fractionRegex = /([−-]?(?:√[0-9]+|[0-9]*π|[0-9]+|[xy])\/[−-]?(?:√[0-9]+|[0-9]*π|[0-9]+|[xy]))/g;
  const parts = cleanText.split(fractionRegex);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part && fractionRegex.test(part)) {
          return (
            <span key={idx} className="mx-0.5 inline-block align-middle">
              <MathValueDisplay label={part} size={fractionSize} />
            </span>
          );
        }

        // Render theta (θ) with distinct math-theta styling within text chunks
        if (part && part.includes('θ')) {
          const thetaParts = part.split(/(θ)/g);
          return (
            <React.Fragment key={idx}>
              {thetaParts.map((tp, tIdx) =>
                tp === 'θ' ? (
                  <span key={tIdx} className="math-theta">
                    θ
                  </span>
                ) : (
                  tp
                )
              )}
            </React.Fragment>
          );
        }

        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
};
