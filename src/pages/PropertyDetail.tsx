import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Edit, ArrowLeft, Home, Users, Wrench, Droplet } from "lucide-react";
import { PropertyForm } from "@/components/forms/PropertyForm";
import { useProperties } from "@/hooks/useProperties";
import { useUnits } from "@/hooks/useUnits";
import { useTenants } from "@/hooks/useTenants";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useUtilityReadings } from "@/hooks/useUtilityReadings";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isEditPropertyOpen, setIsEditPropertyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch property data
  const { data: properties, isLoading: propertiesLoading } = useProperties();
  const property = properties?.find(p => p.id === id);
  
  // Fetch related data
  const { data: units, isLoading: unitsLoading } = useUnits();
  const { data: tenants, isLoading: tenantsLoading } = useTenants();
  const { data: maintenanceIssues, isLoading: maintenanceLoading } = useMaintenance();
  const { data: utilityReadings, isLoading: utilitiesLoading } = useUtilityReadings();
  
  // Filter related data by property ID
  const propertyUnits = units?.filter(unit => unit.property_id === id) || [];
  const propertyTenants = tenants?.filter(tenant => {
    const tenantUnit = units?.find(unit => unit.id === tenant.unit_id);
    return tenantUnit?.property_id === id;
  }) || [];
  const propertyMaintenance = maintenanceIssues?.filter(issue => issue.property_id === id) || [];
  const propertyUtilities = utilityReadings?.filter(reading => reading.property_id === id) || [];
  
  // Calculate statistics
  const totalUnits = propertyUnits.length;
  const occupiedUnits = propertyUnits.filter(unit => unit.status === "occupied").length;
  const vacantUnits = propertyUnits.filter(unit => unit.status === "vacant").length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  
  const isLoading = propertiesLoading || !property;

  if (propertiesLoading) {
    return (
      <MainLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/properties">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
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

  if (!property) {
    return (
      <MainLayout>
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/properties">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The property you're looking for doesn't exist or you don't have access to view it.
            </p>
            <Button asChild>
              <Link to="/properties">View All Properties</Link>
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link to="/properties">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{property.name}</h1>
              <p className="text-muted-foreground">
                {property.address}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsEditPropertyOpen(true)}>
          <Edit className="mr-2 h-4 w-4" /> Edit Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalUnits}</div>
              <Home className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-sm text-muted-foreground">Total Units</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{occupiedUnits}</div>
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-sm text-muted-foreground">Occupied Units</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{vacantUnits}</div>
              <Home className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-sm text-muted-foreground">Vacant Units</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{occupancyRate}%</div>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-sm text-muted-foreground">Occupancy Rate</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
              <CardDescription>Detailed information about this property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Property Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property Name:</span>
                      <span className="font-medium">{property.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property Type:</span>
                      <span className="font-medium capitalize">{property.property_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-medium">{property.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Units:</span>
                      <span className="font-medium">{property.total_units}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Utility Rates</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Water Rate:</span>
                      <span className="font-medium">${property.water_rate} per unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Electricity Rate:</span>
                      <span className="font-medium">${property.electricity_rate} per kWh</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="units" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Units</CardTitle>
                <CardDescription>All units in this property</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link to="/units">Manage Units</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {unitsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : propertyUnits.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground mb-4">No units found for this property.</p>
                  <Button asChild size="sm">
                    <Link to="/units">Add Units</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rent Amount</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propertyUnits.map(unit => {
                      const unitTenant = tenants?.find(t => t.unit_id === unit.id);
                      return (
                        <TableRow key={unit.id}>
                          <TableCell>{unit.unit_number}</TableCell>
                          <TableCell>
                            <Badge variant={unit.status === "occupied" ? "success" : "warning"}>
                              {unit.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${unit.rent_amount}</TableCell>
                          <TableCell>
                            {unitTenant ? `${unitTenant.first_name} ${unitTenant.last_name}` : "Vacant"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/units/${unit.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tenants" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tenants</CardTitle>
                <CardDescription>Tenants living in this property</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link to="/tenants">Manage Tenants</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {tenantsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : propertyTenants.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground mb-4">No tenants found for this property.</p>
                  <Button asChild size="sm">
                    <Link to="/tenants">Add Tenants</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Lease End</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propertyTenants.map(tenant => {
                      const tenantUnit = units?.find(u => u.id === tenant.unit_id);
                      return (
                        <TableRow key={tenant.id}>
                          <TableCell>
                            {tenant.first_name} {tenant.last_name}
                          </TableCell>
                          <TableCell>{tenantUnit?.unit_number || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant={tenant.status === "active" ? "success" : "warning"}>
                              {tenant.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{tenant.lease_end_date ? new Date(tenant.lease_end_date).toLocaleDateString() : "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/tenants/${tenant.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maintenance" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Issues</CardTitle>
                <CardDescription>Maintenance requests for this property</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link to="/maintenance">Manage Maintenance</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {maintenanceLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : propertyMaintenance.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground mb-4">No maintenance issues found for this property.</p>
                  <Button asChild size="sm">
                    <Link to="/maintenance">Add Maintenance Issue</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Reported</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propertyMaintenance.map(issue => {
                      const issueUnit = units?.find(u => u.id === issue.unit_id);
                      return (
                        <TableRow key={issue.id}>
                          <TableCell>{issue.issue}</TableCell>
                          <TableCell>{issueUnit?.unit_number || "Common Area"}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                issue.status === "open" ? "destructive" :
                                issue.status === "in progress" ? "warning" :
                                issue.status === "completed" ? "success" : "default"
                              }
                            >
                              {issue.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{issue.created_at ? new Date(issue.created_at).toLocaleDateString() : "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/maintenance/${issue.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="utilities" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Utility Readings</CardTitle>
                <CardDescription>Recent utility readings for this property</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link to="/utilities">Manage Utilities</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {utilitiesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : propertyUtilities.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted-foreground mb-4">No utility readings found for this property.</p>
                  <Button asChild size="sm">
                    <Link to="/utilities">Add Utility Reading</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reading</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propertyUtilities.map(reading => {
                      const readingUnit = units?.find(u => u.id === reading.unit_id);
                      return (
                        <TableRow key={reading.id}>
                          <TableCell>{readingUnit?.unit_number || "Common Area"}</TableCell>
                          <TableCell className="capitalize">{reading.utility_type}</TableCell>
                          <TableCell>{reading.current_reading}</TableCell>
                          <TableCell>{reading.reading_date ? new Date(reading.reading_date).toLocaleDateString() : "N/A"}</TableCell>
                          <TableCell>${reading.amount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/utilities/${reading.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditPropertyOpen} onOpenChange={setIsEditPropertyOpen}>
        <DialogContent className="max-w-3xl">
          <PropertyForm existingProperty={property} />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PropertyDetail;
