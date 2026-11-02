import React from 'react';
import { GameDifficulty, GameMode, GameStats, RankedScore, TrigProblem } from '../types/trig';
import { TrigExpression, MathValueDisplay, FormattedMathText } from './MathDisplay';
import { RotateCcw, Award, AlertCircle, Compass, Home, Trophy, Sparkles, Crown, Medal } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  difficulty?: GameDifficulty;
  mode?: GameMode;
  topScores?: RankedScore[];
  achievedRank?: 1 | 2 | 3 | null;
  highScoreForDifficulty?: number;
  isNewRecord?: boolean;
  onRestart: () => void;
  onWeaknessDrill: (problems: TrigProblem[]) => void;
  onOpenUnitCircle: () => void;
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  difficulty = 'standard',
  mode = 'survival',
  topScores = [],
  achievedRank = null,
  highScoreForDifficulty = 0,
  isNewRecord = false,
  onRestart,
  onWeaknessDrill,
  onOpenUnitCircle,
  onBackToMenu,
}) => {
  // Compute Rank / Grade
  let rank = 'C';
  let rankColor = 'text-slate-400 border-slate-600';
  let comment = 'まずは第1象限の有名角 (π/6, π/4, π/3) からマスターしていきましょう！';

  if (stats.score >= 5000 && stats.accuracy >= 90) {
    rank = 'S+';
    rankColor = 'text-amber-300 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)]';
    comment = '神速！三角比マスターの称号にふさわしい超反射神経です！';
  } else if (stats.score >= 3500 && stats.accuracy >= 80) {
    rank = 'S';
    rankColor = 'text-amber-400 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.3)]';
    comment = '素晴らしい反射神経！三角比などの値が完全に体に染み付いています！';
  } else if (stats.score >= 2000 && stats.accuracy >= 70) {
    rank = 'A';
    rankColor = 'text-cyan-400 border-cyan-500';
    comment = 'よく出来ました！符号の間違いや第2象限以降の角を再確認すればSランクも目前！';
  } else if (stats.score >= 1000) {
    rank = 'B';
    rankColor = 'text-emerald-400 border-emerald-500';
    comment = '基本角は捉えられています！単位円でのx座標(cos)とy座標(sin)の感覚を掴んでスピードアップ！';
  }

  // De-duplicate missed problems
  const uniqueMissed = Array.from(
    new Map(stats.missedProblems.map(item => [item.problem.id.split('_').slice(0, 2).join('_'), item])).values()
  );

  const diffLabel = {
    beginner: '初級 (基本)',
    standard: '中級 (標準)',
    advanced: '上級 (実戦)',
    supreme: '最上級 (極限)',
  }[difficulty] || '中級 (標準)';

  const modeLabel = mode === 'timeattack' ? '30秒タイムアタック' : 'サバイバル防衛戦';

  // Prepare 3 ranking slots
  const rank1 = topScores.find(s => s.rank === 1);
  const rank2 = topScores.find(s => s.rank === 2);
  const rank3 = topScores.find(s => s.rank === 3);
  const slots: Array<{ rankNum: 1 | 2 | 3; entry?: RankedScore; medal: string; title: string }> = [
    { rankNum: 1, entry: rank1, medal: '🥇', title: '1位' },
    { rankNum: 2, entry: rank2, medal: '🥈', title: '2位' },
    { rankNum: 3, entry: rank3, medal: '🥉', title: '3位' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg landscape:max-w-3xl lg:landscape:max-w-4xl w-full p-3 sm:p-4 text-slate-100 shadow-2xl flex flex-col max-h-[95dvh] overflow-hidden">
        {/* Header */}
        <div className="text-center pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              SESSION RESULTS
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              {diffLabel}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {modeLabel}
            </span>

            {/* Prominent Rank Notification Badge */}
            {achievedRank === 1 && (
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold shadow-md flex items-center gap-1 animate-pulse">
                <Crown className="w-3.5 h-3.5 fill-current" />
                🥇 第1位 達成 (新記録)!
              </span>
            )}
            {achievedRank === 2 && (
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-200 text-slate-900 font-extrabold shadow-md flex items-center gap-1">
                <Medal className="w-3.5 h-3.5 fill-current" />
                🥈 第2位 ランクイン!
              </span>
            )}
            {achievedRank === 3 && (
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-amber-700 text-amber-100 font-extrabold shadow-md flex items-center gap-1">
                <Medal className="w-3.5 h-3.5 fill-current" />
                🥉 第3位 ランクイン!
              </span>
            )}
            {achievedRank === null && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                TOP 3 圏外
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            防衛終了 / 結果発表
          </h2>
          <div className="text-xs text-slate-400 font-mono flex items-center justify-center gap-2 mt-0.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{diffLabel} TOP 3 最高記録:</span>
            <span className="text-amber-300 font-bold tabular-nums">
              {(topScores[0]?.score || highScoreForDifficulty || stats.score).toLocaleString()}点
            </span>
          </div>
        </div>

        {/* Content Body: 2-column in landscape, stacked in portrait */}
        <div className="flex-1 min-h-0 overflow-y-auto py-2.5 flex flex-col landscape:flex-row gap-3 pr-0.5">
          {/* Left Column (or Top in portrait): Rank, Stats, TOP 3 Board & Feedback */}
          <div className="landscape:w-5/12 shrink-0 flex flex-col gap-2.5">
            {/* Rank & Score Section */}
            <div className="flex items-center justify-around p-2.5 sm:p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              {/* Rank Badge */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">RANK</span>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center font-extrabold text-2xl font-mono ${rankColor}`}>
                  {rank}
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-left">
                <div>
                  <span className="text-[9px] text-slate-400 block">スコア</span>
                  <span className="text-base sm:text-lg font-bold text-white tabular-nums">
                    {stats.score.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">正解率</span>
                  <span className="text-base sm:text-lg font-bold text-cyan-400 tabular-nums">
                    {stats.accuracy}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">最大コンボ</span>
                  <span className="text-base sm:text-lg font-bold text-amber-400 tabular-nums">
                    {stats.maxCombo}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">正解数</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-400 tabular-nums">
                    {stats.correctCount} 問
                  </span>
                </div>
              </div>
            </div>

            {/* TOP 3 Ranking Leaderboard Display */}
            <div className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800/80">
                <span className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>スコアランキング TOP 3 (順位)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  上位3件を記録
                </span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                {slots.map(({ rankNum, entry, medal, title }) => {
                  const isCurrentRunRank = achievedRank === rankNum;
                  return (
                    <div
                      key={`modal_rank_${rankNum}`}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-[11px] transition-all ${
                        isCurrentRunRank
                          ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-400/50'
                          : entry
                          ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                          : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm shrink-0">{medal}</span>
                        <span className={`font-bold shrink-0 ${
                          rankNum === 1 ? 'text-amber-400' : rankNum === 2 ? 'text-slate-300' : 'text-amber-500'
                        }`}>
                          {title}
                        </span>
                        {isCurrentRunRank && (
                          <span className="text-[9px] bg-indigo-500 text-white px-1 py-0.2 rounded font-sans font-bold">
                            今回
                          </span>
                        )}
                        {entry && (
                          <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                            ({entry.difficulty === 'beginner' ? '初級' : entry.difficulty === 'standard' ? '中級' : entry.difficulty === 'advanced' ? '上級' : '最上級'})
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        {entry ? (
                          <div className="flex items-baseline gap-1">
                            <span className={`font-bold tabular-nums text-xs sm:text-sm ${
                              rankNum === 1 ? 'text-amber-300' : rankNum === 2 ? 'text-slate-200' : 'text-amber-400'
                            }`}>
                              {entry.score.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400">点</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">未記録</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div className="p-2 bg-indigo-950/40 border border-indigo-800/50 rounded-lg text-xs text-indigo-200 leading-snug text-center">
              <FormattedMathText text={comment} fractionSize="xs" />
            </div>


            {/* Quick Actions (Compact on landscape left) */}
            <div className="hidden landscape:flex flex-col gap-1.5 pt-1">
              <button
                onClick={onRestart}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                もう一度挑戦
              </button>
              <button
                onClick={onOpenUnitCircle}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                単位円早見表で復習
              </button>
              <button
                onClick={onBackToMenu}
                className="flex items-center justify-center gap-1 py-1 px-2 text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                タイトル画面へ戻る
              </button>
            </div>
          </div>

          {/* Right Column: Missed Review List (Scrolls if many) */}
          <div className="flex-1 min-h-0 flex flex-col">
            {uniqueMissed.length > 0 ? (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between mb-1.5 shrink-0">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" /> 間違えた / 見逃した問題 ({uniqueMissed.length}問):
                  </span>
                  <button
                    onClick={() => onWeaknessDrill(uniqueMissed.map(m => m.problem))}
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
                  >
                    間違えた問題だけ特訓する
                  </button>
                </div>

                <div className="flex-1 min-h-0 max-h-48 landscape:max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {uniqueMissed.map(({ problem, userAnswer }) => (
                    <div
                      key={problem.id}
                      className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <TrigExpression
                            func={problem.func}
                            angleRad={problem.angleRad}
                            angleDegree={problem.angleDegree}
                            givenValueDisplay={problem.givenValueDisplay}
                            domainHint={problem.domainHint}
                            problemType={problem.problemType}
                            size="sm"
                          />
                          <span className="text-slate-400">=</span>
                          <span className="font-bold text-emerald-400 font-mono inline-flex items-center">
                            <MathValueDisplay label={problem.correctDisplay} size="sm" />
                          </span>
                        </div>

                        {userAnswer && (
                          <span className="text-[10px] text-rose-400 font-mono inline-flex items-center gap-1">
                            <span>回答:</span>
                            {userAnswer.startsWith('deg_') ? (
                              <span>{userAnswer.replace('deg_', '')}°</span>
                            ) : (
                              <MathValueDisplay label={userAnswer} size="xs" />
                            )}
                          </span>
                        )}
                      </div>
                      <FormattedMathText
                        text={problem.explanation}
                        className="text-[10px] text-slate-400 leading-tight block"
                        fractionSize="xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
                <Award className="w-10 h-10 text-amber-400 mb-2 animate-bounce" />
                <span className="font-bold text-white text-sm">パーフェクト防衛達成！</span>
                <span className="text-xs text-slate-400 mt-1">ミスなしで防衛を完遂しました！素晴らしい精度です。</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons (Portrait only, as landscape shows them in left col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 shrink-0 landscape:hidden">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            もう一度挑戦
          </button>

          <button
            onClick={onOpenUnitCircle}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            単位円早見表で復習
          </button>

          <button
            onClick={onBackToMenu}
            className="sm:col-span-2 flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            タイトル画面・難易度選択へ戻る
          </button>
        </div>
      </div>
    </div>
  );
};
