
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccountScoping } from "@/hooks/useAccountScoping";

export const useProperties = () => {
  const { scopeQuery, isAuthenticated, currentAccountId } = useAccountScoping();
  
  return useQuery({
    queryKey: ["properties", currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log("No authenticated account found");
        return [];
      }
      
      console.log("Fetching properties for account ID:", currentAccountId);
      
      const baseQuery = supabase
        .from("properties")
        .select(`
          *,
          units(count)
        `);
      
      const query = scopeQuery(baseQuery);
      if (!query) return [];
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
      
      console.log("Properties fetched successfully:", data);
      return data;
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
