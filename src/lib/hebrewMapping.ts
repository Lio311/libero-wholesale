import { db } from './db';
import { searchMappings } from './db/schema';
import { desc } from 'drizzle-orm';

let mappingsCache: { hebrewTerm: string; englishTerm: string }[] = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getHebrewMappings() {
  const now = Date.now();
  if (mappingsCache.length === 0 || now - lastCacheUpdate > CACHE_DURATION) {
    try {
      // Sort by length descending to implement longest-match-first replacement
      const mappings = await db.select().from(searchMappings);
      mappingsCache = mappings.sort((a, b) => b.hebrewTerm.length - a.hebrewTerm.length);
      lastCacheUpdate = now;
    } catch (error) {
      console.error('Failed to fetch hebrew mappings:', error);
      // Fallback to cache if error occurs, even if expired, or return empty
      return mappingsCache;
    }
  }
  return mappingsCache;
}

export async function mapHebrewQuery(query: string): Promise<string> {
  if (!query) return query;

  const mappings = await getHebrewMappings();
  
  // Direct match (High Priority)
  const exactMatch = mappings.find(m => m.hebrewTerm === query.trim());
  if (exactMatch) {
    return exactMatch.englishTerm;
  }

  // Sequential Partial Replacement
  let translatedQuery = query;
  
  for (const mapping of mappings) {
    // Boundary pattern respects Hebrew Unicode boundaries (\u0590-\u05FF)
    const boundaryPattern = `[^a-zA-Z0-9\\u0590-\\u05FF]`;
    const regex = new RegExp(
      `(^|${boundaryPattern})${mapping.hebrewTerm}(?=${boundaryPattern}|$)`, 'gu'
    );
    
    translatedQuery = translatedQuery.replace(regex, `$1${mapping.englishTerm}`);
  }

  return translatedQuery.trim();
}
