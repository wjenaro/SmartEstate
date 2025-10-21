import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, Mail, ArrowLeft } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    phone: "",
    company_name: "",
    role: "landlord",
  });

  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        console.log("Attempting login for:", formData.email);
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "Successfully logged in.",
          });
          // AuthGuard will handle the redirect based on onboarding status
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "Please ensure both passwords are the same.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const userData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          company_name: formData.company_name,
          role: formData.role,
          is_demo: isDemo,
        };

        console.log("Attempting signup for:", formData.email, userData);
        const { error } = await signUp(
          formData.email,
          formData.password,
          userData
        );

        if (error) {
          // If user already exists, suggest they log in instead
          if (
            error.message.includes("already registered") ||
            error.message.includes("already exists")
          ) {
            toast({
              title: "Account Already Exists",
              description:
                "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
            setIsLogin(true); // Switch to login mode
          } else {
            toast({
              title: "Registration Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Registration Successful!",
            description: isDemo
              ? "Demo account created! You'll be redirected to onboarding."
              : "Account created! Please check your email to verify, then you'll be redirected to onboarding.",
          });
          // The AuthGuard will handle redirect to onboarding
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);

    try {
      const { error } = await resetPassword(forgotPasswordEmail);
      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Reset Email Sent",
          description:
            "Please check your email for instructions to reset your password.",
        });
        setForgotPasswordOpen(false);
        setForgotPasswordEmail("");
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDemoAccess = () => {
    // For demo, pre-fill with demo credentials and switch to signup
    setFormData({
      email: "demo@kangambili.co.ke",
      password: "demo123",
      confirmPassword: "demo123",
      first_name: "Demo",
      last_name: "User",
      phone: "+254700000000",
      company_name: "Demo Properties Ltd",
      role: "landlord",
    });
    setIsLogin(false);
    navigate("/auth?demo=true");
  };

  const handleExistingDemoUser = () => {
    // If demo user already exists, they can log in with demo credentials
    setFormData((prev) => ({
      ...prev,
      email: "demo@kangambili.co.ke",
      password: "demo123",
    }));
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isDemo ? "Try Demo" : isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          {isDemo && (
            <p className="text-sm text-muted-foreground">
              Experience our property management platform with demo limits: 2
              properties, 20 units
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        handleInputChange("first_name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company_name">Company Name (Optional)</Label>
                  <Input
                    id="company_name"
                    type="text"
                    value={formData.company_name}
                    onChange={(e) =>
                      handleInputChange("company_name", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+254..."
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landlord">Property Owner</SelectItem>
                      <SelectItem value="agent">Property Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && !isDemo && (
                  <Dialog
                    open={forgotPasswordOpen}
                    onOpenChange={setForgotPasswordOpen}
                  >
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Reset Password
                        </DialogTitle>
                        <DialogDescription>
                          Enter your email address and we'll send you a link to
                          reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={handleForgotPassword}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="forgot-email">Email</Label>
                          <Input
                            id="forgot-email"
                            type="email"
                            value={forgotPasswordEmail}
                            onChange={(e) =>
                              setForgotPasswordEmail(e.target.value)
                            }
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setForgotPasswordOpen(false)}
                            className="flex-1"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={forgotPasswordLoading}
                            className="flex-1"
                          >
                            {forgotPasswordLoading
                              ? "Sending..."
                              : "Send Reset Link"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : isDemo
                ? "Start Demo"
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {isDemo && isLogin && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={handleExistingDemoUser}
                className="w-full"
              >
                <Users className="mr-2 h-4 w-4" />
                Use Demo Credentials
              </Button>
            </div>
          )}

          {isLogin && !isDemo && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={handleDemoAccess}
                className="w-full"
              >
                <Users className="mr-2 h-4 w-4" />
                Try Demo Instead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
