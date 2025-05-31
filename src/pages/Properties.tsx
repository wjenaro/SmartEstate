
import { useState, useEffect } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download, FileText, Filter, Plus, Search, Building, MapPin } from "lucide-react";
import { PropertyForm } from "@/components/forms/PropertyForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useProperties } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountBadge } from "@/components/ui/account-badge";
import { useAccountScoping } from "@/hooks/useAccountScoping";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription";

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const { data: properties, isLoading, error, refetch } = useProperties();
  const { isAuthenticated } = useAccountScoping();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Subscribe to real-time updates
  useRealTimeSubscription('properties', ['properties']);
  
  // Filter properties based on search query and filter type
  const filteredProperties = properties?.filter(
    (property: any) => {
      const matchesSearch = 
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filterType === "all" ||
        (filterType === "residential" && property.property_type === "residential") ||
        (filterType === "commercial" && property.property_type === "commercial");
      
      return matchesSearch && matchesFilter;
    }
  ) || [];

  // Handle refetch on error
  useEffect(() => {
    if (error) {
      console.error("Error in Properties component:", error);
      
      // Show error toast
      toast({
        title: "Error loading properties",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // Handle export function
  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: `Exporting properties as ${format.toUpperCase()}`,
      description: "Your file will be ready for download shortly."
    });
    setIsExportDialogOpen(false);
    // Actual export implementation would go here
  };

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
              aria-label="Search properties"
            />
          </div>
          <div className="flex gap-2 self-end">
            <div className="flex items-center space-x-2">
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                aria-label="Filter property type"
              >
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <Button 
              variant="outline"
              onClick={() => setIsExportDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              title="Refresh data"
              aria-label="Refresh properties"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            </Button>
          </div>
        </div>
      </Card>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading properties</AlertTitle>
          <AlertDescription>
            There was a problem loading your properties. Please try refreshing the page.
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

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

      {/* Add Property Dialog */}
      <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Fill out the form below to add a new property to your portfolio.
            </DialogDescription>
          </DialogHeader>
          <PropertyForm 
            onSuccess={() => {
              setIsAddPropertyOpen(false);
              toast({
                title: "Property Added",
                description: "Your new property has been successfully added.",
              });
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Properties</DialogTitle>
            <DialogDescription>
              Choose a format to export your properties data.
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

export default Properties;
