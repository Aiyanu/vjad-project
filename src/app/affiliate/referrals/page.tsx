"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Users, Search, Loader2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Referral {
    id: string;
    email: string;
    fullName: string | null;
    referralCode: string;
    emailVerified: boolean;
    createdAt: string;
}

type SortField = "name" | "email" | "date" | "status";
type SortOrder = "asc" | "desc";

export default function AffiliateReferrals() {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const itemsPerPage = 10;

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            const res = await fetch("/api/affiliate/referrals", {
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch referrals");
            }

            const data = await res.json();
            setReferrals(data.referrals || []);
        } catch (error) {
            console.error("Error fetching referrals:", error);
            toast.error("Failed to load referrals");
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    const filteredReferrals = referrals.filter(
        (r) =>
            r.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedReferrals = [...filteredReferrals].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case "name":
                comparison = (a.fullName || "").localeCompare(b.fullName || "");
                break;
            case "email":
                comparison = a.email.localeCompare(b.email);
                break;
            case "date":
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                break;
            case "status":
                comparison = (a.emailVerified ? 1 : 0) - (b.emailVerified ? 1 : 0);
                break;
        }
        return sortOrder === "asc" ? comparison : -comparison;
    });

    const totalPages = Math.ceil(sortedReferrals.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReferrals = sortedReferrals.slice(startIndex, endIndex);

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
                ) : filteredReferrals.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-[hsl(var(--muted-foreground))]">No referrals yet</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Share your referral code to start earning
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
                                <TableHead className="font-semibold text-slate-700 w-12">S/N</TableHead>
                                <TableHead className="font-semibold text-slate-700">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-semibold hover:!bg-slate-100"
                                        onClick={() => handleSort("name")}
                                    >
                                        Name
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-semibold hover:!bg-slate-100"
                                        onClick={() => handleSort("email")}
                                    >
                                        Email
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700">Referral Code</TableHead>
                                <TableHead className="font-semibold text-slate-700">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-semibold hover:!bg-slate-100"
                                        onClick={() => handleSort("status")}
                                    >
                                        Status
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="-ml-3 h-8 font-semibold hover:!bg-slate-100"
                                        onClick={() => handleSort("date")}
                                    >
                                        Date Joined
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedReferrals.map((referral, index) => (
                                <TableRow key={referral.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-muted)]/20 transition-colors">
                                    <TableCell className="font-semibold text-slate-700 w-12">
                                        {((currentPage - 1) * itemsPerPage) + index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium text-[var(--color-foreground)]">
                                        {referral.fullName || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-[var(--color-muted-foreground)]">{referral.email}</TableCell>
                                    <TableCell>
                                        <code className="px-2 py-1 rounded bg-[var(--color-vjad-navy)]/10 text-[var(--color-vjad-navy)] text-sm font-mono">
                                            {referral.referralCode}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={referral.emailVerified ? "default" : "secondary"}>
                                            {referral.emailVerified ? "Verified" : "Unverified"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-[var(--color-muted-foreground)]">{format(new Date(referral.createdAt), "MMM d, yyyy")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                {sortedReferrals.length > itemsPerPage && (
                    <div className="flex items-center justify-between px-4 py-4 border-t border-[var(--color-border)]">
                        <div className="text-sm text-[var(--color-muted-foreground)]">
                            Showing {startIndex + 1} to {Math.min(endIndex, sortedReferrals.length)} of {sortedReferrals.length} referrals
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