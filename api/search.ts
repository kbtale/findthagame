import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TokenManager } from './_utils/tokenManager.js';
import { buildIgdbQuery } from './_utils/queryBuilder.js';
import { calculateMatchScore } from './_utils/scoring.js';
import type { IGDBGame } from '../src/models/IGDBTypes.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // 1. DYNAMIC ORIGIN CHECK (CORS Security)
  // -------------------------------------------------------
  // Define a list of "safe" domains that are allowed to talk to this API.
  const allowedOrigins = [
    'http://localhost:5173', // local React development server.
    // 'https://findthagame.vercel.app' // (Future) environment.
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
    // 4. AUTHENTICATION
    // -------------------------------------------------------
    // Request a valid access token from the TokenManager singleton.
    // If the cached token is expired, this line pauses to fetch a new one from Twitch.
    const token = await TokenManager.getInstance().getToken();    
    const clientId = process.env.TWITCH_CLIENT_ID;

    if (!clientId) throw new Error('TWITCH_CLIENT_ID is missing');

    // 5. BUILD THE QUERY
    // -------------------------------------------------------
    // Take the JSON body sent by React (req.body) and pass it to the builder function.
    // This converts { search: "Mario" } into "fields *; search "Mario";".
    const igdbQueryString = buildIgdbQuery(req.body);

    // 6. EXECUTE IGDB API CALL
    // -------------------------------------------------------
    // Send the request to the external IGDB API.
    const igdbResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',    // Content-Type required by IGDB.
      },
      body: igdbQueryString,
    });

    // 7. HANDLE UPSTREAM ERRORS
    // -------------------------------------------------------
    // Check if the upstream API response indicates failure.
    if (!igdbResponse.ok) {
      const errorText = await igdbResponse.text();
      console.error('IGDB API Error:', errorText);
      throw new Error(`IGDB responded with ${igdbResponse.status}: ${errorText}`);
    }

    // 8. RETURN SUCCESSFUL DATA
    // -------------------------------------------------------
    // Parse the JSON data returned by IGDB.
    const rawGames = (await igdbResponse.json()) as IGDBGame[];

    // Score every single game
    // Passing the game AND the user's filters (req.body) to the scoring engine.
    const scoredGames = rawGames.map((game) => {
      return {
        ...game, // Keep all original data
        match_score: calculateMatchScore(game, req.body),
      };
    });

    // Sort by score (Highest first)
    scoredGames.sort((a, b) => b.match_score - a.match_score);

    // Send the improved list back to the frontend
    return res.status(200).json(scoredGames);

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