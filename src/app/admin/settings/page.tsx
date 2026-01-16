"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
// import { supabase } from "@/lib/supabase/client";
// import { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User as UserIcon, Mail, Phone, Lock, Loader2, Calendar, Clock, Plus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  completed: "bg-green-500/20 text-green-700 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-700 border-red-500/30",
};

// Mock user type to replace Supabase User
interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  created_at?: string;
}

export default function AdminSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({ full_name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [timeSlots, setTimeSlots] = useState<Array<{ dayOfWeek: string; startTime: string; endTime: string }>>([
    { dayOfWeek: "1", startTime: "09:00", endTime: "10:00" }
  ]);

  const [passwordData,setPasswordData] = useState({
    newPassword: "", confirmPassword: "",
  });

  useEffect(() => {
    fetchUserAndProfile();
    fetchSlots();
    fetchAppointments();
  }, []);

  const fetchUserAndProfile = async () => {
    try {
      // SUPABASE IMPLEMENTATION (COMMENTED OUT)
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) return;
      // setUser(user);

      // const { data: profileData } = await supabase
      //   .from("profiles")
      //   .select("full_name, email, phone")
      //   .eq("id", user.id)
      //   .maybeSingle();

      // if (profileData) {
      //   setProfile(profileData);
      // } else {
      //   setProfile({
      //     full_name: user.user_metadata?.full_name || "",
      //     email: user.email || "",
      //     phone: "",
      //   });
      // }

      // MOCK DATA FOR DEVELOPMENT
      setUser(null);
      setProfile({ full_name: "", email: "", phone: "" });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/appointments/slots");
      const data = await response.json();
      if (data.success) {
        setSlots(data.slots);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast({
        title: "Error",
        description: "Failed to fetch appointment slots",
      });
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
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
      });
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

  const updateTimeSlot = (index: number, field: "dayOfWeek" | "startTime" | "endTime", value: string) => {
    const updated = [...timeSlots];
    updated[index][field] = value;
    setTimeSlots(updated);

  const handleDeleteSlot = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/slots?id=${id}`, {
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
}

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // SUPABASE IMPLEMENTATION (COMMENTED OUT)
      // const { error } = await supabase
      //   .from("profiles")
      //   .update({
      //     full_name: profile.full_name,
      //     phone: profile.phone,
      //   })
      //   .eq("id", user.id);

      // if (error) throw error;

      // toast({
      //   title: "Success",
      //   description: "Profile updated successfully",
      // });
    } catch (error) {
      console.error("Error updating profile:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to update profile",
      //   variant: "destructive",
      // });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // toast({
      //   title: "Error",
      //   description: "Passwords do not match",
      //   variant: "destructive",
      // });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      // toast({
      //   title: "Error",
      //   description: "Password must be at least 6 characters",
      //   variant: "destructive",
      // });
      return;
    }

    setChangingPassword(true);
    try {
      // SUPABASE IMPLEMENTATION (COMMENTED OUT)
      // const { error } = await supabase.auth.updateUser({
      //   password: passwordData.newPassword,
      // });

      // if (error) throw error;

      // toast({
      //   title: "Success",
      //   description: "Password updated successfully",
      // });
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to update password",
      //   variant: "destructive",
      // });
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
      </div>
      </motion.div>

      {/* Appointment Slots Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-2xl">
        <Card className="border-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="w-5 h-5 text-[hsl(var(--primary))]" />
                  Appointment Availability
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-2">Set your available time slots for appointments</CardDescription>
              </div>
              <Button 
                className="gap-2 w-full sm:w-auto"
                onClick={() => setShowAppointmentForm(!showAppointmentForm)}
                variant={showAppointmentForm ? "default" : "outline"}
              >
                <Plus className="w-4 h-4" />
                {showAppointmentForm ? "Cancel" : "Add Time Slot"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {showAppointmentForm && (
              <form onSubmit={handleAddSlot} className="space-y-2 mb-6">
                <Label className="text-sm sm:text-base font-semibold">Add Time Slots</Label>
                
                <div className="space-y-3">
                  {timeSlots.map((slot, index) => (
                    <div key={index} className="space-y-2">
                      {index === 0 && (
                        <div className="hidden sm:grid sm:grid-cols-4 gap-2 mb-3">
                          <div>
                            <Label className="text-xs">Day</Label>
                          </div>
                          <div>
                            <Label className="text-xs">From</Label>
                          </div>
                          <div>
                            <Label className="text-xs">To</Label>
                          </div>
                          <div></div>
                        </div>
                      )}
                      
                      <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-4 sm:gap-2 sm:items-end p-3 sm:p-0 bg-muted/30 sm:bg-transparent rounded-lg sm:rounded-none">
                        <div>
                          <Label className="text-xs sm:hidden mb-1 block">Day</Label>
                          <Select value={slot.dayOfWeek} onValueChange={(value) => updateTimeSlot(index, "dayOfWeek", value)}>
                            <SelectTrigger className="h-8 text-xs sm:text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS.map((day, dayIndex) => (
                                <SelectItem key={dayIndex} value={dayIndex.toString()}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs sm:hidden mb-1 block">From</Label>
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(index, "startTime", e.target.value)}
                            className="h-8 text-xs sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs sm:hidden mb-1 block">To</Label>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(index, "endTime", e.target.value)}
                            className="h-8 text-xs sm:text-sm"
                          />
                        </div>

                        <div className="flex gap-1 sm:gap-0.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleAddTimeSlot}
                            className="flex-1 sm:flex-none sm:w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-50 text-xs sm:text-base"
                            title="Add another slot"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveTimeSlot(index)}
                            disabled={timeSlots.length === 1}
                            className="flex-1 sm:flex-none sm:w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 text-xs sm:text-base"
                            title="Remove this slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full mt-2">
                  Save Availability
                </Button>
              </form>
            )}

            {slots.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground">No appointment slots added yet</p>
            ) : (
              <div className="space-y-3">
                {slots.map((slot) => (
                  <div key={slot.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{DAYS[slot.dayOfWeek]}</p>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteSlot(slot.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* All Appointments Section
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[hsl(var(--primary))]" />
              All Appointments
            </CardTitle>
            <CardDescription>View all bookings made through your availability</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No appointments yet</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>
                          <div className="font-medium">{apt.visitorName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{format(new Date(apt.appointmentDate), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(apt.startTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{apt.visitorEmail}</div>
                          {apt.visitorPhone && <div className="text-xs text-muted-foreground">{apt.visitorPhone}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[apt.status]}>
                            {apt.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div> */}
    </div>
  );
}