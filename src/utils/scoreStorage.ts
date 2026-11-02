import { GameDifficulty, GameMode, GameStats, ProblemCategory, RankedScore } from '../types/trig';

const STORAGE_KEY_GLOBAL = 'trig_top_scores_global_v2';
const STORAGE_KEY_PREFIX_DIFF = 'trig_top_scores_diff_v2_';

/**
 * Format timestamp into concise Japanese date string e.g. "10/31 18:20"
 */
export const formatScoreDate = (timestamp: number): string => {
  const d = new Date(timestamp);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
};

/**
 * Load up to 3 ranked scores for a difficulty.
 * @param filter GameDifficulty ('beginner' | 'standard' | 'advanced' | 'supreme')
 */
export const loadTopScores = (filter: GameDifficulty | 'all' = 'standard'): RankedScore[] => {
  if (typeof window === 'undefined') return [];

  const key = filter === 'all' ? STORAGE_KEY_GLOBAL : `${STORAGE_KEY_PREFIX_DIFF}${filter}`;
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as RankedScore[];
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 3).map((item, index) => ({
          ...item,
          rank: (index + 1) as 1 | 2 | 3,
        }));
      }
    } catch {
      // Ignore parse error and proceed to legacy fallback
    }
  }

  // Fallback to legacy difficulty high score if available
  if (filter !== 'all') {
    const legacySurv = Number(localStorage.getItem(`trig_hs_survival_${filter}`) || '0');
    if (legacySurv > 0) {
      const migrated: RankedScore[] = [
        {
          id: `migrated_legacy_${filter}_1`,
          rank: 1,
          score: legacySurv,
          difficulty: filter,
          mode: 'survival',
          accuracy: 100,
          maxCombo: 10,
          correctCount: Math.round(legacySurv / 100),
          date: '以前の記録',
          timestamp: Date.now() - 86400000,
        },
      ];
      localStorage.setItem(`${STORAGE_KEY_PREFIX_DIFF}${filter}`, JSON.stringify(migrated));
      return migrated;
    }
  }

  return [];
};

/**
 * Record a new score and return ranking information for the difficulty.
 * Only the top 3 scores are retained per difficulty.
 */
export const recordScoreResult = (
  stats: GameStats,
  difficulty: GameDifficulty,
  mode: GameMode,
  category?: ProblemCategory
): {
  achievedRank: 1 | 2 | 3 | null;
  isNewFirst: boolean;
  topScores: RankedScore[];
  achievedDiffRank: 1 | 2 | 3 | null;
  isNewDiffFirst: boolean;
  diffTopScores: RankedScore[];
} => {
  if (typeof window === 'undefined') {
    return {
      achievedRank: null,
      isNewFirst: false,
      topScores: [],
      achievedDiffRank: null,
      isNewDiffFirst: false,
      diffTopScores: [],
    };
  }

  const currentScore = stats.score;
  const now = Date.now();
  const dateStr = formatScoreDate(now);
  const newId = `score_${now}_${Math.random().toString(36).slice(2, 6)}`;

  const newEntryCandidate: Omit<RankedScore, 'rank'> = {
    id: newId,
    score: currentScore,
    difficulty,
    mode,
    category,
    accuracy: stats.accuracy,
    maxCombo: stats.maxCombo,
    correctCount: stats.correctCount,
    date: dateStr,
    timestamp: now,
  };

  // Helper to insert and rank up to 3 scores
  const insertAndRank = (existing: RankedScore[]): { updated: RankedScore[]; rank: 1 | 2 | 3 | null } => {
    const combined = [...existing, newEntryCandidate as RankedScore];
    // Sort descending by score, then accuracy, then maxCombo, then newer
    combined.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (b.maxCombo !== a.maxCombo) return b.maxCombo - a.maxCombo;
      return b.timestamp - a.timestamp;
    });

    // Truncate to top 3
    const top3 = combined.slice(0, 3).map((item, idx) => ({
      ...item,
      rank: (idx + 1) as 1 | 2 | 3,
    }));

    const found = top3.find(item => item.id === newId);
    return {
      updated: top3,
      rank: found ? found.rank : null,
    };
  };

  // Process Difficulty Top 3
  const currentDiff = loadTopScores(difficulty);
  const diffRes = insertAndRank(currentDiff);
  localStorage.setItem(`${STORAGE_KEY_PREFIX_DIFF}${difficulty}`, JSON.stringify(diffRes.updated));

  const isNewDiffFirst = diffRes.rank === 1;

  return {
    achievedRank: diffRes.rank,
    isNewFirst: isNewDiffFirst,
    topScores: diffRes.updated,
    achievedDiffRank: diffRes.rank,
    isNewDiffFirst,
    diffTopScores: diffRes.updated,
  };
};

/**
 * Clear top 3 scores for a difficulty
 */
export const clearTopScores = (filter: GameDifficulty | 'all' = 'standard'): void => {
  if (typeof window === 'undefined') return;
  if (filter === 'all') {
    localStorage.removeItem(STORAGE_KEY_GLOBAL);
  } else {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX_DIFF}${filter}`);
  }
};

