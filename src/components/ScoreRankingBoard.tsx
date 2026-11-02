import React, { useState } from 'react';
import { GameDifficulty, RankedScore } from '../types/trig';
import { clearTopScores, loadTopScores } from '../utils/scoreStorage';
import { Trophy, Medal, Crown, Sparkles, Trash2, Calendar, Target, Flame, Zap } from 'lucide-react';

interface ScoreRankingBoardProps {
  initialScores?: RankedScore[];
  highlightScoreId?: string;
  compact?: boolean;
  onScoresReset?: () => void;
  currentDifficulty?: GameDifficulty;
  onDifficultyChange?: (diff: GameDifficulty) => void;
}

export const ScoreRankingBoard: React.FC<ScoreRankingBoardProps> = ({
  initialScores,
  highlightScoreId,
  compact = false,
  onScoresReset,
  currentDifficulty = 'standard',
  onDifficultyChange,
}) => {
  const [filter, setFilter] = useState<GameDifficulty>(currentDifficulty);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Sync with currentDifficulty prop if updated externally
  React.useEffect(() => {
    if (currentDifficulty) {
      setFilter(currentDifficulty);
    }
  }, [currentDifficulty]);

  const handleSelectFilter = (diff: GameDifficulty) => {
    setFilter(diff);
    if (onDifficultyChange) {
      onDifficultyChange(diff);
    }
  };

  // Scores based on selected difficulty filter
  const scores: RankedScore[] = loadTopScores(filter);

  const getRankConfig = (rank: 1 | 2 | 3) => {
    switch (rank) {
      case 1:
        return {
          label: '第1位',
          subLabel: 'CHAMPION',
          badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950',
          borderColor: 'border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.25)]',
          bgGradient: 'from-amber-950/40 via-slate-900/90 to-slate-950',
          textColor: 'text-amber-300',
          accentColor: 'text-amber-400',
          icon: <Crown className="w-5 h-5 text-amber-300 fill-amber-400 animate-bounce" />,
          medalEmoji: '🥇',
        };
      case 2:
        return {
          label: '第2位',
          subLabel: 'RUNNER-UP',
          badgeBg: 'bg-gradient-to-r from-slate-300 to-slate-100 text-slate-950',
          borderColor: 'border-slate-300/60 shadow-[0_0_15px_rgba(203,213,225,0.2)]',
          bgGradient: 'from-slate-800/40 via-slate-900/90 to-slate-950',
          textColor: 'text-slate-200',
          accentColor: 'text-slate-300',
          icon: <Medal className="w-5 h-5 text-slate-300 fill-slate-400" />,
          medalEmoji: '🥈',
        };
      case 3:
        return {
          label: '第3位',
          subLabel: '3RD PLACE',
          badgeBg: 'bg-gradient-to-r from-amber-700 to-amber-600 text-amber-50',
          borderColor: 'border-amber-700/60 shadow-[0_0_12px_rgba(180,83,9,0.2)]',
          bgGradient: 'from-amber-950/25 via-slate-900/90 to-slate-950',
          textColor: 'text-amber-400',
          accentColor: 'text-amber-500',
          icon: <Medal className="w-5 h-5 text-amber-600 fill-amber-700" />,
          medalEmoji: '🥉',
        };
    }
  };

  const getDifficultyBadge = (diff: GameDifficulty) => {
    switch (diff) {
      case 'beginner':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800">初級</span>;
      case 'standard':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800">中級</span>;
      case 'advanced':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 text-amber-400 border border-amber-800">上級</span>;
      case 'supreme':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/80 text-rose-300 border border-rose-700 font-bold">最上級</span>;
    }
  };

  const getDifficultyName = (diff: GameDifficulty) => {
    switch (diff) {
      case 'beginner': return '初級';
      case 'standard': return '中級';
      case 'advanced': return '上級';
      case 'supreme': return '最上級';
    }
  };

  const getModeLabel = (mode: string) => {
    return mode === 'timeattack' ? '30sアタック' : 'サバイバル';
  };

  const handleReset = () => {
    clearTopScores(filter);
    setShowConfirmReset(false);
    if (onScoresReset) onScoresReset();
  };

  // Find entries for ranks 1, 2, 3
  const rank1 = scores.find(s => s.rank === 1);
  const rank2 = scores.find(s => s.rank === 2);
  const rank3 = scores.find(s => s.rank === 3);

  const slots: Array<{ rank: 1 | 2 | 3; entry?: RankedScore }> = [
    { rank: 1, entry: rank1 },
    { rank: 2, entry: rank2 },
    { rank: 3, entry: rank3 },
  ];

  return (
    <div className={`w-full bg-slate-900/95 border border-slate-800/90 rounded-2xl ${compact ? 'p-3' : 'p-4 sm:p-5'} shadow-2xl relative`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight flex items-center gap-2">
              <span>スコアランキング TOP 3</span>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                難易度別 順位記録（各3枠）
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            各難易度（初級・中級・上級・最上級）の上位3つのハイスコアを1位・2位・3位の順位で記録しています
          </p>
        </div>

        {/* Filter buttons & Reset */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
            {[
              { id: 'beginner' as const, label: '初級' },
              { id: 'standard' as const, label: '中級' },
              { id: 'advanced' as const, label: '上級' },
              { id: 'supreme' as const, label: '最上級' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleSelectFilter(tab.id)}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  filter === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            title="選択中の難易度のランキングをリセット"
            className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900 rounded-lg transition-colors text-xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono hidden md:inline">リセット</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Reset */}
      {showConfirmReset && (
        <div className="my-2.5 p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
          <span className="text-rose-200 font-mono">
            {getDifficultyName(filter)}のTOP 3スコア記録をすべて消去しますか？
          </span>
          <div className="flex items-center gap-2 shrink-0 font-mono">
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              キャンセル
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-500"
            >
              消去する
            </button>
          </div>
        </div>
      )}

      {/* 3 Rank Cards Grid (Podium layout: 1st, 2nd, 3rd) */}
      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-3' : 'md:grid-cols-3'} gap-3 mt-3.5`}>
        {slots.map(({ rank, entry }) => {
          const config = getRankConfig(rank);
          const isHighlighted = entry && highlightScoreId === entry.id;

          if (!entry) {
            // Empty Slot
            return (
              <div
                key={`empty_rank_${rank}`}
                className="relative rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-3.5 sm:p-4 flex flex-col items-center justify-center text-center min-h-[135px]"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xl opacity-50">{config.medalEmoji}</span>
                  <span className="font-mono font-bold text-slate-400 text-xs sm:text-sm">{config.label}</span>
                </div>
                <div className="text-slate-400 font-mono text-sm font-semibold">未記録</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  プレイして{config.label}の枠を勝ち取ろう！
                </p>
              </div>
            );
          }

          // Filled Slot
          return (
            <div
              key={entry.id}
              className={`relative rounded-xl border ${config.borderColor} bg-gradient-to-b ${config.bgGradient} p-3.5 sm:p-4 transition-all duration-300 flex flex-col justify-between ${
                isHighlighted
                  ? 'ring-2 ring-indigo-400 scale-[1.02] shadow-2xl'
                  : 'hover:border-slate-600'
              }`}
            >
              {/* Highlight Tag */}
              {isHighlighted && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-indigo-500 text-white font-mono font-extrabold text-[10px] rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  今回の記録！
                </div>
              )}

              {/* Card Header: Rank Badge & Date */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">{config.medalEmoji}</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-extrabold ${config.badgeBg}`}>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{entry.date}</span>
                  </div>
                </div>

                {/* Score Number in Big Font */}
                <div className="my-1.5">
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">SCORE</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${config.textColor} tabular-nums`}>
                      {entry.score.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-slate-400">点</span>
                  </div>
                </div>
              </div>

              {/* Stats Footer: Difficulty, Mode, Accuracy, Combo */}
              <div className="pt-2 border-t border-slate-800/80 mt-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {getDifficultyBadge(entry.difficulty)}
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {getModeLabel(entry.mode)}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    正解率 {entry.accuracy}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Maxコンボ:</span>
                    <strong className="text-slate-200">{entry.maxCombo}</strong>
                  </span>
                  <span>
                    正解: <strong className="text-emerald-400">{entry.correctCount}問</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
