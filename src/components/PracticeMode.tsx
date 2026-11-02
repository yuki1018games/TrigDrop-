import React, { useState } from 'react';
import { TrigProblem } from '../types/trig';
import { ANGLE_DATABASE, getProblemsForDifficulty, getRadianToDegreeProblems } from '../utils/trigData';
import { TrigExpression, MathValueDisplay, FormattedMathText } from './MathDisplay';
import { InputPalette } from './InputPalette';
import { UnitCircleExplorer } from './UnitCircleExplorer';
import { sounds } from '../utils/audio';
import { BookOpen, CheckCircle2, XCircle, ArrowRight, Lightbulb, Play, Sparkles } from 'lucide-react';

interface PracticeModeProps {
  onStartArcade: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ onStartArcade }) => {
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [problemIndex, setProblemIndex] = useState<number>(0);
  const [userResult, setUserResult] = useState<'correct' | 'wrong' | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  // Generate problems for the current stage
  const getStageProblems = (stg: number): TrigProblem[] => {
    switch (stg) {
      case 0:
        return getRadianToDegreeProblems('standard');
      case 1:
        return getProblemsForDifficulty('beginner', false);
      case 2:
        return getProblemsForDifficulty('standard', false);
      case 3:
        return getProblemsForDifficulty('standard', true);
      case 4:
        return getProblemsForDifficulty('advanced', true);
      default:
        return getProblemsForDifficulty('beginner', false);
    }
  };

  const currentProblems = getStageProblems(stage);
  const currentProblem = currentProblems[problemIndex % currentProblems.length];

  const handleSelectAnswer = (key: string) => {
    setSelectedKey(key);
    const expected = (currentProblem.correctValueKeys && currentProblem.correctValueKeys.length > 0)
      ? currentProblem.correctValueKeys
      : [currentProblem.correctValueKey];

    if (expected.includes(key)) {
      sounds.playLaser();
      sounds.playCombo(3);
      setUserResult('correct');
    } else {
      sounds.playWrong();
      setUserResult('wrong');
    }
  };

  const handleNext = () => {
    setUserResult(null);
    setSelectedKey(null);
    setProblemIndex(i => (i + 1) % currentProblems.length);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Stage Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base md:text-lg font-bold text-white">
            じっくりステップ学習 & 練習モード
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => { setStage(0); setProblemIndex(0); setUserResult(null); }}
            className={`px-3 py-1.5 rounded transition-colors ${
              stage === 0 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stage 0: 弧度法 ➔ 度数法
          </button>
          <button
            onClick={() => { setStage(1); setProblemIndex(0); setUserResult(null); }}
            className={`px-3 py-1.5 rounded transition-colors ${
              stage === 1 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stage 1: 第1象限 (基本)
          </button>
          <button
            onClick={() => { setStage(2); setProblemIndex(0); setUserResult(null); }}
            className={`px-3 py-1.5 rounded transition-colors ${
              stage === 2 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stage 2: 0〜π (符号マスター)
          </button>
          <button
            onClick={() => { setStage(3); setProblemIndex(0); setUserResult(null); }}
            className={`px-3 py-1.5 rounded transition-colors ${
              stage === 3 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stage 3: tan (傾き) 導入
          </button>
          <button
            onClick={() => { setStage(4); setProblemIndex(0); setUserResult(null); }}
            className={`px-3 py-1.5 rounded transition-colors ${
              stage === 4 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stage 4: 全4象限 (0〜2π)
          </button>
        </div>
      </div>

      {/* Main Practice Workspace: Split into Problem Card and Unit Circle Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Problem Card & Keypad (7 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl relative overflow-hidden">
            {/* Problem Header */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-4">
              <span>問 {problemIndex + 1} / {currentProblems.length}</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                {currentProblem.triangleHint || '基本角'}
              </span>
            </div>

            {/* Expression */}
            <div className="py-6 my-2 bg-slate-950 rounded-xl border border-slate-800/80">
              <TrigExpression
                func={currentProblem.func}
                angleRad={currentProblem.angleRad}
                angleDegree={currentProblem.angleDegree}
                givenValueDisplay={currentProblem.givenValueDisplay}
                domainHint={currentProblem.domainHint}
                problemType={currentProblem.problemType}
                size="xl"
              />
              <div className="text-xs text-slate-400 font-mono mt-2">
                度数法: {currentProblem.angleDegree}° ({currentProblem.quadrant === 'axis' ? '軸' : `第${currentProblem.quadrant}象限`})
              </div>
            </div>

            {/* Result feedback */}
            {userResult && (
              <div
                className={`p-3 rounded-xl border my-4 text-xs flex items-center justify-between animate-in fade-in duration-200 ${
                  userResult === 'correct'
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-600 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {userResult === 'correct' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div className="text-left">
                    <span className="font-bold flex items-center gap-1.5 flex-wrap">
                      <span>{userResult === 'correct' ? '正解！' : '惜しい！'} 正しい値:</span>
                      <span className="text-emerald-300 font-mono inline-flex items-center">
                        <MathValueDisplay label={currentProblem.correctDisplay} size="sm" />
                      </span>
                    </span>
                    <FormattedMathText
                      text={currentProblem.explanation}
                      className="text-[11px] opacity-90 block mt-0.5"
                      fractionSize="xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-950 rounded-lg font-bold hover:bg-slate-200 transition-colors shrink-0 ml-2"
                >
                  次へ <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Palette */}
            <div className="mt-4 text-left">
              <InputPalette
                onSelectValue={handleSelectAnswer}
                includeTan={stage >= 3}
                activeTargetFunc={currentProblem.func}
                disabled={userResult === 'correct'}
              />
            </div>
          </div>

          {/* Quick CTA to jump into arcade */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-800/60 rounded-xl flex items-center justify-between">
            <div className="text-xs text-indigo-200">
              <span className="font-bold block text-white text-sm">自信がついたら実戦へ！</span>
              上から問題が降ってくる体力制サバイバル防衛戦に挑戦しよう
            </div>
            <button
              onClick={onStartArcade}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-colors shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              防衛戦をプレイ
            </button>
          </div>
        </div>

        {/* Right: Interactive Unit Circle Companion (6 cols) */}
        <div className="lg:col-span-6">
          <UnitCircleExplorer
            initialAngle={currentProblem.angleRad}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
};
