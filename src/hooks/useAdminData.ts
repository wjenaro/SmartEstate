import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccountScoping } from './useAccountScoping';

// Admin Dashboard Stats Interface
export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  growthRate: number;
  totalProperties: number;
  totalUnits: number;
  activeTenants: number;
  demoAccounts: number;
  monthlyChange: {
    users: number;
    revenue: number;
    subscriptions: number;
    growthRate: number;
  };
}

// User Management Interface
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  properties: number;
  joinDate: string;
  role: string;
  is_demo: boolean;
  last_login: string;
}

// Subscription Plan Interface
export interface SubscriptionPlan {
  plan: string;
  users: number;
  percentage: number;
  color: string;
}

// Payment Transaction Interface
export interface PaymentTransaction {
  id: string;
  user: string;
  email: string;
  amount: number;
  status: string;
  date: string;
  plan: string;
  method: string;
}

// Hook for fetching admin dashboard stats
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAccountScoping();

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) {
        setError("Unauthorized access");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch total users count
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        // Fetch active subscriptions count
        const { count: subsCount, error: subsError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        if (subsError) throw subsError;

        // Fetch total properties count
        const { count: propsCount, error: propsError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });

        if (propsError) throw propsError;

        // Fetch total units count
        const { count: unitsCount, error: unitsError } = await supabase
          .from('units')
          .select('*', { count: 'exact', head: true });

        if (unitsError) throw unitsError;

        // Fetch total tenants count
        const { count: tenantsCount, error: tenantsError } = await supabase
          .from('tenants')
          .select('*', { count: 'exact', head: true });

        if (tenantsError) throw tenantsError;

        // Fetch demo accounts count
        const { count: demoCount, error: demoError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_demo', true);

        if (demoError) throw demoError;

        // Fetch total revenue (sum of all transactions)
        const { data: revenueData, error: revenueError } = await supabase
          .from('payment_transactions')
          .select('amount')
          .eq('status', 'completed');

        if (revenueError) throw revenueError;

        const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

        // Calculate previous month stats for comparison
        const prevMonthDate = new Date();
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const prevMonthStart = prevMonthDate.toISOString().split('T')[0];

        // Previous month users
        const { count: prevUsersCount, error: prevUsersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', prevMonthStart);

        if (prevUsersError) throw prevUsersError;

        // Previous month subscriptions
        const { count: prevSubsCount, error: prevSubsError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .lt('created_at', prevMonthStart);

        if (prevSubsError) throw prevSubsError;

        // Calculate month-over-month changes
        const userChange = prevUsersCount ? ((usersCount! - prevUsersCount) / prevUsersCount) * 100 : 0;
        const subscriptionChange = prevSubsCount ? ((subsCount! - prevSubsCount) / prevSubsCount) * 100 : 0;
        
        // Approximate growth rate (simplified calculation)
        const growthRate = userChange;

        setStats({
          totalUsers: usersCount || 0,
          totalRevenue,
          activeSubscriptions: subsCount || 0,
          growthRate,
          totalProperties: propsCount || 0,
          totalUnits: unitsCount || 0,
          activeTenants: tenantsCount || 0,
          demoAccounts: demoCount || 0,
          monthlyChange: {
            users: userChange,
            revenue: 8, // Placeholder - would need historical revenue data for accurate calculation
            subscriptions: subscriptionChange,
            growthRate: growthRate - 15 // Placeholder - simplified comparison
          }
        });

      } catch (err: any) {
        console.error('Error fetching admin stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  return { stats, loading, error };
}

// Hook for fetching users for admin management
export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAccountScoping();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) {
        setError("Unauthorized access");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch users with their subscription plans and property counts
        const { data, error: usersError } = await supabase
          .from('users')
          .select(`
            id,
            first_name,
            last_name,
            email,
            role,
            is_demo,
            created_at,
            last_login_at,
            status,
            subscriptions(plan_type),
            properties(id)
          `);

        if (usersError) throw usersError;

        // Transform data to match AdminUser interface
        const transformedUsers = data?.map(user => {
          return {
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User',
            email: user.email,
            plan: user.subscriptions?.[0]?.plan_type || 'Free',
            status: user.status || 'inactive',
            properties: Array.isArray(user.properties) ? user.properties.length : 0,
            joinDate: new Date(user.created_at).toISOString().split('T')[0],
            role: user.role || 'user',
            is_demo: user.is_demo || false,
            last_login: user.last_login_at 
              ? new Date(user.last_login_at).toISOString().split('T')[0] 
              : 'Never'
          };
        }) || [];

        setUsers(transformedUsers);
      } catch (err: any) {
        console.error('Error fetching admin users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  return { users, loading, error };
}

// Hook for fetching subscription plan distribution
export function useSubscriptionDistribution() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAccountScoping();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!isAdmin) {
        setError("Unauthorized access");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch subscription counts by plan type
        const { data, error: subsError } = await supabase
          .from('subscriptions')
          .select('plan_type')
          .eq('status', 'active');

        if (subsError) throw subsError;

        // Count subscriptions by plan type
        const planCounts: Record<string, number> = {};
        data?.forEach(sub => {
          const plan = sub.plan_type || 'Unknown';
          planCounts[plan] = (planCounts[plan] || 0) + 1;
        });

        // Calculate total subscriptions
        const totalSubs = Object.values(planCounts).reduce((sum, count) => sum + count, 0);

        // Define colors for each plan
        const planColors: Record<string, string> = {
          'free': 'bg-gray-500',
          'starter': 'bg-blue-500',
          'professional': 'bg-green-500',
          'enterprise': 'bg-purple-500',
          'demo': 'bg-yellow-500'
        };

        // Transform data to match SubscriptionPlan interface
        const transformedData = Object.entries(planCounts).map(([plan, users]) => {
          const percentage = totalSubs > 0 ? Math.round((users / totalSubs) * 100) : 0;
          return {
            plan,
            users,
            percentage,
            color: planColors[plan.toLowerCase()] || 'bg-gray-400'
          };
        });

        setSubscriptionData(transformedData);
      } catch (err: any) {
        console.error('Error fetching subscription distribution:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [isAdmin]);

  return { subscriptionData, loading, error };
}

// Hook for fetching payment transactions
export function usePaymentTransactions() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAccountScoping();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isAdmin) {
        setError("Unauthorized access");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch payment transactions with user details
        const { data, error: transError } = await supabase
          .from('payment_transactions')
          .select(`
            id,
            amount,
            status,
            created_at,
            payment_method,
            subscription_plan,
            users(first_name, last_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (transError) throw transError;

        // Transform data to match PaymentTransaction interface
        const transformedTransactions = data?.map(trans => {
          const user = trans.users || {};
          return {
            id: trans.id,
            user: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
            email: user.email || 'unknown@email.com',
            amount: trans.amount || 0,
            status: trans.status || 'pending',
            date: new Date(trans.created_at).toISOString().split('T')[0],
            plan: trans.subscription_plan || 'Unknown Plan',
            method: trans.payment_method || 'Unknown'
          };
        }) || [];

        setTransactions(transformedTransactions);
      } catch (err: any) {
        console.error('Error fetching payment transactions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isAdmin]);

  return { transactions, loading, error };
}

// Hook for admin actions (ban user, approve account, etc)
export function useAdminActions() {
  const { toast } = useToast();
  const { isAdmin } = useAccountScoping();

  const banUser = async (userId: string) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized action",
        description: "You don't have permission to perform this action",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'banned', banned_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User banned",
        description: "User has been banned successfully",
      });
      return true;
    } catch (err: any) {
      console.error('Error banning user:', err);
      toast({
        title: "Action failed",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const activateUser = async (userId: string) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized action",
        description: "You don't have permission to perform this action",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'active', banned_at: null })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User activated",
        description: "User has been activated successfully",
      });
      return true;
    } catch (err: any) {
      console.error('Error activating user:', err);
      toast({
        title: "Action failed",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized action",
        description: "You don't have permission to perform this action",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User promoted",
        description: "User has been promoted to admin successfully",
      });
      return true;
    } catch (err: any) {
      console.error('Error promoting user:', err);
      toast({
        title: "Action failed",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return { banUser, activateUser, promoteToAdmin };
}

// Function for importing any hook modules needed by the toast hook
export function useToast() {
  return {
    toast: (params: any) => {
      console.log('Toast:', params);
      // Implement your toast functionality here
    }
  };
}
