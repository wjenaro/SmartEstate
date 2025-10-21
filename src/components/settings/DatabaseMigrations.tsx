import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Database, Lock } from "lucide-react";
import { applyAccountDataIsolationMigration } from "@/utils/applyDatabaseMigrations";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Component for managing and applying database migrations
 * This allows administrators to implement account isolation features
 */
export function DatabaseMigrations() {
  const [isApplying, setIsApplying] = useState(false);
  const [lastApplied, setLastApplied] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to apply the account isolation migration
  const handleApplyIsolation = async () => {
    setIsApplying(true);

    try {
      const success = await applyAccountDataIsolationMigration();
      if (success) {
        setLastApplied(new Date().toISOString());
        toast({
          title: "Migration Applied",
          description:
            "Account isolation features have been successfully implemented.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error applying migration:", error);
      toast({
        title: "Migration Failed",
        description:
          "Failed to apply account isolation migration. See console for details.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Structure Management
        </CardTitle>
        <CardDescription>
          Apply database migrations to enhance your KangaMbili platform
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Admin privileges required</AlertTitle>
          <AlertDescription>
            These operations require administrator privileges and will modify
            your database structure. Please ensure you have a backup before
            proceeding.
          </AlertDescription>
        </Alert>

        <div className="border rounded-lg p-4 mt-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-medium">Account Data Isolation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Implement multi-tenant data isolation with Row-Level Security
                policies, foreign key constraints, and performance indexes.
              </p>

              <div className="mt-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Features:</span>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    <li>Row-Level Security for strict data isolation</li>
                    <li>Foreign key constraints for data integrity</li>
                    <li>Performance indexes on account_id columns</li>
                    <li>Data migration for existing records</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {lastApplied ? (
            <span>Last applied: {new Date(lastApplied).toLocaleString()}</span>
          ) : (
            <span>Not yet applied</span>
          )}
        </div>

        <Button onClick={handleApplyIsolation} disabled={isApplying}>
          {isApplying ? (
            <>
              <span className="animate-spin mr-2">⚙️</span>
              Applying...
            </>
          ) : (
            "Apply Account Isolation"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
