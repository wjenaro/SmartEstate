
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubscriptionDistribution } from "@/hooks/useAdminData";
import { Loader2 } from "lucide-react";

export const AdminSubscriptionOverview = () => {
  const { subscriptionData, loading, error } = useSubscriptionDistribution();
  
  const totalUsers = subscriptionData?.reduce((sum, plan) => sum + plan.users, 0) || 0;
  
  if (loading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading subscription data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-red-500">
          Error loading subscription data: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptionData && subscriptionData.length > 0 ? (
          <>
            {subscriptionData.map((plan) => (
              <div key={plan.plan} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{plan.plan}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.users} users ({plan.percentage}%)
                  </span>
                </div>
                <Progress value={plan.percentage} className={`h-2 ${plan.color}`} />
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center font-medium">
                <span>Total Active Users</span>
                <span>{totalUsers}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No subscription data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
