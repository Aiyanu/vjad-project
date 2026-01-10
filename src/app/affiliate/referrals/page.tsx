"use client";

import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useReferrals } from "@/hooks/useReferrals";
import { DataTable, Column } from "@/components/DataTable";

interface Referral {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  emailVerified?: boolean;
  referralCode?: string | null;
}

export default function AffiliateReferrals() {
  const {
    referrals,
    loading,
    pageLoading,
    pagination,
    searchQuery,
    setSearchQuery,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
  } = useReferrals();

  const columns: Column<Referral>[] = [
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
      header: "Referral Code",
      key: "referralCode",
      render: (value) =>
        value ? (
          <code className="px-2 py-1 rounded bg-(--vjad-navy)/10 text-(--vjad-navy) text-sm font-mono">
            {value}
          </code>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        ),
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
      header: "Date Joined",
      key: "createdAt",
      sortable: true,
      render: (value) => format(new Date(value), "MMM d, yyyy"),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-[hsl(var(--foreground))]">
          Referrals
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          View all users who signed up using your referral code
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
          placeholder="Search referrals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      <DataTable
        columns={columns}
        data={referrals}
        loading={loading}
        pageLoading={pageLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSort={handleSort}
        sortField="createdAt"
        emptyIcon={<Users className="h-12 w-12 mx-auto mb-3 opacity-30" />}
        emptyMessage="No referrals yet"
        emptySubMessage="Share your referral code to start earning"
        delay={0.2}
      />
    </div>
  );
}