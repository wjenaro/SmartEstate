
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
import { Plus, Search, Building, Phone, Mail, Loader2 } from "lucide-react";
import { TenantForm } from "@/components/forms/TenantForm";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTenants } from "@/hooks/useTenants";

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
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const { data: tenants, isLoading, error } = useTenants();
  
  // Filter tenants based on search query
  const filteredTenants = tenants?.filter((tenant) => {
    const fullName = `${tenant.first_name} ${tenant.last_name}`.toLowerCase();
    const propertyName = tenant.unit?.property?.name?.toLowerCase() || '';
    const unitNumber = tenant.unit?.unit_number?.toLowerCase() || '';
    const phoneNumber = tenant.phone_number || '';
    const email = tenant.email?.toLowerCase() || '';
    
    return searchQuery === '' || 
      fullName.includes(searchQuery.toLowerCase()) ||
      propertyName.includes(searchQuery.toLowerCase()) ||
      unitNumber.includes(searchQuery.toLowerCase()) ||
      phoneNumber.includes(searchQuery) ||
      email.includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
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
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
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
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
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

      <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="text-xl font-semibold">Add New Tenant</DialogTitle>
          <DialogDescription>
            Fill in the tenant details across all sections to add a new tenant to your property.
          </DialogDescription>
          <TenantForm onClose={() => setIsAddTenantOpen(false)} />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Tenants;
