
import { Button } from "@/components/ui/button";
import { Building2, Users, DollarSign, MessageSquare } from "lucide-react";

interface OnboardingWelcomeProps {
  isDemo: boolean;
  onNext: () => void;
  userAccount: any;
}

export const OnboardingWelcome = ({ isDemo, onNext, userAccount }: OnboardingWelcomeProps) => {
  const features = [
    {
      icon: Building2,
      title: "Property Management",
      description: isDemo 
        ? "Manage up to 2 demo properties with sample data" 
        : "Manage all your properties and units in one place"
    },
    {
      icon: Users,
      title: "Tenant Management",
      description: isDemo 
        ? "Track up to 20 demo units with sample tenants" 
        : "Keep track of tenants, leases, and communications"
    },
    {
      icon: DollarSign,
      title: "Financial Tracking",
      description: "Generate invoices, track payments, and manage expenses"
    },
    {
      icon: MessageSquare,
      title: "SMS Notifications",
      description: "Automated rent reminders via AfricaTalking SMS"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          Welcome{userAccount?.first_name ? `, ${userAccount.first_name}` : ""}!
        </h2>
        <p className="text-muted-foreground">
          {isDemo 
            ? "You're about to explore our demo environment with sample data and limited features for testing."
            : "Let's get your property management system set up in just a few steps."
          }
        </p>
        {isDemo && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Limits:</strong> 2 properties maximum, 20 units maximum
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
            <div className="flex-shrink-0">
              <feature.icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>
          {isDemo ? "Start Demo Setup" : "Get Started"}
        </Button>
      </div>
    </div>
  );
};
