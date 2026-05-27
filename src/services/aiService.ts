import type { SearchFilters } from '../types';

/**
 * AI Filter Extraction Service
 *
 * In production, replace the body of `extractFiltersFromPrompt` with a call to
 * the Gemini or OpenAI API, passing the user's prompt and your system prompt.
 *
 * Example Gemini stub:
 *   const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json', 'x-goog-api-key': YOUR_API_KEY },
 *     body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt + prompt }] }] }),
 *   });
 *   const data = await response.json();
 *   return JSON.parse(data.candidates[0].content.parts[0].text);
 */
export async function extractFiltersFromPrompt(prompt: string): Promise<SearchFilters> {
  // Simulate AI processing delay
  await new Promise(r => setTimeout(r, 1200));

  const lower = prompt.toLowerCase();
  const filters: SearchFilters = { query: prompt, location: '' };

  // ── Budget extraction ──────────────────────────────────────────────────────
  const budgetMatch = lower.match(/\$?([\d,]+)\s*(?:\/mo|per month|a month|month)?(?:\s*[-–to]+\s*\$?([\d,]+))?/);
  if (budgetMatch) {
    const first = parseInt(budgetMatch[1].replace(',', ''));
    const second = budgetMatch[2] ? parseInt(budgetMatch[2].replace(',', '')) : null;
    if (second) {
      filters.minBudget = Math.min(first, second);
      filters.maxBudget = Math.max(first, second);
    } else if (lower.includes('under') || lower.includes('less than') || lower.includes('max') || lower.includes('up to')) {
      filters.maxBudget = first;
    } else if (lower.includes('at least') || lower.includes('min') || lower.includes('above')) {
      filters.minBudget = first;
    } else {
      filters.maxBudget = first;
    }
  }

  // ── Bedrooms ───────────────────────────────────────────────────────────────
  const bedroomMatch = lower.match(/(\d+)\s*(?:bed(?:room)?s?|br)/);
  if (bedroomMatch) filters.bedrooms = parseInt(bedroomMatch[1]);
  else if (lower.includes('studio')) filters.bedrooms = 0;

  // ── Bathrooms ──────────────────────────────────────────────────────────────
  const bathroomMatch = lower.match(/(\d+)\s*(?:bath(?:room)?s?|ba)/);
  if (bathroomMatch) filters.bathrooms = parseInt(bathroomMatch[1]);

  // ── Amenity keywords ───────────────────────────────────────────────────────
  if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) {
    filters.petsAllowed = true;
  }
  if (lower.includes('park') && !lower.includes('park near')) {
    filters.parkingRequired = true;
  }
  if (lower.includes('utilities included') || lower.includes('all inclusive') || lower.includes('all-inclusive') || lower.includes('utilities')) {
    filters.utilitiesIncluded = true;
  }
  if (lower.includes('furnish')) {
    filters.furnished = true;
  }

  // ── Location ───────────────────────────────────────────────────────────────
  const locationPatterns = [
    /near\s+([\w\s]+(?:university|college|state|u\b)[\w\s]*)/i,
    /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /(?:ohio state|osu)/i,
    /(?:michigan|michigan state|msu)/i,
    /(?:unc|university of north carolina)/i,
  ];
  for (const pattern of locationPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      filters.location = match[1] || match[0];
      break;
    }
  }
  if (!filters.location) {
    // Default to what looks like a city name (capitalized word sequence)
    const cityMatch = prompt.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
    if (cityMatch) filters.location = cityMatch[1];
    else filters.location = 'Columbus, OH';
  }

  return filters;
}
