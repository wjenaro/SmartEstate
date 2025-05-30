import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Filter, Droplet, Zap, LineChart, ArrowUp, ArrowDown } from "lucide-react";
import { UtilityReadingForm } from "@/components/forms/UtilityReadingForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for utility readings
const utilityReadingsData = [
  {
    id: 1,
    property: "Riverside Apartments",
    unit: "A101",
    utility_type: "water",
    current_reading: 532.5,
    previous_reading: 498.2,
    reading_date: "2025-05-20",
    month: "May",
    year: 2025,
    rate: 120,
    amount: 4116,
  },
  {
    id: 2,
    property: "Riverside Apartments",
    unit: "A101",
    utility_type: "electricity",
    current_reading: 7845,
    previous_reading: 7520,
    reading_date: "2025-05-20",
    month: "May",
    year: 2025,
    rate: 25.5,
    amount: 8287.5,
  },
  {
    id: 3,
    property: "Parklands Residences",
    unit: "B205",
    utility_type: "water",
    current_reading: 425.8,
    previous_reading: 405.3,
    reading_date: "2025-05-18",
    month: "May",
    year: 2025,
    rate: 120,
    amount: 2460,
  },
  {
    id: 4,
    property: "Parklands Residences",
    unit: "B205",
    utility_type: "electricity",
    current_reading: 5320,
    previous_reading: 5120,
    reading_date: "2025-05-18",
    month: "May",
    year: 2025,
    rate: 25.5,
    amount: 5100,
  },
  {
    id: 5,
    property: "Westlands Heights",
    unit: "C304",
    utility_type: "water",
    current_reading: 328.4,
    previous_reading: 310.5,
    reading_date: "2025-05-15",
    month: "May",
    year: 2025,
    rate: 120,
    amount: 2148,
  },
  {
    id: 6,
    property: "Kilimani Plaza",
    unit: "D102",
    utility_type: "electricity",
    current_reading: 9850,
    previous_reading: 9450,
    reading_date: "2025-05-22",
    month: "May",
    year: 2025,
    rate: 25.5,
    amount: 10200,
  }
];

// Properties mock data
const propertiesData = [
  { id: "1", name: "Riverside Apartments", water_rate: 120, electricity_rate: 25.5 },
  { id: "2", name: "Parklands Residences", water_rate: 120, electricity_rate: 25.5 },
  { id: "3", name: "Westlands Heights", water_rate: 120, electricity_rate: 25.5 },
  { id: "4", name: "Kilimani Plaza", water_rate: 120, electricity_rate: 25.5 },
];

// Units mock data
const unitsData = [
  { id: "101", unit_number: "A101", property_id: "1" },
  { id: "102", unit_number: "A102", property_id: "1" },
  { id: "103", unit_number: "B205", property_id: "2" },
  { id: "104", unit_number: "C304", property_id: "3" },
  { id: "105", unit_number: "D102", property_id: "4" },
];

