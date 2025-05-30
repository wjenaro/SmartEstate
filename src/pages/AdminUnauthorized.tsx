
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ShieldX, ArrowLeft } from "lucide-react";

const AdminUnauthorized = () => {
  const { signOut, adminUser } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <ShieldX className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You don't have sufficient permissions to access this resource.
          </p>
          
          {adminUser && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                <strong>Current Role:</strong> {adminUser.role}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {adminUser.email}
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button 
              onClick={() => navigate("/admin")}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Button>
            
            <Button 
              onClick={handleSignOut}
              variant="destructive"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUnauthorized;
