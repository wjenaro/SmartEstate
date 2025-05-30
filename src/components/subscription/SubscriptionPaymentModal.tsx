
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, CreditCard, AlertCircle } from "lucide-react";
import { useCreateSubscription, useSubscriptionPlans } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPaymentModalProps {
  planId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionPaymentModal = ({ planId, isOpen, onClose }: SubscriptionPaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: plans } = useSubscriptionPlans();
  const { mutate: createSubscription } = useCreateSubscription();
  const { toast } = useToast();

  const selectedPlan = plans?.find(p => p.id === planId);

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "mpesa" && !phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "kcb" && !accountNumber) {
      toast({
        title: "Account Number Required",
        description: "Please enter your KCB account number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate a mock payment reference (in production, integrate with actual payment gateways)
      const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await createSubscription({
        planId,
        paymentMethod,
        paymentReference,
      });

      toast({
        title: "Subscription Activated!",
        description: `Your ${selectedPlan?.name} subscription is now active.`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Subscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {selectedPlan && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold">{selectedPlan.name} Plan</h3>
                  <div className="text-2xl font-bold text-blue-600 mt-2">
                    KES {selectedPlan.price.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">per {selectedPlan.billing_interval}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mpesa">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span>M-Pesa</span>
                  </div>
                </SelectItem>
                <SelectItem value="kcb">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>KCB Bank Transfer</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "mpesa" && (
            <div>
              <Label htmlFor="phone-number">M-Pesa Phone Number</Label>
              <Input
                id="phone-number"
                type="tel"
                placeholder="+254700000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter the phone number registered with M-Pesa
              </p>
            </div>
          )}

          {paymentMethod === "kcb" && (
            <div>
              <Label htmlFor="account-number">KCB Account Number</Label>
              <Input
                id="account-number"
                placeholder="1234567890"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter your KCB bank account number
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Demo Payment Notice</p>
                <p>This is a demo environment. No actual payment will be processed. Your subscription will be activated immediately for testing purposes.</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={loading} className="flex-1">
              {loading ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
