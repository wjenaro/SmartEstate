import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Utility to apply database migrations to the Supabase instance
 * This handles the execution of SQL scripts for database structure changes
 */
export async function applyMigration(migrationName: string, sqlContent: string): Promise<boolean> {
  try {
    console.log(`Applying migration: ${migrationName}`);
    
    // For Supabase, we'll need to execute the SQL directly
    // This requires admin privileges, so in a real-world scenario,
    // this would be done through a secure backend function or migration tool
    const { error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      console.error(`Migration failed: ${migrationName}`, error);
      toast({
        title: 'Migration Failed',
        description: `The migration "${migrationName}" failed to apply: ${error.message}`,
        variant: 'destructive'
      });
      return false;
    }
    
    console.log(`Migration successful: ${migrationName}`);
    toast({
      title: 'Migration Successful',
      description: `The migration "${migrationName}" was successfully applied`,
      variant: 'default'
    });
    
    return true;
  } catch (err) {
    console.error(`Error applying migration: ${migrationName}`, err);
    toast({
      title: 'Migration Error',
      description: `An unexpected error occurred while applying the migration: ${String(err)}`,
      variant: 'destructive'
    });
    return false;
  }
}

/**
 * Apply the account data isolation migration
 * This function reads the SQL file content and applies it to the database
 */
export async function applyAccountDataIsolationMigration(): Promise<boolean> {
  try {
    // In a production environment, you would read the SQL file content
    // For now, we'll use a fetch to get the content
    const response = await fetch('/src/migrations/account_data_isolation.sql');
    if (!response.ok) {
      throw new Error(`Failed to fetch migration file: ${response.statusText}`);
    }
    
    const sqlContent = await response.text();
    return applyMigration('account_data_isolation', sqlContent);
  } catch (err) {
    console.error('Error loading migration file:', err);
    toast({
      title: 'Migration File Error',
      description: `Failed to load the migration file: ${String(err)}`,
      variant: 'destructive'
    });
    return false;
  }
}
