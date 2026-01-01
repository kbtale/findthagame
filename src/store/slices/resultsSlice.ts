import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type GameResult } from '@/models/AppTypes';

interface ResultsState {
  items: GameResult[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

// Define the initial state.
const initialState: ResultsState = {
  items: [],
  status: 'idle',
  error: null,
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
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.items = [];
    },
    resetResults: (state) => {
      state.status = 'idle';
      state.items = [];
      state.error = null;
    },
  },
});

export const { setLoading, setResults, setError, resetResults } = resultsSlice.actions;

export default resultsSlice.reducer;