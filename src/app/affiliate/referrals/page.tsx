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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Referral {
    id: string;
    referred_name: string;
    referred_email: string | null;
    referred_phone: string | null;
    status: string;
    notes: string | null;
    created_at: string;
}

export default function AffiliateReferrals() {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [affiliateId, setAffiliateId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        referred_name: "",
        referred_email: "",
        referred_phone: "",
        notes: "",
    });

    useEffect(() => {
        fetchAffiliateAndReferrals();
    }, []);

    const fetchAffiliateAndReferrals = async () => {
        try {
            // SUPABASE IMPLEMENTATION (COMMENTED OUT)
            // const { data: { user } } = await supabase.auth.getUser();
            // if (!user) return;

            // // Get affiliate record
            // const { data: affiliate } = await supabase
            //     .from("affiliates")
            //     .select("id")
            //     .eq("user_id", user.id)
            //     .maybeSingle();

            // if (affiliate) {
            //     setAffiliateId(affiliate.id);

            //     // Fetch referrals
            //     const { data, error } = await supabase
            //         .from("referrals")
            //         .select("*")
            //         .eq("affiliate_id", affiliate.id)
            //         .order("created_at", { ascending: false });

            //     if (error) throw error;
            //     setReferrals(data || []);
            // }

            // MOCK DATA FOR DEVELOPMENT
            setReferrals([]);
        } catch (error) {
            console.error("Error fetching referrals:", error);
            toast.error("Failed to load referrals");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!affiliateId) return;

        setSubmitting(true);
        try {
            // SUPABASE IMPLEMENTATION (COMMENTED OUT)
            // const { error } = await supabase.from("referrals").insert({
            //     affiliate_id: affiliateId,
            //     referred_name: formData.referred_name,
            //     referred_email: formData.referred_email || null,
            //     referred_phone: formData.referred_phone || null,
            //     notes: formData.notes || null,
            // });

            // if (error) throw error;

            toast.success("Referral added successfully");

            setFormData({ referred_name: "", referred_email: "", referred_phone: "", notes: "" });
            setIsDialogOpen(false);
            fetchAffiliateAndReferrals();
        } catch (error) {
            console.error("Error adding referral:", error);
            toast.error("Failed to add referral");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredReferrals = referrals.filter(
        (r) =>
            r.referred_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.referred_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.referred_phone?.includes(searchQuery)
    );

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            pending: "secondary",
            contacted: "outline",
            converted: "default",
            lost: "destructive",
        };
        return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-display font-bold text-[hsl(var(--foreground))]">
                        Referrals
                    </h1>
                    <p className="text-[hsl(var(--muted-foreground))] mt-1">
                        Manage and track your referrals
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Referral
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Referral</DialogTitle>
                            <DialogDescription>
                                Add a potential buyer you've referred to VJAD Projects
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.referred_name}
                                    onChange={(e) => setFormData({ ...formData, referred_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.referred_email}
                                    onChange={(e) => setFormData({ ...formData, referred_email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.referred_phone}
                                    onChange={(e) => setFormData({ ...formData, referred_phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Any additional information..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Add Referral
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
                            Add your first referral to get started
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReferrals.map((referral) => (
                                <TableRow key={referral.id}>
                                    <TableCell className="font-medium">{referral.referred_name}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {referral.referred_email && <div>{referral.referred_email}</div>}
                                            {referral.referred_phone && (
                                                <div className="text-[hsl(var(--muted-foreground))]">
                                                    {referral.referred_phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(referral.status)}</TableCell>
                                    <TableCell>{format(new Date(referral.created_at), "MMM d, yyyy")}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{referral.notes || "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </motion.div>
        </div>
    );
}