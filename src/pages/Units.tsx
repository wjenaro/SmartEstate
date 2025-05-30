
import { useState } from "react";
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
import { Plus, Search, Home, User, Check, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for units
const unitsData = [
  {
    id: 1,
    number: "A101",
    type: "1 Bedroom",
    property: "Riverside Apartments",
    tenant: "John Doe",
    rent: 25000,
    status: "occupied",
    features: ["Balcony", "Water Tank", "Internet"],
  },
  {
    id: 2,
    number: "A102",
    type: "1 Bedroom",
    property: "Riverside Apartments",
    tenant: null,
    rent: 25000,
    status: "vacant",
    features: ["Balcony", "Water Tank"],
  },
  {
    id: 3,
    number: "B205",
    type: "2 Bedroom",
    property: "Parklands Residences",
    tenant: "Jane Smith",
    rent: 30000,
    status: "occupied",
    features: ["Balcony", "Water Tank", "Internet", "Parking"],
  },
  {
    id: 4,
    number: "C304",
    type: "Studio",
    property: "Westlands Heights",
    tenant: "Michael Johnson",
    rent: 20000,
    status: "occupied",
    features: ["Water Tank", "Internet"],
  },
  {
    id: 5,
    number: "A205",
    type: "1 Bedroom",
    property: "Riverside Apartments",
    tenant: "Sarah Williams",
    rent: 25000,
    status: "occupied",
    features: ["Balcony", "Water Tank", "Internet"],
  },
  {
    id: 6,
    number: "D102",
    type: "3 Bedroom",
    property: "Kilimani Plaza",
    tenant: "Robert Brown",
    rent: 45000,
    status: "occupied",
    features: ["Balcony", "Water Tank", "Internet", "Parking", "DSQ"],
  },
  {
    id: 7,
    number: "B210",
    type: "2 Bedroom",
    property: "Parklands Residences",
    tenant: null,
    rent: 30000,
    status: "vacant",
    features: ["Balcony", "Water Tank", "Parking"],
  },
];

// Unit Form Component
const UnitForm = () => {
  return (
    <Card className="w-full">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Add New Unit</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="property" className="text-sm font-medium">
                Property
              </label>
              <Select>
                <SelectTrigger id="property">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Riverside Apartments</SelectItem>
                  <SelectItem value="2">Parklands Residences</SelectItem>
                  <SelectItem value="3">Westlands Heights</SelectItem>
                  <SelectItem value="4">Kilimani Plaza</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="unitNumber" className="text-sm font-medium">
                Unit Number
              </label>
              <Input id="unitNumber" placeholder="e.g. A101" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="unitType" className="text-sm font-medium">
                Unit Type
              </label>
              <Select>
                <SelectTrigger id="unitType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="1br">1 Bedroom</SelectItem>
                  <SelectItem value="2br">2 Bedroom</SelectItem>
                  <SelectItem value="3br">3 Bedroom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="rent" className="text-sm font-medium">
                Monthly Rent (KES)
              </label>
              <Input id="rent" placeholder="Enter rent amount" type="number" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Features & Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {["Balcony", "Water Tank", "Internet", "Parking", "DSQ", "Furnished"].map((feature) => (
                <label key={feature} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input id="description" placeholder="Enter description" />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit">Save Unit</Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

const Units = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  
  const filteredUnits = unitsData
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
            {filteredUnits.length === 0 ? (
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
          <UnitForm />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Units;
