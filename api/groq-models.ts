import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * TEMPORARY diagnostic endpoint.
 *
 * Without query params: asks Groq which model ids the current GROQ_API_KEY
 * can use, logs them, and returns them as JSON.
 *
 * With ?probe=<model1>,<model2>: sends a one-token chat request per model and
 * returns the rate limit headers Groq reports for that key and model.
 *
 * Delete this file once the models are confirmed.
 */

const LIMIT_HEADERS = [
  'x-ratelimit-limit-requests',
  'x-ratelimit-remaining-requests',
  'x-ratelimit-limit-tokens',
  'x-ratelimit-remaining-tokens',
  'retry-after',
];

const readLimits = (headers: Headers) => {
  const limits: Record<string, string> = {};
  for (const name of LIMIT_HEADERS) {
    const value = headers.get(name);
    if (value !== null) limits[name] = value;
  }
  return limits;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.GROQ_API_KEY;

  if (!key) {
    console.log('[groq-models] GROQ_API_KEY is missing in this environment');
    return res.status(500).json({
      error: 'GROQ_API_KEY is missing in this environment',
      deployment: process.env.VERCEL_URL ?? null,
    });
  }

  const probeQuery = req.query.probe;
  const probeRaw = Array.isArray(probeQuery) ? probeQuery.join(',') : probeQuery;

  if (typeof probeRaw === 'string' && probeRaw.trim().length > 0) {
    const models = probeRaw
      .split(',')
      .map((model) => model.trim())
      .filter((model) => /^[a-zA-Z0-9._/-]+$/.test(model))
      .slice(0, 6);

    const results = [];
    for (const model of models) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'hi' }],
            max_completion_tokens: 1,
          }),
        });

        const limits = readLimits(response.headers);
        const body = await response.text();
        const snippet = body.slice(0, 300);

        console.log(`[groq-models] probe ${model}: status=${response.status} limits=${JSON.stringify(limits)} body=${snippet}`);

        results.push({ model, status: response.status, limits, body: snippet });
      } catch (error) {
        console.log(`[groq-models] probe ${model} failed:`, error);
        results.push({ model, status: 'error', error: String(error) });
      }
    }

    return res.status(200).json({ deployment: process.env.VERCEL_URL ?? null, probes: results });
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
