"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TableLoaderOverlay, TableRowSkeleton } from "@/components/SkeletonLoaders";

export interface Column<T> {
  header: string;
  key: keyof T;
  sortable?: boolean;
  render?: (value: any, item: T, index: number) => ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  pageLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSort?: (field: keyof T) => void;
  sortField?: keyof T;
  onRowClick?: (item: T) => void;
  emptyIcon: ReactNode;
  emptyMessage: string;
  emptySubMessage?: string;
  delay?: number;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  pageLoading,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortField,
  onRowClick,
  emptyIcon,
  emptyMessage,
  emptySubMessage,
  delay = 0.2,
}: DataTableProps<T>) {
  const rowCount = columns.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card-elegant overflow-hidden w-full max-w-full"
    >
      {loading ? (
        <TableRowSkeleton count={10} columns={rowCount} />
      ) : data.length === 0 ? (
        <div className="text-center py-12">
          {emptyIcon}
          <p className="text-[hsl(var(--muted-foreground))]">{emptyMessage}</p>
          {emptySubMessage && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {emptySubMessage}
            </p>
          )}
        </div>
      ) : (
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={`font-semibold text-slate-700 ${column.width || ""}`}
                  >
                    {column.sortable && onSort ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 font-semibold"
                        onClick={() => onSort(column.key)}
                      >
                        {column.header}
                      </Button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, idx) => (
                <TableRow
                  key={item.id}
                  onClick={(event) => {
                    if (!onRowClick) return;
                    const target = event.target as HTMLElement;
                    if (
                      target.closest(
                        "button, a, input, select, textarea, [role='menuitem'], [role='checkbox'], [data-row-click-ignore]"
                      )
                    ) {
                      return;
                    }
                    onRowClick(item);
                  }}
                  className={`h-16 ${onRowClick ? "cursor-pointer hover:bg-slate-100" : "hover:bg-slate-50"}`}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className="py-4">
                      {column.render
                        ? column.render(item[column.key], item, ((pagination.page - 1) * pagination.limit) + idx + 1)
                        : item[column.key] != null
                        ? String(item[column.key])
                        : "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TableLoaderOverlay show={pageLoading} />
        </div>
      )}

      {!loading && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-4 border-t border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="text-sm text-[var(--color-muted-foreground)]">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} items
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-muted-foreground)] whitespace-nowrap">Rows per page:</span>
              <Select
                value={String(pagination.limit)}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Button>
            <div className="text-sm font-medium whitespace-nowrap">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
