
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProperties = () => {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      console.log("Fetching properties from Supabase...");
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          units(count)
        `);
      
      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
      
      console.log("Properties fetched successfully:", data);
      return data;
    },
  });
};

export const useUnits = (propertyId?: string) => {
  return useQuery({
    queryKey: ["units", propertyId],
    queryFn: async () => {
      console.log("Fetching units from Supabase...");
      let query = supabase.from("units").select("*");
      
      if (propertyId) {
        query = query.eq("property_id", propertyId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching units:", error);
        throw error;
      }
      
      console.log("Units fetched successfully:", data);
      return data;
    },
  });
};
