/**
 * src/models/IGDBTypes.ts
 *
 * This file defines the exact shape of the data returned by the IGDB API.
 * It strictly follows the snake_case used by IGDB.
 */

// Define the interface for Image objects (used for covers and screenshots).
export interface IGDBNamedItem {
  id: number;
  name: string;
}

export interface IGDBImage {
  id: number;
  // Note: IGDB often returns URLs without the 'https:' protocol prefix.
  url: string;
}

// Define the interface for Company objects (Developers and Publishers).
export interface IGDBCompany {
  id: number;
  developer: boolean;
  publisher: boolean;
  porting: boolean;
  company: IGDBNamedItem;
}

// Defines the main interface representing a Game in the IGDB database.
export interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  storyline?: string;
  first_release_date?: number;
  category: number;
  status?: number;
  total_rating?: number;
  cover?: IGDBImage;
  screenshots?: IGDBImage[];
  platforms?: IGDBNamedItem[];
  genres?: IGDBNamedItem[];
  themes?: IGDBNamedItem[];
  game_modes?: IGDBNamedItem[];
  player_perspectives?: IGDBNamedItem[];
  keywords?: IGDBNamedItem[];
  involved_companies?: IGDBCompany[];
  age_ratings?: {
    id: number;
    organization: number;
    rating_category: number;
  }[];
  alternative_names?: IGDBNamedItem[];
}