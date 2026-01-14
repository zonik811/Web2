"use client";

import { useCompany } from "@/context/CompanyContext";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import Image from "next/image";

// Placeholder data since we don't have the real product selector yet
// In a future generic update, this could fetch featured products by ID
const FEATURED_CATEGORIES = [
    { name: "Repuestos Nuevos", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2864&auto=format&fit=crop", count: "120+" },
    { name: "Ofertas Especiales", image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2940&auto=format&fit=crop", count: "15%" },
    { name: "Más Vendidos", image: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2787&auto=format&fit=crop", count: "Top 10" },
    { name: "Accesorios", image: "https://images.unsplash.com/photo-1584346133934-a3afd2a8d523?q=80&w=2787&auto=format&fit=crop", count: "50+" },
];

export function CatalogPreviewSection() {
    return (
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 z-0" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0 animate-pulse" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 text-primary mb-4">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-semibold tracking-wider uppercase text-sm">Catálogo Destacado</span>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">
                            Encuentra lo que Necesitas
                        </h2>
                        <p className="text-slate-400 text-lg">
                            Explora nuestra amplia gama de repuestos y accesorios de la más alta calidad para tu maquinaria.
                        </p>
                    </div>
                    <Link href="/catalogo">
                        <div className="group flex items-center gap-3 bg-white/10 hover:bg-white text-white hover:text-slate-900 px-6 py-3 rounded-full transition-all duration-300 backdrop-blur-sm cursor-pointer border border-white/20">
                            <span className="font-semibold">Ver Catálogo Completo</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>

                {/* Visual Grid / Carousel Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURED_CATEGORIES.map((category, index) => (
                        <Link href="/catalogo" key={index} className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer">
                            <div className="absolute inset-0 bg-slate-800">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-110 transform"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </div>

                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <div className="flex items-center justify-between mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <span className="text-xs font-bold bg-primary text-white px-2 py-1 rounded-md">{category.count}</span>
                                    <div className="bg-white p-2 rounded-full text-slate-900">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:-translate-y-2 transition-transform duration-300">
                                    {category.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
