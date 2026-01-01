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
  platforms: string[];
  matchScore: number;
}

// Defines the structure for the Redux state that holds the user's active filters.
export interface FilterState {
  search: string;
  platformId: number | null;
  genreIds: number[];
  themeIds: number[];
  gameModeId: number | null;
  perspectiveId: number | null;
  yearRange: [number, number];
}