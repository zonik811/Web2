"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Home, Building2, Sparkles, Tag, ArrowRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatearPrecio } from "@/lib/utils";

interface Categoria {
    $id: string;
    nombre: string;
    descripcion?: string;
}

interface Servicio {
    $id: string;
    nombre: string;
    descripcionCorta?: string;
    precioBase: number;
    duracionEstimada: number;
    categoria: string;
    categorias?: string[];
    estado?: boolean;
    activo?: boolean; // Soporte para ambos nombres de campo
}

interface ServiceSelectorProps {
    categorias: Categoria[];
    servicios: Servicio[];
    selectedServiceId: string;
    onSelectService: (service: Servicio) => void;
}

export function ServiceSelector({ categorias, servicios, selectedServiceId, onSelectService }: ServiceSelectorProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    // Filter services based on selected category
    const filteredServices = servicios.filter(s => {
        // Verificar estado activo (soporta 'estado' y 'activo', default true si undefined)
        const isInactive = s.estado === false || s.activo === false;
        if (isInactive) return false;

        if (!selectedCategoryId) return true;

        const selectedCategory = categorias.find(c => c.$id === selectedCategoryId);
        const selectedCategoryName = selectedCategory?.nombre;

        const serviceCats = s.categorias || [s.categoria];

        // Verificar si coincide con ID o Nombre de la categoría
        return serviceCats.some(cat =>
            cat === selectedCategoryId ||
            (selectedCategoryName && cat === selectedCategoryName)
        );
    });

    const getCategoryIcon = (nombre: string) => {
        const lower = nombre.toLowerCase();
        if (lower.includes('residencial') || lower.includes('hogar') || lower.includes('casa')) return Home;
        if (lower.includes('comercial') || lower.includes('oficina') || lower.includes('edificio')) return Building2;
        if (lower.includes('especial') || lower.includes('unico') || lower.includes('premium')) return Sparkles;
        return Tag;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Category Selection */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    Elige una Categoría
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categorias.map((cat) => {
                        const Icon = getCategoryIcon(cat.nombre);
                        const isSelected = selectedCategoryId === cat.$id;

                        return (
                            <button
                                key={cat.$id}
                                onClick={() => setSelectedCategoryId(isSelected ? null : cat.$id)}
                                className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${isSelected
                                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                    : "border-slate-100 bg-white hover:border-primary/50 hover:shadow-sm"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500 group-hover:bg-primary/20 group-hover:text-primary"
                                    }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-slate-600"}`}>
                                    {cat.nombre}
                                </span>
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Service Selection */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    Selecciona un Servicio
                </h3>

                {filteredServices.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                        <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500">No hay servicios disponibles en esta categoría.</p>
                        <button
                            onClick={() => setSelectedCategoryId(null)}
                            className="text-primary text-sm font-semibold hover:underline mt-1"
                        >
                            Ver todos los servicios
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredServices.map((servicio) => {
                            const isSelected = selectedServiceId === servicio.$id;

                            return (
                                <div
                                    key={servicio.$id}
                                    onClick={() => onSelectService(servicio)}
                                    className={`cursor-pointer group relative flex flex-col p-5 rounded-xl border-2 transition-all duration-300 ${isSelected
                                        ? "border-primary bg-white shadow-lg ring-2 ring-primary/20"
                                        : "border-slate-100 bg-white hover:border-primary/30 hover:shadow-md"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-bold text-lg ${isSelected ? "text-primary" : "text-slate-800"}`}>
                                            {servicio.nombre}
                                        </h4>
                                        <Badge variant={isSelected ? "default" : "secondary"} className={isSelected ? "bg-primary" : "bg-slate-100 text-slate-600"}>
                                            ${formatearPrecio(servicio.precioBase).replace("$", "")}
                                        </Badge>
                                    </div>

                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                        {servicio.descripcionCorta || "Servicio profesional garantizado con los mejores estándares de calidad."}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between text-xs text-slate-400 font-medium pt-3 border-t border-slate-50">
                                        <div className="flex items-center gap-1">
                                            <span className="capitalize">{servicio.categoria}</span>
                                            <span>•</span>
                                            <span>{servicio.duracionEstimada} min aprox</span>
                                        </div>
                                        {isSelected && (
                                            <span className="flex items-center gap-1 text-primary font-bold animate-in fade-in">
                                                Seleccionado <CheckCircle2 className="w-3 h-3" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
