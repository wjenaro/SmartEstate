
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Home, User, Check, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useProperties } from "@/hooks/useProperties";
import { useUnits, useAddUnit, type Unit } from "@/hooks/useUnits";

// Unit types options
const UNIT_TYPES = [
  { id: "studio", label: "Studio" },
  { id: "1br", label: "1 Bedroom" },
  { id: "2br", label: "2 Bedroom" },
  { id: "3br", label: "3 Bedroom" },
  { id: "4br", label: "4 Bedroom" },
  { id: "5br", label: "5+ Bedroom" },
  { id: "penthouse", label: "Penthouse" },
  { id: "duplex", label: "Duplex" },
  { id: "commercial", label: "Commercial" },
  { id: "office", label: "Office" },
  { id: "shop", label: "Shop" },
  { id: "warehouse", label: "Warehouse" }
];

// Features options
const FEATURES = [
  { id: "balcony", label: "Balcony" },
  { id: "water_tank", label: "Water Tank" },
  { id: "internet", label: "Internet" },
  { id: "parking", label: "Parking" },
  { id: "dsq", label: "DSQ" },
  { id: "furnished", label: "Furnished" },
  { id: "security", label: "Security" },
  { id: "garden", label: "Garden" },
  { id: "gym", label: "Gym" }
];

// Unit form validation schema
const unitFormSchema = z.object({
  property_id: z.string({
    required_error: "Property is required",
  }),
  unit_number: z.string({
    required_error: "Unit number is required",
  }),
  unit_type: z.string({
    required_error: "Unit type is required",
  }),
  rent_amount: z.union([
    z.number().positive("Rent must be a positive number").multipleOf(0.01, "Rent must have at most 2 decimal places"),
    z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Rent must be a positive number"
    }).transform(val => parseFloat(val))
  ]).optional().nullable(),
  status: z.enum(["vacant", "occupied"]).default("vacant"),
  notes: z.string().optional().nullable(),
  features: z.array(z.string()).optional().default([])
});

type UnitFormValues = z.infer<typeof unitFormSchema>;

// Unit Form Component with real-time data
const UnitForm = ({ onClose }: { onClose: () => void }) => {
  const { data: properties, isLoading: loadingProperties } = useProperties();
  const addUnit = useAddUnit();
  const { toast } = useToast();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [availableUnitTypes, setAvailableUnitTypes] = useState<Array<{id: string, label: string}>>(UNIT_TYPES);
  
  // Initialize form with Zod schema validation
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      unit_number: "",
      status: "vacant",
      features: []
    }
  });

  // Handle feature checkbox changes
  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
  };

  // Update form value when features change
  useEffect(() => {
    form.setValue('features', selectedFeatures);
  }, [selectedFeatures, form]);
  
  // Update available unit types when property selection changes
  useEffect(() => {
    if (!selectedProperty) {
      setAvailableUnitTypes(UNIT_TYPES);
      return;
    }
    
    // Find the selected property
    const property = properties?.find(p => p.id === selectedProperty);
    if (!property) return;
    
    // Check if property has unit_types defined
    if (property.unit_types && Object.keys(property.unit_types).length > 0) {
      // Filter unit types based on property's unit_types
      const propertyUnitTypes = Object.keys(property.unit_types);
      const filteredTypes = UNIT_TYPES.filter(type => 
        propertyUnitTypes.includes(type.id) || 
        propertyUnitTypes.some(pt => pt.includes(type.id.toLowerCase()))
      );
      
      setAvailableUnitTypes(filteredTypes.length > 0 ? filteredTypes : UNIT_TYPES);
    } else {
      // If no unit_types defined for the property, show all
      setAvailableUnitTypes(UNIT_TYPES);
    }
    
    // Clear the unit type selection when property changes
    form.setValue('unit_type', '');
  }, [selectedProperty, properties, form]);
  
  // Debug form values to identify missing fields
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log('Form values:', value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: UnitFormValues) => {
    try {
      // Log the values being submitted
      console.log('Submitting unit with data:', values);
      
      // Ensure required fields are present
      if (!values.property_id) {
        form.setError('property_id', { 
          type: 'manual', 
          message: 'Property is required' 
        });
        return;
      }
      
      if (!values.unit_number) {
        form.setError('unit_number', { 
          type: 'manual', 
          message: 'Unit number is required' 
        });
        return;
      }
      
      if (!values.unit_type) {
        form.setError('unit_type', { 
          type: 'manual', 
          message: 'Unit type is required' 
        });
        return;
      }
      
      await addUnit.mutateAsync({
        property_id: values.property_id,
        unit_number: values.unit_number,
        unit_type: values.unit_type,
        rent_amount: values.rent_amount,
        status: values.status || 'vacant',
        notes: values.notes || null,
        features: values.features || []
      });
      
      toast({
        title: "Success",
        description: "Unit has been added successfully",
        variant: "default",
      });
      
      onClose();
    } catch (error) {
      console.error("Error adding unit:", error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : "Failed to add unit. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Add New Unit</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="property_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property <span className="text-red-500">*</span></FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedProperty(value);
                    }}
                    value={field.value}
                    required
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingProperties ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        properties?.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Number <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., A1, 101" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="unit_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Type <span className="text-red-500">*</span></FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                    required
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUnitTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rent_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rent (KES)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      min="0" 
                      step="0.01"
                      placeholder="Enter rent amount" 
                      onChange={e => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-2">
            <FormLabel>Features & Amenities</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {FEATURES.map((feature) => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`feature-${feature.id}`} 
                    checked={selectedFeatures.includes(feature.id)}
                    onCheckedChange={() => handleFeatureToggle(feature.id)}
                  />
                  <label 
                    htmlFor={`feature-${feature.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {feature.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter any notes" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addUnit.isPending}>
              {addUnit.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Unit"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const Units = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  
  // Fetch units with real-time data
  const { data: units = [], isLoading, error } = useUnits();
  
  // Process units to match the format needed for display
  const processedUnits = units.map(unit => ({
    id: unit.id,
    number: unit.unit_number,
    type: unit.unit_type,
    property: unit.property?.name || 'Unknown Property',
    property_id: unit.property_id,
    tenant: unit.tenants?.[0] ? `${unit.tenants[0].first_name} ${unit.tenants[0].last_name}` : null,
    rent: unit.rent_amount || 0,
    status: unit.status,
    features: unit.features || []
  }));
  
  // Filter units based on search query and status filter
  const filteredUnits = processedUnits
    .filter(
      (unit) =>
        unit.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (unit.tenant && unit.tenant.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter((unit) => statusFilter === "all" || unit.status === statusFilter);

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Units</h1>
          <p className="text-muted-foreground">Manage your rental units and houses.</p>
        </div>
        <Button className="w-full md:w-auto" onClick={() => setIsAddUnitOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Unit
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search units..."
              className="pl-8 w-full bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Filter</Button>
          </div>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Monthly Rent</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-red-500">
                  Error loading units. Please try again.
                </TableCell>
              </TableRow>
            ) : filteredUnits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No units found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Home className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{unit.number}</span>
                    </div>
                  </TableCell>
                  <TableCell>{unit.property}</TableCell>
                  <TableCell>{unit.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {unit.tenant ? (
                        <>
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{unit.tenant}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>KES {unit.rent.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {unit.features.slice(0, 2).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {unit.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{unit.features.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`flex items-center gap-1 ${
                        unit.status === "occupied"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {unit.status === "occupied" ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Occupied</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          <span>Vacant</span>
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
        <DialogContent className="max-w-3xl">
          <UnitForm onClose={() => setIsAddUnitOpen(false)} />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Units;
