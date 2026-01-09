/**
 * api/_utils/scoring.ts
 *
 * Additive Relevance Algorithm for ranking game search results.
 */

import type { IGDBGame, IGDBNamedItem } from '../../src/models/IGDBTypes.js';
import type { QueryParams } from './queryBuilder.js';

// Stop words to filter out (same as queryBuilder.ts)
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'so', 'yet',
  'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'up', 'down',
  'into', 'onto', 'upon', 'out', 'off', 'over', 'under', 'through', 'between',
  'about', 'after', 'before', 'during', 'without', 'within', 'along', 'across',
  'i', 'me', 'my', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its',
  'we', 'us', 'our', 'they', 'them', 'their', 'who', 'what', 'which', 'this', 'that',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'can', 'get', 'got', 'go', 'goes', 'went', 'come', 'came',
  'as', 'if', 'when', 'than', 'because', 'while', 'where', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
  'only', 'same', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then',
  'game', 'games', 'edition', 'version', 'vol', 'part'
]);

const MIN_WORD_LENGTH = 3;

const parseSearchTerms = (searchString: string): string[] => {
  return searchString
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(word));
};

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const Weights = {
  // Text matching weights: how much each type of text match contributes to the score.
  text: {
    exactName: 3.0,    
    partialName: 1.5,
    keywordMatch: 0.4, // Bonus per individual keyword match
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
 * Now supports multi-keyword matching for broader searches.
 */
const scoreText = (game: IGDBGame, term: string): number => {
  if (!term) return 0;

  const name = game.name?.toLowerCase() ?? '';
  const { text: w } = Weights;
  const termLower = term.toLowerCase();

  // Score full phrase match
  let score = 0;
  if (name === termLower) {
    score += w.exactName;
  } else if (name.includes(termLower)) {
    score += w.partialName;
  }

  // Check full phrase in other fields
  if (containsTerm(game.keywords, termLower)) score += w.keyword;
  if (containsTerm(game.alternative_names, termLower)) score += w.altName;
  if (includesTerm(game.summary, termLower) || includesTerm(game.storyline, termLower)) score += w.context;

  // Multikeyword scoring: parse into individual words and score each
  const keywords = parseSearchTerms(term);
  if (keywords.length > 1) {
    let keywordHits = 0;
    for (const keyword of keywords) {
      if (name.includes(keyword) ||
          containsTerm(game.keywords, keyword) ||
          containsTerm(game.alternative_names, keyword) ||
          includesTerm(game.summary, keyword) ||
          includesTerm(game.storyline, keyword)) {
        keywordHits++;
      }
    }
    // Add bonus proportional to how many keywords matched
    score += keywordHits * w.keywordMatch;
  }

  return score;
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

  return yearPenalty + ageBonus;
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