/**
 * src/models/SearchFilters.ts
 *
 * Types for the free-text search feature, shared between the React app and
 * the /api/filters serverless function.
 */

// Filter fields that can be inferred from a free-text game description.
// Everything is optional: only what the text supports is returned.
export interface SearchFilters {
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

export interface FiltersResponse {
  filters: SearchFilters;
  search: string;
}
