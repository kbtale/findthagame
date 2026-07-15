import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TokenManager } from './_utils/tokenManager.js';
import type { IGDBGame } from '../src/models/IGDBTypes.js';

const FIELDS_LIST = [
  'name',
  'summary',
  'storyline',
  'first_release_date',
  'total_rating',
  'category',
  'status', 
  'cover.url',
  'platforms.name',
  'genres.name',
  'themes.name',
  'game_modes.name',
  'player_perspectives.name',
  'keywords.name',
  'alternative_names.name',
  'involved_companies.company.name',
  'involved_companies.developer',
  'involved_companies.publisher',
  'involved_companies.porting',
  'involved_companies.supporting',
  'age_ratings.organization',
  'age_ratings.rating_category'
].join(', ');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://findthagame.vercel.app'
  ];
  const origin = req.headers.origin as string;
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing game id' });
  }

  const gameId = parseInt(id as string, 10);
  if (isNaN(gameId)) {
    return res.status(400).json({ error: 'Invalid game id' });
  }

  try {
    const token = await TokenManager.getInstance().getToken();    
    const clientId = process.env.TWITCH_CLIENT_ID;
    if (!clientId) throw new Error('TWITCH_CLIENT_ID is missing');

    const igdbQuery = `fields ${FIELDS_LIST}; where id = ${gameId};`;
    const igdbResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: igdbQuery,
    });

    if (!igdbResponse.ok) {
      const errorText = await igdbResponse.text();
      throw new Error(`IGDB responded with ${igdbResponse.status}: ${errorText}`);
    }

    const games = (await igdbResponse.json()) as IGDBGame[];
    if (!games || games.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

interface IGDBGameWithScreenshots extends Omit<IGDBGame, 'screenshots'> {
  screenshots?: { url: string }[];
}

    const game = games[0] as IGDBGameWithScreenshots;

    const screenshotQuery = `fields game, url; where game = ${gameId}; limit 10;`;
    const screenshotResponse = await fetch('https://api.igdb.com/v4/screenshots', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: screenshotQuery,
    });

    if (screenshotResponse.ok) {
      const screenshots = (await screenshotResponse.json()) as Array<{ game: number; url: string }>;
      game.screenshots = screenshots.map(ss => ({ url: ss.url }));
    } else {
      game.screenshots = [];
    }

    return res.status(200).json(game);
  } catch (error: unknown) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch game details', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
