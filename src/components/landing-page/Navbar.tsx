"use client"
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "/projects" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "/contact" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter()

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-xl border-b border-border/50"
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <a href="#home" className="flex items-center gap-3">
                        <Image src={"/vijad-projects-dark.png"} width={130} height={100} alt="vjad" />
                        {/* <div className="p-2 bg-primary rounded-xl">
                            <Building2 className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="font-display font-bold text-xl text-foreground">
                            VJAD<span className="text-primary">Projects</span>
                        </span> */}
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a key={link.href} href={link.href} className="nav-link">
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button onClick={() => router.push("/auth?mode=login")} variant="ghost" className="font-medium">
                            Login
                        </Button>
                        <Button onClick={() => router.push("/auth?mode=register")} className="bg-primary hover:bg-primary/90 font-semibold px-6">
                            Become an Affiliate
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-foreground"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-background border-b border-border"
                    >
                        <div className="container mx-auto px-4 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block py-2 text-lg font-medium text-foreground hover:text-primary transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="pt-4 space-y-3">
                                <Button onClick={() => router.push("/auth?mode=login")} variant="outline" className="w-full">
                                    Login
                                </Button>
                                <Button onClick={() => router.push("/auth?mode=register")} className="w-full bg-primary hover:bg-primary/90">
                                    Become an Affiliate
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
