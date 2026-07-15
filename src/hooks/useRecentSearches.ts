/**
 * src/hooks/useRecentSearches.ts
 * 
 * Custom hook to manage recent search history in localStorage.
 */

import { createContext, useState, useCallback } from 'react';
import type { FilterState } from '@/models/AppTypes';

const STORAGE_KEY = 'findthagame_recent_searches';
const MAX_SEARCHES = 10;

export interface RecentSearch {
  id: string;
  filters: FilterState;
  timestamp: number;
  resultCount: number;
  isBookmarked?: boolean;
}

/**
 * Comparison for FilterState to detect duplicates
 */
const areFiltersEqual = (a: FilterState, b: FilterState): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

/**
 * Load searches from localStorage
 */
const loadSearches = (): RecentSearch[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Save searches to localStorage
 */
const saveSearches = (searches: RecentSearch[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
};

export const RecentSearchesContext = createContext<{
  addSearch: (filters: FilterState, resultCount: number) => void;
} | null>(null);

export const useRecentSearches = () => {
  // Lazy initial state to load from localStorage
  const [searches, setSearches] = useState<RecentSearch[]>(() => loadSearches());

  const addSearch = useCallback((filters: FilterState, resultCount: number) => {
    setSearches((prev) => {
      // Remove any existing search with identical filters
      const deduplicated = prev.filter((s) => !areFiltersEqual(s.filters, filters));
      
      // Create new search entry
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        filters,
        timestamp: Date.now(),
        resultCount,
      };

      const updated = [newSearch, ...deduplicated].slice(0, MAX_SEARCHES);
      saveSearches(updated);
      return updated;
    });
  }, []);

  const removeSearch = useCallback((id: string) => {
    setSearches((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSearches(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    // Only clear non-bookmarked searches
    setSearches((prev) => {
      const bookmarked = prev.filter((s) => s.isBookmarked);
      saveSearches(bookmarked);
      return bookmarked;
    });
  }, []);

  // Toggle bookmark status
  const toggleBookmark = useCallback((id: string) => {
    setSearches((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, isBookmarked: !s.isBookmarked } : s
      );
      saveSearches(updated);
      return updated;
    });
  }, []);

  // Check if a search is bookmarked
  const isBookmarked = useCallback((id: string) => {
    return searches.some((s) => s.id === id && s.isBookmarked);
  }, [searches]);

  // Get only bookmarked searches
  const bookmarkedSearches = searches.filter((s) => s.isBookmarked);

  return {
    searches,
    bookmarkedSearches,
    addSearch,
    removeSearch,
    clearAll,
    toggleBookmark,
    isBookmarked,
  };
};
