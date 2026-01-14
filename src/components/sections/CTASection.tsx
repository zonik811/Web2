"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import type { EmpresaConfig } from "@/types/nuevos-tipos";

interface CTASectionProps {
    previewConfig?: Partial<EmpresaConfig>;
    customStyles?: {
        ctaButtonPrimaryCss?: string;
        ctaButtonSecondaryCss?: string;
    };
}

export function CTASection({ previewConfig, customStyles }: CTASectionProps) {
    const { config: globalConfig } = useCompany();
    const config = previewConfig || globalConfig;

    // Get button styles - combine dynamic style with base sizing classes
    const primaryBtnClass = `inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg transition-all ${customStyles?.ctaButtonPrimaryCss || "bg-white text-gray-900 hover:bg-gray-100"}`;
    const secondaryBtnClass = `inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg transition-all ${customStyles?.ctaButtonSecondaryCss || "bg-white/10 text-white hover:bg-white/20 border-2 border-white/30"}`;

    return (
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src={config?.ctaFinalImagen || "/images/hero_cleaning_1767812896737.png"}
                    alt="Contacto"
                    fill
                    className="object-cover brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center text-white">
                <h2 className="text-5xl md:text-6xl font-bold mb-6">
                    {config?.ctaFinalTitulo || "¿Listo para Encontrar tus Repuestos?"}
                </h2>
                <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
                    {config?.ctaFinalSubtitulo || "Contáctanos hoy y obtén los mejores repuestos para tu maquinaria diesel"}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link href="/agendar">
                        <button className={primaryBtnClass}>
                            <Sparkles className="mr-2 h-6 w-6 inline" />
                            Contactar Ahora
                        </button>
                    </Link>
                    <Link href="/login">
                        <button className={secondaryBtnClass}>
                            Ingresar
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
