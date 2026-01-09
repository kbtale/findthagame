// Stop words to filter out from multi-keyword searches
const STOP_WORDS = new Set([
  // Articles
  'a', 'an', 'the',
  // Conjunctions
  'and', 'or', 'but', 'nor', 'so', 'yet',
  // Prepositions
  'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'up', 'down',
  'into', 'onto', 'upon', 'out', 'off', 'over', 'under', 'through', 'between',
  'about', 'after', 'before', 'during', 'without', 'within', 'along', 'across',
  // Pronouns
  'i', 'me', 'my', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its',
  'we', 'us', 'our', 'they', 'them', 'their', 'who', 'what', 'which', 'this', 'that',
  // Verbs (common/auxiliary)
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'can', 'get', 'got', 'go', 'goes', 'went', 'come', 'came',
  // Other common words
  'as', 'if', 'when', 'than', 'because', 'while', 'where', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
  'only', 'same', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then',
  // Gaming-specific common words
  'game', 'games', 'edition', 'version', 'vol', 'part'
]);

// Minimum word length to include in search
const MIN_WORD_LENGTH = 3;

// Parse search string into meaningful keywords
const parseSearchTerms = (searchString: string): string[] => {
  return searchString
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(word));
};

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
    
    const searchFields = [
      'name',
      'alternative_names.name',
      'summary',
      'storyline',
      'keywords.name',
    ];
    
    // Start with full phrase match for each field
    const allClauses: string[] = [];
    
    // Add full phrase clauses
    searchFields.forEach(field => {
      allClauses.push(`${field} ~ *"${fullTerm}"*`);
    });
    
    // Add individual keyword clauses (if different from full term)
    if (keywords.length > 1 || (keywords.length === 1 && keywords[0].toLowerCase() !== fullTerm.toLowerCase())) {
      keywords.forEach(keyword => {
        const escapedKeyword = keyword.replace(/"/g, '\\"');
        searchFields.forEach(field => {
          allClauses.push(`${field} ~ *"${escapedKeyword}"*`);
        });
      });
    }
    
    // Remove duplicates and join with OR
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
  
  const limitString = 'limit 500;';

  // Combine all parts into one final string separated by spaces.
  // Note: We don't use IGDB's "search" command because it doesn't work well with short/partial terms.
  // Instead, we rely on WHERE wildcards (name ~ *"term"*) which provides better partial matching.
  return `${fields} ${whereString} ${limitString}`;
};
