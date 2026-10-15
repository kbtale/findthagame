/**
 * src/models/DescribeGame.ts
 *
 * Types for the "describe what you remember" AI feature, shared between the
 * React app and the /api/describe serverless function.
 */

// Filter fields the AI can infer from a free-text game description.
// Everything is optional: the model only returns what the text supports.
export interface DescribeFilters {
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
}

export interface DescribeGameResponse {
  filters: DescribeFilters;
  search: string;
}
