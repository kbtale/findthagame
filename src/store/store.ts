import { configureStore } from '@reduxjs/toolkit';
import detectiveReducer from '@/store/slices/detectiveSlice';
import resultsReducer from '@/store/slices/resultsSlice';

export const store = configureStore({
  reducer: {
    detective: detectiveReducer,
    results: resultsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;