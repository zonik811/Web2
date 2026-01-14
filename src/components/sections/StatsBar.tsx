"use client";

import { Star, CheckCircle, Users, TrendingUp } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import type { EmpresaConfig } from "@/types/nuevos-tipos";

interface StatsBarProps {
    previewConfig?: Partial<EmpresaConfig>;
}

export function StatsBar({ previewConfig }: StatsBarProps) {
    const { config: globalConfig } = useCompany();
    const config = previewConfig || globalConfig;

    // Parse branding colors
    let primary = "#0284c7"; // sky-600
    let secondary = "#10b981"; // emerald-600

    try {
        if (config?.branding_colors) {
            const colors = JSON.parse(config.branding_colors);
            if (colors.primary) primary = colors.primary;
            if (colors.secondary) secondary = colors.secondary;
        }
    } catch (e) {
        // Fallback
    }

    return (
        <section
            className="text-white py-12 relative overflow-hidden shadow-xl transition-colors duration-300"
            style={{
                background: `linear-gradient(to right, ${primary}, ${secondary})`
            }}
        >
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
            </div>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { icon: Star, number: `${config?.statClientes || 50}+`, label: "Clientes Felices" },
                        { icon: CheckCircle, number: `${config?.statServicios || 200}+`, label: "Servicios Completados" },
                        { icon: Users, number: config?.statProfesionales || 8, label: "Profesionales" },
                        { icon: TrendingUp, number: config?.statSatisfaccion || "98%", label: "Satisfacción" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center transform hover:scale-110 transition-transform">
                            <stat.icon className="h-10 w-10 mx-auto mb-3" />
                            <div className="text-4xl font-bold mb-1">{stat.number}</div>
                            <div className="text-sm text-white/80">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
