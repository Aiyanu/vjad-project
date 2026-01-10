"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useAppSelector } from "@/store/hooks";
import { useAdmins } from "@/hooks/useAdmins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserCog, Search, Shield, Plus, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { DataTable, Column } from "@/components/DataTable";

interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: string;
}

export default function AdminAdmins() {
  const currentUser = useAppSelector((state) => state.user.user);
  const {
    admins,
    loading,
    pageLoading,
    pagination,
    searchQuery,
    setSearchQuery,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    addAdmin,
    deleteAdmin,
    updateAdminRole,
  } = useAdmins();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [roleDialog, setRoleDialog] = useState<{
    id: string;
    currentRole: "admin" | "super_admin";
  } | null>(null);
  const [roleUpdating, setRoleUpdating] = useState(false);
  const isSuperAdmin = currentUser?.role === "super_admin";

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;
    setSubmitting(true);
    try {
      await addAdmin({ fullName, email, role });
      setFullName("");
      setEmail("");
      setRole("admin");
      setIsDialogOpen(false);
    } catch {
      // errors are toasted in hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!roleDialog) return;
    setRoleUpdating(true);
    try {
      await updateAdminRole(roleDialog.id, roleDialog.currentRole);
      setRoleDialog(null);
    } catch {
      // errors handled in hook
    } finally {
      setRoleUpdating(false);
    }
  };

  const columns = useMemo<Column<AdminUser>[]>(() => {
    const baseColumns: Column<AdminUser>[] = [
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
        render: (value, admin) => (
          <div className="flex items-center gap-2 font-medium">
            {admin.role === "super_admin" && (
              <Shield className="h-4 w-4 text-[hsl(var(--vjad-gold))]" />
            )}
            {value || "N/A"}
          </div>
        ),
      },
      {
        header: "Email",
        key: "email",
        sortable: true,
      },
      {
        header: "Role",
        key: "role",
        sortable: true,
        render: (_, admin) => (
          <Badge variant={admin.role === "super_admin" ? "default" : "secondary"}>
            {admin.role === "super_admin" ? "Super Admin" : "Admin"}
          </Badge>
        ),
      },
      {
        header: "Added",
        key: "createdAt",
        sortable: true,
        render: (value) => format(new Date(value), "MMM d, yyyy"),
      },
    ];

    if (isSuperAdmin) {
      baseColumns.push({
        header: "Actions",
        key: "id",
        render: (_, admin) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-row-click-ignore
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-0">
              <DropdownMenuItem
                disabled={admin.role === "super_admin"}
                onClick={(e) => {
                  e.stopPropagation();
                  if (admin.role !== "super_admin") setDeleteDialog(admin.id);
                }}
              >
                Remove admin
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setRoleDialog({ id: admin.id, currentRole: admin.role as "admin" | "super_admin" });
                }}
              >
                Change role
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      });
    }

    return baseColumns;
  }, [isSuperAdmin]);

  return (
    <div className="space-y-6">
      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        {isSuperAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>
                  Create an admin account. Credentials will be emailed.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as "admin" | "super_admin") }>
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Admin"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
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
          placeholder="Search admins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      <DataTable
        columns={columns}
        data={admins}
        loading={loading}
        pageLoading={pageLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSort={(field: string) => {
          if (["fullName", "email", "role", "createdAt"].includes(field)) {
            handleSort(field as "fullName" | "email" | "role" | "createdAt");
          }
        }}
        sortField="createdAt"
        emptyIcon={<UserCog className="h-12 w-12 mx-auto mb-3 opacity-30" />}
        emptyMessage="No admins found"
      />

      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the admin's access immediately. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteDialog && deleteAdmin(deleteDialog)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!roleDialog} onOpenChange={(open) => !open && setRoleDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Admin Role</AlertDialogTitle>
            <AlertDialogDescription>
              Select a new role for this admin. Changes apply immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <Label htmlFor="updateRole">Role</Label>
            <Select
              value={roleDialog?.currentRole}
              onValueChange={(value) =>
                setRoleDialog((prev) =>
                  prev ? { ...prev, currentRole: value as "admin" | "super_admin" } : prev
                )
              }
            >
              <SelectTrigger id="updateRole" className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={roleUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateRole} disabled={roleUpdating}>
              {roleUpdating ? "Updating..." : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}