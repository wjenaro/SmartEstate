import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAccountScoping } from './useAccountScoping';

/**
 * Hook to subscribe to real-time updates for a specific table
 * @param tableName The Supabase table to subscribe to
 * @param queryKey The React Query key to invalidate on changes
 */
export function useRealTimeSubscription(
  tableName: string,
  queryKey: string | string[]
) {
  const queryClient = useQueryClient();
  const { currentAccountId, isAdmin } = useAccountScoping();
  
  useEffect(() => {
    if (!currentAccountId && !isAdmin) return;
    
    // Normalize query key to array format
    const normalizedQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
    
    console.log(`Setting up real-time subscription for ${tableName}`);
    
    // Set up real-time subscription
    const subscription = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: tableName,
      }, (payload) => {
        console.log(`Real-time update for ${tableName}:`, payload);
        
        // Check if the record belongs to the current account (if not an admin)
        if (!isAdmin && payload.new && typeof payload.new === 'object' && 'account_id' in payload.new) {
          if (payload.new.account_id !== currentAccountId) {
            return;
          }
        }
        
        // Invalidate the specific query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: normalizedQueryKey });
      })
      .subscribe();
    
    // Clean up subscription on unmount
    return () => {
      console.log(`Cleaning up real-time subscription for ${tableName}`);
      subscription.unsubscribe();
    };
  }, [tableName, queryKey, currentAccountId, isAdmin, queryClient]);
}
