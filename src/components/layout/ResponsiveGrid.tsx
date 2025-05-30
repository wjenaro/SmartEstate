import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "none" | "sm" | "md" | "lg";
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "md"
}: ResponsiveGridProps) {
  // Generate dynamic Tailwind classes based on props
  // This is safer than string interpolation which doesn't work well with Tailwind's purge
  const getGridColsClass = () => {
    const classes = [];
    
    // Default mobile layout (smallest screens)
    if (cols.sm === 1) classes.push('grid-cols-1');
    else if (cols.sm === 2) classes.push('grid-cols-2');
    else if (cols.sm === 3) classes.push('grid-cols-3');
    else if (cols.sm === 4) classes.push('grid-cols-4');
    
    // Medium screens (tablets)
    if (cols.md === 1) classes.push('md:grid-cols-1');
    else if (cols.md === 2) classes.push('md:grid-cols-2');
    else if (cols.md === 3) classes.push('md:grid-cols-3');
    else if (cols.md === 4) classes.push('md:grid-cols-4');
    
    // Large screens (laptops)
    if (cols.lg === 1) classes.push('lg:grid-cols-1');
    else if (cols.lg === 2) classes.push('lg:grid-cols-2');
    else if (cols.lg === 3) classes.push('lg:grid-cols-3');
    else if (cols.lg === 4) classes.push('lg:grid-cols-4');
    
    // Extra large screens (desktops)
    if (cols.xl === 1) classes.push('xl:grid-cols-1');
    else if (cols.xl === 2) classes.push('xl:grid-cols-2');
    else if (cols.xl === 3) classes.push('xl:grid-cols-3');
    else if (cols.xl === 4) classes.push('xl:grid-cols-4');
    
    return classes;
  };

  const gapSize = {
    none: "gap-0",
    sm: "gap-2 md:gap-3",
    md: "gap-3 md:gap-4",
    lg: "gap-4 md:gap-6",
  };

  return (
    <div className={cn(
      "grid w-full",
      ...getGridColsClass(),
      gapSize[gap],
      className
    )}>
      {children}
    </div>
  );
}
