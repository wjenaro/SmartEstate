
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OnboardingSetupProps {
  isDemo: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export const OnboardingSetup = ({ isDemo, onNext, onPrevious }: OnboardingSetupProps) => {
  const [setupData, setSetupData] = useState({
    property_name: isDemo ? "Demo Apartments" : "",
    property_address: isDemo ? "123 Demo Street, Nairobi, Kenya" : "",
    property_type: "apartment",
    total_units: isDemo ? "10" : "",
    caretaker_name: isDemo ? "John Doe" : "",
    caretaker_phone: isDemo ? "+254700000000" : ""
  });

  const handleInputChange = (field: string, value: string) => {
    setSetupData(prev => ({ ...prev, [field]: value }));
  };

  const validateSetup = () => {
    if (!setupData.property_name.trim()) {
      return "Property name is required";
    }
    if (!setupData.property_address.trim()) {
      return "Property address is required";
    }
    if (!setupData.total_units || parseInt(setupData.total_units) < 1) {
      return "Total units must be at least 1";
    }
    if (isDemo && parseInt(setupData.total_units) > 20) {
      return "Demo mode allows maximum 20 units";
    }
    return null;
  };

  const handleSetup = () => {
    const error = validateSetup();
    if (error) {
      alert(error);
      return;
    }

    // In a real app, this would save the initial property data
    console.log("Setting up initial property:", setupData);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {isDemo ? "Demo Property Setup" : "Initial Property Setup"}
        </h2>
        <p className="text-muted-foreground">
          {isDemo 
            ? "Configure your demo property (limited to 20 units max)"
            : "Let's add your first property to get you started"
          }
        </p>
      </div>

      {isDemo && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Demo mode restrictions: Maximum 2 properties, 20 units each
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Property Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="property_name">Property Name *</Label>
              <Input
                id="property_name"
                value={setupData.property_name}
                onChange={(e) => handleInputChange("property_name", e.target.value)}
                placeholder="Enter property name"
                required
              />
            </div>
            <div>
              <Label htmlFor="property_type">Property Type</Label>
              <Select value={setupData.property_type} onValueChange={(value) => handleInputChange("property_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="mixed">Mixed Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="property_address">Address *</Label>
            <Textarea
              id="property_address"
              value={setupData.property_address}
              onChange={(e) => handleInputChange("property_address", e.target.value)}
              placeholder="Enter complete address"
              rows={2}
              required
            />
          </div>

          <div>
            <Label htmlFor="total_units">
              Total Units * {isDemo && "(Max 20 for demo)"}
            </Label>
            <Input
              id="total_units"
              type="number"
              min="1"
              max={isDemo ? "20" : undefined}
              value={setupData.total_units}
              onChange={(e) => handleInputChange("total_units", e.target.value)}
              placeholder="Number of units"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Caretaker Information (Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="caretaker_name">Caretaker Name</Label>
              <Input
                id="caretaker_name"
                value={setupData.caretaker_name}
                onChange={(e) => handleInputChange("caretaker_name", e.target.value)}
                placeholder="Enter caretaker name"
              />
            </div>
            <div>
              <Label htmlFor="caretaker_phone">Caretaker Phone</Label>
              <Input
                id="caretaker_phone"
                type="tel"
                value={setupData.caretaker_phone}
                onChange={(e) => handleInputChange("caretaker_phone", e.target.value)}
                placeholder="+254..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleSetup}>
          {isDemo ? "Continue with Demo" : "Create Property"}
        </Button>
      </div>
    </div>
  );
};
