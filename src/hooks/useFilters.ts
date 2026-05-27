import { useState, useEffect, useCallback } from 'react';
import type { SearchFilters } from '../types';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'apartlo_filters';

const defaultFilters: SearchFilters = {
  query: '',
  location: '',
};

export function useFilters() {
  const { user } = useAuth();

  const getStoredFilters = (): SearchFilters => {
    if (!user) return defaultFilters;
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      return stored ? JSON.parse(stored) : defaultFilters;
    } catch {
      return defaultFilters;
    }
  };

  const [filters, setFiltersState] = useState<SearchFilters>(getStoredFilters);

  useEffect(() => {
    setFiltersState(getStoredFilters());
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(filters));
  }, [filters, user?.id]);

  const setFilters = useCallback((newFilters: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => {
    setFiltersState(newFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const updateFilter = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
  }, []);

  return { filters, setFilters, resetFilters, updateFilter };
}
