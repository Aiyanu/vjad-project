"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useAppSelector } from "@/store/hooks";
import { useAffiliates } from "@/hooks/useAffiliates";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Loader2, ChevronLeft, ChevronRight, ArrowUpDown, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminAffiliates() {
  const user = useAppSelector((state) => state.auth.user);
  const {
    affiliates,
    pagination,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    sortField,
    sortOrder,
    handleSort,
    pageSize,
    setPageSize,
    updateAffiliateStatus,
    removeAffiliate,
  } = useAffiliates();

  const [disableDialog, setDisableDialog] = useState<{ id: string; isDisabled: boolean } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const handleToggleDisabled = async (affiliateId: string, isDisabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDisabled }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      updateAffiliateStatus(affiliateId, isDisabled);
      toast.success(`Affiliate ${isDisabled ? "disabled" : "enabled"} successfully`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update status");
    } finally {
      setDisableDialog(null);
    }
  };

  const handleDeleteAffiliate = async (affiliateId: string) => {
    try {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete affiliate");
      }

      removeAffiliate(affiliateId);
      toast.success("Affiliate removed successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to remove affiliate");
    } finally {
      setDeleteDialog(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-[hsl(var(--foreground))]">
              Affiliates
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Manage all registered affiliates
            </p>
          </div>
          {user?.role === "super_admin" && (
            <Button
              onClick={() => window.location.href = "/auth/admin-signup"}
              className="bg-(--color-vjad-navy) hover:bg-(--color-vjad-primary)"
            >
              Add Admin
            </Button>
          )}
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        <Input
          placeholder="Search affiliates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-elegant overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          </div>
        ) : affiliates.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-[hsl(var(--muted-foreground))]">No affiliates found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700 w-12">
                  S/N
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold hover:!bg-slate-100"
                    onClick={() => handleSort("fullName")}
                  >
                    Name {sortField === "fullName" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold hover:!bg-slate-100"
                    onClick={() => handleSort("email")}
                  >
                    Email {sortField === "email" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold hover:!bg-slate-100"
                    onClick={() => handleSort("phone")}
                  >
                    Phone {sortField === "phone" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold hover:!bg-slate-100"
                    onClick={() => handleSort("referralsCount")}
                  >
                    Referrals {sortField === "referralsCount" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold hover:!bg-slate-100"
                    onClick={() => handleSort("isDisabled")}
                  >
                    Status {sortField === "isDisabled" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-semibold hover:!bg-slate-100"
                    onClick={() => handleSort("createdAt")}
                  >
                    Joined {sortField === "createdAt" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate, idx) => (
                <TableRow key={affiliate.id} className="border-b border-(--color-border) hover:bg-muted/20 transition-colors">
                  <TableCell className="font-semibold text-slate-700 w-12">
                    {((currentPage - 1) * pageSize) + idx + 1}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {affiliate.fullName || "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{affiliate.email}</TableCell>
                  <TableCell className="text-muted-foreground">{affiliate.phone || "N/A"}</TableCell>
                  <TableCell className="font-semibold text-(--color-vjad-primary)">{affiliate.referralsCount}</TableCell>
                  <TableCell>
                    <Badge variant={affiliate.emailVerified ? "default" : "secondary"}>
                      {affiliate.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(affiliate.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">
                            <MoreVertical className="h-4 w-4 text-slate-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="border-0">
                          <DropdownMenuItem asChild className="hover:bg-gray-100 focus:bg-gray-100">
                            <a href={`/admin/affiliates/${affiliate.id}`}>View Details</a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDisableDialog({ id: affiliate.id, isDisabled: !affiliate.isDisabled })}
                            className="hover:bg-gray-100 focus:bg-gray-100"
                          >
                            {affiliate.isDisabled ? "Enable" : "Disable"} Affiliate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog(affiliate.id)}
                            className="text-destructive focus:text-destructive hover:bg-gray-100 focus:bg-gray-100"
                          >
                            Remove affiliate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {pagination.total > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-(--color-border)">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} affiliates
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Disable Confirmation Dialog */}
      <AlertDialog open={disableDialog !== null} onOpenChange={() => setDisableDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {disableDialog?.isDisabled ? "Disable" : "Enable"} Affiliate
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {disableDialog?.isDisabled ? "disable" : "enable"} this affiliate?
              {disableDialog?.isDisabled && " They will no longer be able to access their account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => disableDialog && handleToggleDisabled(disableDialog.id, disableDialog.isDisabled)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Affiliate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this affiliate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleDeleteAffiliate(deleteDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}