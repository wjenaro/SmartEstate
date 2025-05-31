
import { useState } from "react";
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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTenants } from "@/hooks/useTenants";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountBadge } from "@/components/ui/account-badge";
import { useAccountScoping } from "@/hooks/useAccountScoping";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { data: tenants, isLoading, error } = useTenants();
  const { isAuthenticated } = useAccountScoping();
  
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
    setSelectedTenant(tenant);
    setIsViewDialogOpen(true);
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
        <Button className="w-full md:w-auto" onClick={() => setIsAddTenantOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
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
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="former">Former</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export</Button>
          </div>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tenant</TableHead>
              <TableHead>Property & Unit</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Lease Period</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-red-500">
                  Error loading tenants. Please try again.
                </TableCell>
              </TableRow>
            ) : filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No tenants found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(tenant.first_name, tenant.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{tenant.first_name} {tenant.last_name}</div>
                        <Badge 
                          variant={tenant.status === "active" ? "outline" : "destructive"}
                          className="mt-1"
                        >
                          {tenant.status === "active" ? "Active" : "Former"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div>{tenant.unit?.property?.name || 'Not assigned'}</div>
                        <div className="text-sm text-muted-foreground">
                          {tenant.unit?.unit_number ? `Unit ${tenant.unit.unit_number}` : 'No unit'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{tenant.phone_number || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{tenant.email || 'Not provided'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {tenant.lease_start_date && (
                        <div>{new Date(tenant.lease_start_date).toLocaleDateString()}</div>
                      )}
                      {tenant.lease_end_date && (
                        <div className="text-muted-foreground">to {new Date(tenant.lease_end_date).toLocaleDateString()}</div>
                      )}
                      {!tenant.lease_start_date && !tenant.lease_end_date && (
                        <div className="text-muted-foreground">No lease information</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {tenant.rent_payment_status === 'unpaid' ? (
                      <div className="text-rose-500 font-medium">
                        KES {formatBalance(tenant.deposit_amount).toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-emerald-500 font-medium">Paid</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTenant(tenant)}
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

      <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold">Add New Tenant</DialogTitle>
          <DialogDescription>
            Fill in the tenant details across all sections to add a new tenant to your property.
          </DialogDescription>
          <TenantForm onClose={() => setIsAddTenantOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* View Tenant Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold">
            Tenant Details
          </DialogTitle>
          {selectedTenant && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="flex justify-center">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                        {getInitials(selectedTenant.first_name, selectedTenant.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium">{selectedTenant.first_name} {selectedTenant.last_name}</h3>
                    <Badge variant={selectedTenant.status === "active" ? "outline" : "destructive"}>
                      {selectedTenant.status === "active" ? "Active" : "Former"}
                    </Badge>
                  </div>
                  <div className="space-y-2 border rounded-md p-3">
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                <Button variant="default">Edit Tenant</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Tenants;
