
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Download, Calendar, Eye } from "lucide-react";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for invoices
const invoicesData = [
  {
    id: "INV-001",
    tenant: "John Doe",
    property: "Riverside Apartments",
    unit: "A101",
    amount: 26500,
    issueDate: "2025-05-01",
    dueDate: "2025-05-15",
    status: "paid",
  },
  {
    id: "INV-002",
    tenant: "Jane Smith",
    property: "Parklands Residences",
    unit: "B205",
    amount: 31500,
    issueDate: "2025-05-01",
    dueDate: "2025-05-15",
    status: "partial",
  },
  {
    id: "INV-003",
    tenant: "Michael Johnson",
    property: "Westlands Heights",
    unit: "C304",
    amount: 20000,
    issueDate: "2025-05-01",
    dueDate: "2025-05-15",
    status: "pending",
  },
  {
    id: "INV-004",
    tenant: "Sarah Williams",
    property: "Riverside Apartments",
    unit: "A205",
    amount: 25000,
    issueDate: "2025-05-01",
    dueDate: "2025-05-15",
    status: "paid",
  },
  {
    id: "INV-005",
    tenant: "Robert Brown",
    property: "Kilimani Plaza",
    unit: "D102",
    amount: 18000,
    issueDate: "2025-05-01",
    dueDate: "2025-05-15",
    status: "overdue",
  },
];

const Invoices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);

  const filteredInvoices = invoicesData
    .filter(
      (invoice) =>
        invoice.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((invoice) => statusFilter === "all" || invoice.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800";
      case "partial":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "overdue":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and payments.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => setIsAddInvoiceOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-8 w-full bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partially Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Filter</Button>
          </div>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Property & Unit</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.tenant}</TableCell>
                  <TableCell>
                    <div>
                      <div>{invoice.property}</div>
                      <div className="text-sm text-muted-foreground">Unit {invoice.unit}</div>
                    </div>
                  </TableCell>
                  <TableCell>KES {invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
        <DialogContent className="max-w-3xl">
          <InvoiceForm />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Invoices;
