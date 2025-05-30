
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { RentCard } from "./RentCard";

// Mock data for due rents
const dueRents = [
  {
    id: 1,
    tenant: {
      id: 101,
      name: "John Doe",
      initials: "JD",
    },
    property: "Riverside Apartments",
    unit: "A101",
    amount: 25000,
    dueDate: "2025-05-20",
    status: "overdue",
  },
  {
    id: 2,
    tenant: {
      id: 102,
      name: "Jane Smith",
      initials: "JS",
    },
    property: "Parklands Residences",
    unit: "B205",
    amount: 30000,
    dueDate: "2025-05-18",
    status: "overdue",
  },
  {
    id: 3,
    tenant: {
      id: 103,
      name: "Michael Johnson",
      initials: "MJ",
    },
    property: "Westlands Heights",
    unit: "C304",
    amount: 20000,
    dueDate: "2025-05-25",
    status: "upcoming",
  },
  {
    id: 4,
    tenant: {
      id: 104,
      name: "Sarah Williams",
      initials: "SW",
    },
    property: "Riverside Apartments",
    unit: "A205",
    amount: 25000,
    dueDate: "2025-05-28",
    status: "upcoming",
  },
];

export function DueRents() {
  const isMobile = useIsMobile();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 md:px-6">
        <CardTitle className="text-lg font-semibold">Upcoming & Overdue Rent</CardTitle>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Download className="h-4 w-4" /> Export
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {dueRents.map((rent) => (
            <RentCard
              key={rent.id}
              tenant={rent.tenant.name}
              property={rent.property}
              unit={rent.unit}
              amount={`KES ${rent.amount.toLocaleString()}`}
              dueDate={new Date(rent.dueDate).toLocaleDateString()}
              status={rent.status as "upcoming" | "overdue" | "paid"}
              onClick={() => console.log(`Rent clicked: ${rent.id}`)}
            />
          ))}
        </div>
        <div className="p-4">
          <Button variant="ghost" className="w-full">View All Invoices</Button>
        </div>
      </CardContent>
    </Card>
  );
}
