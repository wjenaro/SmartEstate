// import { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Home, DollarSign, Droplet, Zap } from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
// import { useAccountScoping } from "@/hooks/useAccountScoping";
// import { SupabaseClient } from "@supabase/supabase-js";
// import { Database } from "@/types/supabase";

// const UNIT_TYPES = [
//   { id: "single_room", label: "Single Room" },
//   { id: "bedsitter", label: "Bedsitter" },
//   { id: "studio", label: "Studio" },
//   { id: "one_bedroom", label: "1-Bedroom" },
//   { id: "two_bedroom", label: "2-Bedroom" },
//   { id: "three_bedroom", label: "3-Bedroom" },
//   { id: "maisonette", label: "Maisonette" },
//   { id: "bungalow", label: "Bungalow" },
//   { id: "shop", label: "Shop" },
//   { id: "business_space", label: "Business Space" },
//   { id: "penthouse", label: "Penthouse" },
//   { id: "duplex", label: "Duplex" },
// ];

// interface ValidationErrors {
//   propertyId?: string;
//   unitNumber?: string;
//   unitType?: string;
//   rentAmount?: string;
//   [key: string]: string | undefined;
// }

// interface UnitFormProps {
//   properties?: Array<any>;
//   initialData?: any;
//   isEditing?: boolean;
//   onSuccess?: () => void;
//   onClose?: () => void;
// }

// interface UnitData {
//   property_id: string;
//   unit_number: string;
//   unit_type: string;
//   rent_amount: number;
//   notes: string;
//   features: any[];
//   status: string;
// }

// const UnitForm = ({ properties = [], initialData, isEditing = false, onSuccess, onClose }: UnitFormProps) => {
//   const { toast } = useToast();
//   const { createWithAccountId } = useAccountScoping();

//   const [activeTab, setActiveTab] = useState("basic-info");
//   const [selectedPropertyId, setSelectedPropertyId] = useState(initialData?.property_id || "");
//   const [unitNumber, setUnitNumber] = useState(initialData?.unit_number || initialData?.number || "");
//   const [selectedUnitType, setSelectedUnitType] = useState(initialData?.unit_type || initialData?.type || "");
//   const [rentAmount, setRentAmount] = useState(initialData?.rent_amount?.toString() || initialData?.rent?.toString() || "");
//   const [notes, setNotes] = useState(initialData?.notes || "");
//   const [features, setFeatures] = useState(initialData?.features || []);
//   const [waterMeterReading, setWaterMeterReading] = useState("");
//   const [electricityMeterReading, setElectricityMeterReading] = useState("");
//   const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const validateForm = (): ValidationErrors => {
//     const errors: ValidationErrors = {};
//     if (!selectedPropertyId) errors.propertyId = "Please select a property";
//     if (!unitNumber.trim()) errors.unitNumber = "Unit number/name is required";
//     if (!selectedUnitType) errors.unitType = "Please select a unit type";
//     if (rentAmount && parseFloat(rentAmount) < 0) errors.rentAmount = "Rent cannot be negative";
//     return errors;
//   };

//   const handleSubmit = async () => {
//     const errors = validateForm();
//     if (Object.keys(errors).length) {
//       setValidationErrors(errors);
//       setActiveTab("basic-info");
//       toast({ title: "Validation Error", description: "Please correct the highlighted errors.", variant: "destructive" });
//       return;
//     }

//     setIsSubmitting(true);

//     const unitData: UnitData = {
//       property_id: selectedPropertyId,
//       unit_number: unitNumber, // Changed from number to unit_number to match DB schema
//       unit_type: selectedUnitType, // Changed from type to unit_type to match DB schema
//       rent_amount: parseFloat(rentAmount) || 0, // Changed from rent to rent_amount to match DB schema
//       notes,
//       features,
//       status: isEditing ? initialData?.status || "vacant" : "vacant",
//     };

//     try {
//       const { error, data } = isEditing
//         ? await supabase.from("units").update(unitData as any).eq("id", initialData?.id)
//         : await createWithAccountId("units", unitData, supabase as unknown as SupabaseClient<any, "public", any>);

//       if (error) throw error;

//       toast({ title: `Unit ${isEditing ? "updated" : "created"}`, description: `Unit ${unitNumber} saved successfully.` });

//       // Make sure data exists and has an id property
//       const unitId = Array.isArray(data) ? data[0]?.id : data?.id;
      
//       if (waterMeterReading && unitId) {
//         await createWithAccountId(
//           "meters", 
//           { 
//             unit_id: unitId, 
//             type: "water", 
//             reading: parseFloat(waterMeterReading) || 0, 
//             reading_date: new Date().toISOString() 
//           }, 
//           supabase as unknown as SupabaseClient<any, "public", any>
//         );
//       }

//       if (electricityMeterReading && unitId) {
//         await createWithAccountId(
//           "meters", 
//           { 
//             unit_id: unitId, 
//             type: "electricity", 
//             reading: parseFloat(electricityMeterReading) || 0, 
//             reading_date: new Date().toISOString() 
//           }, 
//           supabase as unknown as SupabaseClient<any, "public", any>
//         );
//       }

//       if (onSuccess) onSuccess();
//       if (onClose) onClose();
//     } catch (error: any) {
//       toast({ title: "Error", description: error.message || "An error occurred", variant: "destructive" });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>{isEditing ? "Edit Unit" : "Add New Unit"}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {/* Tabs and form fields as structured previously, simplified for brevity */}
//         <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Unit"}</Button>
//       </CardContent>
//     </Card>
//   );
// };

