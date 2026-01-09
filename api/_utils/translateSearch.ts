/**
 * api/_utils/translateSearch.ts
 * Handles detection and translation of non-English search queries.
 */

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Determines if a search query needs translation to English.
 * Uses hybrid detection: non-ASCII chars OR non-English UI language.
 */
export const needsTranslation = (text: string, uiLanguage: string): boolean => {
  if (!text || text.trim().length === 0) return false;
  
  // Non-ASCII chars (Arabic, Japanese, Cyrillic, accented chars, etc.)
  // Check if any character has char code > 127
  const hasNonAscii = text.split('').some(char => char.charCodeAt(0) > 127);
  if (hasNonAscii) return true;
  
  // UI is not English (user might be typing in Spanish/French with Latin chars)
  if (uiLanguage && uiLanguage !== 'en') return true;
  
  return false;
};

/**
 * Translates a search query to English using Groq AI.
 * Returns the original text if translation fails.
 */
export const translateToEnglish = async (text: string): Promise<string> => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a search query translator for a video game database. 
Translate the user's search query to English. 
Output ONLY the translated text, nothing else.
If the text is already in English, return it unchanged.
Preserve game names, proper nouns, and abbreviations.`
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 100,
    });

    const translated = completion.choices[0]?.message?.content?.trim();
    
    // Return translated text or fallback to original
    return translated && translated.length > 0 ? translated : text;
    
  } catch (error) {
    console.error("Translation error:", error);
    // On error, proceed with original text
    return text;
  }
};
