
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";

import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import Units from "./pages/Units";
import Tenants from "./pages/Tenants";
import Invoices from "./pages/Invoices";
import Financials from "./pages/Financials";
import Payments from "./pages/Payments";
import Expenses from "./pages/Expenses";
import Subscription from "./pages/Subscription";
import SMSNotifications from "./pages/SMSNotifications";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminUnauthorized from "./pages/AdminUnauthorized";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Documents from "./pages/Documents";
import Messages from "./pages/Messages";
import Maintenance from "./pages/Maintenance";
import Utilities from "./pages/Utilities";
import NotFound from "./pages/NotFound";
import ApplyMigration from "./pages/ApplyMigration";
import PropertyDetail from "./pages/PropertyDetail";
import UnitDetails from "./pages/UnitDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AdminAuthProvider>
            <Routes>
              {/* Default route now goes to landing page */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Public routes */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/auth" element={
                <AuthGuard requireAuth={false}>
                  <Auth />
                </AuthGuard>
              } />
              
              {/* Onboarding route */}
              <Route path="/onboarding" element={
                <AuthGuard requireAuth={true}>
                  <Onboarding />
                </AuthGuard>
              } />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Index />
                </AuthGuard>
              } />
              <Route path="/properties" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Properties />
                </AuthGuard>
              } />
              <Route path="/properties/:id" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <PropertyDetail />
                </AuthGuard>
              } />
              <Route path="/units" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Units />
                </AuthGuard>
              } />
              <Route path="/units/:id" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <UnitDetails />
                </AuthGuard>
              } />
              <Route path="/tenants" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Tenants />
                </AuthGuard>
              } />
              <Route path="/invoices" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Invoices />
                </AuthGuard>
              } />
              <Route path="/financials" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Financials />
                </AuthGuard>
              } />
              <Route path="/payments" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Payments />
                </AuthGuard>
              } />
              <Route path="/expenses" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Expenses />
                </AuthGuard>
              } />
              <Route path="/subscription" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Subscription />
                </AuthGuard>
              } />
              <Route path="/sms" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <SMSNotifications />
                </AuthGuard>
              } />
              <Route path="/reports" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Reports />
                </AuthGuard>
              } />
              <Route path="/profile" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Profile />
                </AuthGuard>
              } />
              <Route path="/settings" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Settings />
                </AuthGuard>
              } />
              <Route path="/documents" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Documents />
                </AuthGuard>
              } />
              <Route path="/messages" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Messages />
                </AuthGuard>
              } />
              <Route path="/maintenance" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Maintenance />
                </AuthGuard>
              } />
              <Route path="/utilities" element={
                <AuthGuard requireAuth={true} requireOnboarding={true}>
                  <Utilities />
                </AuthGuard>
              } />
              
              {/* Migration route - accessible directly */}
              <Route path="/apply-migration" element={<ApplyMigration />} />
              
              {/* Admin routes - separate authentication */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
              <Route path="/admin" element={
                <AdminAuthGuard>
                  <AdminDashboard />
                </AdminAuthGuard>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
