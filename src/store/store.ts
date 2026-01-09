import { configureStore } from '@reduxjs/toolkit';
import detectiveReducer from '@/store/slices/detectiveSlice';
import resultsReducer from '@/store/slices/resultsSlice';
import { warmupMiddleware } from '@/store/warmupMiddleware';

export const store = configureStore({
  reducer: {
    detective: detectiveReducer,
    results: resultsReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(warmupMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;