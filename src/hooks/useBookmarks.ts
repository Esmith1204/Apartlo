import { useState, useEffect, useCallback } from 'react';
import type { Bookmark } from '../types';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'apartlo_bookmarks';

export function useBookmarks() {
  const { user, isAuthenticated } = useAuth();

  const getStoredBookmarks = (): Bookmark[] => {
    if (!user) return [];
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(getStoredBookmarks);

  useEffect(() => {
    setBookmarks(getStoredBookmarks());
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(bookmarks));
  }, [bookmarks, user?.id]);

  const addBookmark = useCallback((apartmentId: string): boolean => {
    if (!isAuthenticated) return false;
    setBookmarks(prev => {
      if (prev.some(b => b.apartmentId === apartmentId)) return prev;
      return [...prev, { apartmentId, savedAt: new Date().toISOString() }];
    });
    return true;
  }, [isAuthenticated]);

  const removeBookmark = useCallback((apartmentId: string) => {
    setBookmarks(prev => prev.filter(b => b.apartmentId !== apartmentId));
  }, []);

  const isBookmarked = useCallback((apartmentId: string): boolean => {
    return bookmarks.some(b => b.apartmentId === apartmentId);
  }, [bookmarks]);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
