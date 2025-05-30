
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccountScoping } from "@/hooks/useAccountScoping";

export const useDashboardStats = () => {
  const { isAuthenticated, currentAccountId } = useAccountScoping();

  return useQuery({
    queryKey: ["dashboard-stats", currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log("Not authenticated, returning empty stats");
        return {
          totalProperties: 0,
          totalUnits: 0,
          occupiedUnits: 0,
          activeTenants: 0,
          monthlyRevenue: 0,
          occupancyRate: 0
        };
      }

      console.log("Fetching dashboard stats for account ID:", currentAccountId);
      
      // Fetch properties count for this account
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("id")
        .eq("account_id", currentAccountId);
      
      if (propertiesError) {
        console.error("Error fetching properties count:", propertiesError);
        throw propertiesError;
      }

      // Fetch units data for this account
      const { data: units, error: unitsError } = await supabase
        .from("units")
        .select("id, status")
        .eq("account_id", currentAccountId);
      
      if (unitsError) {
        console.error("Error fetching units:", unitsError);
        throw unitsError;
      }

      // Fetch tenants count for this account
      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, status")
        .eq("account_id", currentAccountId);
      
      if (tenantsError) {
        console.error("Error fetching tenants:", tenantsError);
        throw tenantsError;
      }

      // Fetch invoices for revenue calculation for this account
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("amount, status")
        .eq("status", "paid")
        .eq("account_id", currentAccountId);
      
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
  const { isAuthenticated, currentAccountId } = useAccountScoping();

  return useQuery({
    queryKey: ["recent-properties", currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log("Not authenticated, returning empty properties list");
        return [];
      }

      console.log("Fetching recent properties for account ID:", currentAccountId);
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          units(count)
        `)
        .eq("account_id", currentAccountId)
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
  const { isAuthenticated, currentAccountId } = useAccountScoping();

  return useQuery({
    queryKey: ["due-rents", currentAccountId],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log("Not authenticated, returning empty due rents list");
        return [];
      }

      console.log("Fetching due rents for account ID:", currentAccountId);
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          tenants(first_name, last_name, units(unit_number, properties(name)))
        `)
        .eq("account_id", currentAccountId)
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
