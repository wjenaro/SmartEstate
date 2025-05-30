
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function PropertyForm() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Property</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Property Name</Label>
              <Input id="propertyName" placeholder="Enter property name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Input id="propertyType" placeholder="e.g. Apartment, Commercial, etc." />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="propertyAddress">Address</Label>
            <Textarea id="propertyAddress" placeholder="Enter complete address" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City/Town</Label>
              <Input id="city" placeholder="Enter city or town" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input id="county" placeholder="Enter county" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" placeholder="Enter postal code" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalUnits">Total Units</Label>
              <Input id="totalUnits" placeholder="Enter number of units" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input id="yearBuilt" placeholder="Enter year built" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Property Description</Label>
            <Textarea id="description" placeholder="Enter property description" />
          </div>
          
          <h3 className="font-semibold text-lg pt-2">Caretaker Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caretakerName">Caretaker Name</Label>
              <Input id="caretakerName" placeholder="Enter caretaker name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caretakerPhone">Caretaker Phone</Label>
              <Input id="caretakerPhone" placeholder="Enter caretaker phone" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="caretakerEmail">Caretaker Email</Label>
            <Input id="caretakerEmail" placeholder="Enter caretaker email" type="email" />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button">Cancel</Button>
            <Button type="submit">Save Property</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
