
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Settings, MessageSquare, DollarSign, Users, Shield } from "lucide-react";

export const AdminSettingsPanel = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // SMS Settings
    smsApiKey: "sk_test_xxxxxxxxxxxx",
    smsEnabled: true,
    smsProvider: "twilio",
    
    // Demo Settings
    demoEnabled: true,
    demoMaxProperties: 2,
    demoMaxUnits: 20,
    
    // Subscription Settings
    starterPlanPrice: 2500,
    professionalPlanPrice: 5000,
    enterprisePlanPrice: 10000,
    
    // Application Settings
    maintenanceMode: false,
    registrationEnabled: true,
    maxUsersPerPlan: 1000,
    
    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    emailEnabled: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // In real app, this would save to database
    toast({
      title: "Settings Saved",
      description: "Application settings have been updated successfully.",
    });
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      {/* SMS Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>SMS Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable SMS notifications for the platform
              </p>
            </div>
            <Switch
              checked={settings.smsEnabled}
              onCheckedChange={(checked) => handleSettingChange("smsEnabled", checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="smsApiKey">SMS API Key</Label>
            <Input
              id="smsApiKey"
              type="password"
              value={settings.smsApiKey}
              onChange={(e) => handleSettingChange("smsApiKey", e.target.value)}
              disabled={!settings.smsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Demo Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Demo Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Demo Mode</Label>
              <p className="text-sm text-muted-foreground">
                Allow users to create demo accounts
              </p>
            </div>
            <Switch
              checked={settings.demoEnabled}
              onCheckedChange={(checked) => handleSettingChange("demoEnabled", checked)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demoMaxProperties">Max Properties (Demo)</Label>
              <Input
                id="demoMaxProperties"
                type="number"
                value={settings.demoMaxProperties}
                onChange={(e) => handleSettingChange("demoMaxProperties", parseInt(e.target.value))}
                disabled={!settings.demoEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="demoMaxUnits">Max Units (Demo)</Label>
              <Input
                id="demoMaxUnits"
                type="number"
                value={settings.demoMaxUnits}
                onChange={(e) => handleSettingChange("demoMaxUnits", parseInt(e.target.value))}
                disabled={!settings.demoEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Subscription Plans</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starterPrice">Starter Plan (KES)</Label>
              <Input
                id="starterPrice"
                type="number"
                value={settings.starterPlanPrice}
                onChange={(e) => handleSettingChange("starterPlanPrice", parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="professionalPrice">Professional Plan (KES)</Label>
              <Input
                id="professionalPrice"
                type="number"
                value={settings.professionalPlanPrice}
                onChange={(e) => handleSettingChange("professionalPlanPrice", parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="enterprisePrice">Enterprise Plan (KES)</Label>
              <Input
                id="enterprisePrice"
                type="number"
                value={settings.enterprisePlanPrice}
                onChange={(e) => handleSettingChange("enterprisePlanPrice", parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>System Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Put the application in maintenance mode
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>User Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow new user registrations
              </p>
            </div>
            <Switch
              checked={settings.registrationEnabled}
              onCheckedChange={(checked) => handleSettingChange("registrationEnabled", checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxUsers">Max Users Per Plan</Label>
            <Input
              id="maxUsers"
              type="number"
              value={settings.maxUsersPerPlan}
              onChange={(e) => handleSettingChange("maxUsersPerPlan", parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700">
          <Settings className="mr-2 h-4 w-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
};
