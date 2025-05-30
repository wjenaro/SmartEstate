import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TableColumn<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  mobileLabel?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  className?: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  className,
  onRowClick,
  emptyMessage = "No data available"
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (!data.length) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={cn("space-y-4", className)}>
        {data.map((item, index) => (
          <div
            key={index}
            className={cn(
              "border rounded-lg overflow-hidden bg-card shadow-sm",
              onRowClick && "cursor-pointer hover:bg-muted/50 active:bg-muted/70 transition-colors"
            )}
            onClick={() => onRowClick && onRowClick(item)}
            style={{ touchAction: 'manipulation' }}
          >
            <div className="divide-y">
              {columns.map((column) => (
                <div key={String(column.accessorKey)} className="flex px-4 py-3">
                  <div className="w-2/5 font-medium text-sm text-muted-foreground">
                    {column.mobileLabel || column.header}
                  </div>
                  <div className="w-3/5 text-right">
                    {column.cell 
                      ? column.cell(item) 
                      : item[column.accessorKey] as React.ReactNode}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th
                key={String(column.accessorKey)}
                className={cn(
                  "text-left px-4 py-3 text-sm font-medium text-muted-foreground",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={cn(
                "border-b hover:bg-muted/50 transition-colors",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((column) => (
                <td
                  key={String(column.accessorKey)}
                  className={cn("px-4 py-3", column.className)}
                >
                  {column.cell
                    ? column.cell(item)
                    : item[column.accessorKey] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
