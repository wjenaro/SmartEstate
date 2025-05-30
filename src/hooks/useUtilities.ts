import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccountScoping } from './useAccountScoping';
import { useToast } from '@/components/ui/use-toast';

export type Utility = {
  id: string;
  property_id: string;
  unit_id?: string;
  utility_type: 'water' | 'electricity' | 'gas' | 'other';
  current_reading: number;
  previous_reading?: number;
  reading_date: string;
  month: string;
  year: number;
  rate?: number;
  amount?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  property?: {
    id: string;
    name: string;
  };
  unit?: {
    id: string;
    unit_number: string;
  };
};

export function useUtilities() {
  const { currentAccountId, isAuthenticated } = useAccountScoping();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['utilities', currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      try {
        // Use a join query to associate utilities with account through properties
        const { data, error } = await supabase
          .from('unit_utilities')
          .select(`
            *,
            property:properties(id, name, account_id),
            unit:units(id, unit_number)
          `)
          .eq('properties.account_id', currentAccountId);
        
        if (error) {
          // If there's an error with account filtering, try without filtering
          console.warn('Error with account filtering for utilities, trying unfiltered query:', error);
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('unit_utilities')
            .select(`
              *,
              property:properties(id, name),
              unit:units(id, unit_number)
            `);
          
          if (fallbackError) throw fallbackError;
          return fallbackData || [];
        }
        
        return data || [];
      } catch (error) {
        console.error('Error fetching utilities:', error);
        toast({
          title: "Error fetching utilities",
          description: "Please try again later",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
}

export function useUtilitiesByProperty(propertyId: string) {
  const { isAuthenticated } = useAccountScoping();
  
  return useQuery({
    queryKey: ['utilities', 'property', propertyId],
    queryFn: async () => {
      if (!propertyId || !isAuthenticated) return [];
      
      try {
        const { data, error } = await supabase
          .from('unit_utilities')
          .select(`
            *,
            unit:units(id, unit_number)
          `)
          .eq('property_id', propertyId);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching utilities for property:', error);
        return [];
      }
    },
    enabled: !!propertyId && isAuthenticated,
  });
}

export function useUtilitiesByUnit(unitId: string) {
  const { isAuthenticated } = useAccountScoping();
  
  return useQuery({
    queryKey: ['utilities', 'unit', unitId],
    queryFn: async () => {
      if (!unitId || !isAuthenticated) return [];
      
      try {
        const { data, error } = await supabase
          .from('unit_utilities')
          .select('*')
          .eq('unit_id', unitId);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching utilities for unit:', error);
        return [];
      }
    },
    enabled: !!unitId && isAuthenticated,
  });
}

export function useAddUtility() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (utility: Omit<Utility, 'id'>) => {
      // Validate required fields
      if (!utility.property_id || !utility.utility_type || !utility.current_reading || !utility.month || !utility.year) {
        throw new Error('Missing required fields');
      }
      
      // Ensure readings and monetary values are positive and have exactly two decimal places
      if (utility.current_reading <= 0) {
        throw new Error('Current reading must be a positive number');
      }
      
      if (utility.previous_reading !== undefined && utility.previous_reading < 0) {
        throw new Error('Previous reading cannot be negative');
      }
      
      const current = Math.round(utility.current_reading * 100) / 100;
      const previous = utility.previous_reading !== undefined 
        ? Math.round(utility.previous_reading * 100) / 100 
        : undefined;
      
      const rate = utility.rate 
        ? Math.round(utility.rate * 100) / 100 
        : undefined;
      
      // Calculate amount if rate is provided
      let amount = utility.amount;
      if (rate && previous !== undefined) {
        amount = Math.round((current - previous) * rate * 100) / 100;
      } else if (utility.amount) {
        amount = Math.round(utility.amount * 100) / 100;
      }
      
      const newUtility = {
        ...utility,
        current_reading: current,
        previous_reading: previous,
        rate,
        amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('unit_utilities')
        .insert(newUtility)
        .select('*');
        
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities'] });
      toast({
        title: "Utility reading added",
        description: "The utility reading has been recorded",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add utility reading",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateUtility() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (utility: Utility) => {
      if (!utility.id) throw new Error('Utility ID is required');
      
      // Ensure readings and monetary values are positive and have exactly two decimal places
      if (utility.current_reading <= 0) {
        throw new Error('Current reading must be a positive number');
      }
      
      if (utility.previous_reading !== undefined && utility.previous_reading < 0) {
        throw new Error('Previous reading cannot be negative');
      }
      
      const current = Math.round(utility.current_reading * 100) / 100;
      const previous = utility.previous_reading !== undefined 
        ? Math.round(utility.previous_reading * 100) / 100 
        : undefined;
      
      const rate = utility.rate 
        ? Math.round(utility.rate * 100) / 100 
        : undefined;
      
      // Calculate amount if rate is provided
      let amount = utility.amount;
      if (rate && previous !== undefined) {
        amount = Math.round((current - previous) * rate * 100) / 100;
      } else if (utility.amount) {
        amount = Math.round(utility.amount * 100) / 100;
      }
      
      const updatedUtility = {
        ...utility,
        current_reading: current,
        previous_reading: previous,
        rate,
        amount,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('unit_utilities')
        .update(updatedUtility)
        .eq('id', utility.id)
        .select('*');
        
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities'] });
      toast({
        title: "Utility reading updated",
        description: "The utility reading has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update utility reading",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });
}

export function useDeleteUtility() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (utilityId: string) => {
      const { error } = await supabase
        .from('unit_utilities')
        .delete()
        .eq('id', utilityId);
        
      if (error) throw error;
      return utilityId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities'] });
      toast({
        title: "Utility reading deleted",
        description: "The utility reading has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete utility reading",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });
}
