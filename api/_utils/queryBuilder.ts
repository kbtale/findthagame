export interface QueryParams {
  search?: string;
  platformId?: number;
  genreIds?: number[];
  themeIds?: number[];
  gameModeId?: number;
  perspectiveId?: number;
  ageRatingId?: number;
  yearRange?: [number, number];
}

// Create a custom type alias for the values the filters accept (either a single ID or a list of IDs).
type FilterValue = number | number[]

interface FilterRule {
  key: keyof QueryParams
  build: (val: number | number[]) => string
}

// Converts QueryParams into the raw text string for IGDB.
export const buildIgdbQuery = (params: QueryParams): string => {
  
  // Define the SELECT statement.
  // The semicolon ';' is required at the end of every Apicalypse statement.
  const fields =
    'fields name, cover.url, summary, first_release_date, platforms.name, genres.name, themes.name, game_modes.name, player_perspectives.name, age_ratings.rating, screenshots.url, involved_companies.company.name;';

  // Initialized an empty array to hold the filter strings (e.g., ["platforms = (8)", "cover != null"]).
  const whereClauses: string[] = []

  // Configuration Map: A list of rules that connects a parameter to an Apicalypse string.
  const filterMap: FilterRule[] = [
    {
      key: 'platformId', 
      build: (v) => `platforms = (${v})` 
    },
    {
      key: 'genreIds', 
      build: (v) => `genres = (${(v as number[]).join(',')})` 
    },
    {
      key: 'themeIds', 
      build: (v) => `themes = (${(v as number[]).join(',')})` 
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
      key: 'ageRatingId',
      build: (v) => `age_ratings.rating = (${v})` 
    },
  ];

  filterMap.forEach((rule) => {
    // specific value from the user's params using the key (e.g., params['platformId']).
    const value = params[rule.key];
    
    if (value !== undefined && value !== null) {
      if (Array.isArray(value) && value.length === 0) {
        return;
      }
      
      // If valid, run the 'build' function defined in the map above.
      whereClauses.push(rule.build(value as FilterValue));
    }
  });

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

  // Construct the final 'WHERE' string.
  const whereString = whereClauses.length > 0 ? `where ${whereClauses.join(' & ')};` : '';
  
  // Construct the 'SEARCH' string.
  const searchString = params.search ? `search "${params.search.replace(/"/g, '\\"')}";` : '';
  
  // Construct the 'LIMIT' string.
  const limitString = 'limit 50;';

  // Combine all parts into one final string separated by spaces.
  // Example: "fields ...; search "Mario"; where platforms = (8); limit 50;"
  return `${fields} ${searchString} ${whereString} ${limitString}`;
};