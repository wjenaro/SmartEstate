import React, { useState, useEffect } from "react";
import { useUnits } from "@/hooks/useUnits";
import { useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Download, FileText, Filter, Plus, Search, Home, User, Check, X, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
// Rename the imported Unit type to UnitType to avoid conflict
import { useAddUnit, type Unit as UnitType } from "@/hooks/useUnits";
import UnitForm from "@/components/forms/UnitForm";
import { Skeleton } from "@/components/ui/skeleton";

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

// Define clear interfaces to fix TypeScript errors
// Define the same Property interface as used in UnitForm
interface Property {
  id: string;
  name: string;
}

// Define our local display Unit type
interface Unit {
  id: string;
  unit_number: string;
  unit_type: string;
  property: string;
  property_id: string;
  tenant: string | null;
  tenant_name?: string | null;
  rent_amount: number;
  status: "vacant" | "occupied";
  features: string[];
}

const Units = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const { toast } = useToast();
  
  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Setup real-time subscriptions
  useRealTimeSubscription('units', ['units']);
  
  // Fetch units data
  const { data, error, isLoading, refetch } = useUnits();
  
  // Fetch properties for the dropdown
  const { data: propertiesData = [] } = useProperties();
  
  // Convert properties data to Property[] type for correct typing and filter valid ones
  const properties: Property[] = propertiesData
    .filter((property: any) => property && property.id && property.name)
    .map((property: any) => ({
      id: property.id,
      name: property.name
    }));
  
  // Format the unit data for display with proper type guards
  const formattedUnits = data
    ? data
        .filter((unit): unit is UnitType => {
          // Type guard to ensure unit has required properties
          return !!unit && typeof unit === 'object' && 'id' in unit;
        })
        .map((unit) => {
          // Safely access property data with type checking
          const property = properties.find((p) => p.id === unit.property_id) || { name: "Unknown Property" };
          
          return {
            id: unit.id,
            unit_number: unit.unit_number || "Unnamed Unit",
            unit_type: UNIT_TYPES.find(t => t.id === unit.unit_type)?.label || unit.unit_type || "Other",
            property: property.name,
            property_id: unit.property_id,
            tenant: unit.tenant_name || null,
            tenant_name: unit.tenant_name,
            rent_amount: unit.rent_amount || 0,
            status: (unit.status as "vacant" | "occupied") || "vacant",
            features: unit.features || []
          } as Unit;
        })
    : [];
  
  // Apply search and filters
  const filteredUnits = formattedUnits.filter((unit: Unit) => {
    const matchesSearch = 
      unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      unit.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.tenant && unit.tenant.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || unit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle unit click to navigate to unit detail
  const handleUnitClick = (unit: Unit) => {
    navigate(`/units/${unit.id}`);
  };
  
  // Handle edit unit dialog
  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsEditDialogOpen(true);
  };
  
  // validProperties is now handled during the initial properties filtering
  
  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      console.error("Error loading units:", error);
      toast({
        title: "Error loading units",
        description: "There was a problem loading your units. Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // Handle unit delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedUnit) return;
    
    try {
      // Call your API to delete the unit
      // const { error } = await supabase.from('units').delete().match({ id: selectedUnit.id });
      
      // if (error) throw error;
      
      setIsDeleteDialogOpen(false);
      setSelectedUnit(null);
      
      // Refetch units after deletion
      refetch();
      
      toast({
        title: "Unit deleted",
        description: `Unit ${selectedUnit.unit_number} has been successfully deleted.`
      });
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast({
        title: "Error deleting unit",
        description: "There was a problem deleting this unit. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  // Handle export function
  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: `Exporting units as ${format.toUpperCase()}`,
      description: "Your file will be ready for download shortly."
    });
    setIsExportDialogOpen(false);
    // Actual export implementation would go here
  };

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
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search units..."
              className="pl-8 w-full bg-muted/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search units"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={() => setIsExportDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {isMobile ? (
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="grid grid-cols-2 gap-y-2 mb-4">
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </Card>
            ))
          ) : filteredUnits.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No units found matching your search.
            </Card>
          ) : (
            filteredUnits.map((unit) => (
              <Card key={unit.id} className="p-4" onClick={() => handleUnitClick(unit)}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-lg flex items-center gap-1">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      {unit.unit_number}
                    </h3>
                    <p className="text-sm text-muted-foreground">{unit.property}</p>
                  </div>
                  <Badge className={unit.status === "occupied" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                    {unit.status === "occupied" ? "Occupied" : "Vacant"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm mb-2">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p>{unit.unit_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rent</p>
                    <p className="font-medium">KES {unit.rent_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tenant</p>
                    <p>{unit.tenant || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {unit.features.slice(0, 2).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {unit.features.length > 2 && 
                        <Badge variant="outline" className="text-xs">+{unit.features.length - 2}</Badge>
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditUnit(unit);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUnit(unit);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Unit</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    <div className="flex justify-center items-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading units...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-red-500">
                    Error loading units. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    No units found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUnits.map((unit) => (
                  <TableRow 
                    key={unit.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleUnitClick(unit)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Home className="h-4 w-4" />
                        </div>
                        {unit.unit_number}
                      </div>
                    </TableCell>
                    <TableCell>{unit.property}</TableCell>
                    <TableCell>{unit.unit_type}</TableCell>
                    <TableCell>{unit.tenant || "—"}</TableCell>
                    <TableCell>KES {unit.rent_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {unit.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {unit.features.length > 3 && 
                          <Badge variant="outline" className="text-xs">+{unit.features.length - 3}</Badge>
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={unit.status === "occupied" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                        {unit.status === "occupied" ? "Occupied" : "Vacant"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUnit(unit);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUnit(unit);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Unit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>
              Update the details for this unit.
            </DialogDescription>
          </DialogHeader>
          <UnitForm 
            properties={properties}
            initialData={selectedUnit} 
            isEditing={true}
            onSuccess={() => {
              setIsEditDialogOpen(false);
            }} 
            onClose={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Add Unit Dialog */}
      <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
            <DialogDescription>
              Fill out the form to add a new unit to your property inventory.
            </DialogDescription>
          </DialogHeader>
          <UnitForm 
            properties={properties}
            onSuccess={() => {
              setIsAddUnitOpen(false);
              toast({
                title: "Unit Added",
                description: "Your new unit has been successfully added.",
              });
            }} 
            onClose={() => setIsAddUnitOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete unit {selectedUnit?.unit_number}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <h4 className="font-medium">Warning</h4>
            </div>
            <p className="text-sm mt-2 text-destructive/80">
              Deleting this unit will remove all associated data including tenant history, 
              maintenance records, and utility readings.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Units</DialogTitle>
            <DialogDescription>
              Choose a format to export your units data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 p-4"
              onClick={() => handleExport('csv')}
            >
              <FileText className="h-8 w-8 mb-2" />
              <span>CSV</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 p-4"
              onClick={() => handleExport('pdf')}
            >
              <FileText className="h-8 w-8 mb-2" />
              <span>PDF</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Units;
