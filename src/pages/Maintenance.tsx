import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Filter, 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Building, 
  Home, 
  ClipboardList, 
  DollarSign, 
  Calendar,
  Loader2
} from "lucide-react";
import { MaintenanceForm } from "@/components/forms/MaintenanceForm";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
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
import { useMaintenance, useAddMaintenance, useUpdateMaintenance } from "@/hooks/useMaintenance";
import { useProperties } from "@/hooks/useProperties";
import { useUnits } from "@/hooks/useUnits";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountBadge } from "@/components/ui/account-badge";
import { useAccountScoping } from "@/hooks/useAccountScoping";

const Maintenance = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAuthenticated } = useAccountScoping();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [propertyFilter, setPropertyFilter] = useState("all-properties");
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Fetch real-time data from Supabase
  const { data: maintenanceData, isLoading: isMaintenanceLoading } = useMaintenance();
  const { data: propertiesData, isLoading: isPropertiesLoading } = useProperties();
  const { data: unitsData, isLoading: isUnitsLoading } = useUnits();
  const addMaintenance = useAddMaintenance();
  const updateMaintenance = useUpdateMaintenance();
  
  // Handle status change
  const handleStatusChange = (maintenanceId: string, newStatus: string) => {
    const maintenance = maintenanceData.find(item => item.id === maintenanceId);
    if (!maintenance) return;
    
    updateMaintenance.mutate({
      ...maintenance,
      status: newStatus
    }, {
      onSuccess: () => {
        toast({
          title: "Status updated",
          description: `Maintenance status changed to ${newStatus.replace('_', ' ')}`
        });
      },
      onError: (error) => {
        toast({
          title: "Error updating status",
          description: "There was a problem updating the status.",
          variant: "destructive"
        });
        console.error("Error updating maintenance status:", error);
      }
    });
  };
  
  const handleViewMaintenance = (maintenance: any) => {
    setSelectedMaintenance(maintenance);
    setIsViewDialogOpen(true);
  };
  
  // Combined loading state
  const isLoading = isMaintenanceLoading || isPropertiesLoading || isUnitsLoading;
  
  // Format maintenance data for display
  const formattedMaintenanceData = useMemo(() => {
    if (!maintenanceData || !Array.isArray(maintenanceData)) return [];
    
    return maintenanceData.map(item => ({
      id: item.id,
      property: item.property?.name || 'Unknown Property',
      property_id: item.property_id,
      unit: item.unit?.unit_number || 'N/A',
      unit_id: item.unit_id,
      issue: item.issue,
      status: item.status,
      date: item.created_at ? format(new Date(item.created_at), 'yyyy-MM-dd') : '',
      expenseAmount: item.expense_amount,
      notes: item.notes
    }));
  }, [maintenanceData]);
  
  // Filter maintenance data based on filters
  const filteredMaintenance = formattedMaintenanceData.filter((item) => {
    const matchesSearch = 
      item.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all-statuses" || item.status === statusFilter;
    const matchesProperty = propertyFilter === "all-properties" || item.property_id === propertyFilter;
    
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
          <div className="flex flex-col gap-2 items-end">
            {getStatusBadge(item.status)}
            <Select 
              value={item.status} 
              onValueChange={(value) => handleStatusChange(item.id, value)}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          <div className="flex items-center">
            <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
            <AccountBadge />
          </div>
          <p className="text-muted-foreground">
            Track and manage maintenance issues across your properties.
          </p>
        </div>
        <Button className="w-full md:w-auto" onClick={() => setIsAddMaintenanceOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Record Issue
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              className="pl-8 w-full bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-properties">All Properties</SelectItem>
              {propertiesData?.map((property: any) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="ml-auto">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline">
            Export
          </Button>
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
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-16 ml-auto" />
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <Select 
                          value={item.status} 
                          onValueChange={(value) => handleStatusChange(item.id, value)}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.expenseAmount 
                        ? `KES ${item.expenseAmount.toLocaleString()}` 
                        : "—"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewMaintenance(item)}
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
      )}

      <Dialog open={isAddMaintenanceOpen} onOpenChange={setIsAddMaintenanceOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Maintenance</DialogTitle>
            <DialogDescription>
              Fill in the details below to record a new maintenance issue for your property.
            </DialogDescription>
          </DialogHeader>
          <MaintenanceForm 
            properties={propertiesData}
            units={unitsData}
            onClose={() => setIsAddMaintenanceOpen(false)}
            onSubmit={async (values) => {
              try {
                await addMaintenance.mutateAsync({
                  property_id: values.property_id,
                  unit_id: values.unit_id,
                  issue: values.issue,
                  notes: values.notes,
                  status: values.status || 'open',
                  expense_amount: values.expense_amount ? parseFloat(values.expense_amount.toString()) : undefined
                });
                setIsAddMaintenanceOpen(false);
                toast({
                  title: "Maintenance recorded",
                  description: "The maintenance issue has been successfully recorded."
                });
              } catch (error) {
                console.error('Error adding maintenance:', error);
                toast({
                  title: "Error recording maintenance",
                  description: "There was a problem saving the maintenance issue.",
                  variant: "destructive"
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* View Maintenance Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Maintenance Details</DialogTitle>
          </DialogHeader>
          {selectedMaintenance && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4 space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Property & Unit
                  </h3>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedMaintenance.property}</p>
                    <p className="text-muted-foreground">Unit: {selectedMaintenance.unit}</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Date & Status
                  </h3>
                  <div className="space-y-1">
                    <p>Reported: {new Date(selectedMaintenance.date).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2">
                      Status: {getStatusBadge(selectedMaintenance.status)}
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 space-y-3 md:col-span-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Issue Details
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium">{selectedMaintenance.issue}</p>
                    {selectedMaintenance.notes && (
                      <div>
                        <h4 className="text-sm font-medium mt-2">Notes</h4>
                        <p className="text-muted-foreground">{selectedMaintenance.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedMaintenance.expenseAmount > 0 && (
                  <div className="border rounded-md p-4 space-y-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financial
                    </h3>
                    <div className="space-y-1">
                      <p className="font-medium">Expense: KES {selectedMaintenance.expenseAmount.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Update Status</h3>
                <div className="flex items-center gap-3">
                  <Select 
                    value={selectedMaintenance.status} 
                    onValueChange={(value) => handleStatusChange(selectedMaintenance.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                <Button>Edit Issue</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Maintenance;
