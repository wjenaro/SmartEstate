import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface UserAccount {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  role: string;
  is_active: boolean;
  is_demo: boolean;
  onboarding_completed: boolean;
  trial_ends_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userAccount: UserAccount | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateUserAccount: (data: Partial<UserAccount>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh the user session
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await fetchUserAccount(data.session.user.id);
      }
    } catch (error) {
      console.error("Session refresh error:", error);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Use setTimeout to prevent potential deadlock
        setTimeout(() => {
          fetchUserAccount(session.user.id);
        }, 0);
      } else {
        setUserAccount(null);
        setLoading(false);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserAccount(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Set up a session refresh timer
    const refreshInterval = setInterval(() => {
      if (supabase.auth.getSession()) {
        refreshSession();
      }
    }, 3600000); // Refresh once per hour

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [refreshSession]);

  const fetchUserAccount = async (authUserId: string) => {
    try {
      // Get the user's email from auth
      const authUser = await supabase.auth.getUser();
      if (!authUser.data?.user?.email) {
        console.error("No email found for auth user");
        setLoading(false);
        return null;
      }

      // Find user account by email
      const { data, error } = await supabase
        .from("user_accounts")
        .select(
          "id,email,first_name,last_name,phone,company_name,role,is_active,is_demo,onboarding_completed,trial_ends_at"
        )
        .eq("email", authUser.data.user.email)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user account:", error);
        setLoading(false);
        return null;
      }

      if (data) {
        setUserAccount(data);
        return data;
      }

      return null;
    } catch (error) {
      console.error("Error fetching user account:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        return result;
      }

      // Check if user has an account record
      if (result.data?.user) {
        const userAccount = await fetchUserAccount(result.data.user.id);

        // If no user account found, create one based on auth data
        if (!userAccount) {
          const userData = {
            email: result.data.user.email || email,
            first_name: result.data.user.user_metadata?.first_name || "User",
            last_name:
              result.data.user.user_metadata?.last_name || email.split("@")[0],
            role: "landlord",
            is_active: true,
            onboarding_completed: false,
          };

          const { error: accountError } = await supabase
            .from("user_accounts")
            .insert(userData)
            .select()
            .single();

          if (accountError) {
            console.error("Error creating missing user account:", accountError);
          } else {
            // Refresh to get the new account
            await fetchUserAccount(result.data.user.id);
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true);
    console.log("Signing up user:", email, userData);

    try {
      // First check if email exists
      const { data: existingAccount } = await supabase
        .from("user_accounts")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingAccount) {
        return {
          data: null,
          error: {
            message: "An account with this email already exists.",
          },
        };
      }

      // Create the auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            is_owner: true,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        console.log("Creating user account for:", authData.user.id);

        // Create user account and organization using a database function
        const { data: result, error: fnError } = await supabase.rpc(
          "create_user_and_org",
          {
            p_email: email,
            p_first_name: userData.first_name,
            p_last_name: userData.last_name,
            p_phone: userData.phone || null,
            p_company_name: userData.company_name || null,
            p_org_name:
              userData.company_name || `${userData.first_name}'s Organization`,
            p_role: userData.role || "landlord",
            p_is_demo: userData.is_demo || false,
          }
        );

        if (fnError) {
          console.error("Error creating account:", fnError);
          throw fnError;
        }

        // Fetch the newly created account
        const { data: accountData, error: fetchError } = await supabase
          .from("user_accounts")
          .select()
          .eq("email", email)
          .single();

        if (fetchError) {
          console.error("Error fetching new account:", fetchError);
          throw fetchError;
        }

        if (accountData) {
          setUserAccount(accountData);
        }
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log("Signing out user");
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserAccount(null);
  };

  const updateUserAccount = async (data: Partial<UserAccount>) => {
    if (!userAccount) {
      console.error("No user account to update");
      return;
    }

    console.log("Updating user account:", data);
    try {
      const { error } = await supabase
        .from("user_accounts")
        .update(data)
        .eq("id", userAccount.id);

      if (!error) {
        const updatedAccount = { ...userAccount, ...data };
        setUserAccount(updatedAccount);
        console.log("User account updated successfully:", updatedAccount);
      } else {
        console.error("Error updating user account:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error updating user account:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth?reset=true",
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userAccount,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateUserAccount,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
