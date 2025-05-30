
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
import { Search, Download, Filter, Plus, Eye, CheckCircle, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock data for payments
const paymentsData = [
  {
    id: "PAY-001",
    tenant: "John Doe",
    property: "Riverside Apartments",
    unit: "A101",
    amount: 26500,
    dateReceived: "2025-05-10",
    paymentMethod: "M-Pesa",
    referenceNumber: "QWERTY123456",
    status: "reconciled",
  },
  {
    id: "PAY-002",
    tenant: "Jane Smith",
    property: "Parklands Residences",
    unit: "B205",
    amount: 31500,
    dateReceived: "2025-05-12",
    paymentMethod: "Bank Transfer",
    referenceNumber: "BT9087654321",
    status: "pending",
  },
  {
    id: "PAY-003",
    tenant: "Michael Johnson",
    property: "Westlands Heights",
    unit: "C304",
    amount: 20000,
    dateReceived: "2025-05-05",
    paymentMethod: "Cash",
    referenceNumber: "CASH-001234",
    status: "reconciled",
  },
  {
    id: "PAY-004",
    tenant: "Sarah Williams",
    property: "Riverside Apartments",
    unit: "A205",
    amount: 25000,
    dateReceived: "2025-05-09",
    paymentMethod: "M-Pesa",
    referenceNumber: "ASDFG987654",
    status: "failed",
  },
  {
    id: "PAY-005",
    tenant: "Robert Brown",
    property: "Kilimani Plaza",
    unit: "D102",
    amount: 18000,
    dateReceived: "2025-05-11",
    paymentMethod: "Bank Transfer",
    referenceNumber: "BT1122334455",
    status: "reconciled",
  },
];

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPayments = paymentsData
    .filter(
      (payment) =>
        payment.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((payment) => statusFilter === "all" || payment.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reconciled":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track and reconcile all payment transactions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
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
                <SelectItem value="reconciled">Reconciled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Property & Unit</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>{payment.tenant}</TableCell>
                  <TableCell>
                    <div>
                      <div>{payment.property}</div>
                      <div className="text-sm text-muted-foreground">Unit {payment.unit}</div>
                    </div>
                  </TableCell>
                  <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(payment.dateReceived).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{payment.paymentMethod}</div>
                      <div className="text-xs text-muted-foreground">Ref: {payment.referenceNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {payment.status === "pending" && (
                        <>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  );
};

export default Payments;
