import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type GameResult } from '@/models/AppTypes';

// Click origin for FLIP animation
interface ClickOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResultsState {
  items: GameResult[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  selectedGame: GameResult | null;
  selectedIndex: number | null;
  clickOrigin: ClickOrigin | null;
  currentPage: number;
  sortBy: string;
}

const sortItems = (items: GameResult[], sortBy: string) => {
  switch (sortBy) {
    case 'nameAsc':
      items.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'nameDesc':
      items.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'newest':
      items.sort((a, b) => {
        const yearA = a.year ?? 0;
        const yearB = b.year ?? 0;
        if (yearA !== yearB) {
          return yearB - yearA;
        }
        return a.title.localeCompare(b.title);
      });
      break;
    case 'oldest':
      items.sort((a, b) => {
        const yearA = a.year ?? 9999;
        const yearB = b.year ?? 9999;
        if (yearA !== yearB) {
          return yearA - yearB;
        }
        return a.title.localeCompare(b.title);
      });
      break;
    case 'ratingDesc':
      items.sort((a, b) => {
        const ratingA = a.rating ?? -1;
        const ratingB = b.rating ?? -1;
        if (ratingA !== ratingB) {
          return ratingB - ratingA;
        }
        return a.title.localeCompare(b.title);
      });
      break;
    case 'ratingAsc':
      items.sort((a, b) => {
        const ratingA = a.rating ?? 999;
        const ratingB = b.rating ?? 999;
        if (ratingA !== ratingB) {
          return ratingA - ratingB;
        }
        return a.title.localeCompare(b.title);
      });
      break;
    case 'relevance':
    default:
      items.sort((a, b) => b.matchScore - a.matchScore);
      break;
  }
};

const initialState: ResultsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedGame: null,
  selectedIndex: null,
  clickOrigin: null,
  currentPage: 1,
  sortBy: localStorage.getItem('sortBy') || 'relevance',
};

export const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    setResults: (state, action: PayloadAction<GameResult[]>) => {
      state.status = 'success';
      state.items = action.payload;
      sortItems(state.items, state.sortBy);
      state.selectedGame = null;
      state.selectedIndex = null;
      state.clickOrigin = null;
      state.currentPage = 1;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.items = [];
      state.selectedGame = null;
      state.selectedIndex = null;
      state.clickOrigin = null;
      state.currentPage = 1;
    },
    resetResults: (state) => {
      state.status = 'idle';
      state.items = [];
      state.error = null;
      state.selectedGame = null;
      state.selectedIndex = null;
      state.clickOrigin = null;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
      localStorage.setItem('sortBy', action.payload);
      sortItems(state.items, action.payload);
      if (state.selectedGame) {
        state.selectedIndex = state.items.findIndex(g => g.id === state.selectedGame!.id);
      }
    },
    // Select a game from search results by index
    selectGame: (state, action: PayloadAction<{ index: number; origin: ClickOrigin }>) => {
      const game = state.items[action.payload.index];
      if (game) {
        state.selectedGame = game;
        state.selectedIndex = action.payload.index;
        state.clickOrigin = action.payload.origin;
      }
    },
    // Select an external game (favorites, etc.)
    selectExternalGame: (state, action: PayloadAction<{ game: GameResult; origin: ClickOrigin }>) => {
      state.selectedGame = action.payload.game;
      state.selectedIndex = null;  // Not in results, no index
      state.clickOrigin = action.payload.origin;
    },
    clearSelection: (state) => {
      state.selectedGame = null;
      state.selectedIndex = null;
      state.clickOrigin = null;
    },
    selectNext: (state) => {
      if (state.selectedIndex !== null && state.selectedIndex < state.items.length - 1) {
        state.selectedIndex += 1;
        state.selectedGame = state.items[state.selectedIndex];
        state.clickOrigin = null; // No animation for next/prev
      }
    },
    selectPrevious: (state) => {
      if (state.selectedIndex !== null && state.selectedIndex > 0) {
        state.selectedIndex -= 1;
        state.selectedGame = state.items[state.selectedIndex];
        state.clickOrigin = null;
      }
    },
    updateGameTranslation: (state, action: PayloadAction<{ 
      gameId: number; 
      lang: string; 
      summary?: string; 
      storyline?: string 
    }>) => {
      const { gameId, lang, summary, storyline } = action.payload;
      const game = state.items.find(g => g.id === gameId);
      if (game) {
        if (!game.translations) game.translations = {};
        game.translations[lang] = { summary, storyline };
      }
      // Also update selectedGame if it's the same game
      if (state.selectedGame?.id === gameId) {
        if (!state.selectedGame.translations) state.selectedGame.translations = {};
        state.selectedGame.translations[lang] = { summary, storyline };
      }
    },
  },
});

export const { 
  setLoading, 
  setResults, 
  setError, 
  resetResults,
  setCurrentPage,
  setSortBy,
  selectGame,
  selectExternalGame,
  clearSelection,
  selectNext,
  selectPrevious,
  updateGameTranslation,
} = resultsSlice.actions;

export default resultsSlice.reducer;