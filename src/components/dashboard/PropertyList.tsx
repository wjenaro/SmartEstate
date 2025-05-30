
// import { Building, ChevronRight } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import { useRecentProperties } from "@/hooks/useDashboardData";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useState, useEffect } from "react";

// // Calculate metrics from raw property data
// const calculatePropertyMetrics = (property: any) => {
//   // Get total units from property data
//   const totalUnits = property.units?.[0]?.count || 0;
  
//   // For demo purposes, we'll generate some random metrics
//   // In a real app, these would come from the database
//   const occupiedUnits = Math.floor(Math.random() * totalUnits);
//   const vacantUnits = totalUnits - occupiedUnits;
//   const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  
//   const totalRent = totalUnits * 20000; // Assuming average rent of 20,000 per unit
//   const collectedRent = Math.floor(totalRent * (Math.random() * 0.3 + 0.7)); // 70-100% collection rate
//   const pendingRent = totalRent - collectedRent;
//   const collectionRate = totalRent > 0 ? Math.round((collectedRent / totalRent) * 100) : 0;
  
//   return {
//     ...property,
//     occupancyRate,
//     units: {
//       total: totalUnits,
//       occupied: occupiedUnits,
//       vacant: vacantUnits,
//     },
//     rentCollection: {
//       total: totalRent,
//       collected: collectedRent,
//       pending: pendingRent,
//       collectionRate,
//     },
//   };
// };

// export function PropertyList() {
//   const { data: rawProperties, isLoading, error } = useRecentProperties();
//   const [properties, setProperties] = useState<any[]>([]);
  
//   // Process raw properties data to calculate metrics
//   useEffect(() => {
//     if (rawProperties) {
//       const processedProperties = rawProperties.map(calculatePropertyMetrics);
//       setProperties(processedProperties);
//     }
//   }, [rawProperties]);
  
