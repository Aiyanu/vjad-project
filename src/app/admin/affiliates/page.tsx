"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAppSelector } from "@/store/hooks";
import { useAffiliates, Affiliate } from "@/hooks/useAffiliates";

import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { Users, Search, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { DataTable, Column } from "@/components/DataTable";

export default function AdminAffiliates() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);
  const {
    affiliates,
    pagination,
    loading,
    pageLoading,
    searchQuery,
    setSearchQuery,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    deleteAffiliate,
    toggleAffiliateStatus,
  } = useAffiliates();

  const [disableDialog, setDisableDialog] = useState<{ id: string; isDisabled: boolean } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const columns: Column<Affiliate>[] = [
    {
      header: "S/N",
      key: "id",
      width: "w-12",
      render: (_, __, index) => <span className="font-semibold text-slate-700">{index}</span>,
    },
    {
      header: "Name",
      key: "fullName",
      sortable: true,
      render: (value) => <span className="font-medium">{value || "N/A"}</span>,
    },
    {
      header: "Email",
      key: "email",
      sortable: true,
    },
    {
      header: "Phone",
      key: "phone",
      sortable: true,
      render: (value) => value || "N/A",
    },
    {
      header: "Referrals",
      key: "referralsCount",
      sortable: true,
      render: (value) => <span className="font-semibold text-(--vjad-primary)">{value}</span>,
    },
    {
      header: "Status",
      key: "emailVerified",
      sortable: true,
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Verified" : "Unverified"}
        </Badge>
      ),
    },
    {
      header: "Joined",
      key: "createdAt",
      sortable: true,
      render: (value) => format(new Date(value), "MMM d, yyyy"),
    },
    {
      header: "Actions",
      key: "id",
      render: (_, affiliate) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              data-row-click-ignore
              onClick={(e) => e.stopPropagation()}
            >
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
      ),
    },
  ];

  const handleToggleDisabled = async (affiliateId: string, isDisabled: boolean) => {
    try {
      await toggleAffiliateStatus(affiliateId, isDisabled);
    } catch (error) {
      // Error is already handled by the hook
    } finally {
      setDisableDialog(null);
    }
  };

  const handleDeleteAffiliate = async (affiliateId: string) => {
    try {
      await deleteAffiliate(affiliateId);
    } catch (error) {
      // Error is already handled by the hook
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

      <DataTable
        columns={columns}
        data={affiliates}
        loading={loading}
        pageLoading={pageLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSort={handleSort}
        sortField="createdAt"
        onRowClick={(affiliate) => router.push(`/admin/affiliates/${affiliate.id}`)}
        emptyIcon={<Users className="h-12 w-12 mx-auto mb-3 opacity-30" />}
        emptyMessage="No affiliates registered yet"
        delay={0.2}
      />

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