import React, { createContext, useContext, useState } from 'react';
import type { SearchFilters } from '../types';

/* ── Naive prompt → filters parser (MVP; replaced by real AI later) ────────── */
export function parsePrompt(query: string): SearchFilters {
  const q = query.toLowerCase();
  const filters: SearchFilters = { query, location: '' };

  // Budget
  const budgetMatch = q.match(/\$?([\d,]+)\s*(?:\/mo|per\s*month|a\s*month)?/);
  if (budgetMatch) {
    const amt = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    if (amt > 200 && amt < 15000) filters.maxBudget = amt;
  }

  // Bedrooms
  if (q.includes('studio')) filters.bedrooms = 0;
  else if (q.match(/\b4\s*(?:bed|br|bedroom)/)) filters.bedrooms = 4;
  else if (q.match(/\b3\s*(?:bed|br|bedroom)/)) filters.bedrooms = 3;
  else if (q.match(/\b2\s*(?:bed|br|bedroom)/)) filters.bedrooms = 2;
  else if (q.match(/\b1\s*(?:bed|br|bedroom)/)) filters.bedrooms = 1;

  // Bathrooms
  if (q.match(/\b2\s*(?:bath|ba)/)) filters.bathrooms = 2;
  else if (q.match(/\b1\s*(?:bath|ba)/)) filters.bathrooms = 1;

  // Toggles
  if (q.includes('pet') || q.includes('dog') || q.includes('cat')) filters.petsAllowed = true;
  if (q.includes('parking') || q.includes('garage')) filters.parkingRequired = true;
  if (q.includes('utilities included') || q.includes('all inclusive') || q.includes('all-inclusive'))
    filters.utilitiesIncluded = true;
  if (q.includes('furnished')) filters.furnished = true;

  // Location
  const locMatch = q.match(/(?:near|in|close to|around)\s+([a-z\s]+?)(?:,|\.|$)/);
  if (locMatch) filters.location = locMatch[1].trim();

  return filters;
}

/* ── Context ──────────────────────────────────────────────────────────────── */
interface SearchContextType {
  query: string;
  setQuery: (q: string) => void;
  filters: SearchFilters;
  setFilters: (f: SearchFilters) => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ query: '', location: '' });

  return React.createElement(
    SearchContext.Provider,
    { value: { query, setQuery, filters, setFilters } },
    children
  );
}

export function useSearch(): SearchContextType {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
