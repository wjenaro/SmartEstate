
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Smartphone } from "lucide-react";
import { useSubscriptionPlans, useUserSubscription } from "@/hooks/useSubscription";
import { SubscriptionPaymentModal } from "@/components/subscription/SubscriptionPaymentModal";

const Subscription = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: subscriptionLoading } = useUserSubscription();

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setShowPaymentModal(true);
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Choose the plan that best fits your property management needs
          </p>
        </div>

        {currentSubscription && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Current Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{currentSubscription.subscription_plans.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Valid until {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {plans?.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.name === "Professional" ? "border-blue-500 shadow-lg" : ""
              }`}
            >
              {plan.name === "Professional" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">KES {plan.price.toLocaleString()}</span>
                  <span className="text-muted-foreground">/{plan.billing_interval}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {(plan.features as string[]).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.max_properties && (
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Up to {plan.max_properties} properties</span>
                    </li>
                  )}
                  {plan.max_units && (
                    <li className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Up to {plan.max_units} units</span>
                    </li>
                  )}
                </ul>
                
                <Button
                  className="w-full"
                  variant={plan.name === "Professional" ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={currentSubscription?.plan_id === plan.id}
                >
                  {currentSubscription?.plan_id === plan.id ? "Current Plan" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Kenyan Payment Methods Supported</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <div>
                  <p className="font-medium">M-Pesa</p>
                  <p className="text-sm text-muted-foreground">Pay via M-Pesa mobile money</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">KCB Bank</p>
                  <p className="text-sm text-muted-foreground">Direct bank transfer</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showPaymentModal && selectedPlanId && (
        <SubscriptionPaymentModal
          planId={selectedPlanId}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlanId(null);
          }}
        />
      )}
    </MainLayout>
  );
};

export default Subscription;
