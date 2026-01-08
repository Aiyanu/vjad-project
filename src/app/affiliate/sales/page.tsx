"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
// import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, DollarSign, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
    referrals?: { referred_name: string } | null;
}

interface Project {
    id: string;
    name: string;
}

interface Referral {
    id: string;
    referred_name: string;
}

export default function AffiliateSales() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [affiliateId, setAffiliateId] = useState<string | null>(null);
    const [commissionRate, setCommissionRate] = useState(3);

    const [formData, setFormData] = useState({
        buyer_name: "",
        buyer_email: "",
        buyer_phone: "",
        sale_amount: "",
        project_id: "",
        referral_id: "",
        notes: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // SUPABASE IMPLEMENTATION (COMMENTED OUT)
            // const { data: { user } } = await supabase.auth.getUser();
            // if (!user) return;

            // // Get affiliate record
            // const { data: affiliate } = await supabase
            //     .from("affiliates")
            //     .select("id, commission_rate")
            //     .eq("user_id", user.id)
            //     .maybeSingle();

            // if (affiliate) {
            //     setAffiliateId(affiliate.id);
            //     setCommissionRate(Number(affiliate.commission_rate));

            //     // Fetch sales
            //     const { data: salesData } = await supabase
            //         .from("sales")
            //         .select("*, projects(name), referrals(referred_name)")
            //         .eq("affiliate_id", affiliate.id)
            //         .order("created_at", { ascending: false });

            //     setSales(salesData || []);

            //     // Fetch referrals
            //     const { data: referralsData } = await supabase
            //         .from("referrals")
            //         .select("id, referred_name")
            //         .eq("affiliate_id", affiliate.id);

            //     setReferrals(referralsData || []);
            // }

            // // Fetch projects
            // const { data: projectsData } = await supabase
            //     .from("projects")
            //     .select("id, name")
            //     .eq("is_active", true);

            // setProjects(projectsData || []);

            // MOCK DATA FOR DEVELOPMENT
            setSales([]);
            setProjects([]);
            setReferrals([]);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load sales data");
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
            // const saleAmount = parseFloat(formData.sale_amount);
            // const commissionAmount = saleAmount * (commissionRate / 100);

            // const { error } = await supabase.from("sales").insert({
            //     affiliate_id: affiliateId,
            //     buyer_name: formData.buyer_name,
            //     buyer_email: formData.buyer_email || null,
            //     buyer_phone: formData.buyer_phone || null,
            //     sale_amount: saleAmount,
            //     commission_amount: commissionAmount,
            //     project_id: formData.project_id || null,
            //     referral_id: formData.referral_id || null,
            //     notes: formData.notes || null,
            // });

            // if (error) throw error;

            toast.success("Sale reported successfully. Pending verification.");

            setFormData({
                buyer_name: "",
                buyer_email: "",
                buyer_phone: "",
                sale_amount: "",
                project_id: "",
                referral_id: "",
                notes: "",
            });
            setIsDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Error reporting sale:", error);
            toast.error("Failed to report sale");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSales = sales.filter(
        (s) =>
            s.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.buyer_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const calculatedCommission = formData.sale_amount
        ? parseFloat(formData.sale_amount) * (commissionRate / 100)
        : 0;

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-display font-bold text-[hsl(var(--foreground))]">
                        Sales
                    </h1>
                    <p className="text-[hsl(var(--muted-foreground))] mt-1">
                        Report and track your sales
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Report Sale
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Report a Sale</DialogTitle>
                            <DialogDescription>
                                Submit a new sale for verification. Commission: {commissionRate}%
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="buyer_name">Buyer Name *</Label>
                                    <Input
                                        id="buyer_name"
                                        value={formData.buyer_name}
                                        onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sale_amount">Sale Amount (₦) *</Label>
                                    <Input
                                        id="sale_amount"
                                        type="number"
                                        value={formData.sale_amount}
                                        onChange={(e) => setFormData({ ...formData, sale_amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {formData.sale_amount && (
                                <div className="p-3 rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                                    <span className="text-sm font-medium">
                                        Estimated Commission: {formatCurrency(calculatedCommission)}
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="buyer_email">Buyer Email</Label>
                                    <Input
                                        id="buyer_email"
                                        type="email"
                                        value={formData.buyer_email}
                                        onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="buyer_phone">Buyer Phone</Label>
                                    <Input
                                        id="buyer_phone"
                                        value={formData.buyer_phone}
                                        onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Project</Label>
                                    <Select
                                        value={formData.project_id}
                                        onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.map((project) => (
                                                <SelectItem key={project.id} value={project.id}>
                                                    {project.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Linked Referral</Label>
                                    <Select
                                        value={formData.referral_id}
                                        onValueChange={(value) => setFormData({ ...formData, referral_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select referral" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {referrals.map((referral) => (
                                                <SelectItem key={referral.id} value={referral.id}>
                                                    {referral.referred_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Any additional details about the sale..."
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Report Sale
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
                    placeholder="Search sales..."
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
                ) : filteredSales.length === 0 ? (
                    <div className="text-center py-12">
                        <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-[hsl(var(--muted-foreground))]">No sales reported yet</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Report your first sale to start earning commissions
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Buyer</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Sale Amount</TableHead>
                                <TableHead>Commission</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{sale.buyer_name}</div>
                                            {sale.buyer_email && (
                                                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    {sale.buyer_email}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{sale.projects?.name || "-"}</TableCell>
                                    <TableCell className="font-medium">{formatCurrency(sale.sale_amount)}</TableCell>
                                    <TableCell className="text-[hsl(var(--primary))]">
                                        {formatCurrency(sale.commission_amount)}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                                    <TableCell>{format(new Date(sale.created_at), "MMM d, yyyy")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </motion.div>
        </div>
    );
}