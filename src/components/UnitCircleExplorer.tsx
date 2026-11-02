import React, { useState, useRef } from 'react';
import { ANGLE_DATABASE, AngleInfo } from '../utils/trigData';
import { TrigExpression, MathValueDisplay } from './MathDisplay';
import { sounds } from '../utils/audio';
import { Compass, HelpCircle, Check, Info } from 'lucide-react';

interface UnitCircleExplorerProps {
  initialAngle?: string;
  onSelectAngle?: (angle: AngleInfo) => void;
  compact?: boolean;
}

export const UnitCircleExplorer: React.FC<UnitCircleExplorerProps> = ({
  initialAngle = 'π/3',
  onSelectAngle,
  compact = false,
}) => {
  const [selectedAngleRad, setSelectedAngleRad] = useState<string>(initialAngle);
  const [activeFuncTab, setActiveFuncTab] = useState<'all' | 'sin' | 'cos' | 'tan'>('all');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const currentAngle = ANGLE_DATABASE.find(a => a.radStr === selectedAngleRad) || ANGLE_DATABASE[3];

  const handleSelect = (angle: AngleInfo) => {
    if (angle.radStr !== selectedAngleRad) {
      sounds.playHit();
    }
    setSelectedAngleRad(angle.radStr);
    if (onSelectAngle) onSelectAngle(angle);
  };

  // Convert click/touch coordinates on the SVG into the closest standard angle
  const selectFromCoordinates = (clientX: number, clientY: number, svgElem: SVGSVGElement) => {
    const rect = svgElem.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = -(clientY - rect.top - rect.height / 2); // SVG y is inverted (up is positive)
    let angleRad = Math.atan2(y, x);
    if (angleRad < 0) angleRad += Math.PI * 2;

    // Find closest angle in database
    let closest = ANGLE_DATABASE[0];
    let minDiff = 999;
    for (const a of ANGLE_DATABASE) {
      let diff = Math.abs(a.radNum - angleRad);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      if (diff < minDiff) {
        minDiff = diff;
        closest = a;
      }
    }
    handleSelect(closest);
  };

  // Unit circle SVG parameters - optimized for single-screen zero-scroll fit
  const svgSize = compact ? 220 : 280;
  const center = svgSize / 2;
  const radius = compact ? 72 : 96;

  // Point coordinates for current selected angle
  const ptX = center + radius * Math.cos(currentAngle.radNum);
  const ptY = center - radius * Math.sin(currentAngle.radNum); // SVG y is inverted


  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 text-slate-100 shadow-xl flex flex-col justify-between overflow-hidden select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
              単位円インタラクティブ早見表
            </h3>
            <p className="text-xs text-slate-400">
              円上の点をクリックして cos(横) と sin(縦) の関係を直感マスター
            </p>
          </div>
        </div>

        {/* Function focus filter */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg text-xs font-mono">
          <button
            onClick={() => setActiveFuncTab('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeFuncTab === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            全て
          </button>
          <button
            onClick={() => setActiveFuncTab('sin')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeFuncTab === 'sin' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            sin(縦)
          </button>
          <button
            onClick={() => setActiveFuncTab('cos')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeFuncTab === 'cos' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            cos(横)
          </button>
          <button
            onClick={() => setActiveFuncTab('tan')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeFuncTab === 'tan' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            tan(傾き)
          </button>
        </div>
      </div>

      <div className={`mt-2 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'} items-center`}>
        {/* Left: SVG Unit Circle Interactive Canvas */}
        <div className={`${compact ? '' : 'lg:col-span-6 xl:col-span-7'} flex flex-col items-center justify-center`}>
          <div className="relative p-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <svg
              ref={svgRef}
              width={svgSize}
              height={svgSize}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="select-none overflow-visible cursor-crosshair touch-none"
              onPointerDown={(e) => {
                setIsDragging(true);
                try {
                  (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
                } catch {}
                selectFromCoordinates(e.clientX, e.clientY, e.currentTarget);
              }}
              onPointerMove={(e) => {
                if (isDragging) {
                  selectFromCoordinates(e.clientX, e.clientY, e.currentTarget);
                }
              }}
              onPointerUp={(e) => {
                setIsDragging(false);
                try {
                  (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
                } catch {}
              }}
              onPointerCancel={() => setIsDragging(false)}
            >
              {/* Coordinate Grid axes */}
              <line
                x1={15}
                y1={center}
                x2={svgSize - 15}
                y2={center}
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <line
                x1={center}
                y1={15}
                x2={center}
                y2={svgSize - 15}
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Axis labels */}
              <text x={svgSize - 12} y={center - 8} fill="#94a3b8" fontSize="12" fontFamily="monospace">x</text>
              <text x={center + 8} y={14} fill="#94a3b8" fontSize="12" fontFamily="monospace">y</text>

              {/* Quadrant labels */}
              <text x={center + radius * 0.55} y={center - radius * 0.55} fill="#475569" fontSize="11" textAnchor="middle">第1象限 (+,+)</text>
              <text x={center - radius * 0.55} y={center - radius * 0.55} fill="#475569" fontSize="11" textAnchor="middle">第2象限 (-,+)</text>
              <text x={center - radius * 0.55} y={center + radius * 0.55} fill="#475569" fontSize="11" textAnchor="middle">第3象限 (-,-)</text>
              <text x={center + radius * 0.55} y={center + radius * 0.55} fill="#475569" fontSize="11" textAnchor="middle">第4象限 (+,-)</text>

              {/* Unit circle outline */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
              />
              {/* Invisible wide touch ring on circle perimeter */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="transparent"
                strokeWidth="32"
                className="cursor-crosshair pointer-events-auto"
              />

              {/* Helper Triangle with smooth transition */}
              {(activeFuncTab === 'all' || activeFuncTab === 'cos' || activeFuncTab === 'sin') && (
                <>
                  {/* Triangle fill */}
                  <polygon
                    points={`${center},${center} ${ptX},${center} ${ptX},${ptY}`}
                    fill="rgba(99, 102, 241, 0.12)"
                    className="transition-all duration-200 ease-out"
                  />
                  {/* cos component: x-projection line (Cyan) */}
                  <line
                    x1={center}
                    y1={center}
                    x2={ptX}
                    y2={center}
                    stroke="#06b6d4"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="transition-all duration-200 ease-out"
                  />
                  {/* sin component: y-projection line (Emerald) */}
                  <line
                    x1={ptX}
                    y1={center}
                    x2={ptX}
                    y2={ptY}
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={activeFuncTab === 'cos' ? '3 3' : 'none'}
                    className="transition-all duration-200 ease-out"
                  />
                </>
              )}

              {/* Radius line from origin to point */}
              <line
                x1={center}
                y1={center}
                x2={ptX}
                y2={ptY}
                stroke="#818cf8"
                strokeWidth="2.5"
                className="transition-all duration-200 ease-out"
              />

              {/* Angle arc */}
              <path
                d={`M ${center + 24} ${center} A 24 24 0 ${currentAngle.radNum > Math.PI ? 1 : 0} 0 ${
                  center + 24 * Math.cos(currentAngle.radNum)
                } ${center - 24 * Math.sin(currentAngle.radNum)}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                className="transition-all duration-200 ease-out"
              />

              {/* Angle clickable buttons / markers */}
              {ANGLE_DATABASE.map(angle => {
                const isSelected = angle.radStr === selectedAngleRad;
                const isZero = angle.radStr === '0';
                const is2Pi = angle.radStr === '2π';
                const ax = center + radius * Math.cos(angle.radNum);
                const ay = center - radius * Math.sin(angle.radNum);

                // Label offset outward
                const labelDist = radius + (compact ? 22 : 28);
                let lx = center + labelDist * Math.cos(angle.radNum);
                let ly = center - labelDist * Math.sin(angle.radNum);
                let textAnchor: 'middle' | 'start' | 'end' = 'middle';

                // Prevent 0 and 2π from overlapping at angle 0°/360°
                if (isZero) {
                  lx = center + radius + (compact ? 16 : 20);
                  ly = center - (compact ? 7 : 9);
                  textAnchor = 'start';
                } else if (is2Pi) {
                  lx = center + radius + (compact ? 16 : 20);
                  ly = center + (compact ? 13 : 15);
                  textAnchor = 'start';
                }

                // Shared point dot highlight for the (1, 0) point
                const isPointAtZeroSelected = selectedAngleRad === '0' || selectedAngleRad === '2π';

                return (
                  <g
                    key={angle.radStr}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(angle);
                    }}
                  >
                    {/* Generous invisible hit target for easy clicking */}
                    {isZero ? (
                      <rect
                        x={center + radius - 6}
                        y={center - (compact ? 22 : 26)}
                        width={compact ? 42 : 50}
                        height={compact ? 22 : 26}
                        fill="transparent"
                        className="cursor-pointer"
                      />
                    ) : is2Pi ? (
                      <rect
                        x={center + radius - 6}
                        y={center}
                        width={compact ? 42 : 50}
                        height={compact ? 22 : 26}
                        fill="transparent"
                        className="cursor-pointer"
                      />
                    ) : (
                      <circle
                        cx={ax}
                        cy={ay}
                        r={compact ? 16 : 22}
                        fill="transparent"
                        className="cursor-pointer"
                      />
                    )}

                    {/* Visible point dot (skip on 2π to avoid duplicate overlapping dot at same coordinates) */}
                    {!is2Pi && (
                      <circle
                        cx={ax}
                        cy={ay}
                        r={(isZero ? isPointAtZeroSelected : isSelected) ? 8.5 : 5.5}
                        fill={(isZero ? isPointAtZeroSelected : isSelected) ? '#f59e0b' : '#64748b'}
                        stroke={(isZero ? isPointAtZeroSelected : isSelected) ? '#ffffff' : '#0f172a'}
                        strokeWidth={(isZero ? isPointAtZeroSelected : isSelected) ? 2.5 : 1.5}
                        className="transition-all duration-150 ease-out group-hover:scale-125"
                      />
                    )}

                    {/* Angle text rendered cleanly */}
                    {angle.radStr.includes('/') ? (
                      <g className="transition-colors group-hover:opacity-100">
                        {/* Horizontal fraction bar */}
                        <line
                          x1={lx - (compact ? 7 : 9)}
                          y1={ly}
                          x2={lx + (compact ? 7 : 9)}
                          y2={ly}
                          stroke={isSelected ? '#38bdf8' : '#94a3b8'}
                          strokeWidth="1.2"
                        />
                        <text
                          x={lx}
                          y={ly - 2}
                          fill={isSelected ? '#38bdf8' : '#94a3b8'}
                          fontSize={compact ? '8' : '9.5'}
                          fontFamily="monospace"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          textAnchor={textAnchor}
                        >
                          {angle.radStr.split('/')[0]}
                        </text>
                        <text
                          x={lx}
                          y={ly + (compact ? 8 : 10)}
                          fill={isSelected ? '#38bdf8' : '#94a3b8'}
                          fontSize={compact ? '7.5' : '9'}
                          fontFamily="monospace"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          textAnchor={textAnchor}
                        >
                          {angle.radStr.split('/')[1]}
                        </text>
                      </g>
                    ) : (
                      <text
                        x={lx}
                        y={isZero || is2Pi ? ly : ly + 4}
                        fill={isSelected ? '#38bdf8' : '#94a3b8'}
                        fontSize={compact ? '9' : '11'}
                        fontFamily="monospace"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        textAnchor={textAnchor}
                        className="transition-colors group-hover:fill-white select-none"
                      >
                        {angle.radStr}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Active point indicator with subtle pulsing halo */}
              <circle
                cx={ptX}
                cy={ptY}
                r="14"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="transition-all duration-200 ease-out pointer-events-none opacity-80"
              />
              <circle
                cx={ptX}
                cy={ptY}
                r="8"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="2.5"
                className="transition-all duration-200 ease-out pointer-events-none shadow-lg drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
              />
            </svg>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-cyan-400 rounded-full inline-block" />
              <span>横幅 = cos(x)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block" />
              <span>縦幅 = sin(y)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-400 rounded-full inline-block" />
              <span>傾き = tan</span>
            </span>
          </div>
        </div>

        {/* Right: Detailed Card for current Angle */}
        <div className={`${compact ? '' : 'lg:col-span-6 xl:col-span-5'} flex flex-col gap-2`}>
          <div className="bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800">
            <div className="flex items-baseline justify-between">
              <div className="inline-flex items-center">
                <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 inline-flex items-center">
                  <MathValueDisplay label={currentAngle.radStr} size="lg" className="text-cyan-300 font-extrabold" />
                </span>
                <span className="ml-2 text-xs sm:text-sm text-slate-400 font-mono">
                  ({currentAngle.degree}°)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {currentAngle.quadrant === 'axis' ? '軸上の角' : `第${currentAngle.quadrant}象限`}
              </span>
            </div>

            {/* Quick values box */}
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {/* sin */}
              <div
                className={`p-2 rounded-lg border transition-all ${
                  activeFuncTab === 'sin' || activeFuncTab === 'all'
                    ? 'bg-emerald-950/40 border-emerald-800/80'
                    : 'bg-slate-900 border-slate-800 opacity-60'
                }`}
              >
                <div className="text-[10px] font-mono text-emerald-400 font-bold mb-0.5">
                  <TrigExpression func="sin" angleRad={currentAngle.radStr} size="xs" />
                </div>
                <div className="text-sm sm:text-base text-white font-mono font-bold">
                  <MathValueDisplay label={currentAngle.sinDisplay} size="sm" />
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">y座標 (高さ)</div>
              </div>

              {/* cos */}
              <div
                className={`p-2 rounded-lg border transition-all ${
                  activeFuncTab === 'cos' || activeFuncTab === 'all'
                    ? 'bg-cyan-950/40 border-cyan-800/80'
                    : 'bg-slate-900 border-slate-800 opacity-60'
                }`}
              >
                <div className="text-[10px] font-mono text-cyan-400 font-bold mb-0.5">
                  <TrigExpression func="cos" angleRad={currentAngle.radStr} size="xs" />
                </div>
                <div className="text-sm sm:text-base text-white font-mono font-bold">
                  <MathValueDisplay label={currentAngle.cosDisplay} size="sm" />
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">x座標 (横幅)</div>
              </div>

              {/* tan */}
              <div
                className={`p-2 rounded-lg border transition-all ${
                  activeFuncTab === 'tan' || activeFuncTab === 'all'
                    ? 'bg-amber-950/40 border-amber-800/80'
                    : 'bg-slate-900 border-slate-800 opacity-60'
                }`}
              >
                <div className="text-[10px] font-mono text-amber-400 font-bold mb-0.5">
                  <TrigExpression func="tan" angleRad={currentAngle.radStr} size="xs" />
                </div>
                <div className="text-sm sm:text-base text-white font-mono font-bold">
                  <MathValueDisplay
                    label={currentAngle.tanDisplay}
                    isUndefined={currentAngle.tanKey === 'undefined'}
                    size="sm"
                  />
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">傾き (y/x)</div>
              </div>
            </div>
          </div>

          {/* Explanation Callout */}
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] leading-snug text-slate-300">
            <div className="flex items-center gap-1 font-bold text-indigo-300 mb-0.5">
              <Info className="w-3.5 h-3.5" />
              <span>考え方のコツ ({currentAngle.triangleNote || '単位円の定義'})</span>
            </div>
            <p className="text-slate-300 line-clamp-2">
              {activeFuncTab === 'sin'
                ? currentAngle.explanation.sin
                : activeFuncTab === 'cos'
                ? currentAngle.explanation.cos
                : activeFuncTab === 'tan'
                ? currentAngle.explanation.tan
                : `${currentAngle.explanation.cos} ${currentAngle.explanation.sin}`}
            </p>
          </div>

          {/* Quick angle selection bar */}
          <div className="pt-0.5">
            <div className="text-[10px] text-slate-400 mb-1 font-mono">主要角ジャンプ:</div>
            <div className="flex flex-wrap gap-1">
              {ANGLE_DATABASE.map(a => (
                <button
                  key={a.radStr}
                  onClick={() => handleSelect(a)}
                  className={`px-1.5 py-0.5 min-h-[26px] inline-flex items-center justify-center text-[11px] font-mono rounded transition-colors ${
                    a.radStr === selectedAngleRad
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <MathValueDisplay label={a.radStr} size="xs" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
