import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMobileMenu } from "./MainLayout";
import { useAccountScoping } from "@/hooks/useAccountScoping";
import {
  Building,
  Users,
  FileText,
  Home,
  MessageSquare,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  PieChart,
  CreditCard,
  WalletCards,
  Calculator,
  Coins,
  Wrench,
  Droplet,
  LayoutDashboard,
  BadgePercent,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface SidebarProps {
  isMobile?: boolean;
}

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Home },
      { title: "Properties", href: "/properties", icon: Building },
      { title: "Units", href: "/units", icon: Database },
      { title: "Tenants", href: "/tenants", icon: Users },
    ],
  },
  {
    title: "Financials",
    items: [
      { title: "Overview", href: "/financials", icon: Coins },
      { title: "Invoices", href: "/invoices", icon: Receipt },
      { title: "Payments", href: "/payments", icon: WalletCards },
      { title: "Expenses", href: "/expenses", icon: Calculator },
    ],
  },
  {
    title: "Property Management",
    items: [
      { title: "Maintenance", href: "/maintenance", icon: Wrench },
      { title: "Utilities", href: "/utilities", icon: Droplet },
    ],
  },
  {
    title: "Admin",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Users", href: "/admin/users", icon: Users },
      {
        title: "Subscriptions",
        href: "/admin/subscriptions",
        icon: BadgePercent,
      },
      { title: "Security", href: "/admin/security", icon: ShieldAlert },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    title: "Other",
    items: [
      { title: "Messages", href: "/messages", icon: MessageSquare },
      { title: "Reports", href: "/reports", icon: PieChart },
      { title: "Documents", href: "/documents", icon: FileText },
    ],
  },
];

export function Sidebar({ isMobile = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { closeMobileMenu } = useMobileMenu();
  const { isAdmin } = useAccountScoping();

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border min-h-screen transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[250px]",
        isMobile ? "h-screen" : ""
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && <h2 className="font-bold text-lg">KangaMbili</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="p-2">
        {navGroups.map((group, index) => {
          // Skip the Admin group for non-admin users
          if (group.title === "Admin" && !isAdmin) {
            return null;
          }

          return (
            <div key={index} className="mb-6">
              {!collapsed && (
                <h3 className="text-xs uppercase text-sidebar-foreground/60 font-medium ml-3 mb-2">
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
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                    onClick={isMobile ? closeMobileMenu : undefined}
                  >
                    <item.icon
                      className={cn("h-5 w-5", collapsed ? "mx-auto" : "")}
                    />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                ))}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        {!collapsed && (
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        )}
        {collapsed && (
          <Link
            to="/settings"
            className="flex items-center justify-center p-2 rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <Settings className="h-5 w-5" />
          </Link>
        )}
      </div>
    </div>
  );
}
