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

// Converts QueryParams into the raw text string for IGDB.
export const buildIgdbQuery = (params: QueryParams): string => {
  
  const fields = `fields ${[
    'name',
    'summary',
    'storyline',
    'first_release_date',
    'total_rating',
    'category',
    'status', 
    'cover.url',
    'screenshots.url',
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
  ].join(', ')};`;
  // Initialized an empty array to hold the filter strings (e.g., ["platforms = (8)", "cover != null"]).
  const whereClauses: string[] = []

  if (params.search) {
    const fullTerm = params.search.replace(/"/g, '\\"');
    const keywords = parseSearchTerms(params.search);
    
    // Full phrase: just name and alt_names (minimal)
    const fullPhraseFields = [
      'name',
      'alternative_names.name',
    ];
    
    // 1st keyword: thorough search (no storyline)
    const firstKeywordFields = [
      'name',
      'alternative_names.name',
      'summary',
      'keywords.name',
    ];
    
    // 2nd keyword: name, alt, and keywords
    const secondKeywordFields = [
      'name',
      'alternative_names.name',
      'keywords.name',
    ];
    
    // 3rd+ keywords: only keywords.name (exact match)
    const laterKeywordFields = [
      'keywords.name',
    ];
    
    const allClauses: string[] = [];
    
    // Add full phrase clauses
    fullPhraseFields.forEach(field => {
      allClauses.push(`${field} ~ *"${fullTerm}"*`);
    });
    
    // Add individual keyword clauses
    if (keywords.length > 0) {
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
          // All fields use wildcards (keywords.name has multi-word phrases)
          allClauses.push(`${field} ~ *"${escapedKeyword}"*`);
        });
      });
    }
    
    const uniqueClauses = [...new Set(allClauses)];
    whereClauses.push(`(${uniqueClauses.join(' | ')})`);
  }

  if (params.developerName) {
    whereClauses.push(`involved_companies.company.name ~ *"${params.developerName}"*`);
  }

  if (params.yearRange) {
    // Destructure the tuple: first number is startYear, second is endYear.
    const [startYear, endYear] = params.yearRange;
    
    // Convert the Start Year (e.g., 2000) to a Unix Timestamp
    const startTimestamp = Math.floor(new Date(`${startYear}-01-01`).getTime() / 1000);
    
    // Convert the End Year (e.g., 2005) to a Unix Timestamp
    const endTimestamp = Math.floor(new Date(`${endYear}-12-31`).getTime() / 1000);
    
    whereClauses.push(`first_release_date >= ${startTimestamp}`);
    whereClauses.push(`first_release_date <= ${endTimestamp}`);
  }

  const filterMap: FilterRule[] = [
    {
      key: 'platformId', 
      build: (v) => `platforms = (${v})` 
    },
    {
      key: 'genreIds', 
      build: (v) => `genres = (${(v as number[]).join('|')})` 
    },
    {
      key: 'themeIds', 
      build: (v) => `themes = (${(v as number[]).join('|')})` 
    },
    {
      key: 'gameModeId', 
      build: (v) => `game_modes = (${v})` 
    },
    {
      key: 'perspectiveId', 
      build: (v) => `player_perspectives = (${v})` 
    },
    { 
      key: 'categoryId',
      // When Main Game (0) is selected, include games with category = 0 OR category = null
      build: (v) => v === 0 ? `(category = 0 | category = null)` : `game_type = (${v})`
    },
    { 
      key: 'statusId',
      // When Released (0) is selected, include games with status = 0 OR status = null
      build: (v) => v === 0 ? `(status = 0 | status = null)` : `status = (${v})`
    },
    { 
      key: 'minRating',
      build: (v) => `total_rating >= ${v}`
    },
    {
      key: 'ageRatingOrg',
      build: (v) => `age_ratings.organization = (${v})` 
    },
    {
      key: 'ageRatingValue',
      build: (v) => `age_ratings.rating_category = (${v})`
    }
  ];

  filterMap.forEach((rule) => {
    // Specific value from the user's params using the key (e.g., params['platformId']).
    const value = params[rule.key];
    
    if (value !== undefined && value !== null) {
      if (Array.isArray(value) && value.length === 0) {
        return;
      }
      
      // If valid, run the 'build' function defined in the map above.
      whereClauses.push(rule.build(value as FilterValue));
    }
  });

  const whereString = whereClauses.length > 0 ? `where ${whereClauses.join(' & ')};` : '';
  
  const limitString = 'limit 150;';

  // Combine all parts into one final string separated by spaces.
  // Instead, we rely on WHERE wildcards (name ~ *"term"*) which provides better partial matching.
  return `${fields} ${whereString} ${limitString}`;
};
