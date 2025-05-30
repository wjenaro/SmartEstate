import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { seedAdminUser } from '@/lib/seed-admin';

export function CreateAdminButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      const result = await seedAdminUser();
      
      if (result.success) {
        if (result.message.includes('already exists')) {
          toast({
            title: 'Admin User Already Exists',
            description: `Email: ${result.credentials?.email}. Use the Reset Password feature to set a password.`,
          });
        } else {
          toast({
            title: 'Admin User Created',
            description: `Email: ${result.credentials?.email}. ${result.credentials?.instructions}`,
          });
        }
      } else {
        toast({
          title: 'Failed to Create Admin',
          description: result.message || 'An error occurred with the database',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to create admin user in database',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2 mt-2"
      onClick={handleCreateAdmin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Shield className="h-4 w-4" />
      )}
      Create Admin Account
    </Button>
  );
}
