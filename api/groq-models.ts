import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * TEMPORARY diagnostic endpoint.
 * Asks Groq which model ids the current GROQ_API_KEY can use, logs them so
 * they show up in the Vercel function logs, and returns them as JSON.
 * Delete this file once the model name is confirmed.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const key = process.env.GROQ_API_KEY;

  if (!key) {
    console.log('[groq-models] GROQ_API_KEY is missing in this environment');
    return res.status(500).json({
      error: 'GROQ_API_KEY is missing in this environment',
      deployment: process.env.VERCEL_URL ?? null,
    });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });

    const data: unknown = await response.json();

    const ids = Array.isArray((data as { data?: unknown }).data)
      ? ((data as { data: { id: string }[] }).data).map((model) => model.id)
      : null;

    console.log('[groq-models] status:', response.status, 'ids:', ids ?? data);

    return res.status(response.status).json({
      status: response.status,
      keyPresent: true,
      deployment: process.env.VERCEL_URL ?? null,
      ids,
      raw: ids ? undefined : data,
    });
  } catch (error) {
    console.log('[groq-models] request failed:', error);
    return res.status(500).json({ error: String(error) });
  }
}
