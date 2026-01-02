/**
 * src/api/client.ts
 *
 * The main communication channel between the React App and the Vercel Proxy.
 * UPDATED: Uses Axios for global rate limiting and timeouts.
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
    const genreNames = game.genres?.map((p) => p.name) || [];
    const companyNames = game.involved_companies?.map((c) => c.company.name) || [];

    // 3. FIXED: Process screenshot URLs (add https and resize)
    const screenshotUrls = game.screenshots?.map((s) =>
      `https:${s.url.replace('t_thumb', 't_screenshot_medium')}`
    ) || [];

    const themeNames = game.themes?.map((t) => t.name) || [];
    const modeNames = game.game_modes?.map((m) => m.name) || [];
    const perspectiveNames = game.player_perspectives?.map((p) => p.name) || [];

    return {
      id: game.id,
      title: game.name,
      coverUrl: coverUrl,
      year: year,
      platforms: platformNames,
      matchScore: game.match_score || 0,
      genres: genreNames,
      themes: themeNames,
      screenshots: screenshotUrls,
      companies: companyNames,
      summary: game.summary,
      gameModes: modeNames,
      perspectives: perspectiveNames,
    };
  });
};