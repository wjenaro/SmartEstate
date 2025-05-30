import React, { useState, useEffect, useMemo } from "react";
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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

const Maintenance = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [propertyFilter, setPropertyFilter] = useState("all-properties");
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  
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
    });
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
          <DialogTitle>Record Maintenance</DialogTitle>
          <DialogDescription>
            Fill in the details below to record a new maintenance issue for your property.
          </DialogDescription>
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
              } catch (error) {
                console.error('Error adding maintenance:', error);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Maintenance;
