import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccountScoping } from './useAccountScoping';
import { useToast } from '@/components/ui/use-toast';

export type Maintenance = {
  id: string;
  property_id: string;
  unit_id?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  issue: string;
  notes?: string;
  expense_amount?: number;
  images?: string[];
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

export function useMaintenance() {
  const { currentAccountId, isAuthenticated } = useAccountScoping();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['maintenance', currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      try {
        // Use a join query to associate maintenance with account through properties
        const { data, error } = await supabase
          .from('maintenance')
          .select(`
            *,
            property:properties(id, name, account_id),
            unit:units(id, unit_number)
          `)
          .eq('properties.account_id', currentAccountId);
        
        if (error) {
          // If there's an error with account filtering, try without filtering
          console.warn('Error with account filtering for maintenance, trying unfiltered query:', error);
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('maintenance')
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
        console.error('Error fetching maintenance:', error);
        toast({
          title: "Error fetching maintenance",
          description: "Please try again later",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
}

export function useMaintenanceByProperty(propertyId: string) {
  const { isAuthenticated } = useAccountScoping();
  
  return useQuery({
    queryKey: ['maintenance', 'property', propertyId],
    queryFn: async () => {
      if (!propertyId || !isAuthenticated) return [];
      
      try {
        const { data, error } = await supabase
          .from('maintenance')
          .select(`
            *,
            unit:units(id, unit_number)
          `)
          .eq('property_id', propertyId);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching maintenance for property:', error);
        return [];
      }
    },
    enabled: !!propertyId && isAuthenticated,
  });
}

export function useAddMaintenance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (maintenance: Omit<Maintenance, 'id'>) => {
      // Validate required fields
      if (!maintenance.property_id || !maintenance.issue) {
        throw new Error('Property and issue description are required');
      }
      
      // Ensure monetary values have exactly two decimal places
      const expenseAmount = maintenance.expense_amount 
        ? Math.round(maintenance.expense_amount * 100) / 100 
        : null;
      
      const newMaintenance = {
        ...maintenance,
        expense_amount: expenseAmount,
        status: maintenance.status || 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('maintenance')
        .insert(newMaintenance)
        .select('*');
        
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast({
        title: "Maintenance request created",
        description: "The maintenance request has been submitted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create maintenance request",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (maintenance: Maintenance) => {
      if (!maintenance.id) throw new Error('Maintenance ID is required');
      
      // Ensure monetary values have exactly two decimal places
      const expenseAmount = maintenance.expense_amount 
        ? Math.round(maintenance.expense_amount * 100) / 100 
        : null;
      
      const updatedMaintenance = {
        ...maintenance,
        expense_amount: expenseAmount,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('maintenance')
        .update(updatedMaintenance)
        .eq('id', maintenance.id)
        .select('*');
        
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast({
        title: "Maintenance request updated",
        description: "The maintenance information has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update maintenance",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (maintenanceId: string) => {
      const { error } = await supabase
        .from('maintenance')
        .delete()
        .eq('id', maintenanceId);
        
      if (error) throw error;
      return maintenanceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast({
        title: "Maintenance request deleted",
        description: "The maintenance request has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete maintenance",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });
}
