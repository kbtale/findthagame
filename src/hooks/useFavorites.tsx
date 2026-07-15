import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { GameResult } from '@/models/AppTypes';

const STORAGE_KEY = 'ftg-favorites';

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

interface FavoritesContextType {
  favorites: GameResult[];
  addFavorite: (game: GameResult) => void;
  removeFavorite: (gameId: number) => void;
  isFavorite: (gameId: number) => boolean;
  toggleFavorite: (game: GameResult) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<GameResult[]>(loadFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, [favorites]);

  const addFavorite = useCallback((game: GameResult) => {
    setFavorites(prev => {
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

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