// export default UnitForm;
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, DollarSign, Droplet, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAccountScoping } from "@/hooks/useAccountScoping";
import { SupabaseClient } from "@supabase/supabase-js";

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

interface ValidationErrors {
  propertyId?: string;
  unitNumber?: string;
  unitType?: string;
  rentAmount?: string;
  [key: string]: string | undefined;
}

interface Property {
  id: string;
  name: string;
}

interface UnitFormProps {
  properties?: Property[];
  initialData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface UnitData {
  property_id: string;
  unit_number: string;
  unit_type: string;
  rent_amount: number;
  notes: string;
  features: any[];
  status: string;
}

const UnitForm = ({ properties = [], initialData, isEditing = false, onSuccess, onClose }: UnitFormProps) => {
  const { toast } = useToast();
  const { createWithAccountId } = useAccountScoping();

  const [activeTab, setActiveTab] = useState("basic-info");
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialData?.property_id || "");
  const [unitNumber, setUnitNumber] = useState(initialData?.unit_number || initialData?.number || "");
  const [selectedUnitType, setSelectedUnitType] = useState(initialData?.unit_type || initialData?.type || "");
  const [rentAmount, setRentAmount] = useState(initialData?.rent_amount?.toString() || initialData?.rent?.toString() || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [features, setFeatures] = useState(initialData?.features || []);
  const [waterMeterReading, setWaterMeterReading] = useState("");
  const [electricityMeterReading, setElectricityMeterReading] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!selectedPropertyId) errors.propertyId = "Please select a property";
    if (!unitNumber.trim()) errors.unitNumber = "Unit number/name is required";
    if (!selectedUnitType) errors.unitType = "Please select a unit type";
    if (rentAmount && parseFloat(rentAmount) < 0) errors.rentAmount = "Rent cannot be negative";
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      setActiveTab("basic-info");
      toast({ title: "Validation Error", description: "Please correct the highlighted errors.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const unitData: UnitData = {
      property_id: selectedPropertyId,
      unit_number: unitNumber,
      unit_type: selectedUnitType,
      rent_amount: parseFloat(rentAmount) || 0,
      notes,
      features,
      status: isEditing ? initialData?.status || "vacant" : "vacant",
    };

    try {
      console.log("Submitting unit data:", unitData);
      const { error, data } = isEditing
        ? await supabase.from("units").update(unitData as any).eq("id", initialData?.id)
        : await createWithAccountId("units", unitData, supabase as unknown as SupabaseClient<any, "public", any>);

      if (error) throw error;

      toast({ title: `Unit ${isEditing ? "updated" : "created"}`, description: `Unit ${unitNumber} saved successfully.` });

      // Make sure data exists and has an id property
      const unitId = Array.isArray(data) ? data[0]?.id : data?.id;
      
      if (waterMeterReading && unitId) {
        await createWithAccountId(
          "meters", 
          { 
            unit_id: unitId, 
            type: "water", 
            reading: parseFloat(waterMeterReading) || 0, 
            reading_date: new Date().toISOString() 
          }, 
          supabase as unknown as SupabaseClient<any, "public", any>
        );
      }

      if (electricityMeterReading && unitId) {
        await createWithAccountId(
          "meters", 
          { 
            unit_id: unitId, 
            type: "electricity", 
            reading: parseFloat(electricityMeterReading) || 0, 
            reading_date: new Date().toISOString() 
          }, 
          supabase as unknown as SupabaseClient<any, "public", any>
        );
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Error saving unit:", error);
      toast({ title: "Error", description: error.message || "An error occurred", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Unit" : "Add New Unit"}</CardTitle>
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
                <Select 
                  value={selectedPropertyId}
                  onValueChange={setSelectedPropertyId}
                  disabled={isSubmitting}
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
                {validationErrors.propertyId && (
                  <p className="text-sm text-red-500">{validationErrors.propertyId}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitNumber">Unit Number/Name*</Label>
                <Input 
                  id="unitNumber" 
                  placeholder="e.g. A101" 
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  disabled={isSubmitting}
                />
                {validationErrors.unitNumber && (
                  <p className="text-sm text-red-500">{validationErrors.unitNumber}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitType">Unit Type*</Label>
              <Select
                value={selectedUnitType}
                onValueChange={setSelectedUnitType}
                disabled={isSubmitting}
              >
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
              {validationErrors.unitType && (
                <p className="text-sm text-red-500">{validationErrors.unitType}</p>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <div></div>
              <Button onClick={() => setActiveTab("financial")} type="button" disabled={isSubmitting}>
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
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  disabled={isSubmitting}
                />
                {validationErrors.rentAmount && (
                  <p className="text-sm text-red-500">{validationErrors.rentAmount}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Unit Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter any notes about this unit" 
                className="min-h-24"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("basic-info")} type="button" disabled={isSubmitting}>
                Previous
              </Button>
              <Button onClick={() => setActiveTab("utilities")} type="button" disabled={isSubmitting}>
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
                        value={waterMeterReading}
                        onChange={(e) => setWaterMeterReading(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
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
                        value={electricityMeterReading}
                        onChange={(e) => setElectricityMeterReading(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("financial")} type="button" disabled={isSubmitting}>
                Previous
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Unit"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UnitForm;