const Utilities = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [utilityTypeFilter, setUtilityTypeFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all-properties");
  const [monthFilter, setMonthFilter] = useState("all-months");
  const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter utility readings data based on filters and active tab
  const filteredReadings = utilityReadingsData.filter((item) => {
    const matchesSearch = 
      item.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesUtilityType = utilityTypeFilter === "all" || item.utility_type === utilityTypeFilter;
    const matchesProperty = propertyFilter === "all-properties" || item.property === propertiesData.find(p => p.id === propertyFilter)?.name;
    const matchesMonth = monthFilter === "all-months" || item.month === monthFilter;
    const matchesTab = activeTab === "all" ? true : item.utility_type === activeTab;
    
    return matchesSearch && matchesUtilityType && matchesProperty && matchesMonth && matchesTab;
  });
  
  // Get utility type icon
  const getUtilityIcon = (type: string) => {
    switch (type) {
      case "water":
        return <Droplet className="h-4 w-4 text-blue-500" />;
      case "electricity":
        return <Zap className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  // Get consumption with trend indicator
  const getConsumptionWithTrend = (current: number, previous: number) => {
    const consumption = current - previous;
    const isIncrease = consumption > 0;
    
    return (
      <div className="flex items-center gap-1">
        <span>{consumption.toFixed(2)}</span>
        {isIncrease ? (
          <ArrowUp className="h-3 w-3 text-red-500" />
        ) : (
          <ArrowDown className="h-3 w-3 text-green-500" />
        )}
      </div>
    );
  };
  
  // Get responsive card for mobile view
  const getUtilityCard = (item: any) => {
    return (
      <Card key={item.id} className="p-4 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium">{item.property}</h3>
            <p className="text-sm text-muted-foreground">Unit: {item.unit}</p>
          </div>
          <Badge className={item.utility_type === "water" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>
            <div className="flex items-center gap-1">
              {getUtilityIcon(item.utility_type)}
              <span className="capitalize">{item.utility_type}</span>
            </div>
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-y-2 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Reading</p>
            <p className="font-medium">{item.current_reading}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Previous Reading</p>
            <p className="font-medium">{item.previous_reading}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Consumption</p>
            <p className="font-medium">
              {getConsumptionWithTrend(item.current_reading, item.previous_reading)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rate</p>
            <p className="font-medium">KES {item.rate}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-lg font-bold">KES {item.amount.toLocaleString()}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {item.month} {item.year}
          </div>
        </div>
      </Card>
    );
  };

  // Months array for filter
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utilities</h1>
          <p className="text-muted-foreground">
            Track water and electricity consumption and billing
          </p>
        </div>
        <Button
          className="w-full md:w-auto"
          onClick={() => setIsAddReadingOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Record Reading
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Water Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Droplet className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">
                {utilityReadingsData
                  .filter(item => item.utility_type === "water")
                  .reduce((sum, item) => sum + (item.current_reading - item.previous_reading), 0)
                  .toFixed(2)}
              </span>
              <span className="text-muted-foreground ml-2">units</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Electricity Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold">
                {utilityReadingsData
                  .filter(item => item.utility_type === "electricity")
                  .reduce((sum, item) => sum + (item.current_reading - item.previous_reading), 0)
                  .toFixed(2)}
              </span>
              <span className="text-muted-foreground ml-2">kWh</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Billing Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <LineChart className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">
                KES {utilityReadingsData
                  .reduce((sum, item) => sum + item.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Utilities</TabsTrigger>
          <TabsTrigger value="water" className="flex items-center gap-1">
            <Droplet className="h-4 w-4" />
            <span>Water</span>
          </TabsTrigger>
          <TabsTrigger value="electricity" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>Electricity</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search utilities..."
              className="pl-8 w-full bg-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-properties">All Properties</SelectItem>
                {propertiesData.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-months">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {isMobile ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={`skeleton-card-${index}`} className="p-4 mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                    </div>
                    <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 mb-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i}>
                        <div className="h-3 w-20 bg-muted animate-pulse rounded mb-1"></div>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredReadings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No utility readings found.
            </div>
          ) : (
            filteredReadings.map((item) => getUtilityCard(item))
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Property</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Utility</TableHead>
                <TableHead>Current Reading</TableHead>
                <TableHead>Previous Reading</TableHead>
                <TableHead>Consumption</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-8 w-16 bg-muted animate-pulse rounded ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredReadings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    No utility readings found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReadings.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.property}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getUtilityIcon(item.utility_type)}
                        <span className="capitalize">{item.utility_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.current_reading}</TableCell>
                    <TableCell>{item.previous_reading}</TableCell>
                    <TableCell>
                      {getConsumptionWithTrend(item.current_reading, item.previous_reading)}
                    </TableCell>
                    <TableCell>KES {item.rate}</TableCell>
                    <TableCell>{item.month} {item.year}</TableCell>
                    <TableCell>
                      <span className="font-medium">
                        KES {item.amount.toLocaleString()}
                      </span>
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
      )}

      <Dialog open={isAddReadingOpen} onOpenChange={setIsAddReadingOpen}>
        <DialogContent className="max-w-3xl">
          <UtilityReadingForm 
            properties={propertiesData}
            units={unitsData}
            onClose={() => setIsAddReadingOpen(false)}
            onSuccess={() => {
              setIsAddReadingOpen(false);
              toast({
                title: "Utility reading recorded",
                description: "The utility reading has been successfully recorded.",
              });
              // In a real app, this would refetch the data
            }}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Utilities;
