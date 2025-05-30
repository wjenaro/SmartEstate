import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccountScoping } from "@/hooks/useAccountScoping";

// Define types for Supabase response
type SupabaseProperty = {
  name: string;
  account_id: string;
};

type SupabaseUnit = {
  unit_number: string;
};

type SupabaseUtilityReading = {
  id: string;
  property_id: string;
  unit_id: string;
  utility_type: string; // 'water' | 'electricity'
  current_reading: number;
  previous_reading: number | null;
  reading_date: string;
  month: string;
  year: number;
  rate: number | null;
  amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  properties?: SupabaseProperty;
  units?: SupabaseUnit;
};

// Define types for utility readings after formatting
interface UtilityReading {
  id: string;
  property_id: string;
  unit_id: string;
  property: string; // Property name
  unit: string; // Unit number
  utility_type: 'water' | 'electricity';
  current_reading: number;
  previous_reading: number;
  reading_date: string;
  month: string;
  year: number;
  rate: number;
  amount: number;
}

/**
 * Hook to fetch utility readings with proper account isolation
 */
export const useUtilityReadings = () => {
  const { isAuthenticated, currentAccountId } = useAccountScoping();
  
  return useQuery<UtilityReading[]>({
    queryKey: ["unit_utilities", currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log("No authenticated account found");
        return [];
      }
      
      console.log("Fetching utility readings for account ID:", currentAccountId);
      
      try {
        // We need to join unit_utilities with properties to filter by account_id
        const { data, error } = await supabase
          .from('unit_utilities')
          .select(`
            id,
            property_id,
            unit_id,
            utility_type,
            current_reading,
            previous_reading,
            reading_date,
            month,
            year,
            rate,
            amount,
            properties:property_id(name, account_id),
            units:unit_id(unit_number)
          `);
        
        if (error) {
          console.error("Error fetching utility readings:", error);
          throw error;
        }
        
        if (!data || !Array.isArray(data)) {
          console.log("No utility readings data found");
          return [];
        }
        
        // Cast the data to the correct type
        const typedData = data as unknown as SupabaseUtilityReading[];
        
        // Filter readings by account
        const formattedData = typedData
          .filter(reading => {
            // Skip if properties is not available
            if (!reading.properties) return false;
            
            // Check if the property belongs to the current account
            return reading.properties.account_id === currentAccountId;
          })
          .map(reading => ({
            id: reading.id || '',
            property_id: reading.property_id || '',
            unit_id: reading.unit_id || '',
            property: reading.properties?.name || 'Unknown Property',
            unit: reading.units?.unit_number || 'Unknown Unit',
            utility_type: reading.utility_type || 'water',
            current_reading: typeof reading.current_reading === 'number' ? reading.current_reading : 0,
            previous_reading: typeof reading.previous_reading === 'number' ? reading.previous_reading : 0,
            reading_date: reading.reading_date || new Date().toISOString(),
            month: reading.month || new Date(reading.reading_date || new Date()).toLocaleString('default', { month: 'long' }),
            year: reading.year || new Date(reading.reading_date || new Date()).getFullYear(),
            rate: typeof reading.rate === 'number' ? reading.rate : 0,
            amount: typeof reading.amount === 'number' ? reading.amount : 0
          }));
        
        console.log("Utility readings fetched successfully:", formattedData);
        return formattedData;
      } catch (error) {
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
