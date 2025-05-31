import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Plus, Search, Building, Phone, Mail, Loader2, Calendar, CreditCard } from "lucide-react";
import { TenantForm } from "@/components/forms/TenantForm";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTenants } from "@/hooks/useTenants";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountBadge } from "@/components/ui/account-badge";
import { useAccountScoping } from "@/hooks/useAccountScoping";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription";

// Utility function to get initials from name
const getInitials = (firstName: string, lastName: string) => {
  return (firstName?.[0] || '') + (lastName?.[0] || '');
};

// Format balance display
const formatBalance = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) {
    return 0;
  }
  return amount;
};

const Tenants = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { data: tenants, isLoading, error, refetch } = useTenants();
  const { isAuthenticated } = useAccountScoping();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Setup real-time subscription
  useRealTimeSubscription('tenants', ['tenants']);
  
  // Handle viewport resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle error messages
  useEffect(() => {
    if (error) {
      console.error("Error loading tenants:", error);
      toast({
        title: "Error loading tenants",
        description: "There was a problem loading tenant data. Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // Filter tenants based on search query and status filter
  const filteredTenants = tenants?.filter((tenant) => {
    const fullName = `${tenant.first_name} ${tenant.last_name}`.toLowerCase();
    const propertyName = tenant.unit?.property?.name?.toLowerCase() || '';
    const unitNumber = tenant.unit?.unit_number?.toLowerCase() || '';
    const phoneNumber = tenant.phone_number || '';
    const email = tenant.email?.toLowerCase() || '';
    
    const matchesSearch = searchQuery === '' || 
      fullName.includes(searchQuery.toLowerCase()) ||
      propertyName.includes(searchQuery.toLowerCase()) ||
      unitNumber.includes(searchQuery.toLowerCase()) ||
      phoneNumber.includes(searchQuery) ||
      email.includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  const handleViewTenant = (tenant: any) => {
    // Navigate to tenant details page instead of opening dialog
    navigate(`/tenants/${tenant.id}`);
  };
  
  // Export function for tenants data
  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: `Exporting tenants as ${format.toUpperCase()}`,
      description: "Your file will be ready for download shortly."
    });
    // Actual export implementation would go here
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center">
            <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
            <AccountBadge />
          </div>
          <p className="text-muted-foreground">
            Manage your tenants and view their information.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => handleExport('csv')}
          >
            <Search className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="w-full md:w-auto" onClick={() => setIsAddTenantOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Tenant
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
              className="pl-8 w-full bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-shrink-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="late">Late Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {isMobile ? (
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-full max-w-[250px]" />
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                </div>
              </Card>
            ))
          ) : filteredTenants.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No tenants found matching your search.
            </Card>
          ) : (
            filteredTenants.map((tenant) => (
              <Card 
                key={tenant.id} 
                className="p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => handleViewTenant(tenant)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(tenant.first_name, tenant.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{tenant.first_name} {tenant.last_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tenant.unit ? (
                          <>
                            {tenant.unit.property?.name}, Unit {tenant.unit.unit_number}
                          </>
                        ) : (
                          "No unit assigned"
                        )}
                      </p>
                    </div>
                  </div>
                  {tenant.status && (
                    <Badge
                      className={
                        tenant.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : tenant.status === "late"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {tenant.status === "active"
                        ? "Active"
                        : tenant.status === "late"
                        ? "Late Payment"
                        : "Inactive"}
                    </Badge>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{tenant.phone_number || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{tenant.email || "No email"}</span>
                  </div>
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
                <TableHead>Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <div className="flex justify-center items-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading tenants...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-red-500">
                    Error loading tenants. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No tenants found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => (
                  <TableRow 
                    key={tenant.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewTenant(tenant)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(tenant.first_name, tenant.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{tenant.first_name} {tenant.last_name}</div>
                          <div className="text-sm text-muted-foreground">Added on {new Date(tenant.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tenant.unit ? (
                        <div>
                          <div>{tenant.unit.property?.name}</div>
                          <div className="text-sm text-muted-foreground">Unit {tenant.unit.unit_number}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No unit assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{tenant.phone_number || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[150px]">{tenant.email || "—"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={tenant.balance > 0 ? "text-rose-600 font-medium" : ""}>
                        {tenant.balance > 0 
                          ? `KES ${formatBalance(tenant.balance).toLocaleString()}`
                          : "No Balance"
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      {tenant.status && (
                        <Badge
                          className={
                            tenant.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : tenant.status === "late"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {tenant.status === "active"
                            ? "Active"
                            : tenant.status === "late"
                            ? "Late Payment"
                            : "Inactive"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation();
                        handleViewTenant(tenant);
                      }}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Tenant Dialog */}
      <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogDescription>
            Fill out the form to add a new tenant to your property.
          </DialogDescription>
          <TenantForm
            onSuccess={() => {
              setIsAddTenantOpen(false);
              toast({
                title: "Tenant Added",
                description: "New tenant has been successfully added.",
              });
              refetch();
            }}
            onCancel={() => setIsAddTenantOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Tenant Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTenant && (
            <div>
              <DialogTitle className="mb-4">Tenant Details</DialogTitle>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 flex flex-col items-center text-center border-b md:border-b-0 md:border-r pb-4 md:pb-0 pr-0 md:pr-4">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {getInitials(selectedTenant.first_name, selectedTenant.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-medium">
                    {selectedTenant.first_name} {selectedTenant.last_name}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {selectedTenant.status === "active" 
                      ? "Active Tenant" 
                      : selectedTenant.status === "late" 
                      ? "Late Payment" 
                      : "Inactive"}
                  </p>
                  <div className="space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTenant.phone_number || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTenant.email || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Building className="h-4 w-4" /> Property & Unit
                      </h4>
                      <p>Property: {selectedTenant.unit?.property?.name || 'Not assigned'}</p>
                      <p>Unit: {selectedTenant.unit?.unit_number ? `Unit ${selectedTenant.unit.unit_number}` : 'No unit'}</p>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4" /> Lease Information
                      </h4>
                      {selectedTenant.lease_start_date && (
                        <p>Start: {new Date(selectedTenant.lease_start_date).toLocaleDateString()}</p>
                      )}
                      {selectedTenant.lease_end_date && (
                        <p>End: {new Date(selectedTenant.lease_end_date).toLocaleDateString()}</p>
                      )}
                      {!selectedTenant.lease_start_date && !selectedTenant.lease_end_date && (
                        <p className="text-muted-foreground">No lease information available</p>
                      )}
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4" /> Financial Information
                      </h4>
                      <p>Deposit: {selectedTenant.deposit_amount ? `KES ${selectedTenant.deposit_amount.toLocaleString()}` : 'N/A'}</p>
                      <p>Payment Status: 
                        <span className={selectedTenant.rent_payment_status === 'unpaid' ? "text-rose-500" : "text-emerald-500"}>
                          {selectedTenant.rent_payment_status === 'unpaid' ? ' Unpaid' : ' Paid'}
                        </span>
                      </p>
                    </div>
                    
                    {selectedTenant.emergency_contact_name && (
                      <div className="border rounded-md p-3">
                        <h4 className="font-medium mb-2">Emergency Contact</h4>
                        <p>{selectedTenant.emergency_contact_name}</p>
                        <p>{selectedTenant.emergency_contact_phone || 'No phone'}</p>
                        <p>{selectedTenant.emergency_contact_relationship || 'Relationship not specified'}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedTenant.notes && (
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p>{selectedTenant.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="flex justify-end space-x-2 pt-4 mt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                <Button variant="default">Edit Tenant</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Tenants;
