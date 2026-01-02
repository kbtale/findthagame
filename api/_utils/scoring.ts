/**
 * api/_utils/scoring.ts
 *
 * This utility calculates a "Confidence Score" for each game result.
 * It ranks results based on how many Memory Anchors (Platform, Perspective, etc.) match.
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

  // 1. BASELINE (The Search Term)
  // We give initial points just for being returned by IGDB's text search.
  score += 30;
  maxPossible += 30;

  // 2. PLATFORM (Hard Constraint)
  if (filters.platformId) {
    maxPossible += 20;
    const hasPlatform = game.platforms?.some((p) => p.id === filters.platformId);
    if (hasPlatform) score += 20;
  }

  // 3. PERSPECTIVE (Visual Constraint)
  // e.g., First Person vs Third Person
  if (filters.perspectiveId) {
    maxPossible += 15;
    const hasPerspective = game.player_perspectives?.some((p) => p.id === filters.perspectiveId);
    if (hasPerspective) score += 15;
  }

  // 4. GAME MODE (Social Constraint)
  // e.g., Single Player vs Split Screen
  if (filters.gameModeId) {
    maxPossible += 15;
    const hasMode = game.game_modes?.some((m) => m.id === filters.gameModeId);
    if (hasMode) score += 15;
  }

  // 5. YEAR RANGE (Temporal Constraint)
  if (filters.yearRange) {
    maxPossible += 10;
    const [start, end] = filters.yearRange;
    
    if (game.first_release_date) {
      const releaseYear = new Date(game.first_release_date * 1000).getFullYear();
      if (releaseYear >= start && releaseYear <= end) {
        score += 10;
      } else {
        // Bonus: If it's just 1 year outside the range, give partial credit?
        // For now, strict match.
      }
    }
  }

  // 6. GENRES (Vibe Constraint)
  if (filters.genreIds && filters.genreIds.length > 0) {
    maxPossible += 5;
    const matchCount = filters.genreIds.filter((id) => 
      game.genres?.some((g) => g.id === id)
    ).length;
    
    // Proportional score based on how many genres matched
    if (matchCount > 0) score += 5;
  }

  // 7. THEMES (Vibe Constraint - e.g. "Survival", "Sandbox")
  if (filters.themeIds && filters.themeIds.length > 0) {
    maxPossible += 5;
    const matchCount = filters.themeIds.filter((id) => 
      game.themes?.some((t) => t.id === id)
    ).length;

    if (matchCount > 0) score += 5;
  }

  // Prevent division by zero (though maxPossible starts at 30)
  if (maxPossible === 0) return 0;

  // Convert raw points into a percentage (0-100).
  return Math.round((score / maxPossible) * 100);
}