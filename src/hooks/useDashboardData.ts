
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      console.log("Fetching dashboard stats from Supabase...");
      
      // Fetch properties count
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("id");
      
      if (propertiesError) {
        console.error("Error fetching properties count:", propertiesError);
        throw propertiesError;
      }

      // Fetch units data
      const { data: units, error: unitsError } = await supabase
        .from("units")
        .select("id, status");
      
      if (unitsError) {
        console.error("Error fetching units:", unitsError);
        throw unitsError;
      }

      // Fetch tenants count
      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, status");
      
      if (tenantsError) {
        console.error("Error fetching tenants:", tenantsError);
        throw tenantsError;
      }

      // Fetch invoices for revenue calculation
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("amount, status")
        .eq("status", "paid");
      
      if (invoicesError) {
        console.error("Error fetching invoices:", invoicesError);
        throw invoicesError;
      }

      const totalProperties = properties?.length || 0;
      const totalUnits = units?.length || 0;
      const occupiedUnits = units?.filter((unit: any) => unit.status === 'occupied').length || 0;
      const activeTenants = tenants?.filter((tenant: any) => tenant.status === 'active').length || 0;
      const monthlyRevenue = invoices?.reduce((sum: number, invoice: any) => sum + (invoice.amount || 0), 0) || 0;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      const stats = {
        totalProperties,
        totalUnits,
        occupiedUnits,
        activeTenants,
        monthlyRevenue,
        occupancyRate
      };

      console.log("Dashboard stats calculated:", stats);
      return stats;
    },
  });
};

export const useRecentProperties = () => {
  return useQuery({
    queryKey: ["recent-properties"],
    queryFn: async () => {
      console.log("Fetching recent properties from Supabase...");
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          units(count)
        `)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching recent properties:", error);
        throw error;
      }
      
      console.log("Recent properties fetched successfully:", data);
      return data;
    },
  });
};

export const useDueRents = () => {
  return useQuery({
    queryKey: ["due-rents"],
    queryFn: async () => {
      console.log("Fetching due rents from Supabase...");
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          tenants(first_name, last_name, units(unit_number, properties(name)))
        `)
        .in("status", ["sent", "overdue"])
        .order("due_date", { ascending: true })
        .limit(10);
      
      if (error) {
        console.error("Error fetching due rents:", error);
        throw error;
      }
      
      console.log("Due rents fetched successfully:", data);
      return data;
    },
  });
};
