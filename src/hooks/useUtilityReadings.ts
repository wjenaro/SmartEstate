import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccountScoping } from "@/hooks/useAccountScoping";

/**
 * Hook to fetch utility readings with proper account isolation
 */
export const useUtilityReadings = () => {
  const { scopeQuery, isAuthenticated, currentAccountId } = useAccountScoping();
  
  return useQuery({
    queryKey: ["utility_readings", currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log("No authenticated account found");
        return [];
      }
      
      console.log("Fetching utility readings for account ID:", currentAccountId);
      
      const baseQuery = supabase
        .from("utility_readings")
        .select(`
          *,
          property:properties(name, account_id),
          unit:units(unit_number)
        `);
      
      const query = scopeQuery(baseQuery);
      if (!query) return [];
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching utility readings:", error);
        throw error;
      }
      
      // Extra security: Filter out any readings that don't belong to the current account
      const formattedData = data
        .filter(reading => reading.property?.account_id === currentAccountId)
        .map(reading => ({
          id: reading.id,
          property: reading.property?.name || 'Unknown Property',
          unit: reading.unit?.unit_number || 'Unknown Unit',
          utility_type: reading.utility_type,
          current_reading: reading.current_reading,
          previous_reading: reading.previous_reading,
          reading_date: reading.reading_date,
          month: new Date(reading.reading_date).toLocaleString('default', { month: 'long' }),
          year: new Date(reading.reading_date).getFullYear(),
          rate: reading.rate,
          amount: reading.amount,
          property_id: reading.property_id,
          unit_id: reading.unit_id,
          account_id: reading.account_id
        }));
      
      console.log("Utility readings fetched successfully:", formattedData);
      return formattedData;
    },
    enabled: isAuthenticated,
  });
};

/**
 * Hook to fetch all properties with rates for utility readings
 */
export const usePropertiesWithRates = () => {
  const { scopeQuery, isAuthenticated, currentAccountId } = useAccountScoping();
  
  return useQuery({
    queryKey: ["properties_with_rates", currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log("No authenticated account found");
        return [];
      }
      
      const baseQuery = supabase
        .from("properties")
        .select("id, name, water_rate, electricity_rate");
      
      const query = scopeQuery(baseQuery);
      if (!query) return [];
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching properties with rates:", error);
        throw error;
      }
      
      return data;
    },
    enabled: isAuthenticated,
  });
};

/**
 * Hook to fetch units for a specific property or all units
 */
export const useUnitsForUtilities = (propertyId?: string) => {
  const { scopeQuery, isAuthenticated, currentAccountId } = useAccountScoping();
  
  return useQuery({
    queryKey: ["units_for_utilities", propertyId, currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log("No authenticated account found");
        return [];
      }
      
      let baseQuery = supabase
        .from("units")
        .select("id, unit_number, property_id, property:properties(account_id)");
      
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
      
      return data;
    },
    enabled: isAuthenticated,
  });
};
