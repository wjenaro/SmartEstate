
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const AdminPaymentTransactions = () => {
  const transactions = [
    {
      id: "TXN-001",
      user: "John Doe",
      amount: "KES 5,000",
      method: "M-Pesa",
      reference: "QR7X8Y9Z0A",
      status: "completed",
      date: "2024-01-25"
    },
    {
      id: "TXN-002",
      user: "Jane Smith",
      amount: "KES 2,500",
      method: "KCB Bank",
      reference: "KCB123456789",
      status: "pending",
      date: "2024-01-25"
    },
    {
      id: "TXN-003",
      user: "Mike Johnson",
      amount: "KES 10,000",
      method: "M-Pesa",
      reference: "QR1A2B3C4D",
      status: "failed",
      date: "2024-01-24"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payment Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>{transaction.user}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{transaction.method}</TableCell>
                <TableCell className="font-mono text-sm">{transaction.reference}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
