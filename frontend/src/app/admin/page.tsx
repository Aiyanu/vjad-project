"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
// import { supabase } from "@/lib/supabase/client";

import { StatCard } from "@/components/landing-page/StatCard";
import {
  Users,
  DollarSign,
  TrendingUp,
  UserCheck,
  Clock,
  CheckCircle,
  Calendar
} from "lucide-react";
import { appointmentService } from "@/services/appointmentService";

interface Stats {
  totalAffiliates: number;
  totalSales: number;
  totalCommissions: number;
  pendingSales: number;
  approvedSales: number;
  totalReferrals: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAffiliates: 0,
    totalSales: 0,
    totalCommissions: 0,
    pendingSales: 0,
    approvedSales: 0,
    totalReferrals: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // SUPABASE IMPLEMENTATION (COMMENTED OUT)
      // // Fetch affiliates count
      // const { count: affiliatesCount } = await supabase
      //   .from("affiliates")
      //   .select("*", { count: "exact", head: true });

      // // Fetch sales stats
      // const { data: salesData } = await supabase
      //   .from("sales")
      //   .select("sale_amount, commission_amount, status");

      // const totalSales = salesData?.reduce((sum, s) => sum + Number(s.sale_amount), 0) || 0;
      // const totalCommissions = salesData?.reduce((sum, s) => sum + Number(s.commission_amount), 0) || 0;
      // const pendingSales = salesData?.filter(s => s.status === "REPORTED" || s.status === "PENDING_VERIFICATION").length || 0;
      // const approvedSales = salesData?.filter(s => s.status === "APPROVED" || s.status === "PAID").length || 0;

      // // Fetch referrals count
      // const { count: referralsCount } = await supabase
      //   .from("referrals")
      //   .select("*", { count: "exact", head: true });

      // setStats({
      //   totalAffiliates: affiliatesCount || 0,
      //   totalSales,
      //   totalCommissions,
      //   pendingSales,
      //   approvedSales,
      //   totalReferrals: referralsCount || 0,
      // });

      // MOCK DATA FOR DEVELOPMENT
      setStats({
        totalAffiliates: 0,
        totalSales: 0,
        totalCommissions: 0,
        pendingSales: 0,
        approvedSales: 0,
        totalReferrals: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentStats();
  }, []);

  const fetchAppointmentStats = async () => {
    try {
      const data = await appointmentService.fetchBookings();

      if (data.success && data.appointments) {
        const appointments = data.appointments;
        const pending = appointments.filter((a: any) => a.status === "pending").length;
        const confirmed = appointments.filter((a: any) => a.status === "confirmed").length;

        setStats(prev => ({
          ...prev,
          totalAppointments: appointments.length,
          pendingAppointments: pending,
          confirmedAppointments: confirmed,
        }));
      }
    } catch (error) {
      console.error("Error fetching appointment stats:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    { title: "Total Affiliates", value: stats.totalAffiliates, icon: Users },
    { title: "Total Appointments", value: stats.totalAppointments, icon: Calendar },
    { title: "Pending Appointments", value: stats.pendingAppointments, icon: Clock },
    { title: "Confirmed Appointments", value: stats.confirmedAppointments, icon: CheckCircle },
    // { title: "Total Sales", value: stats.totalSales, icon: DollarSign, prefix: "₦", format: true },
    // { title: "Total Commissions", value: stats.totalCommissions, icon: TrendingUp, prefix: "₦", format: true },
    // { title: "Pending Sales", value: stats.pendingSales, icon: Clock },
    // { title: "Approved Sales", value: stats.approvedSales, icon: CheckCircle },
    { title: "Total Referrals", value: stats.totalReferrals, icon: UserCheck },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[hsl(var(--foreground))]">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-base text-[hsl(var(--muted-foreground))] mt-1">
          Overview of affiliate program and appointments
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
          >
            <StatCard
              title={stat.title}
              value={typeof stat.value === 'number' ? stat.value : 0}
              icon={stat.icon}
            />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="card-elegant">
          <h3 className="font-display font-bold text-lg text-[hsl(var(--foreground))] mb-4">
            Recent Activity
          </h3>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">
            Activity feed will appear here as affiliates report sales and add referrals.
          </p>
        </div>
        <div className="card-elegant">
          <h3 className="font-display font-bold text-lg text-[hsl(var(--foreground))] mb-4">
            Pending Actions
          </h3>
          {stats.pendingSales > 0 ? (
            <div className="p-4 rounded-lg bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20">
              <p className="font-medium text-[hsl(var(--destructive))]">
                {stats.pendingSales} sales pending verification
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Review and approve sales in the Sales section
              </p>
            </div>
          ) : (
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              No pending actions at the moment.
            </p>
          )}
        </div>
      </motion.div> */}
    </div>
  );
}