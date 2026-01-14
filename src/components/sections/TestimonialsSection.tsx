"use client";

import { useCompany } from "@/context/CompanyContext";
import { Star, Quote } from "lucide-react";
import Image from "next/image";
import type { EmpresaConfig } from "@/types/nuevos-tipos";

interface TestimonialsSectionProps {
    previewConfig?: Partial<EmpresaConfig>;
}

export function TestimonialsSection({ previewConfig }: TestimonialsSectionProps) {
    const { config: globalConfig } = useCompany();
    const config = previewConfig || globalConfig;

    // Parse testimonials list safely
    const testimonials = (config as any)?.testimonials ? JSON.parse((config as any).testimonials) : [];

    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                        Lo Que Dicen Nuestros Clientes
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-blue-400 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((item: any, index: number) => (
                        <div key={index} className="bg-slate-50 rounded-2xl p-8 relative flex flex-col hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                            {/* Quote Icon */}
                            <Quote className="absolute top-6 right-6 h-8 w-8 text-slate-200 fill-slate-200" />

                            {/* Stars */}
                            <div className="flex gap-1 mb-6 text-amber-400">
                                {Array.from({ length: item.rating || 5 }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-current" />
                                ))}
                            </div>

                            <p className="text-slate-600 mb-8 flex-grow leading-relaxed italic">
                                "{item.content}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-200">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.author} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                                            {item.author?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{item.author}</h4>
                                    <p className="text-xs text-slate-500">Cliente Verificado</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
