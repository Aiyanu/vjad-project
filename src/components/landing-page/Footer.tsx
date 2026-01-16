import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, X } from "lucide-react";
import Image from "next/image";

const footerLinks = {
    // Company: only include sections that exist
    company: [
        { label: "About Us", href: "#about" },
        { label: "Our Team", href: "/team" },
        { label: "Projects", href: "/projects" },
        { label: "Testimonials", href: "#testimonials" },
        // { label: "Careers", href: "#" },
        // { label: "Press Kit", href: "#" },
    ],
    // Properties: requested to comment out (all properties are in Lagos)
    // properties: [
    //     { label: "Featured Projects", href: "#projects" },
    //     { label: "Lagos Properties", href: "#" },
    //     { label: "Abuja Properties", href: "#" },
    //     { label: "Investment Guide", href: "#" },
    // ],
    // Affiliates: keep only working routes
    affiliates: [
        { label: "Join Program", href: "/auth?mode=register" },
        { label: "Affiliate Login", href: "/auth?mode=login" },
        // { label: "Commission Structure", href: "#" },
        // { label: "Training Resources", href: "#" },
    ],
    // Legal: requested to comment out
    // legal: [
    //     { label: "Privacy Policy", href: "#" },
    //     { label: "Terms of Service", href: "#" },
    //     { label: "Cookie Policy", href: "#" },
    //     { label: "Refund Policy", href: "#" },
    // ],
};

const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/share/1C1opzzfhk/?mibextid=wwXIfr", label: "Facebook" },
    // { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/vijadprojects?igsh=NnY0cTlqeGE2eG9h", label: "Instagram" },
    // { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
    return (
        <footer className="bg-secondary text-secondary-foreground">
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <a href="#home" className="flex items-center gap-3 mb-6">
                            <Image src={"/vijad-projects.png"} width={100} height={100} alt="vijad" />
                        </a>

                        <p className="text-secondary-foreground/70 mb-6 max-w-sm">
                            Building wealth through strategic real estate partnerships.
                            Join Nigeria's fastest-growing property affiliate network.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <a href="mailto:info@vijadprojects.com" className="flex items-center gap-3 text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                                <Mail className="w-4 h-4" />
                                info@vijadprojects.com
                            </a>
                            <a href="tel:+2341234567890" className="flex items-center gap-3 text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                                <Phone className="w-4 h-4" />
                                +2347048482006
                            </a>
                            <div className="flex items-start gap-3 text-secondary-foreground/70">
                                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                                <span className="capitalize">Block C1 HFP SHOPPING COMPLEX ABRAHAM ADESANYA AJAH LAGOS</span>
                            </div>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Properties column commented out per request */}
                    {false && (
                        <div>
                            <h4 className="font-bold text-lg mb-4">Properties</h4>
                            <ul className="space-y-3">
                                {/* footerLinks.properties?.map((link) => ( ... )) */}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h4 className="font-bold text-lg mb-4">Affiliates</h4>
                        <ul className="space-y-3">
                            {footerLinks.affiliates.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal column commented out per request */}
                    {false && (
                        <div>
                            <h4 className="font-bold text-lg mb-4">Legal</h4>
                            <ul className="space-y-3">
                                {/* footerLinks.legal?.map((link) => ( ... )) */}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-secondary-foreground/60 text-sm">
                        © {new Date().getFullYear()} Vijad Projects. All rights reserved.
                    </p>

                    {/* Social Links */}
                    <div className="flex gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                aria-label={social.label}
                                className="p-2 rounded-full bg-secondary-foreground/10 text-secondary-foreground/70 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                            >
                                <social.icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
