"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
// import { supabase } from "@/lib/supabase/client";
// import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Mock types to replace Supabase types
interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  created_at?: string;
}

interface Session {
  user: User;
}

export default function AdminDashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // SUPABASE IMPLEMENTATION (COMMENTED OUT)
    // ...
    // MOCK DATA FOR DEVELOPMENT
    setLoading(false);
  }, [router]);

  const checkAdminRole = async (userId: string) => {
    try {
      // SUPABASE IMPLEMENTATION (COMMENTED OUT)
      // ...
      // MOCK DATA FOR DEVELOPMENT
      setIsSuperAdmin(false);
    } catch (error) {
      console.error("Error checking admin role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // SUPABASE IMPLEMENTATION (COMMENTED OUT)
    // await supabase.auth.signOut();
    router.push("/");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Affiliates", href: "/admin/affiliates" },
    { icon: DollarSign, label: "Sales", href: "/admin/sales" },
    ...(isSuperAdmin ? [{ icon: UserCog, label: "Admins", href: "/admin/admins" }] : []),
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--color-vjad-navy)] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/vijad-projects.png" alt="VJAD" width={120} height={70} className="h-8 w-auto" />
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white p-2"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[var(--color-vjad-navy)] z-40 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/vijad-projects.png" alt="VJAD" width={120} height={70} className="h-10 w-auto" />
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-white/60 truncate">{user?.email ?? "admin@vjad.com"}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
