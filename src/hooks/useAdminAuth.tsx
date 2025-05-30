
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { directAdminAuth, getAdminSession, clearAdminSession, setAdminPassword } from '@/lib/direct-admin-auth';
import { exists } from 'fs';

interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'support';
  permissions: string[];
  created_at: string;
}

// Custom error type that matches AuthError structure
type CustomAuthError = {
  message: string;
  status?: number;
  [key: string]: any;
};

interface AdminSignInResult {
  data: any;
  error: AuthError | CustomAuthError | null;
}

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AdminSignInResult>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateAdminPassword: (email: string, newPassword: string) => Promise<{
    error: CustomAuthError | null;
  }>;
  error: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // On mount, check for existing admin session
  useEffect(() => {
    const adminSession = getAdminSession();
    if (adminSession) {
      setUser(adminSession.user as unknown as User);
      setSession(adminSession as unknown as Session);
      fetchAdminUser(adminSession.user.id);
    } else {
      setLoading(false);
    }
  }, []);

  // Function to refresh the admin session
  const refreshSession = useCallback(async () => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      if (data.session?.user) {
        await fetchAdminUser(data.session.user.id);
      }
    } catch (err) {
      console.error('Error refreshing admin session:', err);
      setError('Session refresh failed. Please log in again.');
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchAdminUser(session.user.id);
          }, 0);
        } else {
          setAdminUser(null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAdminUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Set up a session refresh timer
    const refreshInterval = setInterval(() => {
      if (session) {
        refreshSession();
      }
    }, 3600000); // Refresh once per hour

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [refreshSession]);

  const fetchAdminUser = async (authUserId: string) => {
    try {
      setError(null);
      
      // First try to get by auth_user_id
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching admin user:', error);
        setAdminUser(null);
        setLoading(false);
        setError('Error accessing admin account.');
        return null;
      }

      if (data) {
        const adminUserData: AdminUser = {
          id: data.id,
          email: data.email,
          role: data.role as 'super_admin' | 'admin' | 'support',
          permissions: data.permissions || [],
          created_at: data.created_at
        };
        setAdminUser(adminUserData);
        return adminUserData;
      } 
      
      // If not found by auth_user_id, try by email
      const authUser = await supabase.auth.getUser();
      if (authUser.data?.user?.email) {
        const { data: emailData, error: emailError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', authUser.data.user.email)
          .eq('is_active', true)
          .single();
        
        if (!emailError && emailData) {
          // Link the admin account by updating auth_user_id
          await supabase
            .from('admin_users')
            .update({ auth_user_id: authUserId })
            .eq('id', emailData.id);
          
          const adminUserData: AdminUser = {
            id: emailData.id,
            email: emailData.email,
            role: emailData.role as 'super_admin' | 'admin' | 'support',
            permissions: emailData.permissions || [],
            created_at: emailData.created_at
          };
          
          setAdminUser(adminUserData);
          return adminUserData;
        }
      }
      
      setAdminUser(null);
      return null;
    } catch (error) {
      console.error('Error fetching admin user:', error);
      setAdminUser(null);
      setError('Error verifying admin credentials.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AdminSignInResult> => {
    setLoading(true);
    setError(null);
    
    try {
      // First try our direct authentication method
      const directResult = await directAdminAuth(email, password);
      
      if (directResult.success) {
        // Set the user and session from the direct auth result
        // Convert the custom user object to User type safely through unknown
        setUser(directResult.data.user as unknown as User);
        setSession(directResult.data.session as unknown as Session);
        
        // Fetch the admin user details
        const adminUserData = await fetchAdminUser(directResult.data.user.id);
        
        if (!adminUserData) {
          setError('Failed to retrieve admin user details.');
          return { 
            data: {}, 
            error: { message: 'Failed to retrieve admin user details.' } 
          };
        }
        
        return { data: directResult.data, error: null };
      }
      
      // If direct auth fails, try Supabase auth as fallback
      try {
        const result = await supabase.auth.signInWithPassword({ email, password });
        
        if (result.error) {
          setError(result.error.message);
          return result as AdminSignInResult;
        }
        
        if (!result.data.user) {
          setError('Authentication failed.');
          return { data: {}, error: { message: 'Authentication failed' } };
        }
        
        // Now verify this user is an admin
        const adminUser = await fetchAdminUser(result.data.user.id);
        
        if (!adminUser) {
          // User authenticated but is not an admin, sign them out
          await supabase.auth.signOut();
          setError('You do not have administrator privileges.');
          return { 
            data: {}, 
            error: { message: 'You do not have administrator privileges.' } 
          };
        }
        
        return result as AdminSignInResult;
      } catch (supabaseError) {
        // If both auth methods fail, return the original error
        console.error('Supabase auth fallback error:', supabaseError);
        return { 
          data: directResult.data || {}, 
          error: directResult.error || { message: 'Authentication failed' } 
        };
      }
    } catch (error) {
      console.error('Admin sign in error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      return { data: {}, error: { message: 'Authentication failed' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('Admin signing out');
    // Clear both the Supabase session and our custom admin session
    await supabase.auth.signOut();
    clearAdminSession();
    setUser(null);
    setSession(null);
    setAdminUser(null);
  };

  // Function to set/update admin password
  const updateAdminPassword = async (email: string, newPassword: string): Promise<{ error: CustomAuthError | null }> => {
    try {
      setError(null);
      const result = await setAdminPassword(email, newPassword);
      if (!result.success) {
        setError('Failed to update password');
        return { error: { message: 'Failed to update password' } };
      }
      return { error: null };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update password');
      return { error: { message: 'Failed to update password' } };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        adminUser,
        loading,
        signIn,
        signOut,
        refreshSession,
        updateAdminPassword,
        error,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
