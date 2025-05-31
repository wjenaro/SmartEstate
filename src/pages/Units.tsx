import React, { useState, useEffect } from "react";
import { useUnits } from "@/hooks/useUnits";
import { useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";

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
import { Plus, Search, Home, User, Check, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  rent_amount: number;
  status: string;
  features: string[];
}

const Units = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const { data: units = [], isLoading, error } = useUnits();
  const { data: properties = [], isLoading: propertiesLoading } = useProperties();
  
  // Process units to match the format needed for display
  const processedUnits = units.map(unit => {
    // Type guard to ensure we're only processing valid unit objects
    if (!unit || typeof unit !== 'object' || 'error' in unit) {
      console.error('Error processing unit:', unit);
      return null;
    }
    
    // Use type assertion with a more specific type to address property access issues
    const unitData = unit as any;
    
    return {
      id: unitData.id,
      unit_number: unitData.unit_number,
      unit_type: unitData.unit_type,
      property: unitData.property?.name || 'Unknown Property',
      property_id: unitData.property_id,
      tenant: unitData.tenants?.[0] ? `${unitData.tenants[0].first_name} ${unitData.tenants[0].last_name}` : null,
      rent_amount: unitData.rent_amount || 0,
      status: unitData.status,
      features: unitData.features || []
    };
  }).filter(Boolean) as Unit[];
  
  // Filter units based on search term and status
  const filteredUnits = processedUnits
    .filter(
      (unit) =>
        unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.unit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (unit.tenant && unit.tenant.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter((unit) => statusFilter === "all" || unit.status === statusFilter);

  // Navigate to unit details page
  const handleUnitClick = (unit: Unit) => {
    navigate(`/units/${unit.id}`);
  };

  const handleEditUnit = (unit: Unit) => {
    setSelectedUnit({
      ...unit,
      unit_number: unit.unit_number,
      unit_type: unit.unit_type,
      rent_amount: unit.rent_amount
    });
    setIsEditDialogOpen(true);
  };

  // Extract valid properties for UnitForm
  const validProperties = properties
    .filter((p): p is any => 
      p && typeof p === 'object' && 'id' in p && 'name' in p)
    .map(p => {
      // Ensure p is non-null before accessing properties
      if (!p) return null;
      return {
        id: p.id,
        name: p.name
      };
    })
    .filter((p): p is Property => p !== null) as Property[];

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                      <span className="font-medium">{unit.unit_number}</span>
                    </div>
                  </TableCell>
                  <TableCell>{unit.property}</TableCell>
                  <TableCell>{unit.unit_type}</TableCell>
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
                  <TableCell>KES {unit.rent_amount.toLocaleString()}</TableCell>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleUnitClick(unit);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>
              Update the details for this unit.
            </DialogDescription>
          </DialogHeader>
          <UnitForm 
            properties={validProperties}
            initialData={selectedUnit} 
            isEditing={true}
            onSuccess={() => {
              setIsEditDialogOpen(false);
            }} 
            onClose={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
            <DialogDescription>
              Fill out the form to add a new unit to your property inventory.
            </DialogDescription>
          </DialogHeader>
          <UnitForm 
            properties={validProperties}
            onSuccess={() => {
              setIsAddUnitOpen(false);
              // Reload units if needed
            }} 
            onClose={() => setIsAddUnitOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Units;
