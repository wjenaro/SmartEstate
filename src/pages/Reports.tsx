
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  Building,
  Users,
  DollarSign
} from "lucide-react";

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedReport, setSelectedReport] = useState("financial");

  const reportTypes = [
    { value: "financial", label: "Financial Overview", icon: DollarSign },
    { value: "occupancy", label: "Occupancy Rates", icon: Building },
    { value: "tenant", label: "Tenant Analysis", icon: Users },
    { value: "maintenance", label: "Maintenance Reports", icon: Calendar }
  ];

  const mockFinancialData = {
    totalRevenue: 250000,
    totalExpenses: 85000,
    netIncome: 165000,
    occupancyRate: 87,
    averageRent: 2500
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Generate and view detailed reports for your properties
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card 
                key={report.value}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedReport === report.value ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedReport(report.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{report.label}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedReport === "financial" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {mockFinancialData.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    +12.5% from last month
                  </Badge>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {mockFinancialData.totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    +3.2% from last month
                  </Badge>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {mockFinancialData.netIncome.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    +8.1% from last month
                  </Badge>
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Chart will be implemented with actual data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedReport === "occupancy" && (
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Current Occupancy Rate</h4>
                    <div className="text-3xl font-bold text-green-600">{mockFinancialData.occupancyRate}%</div>
                  </div>
                  <div>
                    <h4 className="font-medium">Average Rent</h4>
                    <div className="text-2xl font-bold">KES {mockFinancialData.averageRent.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center h-48 bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Occupancy chart placeholder</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedReport === "tenant" && (
          <Card>
            <CardHeader>
              <CardTitle>Tenant Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Tenant analytics will be implemented</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedReport === "maintenance" && (
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Maintenance reports will be implemented</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Reports;
