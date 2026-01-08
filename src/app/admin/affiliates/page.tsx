"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
// import { supabase } from "@/lib/supabase/client";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  total_earnings: number;
  pending_payout: number;
  is_active: boolean;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
  referrals_count?: number;
  sales_count?: number;
}

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      // SUPABASE IMPLEMENTATION (COMMENTED OUT)
      // const { data, error } = await supabase
      //   .from("affiliates")
      //   .select("*")
      //   .order("created_at", { ascending: false });

      // if (error) throw error;

      // // Fetch profiles for all affiliates
      // const userIds = (data || []).map(a => a.user_id);
      // const { data: profilesData } = await supabase
      //   .from("profiles")
      //   .select("id, full_name, email")
      //   .in("id", userIds);

      // // Get referral and sales counts for each affiliate
      // const affiliatesWithCounts = await Promise.all(
      //   (data || []).map(async (affiliate) => {
      //     const [{ count: referralsCount }, { count: salesCount }] = await Promise.all([
      //       supabase.from("referrals").select("*", { count: "exact", head: true }).eq("affiliate_id", affiliate.id),
      //       supabase.from("sales").select("*", { count: "exact", head: true }).eq("affiliate_id", affiliate.id),
      //     ]);

      //     return {
      //       ...affiliate,
      //       profiles: profilesData?.find(p => p.id === affiliate.user_id) || null,
      //       referrals_count: referralsCount || 0,
      //       sales_count: salesCount || 0,
      //     };
      //   })
      // );

      // setAffiliates(affiliatesWithCounts);

      // MOCK DATA FOR DEVELOPMENT
      setAffiliates([]);
    } catch (error) {
      console.error("Error fetching affiliates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAffiliates = affiliates.filter(
    (a) =>
      a.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.referral_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          Affiliates
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Manage all registered affiliates
        </p>
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
        ) : filteredAffiliates.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-[hsl(var(--muted-foreground))]">No affiliates found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAffiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell className="font-medium">
                    {affiliate.profiles?.full_name || "N/A"}
                  </TableCell>
                  <TableCell>{affiliate.profiles?.email || "N/A"}</TableCell>
                  <TableCell>
                    <code className="px-2 py-1 rounded bg-[hsl(var(--muted))] text-sm">
                      {affiliate.referral_code}
                    </code>
                  </TableCell>
                  <TableCell>{affiliate.referrals_count}</TableCell>
                  <TableCell>{affiliate.sales_count}</TableCell>
                  <TableCell className="font-medium text-[hsl(var(--primary))]">
                    {formatCurrency(Number(affiliate.total_earnings))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={affiliate.is_active ? "default" : "secondary"}>
                      {affiliate.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(affiliate.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}