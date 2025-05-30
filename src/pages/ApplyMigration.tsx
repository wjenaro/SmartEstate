import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageWrapper } from "@/components/layout/PageWrapper";

// SQL migration content
const MIGRATION_SQL = `
-- Migration to implement account-based data isolation in SmartEstate

-- =======================================
-- 1. Add account_id column to tables
-- =======================================

-- Add account_id column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS account_id UUID;

-- Add account_id column to units table
ALTER TABLE units ADD COLUMN IF NOT EXISTS account_id UUID;

-- Add account_id column to utility_readings table
ALTER TABLE utility_readings ADD COLUMN IF NOT EXISTS account_id UUID;

-- Add account_id column to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS account_id UUID;

-- Add account_id column to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS account_id UUID;

-- =======================================
-- 2. Add indexes for better performance
-- =======================================

-- Index on properties.account_id
CREATE INDEX IF NOT EXISTS idx_properties_account_id ON properties(account_id);

-- Index on units.account_id
CREATE INDEX IF NOT EXISTS idx_units_account_id ON units(account_id);

-- Index on utility_readings.account_id
CREATE INDEX IF NOT EXISTS idx_utility_readings_account_id ON utility_readings(account_id);

-- Index on tenants.account_id
CREATE INDEX IF NOT EXISTS idx_tenants_account_id ON tenants(account_id);

-- Index on invoices.account_id
CREATE INDEX IF NOT EXISTS idx_invoices_account_id ON invoices(account_id);
`;

export default function ApplyMigration() {
  const [isApplying, setIsApplying] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const applyMigration = async () => {
    setIsApplying(true);
    setErrorMessage(null);
    
    try {
      // Execute the SQL migration directly
      const { error } = await supabase.rpc('exec_sql', { sql: MIGRATION_SQL });
      
      if (error) {
        console.error("Migration failed:", error);
        setMigrationStatus('error');
        setErrorMessage(error.message);
        toast({
          title: "Migration Failed",
          description: `Failed to apply migration: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log("Migration successful");
        setMigrationStatus('success');
        toast({
          title: "Migration Successful",
          description: "The database migration was successfully applied.",
          variant: "default"
        });
      }
    } catch (err: any) {
      console.error("Error applying migration:", err);
      setMigrationStatus('error');
      setErrorMessage(err.message || String(err));
      toast({
        title: "Migration Error",
        description: `An unexpected error occurred: ${err.message || String(err)}`,
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <MainLayout>
      <PageWrapper>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Database Migration</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Apply Account Data Isolation Migration
              </CardTitle>
              <CardDescription>
                Add necessary database columns for account-based data isolation
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert variant={migrationStatus === 'error' ? "destructive" : "default"}>
                {migrationStatus === 'pending' && <Lock className="h-4 w-4" />}
                {migrationStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                {migrationStatus === 'error' && <AlertTriangle className="h-4 w-4" />}
                
                <AlertTitle>
                  {migrationStatus === 'pending' && "Migration Ready"}
                  {migrationStatus === 'success' && "Migration Applied Successfully"}
                  {migrationStatus === 'error' && "Migration Failed"}
                </AlertTitle>
                
                <AlertDescription>
                  {migrationStatus === 'pending' && 
                    "This will add account_id columns to your database tables to enable data isolation."}
                  {migrationStatus === 'success' && 
                    "The account isolation migration has been successfully applied. You can now use the account-based features."}
                  {migrationStatus === 'error' && errorMessage}
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-lg p-4 mt-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">What This Migration Does</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This migration implements the foundation for multi-tenant data isolation by adding account_id columns to your tables.
                    </p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Changes:</span>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          <li>Adds account_id columns to all relevant tables</li>
                          <li>Creates indexes for improved performance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={applyMigration} 
                disabled={isApplying || migrationStatus === 'success'} 
                className="w-full"
              >
                {isApplying ? (
                  <>
                    <span className="animate-spin mr-2">⚙️</span>
                    Applying Migration...
                  </>
                ) : migrationStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Migration Complete
                  </>
                ) : (
                  "Apply Migration"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageWrapper>
    </MainLayout>
  );
}
