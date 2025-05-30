import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Filter, Wrench, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { MaintenanceForm } from "@/components/forms/MaintenanceForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Mock data for maintenance issues
const maintenanceData = [
  {
    id: 1,
    property: "Riverside Apartments",
    unit: "A101",
    issue: "Leaking kitchen sink",
    status: "open",
    date: "2025-05-20",
    expenseAmount: null,
  },
  {
    id: 2,
    property: "Parklands Residences",
    unit: "B205",
    issue: "Faulty electrical outlet in bedroom",
    status: "in_progress",
    date: "2025-05-15",
    expenseAmount: 2500,
  },
  {
    id: 3,
    property: "Riverside Apartments",
    unit: "Common Area",
    issue: "Broken gate at entrance",
    status: "closing",
    date: "2025-05-10",
    expenseAmount: 15000,
  },
  {
    id: 4,
    property: "Westlands Heights",
    unit: "C304",
    issue: "Bathroom tiles cracked",
    status: "open",
    date: "2025-05-25",
    expenseAmount: null,
  },
  {
    id: 5,
    property: "Kilimani Plaza",
    unit: "D102",
    issue: "Water heater not working",
    status: "in_progress",
    date: "2025-05-18",
    expenseAmount: 8000,
  },
];

// Properties mock data
const propertiesData = [
  { id: "1", name: "Riverside Apartments" },
  { id: "2", name: "Parklands Residences" },
  { id: "3", name: "Westlands Heights" },
  { id: "4", name: "Kilimani Plaza" },
];

// Units mock data
const unitsData = [
  { id: "101", unit_number: "A101", property_id: "1" },
  { id: "102", unit_number: "A102", property_id: "1" },
  { id: "103", unit_number: "B205", property_id: "2" },
  { id: "104", unit_number: "C304", property_id: "3" },
  { id: "105", unit_number: "D102", property_id: "4" },
];

const Maintenance = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [propertyFilter, setPropertyFilter] = useState("all-properties");
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter maintenance data based on filters
  const filteredMaintenance = maintenanceData.filter((item) => {
    const matchesSearch = 
      item.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all-statuses" || item.status === statusFilter;
    const matchesProperty = propertyFilter === "all-properties" || item.property === propertiesData.find(p => p.id === propertyFilter)?.name;
    
    return matchesSearch && matchesStatus && matchesProperty;
  });
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Open</span>
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>In Progress</span>
          </Badge>
        );
      case "closing":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Closing</span>
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Get responsive card for mobile view
  const getMaintenanceCard = (item: any) => {
    return (
      <Card key={item.id} className="p-4 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium">{item.property}</h3>
            <p className="text-sm text-muted-foreground">Unit: {item.unit}</p>
          </div>
          {getStatusBadge(item.status)}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex gap-2 items-start">
            <Wrench className="h-4 w-4 mt-1 text-muted-foreground" />
            <p>{item.issue}</p>
          </div>
          
          <div className="flex gap-2 items-center">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{new Date(item.date).toLocaleDateString()}</p>
          </div>
          
          {item.expenseAmount && (
            <div className="flex gap-2 items-center">
              <p className="text-sm font-medium">Expense: KES {item.expenseAmount.toLocaleString()}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" size="sm">View Details</Button>
        </div>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">
            Track and manage maintenance issues across your properties
          </p>
        </div>
        <Button
          className="w-full md:w-auto"
          onClick={() => setIsAddMaintenanceOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Record Maintenance
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search maintenance issues..."
              className="pl-8 w-full bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closing">Closing</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-properties">All Properties</SelectItem>
                {propertiesData.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {isMobile ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={`skeleton-card-${index}`} className="p-4 mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                    </div>
                    <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="flex justify-end">
                    <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredMaintenance.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No maintenance issues found.
            </div>
          ) : (
            filteredMaintenance.map((item) => getMaintenanceCard(item))
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Property</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="w-[300px]">Issue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expense</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-8 w-16 bg-muted animate-pulse rounded ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredMaintenance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No maintenance issues found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaintenance.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.property}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <div className="font-medium max-w-xs truncate">
                        {item.issue}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {item.expenseAmount 
                        ? `KES ${item.expenseAmount.toLocaleString()}` 
                        : "—"
                      }
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
      )}

      <Dialog open={isAddMaintenanceOpen} onOpenChange={setIsAddMaintenanceOpen}>
        <DialogContent className="max-w-3xl">
          <MaintenanceForm 
            properties={propertiesData}
            units={unitsData}
            onClose={() => setIsAddMaintenanceOpen(false)}
            onSuccess={() => {
              setIsAddMaintenanceOpen(false);
              toast({
                title: "Maintenance issue recorded",
                description: "The maintenance issue has been successfully recorded.",
              });
              // In a real app, this would refetch the data
            }}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Maintenance;
