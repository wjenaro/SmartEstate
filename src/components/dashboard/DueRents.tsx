
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { RentCard } from "./RentCard";
import { useDueRents } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Process invoice data from the database
const processInvoiceData = (rawInvoices: any[]) => {
  if (!rawInvoices || !Array.isArray(rawInvoices)) return [];
  
  return rawInvoices.map(invoice => {
    // Extract tenant and property info from the nested data
    const tenant = invoice.tenants || {};
    const unit = tenant.units?.[0] || {};
    const property = unit.properties || {};
    
    // Determine invoice status
    let status: 'upcoming' | 'overdue' | 'paid' = 'upcoming';
    if (invoice.status === 'overdue') {
      status = 'overdue';
    } else if (invoice.status === 'paid') {
      status = 'paid';
    }
    
    // Format the invoice for display
    return {
      id: invoice.id,
      tenant: {
        id: tenant.id,
        name: `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim(),
        initials: `${(tenant.first_name?.[0] || '')}${(tenant.last_name?.[0] || '')}`
      },
      property: property.name || 'Unknown Property',
      unit: unit.unit_number || 'Unknown Unit',
      amount: invoice.amount || 0,
      dueDate: invoice.due_date || new Date().toISOString(),
      status
    };
  });
};

export function DueRents() {
  const isMobile = useIsMobile();
  const { data: rawInvoices, isLoading, error } = useDueRents();
  const [dueRents, setDueRents] = useState<any[]>([]);
  
  useEffect(() => {
    if (rawInvoices) {
      const processedInvoices = processInvoiceData(rawInvoices);
      setDueRents(processedInvoices);
    }
  }, [rawInvoices]);
  
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
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              Error loading invoices. Please try again.
            </div>
          ) : dueRents.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No upcoming or overdue invoices found.
            </div>
          ) : (
            dueRents.map((rent) => (
              <RentCard
                key={rent.id}
                tenant={rent.tenant.name}
                property={rent.property}
                unit={rent.unit}
                amount={`KES ${rent.amount.toLocaleString()}`}
                dueDate={new Date(rent.dueDate).toLocaleDateString()}
                status={rent.status}
                onClick={() => console.log(`Rent clicked: ${rent.id}`)}
              />
            ))
          )}
        </div>
        <div className="p-4">
          <Link to="/finances/invoices">
            <Button variant="ghost" className="w-full">View All Invoices</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
