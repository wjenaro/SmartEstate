import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Hook providing utilities for scoping database queries to the current user's account
 * This ensures proper data isolation across all application features
 */
export function useAccountScoping() {
  const { user, userAccount } = useAuth();
  const { toast } = useToast();
  
  /**
   * Applies account scoping to any Supabase query
   * @param query The Supabase query to scope
   * @returns The scoped query or null if no authenticated account
   */
  const scopeQuery = <T>(query: PostgrestFilterBuilder<any, any, T[], unknown>) => {
    if (!userAccount?.id) {
      console.warn('Attempted to scope a query without an authenticated account');
      return null;
    }
    
    return query.eq('account_id', userAccount.id);
  };
  
  /**
   * Creates data with account_id automatically associated
   * @param tableName The Supabase table name
   * @param data The data to insert
   * @param supabase The Supabase client instance
   * @returns The Supabase query result
   */
  const createWithAccountId = async (
    tableName: string, 
    data: any, 
    supabase: SupabaseClient
  ) => {
    if (!userAccount?.id) {
      const error = new Error('Cannot create data: No authenticated account');
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to perform this action.',
        variant: 'destructive'
      });
      throw error;
    }
    
    // Associate the data with the current account
    const dataWithAccount = {
      ...data,
      account_id: userAccount.id,
      created_by: user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return supabase
      .from(tableName)
      .insert([dataWithAccount])
      .select('*');
  };
  
  /**
   * Verifies that a resource belongs to the current account
   * @param resourceAccountId The account ID of the resource
   * @returns Whether the resource belongs to the current account
   */
  const verifyResourceOwnership = (resourceAccountId: string | null): boolean => {
    if (!userAccount?.id || !resourceAccountId) {
      return false;
    }
    
    return resourceAccountId === userAccount.id;
  };
  
  /**
   * Gets the current account ID or throws if not authenticated
   */
  const getCurrentAccountId = (): string => {
    if (!userAccount?.id) {
      throw new Error('No authenticated account');
    }
    return userAccount.id;
  };
  
  /**
   * Get account type information for display
   */
  const getAccountTypeInfo = () => {
    if (!userAccount) return { type: 'unauthenticated', label: 'Unauthenticated' };
    
    if (userAccount.is_demo) {
      return { 
        type: 'demo', 
        label: 'Demo Account',
        className: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    }
    
    // Check if trial is active
    const isTrialActive = userAccount.trial_ends_at && new Date(userAccount.trial_ends_at) > new Date();
    
    if (isTrialActive) {
      const trialDaysLeft = Math.ceil(
        (new Date(userAccount.trial_ends_at).getTime() - new Date().getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      return { 
        type: 'trial', 
        label: `Trial (${trialDaysLeft} days left)`,
        daysLeft: trialDaysLeft,
        className: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    }
    
    // Default to standard account
    return { 
      type: 'standard', 
      label: 'Standard Account',
      className: 'bg-green-50 text-green-700 border-green-200'
    };
  };

  return {
    scopeQuery,
    createWithAccountId,
    verifyResourceOwnership,
    getCurrentAccountId,
    getAccountTypeInfo,
    isAuthenticated: !!userAccount?.id,
    currentAccountId: userAccount?.id
  };
}
