"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useAffiliateSettings } from "@/hooks/useAffiliateSettings";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Mail, Phone, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

export default function AffiliateSettings() {
    const {
        user,
        loading,
        profile,
        updateProfileField,
        bankState,
        updateBankField,
        banks,
        saving,
        changingPassword,
        passwordData,
        setPasswordData,
        handleProfileUpdate,
        handlePasswordChange,
    } = useAffiliateSettings();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-display font-bold text-[hsl(var(--foreground))]">
                    Settings
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    Manage your account settings
                </p>
            </motion.div>

            {/* Profile Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-elegant"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-[hsl(var(--primary))]/10">
                        <UserIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-lg text-[hsl(var(--foreground))]">
                            Profile Information
                        </h2>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Update your personal details
                        </p>
                    </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            value={profile.fullName || ""}
                            onChange={(e) => updateProfileField("fullName", e.target.value)}
                            placeholder="Your full name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                            <Input
                                id="email"
                                value={user?.email || ""}
                                disabled
                                className="pl-10 bg-[hsl(var(--muted))]"
                            />
                        </div>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            Email cannot be changed
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div>
                            {/* Phone input uses react-phone-input-2 (dynamic import). Install via: npm i react-phone-input-2 */}
                            {/* If the package isn't available, we fall back to a normal Input */}
                            {typeof window !== "undefined" && (PhoneInput as any) ? (
                                <PhoneInput
                                    country={"ng"}
                                    value={profile.phone || ""}
                                    onChange={(value: any) => updateProfileField("phone", value ? `+${value}` : "")}
                                    inputProps={{ name: "phone", required: false }}
                                    inputStyle={{ width: "100%" }}
                                />
                            ) : (
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    <Input
                                        id="phone"
                                        value={profile.phone || ""}
                                        onChange={(e) => updateProfileField("phone", e.target.value)}
                                        placeholder="+234 800 000 0000"
                                        className="pl-10"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank</Label>
                        <Select
                            value={bankState.bankCode || ""}
                            onValueChange={(code) => {
                                const bank = banks.find((b) => b.code === code);
                                if (bank) {
                                    updateBankField("bankCode", code);
                                    updateBankField("bankName", bank.name);
                                    updateBankField("accountNumber", "");
                                    updateBankField("accountName", "");
                                }
                            }}
                        >
                            <SelectTrigger id="bankName" className="w-full">
                                <SelectValue placeholder="Select your bank" />
                            </SelectTrigger>
                            <SelectContent className="border-0">
                                {banks.map((b, idx) => (
                                    <SelectItem key={idx} value={b.code} className="hover:bg-gray-100 focus:bg-gray-100">{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="accountNumber">Account Number</Label>
                            {bankState.accountVerified && bankState.accountName ? (
                                <Badge variant="default">Verified</Badge>
                            ) : null}
                        </div>
                        <Input
                            id="accountNumber"
                            value={bankState.accountNumber}
                            onChange={async (e) => {
                                const v = e.target.value.replace(/\D/g, "");
                                updateBankField("accountNumber", v);
                                updateBankField("accountName", "");
                                // auto-verify when it reaches 10 digits and bank is selected
                                if (v.length === 10 && bankState.bankCode && !bankState.accountVerifying) {
                                    try {
                                        const res = await fetch("/api/verify-account", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ accountNumber: v, bankCode: bankState.bankCode }),
                                        });
                                        const json = await res.json();
                                        if (!res.ok || json.error) {
                                            toast.error(json.error || "Could not verify account", { id: "account-verify" });
                                            return;
                                        }
                                        updateBankField("accountName", json.accountName);
                                        toast.success(`Verified: ${json.accountName}`, { id: "account-verify" });
                                    } catch (err) {
                                        console.error(err);
                                        toast.error("Failed to verify account number", { id: "account-verify" });
                                    }
                                }
                            }}
                            placeholder="Enter account number (10 digits)"
                            disabled={!bankState.bankCode}
                        />
                        {bankState.accountName && <p className="text-sm text-muted-foreground">{bankState.accountName}</p>}
                    </div>
                    <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </motion.div>

            {/* Password Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-elegant"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-[hsl(var(--destructive))]/10">
                        <Lock className="h-5 w-5 text-[hsl(var(--destructive))]" />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-lg text-[hsl(var(--foreground))]">
                            Change Password
                        </h2>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Update your account password
                        </p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="Enter new password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                        />
                    </div>
                    <Button type="submit" variant="destructive" disabled={changingPassword}>
                        {changingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Update Password
                    </Button>
                </form>
            </motion.div>

            {/* Account Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-elegant"
            >
                <h2 className="font-display font-bold text-lg text-[hsl(var(--foreground))] mb-4">
                    Account Information
                </h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">Account ID</span>
                        <span className="font-mono text-[hsl(var(--foreground))]">{user?.id?.slice(0, 8) || "-"}...</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">Account Type</span>
                        <span className="text-[hsl(var(--foreground))]">Affiliate</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">Member Since</span>
                        <span className="text-[hsl(var(--foreground))]">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}