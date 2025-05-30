
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { User, Phone, FileText, Users, Loader2 } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { useUnits } from "@/hooks/useUnits";
import { useAddTenant } from "@/hooks/useTenants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";

// Tenant form validation schema
const tenantFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  id_number: z.string().optional(),
  kra_pin: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  date_of_birth: z.date().optional(),
  email: z.string().email("Invalid email format").optional().nullable(),
  phone_number: z.string().optional(),
  property_id: z.string().min(1, "Property is required"),
  unit_id: z.string().min(1, "Unit is required"),
  entry_date: z.date().optional(),
  status: z.enum(["active", "inactive", "former"]).default("active"),
  rent_payment_status: z.enum(["paid", "unpaid", "partial", "overdue"]).default("paid"),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  lease_start_date: z.date().optional(),
  lease_end_date: z.date().optional(),
  lease_terms: z.string().optional(),
  deposit_amount: z.union([
    z.number().positive("Amount must be positive").optional(),
    z.string().transform((val) => val === "" ? undefined : parseFloat(val))
  ]).optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

interface TenantFormProps {
  onClose?: () => void;
  initialPropertyId?: string;
}

export function TenantForm({ onClose, initialPropertyId }: TenantFormProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("personal");
  const { data: properties, isLoading: loadingProperties } = useProperties();
  const { data: allUnits, isLoading: loadingUnits } = useUnits();
  const { toast } = useToast();
  const addTenant = useAddTenant();
  
  // Initialize form with validation schema
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      status: "active",
      rent_payment_status: "paid",
      property_id: initialPropertyId || "",
    }
  });
  
  // Get units filtered by selected property
  const selectedPropertyId = form.watch("property_id");
  const filteredUnits = allUnits && Array.isArray(allUnits) 
    ? allUnits.filter(unit => 
        unit && typeof unit === 'object' && 'property_id' in unit && 
        unit.property_id === selectedPropertyId
      ) 
    : [];
  
  // Update form's unit_id field when property changes
  useEffect(() => {
    if (selectedPropertyId) {
      // Reset unit selection when property changes
      form.setValue("unit_id", "");
    }
  }, [selectedPropertyId, form]);
  
  // Handle form submission
  const onSubmit = async (values: TenantFormValues) => {
    try {
      console.log("Submitting tenant with data:", values);
      
      // Format dates for API
      const formattedValues = {
        ...values,
        first_name: values.first_name,
        last_name: values.last_name,
        status: values.status || 'active',  // Making sure required fields are present
        date_of_birth: values.date_of_birth ? values.date_of_birth.toISOString().split('T')[0] : undefined,
        lease_start_date: values.lease_start_date ? values.lease_start_date.toISOString().split('T')[0] : undefined,
        lease_end_date: values.lease_end_date ? values.lease_end_date.toISOString().split('T')[0] : undefined,
        entry_date: values.entry_date ? values.entry_date.toISOString().split('T')[0] : undefined,
      };
      
      await addTenant.mutateAsync(formattedValues as any);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting tenant form:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Tenant</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Personal Details</span>
                  <span className="md:hidden">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="hidden md:inline">Contact Info</span>
                  <span className="md:hidden">Contact</span>
                </TabsTrigger>
                <TabsTrigger value="lease" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden md:inline">Lease Details</span>
                  <span className="md:hidden">Lease</span>
                </TabsTrigger>
                <TabsTrigger value="emergency" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden md:inline">Emergency Contact</span>
                  <span className="md:hidden">Emergency</span>
                </TabsTrigger>
              </TabsList>
          
              <TabsContent value="personal" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter national ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kra_pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>KRA PIN</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter KRA PIN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <DatePicker 
                            date={field.value} 
                            setDate={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
          
              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="property_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          required
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingProperties ? (
                              <div className="flex items-center justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : properties && Array.isArray(properties) && properties.length > 0 ? (
                              properties.map(property => (
                                property && typeof property === 'object' && 'id' in property && 'name' in property ? (
                                  <SelectItem key={String(property.id)} value={String(property.id)}>
                                    {String(property.name)}
                                  </SelectItem>
                                ) : null
                              ))
                            ) : (
                              <SelectItem disabled value="none">
                                No properties available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!selectedPropertyId || loadingUnits}
                          required
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedPropertyId ? "Select unit" : "Select property first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingUnits ? (
                              <div className="flex items-center justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : filteredUnits.length === 0 ? (
                              <SelectItem disabled value="none">
                                No units available for this property
                              </SelectItem>
                            ) : (
                              filteredUnits.map(unit => (
                                unit && typeof unit === 'object' && 'id' in unit && 'unit_number' in unit ? (
                                  <SelectItem key={String(unit.id)} value={String(unit.id)}>
                                    Unit {String(unit.unit_number)}
                                  </SelectItem>
                                ) : null
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
          
          <TabsContent value="lease" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaseTerms">Lease Terms</Label>
                <Textarea id="leaseTerms" placeholder="Enter lease terms and conditions" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leaseStart">Lease Start Date</Label>
                <Input id="leaseStart" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaseEnd">Lease End Date</Label>
                <Input id="leaseEnd" type="date" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Monthly Rent (KES)*</Label>
                <Input id="monthlyRent" placeholder="Enter monthly rent" type="number" min="0" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">Security Deposit (KES)</Label>
                <Input id="deposit" placeholder="Enter deposit amount" type="number" min="0" step="0.01" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentPaymentStatus">Rent Payment Status*</Label>
                <Select defaultValue="paid">
                  <SelectTrigger id="rentPaymentStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500 hover:bg-green-500">Paid</Badge>
                        <span>Fully Paid</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="balance">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500 hover:bg-yellow-500">Balance</Badge>
                        <span>Has Balance</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="overdue">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-500 hover:bg-red-500">Overdue</Badge>
                        <span>Payment Overdue</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balanceAmount">Balance Amount (KES)</Label>
                <Input id="balanceAmount" placeholder="Enter balance amount if any" type="number" min="0" step="0.01" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
              <Select>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="emergency" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                <Input id="emergencyName" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Input id="relationship" placeholder="Enter relationship" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone Number</Label>
                <Input id="emergencyPhone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyEmail">Email Address</Label>
                <Input id="emergencyEmail" placeholder="Enter email address" type="email" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyAddress">Address</Label>
              <Textarea id="emergencyAddress" placeholder="Enter address" />
            </div>
          </TabsContent>
              <TabsContent value="emergency" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                    <Input id="emergencyName" placeholder="Enter full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input id="relationship" placeholder="Enter relationship" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Phone Number</Label>
                    <Input id="emergencyPhone" placeholder="Enter phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyEmail">Email Address</Label>
                    <Input id="emergencyEmail" placeholder="Enter email address" type="email" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyAddress">Address</Label>
                  <Textarea id="emergencyAddress" placeholder="Enter address" />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between mt-8">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <div className="space-x-2">
                {activeTab !== "personal" && (
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => {
                      const tabs = ["personal", "contact", "lease", "emergency"];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1]);
                      }
                    }}
                  >
                    Previous
                  </Button>
                )}
                
                {activeTab !== "emergency" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const tabs = ["personal", "contact", "lease", "emergency"];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={addTenant.isPending}
                  >
                    {addTenant.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Tenant
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
