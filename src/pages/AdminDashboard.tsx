
import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminSubscriptionOverview } from "@/components/admin/AdminSubscriptionOverview";
import { AdminPaymentTransactions } from "@/components/admin/AdminPaymentTransactions";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminSettingsPanel } from "@/components/admin/AdminSettingsPanel";
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  LogOut,
  Settings,
  BarChart,
  Shield,
  Building,
  Loader2
} from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminData";

const AdminDashboard = () => {
  const { adminUser, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { stats, loading: statsLoading, error: statsError } = useAdminStats();

  // Format real data for the stats cards
  const statsData = statsLoading ? [] : [
    {
      title: "Total Users",
      value: stats?.totalUsers.toLocaleString() || "0",
      change: `${stats?.monthlyChange.users > 0 ? "+" : ""}${stats?.monthlyChange.users.toFixed(1)}% from last month`,
      icon: Users,
    },
    {
      title: "Monthly Revenue",
      value: `KES ${stats?.totalRevenue.toLocaleString() || "0"}`,
      change: `${stats?.monthlyChange.revenue > 0 ? "+" : ""}${stats?.monthlyChange.revenue.toFixed(1)}% from last month`, 
      icon: DollarSign,
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions.toLocaleString() || "0",
      change: `${stats?.monthlyChange.subscriptions > 0 ? "+" : ""}${stats?.monthlyChange.subscriptions.toFixed(1)}% from last month`,
      icon: CreditCard,
    },
    {
      title: "Growth Rate",
      value: `${stats?.growthRate.toFixed(1) || "0"}%`,
      change: `${stats?.monthlyChange.growthRate > 0 ? "+" : ""}${stats?.monthlyChange.growthRate.toFixed(1)}% from last month`,
      icon: TrendingUp,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Administrator Portal</h1>
              <p className="text-sm text-muted-foreground">
                RentEase SaaS Management Console
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {adminUser && (
              <div className="text-right">
                <p className="font-medium">{adminUser.email}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {adminUser.role.replace('_', ' ')}
                </p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {statsLoading ? (
            <Card className="col-span-4 py-8">
              <CardContent className="flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading dashboard data...</span>
              </CardContent>
            </Card>
          ) : statsError ? (
            <Card className="col-span-4 py-8">
              <CardContent className="text-center text-red-500">
                Error loading dashboard data: {statsError}
              </CardContent>
            </Card>
          ) : (
            statsData.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Subscriptions</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Payments</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <AdminAnalytics />
            <div className="grid gap-6 md:grid-cols-2">
              <AdminSubscriptionOverview />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Platform Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Properties</span>
                      <span className="font-medium">{stats?.totalProperties.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Units</span>
                      <span className="font-medium">{stats?.totalUnits.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Tenants</span>
                      <span className="font-medium">{stats?.activeTenants.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Demo Accounts</span>
                      <span className="font-medium">{stats?.demoAccounts.toLocaleString() || "0"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <AdminSubscriptionOverview />
          </TabsContent>
          
          <TabsContent value="payments">
            <AdminPaymentTransactions />
          </TabsContent>
          
          <TabsContent value="settings">
            <AdminSettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
