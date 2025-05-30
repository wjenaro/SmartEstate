
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      console.log("Fetching expenses from Supabase...");
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          properties(name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }
      
      console.log("Expenses fetched successfully:", data);
      return data;
    },
  });
};
