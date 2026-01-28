"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, Mail, Phone, CheckCircle, XCircle, Eye, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { appointmentService } from "@/services/appointmentService";

interface Appointment {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  message?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  completed: "bg-green-500/20 text-green-700 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-700 border-red-500/30",
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.fetchBookings();

      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        toast.error("Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error loading appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const data = await appointmentService.updateBooking(id, { status: newStatus });
      if (data.success) {
        toast.success(`Appointment marked as ${newStatus}`);
        setAppointments(
          appointments.map((apt) =>
            apt.id === id ? { ...apt, status: newStatus as any } : apt
          )
        );
      } else {
        toast.error(data.message || "Failed to update appointment status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating appointment");
    } finally {
      setUpdatingId(null);
    }
  };

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const filteredAppointments =
  statusFilter === "all"
    ? appointments
    : appointments.filter((apt) => apt.status === statusFilter);

const stats = {
  total: appointments.length,
  pending: appointments.filter((a) => a.status === "pending").length,
  confirmed: appointments.filter((a) => a.status === "confirmed").length,
  completed: appointments.filter((a) => a.status === "completed").length,
};

return (
  <div className="space-y-6">
    {/* Header */}
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl sm:text-4xl font-bold text-[hsl(var(--foreground))] mb-2">Appointments</h1>
      <p className="text-xs sm:text-base text-[hsl(var(--muted-foreground))]">
        Manage and track all appointment bookings
      </p>
    </motion.div>

    {/* Stats Cards */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4"
    >
      <Card className="card-elegant">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">
            {stats.total}
          </div>
          <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-2">Total</p>
        </CardContent>
      </Card>
      <Card className="card-elegant">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-2">Pending</p>
        </CardContent>
      </Card>
      <Card className="card-elegant">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.confirmed}</div>
          <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-2">Confirmed</p>
        </CardContent>
      </Card>
      <Card className="card-elegant">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.completed}</div>
          <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] mt-2">Completed</p>
        </CardContent>
      </Card>
    </motion.div>

    {/* Filter & Refresh */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">Filter:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" onClick={fetchAppointments} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Refresh
      </Button>
    </motion.div>

    {/* Appointments Table */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="card-elegant">
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No appointments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>
                        <div className="font-semibold text-[hsl(var(--foreground))]">
                          {apt.visitorName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                          <span>{format(new Date(apt.appointmentDate), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                          <span>{apt.visitorEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                          <Phone className="w-3 h-3" />
                          <span>{apt.visitorPhone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusColors[apt.status]}`}
                        >
                          {apt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedAppointment(apt)}
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Appointment Details</DialogTitle>
                                <DialogDescription>
                                  Booked on{" "}
                                  {format(new Date(apt.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedAppointment && (
                                <div className="space-y-4 pt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Client Name
                                      </p>
                                      <p className="font-semibold text-[hsl(var(--foreground))]">
                                        {selectedAppointment.visitorName}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Status
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className={`capitalize ${statusColors[selectedAppointment.status]
                                          }`}
                                      >
                                        {selectedAppointment.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Email
                                      </p>
                                      <p className="font-semibold text-[hsl(var(--foreground))]">
                                        {selectedAppointment.visitorEmail}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Phone
                                      </p>
                                      <p className="font-semibold text-[hsl(var(--foreground))]">
                                        {selectedAppointment.visitorPhone}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Date
                                      </p>
                                      <p className="font-semibold text-[hsl(var(--foreground))]">
                                        {format(
                                          new Date(selectedAppointment.appointmentDate),
                                          "MMMM d, yyyy"
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Time
                                      </p>
                                      <p className="font-semibold text-[hsl(var(--foreground))]">
                                        {formatTime(selectedAppointment.startTime)} -{" "}
                                        {formatTime(selectedAppointment.endTime)}
                                      </p>
                                    </div>
                                  </div>
                                  {selectedAppointment.message && (
                                    <div>
                                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Notes
                                      </p>
                                      <p className="font-semibold text-[hsl(var(--foreground))]">
                                        {selectedAppointment.message}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex gap-2 pt-4 border-t">
                                    <Select
                                      value={selectedAppointment.status}
                                      onValueChange={(value) => {
                                        updateStatus(selectedAppointment.id, value);
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Change status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          {apt.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => updateStatus(apt.id, "confirmed")}
                                disabled={updatingId === apt.id}
                                title="Confirm appointment"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => updateStatus(apt.id, "cancelled")}
                                disabled={updatingId === apt.id}
                                title="Cancel appointment"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  </div>
);
}
