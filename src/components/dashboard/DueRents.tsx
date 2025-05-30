
import { Calendar, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Upcoming & Overdue Rent</CardTitle>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Download className="h-4 w-4" /> Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dueRents.map((rent) => (
            <div key={rent.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {rent.tenant.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{rent.tenant.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {rent.property} - Unit {rent.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">KES {rent.amount.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(rent.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge variant={rent.status === "overdue" ? "destructive" : "outline"}>
                  {rent.status === "overdue" ? "Overdue" : "Upcoming"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-4">View All Invoices</Button>
      </CardContent>
    </Card>
  );
}
