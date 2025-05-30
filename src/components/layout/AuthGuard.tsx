
import { useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

export const AuthGuard = ({ children, requireAuth = true, requireOnboarding = false }: AuthGuardProps) => {
  const { user, userAccount, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const isResetPassword = searchParams.get('reset') === 'true';
  
  useEffect(() => {
    if (loading) return;

    // If this is a password reset flow, don't redirect
    if (location.pathname === "/auth" && isResetPassword) {
      return;
    }
    
    // If auth is required but no user, redirect to auth
    if (requireAuth && !user) {
      navigate("/auth", { replace: true });
      return;
    }

    // If user exists but no account record, redirect to auth
    if (requireAuth && user && !userAccount) {
      navigate("/auth", { replace: true });
      return;
    }

    // If on auth page but already authenticated
    if (!requireAuth && user && userAccount && location.pathname === "/auth") {
      if (!userAccount.onboarding_completed) {
        navigate("/onboarding", { replace: true });
      } else {
        // Store the intended URL if available
        const intendedUrl = searchParams.get('redirect') || "/dashboard";
        navigate(intendedUrl, { replace: true });
      }
      return;
    }

    // If user is authenticated but onboarding not completed, redirect to onboarding
    if (requireAuth && user && userAccount && !userAccount.onboarding_completed) {
      if (location.pathname !== "/onboarding") {
        navigate("/onboarding", { replace: true });
      }
      return;
    }

    // If user is on onboarding but already completed, redirect to dashboard
    if (user && userAccount?.onboarding_completed && location.pathname === "/onboarding") {
      navigate("/dashboard", { replace: true });
      return;
    }

    // If requireOnboarding is true but onboarding not completed, redirect to onboarding
    if (requireOnboarding && user && userAccount && !userAccount.onboarding_completed) {
      navigate("/onboarding", { replace: true });
      return;
    }

  }, [user, userAccount, loading, navigate, requireAuth, requireOnboarding, location.pathname, searchParams, isResetPassword]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Allow access to onboarding page if user is authenticated
  if (location.pathname === "/onboarding" && user && userAccount) {
    return <>{children}</>;
  }

  if (requireAuth && !user) {
    return null;
  }

  if (requireAuth && !userAccount) {
    return null;
  }

  // If onboarding is required but not completed, don't render children
  if (requireOnboarding && userAccount && !userAccount.onboarding_completed) {
    return null;
  }

  return <>{children}</>;
};
