/**
 * src/api/client.ts
 *
 * The main communication channel between the React App and the Vercel Proxy.
 */

import axios, { AxiosError } from 'axios';
import type { FilterState, GameResult } from '@/models/AppTypes';
import type { IGDBGame } from '@/models/IGDBTypes';
import i18n from '@/config/i18n';

interface ScoredIGDBGame extends IGDBGame {
  match_score: number;
}

const agent = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s to allow for translation + IGDB query
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

export const mapIGDBGameToGameResult = (game: IGDBGame & { match_score?: number }): GameResult => {
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : undefined;

  const firstReleaseDate = game.first_release_date
    ? new Date(game.first_release_date * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : undefined;

  const coverUrl = game.cover?.url
    ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
    : undefined;

  const platformNames = game.platforms?.map((p) => p.name) || [];
  const genreNames = game.genres?.map((g) => g.name) || [];
  
  const companyNames = game.involved_companies?.map((c) => {
    const roles: string[] = [];
    if (c.developer) roles.push('Developer');
    if (c.publisher) roles.push('Publisher');
    if (c.porting) roles.push('Porting');
    if (c.supporting) roles.push('Supporting');
    return roles.length > 0 ? `${c.company.name} (${roles.join(', ')})` : c.company.name;
  }) || [];

  const screenshotUrls = game.screenshots?.map((s) =>
    `https:${s.url.replace('t_thumb', 't_1080p')}`
  ) || [];

  const themeNames = game.themes?.map((t) => t.name) || [];
  const modeNames = game.game_modes?.map((m) => m.name) || [];
  const perspectiveNames = game.player_perspectives?.map((p) => p.name) || [];
  const keywords = game.keywords?.map((k) => k.name) || [];
  const totalRating = game.total_rating ? Math.round(game.total_rating) : undefined;
  const alternativeNames = game.alternative_names?.map(an => an.name) || [];
  const ageRatings = game.age_ratings?.map((ar) => ({
      id: ar.id,
      category: ar.organization,
      rating: ar.rating_category
    })) || [];

  return {
    id: game.id,
    title: game.name,
    ageRatings: ageRatings,
    alternativeNames: alternativeNames,
    category: game.category ?? 0,
    companies: companyNames,
    coverUrl: coverUrl,
    firstReleaseDate: firstReleaseDate,
    gameModes: modeNames,
    genres: genreNames,
    keywords: keywords,
    matchScore: game.match_score || 0,
    perspectives: perspectiveNames,
    platforms: platformNames,
    rating: totalRating,
    screenshots: screenshotUrls,
    status: game.status ?? 0,
    storyline: game.storyline,
    summary: game.summary,
    themes: themeNames,
    year: year,
  };
};

export const searchGames = async (filters: FilterState): Promise<GameResult[]> => {
  const payload = {
    ...filters,
    uiLanguage: i18n.language || 'en',
  };
  
  const { data } = await agent.post<ScoredIGDBGame[]>('/search', payload);

  return data.map(mapIGDBGameToGameResult);
};

export const fetchGameById = async (id: number): Promise<GameResult> => {
  const { data } = await agent.get<IGDBGame>(`/game?id=${id}`);
  return mapIGDBGameToGameResult(data);
};