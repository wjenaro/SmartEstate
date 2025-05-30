
import { Check, Clock, User, MessageSquare, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for recent activities
const activities = [
  {
    id: 1,
    type: "payment",
    description: "Payment received from John Doe",
    amount: "KES 25,000",
    time: "10 minutes ago",
    icon: Check,
    iconClass: "text-emerald-500 bg-emerald-100",
  },
  {
    id: 2,
    type: "tenant",
    description: "New tenant added: Sarah Williams",
    time: "2 hours ago",
    icon: User,
    iconClass: "text-blue-500 bg-blue-100",
  },
  {
    id: 3,
    type: "message",
    description: "SMS sent to 24 tenants about water schedule",
    time: "Yesterday, 14:30",
    icon: MessageSquare,
    iconClass: "text-violet-500 bg-violet-100",
  },
  {
    id: 4,
    type: "invoice",
    description: "May rent invoices generated for Riverside Apartments",
    time: "Yesterday, 10:15",
    icon: Receipt,
    iconClass: "text-amber-500 bg-amber-100",
  },
  {
    id: 5,
    type: "reminder",
    description: "Lease expiry reminder for Unit B205",
    time: "2 days ago",
    icon: Clock,
    iconClass: "text-rose-500 bg-rose-100",
  },
];

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4">
              <div className="relative">
                <div className={`h-10 w-10 rounded-full ${activity.iconClass} p-2 flex items-center justify-center`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                {index !== activities.length - 1 && (
                  <div className="absolute top-10 bottom-0 left-1/2 w-px -translate-x-1/2 bg-border" />
                )}
              </div>
              <div className="flex-1 pt-1.5 pb-6">
                <p className="font-medium">{activity.description}</p>
                {activity.amount && (
                  <p className="text-sm font-medium text-emerald-600 mt-0.5">
                    {activity.amount}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
