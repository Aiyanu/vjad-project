"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
// import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DollarSign, Search, Loader2, CheckCircle, XCircle } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Sale {
  id: string;
  buyer_name: string;
  buyer_email: string | null;
  buyer_phone: string | null;
  sale_amount: number;
  commission_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  projects?: { name: string } | null;
  affiliates?: {
    referral_code: string;
    profiles?: { full_name: string | null } | null;
  } | null;
}

export default function AdminSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  // const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      // SUPABASE IMPLEMENTATION (COMMENTED OUT)
      // const { data, error } = await supabase
      //   .from("sales")
      //   .select("*, projects(name), affiliates(referral_code, user_id)")
      //   .order("created_at", { ascending: false });

      // if (error) throw error;

      // // Get profiles for affiliates
      // const userIds = (data || []).map(s => s.affiliates?.user_id).filter(Boolean);
      // const { data: profilesData } = await supabase
      //   .from("profiles")
      //   .select("id, full_name")
      //   .in("id", userIds);

      // const salesWithProfiles = (data || []).map(sale => ({
      //   ...sale,
      //   affiliates: sale.affiliates ? {
      //     ...sale.affiliates,
      //     profiles: profilesData?.find(p => p.id === sale.affiliates?.user_id) || null,
      //   } : null,
      // }));
      // setSales(salesWithProfiles);

      // MOCK DATA FOR DEVELOPMENT
      setSales([]);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSaleStatus = async (saleId: string, newStatus: string) => {
    setUpdatingId(saleId);
    try {
      // SUPABASE IMPLEMENTATION (COMMENTED OUT)
      // const { data: { user } } = await supabase.auth.getUser();

      // const updateData: Record<string, unknown> = { status: newStatus };

      // if (newStatus === "APPROVED" || newStatus === "REJECTED") {
      //   updateData.verified_by = user?.id;
      //   updateData.verified_at = new Date().toISOString();
      // }

      // const { error } = await supabase
      //   .from("sales")
      //   .update(updateData)
      //   .eq("id", saleId);

      // if (error) throw error;

      // toast({
      //   title: "Success",
      //   description: `Sale ${newStatus.toLowerCase()}`,
      // });

      fetchSales();
    } catch (error) {
      console.error("Error updating sale:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to update sale status",
      //   variant: "destructive",
      // });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.buyer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.affiliates?.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      REPORTED: "secondary",
      PENDING_VERIFICATION: "outline",
      APPROVED: "default",
      PAID: "default",
      REJECTED: "destructive",
    };
    const labels: Record<string, string> = {
      REPORTED: "Reported",
      PENDING_VERIFICATION: "Pending",
      APPROVED: "Approved",
      PAID: "Paid",
      REJECTED: "Rejected",
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-[hsl(var(--foreground))]">
          Sales
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Review and manage all affiliate sales
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Search sales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="REPORTED">Reported</SelectItem>
            <SelectItem value="PENDING_VERIFICATION">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
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
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-[hsl(var(--muted-foreground))]">No sales found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {sale.affiliates?.profiles?.full_name || "N/A"}
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {sale.affiliates?.referral_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sale.buyer_name}</div>
                      {sale.buyer_email && (
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {sale.buyer_email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{sale.projects?.name || "-"}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(sale.sale_amount)}
                  </TableCell>
                  <TableCell className="text-[hsl(var(--primary))]">
                    {formatCurrency(sale.commission_amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell>{format(new Date(sale.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    {(sale.status === "REPORTED" || sale.status === "PENDING_VERIFICATION") && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSaleStatus(sale.id, "APPROVED")}
                          disabled={updatingId === sale.id}
                        >
                          {updatingId === sale.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSaleStatus(sale.id, "REJECTED")}
                          disabled={updatingId === sale.id}
                        >
                          {updatingId === sale.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}