import type { Middleware } from '@reduxjs/toolkit';

/**
 * Redux middleware that triggers API warmup on first filter change.
 * This wakes up Vercel serverless functions before the user searches.
 */
let hasWarmedUp = false;

const FILTER_ACTIONS = [
  'detective/setPlatformId',
  'detective/setYearRange',
  'detective/setGenreIds',
  'detective/setThemeIds',
  'detective/setGameModeIds',
  'detective/setPerspectiveIds',
  'detective/setAgeRatingOrg',
  'detective/setAgeRatingValue',
  'detective/setCategory',
  'detective/setStatus',
  'detective/setDeveloperName',
];

export const warmupMiddleware: Middleware = () => (next) => (action) => {
  // Trigger warmup on first filter change
  if (!hasWarmedUp && FILTER_ACTIONS.includes((action as { type: string }).type)) {
    hasWarmedUp = true;
    
    // Fire and forget
    fetch('/api/warmup', { method: 'GET' }).catch(() => {
      hasWarmedUp = false;
    });
  }
  
  return next(action);
};
