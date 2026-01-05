/**
 * src/models/AppTypes.ts
 *
 * This file defines the data structures used internally by the React application.
 */

// Defines the structure for a single search result displayed to the user.
export interface GameResult {
  id: number;
  title: string;
  ageRatings: { id: number; category: number; rating: number }[];
  alternativeNames: string[];
  category: number;
  companies: string[];
  coverUrl?: string;
  firstReleaseDate?: string;
  gameModes: string[];
  genres: string[];
  keywords: string[];
  matchScore: number;
  perspectives: string[];
  platforms: string[];
  rating?: number;
  screenshots: string[];
  status?: number;
  storyline?: string;
  summary?: string;
  themes: string[];
  year?: number;
}

// Defines the structure for the Redux state that holds the user's active filters.
export interface FilterState {
  search: string;

  platformId: number | null;
  yearRange: [number, number];

  genreIds: number[];
  themeIds: number[];
  gameModeId: number | null;
  perspectiveId: number | null;

  categoryId: number | null;
  statusId: number | null;
  developerName: string;
  minRating: number | null;

  ageRatingOrg: number | null;
  ageRatingValue: number | null;
}