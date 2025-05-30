import { ReactNode, createContext, useState, useContext, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSwipe } from "@/hooks/use-swipe";

interface MobileMenuContextType {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

interface MainLayoutProps {
  children: ReactNode;
}

export const MobileMenuContext = createContext<MobileMenuContextType>({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {},
});

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const openMobileMenu = () => setIsMobileMenuOpen(true);
  
  // Use swipe gesture to open/close the sidebar
  useSwipe({
    threshold: 70, // Higher threshold for more intentional swipes
    onSwipeRight: () => {
      if (isMobile && !isMobileMenuOpen) {
        openMobileMenu();
      }
    },
    onSwipeLeft: () => {
      if (isMobile && isMobileMenuOpen) {
        closeMobileMenu();
      }
    },
  });
  
  // Close mobile menu when orientation changes
  useEffect(() => {
    const handleResize = () => {
      if (isMobileMenuOpen) {
        closeMobileMenu();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  return (
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, toggleMobileMenu, closeMobileMenu }}>
      <div className="flex min-h-screen bg-background">
        {/* Only show sidebar directly in layout on larger screens */}
        {!isMobile && <Sidebar />}
        
        {/* Mobile overlay for when menu is open */}
        {isMobile && (
          <div 
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}
        
        {/* Mobile sidebar with higher z-index */}
        {isMobile && (
          <div 
            className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl`}
            style={{ touchAction: 'pan-y' }}
          >
            <div className="h-full">
              <Sidebar isMobile={true} />
              
              {/* Handle on the right side of sidebar for better UX indication of swipe capability */}
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 h-16 w-1 bg-primary/20 rounded-full" />
            </div>
          </div>
        )}
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main 
            className="flex-1 overflow-auto p-4 md:p-6"
            onClick={() => isMobile && isMobileMenuOpen && closeMobileMenu()}
          >
            {children}
          </main>
        </div>
      </div>
    </MobileMenuContext.Provider>
  );
}

// Custom hook to access the mobile menu context
export const useMobileMenu = () => useContext(MobileMenuContext);
