import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBookmarks = () => {
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const eventIds = new Set(data?.map(bookmark => bookmark.event_id) || []);
      setBookmarkedEvents(eventIds);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to bookmark events",
          variant: "destructive"
        });
        return;
      }

      const isBookmarked = bookmarkedEvents.has(eventId);

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        if (error) throw error;

        setBookmarkedEvents(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });

        toast({
          title: "Bookmark removed",
          description: "Event removed from your bookmarks"
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            user_id: user.id,
            event_id: eventId
          });

        if (error) throw error;

        setBookmarkedEvents(prev => new Set([...prev, eventId]));

        toast({
          title: "Event bookmarked",
          description: "Event added to your bookmarks"
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive"
      });
    }
  };

  const isBookmarked = (eventId: string) => bookmarkedEvents.has(eventId);

  return {
    isBookmarked,
    toggleBookmark,
    loading
  };
};