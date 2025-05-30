import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn(
      "w-full max-w-[1400px] mx-auto",
      className
    )}>
      {children}
    </div>
  );
}
