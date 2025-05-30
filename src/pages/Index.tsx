
import { Building, DollarSign, Home, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PropertyList } from "@/components/dashboard/PropertyList";
import { DueRents } from "@/components/dashboard/DueRents";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { useDashboardStats } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { AccountBadge } from "@/components/ui/account-badge";
import { useAccountScoping } from "@/hooks/useAccountScoping";

const Index = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAccountScoping();
  
  console.log("Dashboard stats:", stats);
  console.log("Dashboard loading state:", isLoading);
  console.log("Dashboard error:", error);

  if (error) {
    console.error("Dashboard error:", error);
  }

  return (
    <MainLayout>
      <PageWrapper>
        <div className="mb-6">
          <div className="flex items-center mb-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <AccountBadge />
          </div>
          <p className="text-muted-foreground">
            Welcome to your property management system.
          </p>
        </div>
      
        <ResponsiveGrid 
          cols={{ sm: 1, md: 2, lg: 4 }}
          gap="md"
          className="mb-6"
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-6 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))
          ) : error ? (
            <div className="col-span-4 p-6 rounded-lg border text-center text-red-500">
              Error loading dashboard data. Please check console for details.
            </div>
          ) : (
            <>
              <StatsCard 
                title="Total Properties"
                value={stats?.totalProperties?.toString() || "0"}
                icon={<Building className="h-5 w-5 text-blue-600" />}
                description="Properties managed"
              />
              <StatsCard 
                title="Total Units"
                value={stats?.totalUnits?.toString() || "0"}
                icon={<Home className="h-5 w-5 text-indigo-600" />}
                description={`${stats?.occupancyRate || 0}% occupancy rate`}
              />
              <StatsCard 
                title="Active Tenants"
                value={stats?.activeTenants?.toString() || "0"}
                icon={<Users className="h-5 w-5 text-emerald-600" />}
                description="Currently active"
              />
              <StatsCard 
                title="Monthly Revenue"
                value={`KES ${(stats?.monthlyRevenue || 0).toLocaleString()}`}
                icon={<DollarSign className="h-5 w-5 text-amber-600" />}
                description="From paid invoices"
              />
            </>
          )}
        </ResponsiveGrid>
      
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            <div className="bg-card rounded-lg border shadow-sm p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4">Properties</h2>
              <PropertyList />
            </div>
            <div className="bg-card rounded-lg border shadow-sm p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
              <RecentActivities />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border shadow-sm p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4">Due Rents</h2>
              <DueRents />
            </div>
          </div>
        </div>
      </PageWrapper>
    </MainLayout>
  );
};

export default Index;
