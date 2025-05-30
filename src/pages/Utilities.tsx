import React, { useState, useEffect, useMemo } from "react";
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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUtilityReadings, usePropertiesWithRates, useUnitsForUtilities } from "@/hooks/useUtilityReadings";
import { useAccountScoping } from "@/hooks/useAccountScoping";
import { AccountBadge } from "@/components/ui/account-badge";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// The utility readings, properties, and units data is now fetched with account isolation via custom hooks

const Utilities = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { isAuthenticated } = useAccountScoping();
  const queryClient = useQueryClient();
  const { data: utilityReadings, isLoading: isReadingsLoading } = useUtilityReadings();
  const { data: properties, isLoading: isPropertiesLoading } = usePropertiesWithRates();
  const { data: units, isLoading: isUnitsLoading } = useUnitsForUtilities();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [utilityTypeFilter, setUtilityTypeFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all-properties");
  const [monthFilter, setMonthFilter] = useState("all-months");
  const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Combined loading state
  const isLoading = isReadingsLoading || isPropertiesLoading || isUnitsLoading;
  
  // Filter utility readings data based on filters and active tab
  const filteredReadings = React.useMemo(() => {
    if (!utilityReadings || !Array.isArray(utilityReadings)) return [];
    
    return utilityReadings.filter((item) => {
      // Skip invalid items
      if (!item || typeof item !== 'object') return false;
      
      const property = item.property || '';
      const unit = item.unit || '';
      
      const matchesSearch = 
        property.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.toString().toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesUtilityType = utilityTypeFilter === "all" || item.utility_type === utilityTypeFilter;
      const matchesProperty = propertyFilter === "all-properties" || item.property_id === propertyFilter;
      const matchesMonth = monthFilter === "all-months" || `${item.month}-${item.year}` === monthFilter;
      const matchesTab = activeTab === "all" ? true : item.utility_type === activeTab;
      
      return matchesSearch && matchesUtilityType && matchesProperty && matchesMonth && matchesTab;
    });
  }, [utilityReadings, searchQuery, utilityTypeFilter, propertyFilter, monthFilter, activeTab]);
  
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
  const getConsumptionWithTrend = (current: number | null | undefined, previous: number | null | undefined) => {
    const currentValue = typeof current === 'number' ? current : 0;
    const previousValue = typeof previous === 'number' ? previous : 0;
    
    const consumption = currentValue - previousValue;
    const isIncrease = consumption > 0;
    
    return (
      <div className="flex items-center gap-1">
        <span>{consumption.toFixed(2)}</span>
        {isIncrease ? (
          <ArrowUp className="h-3 w-3 text-red-500" />
        ) : consumption === 0 ? null : (
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
            <p className="text-lg font-bold">KES {(item.amount || 0).toLocaleString()}</p>
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
          <div className="flex items-center">
            <h1 className="text-3xl font-bold tracking-tight">Utility Readings</h1>
            <AccountBadge />
          </div>
          <p className="text-muted-foreground">
            Record and manage utility readings for your properties.
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
                {utilityReadings && Array.isArray(utilityReadings) 
                  ? utilityReadings
                    .filter(item => item.utility_type === "water")
                    .reduce((sum, item) => sum + (item.current_reading - item.previous_reading), 0)
                    .toFixed(2)
                  : "0.00"}
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
                {utilityReadings && Array.isArray(utilityReadings) 
                  ? utilityReadings
                    .filter(item => item.utility_type === "electricity")
                    .reduce((sum, item) => sum + (item.current_reading - item.previous_reading), 0)
                    .toFixed(2)
                  : "0.00"}
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
                KES {utilityReadings && Array.isArray(utilityReadings) 
                  ? utilityReadings
                    .reduce((sum, item) => sum + (item.amount || 0), 0)
                    .toLocaleString()
                  : "0"}
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
                {properties?.map((property) => (
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
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogTitle>Record Utility Reading</DialogTitle>
          <DialogDescription>
            Enter the details for water and/or electricity utility readings.
          </DialogDescription>
          <UtilityReadingForm 
            properties={properties || []}
            units={units || []}
            onClose={() => setIsAddReadingOpen(false)}
            onSubmit={async (values) => {
              try {
                // Call the API endpoint to save the utility reading
                const { error } = await supabase
                  .from('unit_utilities')
                  .insert(values);
                  
                if (error) throw error;
                
                setIsAddReadingOpen(false);
                toast({
                  title: "Utility reading recorded",
                  description: "The utility reading has been successfully recorded.",
                });
                
                // Refresh data
                await queryClient.invalidateQueries({ queryKey: ['utility_readings'] });
              } catch (error) {
                console.error('Error recording utility reading:', error);
                toast({
                  title: "Error recording reading",
                  description: "There was a problem saving the utility reading.",
                  variant: "destructive"
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Utilities;
