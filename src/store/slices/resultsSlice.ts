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
  selectedIndex: number | null;
  clickOrigin: ClickOrigin | null;
}

// Define the initial state.
const initialState: ResultsState = {
  items: [],
  status: 'idle',
  error: null,
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
      state.selectedIndex = null;
      state.clickOrigin = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.items = [];
      state.selectedIndex = null;
      state.clickOrigin = null;
    },
    resetResults: (state) => {
      state.status = 'idle';
      state.items = [];
      state.error = null;
      state.selectedIndex = null;
      state.clickOrigin = null;
    },
    selectGame: (state, action: PayloadAction<{ index: number; origin: ClickOrigin }>) => {
      state.selectedIndex = action.payload.index;
      state.clickOrigin = action.payload.origin;
    },
    clearSelection: (state) => {
      state.selectedIndex = null;
      state.clickOrigin = null;
    },
    selectNext: (state) => {
      if (state.selectedIndex !== null && state.selectedIndex < state.items.length - 1) {
        state.selectedIndex += 1;
        state.clickOrigin = null; // No animation for next/prev
      }
    },
    selectPrevious: (state) => {
      if (state.selectedIndex !== null && state.selectedIndex > 0) {
        state.selectedIndex -= 1;
        state.clickOrigin = null; // No animation for next/prev
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
  clearSelection,
  selectNext,
  selectPrevious,
} = resultsSlice.actions;

export default resultsSlice.reducer;