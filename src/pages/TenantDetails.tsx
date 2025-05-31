import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building, Edit, Mail, Phone, Calendar, CreditCard, User, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layout/MainLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription";
import { PostgrestError } from "@supabase/supabase-js";
import { TenantForm } from "@/components/forms/TenantForm";
import { useAccountScoping } from "@/hooks/useAccountScoping";
import { AccountBadge } from "@/components/ui/account-badge";

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  unit_id?: string;
  unit?: {
    unit_number: string;
    property: {
      id: string;
      name: string;
    };
  };
  status: string;
  lease_start_date?: string;
  lease_end_date?: string;
  deposit_amount?: number;
  rent_payment_status?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  notes?: string;
  created_at: string;
  balance?: number;
}

// Utility function to get initials from name
const getInitials = (firstName: string, lastName: string) => {
  return (firstName?.[0] || '') + (lastName?.[0] || '');
};

const TenantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { isAuthenticated, userRole } = useAccountScoping();
  
  // Setup real-time subscription for updates
  useRealTimeSubscription('tenants', ['tenants']);

  useEffect(() => {
    if (id) {
      fetchTenantDetails();
    }
  }, [id]);

  const fetchTenantDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Fetch tenant details with unit and property information
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone_number,
          unit_id,
          status,
          lease_start_date,
          lease_end_date,
          deposit_amount,
          rent_payment_status,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relationship,
          notes,
          created_at,
          balance,
          units:unit_id (
            unit_number,
            properties:property_id (
              id,
              name
            )
          )
        `)
        .eq('id', id as string)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Transform data to match Tenant interface
        const formattedTenant: Tenant = {
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          unit_id: data.unit_id,
          unit: data.units ? {
            unit_number: data.units.unit_number,
            property: {
              id: data.units.properties?.id,
              name: data.units.properties?.name || 'Unknown Property'
            }
          } : undefined,
          status: data.status || 'inactive',
          lease_start_date: data.lease_start_date,
          lease_end_date: data.lease_end_date,
          deposit_amount: data.deposit_amount,
          rent_payment_status: data.rent_payment_status,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          emergency_contact_relationship: data.emergency_contact_relationship,
          notes: data.notes,
          created_at: data.created_at,
          balance: data.balance
        };
        
        setTenant(formattedTenant);
      }
    } catch (error) {
      console.error("Error fetching tenant details:", error);
      toast({
        title: "Error",
        description: "Failed to load tenant details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/tenants");
  };

  const handleEditComplete = () => {
    setIsEditDialogOpen(false);
    // Refetch the tenant data to show updated information
    fetchTenantDetails();
    
    toast({
      title: "Tenant Updated",
      description: "Tenant information has been successfully updated.",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "late":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case "active":
        return "Active";
      case "late":
        return "Late Payment";
      default:
        return "Inactive";
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tenants
          </Button>
          <div className="mt-4">
            <Skeleton className="h-10 w-1/3 mb-2" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (!tenant) {
    return (
      <MainLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tenants
          </Button>
        </div>
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tenant Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The tenant you are looking for could not be found or may have been deleted.
          </p>
          <Button onClick={handleGoBack}>
            Return to Tenants List
          </Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Button variant="ghost" size="sm" onClick={handleGoBack} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tenants
          </Button>
          <div className="flex items-center">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(tenant.first_name, tenant.last_name)}
                </AvatarFallback>
              </Avatar>
              {tenant.first_name} {tenant.last_name}
            </h1>
            <AccountBadge />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusBadgeClass(tenant.status)}>
              {getStatusText(tenant.status)}
            </Badge>
            <p className="text-muted-foreground">
              Added on {new Date(tenant.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        {/* Only show edit button for admin, super_admin, or if user is authenticated */}
        {(userRole === 'admin' || userRole === 'super_admin' || isAuthenticated) && (
          <Button onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Tenant
          </Button>
        )}
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Building className="h-8 w-8 text-primary/70" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Property & Unit</h3>
                {tenant.unit ? (
                  <p className="font-medium">
                    {tenant.unit.property.name}, Unit {tenant.unit.unit_number}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No unit assigned</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Phone className="h-8 w-8 text-primary/70" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                <p className="font-medium">{tenant.phone_number || 'No phone number'}</p>
                <p className="text-sm text-muted-foreground truncate">{tenant.email || 'No email'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-primary/70" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Lease Period</h3>
                {tenant.lease_start_date && tenant.lease_end_date ? (
                  <p className="font-medium">
                    {new Date(tenant.lease_start_date).toLocaleDateString()} - {new Date(tenant.lease_end_date).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-muted-foreground">No lease information</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-primary/70" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Financial</h3>
                {tenant.balance && tenant.balance > 0 ? (
                  <p className="font-medium text-rose-600">
                    KES {tenant.balance.toLocaleString()} outstanding
                  </p>
                ) : (
                  <p className="font-medium text-emerald-600">No outstanding balance</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Deposit: {tenant.deposit_amount ? `KES ${tenant.deposit_amount.toLocaleString()}` : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Personal Details</TabsTrigger>
          <TabsTrigger value="lease">Lease Information</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic details about the tenant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                  <p>{tenant.first_name} {tenant.last_name}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                  <p>{tenant.email || '—'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                  <p>{tenant.phone_number || '—'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p>
                    <Badge className={getStatusBadgeClass(tenant.status)}>
                      {getStatusText(tenant.status)}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {tenant.emergency_contact_name && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>Emergency contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                    <p>{tenant.emergency_contact_name}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                    <p>{tenant.emergency_contact_phone || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Relationship</h3>
                    <p>{tenant.emergency_contact_relationship || '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="lease" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lease Details</CardTitle>
              <CardDescription>Information about the tenant's lease</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Property</h3>
                  <p>{tenant.unit?.property.name || 'No property assigned'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Unit</h3>
                  <p>{tenant.unit ? `Unit ${tenant.unit.unit_number}` : 'No unit assigned'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Lease Start Date</h3>
                  <p>{tenant.lease_start_date ? new Date(tenant.lease_start_date).toLocaleDateString() : '—'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Lease End Date</h3>
                  <p>{tenant.lease_end_date ? new Date(tenant.lease_end_date).toLocaleDateString() : '—'}</p>
                </div>
              </div>
              
              {/* Lease document section could go here in the future */}
              <div className="pt-4 mt-4 border-t">
                <h3 className="text-sm font-medium mb-3">Lease Documents</h3>
                <div className="flex items-center justify-center h-32 border border-dashed rounded-md">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No lease documents uploaded</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>Payment and deposit details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Current Balance</h3>
                  <p className={tenant.balance && tenant.balance > 0 ? "text-rose-600 font-medium" : ""}>
                    {tenant.balance && tenant.balance > 0 
                      ? `KES ${tenant.balance.toLocaleString()} outstanding` 
                      : "No outstanding balance"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Deposit Amount</h3>
                  <p>{tenant.deposit_amount ? `KES ${tenant.deposit_amount.toLocaleString()}` : '—'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>
                  <p>
                    <Badge className={tenant.rent_payment_status === 'unpaid' 
                      ? "bg-rose-100 text-rose-800" 
                      : "bg-emerald-100 text-emerald-800"}>
                      {tenant.rent_payment_status === 'unpaid' ? 'Unpaid' : 'Paid'}
                    </Badge>
                  </p>
                </div>
              </div>
              
              {/* Recent transactions section could go here in the future */}
              <div className="pt-4 mt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Recent Transactions</h3>
                  <Button variant="ghost" size="sm" className="text-xs h-8">
                    View All
                  </Button>
                </div>
                <div className="flex items-center justify-center h-32 border border-dashed rounded-md">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No transaction history available</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional information about this tenant</CardDescription>
            </CardHeader>
            <CardContent>
              {tenant.notes ? (
                <div className="p-4 border rounded-md bg-muted/40">
                  <p>{tenant.notes}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 border border-dashed rounded-md">
                  <p className="text-muted-foreground">No notes available for this tenant</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Tenant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant information and preferences
            </DialogDescription>
          </DialogHeader>
          
          {tenant && (
            <TenantForm
              initialData={{
                id: tenant.id,
                first_name: tenant.first_name,
                last_name: tenant.last_name,
                email: tenant.email || '',
                phone_number: tenant.phone_number || '',
                unit_id: tenant.unit_id,
                status: tenant.status,
                lease_start_date: tenant.lease_start_date,
                lease_end_date: tenant.lease_end_date,
                deposit_amount: tenant.deposit_amount,
                rent_payment_status: tenant.rent_payment_status,
                emergency_contact_name: tenant.emergency_contact_name,
                emergency_contact_phone: tenant.emergency_contact_phone,
                emergency_contact_relationship: tenant.emergency_contact_relationship,
                notes: tenant.notes
              }}
              isEditing={true}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                fetchTenantDetails(); // Refetch to get updated data
                toast({
                  title: "Tenant Updated",
                  description: "Tenant information has been successfully updated.",
                });
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TenantDetails;
