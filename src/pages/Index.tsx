
import { Building, DollarSign, Home, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PropertyList } from "@/components/dashboard/PropertyList";
import { DueRents } from "@/components/dashboard/DueRents";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { useDashboardStats } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  
  console.log("Dashboard stats:", stats);
  console.log("Dashboard loading state:", isLoading);
  console.log("Dashboard error:", error);

  if (error) {
    console.error("Dashboard error:", error);
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your property management system.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <PropertyList />
          <RecentActivities />
        </div>
        <div className="lg:col-span-2">
          <DueRents />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
