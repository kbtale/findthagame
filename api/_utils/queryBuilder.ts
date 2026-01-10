import { parseSearchTerms } from './searchUtils.js';

export interface QueryParams {
  search?: string;

  platformId?: number;
  yearRange?: [number, number];

  genreIds?: number[];
  themeIds?: number[];
  gameModeId?: number;
  perspectiveId?: number;
  
  categoryId?: number;
  statusId?: number;
  developerName?: string;
  minRating?: number;

  ageRatingOrg?: number;
  ageRatingValue?: number;
}

// Create a custom type alias for the values the filters accept (either a single ID or a list of IDs).
type FilterValue = number | number[]

interface FilterRule {
  key: keyof QueryParams
  build: (val: number | number[]) => string
}

// Field list for IGDB queries
const FIELDS_LIST = [
  'name',
  'summary',
  'storyline',
  'first_release_date',
  'total_rating',
  'category',
  'status', 
  'cover.url',
  // screenshots.url fetched separately for top results
  'platforms.name',
  'genres.name',
  'themes.name',
  'game_modes.name',
  'player_perspectives.name',
  'keywords.name',
  'alternative_names.name',
  'involved_companies.company.name',
  'involved_companies.developer',
  'involved_companies.publisher',
  'involved_companies.porting',
  'involved_companies.supporting',
  'age_ratings.organization',
  'age_ratings.rating_category'
].join(', ');

/**
 * Builds filter (non-text) where clauses from query params.
 * These are used by both Strict and Broad queries.
 */
const buildFilterClauses = (params: QueryParams): string[] => {
  const whereClauses: string[] = [];

  if (params.developerName) {
    whereClauses.push(`involved_companies.company.name ~ *"${params.developerName}"*`);
  }

  if (params.yearRange) {
    const [startYear, endYear] = params.yearRange;
    const startTimestamp = Math.floor(new Date(`${startYear}-01-01`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${endYear}-12-31`).getTime() / 1000);
    whereClauses.push(`first_release_date >= ${startTimestamp}`);
    whereClauses.push(`first_release_date <= ${endTimestamp}`);
  }

  const filterMap: FilterRule[] = [
    { key: 'platformId', build: (v) => `platforms = (${v})` },
    { key: 'genreIds', build: (v) => `genres = (${(v as number[]).join(',')})` },
    { key: 'themeIds', build: (v) => `themes = (${(v as number[]).join(',')})` },
    { key: 'gameModeId', build: (v) => `game_modes = (${v})` },
    { key: 'perspectiveId', build: (v) => `player_perspectives = (${v})` },
    { key: 'categoryId', build: (v) => v === 0 ? `(category = 0 | category = null)` : `game_type = (${v})` },
    { key: 'statusId', build: (v) => v === 0 ? `(status = 0 | status = null)` : `status = (${v})` },
    { key: 'minRating', build: (v) => `total_rating >= ${v}` },
    { key: 'ageRatingOrg', build: (v) => `age_ratings.organization = (${v})` },
    { key: 'ageRatingValue', build: (v) => `age_ratings.rating_category = (${v})` }
  ];

  filterMap.forEach((rule) => {
    const value = params[rule.key];
    if (value !== undefined && value !== null) {
      if (Array.isArray(value) && value.length === 0) {
        return;
      }
      whereClauses.push(rule.build(value as FilterValue));
    }
  });

  return whereClauses;
};

/**
 * Builds text search clauses for the Broad query.
 * Searches individual keywords (NOT the full phrase).
 */
const buildBroadTextClauses = (searchTerm: string): string[] => {
  const keywords = parseSearchTerms(searchTerm);
  if (keywords.length === 0) return [];

  // 1st keyword: thorough search (no storyline)
  const firstKeywordFields = ['name', 'alternative_names.name', 'summary', 'keywords.name'];
  // 2nd keyword: name, alt, and keywords
  const secondKeywordFields = ['name', 'alternative_names.name', 'keywords.name'];
  // 3rd+ keywords: only keywords.name
  const laterKeywordFields = ['keywords.name'];

  const allClauses: string[] = [];

  // NOTE: We deliberately skip the full phrase clause here.
  // The full phrase is handled by the Strict query using IGDB's `search` param.

  // Add individual keyword clauses
  keywords.forEach((keyword, index) => {
    const escapedKeyword = keyword.replace(/"/g, '\\"');
    let fields: string[];
    if (index === 0) {
      fields = firstKeywordFields;
    } else if (index === 1) {
      fields = secondKeywordFields;
    } else {
      fields = laterKeywordFields;
    }
    
    fields.forEach(field => {
      allClauses.push(`${field} ~ *"${escapedKeyword}"*`);
    });
  });

  return [...new Set(allClauses)];
};

/**
 * Converts QueryParams into the raw text string for IGDB.
 * Returns a multi-query string if search term exists, otherwise a single query.
 */
export const buildIgdbQuery = (params: QueryParams): string => {
  const filterClauses = buildFilterClauses(params);

  // If NO search term, return a single query with limit 200
  if (!params.search) {
    const whereString = filterClauses.length > 0 ? `where ${filterClauses.join(' & ')};` : '';
    return `fields ${FIELDS_LIST}; ${whereString} limit 200;`;
  }

  // If search term EXISTS, return a multi-query
  const escapedSearch = params.search.replace(/"/g, '\\"');

  // Query 1: Strict (searches the FULL PHRASE in name and alt_names)
  // Note: We use 'where' with name match instead of 'search' because 'search' is not supported in multiquery
  const strictTextClause = `(name ~ *"${escapedSearch}"* | alternative_names.name ~ *"${escapedSearch}"*)`;
  const strictClauses = [...filterClauses, strictTextClause];
  const strictWhere = `\twhere ${strictClauses.join(' & ')};`;
  const query1Parts = [
    `query games "Strict" {`,
    `\tfields ${FIELDS_LIST};`,
    strictWhere,
    `\tlimit 100;`,
    `};`
  ].filter(line => line.trim()).join('\n');

  // Query 2: Broad (uses keyword-based matching, NO full phrase)
  const broadTextClauses = buildBroadTextClauses(params.search);
  const allBroadClauses = [...filterClauses];
  if (broadTextClauses.length > 0) {
    allBroadClauses.push(`(${broadTextClauses.join(' | ')})`);
  }
  const broadWhere = allBroadClauses.length > 0 ? `\twhere ${allBroadClauses.join(' & ')};` : '';
  const query2Parts = [
    `query games "Broad" {`,
    `\tfields ${FIELDS_LIST};`,
    broadWhere,
    `\tlimit 300;`,
    `};`
  ].filter(line => line.trim()).join('\n');

  return `${query1Parts}\n\n${query2Parts}`;
};
