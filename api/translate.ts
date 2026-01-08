/*
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text, targetLang = 'Spanish' } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a translator API. Translate the user input into ${targetLang}. Output ONLY the translated text. No pleasantries, no quotes.`
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama-3.1-8b-instant", 
      temperature: 0.1,
    });

    const translatedText = completion.choices[0]?.message?.content || "";

    return res.status(200).json({ translatedText });

  } catch (error) {
    console.error("Groq Error:", error);
    return res.status(500).json({ error: 'Translation failed' });
  }
}
*/