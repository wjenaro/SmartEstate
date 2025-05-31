import { useState, useEffect } from "react";
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
import { Plus, Search, Download, Calendar, Eye, FileText, AlertCircle, Loader2 } from "lucide-react";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription";

// In a real app, this would come from an API hook like useInvoices()
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
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Setup real-time subscription for invoices (would connect to a real backend)
  useRealTimeSubscription('invoices', ['invoices']);
  
  // Handle viewport resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Simulate data loading
  useEffect(() => {
    setIsLoading(true);
    // In a real app, this would be a data fetch
    setTimeout(() => {
      setIsLoading(false);
      // Uncomment to test error state
      // setError(new Error("Failed to load invoices"));
    }, 1000);
  }, []);
  
  // Display error notifications
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading invoices",
        description: "There was a problem loading your invoices. Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

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
  
  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsViewInvoiceOpen(true);
  };
  
  // Export function for invoices data
  const handleExport = (format: 'csv' | 'pdf') => {
    toast({
      title: `Exporting invoices as ${format.toUpperCase()}`,
      description: "Your file will be ready for download shortly."
    });
    setIsExportDialogOpen(false);
    // Actual export implementation would go here
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and payments.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={() => setIsExportDialogOpen(true)}
          >
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
          </div>
        </div>
      </Card>

      {isMobile ? (
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </Card>
            ))
          ) : error ? (
            <Card className="p-6 text-center">
              <div className="flex flex-col items-center text-rose-500 gap-2">
                <AlertCircle className="h-10 w-10" />
                <h3 className="font-medium text-lg">Failed to load invoices</h3>
                <p className="text-muted-foreground">Please try again later</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </Card>
          ) : filteredInvoices.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No invoices found matching your search.
            </Card>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card 
                key={invoice.id} 
                className="p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => handleViewInvoice(invoice)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{invoice.id}</h3>
                    <p className="text-sm text-muted-foreground">{invoice.tenant}</p>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {getStatusText(invoice.status)}
                  </Badge>
                </div>
                
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Property:</span>
                    <span className="text-sm">{invoice.property}, Unit {invoice.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Amount:</span>
                    <span className="text-sm font-medium">KES {invoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Due Date:</span>
                    <span className="text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-end mt-3 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download implementation would go here
                      toast({
                        title: "Invoice Downloaded",
                        description: `Invoice ${invoice.id} has been downloaded.`,
                      });
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    <div className="flex justify-center items-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading invoices...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-rose-500">
                    Error loading invoices. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewInvoice(invoice)}
                  >
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
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewInvoice(invoice);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Download implementation would go here
                            toast({
                              title: "Invoice Downloaded",
                              description: `Invoice ${invoice.id} has been downloaded.`,
                            });
                          }}
                        >
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
      )}

      {/* Create Invoice Dialog */}
      <Dialog open={isAddInvoiceOpen} onOpenChange={setIsAddInvoiceOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new invoice.
          </DialogDescription>
          <InvoiceForm 
            onSuccess={() => {
              setIsAddInvoiceOpen(false);
              toast({
                title: "Invoice Created",
                description: "The invoice has been successfully created.",
              });
              // In a real app, you would refetch the invoices here
            }}
            onCancel={() => setIsAddInvoiceOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* View Invoice Dialog */}
      <Dialog open={isViewInvoiceOpen} onOpenChange={setIsViewInvoiceOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <div>
              <DialogTitle className="flex justify-between items-center">
                <span>Invoice {selectedInvoice.id}</span>
                <Badge className={getStatusColor(selectedInvoice.status)}>
                  {getStatusText(selectedInvoice.status)}
                </Badge>
              </DialogTitle>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Invoice Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issue Date:</span>
                      <span>{new Date(selectedInvoice.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">KES {selectedInvoice.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mt-6 mb-2">Tenant Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedInvoice.tenant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property:</span>
                      <span>{selectedInvoice.property}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit:</span>
                      <span>Unit {selectedInvoice.unit}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Invoice Items</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between pb-2 border-b">
                      <span>Rent for {new Date(selectedInvoice.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                      <span>KES {(selectedInvoice.amount * 0.9).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b">
                      <span>Service Charge</span>
                      <span>KES {(selectedInvoice.amount * 0.1).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2">
                      <span>Total</span>
                      <span>KES {selectedInvoice.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span>Bank Transfer</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Name:</span>
                        <span>SmartEstate Management</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Number:</span>
                        <span>1234567890</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewInvoiceOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  className="gap-2"
                  onClick={() => {
                    toast({
                      title: "Invoice Downloaded",
                      description: `Invoice ${selectedInvoice.id} has been downloaded.`,
                    });
                    setIsViewInvoiceOpen(false);
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Invoices</DialogTitle>
            <DialogDescription>
              Choose a format to export your invoices data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 p-4"
              onClick={() => handleExport('csv')}
            >
              <FileText className="h-8 w-8 mb-2" />
              <span>CSV</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24 p-4"
              onClick={() => handleExport('pdf')}
            >
              <FileText className="h-8 w-8 mb-2" />
              <span>PDF</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Invoices;
