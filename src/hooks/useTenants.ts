import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccountScoping } from './useAccountScoping';
import { useToast } from '@/components/ui/use-toast';

export type Tenant = {
  id: string;
  first_name: string;
  last_name: string;
  status: 'active' | 'inactive' | 'former';
  phone_number?: string;
  unit_id?: string;
  id_number?: string;
  kra_pin?: string;
  gender?: string;
  date_of_birth?: string;
  email?: string;
  entry_date?: string;
  rent_payment_status?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  lease_terms?: string;
  deposit_amount?: number;
  account_id?: string;
  unit?: {
    id: string;
    unit_number: string;
    property_id: string;
    property?: {
      id: string;
      name: string;
    };
  };
};

export function useTenants() {
  const { currentAccountId, isAuthenticated } = useAccountScoping();
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['tenants', currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      try {
        // First try with account filtering
        const { data, error } = await supabase
          .from('tenants')
          .select(`
            *,
            unit:units(
              id, 
              unit_number,
              property_id,
              property:properties(
                id,
                name
              )
            )
          `)
          .eq('account_id', currentAccountId);
        
        if (error) {
          if (error.message?.includes('account_id')) {
            console.warn('account_id column may not exist in tenants table, falling back to unfiltered query');
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('tenants')
              .select(`
                *,
                unit:units(
                  id, 
                  unit_number,
                  property_id,
                  property:properties(
                    id,
                    name
                  )
                )
              `);
            
            if (fallbackError) throw fallbackError;
            return fallbackData || [];
          }
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Error fetching tenants:', error);
        toast({
          title: "Error fetching tenants",
          description: "Please try again later",
          variant: "destructive"
        });
        return [];
      }
    },
    enabled: isAuthenticated,
  });
}

export function useAddTenant() {
  const queryClient = useQueryClient();
  const { createWithAccountId } = useAccountScoping();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (tenant: Omit<Tenant, 'id'>) => {
      // Validate required fields
      if (!tenant.first_name || !tenant.last_name) {
        throw new Error('First name and last name are required');
      }
      
      // Validate email format
      if (tenant.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenant.email)) {
        throw new Error('Invalid email format');
      }
      
      // Validate lease dates chronology
      if (tenant.lease_start_date && tenant.lease_end_date) {
        const startDate = new Date(tenant.lease_start_date);
        const endDate = new Date(tenant.lease_end_date);
        if (startDate >= endDate) {
          throw new Error('Lease end date must be after start date');
        }
      }
      
      // Ensure monetary values have exactly two decimal places
      const depositAmount = tenant.deposit_amount 
        ? Math.round(tenant.deposit_amount * 100) / 100 
        : null;
      
      const newTenant = {
        ...tenant,
        deposit_amount: depositAmount,
        status: tenant.status || 'active'
      };
      
      try {
        return await createWithAccountId('tenants', newTenant, supabase);
      } catch (error: any) {
        console.error('Error adding tenant:', error);
        
        // If the error is about missing account_id column, try direct insert
        if (error.message?.includes('account_id')) {
          console.warn('account_id column may not exist, trying direct insert');
          const { data, error: fallbackError } = await supabase
            .from('tenants')
            .insert(newTenant)
            .select('*');
            
          if (fallbackError) throw fallbackError;
          return data?.[0];
        }
        
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: "Tenant added successfully",
        description: "The tenant has been added to the system",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add tenant",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (tenant: Tenant) => {
      if (!tenant.id) throw new Error('Tenant ID is required');
      
      // Validate email format
      if (tenant.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenant.email)) {
        throw new Error('Invalid email format');
      }
      
      // Validate lease dates chronology
      if (tenant.lease_start_date && tenant.lease_end_date) {
        const startDate = new Date(tenant.lease_start_date);
        const endDate = new Date(tenant.lease_end_date);
        if (startDate >= endDate) {
          throw new Error('Lease end date must be after start date');
        }
      }
      
      // Ensure monetary values have exactly two decimal places
      const depositAmount = tenant.deposit_amount 
        ? Math.round(tenant.deposit_amount * 100) / 100 
        : null;
      
      const updatedTenant = {
        ...tenant,
        deposit_amount: depositAmount,
      };
      
      const { data, error } = await supabase
        .from('tenants')
        .update(updatedTenant)
        .eq('id', tenant.id)
        .select('*');
        
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: "Tenant updated successfully",
        description: "The tenant information has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update tenant",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (tenantId: string) => {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);
        
      if (error) throw error;
      return tenantId;
    },
    onSuccess: (tenantId) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({
        title: "Tenant deleted successfully",
        description: "The tenant has been removed from the system",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete tenant",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });
}
