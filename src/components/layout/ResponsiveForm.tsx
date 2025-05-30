import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveFormProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2;
}

export function ResponsiveForm({ 
  children, 
  className,
  columns = 1 
}: ResponsiveFormProps) {
  return (
    <div className={cn(
      "w-full",
      columns === 2 && "md:grid md:grid-cols-2 md:gap-6",
      className
    )}>
      {children}
    </div>
  );
}

interface FormSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  fullWidth?: boolean;
}

export function FormSection({ 
  children, 
  title, 
  description,
  className,
  fullWidth = false
}: FormSectionProps) {
  return (
    <div className={cn(
      "mb-6",
      fullWidth && "md:col-span-2",
      className
    )}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
