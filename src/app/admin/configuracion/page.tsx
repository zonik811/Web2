"use client";

import { Building2, Globe, Settings, ShoppingBag, Sparkles } from "lucide-react";
import { ConfigCard } from "@/components/admin/config/ConfigCard";

export default function ConfiguracionPage() {
    const options = [
        {
            title: "Empresa",
            description: "Gestiona la identidad de tu marca, información de contacto, logotipos y colores corporativos.",
            icon: Building2,
            href: "/admin/configuracion/empresa",
            gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
        },
        {
            title: "Página Web",
            description: "Personaliza el contenido visible, banners, textos promocionales y secciones clave de tu sitio.",
            icon: Globe,
            href: "/admin/configuracion/pagina",
            gradient: "bg-gradient-to-br from-emerald-400 to-cyan-600",
        },
        {
            title: "Paramétricas",
            description: "Define cargos, especialidades y tablas maestras para la operación de tu negocio.",
            icon: Settings,
            href: "/admin/configuracion/parametricas",
            gradient: "bg-gradient-to-br from-orange-400 to-amber-600",
        },
        {
            title: "Catálogo de Servicios",
            description: "Administra tus servicios, precios base, categorías y detalles de oferta.",
            icon: ShoppingBag,
            href: "/admin/servicios", // Redirige al módulo de servicios existente que ya es completo
            gradient: "bg-gradient-to-br from-pink-500 to-rose-600",
        },
    ];

    return (
        <div className="min-h-[85vh] space-y-8 p-6 lg:p-10 relative overflow-hidden bg-slate-50/50">
            {/* Background Decorative Blobs */}
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-40 right-0 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />

            {/* Hero Section */}
            <div className="relative z-10 space-y-2 mb-12 animate-in fade-in slide-in-from-top-5 duration-700">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg shadow-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                        Centro de Control
                    </h1>
                </div>
                <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                    Personaliza cada aspecto de tu plataforma. Desde la identidad visual hasta la configuración operativa, todo en un solo lugar.
                </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {options.map((option, index) => (
                    <ConfigCard
                        key={option.title}
                        {...option}
                        delay={index * 100}
                    />
                ))}
            </div>

            {/* Quick Stats or Status (Optional placeholder for future expansion) */}
            <div className="mt-12 p-6 rounded-2xl bg-white/60 border border-slate-200 backdrop-blur-sm relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Estado del Sistema</h4>
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-slate-700">Servicios Activos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-slate-700">Pagos Habilitados</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-slate-700">Sitio Publicado</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
