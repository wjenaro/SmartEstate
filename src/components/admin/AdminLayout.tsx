import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const openMobileMenu = () => setMobileMenuOpen(true);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      
      {/* Mobile sidebar - shows as overlay when open */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={closeMobileMenu} />
          <div className="fixed top-0 left-0 bottom-0 z-50">
            <AdminSidebar isMobile onClose={closeMobileMenu} />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Admin header */}
        <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center px-4 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-300 hover:text-white mr-4"
            onClick={openMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-white">SmartEstate Admin</h1>
            
            <div className="flex items-center space-x-2">
              <div className="text-sm text-slate-300">
                <span className="block text-right">Admin</span>
                <span className="block text-xs text-slate-400">Super Admin</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
