
import { Building, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Mock data for properties
const properties = [
  {
    id: 1,
    name: "Riverside Apartments",
    address: "123 River Road, Nairobi",
    occupancyRate: 92,
    units: {
      total: 24,
      occupied: 22,
      vacant: 2,
    },
    rentCollection: {
      total: 480000,
      collected: 450000,
      pending: 30000,
      collectionRate: 93.75,
    },
  },
  {
    id: 2,
    name: "Parklands Residences",
    address: "45 Park Avenue, Nairobi",
    occupancyRate: 85,
    units: {
      total: 20,
      occupied: 17,
      vacant: 3,
    },
    rentCollection: {
      total: 400000,
      collected: 330000,
      pending: 70000,
      collectionRate: 82.5,
    },
  },
  {
    id: 3,
    name: "Westlands Heights",
    address: "78 Westlands Road, Nairobi",
    occupancyRate: 100,
    units: {
      total: 16,
      occupied: 16,
      vacant: 0,
    },
    rentCollection: {
      total: 320000,
      collected: 300000,
      pending: 20000,
      collectionRate: 93.75,
    },
  },
];

export function PropertyList() {
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
          {properties.map((property) => (
            <div key={property.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
