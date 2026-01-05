/**
 * api/_utils/scoring.ts
 *
 * Additive Relevance Algorithm for ranking game search results.
 */

import type { IGDBGame, IGDBNamedItem } from '@/models/IGDBTypes';
import type { QueryParams } from './queryBuilder';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const Weights = {
  // Text matching weights: how much each type of text match contributes to the score.
  text: {
    exactName: 3.0,    
    partialName: 1.5,
    keyword: 0.8,      
    altName: 0.5,
    context: 0.3,
  },
  // Multiplicative factors: these scale the entire base score up or down.
  multipliers: {
    platform: {
      match: 1.0,      
      mismatch: 0.3,   
    },
    unwantedDLC: 0.5,  
    cancelledBoost: 1.5,
    company: {
      developer: 2.2,
      publisher: 1.8,
      porting: 1.3,
      supporting: 1.2,
      none: 1.0,
    },
  },
  // Additives: flat values added/subtracted at the end.
  bonuses: {
    yearPenaltyPerYear: -0.1,
    ageRatingMatch: 0.2,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculates a relevance score for a game based on user query parameters.
 * @param game - The IGDB game object to score.
 * @param query - The user's search parameters.
 * @returns A non-negative score (higher = better match).
 */
export const calculateMatchScore = (game: IGDBGame, query: QueryParams): number => {
  const searchTerm = query.search?.toLowerCase().trim() ?? '';

  const textScore = scoreText(game, searchTerm);
  const metaScore = scoreMeta(game, query);
  const multiplier = calculateMultiplier(game, query);
  const bonuses = calculateBonuses(game, query);

  return Math.max(0, (textScore + metaScore) * multiplier + bonuses);
};

// ═══════════════════════════════════════════════════════════════════
// SCORING STAGES
// ═══════════════════════════════════════════════════════════════════

/**
 * Stage 1: Text Relevance Score
 */
const scoreText = (game: IGDBGame, term: string): number => {
  if (!term) return 0;

  const name = game.name?.toLowerCase() ?? '';
  const { text: w } = Weights;

  const nameScore =
    name === term ? w.exactName :        
    name.includes(term) ? w.partialName :
    0;

  const keywordScore = containsTerm(game.keywords, term) ? w.keyword : 0;
  const altNameScore = containsTerm(game.alternative_names, term) ? w.altName : 0;
  const contextScore = includesTerm(game.summary, term) || includesTerm(game.storyline, term) ? w.context : 0;

  return nameScore + keywordScore + altNameScore + contextScore;
};

/**
 * Stage 2: Metadata Overlap Score
 */
const scoreMeta = (game: IGDBGame, query: QueryParams): number =>
  overlap(game.genres, query.genreIds) +
  overlap(game.themes, query.themeIds) +
  (matches(game.game_modes, query.gameModeId) ? 1 : 0) +
  (matches(game.player_perspectives, query.perspectiveId) ? 1 : 0);

/**
 * Stage 3: Multiplicative Constraints
 */
const calculateMultiplier = (game: IGDBGame, query: QueryParams): number => {
  const { multipliers: m } = Weights;

  const platform = !query.platformId ? 1 :
    game.platforms?.some(p => p.id === query.platformId) ? m.platform.match : m.platform.mismatch;

  const category = (game.category === 1 && query.categoryId !== 1) ? m.unwantedDLC : 1;

  const status = (query.statusId === 6 && game.status === 6) ? m.cancelledBoost : 1;

  const company = !query.developerName ? 1 : getCompanyMultiplier(game.involved_companies, query.developerName);

  return platform * category * status * company;
};

/**
 * Stage 4: Additive Bonuses
 */
const calculateBonuses = (game: IGDBGame, query: QueryParams): number => {
  const { bonuses: b } = Weights;

  const yearPenalty = calculateYearPenalty(game.first_release_date, query.yearRange);
  const ageBonus = matchesAgeRating(game.age_ratings, query) ? b.ageRatingMatch : 0;
  const tieBreaker = (game.total_rating ?? 0) / 1000;

  return yearPenalty + ageBonus + tieBreaker;
};

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Checks if any item in an array of named items contains the search term.
 */
const containsTerm = (items: IGDBNamedItem[] | undefined, term: string): boolean =>
  items?.some(i => i.name.toLowerCase().includes(term)) ?? false;

/**
 * Checks if a string contains the search term.
 */
const includesTerm = (text: string | undefined, term: string): boolean =>
  text?.toLowerCase().includes(term) ?? false;

/**
 * Checks if any item in an array has a specific ID.
 */
const matches = (items: IGDBNamedItem[] | undefined, id: number | null | undefined): boolean =>
  !!id && (items?.some(i => i.id === id) ?? false);

/**
 * Calculates the overlap ratio between game items and requested IDs.
 */
const overlap = (items: IGDBNamedItem[] | undefined, ids: number[] | undefined): number => {
  if (!ids?.length || !items?.length) return 0;
  const gameIds = new Set(items.map(i => i.id));
  return ids.filter(id => gameIds.has(id)).length / ids.length;
};

/**
 * Determines the company role multiplier based on the highest-priority match.
 */
const getCompanyMultiplier = (
  companies: IGDBGame['involved_companies'],
  targetName: string
): number => {
  const { company: c } = Weights.multipliers;
  const lowerTarget = targetName.toLowerCase();
  const match = companies?.find(co => co.company.name?.toLowerCase().includes(lowerTarget));
  if (!match) return c.none;
  if (match.developer) return c.developer;
  if (match.publisher) return c.publisher;
  if (match.porting) return c.porting;
  return c.supporting;
};

/**
 * Calculates the year penalty based on how far the game's release is from the requested range.
 */
const calculateYearPenalty = (
  releaseDate: number | undefined,
  range: [number, number] | undefined
): number => {
  if (!range || !releaseDate) return 0;
  const [min, max] = range;
  const year = new Date(releaseDate * 1000).getFullYear();
  const diff = year < min ? min - year : year > max ? year - max : 0;
  return diff * Weights.bonuses.yearPenaltyPerYear;
};

/**
 * Checks if any of the game's age ratings match the user's filter.
 */
const matchesAgeRating = (
  ratings: IGDBGame['age_ratings'],
  query: QueryParams
): boolean => {
  if (!query.ageRatingOrg && !query.ageRatingValue) return false;
  return ratings?.some(r =>
    (!query.ageRatingOrg || r.organization === query.ageRatingOrg) &&
    (!query.ageRatingValue || r.rating_category === query.ageRatingValue)
  ) ?? false;
};