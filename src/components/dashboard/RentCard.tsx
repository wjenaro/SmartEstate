import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RentCardProps {
  tenant: string;
  property: string;
  unit: string;
  amount: string;
  dueDate: string;
  status: "upcoming" | "overdue" | "paid";
  onClick?: () => void;
}

export function RentCard({ 
  tenant, 
  property, 
  unit,
  amount, 
  dueDate, 
  status,
  onClick
}: RentCardProps) {
  // Extract initials for avatar
  const initials = tenant
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  // Determine status badge styling
  const statusStyles = {
    upcoming: "bg-amber-100 text-amber-800",
    overdue: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800"
  };

  const statusLabels = {
    upcoming: "Upcoming",
    overdue: "Overdue",
    paid: "Paid"
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 border-b last:border-b-0",
        onClick && "cursor-pointer active:bg-muted/20"
      )}
      onClick={onClick}
      style={{ touchAction: 'manipulation' }}
    >
      <Avatar className="h-10 w-10 mt-1">
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-base truncate">{tenant}</h3>
          <span className="font-semibold text-right whitespace-nowrap">
            {amount}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground mb-1 truncate">
          {property}
          {unit && <span> - Unit {unit}</span>}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarIcon className="h-3 w-3" /> 
          {dueDate}
        </div>
      </div>
      
      {status && (
        <div className={cn(
          "text-xs px-2 py-1 rounded-full font-medium ml-auto mt-1 whitespace-nowrap",
          statusStyles[status]
        )}>
          {statusLabels[status]}
        </div>
      )}
    </div>
  );
}
