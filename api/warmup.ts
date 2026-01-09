import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TokenManager } from './_utils/tokenManager.js';

/**
 * Warmup endpoint to keep the serverless function warm
 * and maintain the cached IGDB auth token.
 * Called by Vercel Cron every 5 minutes.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    // Refresh/validate the IGDB token
    const token = await TokenManager.getInstance().getToken();
    
    return res.status(200).json({ 
      status: 'warm',
      tokenValid: !!token,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Warmup error:', error);
    return res.status(500).json({ status: 'error' });
  }
}
