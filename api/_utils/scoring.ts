/**
 * api/_utils/scoring.ts
 *
 * This utility calculates a "Confidence Score" for each game result.
 * It helps rank the results based on how many user criteria (Year, Platform, Genre) were met.
 */

interface ScorableGame {
  name: string;
  first_release_date?: number;
  platforms?: { id: number }[];
  genres?: { id: number }[];
  themes?: { id: number }[];
  game_modes?: { id: number }[];
  player_perspectives?: { id: number }[];
}

interface ScoringFilters {
  search: string;
  platformId?: number | null;
  genreIds?: number[];
  themeIds?: number[];
  gameModeId?: number | null;
  perspectiveId?: number | null;
  yearRange?: [number, number];
}

/**
 * Main Scoring Function
 * Returns a number between 0 and 100.
 */
export function calculateMatchScore(game: ScorableGame, filters: ScoringFilters): number {
  let score = 0;
  let maxPossible = 0;

  score += 50;
  maxPossible += 50;

  if (filters.platformId) {
    maxPossible += 20;
    const hasPlatform = game.platforms?.some((p) => p.id === filters.platformId);
    if (hasPlatform) {
      score += 20;
    }
  }

  if (filters.genreIds && filters.genreIds.length > 0) {
    maxPossible += 20;
    const matchCount = filters.genreIds.filter((id) => 
      game.genres?.some((g) => g.id === id)
    ).length;

    if (matchCount >= 2) score += 20;
    else if (matchCount === 1) score += 10;
  }

  if (filters.yearRange) {
    maxPossible += 10;
    const [start, end] = filters.yearRange;
    
    if (game.first_release_date) {
      const releaseYear = new Date(game.first_release_date * 1000).getFullYear();
      if (releaseYear >= start && releaseYear <= end) {
        score += 10;
      }
    }
  }

  // Convert the raw points into a percentage (0-100).
  return Math.round((score / maxPossible) * 100);
}