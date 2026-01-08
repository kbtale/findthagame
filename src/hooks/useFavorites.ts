/**
 * src/hooks/useFavorites.ts
 * Hook to manage favorite games with localStorage persistence.
 */

import { useState, useEffect, useCallback } from 'react';
import type { GameResult } from '@/models/AppTypes';

const STORAGE_KEY = 'ftg-favorites';

// Load favorites from localStorage
function loadFavorites(): GameResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load favorites:', error);
  }
  return [];
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<GameResult[]>(loadFavorites);

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, [favorites]);

  const addFavorite = useCallback((game: GameResult) => {
    setFavorites(prev => {
      // Prevent duplicates
      if (prev.some(g => g.id === game.id)) return prev;
      return [...prev, game];
    });
  }, []);

  const removeFavorite = useCallback((gameId: number) => {
    setFavorites(prev => prev.filter(g => g.id !== gameId));
  }, []);

  const isFavorite = useCallback((gameId: number) => {
    return favorites.some(g => g.id === gameId);
  }, [favorites]);

  const toggleFavorite = useCallback((game: GameResult) => {
    if (isFavorite(game.id)) {
      removeFavorite(game.id);
    } else {
      addFavorite(game);
    }
  }, [isFavorite, removeFavorite, addFavorite]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}
