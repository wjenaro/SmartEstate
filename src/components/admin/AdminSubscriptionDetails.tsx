import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Filter, Loader2 } from "lucide-react";
import { usePaymentTransactions } from "@/hooks/useAdminData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const AdminSubscriptionDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingTransaction, setViewingTransaction] = useState<string | null>(null);
  const { transactions, loading, error } = usePaymentTransactions();
  
  // Filter transactions based on search term
  const filteredTransactions = transactions?.filter(transaction => 
    transaction.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    transaction.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.plan.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading subscription data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-10 text-center text-red-500">
          Error loading subscription data: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription Transactions</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, email, or plan..."
              className="pl-8 w-full bg-muted/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No transactions found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.user}</div>
                          <div className="text-sm text-muted-foreground">{transaction.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.plan}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.method}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setViewingTransaction(transaction.id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Summary statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <div className="text-2xl font-bold mt-1">
                  {formatCurrency(filteredTransactions.reduce((sum, t) => sum + (t.status.toLowerCase() === "completed" ? t.amount : 0), 0))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Completed Transactions</div>
                <div className="text-2xl font-bold mt-1">
                  {filteredTransactions.filter(t => t.status.toLowerCase() === "completed").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Average Transaction</div>
                <div className="text-2xl font-bold mt-1">
                  {formatCurrency(
                    filteredTransactions.length > 0 
                      ? filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length 
                      : 0
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {/* Transaction Details Dialog */}
      {viewingTransaction && (
        <Dialog open={!!viewingTransaction} onOpenChange={(open) => !open && setViewingTransaction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Complete information about this transaction
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {(() => {
                const transaction = filteredTransactions.find(t => t.id === viewingTransaction);
                if (!transaction) return <p>Transaction not found</p>;
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Transaction ID</div>
                        <div className="font-medium">{transaction.id}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Date</div>
                        <div className="font-medium">{transaction.date}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">User</div>
                        <div className="font-medium">{transaction.user}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{transaction.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Plan</div>
                        <div className="font-medium">{transaction.plan}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="font-medium">
                          <Badge variant={getStatusBadge(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Amount</div>
                        <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Payment Method</div>
                        <div className="font-medium">{transaction.method}</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => setViewingTransaction(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
