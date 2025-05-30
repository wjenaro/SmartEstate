
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CreditCard, WalletCards, Receipt, Calculator } from "lucide-react";

const FinancialCard = ({ 
  title, 
  description, 
  icon: Icon, 
  to 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType; 
  to: string 
}) => (
  <Link to={to} className="block">
    <Card className="h-full hover:border-primary/50 transition-colors">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm flex-1">{description}</p>
        <Button variant="ghost" className="mt-4 w-full justify-start px-2">
          Manage {title}
          <span className="ml-auto" aria-hidden="true">→</span>
        </Button>
      </CardContent>
    </Card>
  </Link>
);

const Financials = () => {
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financials</h1>
          <p className="text-muted-foreground">Manage your financial operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialCard
          title="Invoices"
          description="Generate and manage rent invoices, utility bills, and other charges."
          icon={Receipt}
          to="/invoices"
        />
        <FinancialCard
          title="Payments"
          description="Track and reconcile incoming payments from tenants."
          icon={WalletCards}
          to="/payments"
        />
        <FinancialCard
          title="Expenses"
          description="Record and categorize property maintenance and operational expenses."
          icon={Calculator}
          to="/expenses"
        />
      </div>
    </MainLayout>
  );
};

export default Financials;