//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between">
//         <CardTitle className="text-lg font-semibold">Properties Overview</CardTitle>
//         <Link to="/properties">
//           <Button variant="ghost" size="sm" className="flex items-center gap-1 text-sm">
//             View All <ChevronRight className="h-4 w-4" />
//           </Button>
//         </Link>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-6">
//           {isLoading ? (
//             // Loading skeleton
//             Array.from({ length: 3 }).map((_, index) => (
//               <div key={index} className="space-y-3">
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-start gap-3">
//                     <Skeleton className="h-10 w-10 rounded-md" />
//                     <div>
//                       <Skeleton className="h-4 w-32 mb-2" />
//                       <Skeleton className="h-3 w-48" />
//                     </div>
//                   </div>
//                   <Skeleton className="h-8 w-16" />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <div className="flex justify-between mb-1">
//                       <Skeleton className="h-3 w-16" />
//                       <Skeleton className="h-3 w-8" />
//                     </div>
//                     <Skeleton className="h-2 w-full" />
//                   </div>
//                   <div>
//                     <div className="flex justify-between mb-1">
//                       <Skeleton className="h-3 w-16" />
//                       <Skeleton className="h-3 w-8" />
//                     </div>
//                     <Skeleton className="h-2 w-full" />
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : error ? (
//             <div className="py-4 text-center text-red-500">
//               Error loading properties. Please try again.
//             </div>
//           ) : properties.length === 0 ? (
//             <div className="py-4 text-center text-muted-foreground">
//               No properties found. Add your first property to get started.
//             </div>
//           ) : (
//             properties.map((property) => (
//               <div key={property.id} className="space-y-3">
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-start gap-3">
//                     <div className="h-10 w-10 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
//                       <Building className="h-5 w-5" />
//                     </div>
//                     <div>
//                       <h3 className="font-medium">{property.name}</h3>
//                       <p className="text-sm text-muted-foreground">{property.address}</p>
//                     </div>
//                   </div>
//                   <Link to={`/properties/${property.id}`}>
//                     <Button variant="outline" size="sm">View</Button>
//                   </Link>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="text-sm text-muted-foreground">Occupancy</span>
//                       <span className="text-sm font-medium">{property.occupancyRate}%</span>
//                     </div>
//                     <Progress value={property.occupancyRate} className="h-2" />
//                   </div>
                  
//                   <div>
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="text-sm text-muted-foreground">Rent Collection</span>
//                       <span className="text-sm font-medium">{property.rentCollection.collectionRate}%</span>
//                     </div>
//                     <Progress value={property.rentCollection.collectionRate} className="h-2" />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-2 text-center">
//                   <div className="rounded-md bg-muted p-2">
//                     <p className="text-sm text-muted-foreground">Total Units</p>
//                     <p className="font-medium">{property.units.total}</p>
//                   </div>
//                   <div className="rounded-md bg-muted p-2">
//                     <p className="text-sm text-muted-foreground">Occupied</p>
//                     <p className="font-medium">{property.units.occupied}</p>
//                   </div>
//                   <div className="rounded-md bg-muted p-2">
//                     <p className="text-sm text-muted-foreground">Vacant</p>
//                     <p className="font-medium">{property.units.vacant}</p>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
import { Building, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRecentProperties } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

// Types
type Unit = {
  count: number;
};

type Property = {
  id: string;
  name: string;
  address: string;
  units: Unit[];
};

type ProcessedProperty = Omit<Property, 'units'> & {
  occupancyRate: number;
  units: {
    total: number;
    occupied: number;
    vacant: number;
  };
  rentCollection: {
    total: number;
    collected: number;
    pending: number;
    collectionRate: number;
  };
};

// Calculate metrics from raw property data
const calculatePropertyMetrics = (property: Property): ProcessedProperty => {
  const totalUnits = property.units?.[0]?.count || 0;

  const occupiedUnits = Math.floor(Math.random() * totalUnits);
  const vacantUnits = totalUnits - occupiedUnits;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const totalRent = totalUnits * 20000;
  const collectedRent = Math.floor(totalRent * (Math.random() * 0.3 + 0.7));
  const pendingRent = totalRent - collectedRent;
  const collectionRate = totalRent > 0 ? Math.round((collectedRent / totalRent) * 100) : 0;

  return {
    ...property,
    occupancyRate,
    units: {
      total: totalUnits,
      occupied: occupiedUnits,
      vacant: vacantUnits,
    },
    rentCollection: {
      total: totalRent,
      collected: collectedRent,
      pending: pendingRent,
      collectionRate,
    },
  };
};

export function PropertyList() {
  const { data: rawProperties, isLoading, error } = useRecentProperties();
  const [properties, setProperties] = useState<ProcessedProperty[]>([]);

  useEffect(() => {
    if (rawProperties) {
      // Type cast the raw properties to match the expected Property type
      const processedProperties = rawProperties.map((prop: any) => calculatePropertyMetrics({
        id: prop.id,
        name: prop.name || '',
        address: prop.address || '',
        units: prop.units || []
      }));
      setProperties(processedProperties);
    }
  }, [rawProperties]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Properties Overview</CardTitle>
        <Link to="/properties">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-sm">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="py-4 text-center text-red-500">
              Error loading properties. Please try again.
            </div>
          ) : properties.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              No properties found. Add your first property to get started.
            </div>
          ) : (
            properties.map((property) => (
              <div key={property.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-md bg-[#3AB663]/10 text-[#3AB663] flex items-center justify-center">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{property.name}</h3>
                      <p className="text-sm text-muted-foreground">{property.address}</p>
                    </div>
                  </div>
                  <Link to={`/properties/${property.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Occupancy</span>
                      <span className="text-sm font-medium">{property.occupancyRate}%</span>
                    </div>
                    <Progress value={property.occupancyRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Rent Collection</span>
                      <span className="text-sm font-medium">{property.rentCollection.collectionRate}%</span>
                    </div>
                    <Progress value={property.rentCollection.collectionRate} className="h-2" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-muted p-2">
                    <p className="text-sm text-muted-foreground">Total Units</p>
                    <p className="font-medium">{property.units.total}</p>
                  </div>
                  <div className="rounded-md bg-muted p-2">
                    <p className="text-sm text-muted-foreground">Occupied</p>
                    <p className="font-medium">{property.units.occupied}</p>
                  </div>
                  <div className="rounded-md bg-muted p-2">
                    <p className="text-sm text-muted-foreground">Vacant</p>
                    <p className="font-medium">{property.units.vacant}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
