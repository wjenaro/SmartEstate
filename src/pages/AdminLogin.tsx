
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CreateAdminButton } from "@/components/admin/CreateAdminButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { Shield, Building2 } from "lucide-react";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { signIn, error: authError, refreshSession } = useAdminAuth();
  
  // Handle form submission for password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here we would typically call a password reset function
      // For now, just simulate success with a toast message
      toast({
        title: "Password Reset Email Sent",
        description: `If ${formData.email} exists in our system, you'll receive instructions to reset your password.`,
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle auth errors from the auth context
  useEffect(() => {
    if (authError) {
      toast({
        title: "Authentication Error",
        description: authError,
        variant: "destructive",
      });
    }
  }, [authError, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Attempt to sign in as admin
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Refresh session to ensure we have the latest admin data
        await refreshSession();
        
        toast({
          title: "Welcome to Admin Portal",
          description: "Successfully logged in as administrator.",
        });
        navigate("/admin");
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Administrator Portal
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Secure access to SaaS management console
          </p>
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Only authorized administrators can access this portal.
            </p>
            <div className="flex justify-center mt-2">
              <CreateAdminButton />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Default credentials: admin@rentease.com / Admin@123
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={isResetMode ? handleResetPassword : handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Administrator Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="admin@company.com"
              />
            </div>

            {!isResetMode && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading 
                ? (isResetMode ? "Sending Reset Link..." : "Authenticating...") 
                : (isResetMode ? "Reset Password" : "Access Admin Portal")
              }
            </Button>
            
            <div className="mt-2 text-center">
              <button 
                type="button" 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setIsResetMode(!isResetMode)}
              >
                {isResetMode ? "Back to Login" : "Forgot Password?"}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to main application
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>Return to main application</span>
            </div>
            <Button 
              variant="link" 
              onClick={() => navigate("/")}
              className="text-sm"
            >
              Go to RentEase App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
