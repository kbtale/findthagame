import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type GameResult } from '@/models/AppTypes';

interface ResultsState {
  items: GameResult[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  selectedIndex: number | null;
}

// Define the initial state.
const initialState: ResultsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedIndex: null,
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
      state.selectedIndex = null; // Reset selection when new results arrive
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.items = [];
      state.selectedIndex = null;
    },
    resetResults: (state) => {
      state.status = 'idle';
      state.items = [];
      state.error = null;
      state.selectedIndex = null;
    },
    selectGame: (state, action: PayloadAction<number>) => {
      state.selectedIndex = action.payload;
    },
    clearSelection: (state) => {
      state.selectedIndex = null;
    },
    selectNext: (state) => {
      if (state.selectedIndex !== null && state.selectedIndex < state.items.length - 1) {
        state.selectedIndex += 1;
      }
    },
    selectPrevious: (state) => {
      if (state.selectedIndex !== null && state.selectedIndex > 0) {
        state.selectedIndex -= 1;
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