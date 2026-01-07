"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Building2,
    LayoutDashboard,
    Users,
    DollarSign,
    Share2,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from "lucide-react";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/affiliate" },
    { icon: Users, label: "Referrals", href: "/affiliate/referrals" },
    { icon: DollarSign, label: "Sales", href: "/affiliate/sales" },
    { icon: Share2, label: "Share & Earn", href: "/affiliate/share" },
    { icon: Settings, label: "Settings", href: "/affiliate/settings" },
];

const AffiliateDashboardLayout = ({ children }: DashboardLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Supabase auth logic intentionally commented; re-enable on server or client as needed.
    }, [router]);

    const handleLogout = async () => {
        // await supabase.auth.signOut();
        router.push("/");
    };

    const userName = "Affiliate";

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--color-vjad-navy)] px-4 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-white" />
                    <span className="text-lg font-display font-bold text-white">VJAD</span>
                </Link>

                <button onClick={() => setIsSidebarOpen((s) => !s)} className="text-white p-2" aria-label="Toggle menu">
                    {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </header>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-[var(--color-vjad-navy)] z-40 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-white/10">
                        <Link href="/" className="flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-white" />
                            <span className="text-xl font-display font-bold text-white">VJAD Projects</span>
                        </Link>
                    </div>

                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold">
                                {userName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{userName}</p>
                                <p className="text-xs text-white/60 truncate">affiliate@vjad.com</p>
                            </div>
                        </div>
                    </div>

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
                    ${isActive ? "bg-[var(--color-primary)] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-white/10">
                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10">
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
};

export default AffiliateDashboardLayout;
