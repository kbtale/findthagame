/**
 * api/_utils/searchUtils.ts
 * Shared utilities for search term parsing and stop word filtering.
 */

export const STOP_WORDS = new Set([
  // Articles
  'a', 'an', 'the',
  // Conjunctions
  'and', 'or', 'but', 'nor', 'so', 'yet',
  // Prepositions
  'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'up', 'down',
  'into', 'onto', 'upon', 'out', 'off', 'over', 'under', 'through', 'between',
  'about', 'after', 'before', 'during', 'without', 'within', 'along', 'across',
  // Pronouns
  'i', 'me', 'my', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its',
  'we', 'us', 'our', 'they', 'them', 'their', 'who', 'what', 'which', 'this', 'that',
  // Verbs (common/auxiliary)
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'can', 'get', 'got', 'go', 'goes', 'went', 'come', 'came',
  // Other common words
  'as', 'if', 'when', 'than', 'because', 'while', 'where', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
  'only', 'same', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then',
  // Gaming-specific common words
  'game', 'games', 'edition', 'version', 'vol', 'part'
]);

export const MIN_WORD_LENGTH = 3;

/**
 * Parse search string into meaningful keywords, filtering out stop words and short words.
 * Returns both original words (with punctuation) and stripped versions for maximum matching.
 */
export const parseSearchTerms = (searchString: string): string[] => {
  const rawWords = searchString.toLowerCase().split(/\s+/);
  const result: string[] = [];
  
  for (const word of rawWords) {
    const stripped = word.replace(/[^\w]/g, '');
    
    // Skip if too short or is a stop word (check stripped version)
    if (stripped.length < MIN_WORD_LENGTH || STOP_WORDS.has(stripped)) {
      continue;
    }
    
    // Add original word with punctuation
    if (word.length >= MIN_WORD_LENGTH) {
      result.push(word);
    }
    
    // Add stripped version if different from original
    if (stripped !== word) {
      result.push(stripped);
    }
  }
  
  return [...new Set(result)]; // Remove duplicates
};
