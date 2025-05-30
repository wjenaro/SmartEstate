
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Building2, Users, DollarSign, MessageSquare, AlertCircle } from "lucide-react";

interface OnboardingCompleteProps {
  isDemo: boolean;
  onComplete: () => void;
  onPrevious: () => void;
}

export const OnboardingComplete = ({ isDemo, onComplete, onPrevious }: OnboardingCompleteProps) => {
  const nextSteps = [
    {
      icon: Building2,
      title: isDemo ? "Explore Demo Properties" : "Add More Properties",
      description: isDemo 
        ? "View your sample properties and units (2 properties max)" 
        : "Continue adding your properties and units"
    },
    {
      icon: Users,
      title: isDemo ? "Review Demo Tenants" : "Add Tenants",
      description: isDemo 
        ? "See sample tenant data and lease information" 
        : "Start managing your tenants and leases"
    },
    {
      icon: DollarSign,
      title: isDemo ? "Test Invoicing" : "Generate Invoices",
      description: isDemo 
        ? "Try creating sample invoices with demo data" 
        : "Create and send invoices to your tenants"
    },
    {
      icon: MessageSquare,
      title: isDemo ? "Test SMS Features" : "Setup SMS Notifications",
      description: isDemo 
        ? "See how SMS notifications work (demo mode)" 
        : "Configure automated rent reminders via AfricaTalking"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {isDemo ? "Demo Ready!" : "Setup Complete!"}
        </h2>
        <p className="text-muted-foreground">
          {isDemo 
            ? "Your demo environment is ready with sample data and limited features for testing."
            : "Your property management system is ready to use."
          }
        </p>
      </div>

      {isDemo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Demo Limitations</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Maximum 2 properties</li>
                  <li>• Maximum 20 units total</li>
                  <li>• Sample data for testing</li>
                  <li>• SMS in test mode</li>
                  <li>• Limited payment features</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">
            {isDemo ? "Things to Try:" : "Recommended Next Steps:"}
          </h3>
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <step.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isDemo && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Ready for Production?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              When you're ready to manage real properties, create a full account to access unlimited features, M-Pesa payments, and production SMS.
            </p>
            <Button variant="outline" className="w-full">
              Upgrade to Full Account
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onComplete}>
          {isDemo ? "Start Using Demo" : "Go to Dashboard"}
        </Button>
      </div>
    </div>
  );
};
