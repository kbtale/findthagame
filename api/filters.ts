/**
 * api/filters.ts
 *
 * Turns a free-text memory of a game ("I played it as a kid on PS2, it was a
 * racing game with a clown...") into structured search filters using Groq.
 * Output is validated against the static option catalogs before being returned,
 * so the frontend only ever receives usable filter values.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
import {
  PLATFORMS,
  GENRES,
  THEMES,
  GAME_MODES,
  PERSPECTIVES,
  GAME_CATEGORIES,
  GAME_STATUSES,
} from '../src/config/constants.js';
import { needsTranslation, translateToEnglish } from './_utils/translateSearch.js';
import type { SearchFilters } from '../src/models/SearchFilters.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MIN_YEAR = 1950;
const MAX_YEAR = new Date().getFullYear() + 1;

const toCatalog = (items: { id: number; name: string }[]) =>
  items.map((item) => `${item.id}=${item.name}`).join(', ');

const CATALOG = [
  `platforms: ${toCatalog(PLATFORMS)}`,
  `genres: ${toCatalog(GENRES)}`,
  `themes: ${toCatalog(THEMES)}`,
  `game_modes: ${toCatalog(GAME_MODES)}`,
  `perspectives: ${toCatalog(PERSPECTIVES)}`,
  `categories: ${toCatalog(GAME_CATEGORIES)}`,
  `statuses: ${toCatalog(GAME_STATUSES)}`,
].join('\n');

export const SYSTEM_PROMPT = `You extract search filters for a video game database (IGDB) from a user's fuzzy memory of a game.

User input may be written in any language; reason in that language but always output English catalog names and English search keywords.

Available options (use ONLY these IDs):
${CATALOG}

Rules:
1. Extract a field ONLY when the text gives clear evidence. It is better to omit a field than to guess.
2. platformId: platform the user played on. Pick the most specific match (prefer "Nintendo Entertainment System" over "Family Computer").
3. yearRange: only when the user mentions when they played or when it came out. Convert to a range of +/- 2 years (e.g. "I played it in 2005" -> [2003, 2007]). When they give only a decade (e.g. "in the 90s") -> [1990, 1999]. Use integers only.
4. genreIds / themeIds: array of IDs for every matching genre/theme (e.g. "survival horror" -> horror theme + survival theme).
5. developerName: studio or publisher name exactly as written by the user.
6. categoryId / statusId: only if the user explicitly describes a remaster, remake, DLC, beta, cancelled game, etc.
7. minRating: only when the user says the game was famous or highly rated; value is 0-100 (e.g. "very popular" -> 70).
8. search: English keywords for the game's name OR distinctive plot/character/mechanic words from the description, MAX 10 words. Never put platform, genre, year or developer information in the search field.
9. Include only fields with clear evidence; omit everything else.

Respond with ONLY a JSON object (no markdown, no code fences) using this shape, omitting fields that do not apply:
{
  "search": "english keywords",
  "platformId": <id>,
  "yearRange": [<from year>, <to year>],
  "genreIds": [<ids>],
  "themeIds": [<ids>],
  "gameModeId": <id>,
  "perspectiveId": <id>,
  "categoryId": <id>,
  "statusId": <id>,
  "developerName": "Studio Name",
  "minRating": <0-100>
}`;

interface RawPayload {
  search?: unknown;
  platformId?: unknown;
  yearRange?: unknown;
  genreIds?: unknown;
  themeIds?: unknown;
  gameModeId?: unknown;
  perspectiveId?: unknown;
  categoryId?: unknown;
  statusId?: unknown;
  developerName?: unknown;
  minRating?: unknown;
}

type ModelFilterPayload = Partial<Record<keyof RawPayload, unknown>>;

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [value]);

const firstId = (
  value: unknown,
  validIds: Set<number>,
): number | undefined => {
  if (value === null || value === undefined) return undefined;
  for (const raw of asArray(value)) {
    const id = Number(raw);
    if (Number.isInteger(id) && validIds.has(id)) return id;
  }
  return undefined;
};

const idList = (value: unknown, validIds: Set<number>): number[] => {
  if (value === null || value === undefined) return [];
  return [...new Set(
    asArray(value)
      .map((raw) => Number(raw))
      .filter((id) => Number.isInteger(id) && validIds.has(id)),
  )];
};

const normalize = (payload: RawPayload): SearchFilters => {
  const filters: SearchFilters = {};

  if (typeof payload.search === 'string' && payload.search.trim().length > 0) {
    filters.search = payload.search.trim().split(/\s+/).slice(0, 10).join(' ');
  }

  const platformId = firstId(payload.platformId, new Set(PLATFORMS.map((p) => p.id)));
  if (platformId !== undefined) filters.platformId = platformId;

  if (Array.isArray(payload.yearRange) && payload.yearRange.length >= 1) {
    const years = payload.yearRange
      .map((raw) => Number(raw))
      .filter((year) => Number.isInteger(year));
    if (years.length > 0) {
      const from = Math.min(Math.max(years[0], MIN_YEAR), MAX_YEAR - 1);
      const to = Math.min(Math.max(years[years.length - 1], from), MAX_YEAR);
      filters.yearRange = [from, to];
    }
  }

  const genreIds = idList(payload.genreIds, new Set(GENRES.map((g) => g.id)));
  if (genreIds.length > 0) filters.genreIds = genreIds;

  const themeIds = idList(payload.themeIds, new Set(THEMES.map((t) => t.id)));
  if (themeIds.length > 0) filters.themeIds = themeIds;

  const gameModeId = firstId(payload.gameModeId, new Set(GAME_MODES.map((m) => m.id)));
  if (gameModeId !== undefined) filters.gameModeId = gameModeId;

  const perspectiveId = firstId(payload.perspectiveId, new Set(PERSPECTIVES.map((p) => p.id)));
  if (perspectiveId !== undefined) filters.perspectiveId = perspectiveId;

  const categoryId = firstId(payload.categoryId, new Set(GAME_CATEGORIES.map((c) => c.id)));
  if (categoryId !== undefined) filters.categoryId = categoryId;

  const statusId = firstId(payload.statusId, new Set(GAME_STATUSES.map((s) => s.id)));
  if (statusId !== undefined) filters.statusId = statusId;

  if (typeof payload.developerName === 'string' && payload.developerName.trim().length > 0) {
    filters.developerName = payload.developerName.trim().slice(0, 60);
  }

  const minRating = Number(payload.minRating);
  if (Number.isInteger(minRating) && minRating > 0 && minRating <= 100) {
    filters.minRating = minRating;
  }

  return filters;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://findthagame.vercel.app',
  ];

  const origin = req.headers.origin as string;

  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { description, uiLanguage = 'en' } = (req.body ?? {}) as {
    description?: string;
    uiLanguage?: string;
  };

  if (!description || description.trim().length === 0) {
    return res.status(400).json({ error: 'No description provided' });
  }

  const trimmed = description.trim().slice(0, 2000);

  try {
    // The catalogs are in English, so non-English memories are translated first
    // for better option matching. Game and studio names stay untouched.
    const text = needsTranslation(trimmed, uiLanguage)
      ? await translateToEnglish(trimmed)
      : trimmed;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';

    let payload: ModelFilterPayload = {};
    try {
      payload = JSON.parse(raw) as ModelFilterPayload;
    } catch {
      console.error('filters: model returned invalid JSON:', raw);
    }

    const filters = normalize(payload);

    return res.status(200).json({
      filters,
      search: typeof filters.search === 'string' ? filters.search : '',
    });
  } catch (error) {
    console.error('filters endpoint error:', error);
    return res.status(500).json({ error: 'Failed to parse description' });
  }
}
