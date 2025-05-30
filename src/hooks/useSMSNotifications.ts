
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useSMSNotifications = () => {
  const { userAccount } = useAuth();
  
  return useQuery({
    queryKey: ["sms-notifications", userAccount?.id],
    queryFn: async () => {
      if (!userAccount?.id) return [];
      
      const { data, error } = await supabase
        .from("sms_notifications")
        .select(`
          *,
          tenants(first_name, last_name)
        `)
        .eq("user_id", userAccount.id)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userAccount?.id,
  });
};

export const useSendRentReminders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-rent-reminders', {
        body: {}
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-notifications"] });
    },
  });
};

export const useSendCustomSMS = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tenantIds, message }: { tenantIds: string[], message: string }) => {
      // Get tenant phone numbers
      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, phone_number, first_name, last_name")
        .in("id", tenantIds);

      if (tenantsError) throw tenantsError;

      // Send SMS to each tenant (in a real app, this would be batched)
      const promises = tenants
        .filter(tenant => tenant.phone_number)
        .map(async (tenant) => {
          // Store SMS notification
          return supabase
            .from("sms_notifications")
            .insert({
              tenant_id: tenant.id,
              phone_number: tenant.phone_number,
              message: message,
              type: "general"
            });
        });

      await Promise.all(promises);
      
      // TODO: Send actual SMS via AfricaTalking API
      console.log('Would send SMS to tenants:', tenants.map(t => t.phone_number), 'Message:', message);

      return { sent: tenants.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-notifications"] });
    },
  });
};
