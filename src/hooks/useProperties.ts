
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useProperties = () => {
  const { user, userAccount } = useAuth();
  
  return useQuery({
    queryKey: ["properties", userAccount?.id],
    queryFn: async () => {
      if (!user || !userAccount) {
        console.log("No authenticated user or account found");
        return [];
      }
      
      console.log("Fetching properties for account ID:", userAccount.id);
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          units(count)
        `)
        .eq("account_id", userAccount.id);
      
      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
      
      console.log("Properties fetched successfully:", data);
      return data;
    },
    enabled: !!userAccount?.id,
  });
};

export const useUnits = (propertyId?: string) => {
  const { user, userAccount } = useAuth();
  
  return useQuery({
    queryKey: ["units", propertyId, userAccount?.id],
    queryFn: async () => {
      if (!user || !userAccount) {
        console.log("No authenticated user or account found");
        return [];
      }
      
      console.log("Fetching units for account ID:", userAccount.id);
      
      let query = supabase
        .from("units")
        .select("*, property:properties(account_id)")
        .eq("properties.account_id", userAccount.id);
      
      if (propertyId) {
        query = query.eq("property_id", propertyId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
      
      // Filter out any units that don't belong to the current account
      const filteredData = data.filter(unit => unit.property?.account_id === userAccount.id);
      
      console.log("Units fetched successfully:", filteredData);
      return filteredData;
    },
    enabled: !!userAccount?.id,
  });
};
