
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
import { Plus, Search, Building, Phone, Mail } from "lucide-react";
import { TenantForm } from "@/components/forms/TenantForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data for tenants
const tenantsData = [
  {
    id: 1,
    name: "John Doe",
    initials: "JD",
    property: "Riverside Apartments",
    unit: "A101",
    phone: "0712345678",
    email: "john.doe@example.com",
    moveInDate: "2024-03-15",
    leaseEnd: "2025-03-14",
    balance: 0,
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    initials: "JS",
    property: "Parklands Residences",
    unit: "B205",
    phone: "0723456789",
    email: "jane.smith@example.com",
    moveInDate: "2023-10-01",
    leaseEnd: "2024-09-30",
    balance: 5000,
    status: "active",
  },
  {
    id: 3,
    name: "Michael Johnson",
    initials: "MJ",
    property: "Westlands Heights",
    unit: "C304",
    phone: "0734567890",
    email: "michael.johnson@example.com",
    moveInDate: "2024-01-10",
    leaseEnd: "2024-12-09",
    balance: 0,
    status: "active",
  },
  {
    id: 4,
    name: "Sarah Williams",
    initials: "SW",
    property: "Riverside Apartments",
    unit: "A205",
    phone: "0745678901",
    email: "sarah.williams@example.com",
    moveInDate: "2024-04-01",
    leaseEnd: "2025-03-31",
    balance: 0,
    status: "active",
  },
  {
    id: 5,
    name: "Robert Brown",
    initials: "RB",
    property: "Kilimani Plaza",
    unit: "D102",
    phone: "0756789012",
    email: "robert.brown@example.com",
    moveInDate: "2024-02-15",
    leaseEnd: "2024-08-14",
    balance: 10000,
    status: "notice",
  },
];

const Tenants = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  
  const filteredTenants = tenantsData.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.includes(searchQuery) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">
            Manage your tenants and view their information.
          </p>
        </div>
        <Button className="w-full md:w-auto" onClick={() => setIsAddTenantOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
              className="pl-8 w-full bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 self-end">
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Tenant</TableHead>
              <TableHead>Property & Unit</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Lease Period</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No tenants found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {tenant.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{tenant.name}</div>
                        <Badge 
                          variant={tenant.status === "active" ? "outline" : "destructive"}
                          className="mt-1"
                        >
                          {tenant.status === "active" ? "Active" : "Notice Given"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div>{tenant.property}</div>
                        <div className="text-sm text-muted-foreground">Unit {tenant.unit}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{tenant.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{tenant.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(tenant.moveInDate).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">to {new Date(tenant.leaseEnd).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tenant.balance > 0 ? (
                      <div className="text-rose-500 font-medium">
                        KES {tenant.balance.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-emerald-500 font-medium">Paid</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddTenantOpen} onOpenChange={setIsAddTenantOpen}>
        <DialogContent className="max-w-4xl">
          <TenantForm />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Tenants;
