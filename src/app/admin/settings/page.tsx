"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useAppSelector } from "@/store/hooks";
import { useApi } from "@/hooks/useApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Mail, Phone, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export default function AdminSettings() {
  const user = useAppSelector((state) => state.user.user);
  const api = useApi();
  const [profile, setProfile] = useState<Profile>({ full_name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    setLoading(false);
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setSaving(true);
    try {
      const response = await api.put(`/api/user/${user.id}`, {
        fullName: profile.full_name,
        phone: profile.phone,
      });

      if (response.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await api.post("/api/auth/change-password", {
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        toast.success("Password updated successfully");
        setPasswordData({ newPassword: "", confirmPassword: "" });
      } else {
        toast.error(response.message || "Failed to update password");
      }
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

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
          Manage your admin account settings
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
              value={profile.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
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
            {typeof window !== "undefined" ? (
              <PhoneInput
                country={"ng"}
                value={profile.phone || ""}
                onChange={(value: any) => setProfile({ ...profile, phone: value ? `+${value}` : "" })}
                inputStyle={{ width: "100%" }}
              />
            ) : (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Input
                  id="phone"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="pl-10"
                />
              </div>
            )}
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
          <Button type="submit" disabled={changingPassword}>
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
            <span className="font-mono text-[hsl(var(--foreground))]">{user?.id.slice(0, 8)}...</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Account Type</span>
            <span className="text-[hsl(var(--foreground))]">Admin</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Member Since</span>
            <span className="text-[hsl(var(--foreground))]">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}