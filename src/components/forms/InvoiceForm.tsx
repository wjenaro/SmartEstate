
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Trash, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export function InvoiceForm() {
  const [invoiceItems, setInvoiceItems] = useState([
    { id: 1, description: "Monthly Rent", amount: 25000 },
    { id: 2, description: "Water Bill", amount: 1500 },
  ]);

  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");

  const addInvoiceItem = () => {
    if (newItemDescription && newItemAmount) {
      const newItem = {
        id: invoiceItems.length + 1,
        description: newItemDescription,
        amount: parseFloat(newItemAmount),
      };
      setInvoiceItems([...invoiceItems, newItem]);
      setNewItemDescription("");
      setNewItemAmount("");
    }
  };

  const removeInvoiceItem = (id: number) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
  };

  const totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceType">Invoice Type</Label>
              <Select>
                <SelectTrigger id="invoiceType">
                  <SelectValue placeholder="Select invoice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent Invoice</SelectItem>
                  <SelectItem value="utility">Utility Invoice</SelectItem>
                  <SelectItem value="other">Other Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input id="invoiceDate" type="date" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property">Property</Label>
              <Select>
                <SelectTrigger id="property">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Riverside Apartments</SelectItem>
                  <SelectItem value="2">Parklands Residences</SelectItem>
                  <SelectItem value="3">Westlands Heights</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit/House</Label>
              <Select>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A101">A101</SelectItem>
                  <SelectItem value="A102">A102</SelectItem>
                  <SelectItem value="B201">B201</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenant">Tenant</Label>
            <Select>
              <SelectTrigger id="tenant">
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">John Doe</SelectItem>
                <SelectItem value="2">Jane Smith</SelectItem>
                <SelectItem value="3">Michael Johnson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-3">Invoice Items</h3>
            <Table>
              <TableCaption>List of invoice items</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Description</TableHead>
                  <TableHead className="text-right">Amount (KES)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => removeInvoiceItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <Input
                      placeholder="Enter description"
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      placeholder="Enter amount"
                      value={newItemAmount}
                      onChange={(e) => setNewItemAmount(e.target.value)}
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={addInvoiceItem}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex justify-end text-lg font-medium mt-4">
              <span className="mr-8">Total:</span>
              <span>KES {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="sendSMS" />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="sendSMS"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send SMS notification
              </Label>
              <p className="text-sm text-muted-foreground">
                Notify the tenant about this invoice via SMS
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit">Generate Invoice</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
