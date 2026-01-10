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
}

const initialState: ResultsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedGame: null,
  selectedIndex: null,
  clickOrigin: null,
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
      state.selectedGame = null;
      state.selectedIndex = null;
      state.clickOrigin = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.items = [];
      state.selectedGame = null;
      state.selectedIndex = null;
      state.clickOrigin = null;
    },
    resetResults: (state) => {
      state.status = 'idle';
      state.items = [];
      state.error = null;
      state.selectedGame = null;
      state.selectedIndex = null;
      state.clickOrigin = null;
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
      // Only works when navigating within results
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
  selectGame,
  selectExternalGame,
  clearSelection,
  selectNext,
  selectPrevious,
  updateGameTranslation,
} = resultsSlice.actions;

export default resultsSlice.reducer;