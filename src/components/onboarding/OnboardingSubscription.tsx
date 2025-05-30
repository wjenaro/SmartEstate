
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface OnboardingSubscriptionProps {
  isDemo: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export const OnboardingSubscription = ({ isDemo, onNext, onPrevious }: OnboardingSubscriptionProps) => {
  const [selectedPlan, setSelectedPlan] = useState(isDemo ? "demo" : "starter");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "KES 2,500",
      period: "per month",
      description: "Perfect for small landlords",
      features: [
        "Up to 5 properties",
        "Up to 20 units",
        "Basic reporting",
        "SMS notifications",
        "Invoice generation"
      ],
      popular: false
    },
    {
      id: "professional",
      name: "Professional",
      price: "KES 5,000",
      period: "per month",
      description: "For growing property managers",
      features: [
        "Up to 15 properties",
        "Up to 100 units",
        "Advanced reporting",
        "SMS notifications",
        "Invoice generation",
        "Expense tracking",
        "Tenant management"
      ],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "KES 10,000",
      period: "per month",
      description: "For large property management companies",
      features: [
        "Unlimited properties",
        "Unlimited units",
        "All features",
        "Priority support",
        "Custom integrations",
        "Advanced analytics"
      ],
      popular: false
    }
  ];

  const demoFeatures = [
    "Full access to all features",
    "Sample property data",
    "Test SMS notifications",
    "Generate sample invoices",
    "Explore payment tracking",
    "No time limit"
  ];

  if (isDemo) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Demo Features</h2>
          <p className="text-muted-foreground">
            Explore all our features with sample data
          </p>
        </div>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Demo Environment
              <Badge variant="secondary">Free Trial</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {demoFeatures.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button onClick={onNext}>
            Continue with Demo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the plan that best fits your property management needs
        </p>
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-200 hover:border-gray-300"
            } ${plan.popular ? "border-orange-200 bg-orange-50" : ""}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.popular && <Badge variant="default">Most Popular</Badge>}
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onNext}>
          Continue with {plans.find(p => p.id === selectedPlan)?.name}
        </Button>
      </div>
    </div>
  );
};
