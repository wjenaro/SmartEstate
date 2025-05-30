
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Send, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { useSMSNotifications, useSendRentReminders, useSendCustomSMS } from "@/hooks/useSMSNotifications";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SMSNotifications = () => {
  const [customMessage, setCustomMessage] = useState("");
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [isCustomSMSOpen, setIsCustomSMSOpen] = useState(false);

  const { data: notifications, isLoading } = useSMSNotifications();
  const { mutate: sendRentReminders, isPending: sendingReminders } = useSendRentReminders();
  const { mutate: sendCustomSMS, isPending: sendingCustom } = useSendCustomSMS();
  const { toast } = useToast();

  const handleSendRentReminders = () => {
    sendRentReminders(undefined, {
      onSuccess: (data) => {
        toast({
          title: "Rent Reminders Sent",
          description: data.message || "Rent reminders have been sent successfully",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to send rent reminders",
          variant: "destructive",
        });
      },
    });
  };

  const handleSendCustomSMS = () => {
    if (!customMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    if (selectedTenants.length === 0) {
      toast({
        title: "Recipients Required", 
        description: "Please select at least one tenant",
        variant: "destructive",
      });
      return;
    }

    sendCustomSMS({
      tenantIds: selectedTenants,
      message: customMessage,
    }, {
      onSuccess: (data) => {
        toast({
          title: "SMS Sent",
          description: `Message sent to ${data.sent} tenants`,
        });
        setCustomMessage("");
        setSelectedTenants([]);
        setIsCustomSMSOpen(false);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to send SMS",
          variant: "destructive",
        });
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "rent_reminder":
        return "bg-blue-100 text-blue-800";
      case "payment_confirmation":
        return "bg-green-100 text-green-800";
      case "general":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SMS Notifications</h1>
            <p className="text-muted-foreground">
              Manage automated reminders and send custom messages to tenants
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCustomSMSOpen} onOpenChange={setIsCustomSMSOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Custom SMS
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Send Custom SMS</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tenants">Recipients</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenants" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tenants</SelectItem>
                        <SelectItem value="overdue">Overdue Tenants</SelectItem>
                        <SelectItem value="active">Active Tenants</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {160 - customMessage.length} characters remaining
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCustomSMSOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendCustomSMS}
                      disabled={sendingCustom}
                      className="flex-1"
                    >
                      {sendingCustom ? "Sending..." : "Send SMS"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleSendRentReminders} disabled={sendingReminders}>
              <Send className="mr-2 h-4 w-4" />
              {sendingReminders ? "Sending..." : "Send Rent Reminders"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SMS Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications?.filter(n => n.status === 'sent').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rent Reminders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications?.filter(n => n.type === 'rent_reminder').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Confirmations</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications?.filter(n => n.type === 'payment_confirmation').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed SMS</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {notifications?.filter(n => n.status === 'failed').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent SMS Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent SMS Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No SMS notifications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications?.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        {notification.tenants
                          ? `${notification.tenants.first_name} ${notification.tenants.last_name}`
                          : "Unknown Tenant"
                        }
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {notification.phone_number}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {notification.message}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(notification.status)}
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.sent_at
                          ? new Date(notification.sent_at).toLocaleString()
                          : new Date(notification.created_at).toLocaleString()
                        }
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* SMS Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>SMS Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">AfricaTalking Integration</h4>
              <p className="text-sm text-blue-800">
                SMS notifications are powered by AfricaTalking. To configure your API credentials, 
                contact support or update your settings in the admin panel.
              </p>
              <div className="mt-3">
                <Badge variant="outline">API Key: AT_***_CONFIGURED</Badge>
                <Badge variant="outline" className="ml-2">Username: CONFIGURED</Badge>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Automatic Rent Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send automatic reminders 3 days before rent is due and for overdue payments
                </p>
                <Button variant="outline" className="mt-2" size="sm">
                  Configure Schedule
                </Button>
              </div>
              <div>
                <Label>Payment Confirmations</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically notify tenants when payments are received and processed
                </p>
                <Button variant="outline" className="mt-2" size="sm">
                  Configure Templates
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SMSNotifications;
