/**
 * src/utils/randomFilters.ts
 * Generates random filter values for the "randomizer" feature.
 * Empty values are most probable (60% chance for each filter).
 */

import { PLATFORMS, GENRES, THEMES, GAME_MODES, PERSPECTIVES, GAME_CATEGORIES, GAME_STATUSES } from '@/config/constants';
import type { FilterState } from '@/models/AppTypes';

// Helper: 60% chance to return null, 40% chance to run the generator
function maybeEmpty<T>(generator: () => T): T | null {
  return Math.random() < 0.6 ? null : generator();
}

// Helper: Pick random item from array
function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Pick random subset (0 to maxCount items)
function randomSubset<T extends { id: number }>(arr: readonly T[], maxCount: number): number[] {
  const count = Math.floor(Math.random() * (maxCount + 1));
  if (count === 0) return [];
  
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(item => item.id);
}

// Generate random year range or null
function randomYearRange(): [number, number] | null {
  if (Math.random() < 0.6) return null;
  
  const currentYear = new Date().getFullYear();
  const startYear = 1970 + Math.floor(Math.random() * (currentYear - 1970));
  const endYear = startYear + Math.floor(Math.random() * (currentYear - startYear + 1));
  
  return [startYear, endYear];
}

/**
 * Generate random filter values.
 * - Text inputs (search, developerName) are always empty
 * - Each dropdown/select has 60% chance to be empty
 * - Multi-selects pick 0-3 random items
 * - Year range has 60% chance to stay at default
 */
export function generateRandomFilters(): FilterState {
  const yearRange = randomYearRange();
  
  return {
    // Text inputs always empty
    search: '',
    developerName: '',
    
    // Single selects (60% empty)
    platformId: maybeEmpty(() => randomFrom(PLATFORMS).id),
    gameModeId: maybeEmpty(() => randomFrom(GAME_MODES).id),
    perspectiveId: maybeEmpty(() => randomFrom(PERSPECTIVES).id),
    categoryId: maybeEmpty(() => randomFrom(GAME_CATEGORIES).id),
    statusId: maybeEmpty(() => randomFrom(GAME_STATUSES).id),
    
    // Multi-selects (0-3 items, mostly empty)
    genreIds: Math.random() < 0.6 ? [] : randomSubset(GENRES, 3),
    themeIds: Math.random() < 0.6 ? [] : randomSubset(THEMES, 3),
    
    // Year range (null means use default 1970-current)
    yearRange: yearRange ?? [1970, new Date().getFullYear()],
    
    // Rating and age rating (mostly empty)
    minRating: maybeEmpty(() => Math.floor(Math.random() * 5) * 20), // 0, 20, 40, 60, 80
    ageRatingOrg: null, // Keep age rating empty for simplicity
    ageRatingValue: null,
  };
}
