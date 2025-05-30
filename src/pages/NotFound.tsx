
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="bg-muted/80 rounded-full p-6 mb-6">
          <div className="text-8xl font-bold text-muted-foreground">404</div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          We're sorry, the page you were looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4">
          <Link to="/">
            <Button>Back to Dashboard</Button>
          </Link>
          <Button variant="outline" onClick={() => history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
