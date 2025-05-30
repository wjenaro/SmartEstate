import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, DollarSign, Droplet } from "lucide-react";

// Unit type options - matching the types defined in the PropertyForm
const UNIT_TYPES = [
  { id: "single_room", label: "Single Room" },
  { id: "bedsitter", label: "Bedsitter" },
  { id: "studio", label: "Studio" },
  { id: "one_bedroom", label: "1-Bedroom" },
  { id: "two_bedroom", label: "2-Bedroom" },
  { id: "three_bedroom", label: "3-Bedroom" },
  { id: "maisonette", label: "Maisonette" },
  { id: "bungalow", label: "Bungalow" },
  { id: "shop", label: "Shop" },
  { id: "business_space", label: "Business Space" },
  { id: "penthouse", label: "Penthouse" },
  { id: "duplex", label: "Duplex" }
];

interface Property {
  id: string;
  name: string;
}

interface UnitFormProps {
  properties?: Property[];
  onClose?: () => void;
  isLoading?: boolean;
}

export function UnitForm({ properties = [], onClose, isLoading = false }: UnitFormProps) {
  const [activeTab, setActiveTab] = useState("basic-info");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Unit</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic-info" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
            <TabsTrigger value="basic-info" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden md:inline">Financial Details</span>
            </TabsTrigger>
            <TabsTrigger value="utilities" className="flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              <span className="hidden md:inline">Utilities</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic-info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property*</Label>
                <Select disabled={isLoading}>
                  <SelectTrigger id="property">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitNumber">Unit Number/Name*</Label>
                <Input id="unitNumber" placeholder="e.g. A101" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitType">Unit Type*</Label>
              <Select>
                <SelectTrigger id="unitType">
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between pt-4">
              <div></div>
              <Button onClick={() => setActiveTab("financial")} type="button">
                Next: Financial Details
              </Button>
            </div>
          </TabsContent>
          
          {/* Financial Details Tab */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentAmount">Monthly Rent (KES)*</Label>
                <Input 
                  id="rentAmount" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRatePercentage">Tax Rate (%)</Label>
                <Input 
                  id="taxRatePercentage" 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.1" 
                  placeholder="0.0" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Unit Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter any notes about this unit" 
                className="min-h-24"
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("basic-info")} type="button">
                Previous
              </Button>
              <Button onClick={() => setActiveTab("utilities")} type="button">
                Next: Utilities Setup
              </Button>
            </div>
          </TabsContent>
          
          {/* Utilities Setup Tab */}
          <TabsContent value="utilities" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Initial Utility Readings</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set the initial meter readings for this unit if available.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    Water Meter
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="waterMeterReading">Current Reading</Label>
                      <Input 
                        id="waterMeterReading" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="0.00" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waterMeterDate">Reading Date</Label>
                      <Input 
                        id="waterMeterDate" 
                        type="date" 
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Electricity Meter
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="electricityMeterReading">Current Reading</Label>
                      <Input 
                        id="electricityMeterReading" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="0.00" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="electricityMeterDate">Reading Date</Label>
                      <Input 
                        id="electricityMeterDate" 
                        type="date" 
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("financial")} type="button">
                Previous
              </Button>
              <Button type="submit">Save Unit</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
