import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Landmark, Home, User, LucideIcon, BanknoteIcon, Receipt, DollarSign, Plus, Minus, FileText, CalendarIcon, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccountScoping } from "@/hooks/useAccountScoping";

// Unit type options
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

interface PropertyFormProps {
  onClose?: () => void;
}

// Recurring bill types
const RECURRING_BILL_TYPES = [
  { id: "cleaning", label: "Cleaning" },
  { id: "service", label: "Service" },
  { id: "internet", label: "Internet" },
  { id: "security", label: "Security" },
  { id: "parking", label: "Parking Fee" },
  { id: "garbage", label: "Garbage" },
  { id: "vat", label: "VAT" }
];

export function PropertyForm({ onClose }: PropertyFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createWithAccountId, isAuthenticated } = useAccountScoping();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Form state
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [description, setDescription] = useState("");
  
  // Financial details
  const [waterRate, setWaterRate] = useState<number | "">("");
  const [electricityRate, setElectricityRate] = useState<number | "">("");
  const [mPesaPaybill, setMPesaPaybill] = useState("");
  const [rentalPaymentPenalty, setRentalPaymentPenalty] = useState<number | "">("");
  const [taxRate, setTaxRate] = useState<number | "">("");
  const [membershipFee, setMembershipFee] = useState<number | "">("");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  
  // Additional information
  const [companyName, setCompanyName] = useState("");
  const [streetName, setStreetName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [notes, setNotes] = useState("");
  
  // Caretaker information
  const [caretakerName, setCaretakerName] = useState("");
  const [caretakerPhone, setCaretakerPhone] = useState("");
  const [caretakerEmail, setCaretakerEmail] = useState("");
  
  // Validate the current tab
  const validateCurrentTab = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (activeTab === "basic-info") {
      if (!propertyName.trim()) errors.propertyName = "Property name is required";
      if (!propertyType) errors.propertyType = "Property type is required";
      if (!address.trim()) errors.address = "Address is required";
      if (!city.trim()) errors.city = "City/Town is required";
    } 
    else if (activeTab === "financial") {
      if (waterRate !== "" && Number(waterRate) < 0) {
        errors.waterRate = "Water rate cannot be negative";
      }
      if (electricityRate !== "" && Number(electricityRate) < 0) {
        errors.electricityRate = "Electricity rate cannot be negative";
      }
      if (rentalPaymentPenalty !== "" && Number(rentalPaymentPenalty) < 0) {
        errors.rentalPaymentPenalty = "Penalty cannot be negative";
      }
      if (taxRate !== "" && (Number(taxRate) < 0 || Number(taxRate) > 100)) {
        errors.taxRate = "Tax rate must be between 0 and 100";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate entire form before submission
  const validateForm = (): {[key: string]: string} => {
    const errors: {[key: string]: string} = {};
    
    // Basic info validation
    if (!propertyName.trim()) errors.propertyName = "Property name is required";
    if (!propertyType) errors.propertyType = "Property type is required";
    if (!address.trim()) errors.address = "Address is required";
    if (!city.trim()) errors.city = "City/Town is required";
    
    // Financial validation
    if (waterRate !== "" && Number(waterRate) < 0) {
      errors.waterRate = "Water rate cannot be negative";
    }
    if (electricityRate !== "" && Number(electricityRate) < 0) {
      errors.electricityRate = "Electricity rate cannot be negative";
    }
    if (rentalPaymentPenalty !== "" && Number(rentalPaymentPenalty) < 0) {
      errors.rentalPaymentPenalty = "Penalty cannot be negative";
    }
    if (taxRate !== "" && (Number(taxRate) < 0 || Number(taxRate) > 100)) {
      errors.taxRate = "Tax rate must be between 0 and 100";
    }
    
    return errors;
  };
  
  // Handle tab changes with validation
  const handleTabChange = (value: string) => {
    if (validateCurrentTab()) {
      setActiveTab(value);
    }
  };
  
  // Save property to database
  const saveProperty = async () => {
    // Validate all form fields
    const errors = validateForm();
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Map error fields to their tabs
      const errorTabs: {[key: string]: string} = {
        propertyName: "basic-info",
        propertyType: "basic-info",
        address: "basic-info",
        city: "basic-info",
        waterRate: "financial",
        electricityRate: "financial",
        rentalPaymentPenalty: "financial",
        taxRate: "financial"
      };
      
      // Find which tab has errors
      for (const [field, tab] of Object.entries(errorTabs)) {
        if (errors[field]) {
          setActiveTab(tab);
          break;
        }
      }
      return;
    }
    
    setIsSubmitting(true);
    setValidationErrors({});
    
    try {
      // Ensure the user is authenticated
      if (!isAuthenticated) {
        throw new Error("User not authenticated or account not found");
      }

      const propertyData = {
        name: propertyName,
        property_type: propertyType,
        address: address,
        city: city,
        county: county || null,
        postal_code: postalCode || null,
        description: description || null,
        water_rate: waterRate !== "" ? parseFloat(waterRate.toString()) : null,
        electricity_rate: electricityRate !== "" ? parseFloat(electricityRate.toString()) : null,
        mpesa_paybill: mPesaPaybill || null,
        rental_payment_penalty: rentalPaymentPenalty !== "" ? parseFloat(rentalPaymentPenalty.toString()) : null,
        tax_rate: taxRate !== "" ? parseFloat(taxRate.toString()) : null,
        membership_fee: membershipFee !== "" ? parseFloat(membershipFee.toString()) : null,
        company_name: companyName || null,
        street_name: streetName || null,
        owner_phone: ownerPhone || null,
        notes: notes || null,
        caretaker_name: caretakerName || null,
        caretaker_phone: caretakerPhone || null,
        caretaker_email: caretakerEmail || null,
        // Note: account_id will be added by createWithAccountId
      };
      
      try {
        // Insert property into database using account scoping utility
        const { data, error } = await createWithAccountId('properties', propertyData, supabase as any);
          
        if (error) throw error;
        
        toast({
          title: "Property saved",
          description: `${propertyName} has been successfully added.`,
          variant: "default"
        });
        
        if (onClose) {
          onClose();
        }
      } catch (saveError: any) {
        console.error('Error saving property:', saveError);
        
        // If the error is about missing account_id column, try saving without it
        if (saveError.message?.includes('account_id')) {
          console.warn('account_id column may not exist, trying direct insert');
          try {
            // Remove account_id from propertyData and only include valid columns
            // based on your database schema
            const propertyDataWithoutAccount = {
              name: propertyData.name,
              property_type: propertyData.property_type,
              address: propertyData.address,
              city: propertyData.city || null,
              county: propertyData.county || null,
              postal_code: propertyData.postal_code || null,
              description: propertyData.description || null,
              water_rate: propertyData.water_rate || null,
              electricity_rate: propertyData.electricity_rate || null,
              mpesa_paybill: propertyData.mpesa_paybill || null,
              rental_payment_penalty: propertyData.rental_payment_penalty || null,
              tax_rate: propertyData.tax_rate || null,
              membership_fee: propertyData.membership_fee || null,
              payment_instructions: propertyData.payment_instructions || null,
              company_name: propertyData.company_name || null,
              street_name: propertyData.street_name || null,
              notes: propertyData.notes || null,
              owner_phone: propertyData.owner_phone || null,
              caretaker_name: propertyData.caretaker_name || null,
              // Missing in schema but referenced in form
              unit_types: propertyData.unit_types || {},
              recurring_bills: propertyData.recurring_bills || [],
              created_by: user?.id || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // Try again without account_id, using as any to bypass TypeScript errors
            const { data, error: fallbackError } = await supabase
              .from('properties')
              .insert(propertyDataWithoutAccount as any)
              .select('*');
              
            if (fallbackError) throw fallbackError;
            
            toast({
              title: "Property saved",
              description: `${propertyName} has been successfully added.`,
              variant: "default"
            });
            
            if (onClose) {
              onClose();
            }
            return; // Exit early if this succeeds
          } catch (fallbackError) {
            console.error("Fallback property save failed:", fallbackError);
            // Continue to the general error handling
          }
        }
        
        // General error handling
        setIsSubmitting(false);
        toast({
          title: "Error saving property",
          description: "There was a problem saving your property. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in property form submission:', error);
      toast({
        title: "Error saving property",
        description: "There was a problem saving the property to the database.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // State for unit types with counts
  const [unitTypes, setUnitTypes] = useState<Record<string, number>>({});
  
  // State for recurring bills
  const [recurringBills, setRecurringBills] = useState<string[]>([]);
  
  // Add or update unit type count
  const handleUnitTypeChange = (typeId: string, count: number) => {
    setUnitTypes(prev => ({
      ...prev,
      [typeId]: count
    }));
  };
  
  // Toggle recurring bill selection
  const handleRecurringBillToggle = (billId: string) => {
    setRecurringBills(prev => 
      prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };
  
  // Calculate total units from unit types
  const calculateTotalUnits = () => {
    return Object.values(unitTypes).reduce((sum, count) => sum + count, 0);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Property</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic-info" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
            <TabsTrigger value="basic-info" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden md:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="unit-types" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Unit Types</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden md:inline">Financial</span>
            </TabsTrigger>
            <TabsTrigger value="recurring-bills" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Recurring Bills</span>
            </TabsTrigger>
            <TabsTrigger value="additional" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Additional</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic-info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyName">Property Name*</Label>
                <Input 
                  id="propertyName" 
                  placeholder="Enter property name" 
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className={validationErrors.propertyName ? "border-destructive" : ""}
                  required 
                />
                {validationErrors.propertyName && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.propertyName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type*</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger id="propertyType" className={validationErrors.propertyType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment_building">Apartment Building</SelectItem>
                    <SelectItem value="commercial">Commercial Building</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.propertyType && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.propertyType}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Address*</Label>
              <Textarea 
                id="propertyAddress" 
                placeholder="Enter complete address" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={validationErrors.address ? "border-destructive" : ""}
                required 
              />
              {validationErrors.address && (
                <p className="text-sm text-destructive mt-1">{validationErrors.address}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City/Town*</Label>
                <Input 
                  id="city" 
                  placeholder="Enter city or town" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={validationErrors.city ? "border-destructive" : ""}
                  required 
                />
                {validationErrors.city && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.city}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input 
                  id="county" 
                  placeholder="Enter county" 
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input 
                  id="postalCode" 
                  placeholder="Enter postal code" 
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Property Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter property description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <div></div>
              <Button onClick={() => setActiveTab("unit-types")} type="button">
                Next: Unit Types
              </Button>
            </div>
          </TabsContent>
          
          {/* Unit Types Tab */}
          <TabsContent value="unit-types" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Unit Type Configuration</h3>
                <Badge variant="outline" className="px-3 py-1">
                  Total Units: {calculateTotalUnits()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {UNIT_TYPES.map(type => (
                  <div key={type.id} className="flex items-center space-x-2 p-3 border rounded-md">
                    <div className="flex-1">
                      <Label htmlFor={`unit-${type.id}`}>{type.label}</Label>
                    </div>
                    <Input
                      id={`unit-${type.id}`}
                      type="number"
                      min="0"
                      value={unitTypes[type.id] || 0}
                      onChange={(e) => handleUnitTypeChange(type.id, parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("basic-info")} type="button">
                Previous
              </Button>
              <Button onClick={() => setActiveTab("financial")} type="button">
                Next: Financial Details
              </Button>
            </div>
          </TabsContent>
          
          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waterRate">Water Rate (KES per unit)</Label>
                <Input 
                  id="waterRate" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  value={waterRate}
                  onChange={(e) => setWaterRate(e.target.value ? parseFloat(e.target.value) : "")}
                  className={validationErrors.waterRate ? "border-destructive" : ""}
                />
                {validationErrors.waterRate && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.waterRate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="electricityRate">Electricity Rate (KES per kWh)</Label>
                <Input 
                  id="electricityRate" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  value={electricityRate}
                  onChange={(e) => setElectricityRate(e.target.value ? parseFloat(e.target.value) : "")}
                  className={validationErrors.electricityRate ? "border-destructive" : ""}
                />
                {validationErrors.electricityRate && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.electricityRate}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mpesaPaybill">M-Pesa Paybill Number</Label>
                <Input 
                  id="mpesaPaybill" 
                  placeholder="Enter paybill number" 
                  value={mPesaPaybill}
                  onChange={(e) => setMPesaPaybill(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalPaymentPenalty">Rental Payment Penalty (%)</Label>
                <Input 
                  id="rentalPaymentPenalty" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="100" 
                  placeholder="0.00" 
                  value={rentalPaymentPenalty}
                  onChange={(e) => setRentalPaymentPenalty(e.target.value ? parseFloat(e.target.value) : "")}
                  className={validationErrors.rentalPaymentPenalty ? "border-destructive" : ""}
                />
                {validationErrors.rentalPaymentPenalty && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.rentalPaymentPenalty}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input 
                  id="taxRate" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="100" 
                  placeholder="0.00" 
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value ? parseFloat(e.target.value) : "")}
                  className={validationErrors.taxRate ? "border-destructive" : ""}
                />
                {validationErrors.taxRate && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.taxRate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="membershipFee">Membership Fee (KES)</Label>
                <Input 
                  id="membershipFee" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  value={membershipFee}
                  onChange={(e) => setMembershipFee(e.target.value ? parseFloat(e.target.value) : "")}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentInstructions">Payment Instructions</Label>
              <Textarea 
                id="paymentInstructions" 
                placeholder="Enter payment instructions or details" 
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("unit-types")} type="button">
                Previous
              </Button>
              <Button onClick={() => setActiveTab("recurring-bills")} type="button">
                Next: Recurring Bills
              </Button>
            </div>
          </TabsContent>
          
          {/* Recurring Bills Tab */}
          <TabsContent value="recurring-bills" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recurring Bills</h3>
              <p className="text-sm text-muted-foreground">
                Select recurring bills applicable to this property
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {RECURRING_BILL_TYPES.map(bill => (
                  <div key={bill.id} className="flex items-center space-x-2 p-3 border rounded-md">
                    <Checkbox 
                      id={`bill-${bill.id}`} 
                      checked={recurringBills.includes(bill.id)}
                      onCheckedChange={() => handleRecurringBillToggle(bill.id)}
                    />
                    <Label 
                      htmlFor={`bill-${bill.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {bill.label}
                    </Label>
                    {recurringBills.includes(bill.id) && (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Amount"
                        className="w-24"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {recurringBills.length > 0 && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Selected Bills:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recurringBills.map(billId => {
                      const bill = RECURRING_BILL_TYPES.find(b => b.id === billId);
                      return bill ? (
                        <Badge key={billId} variant="secondary">
                          {bill.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("financial")} type="button">
                Previous
              </Button>
              <Button onClick={() => setActiveTab("additional")} type="button">
                Next: Additional Info
              </Button>
            </div>
          </TabsContent>
          
          {/* Additional Information Tab */}
          <TabsContent value="additional" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  placeholder="Enter company name" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="streetName">Street Name</Label>
                <Input 
                  id="streetName" 
                  placeholder="Enter street name" 
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Owner Phone Number</Label>
                <Input 
                  id="ownerPhone" 
                  placeholder="Enter owner phone number" 
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input 
                  id="yearBuilt" 
                  placeholder="Enter year built" 
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter additional notes or information" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <h3 className="font-semibold text-lg pt-2 flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>Caretaker Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="caretakerName">Caretaker Name</Label>
                <Input 
                  id="caretakerName" 
                  placeholder="Enter caretaker name" 
                  value={caretakerName}
                  onChange={(e) => setCaretakerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caretakerPhone">Caretaker Phone</Label>
                <Input 
                  id="caretakerPhone" 
                  placeholder="Enter caretaker phone" 
                  value={caretakerPhone}
                  onChange={(e) => setCaretakerPhone(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="caretakerEmail">Caretaker Email</Label>
              <Input 
                id="caretakerEmail" 
                type="email" 
                placeholder="Enter caretaker email" 
                value={caretakerEmail}
                onChange={(e) => setCaretakerEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("recurring-bills")} type="button">
                Previous
              </Button>
              <Button onClick={saveProperty} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⚙️</span>
                    Saving...
                  </>
                ) : (
                  "Save Property"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
