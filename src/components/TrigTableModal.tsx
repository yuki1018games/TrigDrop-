import React, { useState } from 'react';
import { ANGLE_DATABASE } from '../utils/trigData';
import { MathValueDisplay } from './MathDisplay';
import { Table, Sparkles, X, LayoutGrid, Columns } from 'lucide-react';

interface TrigTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrigTableModal: React.FC<TrigTableModalProps> = ({ isOpen, onClose }) => {
  const [scope, setScope] = useState<'basic' | 'full'>('basic');
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [selectedAngleDeg, setSelectedAngleDeg] = useState<number | null>(null);

  if (!isOpen) return null;

  // Filter angles based on scope
  // 'basic': 0° to 180° (0 〜 π / 高校数学I 三角比)
  // 'full': 0° to 360° (0 〜 2π / 高校数学II 三角関数)
  const angles = ANGLE_DATABASE.filter(item => {
    if (scope === 'basic') {
      return item.degree <= 180;
    }
    return true;
  });

  const selectedItem = selectedAngleDeg !== null ? angles.find(a => a.degree === selectedAngleDeg) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-3 sm:p-5 text-slate-100 shadow-2xl flex flex-col max-h-[94dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>三角比・三角関数 早見表</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cheat Sheet
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                1: 弧度法 · 2: sin · 3: cos · 4: tan の全値を一目で確認
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:px-3 sm:py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-mono"
            title="閉じる"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">閉じる</span>
          </button>
        </div>

        {/* Controls: Scope Switcher & Layout Style Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 shrink-0 border-b border-slate-800/80">
          {/* Scope Selector */}
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setScope('basic')}
              className={`px-3 py-1 rounded-md transition-all ${
                scope === 'basic'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              基本 (0 〜 π / 数学I 三角比)
            </button>
            <button
              type="button"
              onClick={() => setScope('full')}
              className={`px-3 py-1 rounded-md transition-all ${
                scope === 'full'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              全周 (0 〜 2π / 数学II 三角関数)
            </button>
          </div>

          {/* Table Layout Toggle (Horizontal Textbook Matrix vs Vertical List) */}
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('horizontal')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'horizontal'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="教科書スタイルの横軸表示（横軸1列目:弧度法、2:sin、3:cos、4:tan）"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>横軸表 (教科書スタイル)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('vertical')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'vertical'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="縦一覧表示（1列目:弧度法、2列目:sin、3列目:cos、4列目:tan）"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>縦一覧表</span>
            </button>
          </div>
        </div>

        {/* Quick Memorization Tricks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 shrink-0 text-[11px] leading-relaxed">
          <div className="bg-slate-950/70 border border-emerald-900/40 rounded-lg p-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>2列目 sin の覚え方 (0 ➔ π/2)</span>
            </div>
            <div className="text-slate-300 font-mono">
              √0/2, √1/2, √2/2, √3/2, √4/2
              <br />
              <span className="text-emerald-300 font-bold">0 ➔ 1/2 ➔ √2/2 ➔ √3/2 ➔ 1</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-cyan-900/40 rounded-lg p-2">
            <div className="font-bold text-cyan-400 flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>3列目 cos の覚え方 (0 ➔ π/2)</span>
            </div>
            <div className="text-slate-300 font-mono">
              sinの逆順で減少していく
              <br />
              <span className="text-cyan-300 font-bold">1 ➔ √3/2 ➔ √2/2 ➔ 1/2 ➔ 0</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-amber-900/40 rounded-lg p-2">
            <div className="font-bold text-amber-400 flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>4列目 tan の覚え方 (0 ➔ π/2)</span>
            </div>
            <div className="text-slate-300 font-mono">
              45°で1、30°で小さく、60°で急
              <br />
              <span className="text-amber-300 font-bold">0 ➔ 1/√3 ➔ 1 ➔ √3 ➔ なし</span>
            </div>
          </div>
        </div>

        {/* TABLE DISPLAY */}
        {viewMode === 'horizontal' ? (
          /* =========================================================================
             HORIZONTAL TEXTBOOK MATRIX VIEW (User Request):
             Row 1 (横軸1列目/段目): 弧度法 θ (with Degree badge)
             Row 2 (二列目/段目): sin θ (y座標・高さ)
             Row 3 (三列目/段目): cos θ (x座標・横幅)
             Row 4 (四列目/段目): tan θ (傾き)
             ========================================================================= */
          <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-inner">
            <table className="w-full border-collapse text-center select-text">
              <tbody>
                {/* ROW 1: 弧度法 (横軸1列目) */}
                <tr className="border-b border-slate-800 bg-slate-900/90 font-mono">
                  <th className="sticky left-0 z-20 bg-slate-900 px-3 py-3 text-left font-bold text-indigo-300 text-xs sm:text-sm whitespace-nowrap border-r border-slate-800 min-w-[130px] shadow">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                        1
                      </span>
                      <span>弧度法 <span className="math-theta">θ</span></span>
                    </div>
                    <span className="text-[10px] font-normal text-slate-400 block ml-6">
                      (度数法 度数)
                    </span>
                  </th>
                  {angles.map(item => {
                    const isSelected = selectedAngleDeg === item.degree;
                    return (
                      <td
                        key={item.degree}
                        onClick={() => setSelectedAngleDeg(isSelected ? null : item.degree)}
                        className={`px-3 py-2.5 cursor-pointer border-r border-slate-800/80 transition-colors min-w-[72px] sm:min-w-[80px] ${
                          isSelected ? 'bg-indigo-950 ring-2 ring-indigo-500' : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="font-bold text-indigo-300 text-sm">
                          <MathValueDisplay label={item.radStr} size="sm" />
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {item.degree}°
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* ROW 2: sin (二列目) */}
                <tr className="border-b border-slate-800/80 bg-slate-950 font-mono">
                  <th className="sticky left-0 z-20 bg-slate-900 px-3 py-3 text-left font-bold text-emerald-400 text-xs sm:text-sm whitespace-nowrap border-r border-slate-800 min-w-[130px] shadow">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                        2
                      </span>
                      <span>sin <span className="math-theta">θ</span></span>
                    </div>
                    <span className="text-[10px] font-normal text-emerald-500/80 block ml-6">
                      y座標 (高さ)
                    </span>
                  </th>
                  {angles.map(item => {
                    const isSelected = selectedAngleDeg === item.degree;
                    return (
                      <td
                        key={item.degree}
                        onClick={() => setSelectedAngleDeg(isSelected ? null : item.degree)}
                        className={`px-3 py-3 cursor-pointer border-r border-slate-800/80 font-bold transition-colors ${
                          isSelected
                            ? 'bg-emerald-950/60 ring-2 ring-emerald-500 text-white'
                            : 'bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40'
                        }`}
                      >
                        <MathValueDisplay label={item.sinDisplay} size="sm" />
                      </td>
                    );
                  })}
                </tr>

                {/* ROW 3: cos (三列目) */}
                <tr className="border-b border-slate-800/80 bg-slate-950 font-mono">
                  <th className="sticky left-0 z-20 bg-slate-900 px-3 py-3 text-left font-bold text-cyan-400 text-xs sm:text-sm whitespace-nowrap border-r border-slate-800 min-w-[130px] shadow">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                        3
                      </span>
                      <span>cos <span className="math-theta">θ</span></span>
                    </div>
                    <span className="text-[10px] font-normal text-cyan-500/80 block ml-6">
                      x座標 (横幅)
                    </span>
                  </th>
                  {angles.map(item => {
                    const isSelected = selectedAngleDeg === item.degree;
                    return (
                      <td
                        key={item.degree}
                        onClick={() => setSelectedAngleDeg(isSelected ? null : item.degree)}
                        className={`px-3 py-3 cursor-pointer border-r border-slate-800/80 font-bold transition-colors ${
                          isSelected
                            ? 'bg-cyan-950/60 ring-2 ring-cyan-500 text-white'
                            : 'bg-cyan-950/20 text-cyan-300 hover:bg-cyan-950/40'
                        }`}
                      >
                        <MathValueDisplay label={item.cosDisplay} size="sm" />
                      </td>
                    );
                  })}
                </tr>

                {/* ROW 4: tan (四列目) */}
                <tr className="bg-slate-950 font-mono">
                  <th className="sticky left-0 z-20 bg-slate-900 px-3 py-3 text-left font-bold text-amber-400 text-xs sm:text-sm whitespace-nowrap border-r border-slate-800 min-w-[130px] shadow">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">
                        4
                      </span>
                      <span>tan <span className="math-theta">θ</span></span>
                    </div>
                    <span className="text-[10px] font-normal text-amber-500/80 block ml-6">
                      傾き (y/x)
                    </span>
                  </th>
                  {angles.map(item => {
                    const isSelected = selectedAngleDeg === item.degree;
                    return (
                      <td
                        key={item.degree}
                        onClick={() => setSelectedAngleDeg(isSelected ? null : item.degree)}
                        className={`px-3 py-3 cursor-pointer border-r border-slate-800/80 font-bold transition-colors ${
                          isSelected
                            ? 'bg-amber-950/60 ring-2 ring-amber-500 text-white'
                            : 'bg-amber-950/20 text-amber-300 hover:bg-amber-950/40'
                        }`}
                      >
                        <MathValueDisplay label={item.tanDisplay} size="sm" />
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* =========================================================================
             VERTICAL COLUMN VIEW:
             Col 1: 弧度法 (with degree)
             Col 2: sin θ
             Col 3: cos θ
             Col 4: tan θ
             ========================================================================= */
          <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/50 shadow-inner">
            <table className="w-full text-center border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-900 text-xs font-mono uppercase text-slate-300 shadow">
                <tr className="border-b border-slate-800">
                  <th className="py-2.5 px-3 font-bold text-indigo-300 text-left sm:text-center">
                    1: 弧度法 (度数)
                  </th>
                  <th className="py-2.5 px-2 font-bold text-emerald-400 bg-emerald-950/30">
                    2: sin θ (高さ)
                  </th>
                  <th className="py-2.5 px-2 font-bold text-cyan-400 bg-cyan-950/30">
                    3: cos θ (横幅)
                  </th>
                  <th className="py-2.5 px-2 font-bold text-amber-400 bg-amber-950/30">
                    4: tan θ (傾き)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs sm:text-sm font-mono">
                {angles.map(item => {
                  const isSelected = selectedAngleDeg === item.degree;

                  return (
                    <tr
                      key={item.degree}
                      onClick={() => setSelectedAngleDeg(isSelected ? null : item.degree)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-950/60 ring-1 ring-indigo-500'
                          : 'hover:bg-slate-800/50'
                      }`}
                    >
                      {/* 1列目: 弧度法 */}
                      <td className="py-2 px-3 text-indigo-300 whitespace-nowrap text-left sm:text-center font-bold">
                        <div className="inline-flex items-center gap-2">
                          <MathValueDisplay label={item.radStr} size="sm" />
                          <span className="text-[11px] text-slate-400 font-normal">({item.degree}°)</span>
                        </div>
                      </td>

                      {/* 2列目: sin */}
                      <td className="py-2 px-2 text-emerald-300 bg-emerald-950/15 whitespace-nowrap font-bold">
                        <MathValueDisplay label={item.sinDisplay} size="sm" />
                      </td>

                      {/* 3列目: cos */}
                      <td className="py-2 px-2 text-cyan-300 bg-cyan-950/15 whitespace-nowrap font-bold">
                        <MathValueDisplay label={item.cosDisplay} size="sm" />
                      </td>

                      {/* 4列目: tan */}
                      <td className="py-2 px-2 text-amber-300 bg-amber-950/15 whitespace-nowrap font-bold">
                        <MathValueDisplay label={item.tanDisplay} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected Angle Detailed Explanation Bar */}
        {selectedItem && (
          <div className="mt-2.5 p-2.5 bg-slate-950 border border-indigo-900/60 rounded-xl text-xs flex items-center justify-between gap-3 shrink-0 animate-in fade-in">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400 font-mono text-sm">{selectedItem.radStr} rad</span>
                <span className="text-slate-400">({selectedItem.degree}°) の詳細:</span>
                <span className="text-slate-400 text-[11px]">{selectedItem.triangleNote}</span>
              </div>
              <div className="text-slate-300 text-[11px] flex flex-wrap gap-x-4 gap-y-1 font-mono">
                <span>
                  <strong className="text-emerald-400">sin:</strong> {selectedItem.explanation.sin}
                </span>
                <span>
                  <strong className="text-cyan-400">cos:</strong> {selectedItem.explanation.cos}
                </span>
                <span>
                  <strong className="text-amber-400">tan:</strong> {selectedItem.explanation.tan}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedAngleDeg(null)}
              className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800 shrink-0 text-xs">
          <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
            ※ 各角度をクリック・タップすると図形的解説と値の詳細が表示されます
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors ml-auto text-xs"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
