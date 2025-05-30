import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Upload, DollarSign } from "lucide-react";

interface Property {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  unit_number: string;
}

interface MaintenanceFormProps {
  properties?: Property[];
  units?: Unit[];
  onClose?: () => void;
  propertyId?: string;
  onPropertyChange?: (propertyId: string) => void;
  onSubmit?: (values: any) => Promise<void>;
  onSuccess?: () => void;
}

export function MaintenanceForm({ 
  properties = [], 
  units = [], 
  onClose, 
  propertyId,
  onPropertyChange,
  onSubmit,
  onSuccess
}: MaintenanceFormProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  // Handle file uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...newFiles]);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };
  
  // Remove an image
  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    setImagePreviewUrls(prev => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[index]); // Clean up the URL object
      newUrls.splice(index, 1);
      return newUrls;
    });
  };
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Get form data
    const formElement = event.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    const values = {
      property_id: formData.get('property_id') as string,
      unit_id: formData.get('unit_id') as string || undefined,
      issue: formData.get('issue') as string,
      notes: formData.get('notes') as string || undefined,
      status: formData.get('status') as string || 'open',
      expense_amount: formData.get('expense_amount') ? parseFloat(formData.get('expense_amount') as string) : undefined
    };
    
    // Call the appropriate callback
    if (onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    } else if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          <span>Record Maintenance Issue</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_id">Property*</Label>
              <Select 
                required 
                name="property_id"
                defaultValue={propertyId} 
                onValueChange={(value) => {
                  if (onPropertyChange) onPropertyChange(value);
                }}
              >
                <SelectTrigger id="property_id">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_id">Unit</Label>
              <Select name="unit_id">
                <SelectTrigger id="unit_id">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common-area">None (Common Area/Whole Property)</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.unit_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issue">Maintenance Issue*</Label>
            <Textarea 
              id="issue" 
              name="issue"
              placeholder="Describe the maintenance issue" 
              className="min-h-24"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expenseAmount">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Expense Amount (KES)
                </span>
              </Label>
              <Input 
                id="expense_amount" 
                name="expense_amount"
                type="number" 
                min="0" 
                step="0.01" 
                placeholder="0.00" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportDate">Report Date</Label>
              <Input 
                id="reportDate" 
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status*</Label>
            <Select defaultValue="open" name="status">
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closing">Closing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              name="notes"
              placeholder="Add any additional information here" 
              className="min-h-20"
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="imageUpload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Upload Evidence (Optional)</span>
            </Label>
            
            <div className="border-2 border-dashed rounded-md p-4">
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="imageUpload" className="flex flex-col items-center justify-center h-32 cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload photos (JPG, PNG)
                </span>
              </label>
            </div>
            
            {imagePreviewUrls.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Uploaded Images ({imagePreviewUrls.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Uploaded preview ${index + 1}`} 
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
            >
              Record Maintenance
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
