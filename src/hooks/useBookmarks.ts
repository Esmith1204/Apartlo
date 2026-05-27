import { useState, useEffect, useCallback } from 'react';
import type { Bookmark } from '../types';
import { useAuth } from './useAuth';
import { supabase } from '../services/supabaseClient';

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Fetch bookmarks from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }

    const userId = user.id;

    async function loadBookmarks() {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('apartment_id, saved_at')
          .eq('user_id', userId);

        if (error) {
          throw error;
        }

        if (data) {
          setBookmarks(
            data.map((b: any) => ({
              apartmentId: b.apartment_id,
              savedAt: b.saved_at,
            }))
          );
        }
      } catch (err) {
        console.error('Error loading bookmarks from Supabase:', err);
      }
    }

    loadBookmarks();
  }, [user?.id]);

  const addBookmark = useCallback(async (apartmentId: string): Promise<boolean> => {
    if (!user) return false;

    const savedAt = new Date().toISOString();

    // Optimistic UI update
    setBookmarks(prev => {
      if (prev.some(b => b.apartmentId === apartmentId)) return prev;
      return [...prev, { apartmentId, savedAt }];
    });

    try {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          apartment_id: apartmentId,
          saved_at: savedAt,
        });

      if (error) {
        throw error;
      }
      return true;
    } catch (err) {
      console.error('Error saving bookmark to Supabase:', err);
      // Revert optimistic update
      setBookmarks(prev => prev.filter(b => b.apartmentId !== apartmentId));
      return false;
    }
  }, [user]);

  const removeBookmark = useCallback(async (apartmentId: string) => {
    if (!user) return;

    let previousBookmarks: Bookmark[] = [];

    // Optimistic UI update
    setBookmarks(prev => {
      previousBookmarks = prev;
      return prev.filter(b => b.apartmentId !== apartmentId);
    });

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('apartment_id', apartmentId);

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Error removing bookmark from Supabase:', err);
      // Revert optimistic update on failure
      setBookmarks(previousBookmarks);
    }
  }, [user]);

  const isBookmarked = useCallback((apartmentId: string): boolean => {
    return bookmarks.some(b => b.apartmentId === apartmentId);
  }, [bookmarks]);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
