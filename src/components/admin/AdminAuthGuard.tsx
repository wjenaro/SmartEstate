
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface AdminAuthGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export const AdminAuthGuard = ({ children, requiredPermissions = [] }: AdminAuthGuardProps) => {
  const { user, adminUser, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    console.log('AdminAuthGuard - Current path:', location.pathname);
    console.log('AdminAuthGuard - User:', user ? 'exists' : 'null');
    console.log('AdminAuthGuard - AdminUser:', adminUser);

    // If no user or admin user, redirect to admin login
    if (!user || !adminUser) {
      console.log('AdminAuthGuard - Redirecting to admin login');
      navigate("/admin/login", { replace: true });
      return;
    }

    // Check permissions if required
    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every(permission => 
        adminUser.permissions.includes(permission) || adminUser.role === 'super_admin'
      );
      
      if (!hasPermission) {
        console.log('AdminAuthGuard - Insufficient permissions');
        navigate("/admin/unauthorized", { replace: true });
        return;
      }
    }
  }, [user, adminUser, loading, navigate, location.pathname, requiredPermissions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !adminUser) {
    return null;
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every(permission => 
      adminUser.permissions.includes(permission) || adminUser.role === 'super_admin'
    );
    
    if (!hasPermission) {
      return null;
    }
  }

  return <>{children}</>;
};
