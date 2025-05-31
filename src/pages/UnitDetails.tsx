import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, ArrowLeft, Home, Edit, User, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import UnitForm from "@/components/forms/UnitForm";
import { MainLayout } from "@/components/layout/MainLayout";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useProperties } from "@/hooks/useProperties";

interface Unit {
  id: string;
  property_id: string;
  number: string;
  type: string;
  rent: number;
  notes?: string;
  features: string[];
  property: string;
  status: string;
  tenant?: string;
}

const UnitDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { data: properties = [] } = useProperties();

  useEffect(() => {
    fetchUnitDetails();
  }, [id]);

  const fetchUnitDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Fetch unit details with property name
      const { data, error } = await supabase
        .from('units')
        .select(`
          id,
          property_id,
          unit_number,
          unit_type,
          rent_amount,
          notes,
          features,
          status,
          properties(name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Fetch tenant if exists
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('first_name, last_name')
          .eq('unit_id', id)
          .maybeSingle();

        // Transform data to match Unit interface
        setUnit({
          id: data.id,
          property_id: data.property_id,
          number: data.unit_number,
          type: data.unit_type, // Updated to use unit_type instead of type
          rent: data.rent_amount || 0,
          notes: data.notes,
          features: data.features || [],
          property: data.properties?.name || 'Unknown Property',
          status: data.status || 'vacant',
          tenant: tenantData ? `${tenantData.first_name} ${tenantData.last_name}` : undefined
        });
      }
    } catch (error) {
      console.error("Error fetching unit details:", error);
      toast({
        title: "Error",
        description: "Failed to load unit details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/units");
  };

  const handleEditComplete = () => {
    setIsEditDialogOpen(false);
    // Refetch the unit data to show updated information
    fetchUnitDetails();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/units">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Units
            </Link>
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
                <Skeleton className="h-6 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-md" />
      </MainLayout>
    );
  }
  
  if (!unit) {
    return (
      <MainLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/units">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Units
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center">
            <Home className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Unit Not Found</h3>
            <p className="text-muted-foreground text-center mb-6">The unit you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/units">View All Units</Link>
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link to="/units">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Units
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Unit {unit.number}</h1>
            <p className="text-muted-foreground">Property: {unit.property}</p>
          </div>
          <Button onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" /> Edit Unit
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Unit Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center">
                  {unit.status === "occupied" ? (
                    <>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mr-2">
                        <Check className="h-3 w-3 mr-1" />
                        Occupied
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 mr-2">
                        <X className="h-3 w-3 mr-1" />
                        Vacant
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Unit Type Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Unit Type</p>
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p className="text-lg font-medium">{unit.type}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Rent Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Monthly Rent</p>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p className="text-lg font-medium">KES {unit.rent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tenant Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tenant</p>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p className="text-lg font-medium">{unit.tenant || "Not assigned"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Unit Information</CardTitle>
              <CardDescription>Detailed information about this unit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Property</h3>
                  <p>{unit.property}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Unit Number</h3>
                  <p>{unit.number}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Unit Type</h3>
                  <p>{unit.type}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Status</h3>
                  <p className="flex items-center gap-1">
                    {unit.status === "occupied" ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-600">Occupied</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-amber-600" />
                        <span className="text-amber-600">Vacant</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Monthly Rent</h3>
                  <p>KES {unit.rent.toLocaleString()}</p>
                </div>
                {unit.tenant && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Tenant</h3>
                    <p>{unit.tenant}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Features & Amenities</CardTitle>
              <CardDescription>Features available in this unit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {unit.features && unit.features.length > 0 ? (
                  unit.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-sm py-1.5">
                      {feature}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No features specified for this unit</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional information about this unit</CardDescription>
            </CardHeader>
            <CardContent>
              {unit.notes ? (
                <p>{unit.notes}</p>
              ) : (
                <p className="text-muted-foreground">No notes available for this unit</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Unit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <UnitForm
            initialData={unit}
            properties={properties}
            isEditing={true}
            onSuccess={handleEditComplete}
            onClose={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UnitDetails;
