import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplet, Zap, Calculator, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

interface Property {
  id: string;
  name: string;
  water_rate?: number;
  electricity_rate?: number;
}

interface Unit {
  id: string;
  unit_number: string;
}

interface UtilityReadingFormProps {
  properties?: Property[];
  units?: Unit[];
  onClose?: () => void;
  propertyId?: string;
  onPropertyChange?: (propertyId: string) => void;
  onSuccess?: () => void;
}

export function UtilityReadingForm({
  properties = [],
  units = [],
  onClose,
  propertyId,
  onPropertyChange,
  onSuccess
}: UtilityReadingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedUtilities, setSelectedUtilities] = useState<Array<"water" | "electricity">>(["water"]);
  const [waterCurrentReading, setWaterCurrentReading] = useState<number | "">("");
  const [waterPreviousReading, setWaterPreviousReading] = useState<number | "">("");
  const [waterCalculatedAmount, setWaterCalculatedAmount] = useState<number | null>(null);
  const [electricityCurrentReading, setElectricityCurrentReading] = useState<number | "">("");
  const [electricityPreviousReading, setElectricityPreviousReading] = useState<number | "">("");
  const [electricityCalculatedAmount, setElectricityCalculatedAmount] = useState<number | null>(null);
  const [month, setMonth] = useState<string>(new Date().toLocaleString('default', { month: 'long' }));
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<string>("water");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [previousReadings, setPreviousReadings] = useState<{[key: string]: {water?: number, electricity?: number}}>({});
  
  // Find the selected property details
  useEffect(() => {
    if (propertyId) {
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        setSelectedProperty(property);
        // Reset selected unit when property changes
        setSelectedUnit("");
      }
    }
  }, [propertyId, properties]);
  
  // Load previous readings when unit is selected
  useEffect(() => {
    if (selectedProperty && selectedUnit) {
      fetchPreviousReadings(selectedProperty.id, selectedUnit);
    }
  }, [selectedProperty, selectedUnit]);
  
  // Fetch previous utility readings from the database
  const fetchPreviousReadings = async (propertyId: string, unitId: string) => {
    try {
      const { data, error } = await supabase
        .from('unit_utilities')
        .select('*')
        .eq('property_id', propertyId)
        .eq('unit_id', unitId)
        .order('reading_date', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Use the most recent readings as previous readings
        setPreviousReadings({ [unitId]: {
          water: data[0].utility_type === 'water' ? data[0].current_reading : undefined,
          electricity: data[0].utility_type === 'electricity' ? data[0].current_reading : undefined
        }});
        
        // Set the previous readings in the form
        if (data[0].utility_type === 'water') {
          setWaterPreviousReading(data[0].current_reading);
        } else if (data[0].utility_type === 'electricity') {
          setElectricityPreviousReading(data[0].current_reading);
        }
      }
    } catch (error) {
      console.error('Error fetching previous readings:', error);
      toast({
        title: "Error fetching previous readings",
        description: "There was a problem retrieving previous utility readings.",
        variant: "destructive"
      });
    }
  };
  
  // Toggle utility selection
  const toggleUtility = (type: "water" | "electricity") => {
    setSelectedUtilities(prev => {
      if (prev.includes(type)) {
        // Don't allow removing the last utility
        if (prev.length === 1) return prev;
        const newSelection = prev.filter(t => t !== type);
        // Set active tab to the remaining utility if the active one was removed
        if (activeTab === type && newSelection.length > 0) {
          setActiveTab(newSelection[0]);
        }
        return newSelection;
      } else {
        return [...prev, type];
      }
    });
  };
  
  // Validate form inputs
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Validate property and unit selection
    if (!selectedProperty) errors.property = "Please select a property";
    if (!selectedUnit) errors.unit = "Please select a unit";
    
    // Validate utility-specific fields
    if (selectedUtilities.includes("water")) {
      if (waterCurrentReading === "") errors.waterCurrentReading = "Current water reading is required";
      if (waterCurrentReading !== "" && waterPreviousReading !== "" && 
          Number(waterCurrentReading) < Number(waterPreviousReading)) {
        errors.waterCurrentReading = "Current reading cannot be less than previous reading";
      }
    }
    
    if (selectedUtilities.includes("electricity")) {
      if (electricityCurrentReading === "") errors.electricityCurrentReading = "Current electricity reading is required";
      if (electricityCurrentReading !== "" && electricityPreviousReading !== "" && 
          Number(electricityCurrentReading) < Number(electricityPreviousReading)) {
        errors.electricityCurrentReading = "Current reading cannot be less than previous reading";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle property selection
  const handlePropertySelect = (id: string) => {
    if (onPropertyChange) {
      onPropertyChange(id);
    }
    
    const property = properties.find(p => p.id === id);
    if (property) {
      setSelectedProperty(property);
    }
  };
  
  // Calculate water consumption and amount
  const calculateWaterAmount = () => {
    if (waterCurrentReading === "") {
      setValidationErrors(prev => ({
        ...prev,
        waterCurrentReading: "Current water reading is required"
      }));
      return;
    }
    
    if (waterPreviousReading === "") {
      // If no previous reading, use 0
      const consumption = Number(waterCurrentReading);
      const rate = selectedProperty?.water_rate || 0;
      const amount = consumption * rate;
      setWaterCalculatedAmount(amount);
      return;
    }
    
    const consumption = Number(waterCurrentReading) - Number(waterPreviousReading);
    if (consumption < 0) {
      setValidationErrors(prev => ({
        ...prev,
        waterCurrentReading: "Current reading cannot be less than previous reading"
      }));
      return;
    }
    
    // Clear validation errors if calculation is successful
    setValidationErrors(prev => {
      const newErrors = {...prev};
      delete newErrors.waterCurrentReading;
      return newErrors;
    });
    
    const rate = selectedProperty?.water_rate || 0;
    const amount = consumption * rate;
    setWaterCalculatedAmount(amount);
  };

  // Calculate electricity consumption and amount
  const calculateElectricityAmount = () => {
    if (electricityCurrentReading === "") {
      setValidationErrors(prev => ({
        ...prev,
        electricityCurrentReading: "Current electricity reading is required"
      }));
      return;
    }
    
    if (electricityPreviousReading === "") {
      // If no previous reading, use 0
      const consumption = Number(electricityCurrentReading);
      const rate = selectedProperty?.electricity_rate || 0;
      const amount = consumption * rate;
      setElectricityCalculatedAmount(amount);
      return;
    }
    
    const consumption = Number(electricityCurrentReading) - Number(electricityPreviousReading);
    if (consumption < 0) {
      setValidationErrors(prev => ({
        ...prev,
        electricityCurrentReading: "Current reading cannot be less than previous reading"
      }));
      return;
    }
    
    // Clear validation errors if calculation is successful
    setValidationErrors(prev => {
      const newErrors = {...prev};
      delete newErrors.electricityCurrentReading;
      return newErrors;
    });
    
    const rate = selectedProperty?.electricity_rate || 0;
    const amount = consumption * rate;
    setElectricityCalculatedAmount(amount);
  };
  
  // Reset form fields to initial state
  const resetForm = () => {
    setSelectedUtilities(["water"]);
    setWaterCurrentReading("");
    setWaterPreviousReading("");
    setWaterCalculatedAmount(null);
    setElectricityCurrentReading("");
    setElectricityPreviousReading("");
    setElectricityCalculatedAmount(null);
    setActiveTab("water");
    setValidationErrors({});
    
    // Keep the current month and year
    const currentDate = new Date();
    setMonth(currentDate.toLocaleString('default', { month: 'long' }));
    setYear(currentDate.getFullYear());
  };
  
  // Calculate all applicable amounts
  const calculateAllAmounts = () => {
    // Clear all relevant validation errors first
    setValidationErrors(prev => {
      const newErrors = {...prev};
      delete newErrors.waterCurrentReading;
      delete newErrors.electricityCurrentReading;
      return newErrors;
    });
    
    if (selectedUtilities.includes("water")) {
      calculateWaterAmount();
    }
    if (selectedUtilities.includes("electricity")) {
      calculateElectricityAmount();
    }
  };
  
  // Save utility readings to the database
  const saveReadings = async () => {
    if (!validateForm()) {
      // If validation fails, switch to the tab with errors
      if (validationErrors.waterCurrentReading && selectedUtilities.includes("water")) {
        setActiveTab("water");
      } else if (validationErrors.electricityCurrentReading && selectedUtilities.includes("electricity")) {
        setActiveTab("electricity");
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create date in YYYY-MM-DD format for SQL DATE type
      const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1;
      const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : monthIndex.toString();
      const readingDate = `${year}-${formattedMonth}-01`;
      const readings = [];
      
      // Prepare water reading data if selected
      if (selectedUtilities.includes("water") && waterCurrentReading !== "") {
        const waterConsumption = waterPreviousReading !== "" 
          ? Number(waterCurrentReading) - Number(waterPreviousReading)
          : Number(waterCurrentReading);
          
        readings.push({
          property_id: selectedProperty?.id,
          unit_id: selectedUnit,
          utility_type: "water",
          current_reading: Number(waterCurrentReading),
          previous_reading: waterPreviousReading !== "" ? Number(waterPreviousReading) : null,
          reading_date: readingDate,
          month: month,
          year: year,
          rate: selectedProperty?.water_rate || null,
          amount: waterCalculatedAmount || (waterConsumption * (selectedProperty?.water_rate || 0)),
          notes: "Added via SmartEstate system"
        });
      }
      
      // Prepare electricity reading data if selected
      if (selectedUtilities.includes("electricity") && electricityCurrentReading !== "") {
        const electricityConsumption = electricityPreviousReading !== "" 
          ? Number(electricityCurrentReading) - Number(electricityPreviousReading)
          : Number(electricityCurrentReading);
          
        readings.push({
          property_id: selectedProperty?.id,
          unit_id: selectedUnit,
          utility_type: "electricity",
          current_reading: Number(electricityCurrentReading),
          previous_reading: electricityPreviousReading !== "" ? Number(electricityPreviousReading) : null,
          reading_date: readingDate,
          month: month,
          year: year,
          rate: selectedProperty?.electricity_rate || null,
          amount: electricityCalculatedAmount || (electricityConsumption * (selectedProperty?.electricity_rate || 0)),
          notes: "Added via SmartEstate system"
        });
      }
      
      // Insert readings into the database
      if (readings.length > 0) {
        console.log('Saving utility readings:', readings);
        
        // Insert into unit_utilities table
        const { error } = await supabase
          .from('unit_utilities')
          .insert(readings);
          
        if (error) {
          console.error('Error saving utility readings:', error);
          throw error;
        }
        
        toast({
          title: "Utility readings saved",
          description: `Successfully recorded ${readings.length} utility reading(s).`,
          variant: "default"
        });
        
        if (onSuccess) onSuccess();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving utility readings:', error);
      toast({
        title: "Error saving readings",
        description: "There was a problem saving the utility readings to the database.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Month options
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {selectedUtilities.includes("water") && <Droplet className="h-5 w-5 text-blue-500" />}
            {selectedUtilities.includes("electricity") && <Zap className="h-5 w-5 text-yellow-500" />}
          </div>
          <span>Record Utility Reading</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Property and Unit Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="property">Property*</Label>
              <Select 
                value={selectedProperty?.id || ""} 
                onValueChange={(value) => {
                  const property = properties.find(p => p.id === value);
                  setSelectedProperty(property || null);
                  // Reset selected unit when property changes
                  setSelectedUnit("");
                  if (onPropertyChange) onPropertyChange(value);
                }}
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
              <Select 
                value={selectedUnit} 
                onValueChange={setSelectedUnit}
                disabled={!selectedProperty}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder={selectedProperty ? "Select unit" : "Select property first"} />
                </SelectTrigger>
                <SelectContent>
                  {units
                    .filter(unit => selectedProperty && unit.property_id === selectedProperty.id)
                    .map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.unit_number}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthSelect">Month*</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id="monthSelect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearInput">Year*</Label>
              <Input 
                id="yearInput" 
                type="number" 
                value={year} 
                onChange={(e) => setYear(parseInt(e.target.value))} 
                required
              />
            </div>
          </div>

          {/* Utility Type Selection */}
          <div className="space-y-2">
            <Label>Select Utilities to Record*</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="water-utility" 
                  checked={selectedUtilities.includes("water")} 
                  onCheckedChange={() => toggleUtility("water")}
                />
                <Label 
                  htmlFor="water-utility" 
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <span>Water</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="electricity-utility" 
                  checked={selectedUtilities.includes("electricity")} 
                  onCheckedChange={() => toggleUtility("electricity")}
                />
                <Label 
                  htmlFor="electricity-utility" 
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Electricity</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Tabs for Different Utilities */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger 
                value="water" 
                disabled={!selectedUtilities.includes("water")}
                className="flex items-center gap-1"
              >
                <Droplet className="h-4 w-4" />
                <span>Water Readings</span>
              </TabsTrigger>
              <TabsTrigger 
                value="electricity" 
                disabled={!selectedUtilities.includes("electricity")}
                className="flex items-center gap-1"
              >
                <Zap className="h-4 w-4" />
                <span>Electricity Readings</span>
              </TabsTrigger>
            </TabsList>

            {/* Water Readings Tab Content */}
            <TabsContent value="water" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waterCurrentReading">Current Reading*</Label>
                  <Input 
                    id="waterCurrentReading" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={waterCurrentReading} 
                    onChange={(e) => setWaterCurrentReading(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder="0.00" 
                    className={validationErrors.waterCurrentReading ? "border-destructive" : ""}
                    required
                  />
                  {validationErrors.waterCurrentReading && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.waterCurrentReading}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waterPreviousReading">Previous Reading</Label>
                  <Input 
                    id="waterPreviousReading" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={waterPreviousReading}
                    onChange={(e) => setWaterPreviousReading(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder="0.00" 
                  />
                </div>
              </div>
              
              <div className="flex justify-center py-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={calculateWaterAmount}
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Calculate Water Amount</span>
                </Button>
              </div>
              
              {waterCalculatedAmount !== null && (
                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Water Calculation Result:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Consumption:</p>
                      <p className="font-medium">
                        {Number(waterCurrentReading) - Number(waterPreviousReading)} units
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rate:</p>
                      <p className="font-medium">
                        KES {selectedProperty?.water_rate?.toFixed(2) || "N/A"}/unit
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Amount to Bill:</p>
                      <p className="text-lg font-bold">KES {waterCalculatedAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Electricity Readings Tab Content */}
            <TabsContent value="electricity" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="electricityCurrentReading">Current Reading*</Label>
                  <Input 
                    id="electricityCurrentReading" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={electricityCurrentReading} 
                    onChange={(e) => setElectricityCurrentReading(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder="0.00" 
                    className={validationErrors.electricityCurrentReading ? "border-destructive" : ""}
                    required
                  />
                  {validationErrors.electricityCurrentReading && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.electricityCurrentReading}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="electricityPreviousReading">Previous Reading</Label>
                  <Input 
                    id="electricityPreviousReading" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={electricityPreviousReading}
                    onChange={(e) => setElectricityPreviousReading(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder="0.00" 
                  />
                </div>
              </div>
              
              <div className="flex justify-center py-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={calculateElectricityAmount}
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Calculate Electricity Amount</span>
                </Button>
              </div>
              
              {electricityCalculatedAmount !== null && (
                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Electricity Calculation Result:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Consumption:</p>
                      <p className="font-medium">
                        {Number(electricityCurrentReading) - Number(electricityPreviousReading)} kWh
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rate:</p>
                      <p className="font-medium">
                        KES {selectedProperty?.electricity_rate?.toFixed(2) || "N/A"}/kWh
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Amount to Bill:</p>
                      <p className="text-lg font-bold">KES {electricityCalculatedAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-center py-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={calculateAllAmounts}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              <span>Calculate All Amounts</span>
            </Button>
          </div>

          {/* Summary of all calculations if both utilities are selected */}
          {(waterCalculatedAmount !== null || electricityCalculatedAmount !== null) && 
           selectedUtilities.length > 1 && (
            <div className="p-4 bg-muted rounded-md border-t-2 border-primary mt-4">
              <h4 className="font-medium mb-2">Total Summary:</h4>
              <div className="space-y-2">
                {waterCalculatedAmount !== null && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-500" />
                      <span>Water</span>
                    </div>
                    <span>KES {waterCalculatedAmount.toFixed(2)}</span>
                  </div>
                )}
                {electricityCalculatedAmount !== null && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>Electricity</span>
                    </div>
                    <span>KES {electricityCalculatedAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>KES {((waterCalculatedAmount || 0) + (electricityCalculatedAmount || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={saveReadings}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⚙️</span>
                  Saving...
                </>
              ) : (
                <>Save Reading{selectedUtilities.length > 1 ? "s" : ""}</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
