/**
 * src/models/AppTypes.ts
 *
 * This file defines the data structures used internally by the React application.
 */

// Defines the structure for a single search result displayed to the user.
export interface GameResult {
id: number;
  title: string;
  coverUrl?: string;
  year?: number;
  matchScore: number;
  platforms: string[];
  genres: string[];
  themes: string[];
  gameModes: string[];
  perspectives: string[];
  companies: string[];
  screenshots: string[];
  summary?: string;
  storyline?: string;
  rating?: number;
  category: number;
  status?: number;
  keywords: string[];
  ageRatings: { id: number; category: number }[];
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
  developerId: number | null;
  minRating: number | null;

  ageRatingOrg: number | null;
  ageRatingValue: number | null;
}