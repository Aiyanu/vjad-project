"use client"
import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        id: 1,
        name: "Adebayo Johnson",
        role: "Top Affiliate • Lagos",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
        content: "vijad Projects transformed my side income into a full-time business. The commission structure is unmatched, and the support team is always there when I need them.",
        rating: 5,
        earnings: "₦4.2M earned",
    },
    {
        id: 2,
        name: "Chioma Nwosu",
        role: "Affiliate Partner • Abuja",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
        content: "What I love most is the transparency. I can track every referral, every sale, and my commissions in real-time. It's professional and reliable.",
        rating: 5,
        earnings: "₦2.8M earned",
    },
    {
        id: 3,
        name: "Emmanuel Okafor",
        role: "Premium Affiliate • Port Harcourt",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
        content: "The quality of properties they offer makes my job easy. Clients trust the brand, and that trust converts to sales. Best decision I made this year.",
        rating: 5,
        earnings: "₦5.6M earned",
    },
];

export function TestimonialsSection() {
    return (
        <section id="testimonials" className="py-24 bg-secondary text-secondary-foreground">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="gold-badge mb-4">Testimonials</span>
                    <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 mb-4">
                        What Our Clients Say
                    </h2>
                    <p className="text-xl text-secondary-foreground/70 max-w-2xl mx-auto">
                        Join hundreds of successful affiliates who are building wealth with vijad Projects
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-secondary-foreground/5 backdrop-blur-sm rounded-3xl p-8 border border-secondary-foreground/10 hover:border-vijad-gold/30 transition-all duration-300"
                        >
                            {/* Quote Icon */}
                            <Quote className="w-10 h-10 text-vijad-gold/50 mb-6" />

                            {/* Content */}
                            <p className="text-lg text-secondary-foreground/90 mb-6 leading-relaxed">
                                "{testimonial.content}"
                            </p>

                            {/* Rating */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-vijad-gold text-vijad-gold" />
                                ))}
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-vijad-gold/30"
                                />
                                <div>
                                    <div className="font-bold text-secondary-foreground">{testimonial.name}</div>
                                    <div className="text-sm text-secondary-foreground/60">{testimonial.role}</div>
                                    <div className="text-sm font-semibold text-vijad-gold mt-1">{testimonial.earnings}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
