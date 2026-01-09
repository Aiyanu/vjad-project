"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
// import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCog, Plus, Search, Loader2, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

interface AffiliateUser {
  id: string;
  user_id: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const itemsPerPage = 10;
  // const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // SUPABASE IMPLEMENTATION (COMMENTED OUT)
      // // Fetch admins and superadmins
      // const { data: adminRoles, error: adminError } = await supabase
      //   .from("user_roles")
      //   .select("id, user_id, role, created_at")
      //   .in("role", ["ADMIN", "SUPERADMIN"])
      //   .order("created_at", { ascending: false });

      // if (adminError) throw adminError;

      // // Fetch profiles for admin users
      // const adminUserIds = (adminRoles || []).map(a => a.user_id);
      // const { data: profilesData } = await supabase
      //   .from("profiles")
      //   .select("id, full_name, email")
      //   .in("id", adminUserIds);

      // const adminsWithProfiles = (adminRoles || []).map(role => ({
      //   ...role,
      //   profiles: profilesData?.find(p => p.id === role.user_id) || null,
      // }));
      // setAdmins(adminsWithProfiles);

      // // Fetch affiliates who are not admins
      // const { data: affiliatesData } = await supabase
      //   .from("affiliates")
      //   .select("id, user_id");

      // const nonAdminAffiliates = (affiliatesData || []).filter(
      //   a => !adminUserIds.includes(a.user_id)
      // );

      // // Get profiles for non-admin affiliates
      // const nonAdminUserIds = nonAdminAffiliates.map(a => a.user_id);
      // const { data: affProfilesData } = await supabase
      //   .from("profiles")
      //   .select("id, full_name, email")
      //   .in("id", nonAdminUserIds);

      // const affiliatesWithProfiles = nonAdminAffiliates.map(aff => ({
      //   ...aff,
      //   profiles: affProfilesData?.find(p => p.id === aff.user_id) || null,
      // }));
      // setAffiliates(affiliatesWithProfiles);

      // MOCK DATA FOR DEVELOPMENT
      setAdmins([]);
      setAffiliates([]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setSubmitting(true);
    try {
      // SUPABASE IMPLEMENTATION (COMMENTED OUT)
      // const { error } = await supabase.from("user_roles").insert({
      //   user_id: selectedUserId,
      //   role: "ADMIN",
      // });

      // if (error) throw error;

      // toast({
      //   title: "Success",
      //   description: "Admin added successfully",
      // });

      setSelectedUserId("");
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error adding admin:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to add admin. User may already be an admin.",
      //   variant: "destructive",
      // });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-[hsl(var(--foreground))]">
            Admins
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Manage admin users (Superadmin only)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Promote an affiliate to admin role
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an affiliate" />
                  </SelectTrigger>
                  <SelectContent>
                    {affiliates.map((affiliate) => (
                      <SelectItem key={affiliate.user_id} value={affiliate.user_id}>
                        {affiliate.profiles?.full_name || affiliate.profiles?.email || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {affiliates.length === 0 && (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    No eligible affiliates to promote
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !selectedUserId}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Admin
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
        ) : filteredAdmins.length === 0 ? (
          <div className="text-center py-12">
            <UserCog className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-[hsl(var(--muted-foreground))]">No admins found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700 w-12">S/N</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAdmins.map((admin, idx) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-semibold text-slate-700 w-12">
                    {((currentPage - 1) * itemsPerPage) + idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {admin.role === "SUPERADMIN" && (
                        <Shield className="h-4 w-4 text-[hsl(var(--vjad-gold))]" />
                      )}
                      {admin.profiles?.full_name || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>{admin.profiles?.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={admin.role === "SUPERADMIN" ? "destructive" : "default"}>
                      {admin.role === "SUPERADMIN" ? "Super Admin" : "Admin"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(admin.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {filteredAdmins.length > itemsPerPage && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-muted-foreground)]">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAdmins.length)} of {filteredAdmins.length} admins
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
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}