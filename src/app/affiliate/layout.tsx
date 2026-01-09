"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearAuth, setUser } from "@/store/authSlice";
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
import Image from "next/image";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/affiliate" },
    { icon: Users, label: "Referrals", href: "/affiliate/referrals" },
    // { icon: DollarSign, label: "Sales", href: "/affiliate/sales" },
    // { icon: Share2, label: "Share & Earn", href: "/affiliate/share" },
    { icon: Settings, label: "Settings", href: "/affiliate/settings" },
];

const AffiliateDashboardLayout = ({ children }: DashboardLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const user = useAppSelector((state) => state.auth.user);
    const token = useAppSelector((state) => state.auth.token);
    const dispatch = useAppDispatch();

    // Wait for Redux persist to rehydrate from sessionStorage
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        const bootstrap = async () => {
            if (!token) {
                setLoadingUser(false);
                router.replace("/auth");
                return;
            }
            if (user) {
                setLoadingUser(false);
                return;
            }
            try {
                const res = await fetch("/api/user", { credentials: "same-origin" });
                const json = await res.json().catch(() => ({}));
                if (!res.ok || !json.user) {
                    dispatch(clearAuth());
                    router.replace("/auth");
                    return;
                }
                dispatch(setUser(json.user));
            } catch (err) {
                console.error("Failed to fetch user", err);
                dispatch(clearAuth());
                router.replace("/auth");
            } finally {
                setLoadingUser(false);
            }
        };
        bootstrap();
    }, [isHydrated, token, user, router, dispatch]);

    const handleLogout = async () => {
        dispatch(clearAuth());
        router.push("/auth");
    };

    const userName = user?.fullName || user?.email?.split("@")[0] || "Affiliate";

    if (loadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--color-background)">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-(--color-vjad-navy)"></div>
                    <p className="mt-4 text-(--color-vjad-navy)">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRole="affiliate">
            <div className="min-h-screen bg-(--color-background)">
                {/* Mobile Header */}
                <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-(--color-vjad-navy) px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        {/* <Building2 className="h-6 w-6 text-white" />
                    <span className="text-lg font-display font-bold text-white">VJAD</span>
                     */}
                        <Image src={"/vijad-projects.png"} width={120} height={70} alt="vjad" />
                    </Link>

                    <button onClick={() => setIsSidebarOpen((s) => !s)} className="text-white p-2" aria-label="Toggle menu">
                        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </header>

                {/* Sidebar */}
                <aside
                    className={`fixed top-0 left-0 h-full w-64 bg-(--color-vjad-navy) z-40 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
                >
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-white/10">
                            <Link href="/" className="flex items-center gap-3">
                                {/* <Building2 className="h-8 w-8 text-white" />
                            <span className="text-xl font-display font-bold text-white">VJAD Projects</span> */}
                                <Image src={"/vijad-projects.png"} width={120} height={70} alt="vjad" />
                            </Link>
                        </div>

                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-(--color-primary) flex items-center justify-center text-white font-semibold">
                                    {userName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                                    <p className="text-xs text-white/60 truncate">{user?.email || ""}</p>
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
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-(--color-primary) text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
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
        </ProtectedRoute>
    );
};

export default AffiliateDashboardLayout;
