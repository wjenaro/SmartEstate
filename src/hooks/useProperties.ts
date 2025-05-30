
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccountScoping } from "@/hooks/useAccountScoping";

export const useProperties = () => {
  const { scopeQuery, isAuthenticated, currentAccountId } = useAccountScoping();
  
  return useQuery({
    queryKey: ["properties", currentAccountId],
    queryFn: async () => {
      console.log('Fetching properties for account ID:', currentAccountId);
      if (!isAuthenticated) return [];
      
      try {
        // First try with account filtering
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('account_id', currentAccountId);
        
        // If there's an error about the account_id column not existing
        if (error && error.message?.includes('account_id')) {
          console.warn('account_id column may not exist, falling back to unfiltered query');
          
          // Try again without account filtering
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('properties')
            .select('*');
          
          if (fallbackError) {
            console.error('Error in fallback properties fetch:', fallbackError);
            throw fallbackError;
          }
          
          console.log('Properties fetched successfully (unfiltered):', fallbackData);
          return fallbackData || [];
        }
        
        if (error) {
          console.error('Error fetching properties:', error);
          throw error;
        }
        
        console.log('Properties fetched successfully:', data);
        return data || [];
      } catch (error) {
        console.error('Error in properties fetch:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });
};

export const useUnits = (propertyId?: string) => {
  const { scopeQuery, isAuthenticated, currentAccountId, verifyResourceOwnership } = useAccountScoping();
  
  return useQuery({
    queryKey: ["units", propertyId, currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log("No authenticated account found");
        return [];
      }
      
      console.log("Fetching units for account ID:", currentAccountId);
      
      let baseQuery = supabase
        .from("units")
        .select("*, property:properties(account_id)");
      
      // Ensure property belongs to current account
      baseQuery = baseQuery.eq("properties.account_id", currentAccountId);
      
      if (propertyId) {
        baseQuery = baseQuery.eq("property_id", propertyId);
      }
      
      const { data, error } = await baseQuery;
      
      if (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
      
      // Extra security: Filter out any units that don't belong to the current account
      const filteredData = data.filter(unit => 
        verifyResourceOwnership(unit.property?.account_id)
      );
      
      console.log("Units fetched successfully:", filteredData);
      return filteredData;
    },
    enabled: isAuthenticated,
  });
};
