import React, { useState } from 'react';
import { TrigProblem } from '../types/trig';
import { ANGLE_DATABASE } from '../utils/trigData';
import { Compass, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

interface UnitCircleInGameAssistProps {
  currentProblem?: TrigProblem | null;
  enabled: boolean;
  onToggleEnabled?: () => void;
}

export const UnitCircleInGameAssist: React.FC<UnitCircleInGameAssistProps> = ({
  currentProblem,
  enabled,
  onToggleEnabled,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (!enabled) return null;

  // Find angle info for the current problem
  let radNum = 0;
  let radStr = '0';
  let degree = 0;
  let quadrant: string = '軸';

  if (currentProblem) {
    degree = currentProblem.angleDegree ?? 0;
    radStr = currentProblem.angleRad || '0';
    radNum = currentProblem.angleNumericRad ?? ((degree * Math.PI) / 180);

    const matched = ANGLE_DATABASE.find(
      a => a.degree === degree || a.radStr === radStr
    );

    if (matched) {
      quadrant = matched.quadrant === 'axis' ? '軸上' : `第${matched.quadrant}象限`;
    } else {
      quadrant = currentProblem.quadrant === 'axis' ? '軸上' : `第${currentProblem.quadrant}象限`;
    }
  }

  // Large, high-resolution SVG parameters for crisp coordinate visibility
  const size = 164;
  const center = 82;
  const radius = 58;

  // Key trigonometric coordinate offsets from center
  const offHalf = radius * 0.5; // 29.0 (1/2)
  const offRoot2 = radius * (Math.SQRT2 / 2); // 41.01 (√2/2 ≈ 0.707)
  const offRoot3 = radius * (Math.sqrt(3) / 2); // 50.23 (√3/2 ≈ 0.866)

  // Coordinate projections for current problem angle
  const ptX = center + radius * Math.cos(radNum);
  const ptY = center - radius * Math.sin(radNum); // SVG y is inverted

  if (isMinimized) {
    return (
      <div className="h-full w-8 sm:w-9 flex flex-col items-center justify-between py-2 px-0.5 bg-slate-950/95 border-r border-slate-800/90 select-none">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="p-1 rounded-lg text-cyan-300 hover:text-white hover:bg-cyan-950 border border-cyan-800/80 transition-colors shadow-sm"
          title="単位円アシストを展開"
        >
          <Compass className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex flex-col items-center text-[10px] font-mono font-bold text-slate-400 hover:text-cyan-300 tracking-wider py-1 select-none"
          style={{ writingMode: 'vertical-rl' }}
          title="単位円アシストを展開"
        >
          <span>単位円 ON</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
          title="展開"
        >
          <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-[200px] sm:w-[220px] flex flex-col justify-between select-none bg-slate-950/95 border-r border-slate-800/90 p-2 sm:p-2.5 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-800 text-[11px] font-mono shrink-0">
        <div className="flex items-center gap-1.5 font-extrabold text-cyan-300">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>単位円アシスト</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="最小化"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {onToggleEnabled && (
            <button
              type="button"
              onClick={onToggleEnabled}
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
              title="単位円アシストをOFFにする"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Target Angle Banner (Angle & Quadrant without revealing answer values) */}
      <div className="flex items-center justify-between text-xs font-mono px-2 py-0.5 mb-1 bg-slate-900/90 rounded-lg border border-slate-800 shrink-0">
        <span className="text-amber-300 font-extrabold">
          <span className="math-theta">θ</span> = {radStr}
        </span>
        <span className="text-slate-300 font-semibold">({degree}°)</span>
        <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/80 px-1.5 py-0.2 rounded font-bold">
          {quadrant}
        </span>
      </div>

      {/* Mini Unit Circle SVG Radar with Clear, High-Contrast Coordinate Markings */}
      <div className="flex justify-center my-0.5 bg-slate-900/40 rounded-xl p-1 border border-slate-800/60 shrink-0">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-[140px] sm:w-[155px] aspect-square overflow-visible select-none mx-auto"
        >
          {/* Subtle 1/2 Crosshair Guideline lines */}
          <line
            x1={center + offHalf}
            y1={center - radius}
            x2={center + offHalf}
            y2={center + radius}
            stroke="#475569"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <line
            x1={center - offHalf}
            y1={center - radius}
            x2={center - offHalf}
            y2={center + radius}
            stroke="#475569"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <line
            x1={center - radius}
            y1={center - offHalf}
            x2={center + radius}
            y2={center - offHalf}
            stroke="#475569"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <line
            x1={center - radius}
            y1={center + offHalf}
            x2={center + radius}
            y2={center + offHalf}
            stroke="#475569"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />

          {/* Unit Circle Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="rgba(15, 23, 42, 0.85)"
            stroke="#64748b"
            strokeWidth="2"
          />

          {/* Horizontal X Axis (Bold Bright White) */}
          <line
            x1={8}
            y1={center}
            x2={size - 10}
            y2={center}
            stroke="#f8fafc"
            strokeWidth="2"
          />
          {/* X Axis Arrow */}
          <polygon
            points={`${size - 5},${center} ${size - 12},${center - 3.5} ${size - 12},${center + 3.5}`}
            fill="#f8fafc"
          />
          <text
            x={size - 4}
            y={center - 5}
            fill="#38bdf8"
            fontSize="11"
            fontWeight="900"
            fontFamily="monospace"
          >
            x
          </text>

          {/* Vertical Y Axis (Bold Bright White) */}
          <line
            x1={center}
            y1={size - 8}
            x2={center}
            y2={10}
            stroke="#f8fafc"
            strokeWidth="2"
          />
          {/* Y Axis Arrow */}
          <polygon
            points={`${center},${5} ${center - 3.5},${12} ${center + 3.5},${12}`}
            fill="#f8fafc"
          />
          <text
            x={center + 5}
            y={12}
            fill="#34d399"
            fontSize="11"
            fontWeight="900"
            fontFamily="monospace"
          >
            y
          </text>

          {/* Origin O */}
          <text
            x={center - 9}
            y={center + 11}
            fill="#94a3b8"
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            O
          </text>

          {/* ================= X-Axis Coordinate Scale Markings ================= */}
          {/* +1 on X (White bold tick & label) */}
          <line
            x1={center + radius}
            y1={center - 5}
            x2={center + radius}
            y2={center + 5}
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <text
            x={center + radius}
            y={center + 16}
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="monospace"
          >
            1
          </text>

          {/* +√3/2 on X (~0.87, Amber tick) */}
          <line
            x1={center + offRoot3}
            y1={center - 4}
            x2={center + offRoot3}
            y2={center + 4}
            stroke="#fbbf24"
            strokeWidth="2"
          />

          {/* +√2/2 on X (~0.71, Violet tick) */}
          <line
            x1={center + offRoot2}
            y1={center - 3}
            x2={center + offRoot2}
            y2={center + 3}
            stroke="#a78bfa"
            strokeWidth="1.8"
          />

          {/* +1/2 on X (Cyan prominent tick & label) */}
          <line
            x1={center + offHalf}
            y1={center - 4.5}
            x2={center + offHalf}
            y2={center + 4.5}
            stroke="#38bdf8"
            strokeWidth="2.2"
          />
          <text
            x={center + offHalf}
            y={center + 15}
            fill="#38bdf8"
            fontSize="9"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="monospace"
          >
            1/2
          </text>

          {/* -1/2 on X (Cyan prominent tick & label) */}
          <line
            x1={center - offHalf}
            y1={center - 4.5}
            x2={center - offHalf}
            y2={center + 4.5}
            stroke="#38bdf8"
            strokeWidth="2.2"
          />
          <text
            x={center - offHalf}
            y={center + 15}
            fill="#38bdf8"
            fontSize="9"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="monospace"
          >
            -1/2
          </text>

          {/* -√2/2 on X (~ -0.71, Violet tick) */}
          <line
            x1={center - offRoot2}
            y1={center - 3}
            x2={center - offRoot2}
            y2={center + 3}
            stroke="#a78bfa"
            strokeWidth="1.8"
          />

          {/* -√3/2 on X (~ -0.87, Amber tick) */}
          <line
            x1={center - offRoot3}
            y1={center - 4}
            x2={center - offRoot3}
            y2={center + 4}
            stroke="#fbbf24"
            strokeWidth="2"
          />

          {/* -1 on X (White bold tick & label) */}
          <line
            x1={center - radius}
            y1={center - 5}
            x2={center - radius}
            y2={center + 5}
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <text
            x={center - radius}
            y={center + 16}
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="monospace"
          >
            -1
          </text>

          {/* ================= Y-Axis Coordinate Scale Markings ================= */}
          {/* +1 on Y (White bold tick & label) */}
          <line
            x1={center - 5}
            y1={center - radius}
            x2={center + 5}
            y2={center - radius}
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <text
            x={center - 7}
            y={center - radius + 3.5}
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            textAnchor="end"
            fontFamily="monospace"
          >
            1
          </text>

          {/* +√3/2 on Y (~0.87, Amber tick) */}
          <line
            x1={center - 4}
            y1={center - offRoot3}
            x2={center + 4}
            y2={center - offRoot3}
            stroke="#fbbf24"
            strokeWidth="2"
          />

          {/* +√2/2 on Y (~0.71, Violet tick) */}
          <line
            x1={center - 3}
            y1={center - offRoot2}
            x2={center + 3}
            y2={center - offRoot2}
            stroke="#a78bfa"
            strokeWidth="1.8"
          />

          {/* +1/2 on Y (Emerald prominent tick & label) */}
          <line
            x1={center - 4.5}
            y1={center - offHalf}
            x2={center + 4.5}
            y2={center - offHalf}
            stroke="#34d399"
            strokeWidth="2.2"
          />
          <text
            x={center - 7}
            y={center - offHalf + 3.5}
            fill="#34d399"
            fontSize="9"
            fontWeight="900"
            textAnchor="end"
            fontFamily="monospace"
          >
            1/2
          </text>

          {/* -1/2 on Y (Emerald prominent tick & label) */}
          <line
            x1={center - 4.5}
            y1={center + offHalf}
            x2={center + 4.5}
            y2={center + offHalf}
            stroke="#34d399"
            strokeWidth="2.2"
          />
          <text
            x={center - 7}
            y={center + offHalf + 3.5}
            fill="#34d399"
            fontSize="9"
            fontWeight="900"
            textAnchor="end"
            fontFamily="monospace"
          >
            -1/2
          </text>

          {/* -√2/2 on Y (~ -0.71, Violet tick) */}
          <line
            x1={center - 3}
            y1={center + offRoot2}
            x2={center + 3}
            y2={center + offRoot2}
            stroke="#a78bfa"
            strokeWidth="1.8"
          />

          {/* -√3/2 on Y (~ -0.87, Amber tick) */}
          <line
            x1={center - 4}
            y1={center + offRoot3}
            x2={center + 4}
            y2={center + offRoot3}
            stroke="#fbbf24"
            strokeWidth="2"
          />

          {/* -1 on Y (White bold tick & label) */}
          <line
            x1={center - 5}
            y1={center + radius}
            x2={center + 5}
            y2={center + radius}
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <text
            x={center - 7}
            y={center + radius + 3.5}
            fill="#ffffff"
            fontSize="10"
            fontWeight="900"
            textAnchor="end"
            fontFamily="monospace"
          >
            -1
          </text>

          {/* Reference Right Triangle */}
          <polygon
            points={`${center},${center} ${ptX},${center} ${ptX},${ptY}`}
            fill="rgba(99, 102, 241, 0.28)"
          />

          {/* cos (x projection, Vibrant Cyan Bar) */}
          <line
            x1={center}
            y1={center}
            x2={ptX}
            y2={center}
            stroke="#06b6d4"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* sin (y projection, Vibrant Emerald Bar) */}
          <line
            x1={ptX}
            y1={center}
            x2={ptX}
            y2={ptY}
            stroke="#10b981"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Radius Ray (Indigo Ray) */}
          <line
            x1={center}
            y1={center}
            x2={ptX}
            y2={ptY}
            stroke="#818cf8"
            strokeWidth="2.2"
          />

          {/* Active Target Glowing Dot on Circle Perimeter */}
          <circle
            cx={ptX}
            cy={ptY}
            r="5"
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth="2"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Coordinate Scale Tick Color Reference Key */}
      <div className="grid grid-cols-4 gap-1 py-1 px-1 my-1 bg-slate-900/80 rounded-lg border border-slate-800 text-[9px] font-mono font-bold text-center shrink-0">
        <div className="flex items-center justify-center gap-1 text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
          <span>1/2</span>
        </div>
        <div className="flex items-center justify-center gap-1 text-purple-300">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
          <span>√2/2</span>
        </div>
        <div className="flex items-center justify-center gap-1 text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <span>√3/2</span>
        </div>
        <div className="flex items-center justify-center gap-1 text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
          <span>1.0</span>
        </div>
      </div>

      {/* Visual Guide for X and Y */}
      <div className="flex items-center justify-around pt-1 border-t border-slate-800 text-[10px] font-mono font-bold select-none shrink-0">
        <div className="flex items-center gap-1 text-cyan-300">
          <span className="w-3 h-1 bg-cyan-400 rounded-full shrink-0" />
          <span>x : cos (横)</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-300">
          <span className="w-3 h-1 bg-emerald-400 rounded-full shrink-0" />
          <span>y : sin (縦)</span>
        </div>
      </div>
    </div>
  );
};
