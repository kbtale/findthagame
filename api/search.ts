import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TokenManager } from './_utils/tokenManager.js';
import { buildIgdbQuery } from './_utils/queryBuilder.js';
import { calculateMatchScore } from './_utils/scoring.js';
import { needsTranslation, translateToEnglish } from './_utils/translateSearch.js';
import type { IGDBGame } from '../src/models/IGDBTypes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // 1. DYNAMIC ORIGIN CHECK (CORS Security)
  // -------------------------------------------------------
  // Define a list of "safe" domains that are allowed to talk to this API.
  const allowedOrigins = [
    'http://localhost:5173', // Local React development server.
    'https://findthagame.vercel.app'
  ];

  const origin = req.headers.origin as string;

  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }

  // Allow the frontend to send cookies or authorization headers (required for some browser security settings).
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Define which HTTP methods are allowed.
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. PRE-FLIGHT CHECK (OPTIONS)
  // -------------------------------------------------------
  // Browsers verify security by sending a dummy "OPTIONS" request before the real "POST".
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. METHOD VALIDATION
  // -------------------------------------------------------
  // Strictly require the request to be a POST because it's sending data (filters) in the body.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const startTime = Date.now();
    console.log(`[TIMING] Request started at ${new Date().toISOString()}`);

    // 4. AUTHENTICATION
    // -------------------------------------------------------
    const authStart = Date.now();
    const token = await TokenManager.getInstance().getToken();    
    const clientId = process.env.TWITCH_CLIENT_ID;
    console.log(`[TIMING] Auth completed in ${Date.now() - authStart}ms`);

    if (!clientId) throw new Error('TWITCH_CLIENT_ID is missing');

    // 5. TRANSLATE SEARCH QUERY (if needed)
    // -------------------------------------------------------
    const { uiLanguage, search: originalSearch, ...restBody } = req.body;
    let translatedSearch = originalSearch;
    
    if (originalSearch && needsTranslation(originalSearch, uiLanguage)) {
      const translateStart = Date.now();
      console.log(`[TIMING] Starting translation from ${uiLanguage}: "${originalSearch}"`);
      translatedSearch = await translateToEnglish(originalSearch);
      console.log(`[TIMING] Translation completed in ${Date.now() - translateStart}ms → "${translatedSearch}"`);
    }
    
    // 6. BUILD THE QUERY
    // -------------------------------------------------------
    const buildStart = Date.now();
    const queryParams = { ...restBody, search: translatedSearch };
    const igdbQueryString = buildIgdbQuery(queryParams);
    console.log(`[TIMING] Query built in ${Date.now() - buildStart}ms`);
    console.log('IGDB Query:', igdbQueryString);

    // 7. EXECUTE IGDB API CALL
    // -------------------------------------------------------
    const igdbStart = Date.now();
    const igdbResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: igdbQueryString,
    });
    console.log(`[TIMING] IGDB API call completed in ${Date.now() - igdbStart}ms`);

    // 8. HANDLE UPSTREAM ERRORS
    // -------------------------------------------------------
    if (!igdbResponse.ok) {
      const errorText = await igdbResponse.text();
      console.error('IGDB API Error:', errorText);
      throw new Error(`IGDB responded with ${igdbResponse.status}: ${errorText}`);
    }

    // 9. PARSE AND SCORE RESULTS
    // -------------------------------------------------------
    const parseStart = Date.now();
    const rawGames = (await igdbResponse.json()) as IGDBGame[];
    console.log(`[TIMING] JSON parsed in ${Date.now() - parseStart}ms (${rawGames.length} games)`);

    const scoreStart = Date.now();
    const scoredGames = rawGames.map((game) => {
      return {
        ...game,
        match_score: calculateMatchScore(game, req.body),
      };
    });

    scoredGames.sort((a, b) => {
      const scoreDiff = b.match_score - a.match_score;
      if (scoreDiff !== 0) return scoreDiff;
      return (b.total_rating ?? 0) - (a.total_rating ?? 0);
    });
    console.log(`[TIMING] Scoring completed in ${Date.now() - scoreStart}ms`);

    // 10. FETCH SCREENSHOTS FOR TOP RESULTS
    // -------------------------------------------------------
    const topResults = scoredGames.slice(0, 160);
    const gameIds = topResults.map(g => g.id);
    
    const screenshotStart = Date.now();
    const screenshotQuery = `fields game, url; where game = (${gameIds.join(',')}); limit 500;`;
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
      console.log(`[TIMING] Screenshots fetched in ${Date.now() - screenshotStart}ms (${screenshots.length} screenshots)`);
      
      // Group screenshots by game ID
      const screenshotsByGame = new Map<number, string[]>();
      for (const ss of screenshots) {
        if (!screenshotsByGame.has(ss.game)) {
          screenshotsByGame.set(ss.game, []);
        }
        screenshotsByGame.get(ss.game)!.push(ss.url);
      }
      
      // Merge screenshots into results
      for (const game of topResults) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (game as any).screenshots = screenshotsByGame.get(game.id)?.map(url => ({ url })) ?? [];
      }
    } else {
      console.error(`[TIMING] Screenshots fetch failed in ${Date.now() - screenshotStart}ms`);
    }

    console.log(`[TIMING] TOTAL request time: ${Date.now() - startTime}ms`);
    return res.status(200).json(topResults);

  } catch (error: unknown) {
    // 9. GLOBAL ERROR HANDLING
    // -------------------------------------------------------
    // Catch any errors that occurred during execution.
    console.error('Proxy Error:', error);
    
    // Return a 500 Server Error response.
    return res.status(500).json({ 
      error: 'Failed to fetch games', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}