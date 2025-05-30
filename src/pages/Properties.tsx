
import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Plus, Search, Building, MapPin } from "lucide-react";
import { PropertyForm } from "@/components/forms/PropertyForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountBadge } from "@/components/ui/account-badge";
import { useAccountScoping } from "@/hooks/useAccountScoping";

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const { data: properties, isLoading, error } = useProperties();
  const { isAuthenticated } = useAccountScoping();
  
  console.log("Properties data:", properties);
  console.log("Loading state:", isLoading);
  console.log("Error state:", error);

  const filteredProperties = properties?.filter(
    (property: any) =>
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (error) {
    console.error("Error in Properties component:", error);
  }

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center">
            <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
            <AccountBadge />
          </div>
          <p className="text-muted-foreground">
            Manage your properties and view their status.
          </p>
        </div>
        <Button className="w-full md:w-auto" onClick={() => setIsAddPropertyOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Property
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-8 w-full bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 self-end">
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Property</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Caretaker</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-red-500">
                  Error loading properties. Please check console for details.
                </TableCell>
              </TableRow>
            ) : filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No properties found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map((property: any) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{property.name}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.address}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{property.total_units} Units</div>
                      <div className="text-sm text-muted-foreground">
                        Total units in property
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{property.property_type}</span>
                  </TableCell>
                  <TableCell>{property.caretaker_name || "Not assigned"}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/properties/${property.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
        <DialogContent className="max-w-3xl">
          <PropertyForm />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Properties;
