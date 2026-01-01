/**
 * src/models/IGDBTypes.ts
 *
 * This file defines the exact shape of the data returned by the IGDB API.
 * It strictly follows the snake_case used by IGDB.
 */

// Define the interface for Image objects (used for covers and screenshots).
export interface IGDBImage {
  id: number;
  // Note: IGDB often returns URLs without the 'https:' protocol prefix.
  url: string;
}

// Define the interface for Company objects (Developers and Publishers).
export interface IGDBCompany {
  // The ID of the relationship record between the game and the company.
  id: number;
  company: {
    id: number;
    name: string;
  };
}

// Defines the main interface representing a Game in the IGDB database.
export interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  // Optional because unreleased or obscure games might not have a date.
  first_release_date?: number;
  cover?: IGDBImage;
  screenshots?: IGDBImage[];
  platforms?: {
    id: number;
    name: string;
  }[];
  genres?: {
    id: number;
    name: string;
  }[];
  themes?: {
    id: number;
    name: string;
  }[];
  game_modes?: {
    id: number;
    name: string;
  }[];
  player_perspectives?: {
    id: number;
    name: string;
  }[];
  involved_companies?: IGDBCompany[];
  age_ratings?: {
    id: number;
    rating: number; 
  }[];
}