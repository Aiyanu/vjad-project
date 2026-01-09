"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, Calendar, Users, CreditCard, Building, Loader2, Ban, CheckCircle, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AffiliateDetails {
  id: string;
  email: string;
  fullName: string | null;
  referralCode: string;
  emailVerified: boolean;
  isDisabled: boolean;
  createdAt: string;
  phone: string | null;
  bankName: string | null;
  accountNumber: string | null;
  referralsCount: number;
  referrals: Array<{
    id: string;
    email: string;
    fullName: string | null;
    emailVerified: boolean;
    createdAt: string;
  }>;
}

export default function AffiliateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<AffiliateDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'name' | 'email' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAffiliateDetails();
  }, [params.id]);

  const fetchAffiliateDetails = async () => {
    try {
      const res = await fetch(`/api/admin/affiliates/${params.id}/details`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch affiliate details");
      }

      const data = await res.json();
      setAffiliate(data.affiliate);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load affiliate details");
      router.push("/admin/affiliates");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisabled = async () => {
    if (!affiliate) return;

    const action = affiliate.isDisabled ? "enable" : "disable";
    if (!confirm(`Are you sure you want to ${action} this affiliate?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDisabled: !affiliate.isDisabled }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      setAffiliate({ ...affiliate, isDisabled: !affiliate.isDisabled });
      toast.success(`Affiliate ${action}d successfully`);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-vjad-navy)]" />
      </div>
    );
  }

  if (!affiliate) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/affiliates")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-[var(--color-vjad-navy)]">
            Affiliate Details
          </h1>
        </div>
        <Button
          variant={affiliate.isDisabled ? "default" : "destructive"}
          onClick={handleToggleDisabled}
          disabled={actionLoading}
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

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-md">
            <CardHeader >
              <CardTitle className="text-[var(--color-vjad-navy)]">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[var(--color-muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Email</p>
                  <p className="font-medium">{affiliate.email}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-[var(--color-muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Full Name</p>
                  <p className="font-medium">{affiliate.fullName || "N/A"}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[var(--color-muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Phone</p>
                  <p className="font-medium">{affiliate.phone || "N/A"}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-[var(--color-muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Joined</p>
                  <p className="font-medium">
                    {format(new Date(affiliate.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-0 shadow-md">
            <CardHeader >
              <CardTitle className="text-[var(--color-vjad-navy)]">
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-[var(--color-muted-foreground)] mb-2">
                  Email Status
                </p>
                <Badge variant={affiliate.emailVerified ? "default" : "secondary"}>
                  {affiliate.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-[var(--color-muted-foreground)] mb-2">
                  Account Status
                </p>
                <Badge variant={affiliate.isDisabled ? "destructive" : "default"}>
                  {affiliate.isDisabled ? "Disabled" : "Active"}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-[var(--color-muted-foreground)] mb-2">
                  Referral Code
                </p>
                <Badge variant="outline" className="font-mono">
                  {affiliate.referralCode}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-[var(--color-muted-foreground)] mb-2">
                  Total Referrals
                </p>
                <p className="text-2xl font-bold text-[var(--color-vjad-primary)]">
                  {affiliate.referralsCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card className="border-0 shadow-md">
            <CardHeader >
              <CardTitle className="text-[var(--color-vjad-navy)]">
                Banking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-[var(--color-muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Bank Name</p>
                  <p className="font-medium">{affiliate.bankName || "Not provided"}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-[var(--color-muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    Account Number
                  </p>
                  <p className="font-medium">{affiliate.accountNumber || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="md:col-span-2"
        >
          <Card className="border-0 shadow-md">
            <CardHeader >
              <CardTitle className="text-[var(--color-vjad-navy)]">
                Referrals ({affiliate.referralsCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {affiliate.referrals.length === 0 ? (
                <p className="text-center text-[var(--color-muted-foreground)] py-8">
                  No referrals yet
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-semibold text-slate-700 w-12">S/N</TableHead>
                        <TableHead className="font-semibold text-slate-700">
                          <button
                            onClick={() => {
                              if (sortField === 'name') {
                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSortField('name');
                                setSortOrder('asc');
                              }
                            }}
                            className="flex items-center gap-2 hover:text-slate-900"
                          >
                            Name
                            <ArrowUpDown className="h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">
                          <button
                            onClick={() => {
                              if (sortField === 'email') {
                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSortField('email');
                                setSortOrder('asc');
                              }
                            }}
                            className="flex items-center gap-2 hover:text-slate-900"
                          >
                            Email
                            <ArrowUpDown className="h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700">
                          <button
                            onClick={() => {
                              if (sortField === 'date') {
                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSortField('date');
                                setSortOrder('desc');
                              }
                            }}
                            className="flex items-center gap-2 hover:text-slate-900"
                          >
                            Date Joined
                            <ArrowUpDown className="h-4 w-4" />
                          </button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const sorted = [...affiliate.referrals].sort((a, b) => {
                          if (sortField === 'name') {
                            const nameA = (a.fullName || '').toLowerCase();
                            const nameB = (b.fullName || '').toLowerCase();
                            return sortOrder === 'asc'
                              ? nameA.localeCompare(nameB)
                              : nameB.localeCompare(nameA);
                          } else if (sortField === 'email') {
                            return sortOrder === 'asc'
                              ? a.email.localeCompare(b.email)
                              : b.email.localeCompare(a.email);
                          } else {
                            return sortOrder === 'asc'
                              ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                              : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                          }
                        });

                        const startIdx = (currentPage - 1) * itemsPerPage;
                        const endIdx = startIdx + itemsPerPage;
                        const paginated = sorted.slice(startIdx, endIdx);

                        return paginated.map((referral, idx) => (
                          <TableRow key={referral.id} className="hover:bg-slate-50">
                            <TableCell className="font-semibold text-slate-700 w-12">
                              {((currentPage - 1) * itemsPerPage) + idx + 1}
                            </TableCell>
                            <TableCell>{referral.fullName || "N/A"}</TableCell>
                            <TableCell>{referral.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={referral.emailVerified ? "default" : "secondary"}
                              >
                                {referral.emailVerified ? "Verified" : "Unverified"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(referral.createdAt), "MMM d, yyyy")}
                            </TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {affiliate.referrals.length > itemsPerPage && (
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, affiliate.referrals.length)} of{" "}
                        {affiliate.referrals.length} results
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <div className="text-sm font-medium">
                          Page {currentPage} of {Math.ceil(affiliate.referrals.length / itemsPerPage)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage >= Math.ceil(affiliate.referrals.length / itemsPerPage)}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
