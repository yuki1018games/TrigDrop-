import React, { useEffect } from 'react';
import { DEGREE_VALUES, RADIAN_VALUES, SIN_COS_VALUES, TAN_VALUES } from '../utils/trigData';
import { ExactValueItem, TrigFunc } from '../types/trig';
import { MathValueDisplay } from './MathDisplay';
import { Compass } from 'lucide-react';

interface InputPaletteProps {
  onSelectValue: (valueKey: string) => void;
  includeTan?: boolean;
  activeTargetFunc?: TrigFunc;
  disabled?: boolean;
  showShortcuts?: boolean;
  isSidebar?: boolean;
}

export const InputPalette: React.FC<InputPaletteProps> = ({
  onSelectValue,
  includeTan = false,
  activeTargetFunc = 'sin',
  disabled = false,
  showShortcuts = true,
  isSidebar = false,
}) => {
  const isDegreeMode = activeTargetFunc === 'rad' || (Boolean(activeTargetFunc?.startsWith('inv_')) && !activeTargetFunc?.startsWith('inv_rad_'));
  const isRadianMode = activeTargetFunc === 'deg_to_rad' || Boolean(activeTargetFunc?.startsWith('inv_rad_'));

  // Listen to keyboard shortcuts
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is in an input or modal
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      const keyUpper = e.key.toUpperCase();

      if (isRadianMode) {
        // Radian keyboard shortcuts
        const matched = RADIAN_VALUES.find(item => item.shortcutKey === keyUpper || item.shortcutKey === e.key);
        if (matched) {
          e.preventDefault();
          onSelectValue(matched.key);
        }
        return;
      }

      if (isDegreeMode) {
        // Degree keyboard shortcuts
        const matched = DEGREE_VALUES.find(item => item.shortcutKey === keyUpper || item.shortcutKey === e.key);
        if (matched) {
          e.preventDefault();
          onSelectValue(matched.key);
        }
        return;
      }

      // Check in appropriate value set
      const isTanTarget = activeTargetFunc === 'tan';
      const activeList = isTanTarget ? TAN_VALUES : SIN_COS_VALUES;

      const matched = activeList.find(item => item.shortcutKey === keyUpper);
      if (matched) {
        e.preventDefault();
        onSelectValue(matched.key);
        return;
      }

      // Also check the other list if not found
      const fallbackList = isTanTarget ? SIN_COS_VALUES : TAN_VALUES;
      const matchedFallback = fallbackList.find(item => item.shortcutKey === keyUpper);
      if (matchedFallback) {
        e.preventDefault();
        onSelectValue(matchedFallback.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onSelectValue, activeTargetFunc, isDegreeMode, isRadianMode]);

  const negativeValues = SIN_COS_VALUES.filter(v => v.isNegative);
  const zeroValue = SIN_COS_VALUES.find(v => v.key === '0')!;
  const positiveValues = SIN_COS_VALUES.filter(v => !v.isNegative && v.key !== '0');

  // Split degree values into standard (0 to 180) and quadrant 3/4 (210 to 360)
  const degrees0to180 = DEGREE_VALUES.filter(d => d.degree <= 180);
  const degrees210to360 = DEGREE_VALUES.filter(d => d.degree > 180);

  // Split radian values into standard (0 to 180) and quadrant 3/4 (210 to 360)
  const radians0to180 = RADIAN_VALUES.filter(r => r.degree <= 180);
  const radians210to360 = RADIAN_VALUES.filter(r => r.degree > 180);

  return (
    <div className={`w-full ${isSidebar ? 'h-full flex flex-col justify-between' : 'max-w-2xl mx-auto'} select-none`}>
      {/* Target indicator banner */}
      <div className="flex items-center justify-between px-1 mb-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-medium text-slate-400">迎撃操作:</span>
          {isRadianMode ? (
            <span className="text-xs font-mono font-extrabold text-violet-300 bg-violet-950/80 px-2.5 py-0.5 rounded-full border border-violet-600/80 shadow">
              弧度法 [ rad ] で即答
            </span>
          ) : isDegreeMode ? (
            <span className="text-xs font-mono font-extrabold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-600/80 shadow">
              度数法 [ ° ] で即答
            </span>
          ) : activeTargetFunc === 'tan' ? (
            <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-600/80 shadow">
              tan (傾き) 迎撃中
            </span>
          ) : activeTargetFunc === 'cos' ? (
            <span className="text-xs font-mono font-extrabold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-600/80 shadow">
              cos (x座標) で回答
            </span>
          ) : (
            <span className="text-xs font-mono font-extrabold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-600/80 shadow">
              sin (y座標) で回答
            </span>
          )}
        </div>
        {showShortcuts && (
          <span className="hidden xl:inline text-[10px] text-slate-400 font-mono">
            {isRadianMode || isDegreeMode ? 'キー [1〜9 / Q〜O]' : 'キー [A-G / Z-V]'}
          </span>
        )}
      </div>

      {/* Main Palette */}
      <div className={`bg-slate-900/95 border border-slate-800/90 p-2 rounded-xl shadow-lg backdrop-blur-md flex-1 flex flex-col justify-center min-h-0 ${isSidebar ? 'overflow-y-auto' : ''}`}>
        {isRadianMode ? (
          /* Radian Keypad */
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-violet-300 uppercase tracking-wider font-bold">
              第1・第2象限 (0 〜 π rad):
            </div>
            <div className={`grid ${isSidebar ? 'grid-cols-5' : 'grid-cols-5 sm:grid-cols-9'} gap-1`}>
              {radians0to180.map(item => (
                <button
                  key={item.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectValue(item.key)}
                  className={`flex flex-col items-center justify-center ${isSidebar ? 'min-h-[36px] sm:min-h-[40px] py-0.5' : 'min-h-[36px] sm:min-h-[40px] py-1'} px-1 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-violet-950/80 hover:border-violet-500 text-white font-mono font-bold transition-all active:scale-95 disabled:opacity-40 shadow-sm`}
                >
                  <MathValueDisplay label={item.label} size="sm" />
                  {showShortcuts && item.shortcutKey && (
                    <span className="hidden sm:inline text-[8px] text-slate-400 opacity-70 leading-none mt-0.5">[{item.shortcutKey}]</span>
                  )}
                </button>
              ))}
            </div>

            <div className="text-[10px] font-mono text-violet-300 uppercase tracking-wider font-bold pt-1">
              第3・第4象限 (7π/6 〜 2π rad):
            </div>
            <div className={`grid ${isSidebar ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-8'} gap-1`}>
              {radians210to360.map(item => (
                <button
                  key={item.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectValue(item.key)}
                  className={`flex flex-col items-center justify-center ${isSidebar ? 'min-h-[36px] sm:min-h-[40px] py-0.5' : 'min-h-[36px] sm:min-h-[40px] py-1'} px-1 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-violet-950/80 hover:border-violet-500 text-violet-200 font-mono font-bold transition-all active:scale-95 disabled:opacity-40 shadow-sm`}
                >
                  <MathValueDisplay label={item.label} size="sm" />
                  {showShortcuts && item.shortcutKey && (
                    <span className="hidden sm:inline text-[8px] text-slate-400 opacity-70 leading-none mt-0.5">[{item.shortcutKey}]</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : isDegreeMode ? (
          /* Degree Keypad */
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-bold">
              第1・第2象限 (0° 〜 180°):
            </div>
            <div className={`grid ${isSidebar ? 'grid-cols-5' : 'grid-cols-5 sm:grid-cols-9'} gap-1`}>
              {degrees0to180.map(item => (
                <button
                  key={item.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectValue(item.key)}
                  className={`flex flex-col items-center justify-center ${isSidebar ? 'min-h-[34px] sm:min-h-[38px] py-0.5' : 'min-h-[34px] sm:min-h-[38px] py-1'} px-1 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-amber-950/80 hover:border-amber-500 text-white font-mono font-bold transition-all active:scale-95 disabled:opacity-40 shadow-sm`}
                >
                  <span className="text-xs sm:text-sm">{item.label}</span>
                  {showShortcuts && item.shortcutKey && (
                    <span className="hidden sm:inline text-[8px] text-slate-400 opacity-70 leading-none">[{item.shortcutKey}]</span>
                  )}
                </button>
              ))}
            </div>

            <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-bold pt-1">
              第3・第4象限 (210° 〜 360°):
            </div>
            <div className={`grid ${isSidebar ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-8'} gap-1`}>
              {degrees210to360.map(item => (
                <button
                  key={item.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectValue(item.key)}
                  className={`flex flex-col items-center justify-center ${isSidebar ? 'min-h-[34px] sm:min-h-[38px] py-0.5' : 'min-h-[34px] sm:min-h-[38px] py-1'} px-1 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-cyan-950/80 hover:border-cyan-500 text-cyan-200 font-mono font-bold transition-all active:scale-95 disabled:opacity-40 shadow-sm`}
                >
                  <span className="text-xs sm:text-sm">{item.label}</span>
                  {showShortcuts && item.shortcutKey && (
                    <span className="hidden sm:inline text-[8px] text-slate-400 opacity-70 leading-none">[{item.shortcutKey}]</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Trig Values Keypad */
          <div className="space-y-2">
            {/* Header info in sidebar */}
            {isSidebar && (
              <div className="grid grid-cols-3 text-center text-[10px] font-mono text-slate-400 font-semibold mb-0.5">
                <span className="text-rose-400">負の値 (-)</span>
                <span className="text-slate-300">0</span>
                <span className="text-cyan-400">正の値 (+)</span>
              </div>
            )}

            <div className={`grid ${isSidebar ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-9'} gap-1.5`}>
              {/* Negatives */}
              {negativeValues.map(item => (
                <PaletteButton
                  key={item.key}
                  item={item}
                  category="negative"
                  disabled={disabled}
                  showShortcut={showShortcuts}
                  isSidebar={isSidebar}
                  onClick={() => onSelectValue(item.key)}
                />
              ))}

              {/* Zero */}
              <PaletteButton
                key={zeroValue.key}
                item={zeroValue}
                category="zero"
                disabled={disabled}
                showShortcut={showShortcuts}
                isSidebar={isSidebar}
                onClick={() => onSelectValue(zeroValue.key)}
              />

              {/* Positives */}
              {positiveValues.map(item => (
                <PaletteButton
                  key={item.key}
                  item={item}
                  category="positive"
                  disabled={disabled}
                  showShortcut={showShortcuts}
                  isSidebar={isSidebar}
                  onClick={() => onSelectValue(item.key)}
                />
              ))}
            </div>

            {/* Tan palette (shown when includeTan is enabled or when tan problem is present) */}
            {includeTan && (
              <div className="mt-2 pt-2 border-t border-slate-800">
                <div className="text-[10px] font-mono text-amber-400/90 mb-1 uppercase tracking-wider font-semibold">
                  tan (傾き) 専用値:
                </div>
                <div className={`grid ${isSidebar ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-8'} gap-1.5`}>
                  {TAN_VALUES.map(item => (
                    <PaletteButton
                      key={`tan_${item.key}`}
                      item={item}
                      category="tan"
                      disabled={disabled}
                      showShortcut={showShortcuts}
                      isSidebar={isSidebar}
                      onClick={() => onSelectValue(item.key)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mini Tactical Unit Circle Radar (Sidebar Only) */}
      {isSidebar && (
        <div className="mt-1 p-1 sm:p-1.5 bg-slate-950/90 rounded-xl border border-slate-800/90 shrink-0 flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 select-none" viewBox="0 0 100 100">
              {/* Axes */}
              <line x1="10" y1="50" x2="90" y2="50" stroke="#475569" strokeWidth="1.5" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="#475569" strokeWidth="1.5" />
              {/* Circle */}
              <circle cx="50" cy="50" r="36" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="3,3" />

              {/* Highlight according to target */}
              {activeTargetFunc === 'sin' || activeTargetFunc === 'inv_sin' ? (
                <>
                  <line x1="50" y1="50" x2="50" y2="18" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="18" r="4" fill="#34d399" />
                  <line x1="50" y1="50" x2="75" y2="24" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2,2" />
                  <circle cx="75" cy="24" r="3" fill="#10b981" />
                </>
              ) : activeTargetFunc === 'cos' || activeTargetFunc === 'inv_cos' ? (
                <>
                  <line x1="50" y1="50" x2="82" y2="50" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="82" cy="50" r="4" fill="#38bdf8" />
                  <line x1="50" y1="50" x2="75" y2="24" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2,2" />
                  <circle cx="75" cy="24" r="3" fill="#06b6d4" />
                </>
              ) : activeTargetFunc === 'tan' || activeTargetFunc === 'inv_tan' ? (
                <>
                  <line x1="20" y1="80" x2="80" y2="20" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="86" y1="14" x2="86" y2="86" stroke="#d97706" strokeWidth="1.5" strokeDasharray="2,2" />
                  <circle cx="86" cy="14" r="3.5" fill="#fbbf24" />
                </>
              ) : (
                <>
                  <path d="M 50,50 L 75,25" stroke="#f59e0b" strokeWidth="2" />
                  <path d="M 64,50 A 14,14 0 0,0 60,40" fill="none" stroke="#fbbf24" strokeWidth="2" />
                  <text x="64" y="42" fill="#fbbf24" fontSize="10" className="math-theta">θ</text>
                </>
              )}
            </svg>

            <div className="text-[10px] leading-tight text-slate-300 font-mono">
              <span className="font-bold text-white block mb-0.5">
                {activeTargetFunc === 'sin' || activeTargetFunc === 'inv_sin'
                  ? 'sin = y座標 (高さ)'
                  : activeTargetFunc === 'cos' || activeTargetFunc === 'inv_cos'
                  ? 'cos = x座標 (横幅)'
                  : activeTargetFunc === 'tan' || activeTargetFunc === 'inv_tan'
                  ? 'tan = 傾き (直線の傾斜)'
                  : activeTargetFunc === 'deg_to_rad'
                  ? '弧度法 [ rad ] を回答'
                  : '角度 θ [ ° ] を回答'}
              </span>
              <span className="text-[8px] text-slate-400">
                第1(+,+) 第2(-,+) 第3(-,-) 第4(+,-)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono text-indigo-400 flex items-center gap-1 justify-end">
              <Compass className="w-2.5 h-2.5" />
              <span>レーダー</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface PaletteButtonProps {
  item: ExactValueItem;
  category: 'negative' | 'zero' | 'positive' | 'tan';
  disabled: boolean;
  showShortcut: boolean;
  isSidebar?: boolean;
  onClick: () => void;
}

const PaletteButton: React.FC<PaletteButtonProps> = ({
  item,
  category,
  disabled,
  showShortcut,
  isSidebar = false,
  onClick,
}) => {
  const colorStyles = {
    negative: 'bg-slate-800/95 hover:bg-rose-950/80 border-slate-700/80 hover:border-rose-500 text-rose-200 active:bg-rose-900 shadow-sm',
    zero: 'bg-slate-800/95 hover:bg-slate-700 border-slate-700/80 hover:border-slate-500 text-slate-100 active:bg-slate-600 shadow-sm',
    positive: 'bg-slate-800/95 hover:bg-cyan-950/80 border-slate-700/80 hover:border-cyan-500 text-cyan-200 active:bg-cyan-900 shadow-sm',
    tan: 'bg-slate-800/95 hover:bg-amber-950/80 border-slate-700/80 hover:border-amber-500 text-amber-200 active:bg-amber-900 shadow-sm',
  }[category];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative group flex flex-col items-center justify-center ${
        isSidebar ? 'min-h-[28px] sm:min-h-[32px] py-0.5' : 'min-h-[30px] sm:min-h-[34px] py-1'
      } px-1 rounded-xl border transition-all duration-100 font-mono active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${colorStyles}`}
    >
      <div className="flex items-center justify-center">
        <MathValueDisplay
          label={item.label}
          numerator={item.numerator}
          denominator={item.denominator}
          isNegative={item.isNegative}
          isUndefined={item.isUndefined}
          size="sm"
        />
      </div>

      {showShortcut && item.shortcutKey && (
        <span className="hidden xl:inline-block text-[8px] text-slate-400 group-hover:text-slate-200 mt-0.5 opacity-70 leading-none">
          [{item.shortcutKey}]
        </span>
      )}
    </button>
  );
};
