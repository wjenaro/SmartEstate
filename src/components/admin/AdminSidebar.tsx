import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BadgePercent,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface AdminSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

type NavGroup = {
  title: string;
  items: NavItem[];
};

// Admin navigation items - completely separate from client side
const adminNavGroups: NavGroup[] = [
  {
    title: "Platform",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Subscriptions", href: "/admin/subscriptions", icon: BadgePercent },
    ]
  },
  {
    title: "Settings",
    items: [
      { title: "Security", href: "/admin/security", icon: ShieldAlert },
      { title: "System Settings", href: "/admin/settings", icon: Settings },
    ]
  }
];

export function AdminSidebar({ isMobile = false, onClose }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAdminAuth();
  
  return (
    <div 
      className={cn(
        "bg-slate-900 border-r border-slate-800 min-h-screen transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[250px]",
        isMobile ? "h-screen" : ""
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!collapsed && <h2 className="font-bold text-lg text-white">Admin Panel</h2>}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      <div className="p-2">
        {adminNavGroups.map((group, index) => (
          <div key={index} className="mb-6">
            {!collapsed && (
              <h3 className="text-xs uppercase text-slate-400 font-medium ml-3 mb-2">
                {group.title}
              </h3>
            )}
            <nav className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    location.pathname === item.href 
                      ? "bg-slate-800 text-white font-medium" 
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  )}
                  onClick={isMobile ? onClose : undefined}
                >
                  <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "")} />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-slate-300 hover:bg-slate-800/50 hover:text-white",
            collapsed ? "justify-center" : ""
          )}
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
