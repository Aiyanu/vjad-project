"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Users,
  CreditCard,
  Building,
  Loader2,
  Ban,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

import { useAffiliateDetails } from "@/hooks/useAffiliateDetails";
import { DataTable, Column } from "@/components/DataTable";

interface Referral {
  id: string;
  fullName: string | null;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function AffiliateDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { affiliate, loading, updateAffiliateStatus } =
    useAffiliateDetails(params.id as string);

  const [actionLoading, setActionLoading] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const referralColumns: Column<Referral>[] = useMemo(
    () => [
      {
        header: "S/N",
        key: "id",
        width: "w-12",
        render: (_, __, index) => (
          <span className="font-semibold text-slate-700">{index}</span>
        ),
      },
      {
        header: "Name",
        key: "fullName",
        sortable: true,
        render: (value) => (
          <span className="font-medium">{value || "N/A"}</span>
        ),
      },
      {
        header: "Email",
        key: "email",
        sortable: true,
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
        render: (value) =>
          value ? format(new Date(value), "MMM d, yyyy") : "N/A",
      },
    ],
    []
  );

  const referralsPagination = useMemo(() => {
    const referrals = affiliate?.referrals || [];
    return {
      page: 1,
      limit: 10,
      total: referrals.length,
      totalPages: Math.ceil(referrals.length / 10),
    };
  }, [affiliate?.referrals]);

  const handleToggleDisabled = async () => {
    if (!affiliate) return;

    setActionLoading(true);
    try {
      await updateAffiliateStatus(!affiliate.isDisabled);
    } finally {
      setActionLoading(false);
      setStatusDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-vijad-navy)]" />
      </div>
    );
  }

  if (!affiliate) return null;

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="space-y-6 p-4 md:p-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/affiliates")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-vijad-navy)]">
              Affiliate Details
            </h1>
          </div>

          <Button
            variant={affiliate.isDisabled ? "default" : "destructive"}
            onClick={() => setStatusDialogOpen(true)}
            disabled={actionLoading}
            className="w-full sm:w-auto"
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : affiliate.isDisabled ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Ban className="h-4 w-4 mr-2" />
            )}
            {affiliate.isDisabled ? "Enable Affiliate" : "Disable Affiliate"}
          </Button>
        </div>

        {/* Status Dialog */}
        <AlertDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {affiliate.isDisabled
                  ? "Enable Affiliate"
                  : "Disable Affiliate"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {affiliate.isDisabled
                  ? "This will restore the affiliate's access."
                  : "This will prevent the affiliate from accessing their account until re-enabled."}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleToggleDisabled}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Grid */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 w-full">
          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-[var(--color-vijad-navy)]">
                  Personal Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={affiliate.email}
                />
                <Separator />
                <InfoRow
                  icon={Users}
                  label="Full Name"
                  value={affiliate.fullName || "N/A"}
                />
                <Separator />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={affiliate.phone || "N/A"}
                />
                <Separator />
                <InfoRow
                  icon={Calendar}
                  label="Joined"
                  value={
                    affiliate.createdAt
                      ? format(
                        new Date(affiliate.createdAt),
                        "MMMM d, yyyy"
                      )
                      : "N/A"
                  }
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-0 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-[var(--color-vijad-navy)]">
                  Account Status
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <StatusBadge
                  label="Email Status"
                  value={affiliate.emailVerified ? "Verified" : "Unverified"}
                  variant={
                    affiliate.emailVerified ? "default" : "secondary"
                  }
                />

                <Separator />

                <StatusBadge
                  label="Account Status"
                  value={affiliate.isDisabled ? "Disabled" : "Active"}
                  variant={
                    affiliate.isDisabled ? "destructive" : "default"
                  }
                />

                <Separator />

                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)] mb-2">
                    Referral Code
                  </p>
                  <Badge variant="outline" className="font-mono">
                    {affiliate.referralCode || "N/A"}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)] mb-2">
                    Total Referrals
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-vijad-primary)]">
                    {affiliate.referralsCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Banking Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="border-0 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-[var(--color-vijad-navy)]">
                  Banking Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <InfoRow
                  icon={Building}
                  label="Bank Name"
                  value={affiliate.bankName || "Not provided"}
                />
                <Separator />
                <InfoRow
                  icon={CreditCard}
                  label="Account Number"
                  value={affiliate.accountNumber || "Not provided"}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Referrals Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="md:col-span-2"
          >
            <Card className="border-0 shadow-md h-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-[var(--color-vijad-navy)]">
                  Referrals ({affiliate.referralsCount})
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
                <DataTable
                  columns={referralColumns}
                  data={affiliate.referrals || []}
                  loading={false}
                  pageLoading={false}
                  pagination={referralsPagination}
                  onPageChange={() => { }}
                  onPageSizeChange={() => { }}
                  onSort={() => { }}
                  sortField="createdAt"
                  emptyIcon={
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  }
                  emptyMessage="No referrals yet"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-[var(--color-muted-foreground)] mt-0.5" />
      <div>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {label}
        </p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: "default" | "secondary" | "destructive";
}) {
  return (
    <div>
      <p className="text-sm text-[var(--color-muted-foreground)] mb-2">
        {label}
      </p>
      <Badge variant={variant}>{value}</Badge>
    </div>
  );
}
