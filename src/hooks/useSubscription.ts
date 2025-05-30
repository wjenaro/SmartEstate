
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUserSubscription = () => {
  const { userAccount } = useAuth();
  
  return useQuery({
    queryKey: ["user-subscription", userAccount?.id],
    queryFn: async () => {
      if (!userAccount?.id) return null;
      
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          subscription_plans(*)
        `)
        .eq("user_id", userAccount.id)
        .eq("status", "active")
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!userAccount?.id,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { userAccount } = useAuth();

  return useMutation({
    mutationFn: async ({ planId, paymentMethod, paymentReference }: {
      planId: string;
      paymentMethod: string;
      paymentReference: string;
    }) => {
      if (!userAccount?.id) throw new Error("User not authenticated");

      // Get the plan details
      const { data: plan, error: planError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (planError) throw planError;

      // Create subscription
      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + (plan.billing_interval === 'yearly' ? 12 : 1));

      const { data: subscription, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userAccount.id,
          plan_id: planId,
          status: "active",
          current_period_start: currentDate.toISOString(),
          current_period_end: endDate.toISOString(),
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          amount_paid: plan.price,
          next_billing_date: endDate.toISOString(),
        })
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Create payment transaction
      await supabase
        .from("payment_transactions")
        .insert({
          user_id: userAccount.id,
          subscription_id: subscription.id,
          amount: plan.price,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          status: "completed",
          processed_at: new Date().toISOString(),
        });

      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
    },
  });
};

export const usePaymentTransactions = () => {
  const { userAccount } = useAuth();
  
  return useQuery({
    queryKey: ["payment-transactions", userAccount?.id],
    queryFn: async () => {
      if (!userAccount?.id) return [];
      
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("user_id", userAccount.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userAccount?.id,
  });
};
