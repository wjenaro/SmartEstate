
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { User, Phone, FileText, Users } from "lucide-react";

interface Property {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  unit_number: string;
  property_id: string;
}

interface TenantFormProps {
  properties?: Property[];
  units?: Unit[];
  onClose?: () => void;
  propertyId?: string;
  onPropertyChange?: (propertyId: string) => void;
}

export function TenantForm({
  properties = [],
  units = [],
  onClose,
  propertyId,
  onPropertyChange
}: TenantFormProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("personal");
  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || "");
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  
  // Update filtered units when property changes
  const handlePropertyChange = (id: string) => {
    setSelectedPropertyId(id);
    if (onPropertyChange) {
      onPropertyChange(id);
    }
    
    const filtered = units.filter(unit => unit.property_id === id);
    setFilteredUnits(filtered);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Tenant</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Personal Details</span>
              <span className="md:hidden">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden md:inline">Contact Info</span>
              <span className="md:hidden">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="lease" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Lease Details</span>
              <span className="md:hidden">Lease</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Emergency Contact</span>
              <span className="md:hidden">Emergency</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input id="idNumber" placeholder="Enter national ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kraPin">KRA PIN</Label>
                <Input id="kraPin" placeholder="Enter KRA PIN" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" placeholder="Enter email address" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number*</Label>
                <Input id="phone" placeholder="Enter phone number" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Current Address</Label>
              <Textarea id="address" placeholder="Enter current address" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property*</Label>
                <Select
                  value={selectedPropertyId}
                  onValueChange={handlePropertyChange}
                >
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
                <Label htmlFor="unit">Unit*</Label>
                <Select>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.unit_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferredContact">Preferred Contact Method</Label>
              <Select>
                <SelectTrigger id="preferredContact">
                  <SelectValue placeholder="Select contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="call">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="lease" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaseTerms">Lease Terms</Label>
                <Textarea id="leaseTerms" placeholder="Enter lease terms and conditions" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leaseStart">Lease Start Date</Label>
                <Input id="leaseStart" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseEnd">Lease End Date</Label>
                <Input id="leaseEnd" type="date" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly Rent (KES)*</Label>
                <Input id="monthlyRent" placeholder="Enter monthly rent" type="number" min="0" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">Security Deposit (KES)</Label>
                <Input id="deposit" placeholder="Enter deposit amount" type="number" min="0" step="0.01" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentPaymentStatus">Rent Payment Status*</Label>
                <Select defaultValue="paid">
                  <SelectTrigger id="rentPaymentStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500 hover:bg-green-500">Paid</Badge>
                        <span>Fully Paid</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="balance">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500 hover:bg-yellow-500">Balance</Badge>
                        <span>Has Balance</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="overdue">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-500 hover:bg-red-500">Overdue</Badge>
                        <span>Payment Overdue</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balanceAmount">Balance Amount (KES)</Label>
                <Input id="balanceAmount" placeholder="Enter balance amount if any" type="number" min="0" step="0.01" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
              <Select>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="emergency" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                <Input id="emergencyName" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Input id="relationship" placeholder="Enter relationship" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone Number</Label>
                <Input id="emergencyPhone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyEmail">Email Address</Label>
                <Input id="emergencyEmail" placeholder="Enter email address" type="email" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyAddress">Address</Label>
              <Textarea id="emergencyAddress" placeholder="Enter address" />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-8">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <div className="space-x-2">
            {activeTab !== "personal" && (
              <Button 
                variant="outline" 
                type="button"
                onClick={() => {
                  const tabs = ["personal", "contact", "lease", "emergency"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1]);
                  }
                }}
              >
                Previous
              </Button>
            )}
            
            {activeTab !== "emergency" ? (
              <Button
                type="button"
                onClick={() => {
                  const tabs = ["personal", "contact", "lease", "emergency"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
              >
                Next
              </Button>
            ) : (
              <Button type="submit">Save Tenant</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
