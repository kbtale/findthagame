/**
 * src/api/client.ts
 *
 * The main communication channel between the React App and the Vercel Proxy.
 */

import axios, { AxiosError } from 'axios';
import type { FilterState, GameResult } from '@/models/AppTypes';
import type { IGDBGame } from '@/models/IGDBTypes';

interface ScoredIGDBGame extends IGDBGame {
  match_score: number;
}

const agent = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

agent.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      if (error.response.status === 429) {
        console.error('SYSTEM OVERLOAD: Too many detectives searching at once.');
        return Promise.reject(new Error('Rate limit exceeded. Please wait a moment.'));
      }      
      if (error.response.status >= 500) {
        console.error('PROXY FAILURE: The Vercel function crashed.');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Main Search Function
 * POSTs filters to /api/search and maps the result to GameResult[]
 */
export const searchGames = async (filters: FilterState): Promise<GameResult[]> => {
  // Execute the request using the axios agent
  const { data } = await agent.post<ScoredIGDBGame[]>('/search', filters);

  // Transform Data (Adapter Pattern)
  return data.map((game) => {
    const year = game.first_release_date
      ? new Date(game.first_release_date * 1000).getFullYear()
      : undefined;

    const coverUrl = game.cover?.url
      ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
      : undefined;

    const platformNames = game.platforms?.map((p) => p.name) || [];
    const genreNames = game.genres?.map((g) => g.name) || [];
    const companyNames = game.involved_companies?.map((c) => c.company.name) || [];

    // Process screenshot URLs (add https and resize)
    const screenshotUrls = game.screenshots?.map((s) =>
      `https:${s.url.replace('t_thumb', 't_screenshot_medium')}`
    ) || [];

    const themeNames = game.themes?.map((t) => t.name) || []
    const modeNames = game.game_modes?.map((m) => m.name) || []
    const perspectiveNames = game.player_perspectives?.map((p) => p.name) || []
    const keywords = game.keywords?.map((k) => k.name) || []
    const totalRating = game.total_rating ? Math.round(game.total_rating) : undefined
    const alternativeNames = game.alternative_names?.map(an => an.name) || []
    const ageRatings = game.age_ratings?.map((ar) => ({
        id: ar.id,
        category: ar.organization,
        rating: ar.rating_category
      })) || []


    return {
      id: game.id,
      title: game.name,
      ageRatings: ageRatings,
      alternativeNames: alternativeNames,
      category: game.category ?? 0,
      companies: companyNames,
      coverUrl: coverUrl,
      gameModes: modeNames,
      genres: genreNames,
      keywords: keywords,
      matchScore: game.match_score || 0,
      perspectives: perspectiveNames,
      platforms: platformNames,
      rating: totalRating,
      screenshots: screenshotUrls,
      status: game.status,
      storyline: game.storyline,
      summary: game.summary,
      themes: themeNames,
      year: year,
    };
  });
};