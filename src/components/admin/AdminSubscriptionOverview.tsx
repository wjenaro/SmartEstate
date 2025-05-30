
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const AdminSubscriptionOverview = () => {
  const subscriptionData = [
    { plan: "Starter", users: 420, percentage: 47, color: "bg-blue-500" },
    { plan: "Professional", users: 320, percentage: 36, color: "bg-green-500" },
    { plan: "Enterprise", users: 152, percentage: 17, color: "bg-purple-500" }
  ];

  const totalUsers = subscriptionData.reduce((sum, plan) => sum + plan.users, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptionData.map((plan) => (
          <div key={plan.plan} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{plan.plan}</span>
              <span className="text-sm text-muted-foreground">
                {plan.users} users ({plan.percentage}%)
              </span>
            </div>
            <Progress value={plan.percentage} className="h-2" />
          </div>
        ))}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center font-medium">
            <span>Total Active Users</span>
            <span>{totalUsers}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
