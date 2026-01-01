import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FilterState } from '@/models/AppTypes';

// Define the initial state of the filters when the application starts.
const initialState: FilterState = {
  search: '',
  platformId: null,
  genreIds: [],
  themeIds: [],
  gameModeId: null,
  perspectiveId: null,
  yearRange: [1980, 2025],
};

// Create the slice logic using createSlice.
export const detectiveSlice = createSlice({
  name: 'detective',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setPlatformId: (state, action: PayloadAction<number | null>) => {
      state.platformId = action.payload;
    },
    toggleGenreId: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.genreIds.includes(id)) {
        state.genreIds = state.genreIds.filter((g) => g !== id);
      } else {
        state.genreIds.push(id);
      }
    },
    toggleThemeId: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.themeIds.includes(id)) {
        state.themeIds = state.themeIds.filter((t) => t !== id);
      } else {
        state.themeIds.push(id);
      }
    },
    setGameModeId: (state, action: PayloadAction<number | null>) => {
      state.gameModeId = action.payload;
    },
    setPerspectiveId: (state, action: PayloadAction<number | null>) => {
      state.perspectiveId = action.payload;
    },
    setYearRange: (state, action: PayloadAction<[number, number]>) => {
      state.yearRange = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setSearch,
  setPlatformId,
  toggleGenreId,
  toggleThemeId,
  setGameModeId,
  setPerspectiveId,
  setYearRange,
  resetFilters,
} = detectiveSlice.actions;

// Export the reducer function to be registered in the store.
export default detectiveSlice.reducer;