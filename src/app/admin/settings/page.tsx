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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Loader2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { DaySlotManager } from "@/components/appointments/DaySlotManager";

const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface AppointmentSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Appointment {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  message: string | null;
  createdAt: string;
}

// Keep a local User type so TypeScript is happy; shape should match what your store provides.
interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  created_at?: string;
  fullName?: string;
  phone?: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  completed: "bg-green-500/20 text-green-700 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-700 border-red-500/30",
};

export default function AdminSettings() {
  // Read authenticated user from your Redux store (like the working file)
  const user = useAppSelector((state) => state.user.user) as User | null;
  const api = useApi();

  // Local state
  const [profile, setProfile] = useState<Profile>({ full_name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [timeSlots, setTimeSlots] = useState<
    Array<{ dayOfWeek: string; startTime: string; endTime: string }>
  >([{ dayOfWeek: "1", startTime: "09:00", endTime: "10:00" }]);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Populate profile from store user when it becomes available
  useEffect(() => {
    if (user) {
      setProfile({
        full_name: (user as any).fullName || user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
      });
    } else {
      // If no user, reset profile to empty (depends on desired UX)
      setProfile({ full_name: "", email: "", phone: "" });
    }
    setLoading(false);
  }, [user]);

  // Fetch slots and appointments on mount
  useEffect(() => {
    fetchSlots();
    fetchAppointments();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/appointments/slots");
      const data = await response.json();
      if (data.success) {
        setSlots(data.slots);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to fetch appointment slots");
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments/book");
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments");
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Add all time slots
      for (const slot of timeSlots) {
        const response = await fetch("/api/appointments/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayOfWeek: parseInt(slot.dayOfWeek),
            startTime: slot.startTime,
            endTime: slot.endTime,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          toast.error(data.error || "Failed to add slot");
          return;
        }
      }

      toast.success("All appointment slots added successfully!");
      setShowAppointmentForm(false);
      setTimeSlots([{ dayOfWeek: "1", startTime: "09:00", endTime: "10:00" }]);
      fetchSlots();
    } catch (error) {
      toast.error("Failed to add appointment slots");
    }
  };

  const handleAddTimeSlot = () => {
    setTimeSlots([...timeSlots, { dayOfWeek: "1", startTime: "09:00", endTime: "10:00" }]);
  };

  const handleRemoveTimeSlot = (index: number) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index));
    }
  };

  const updateTimeSlot = (
    index: number,
    field: "dayOfWeek" | "startTime" | "endTime",
    value: string
  ) => {
    const updated = [...timeSlots];
    // @ts-ignore
    updated[index][field] = value;
    setTimeSlots(updated);
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/slots?slotId=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Slot deleted");
        fetchSlots();
      } else {
        toast.error("Failed to delete slot");
      }
    } catch (error) {
      toast.error("Failed to delete slot");
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setSaving(true);
    try {
      // If you want to use your api helper to update the profile:
      const response = await api.put(`/api/user/${user.id}`, {
        fullName: profile.full_name,
        phone: profile.phone,
      });

      if (response?.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(response?.message || "Failed to update profile");
      }

      // If you use Supabase, restore your supabase update logic here
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // Optionally show toast
      return;
    }

    if (passwordData.newPassword.length < 6) {
      // Optionally show toast
      return;
    }

    setChangingPassword(true);
    try {
      // Replace with your auth endpoint or supabase call
      const response = await api.post("/api/auth/change-password", {
        newPassword: passwordData.newPassword,
      });

      if (response?.success) {
        toast.success("Password updated successfully");
        setPasswordData({ newPassword: "", confirmPassword: "" });
      } else {
        toast.error(response?.message || "Failed to update password");
      }
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error?.message || "Failed to update password");
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
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[hsl(var(--foreground))]">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] mt-1">
          Manage your admin account settings and appointment availability
        </p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl"
      >
        <div className="card-elegant">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-[hsl(var(--primary))]/10 w-fit">
              <UserIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[hsl(var(--foreground))]">
                Profile Information
              </h2>
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
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
                  value={user?.email || profile.email || ""}
                  disabled
                  className="pl-10 bg-[hsl(var(--muted))]"
                />
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Email cannot be changed</p>
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
        </div>
      </motion.div>

      {/* Password Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl"
      >
        <div className="card-elegant">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-[hsl(var(--destructive))]/10 w-fit">
              <Lock className="h-5 w-5 text-[hsl(var(--destructive))]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[hsl(var(--foreground))]">
                Change Password
              </h2>
              <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
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
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl"
      >
        <div className="card-elegant">
          <h2 className="font-display font-bold text-lg text-[hsl(var(--foreground))] mb-4">
            Account Information
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Account ID</span>
              <span className="font-mono text-[hsl(var(--foreground))]">
                {user?.id ? `${user.id.slice(0, 8)}...` : "-"}
              </span>
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
        </div>
      </motion.div>

      {/* Appointment Slots Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-2xl">
        <DaySlotManager />
      </motion.div>

      {/* All Appointments Section (commented out in original) */}
    </div>
  );
}
