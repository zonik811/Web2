"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Award, Star, Zap, Phone, FileText } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import type { EmpresaConfig } from "@/types/nuevos-tipos";
import { getAnimationClasses, ButtonAnimation } from "@/lib/design-system/components/animation-variants";

import { getButtonClasses, ButtonStyle } from "@/lib/design-system/components/button-variants";
import { getBadgeClasses, BadgeStyle } from "@/lib/design-system/components/badge-variants";
import { getOverlayClasses, OverlayStyle } from "@/lib/design-system/components/overlay-variants";
import Image from "next/image";

const ICON_MAP: any = {
    Award, Star, Zap, Phone, FileText, Sparkles
};

interface HeroSectionProps {
    previewConfig?: Partial<EmpresaConfig>;
    customStyles?: {
        buttonCss?: string;
        badgeCss?: string;
    };
}

export function HeroSection({ previewConfig, customStyles }: HeroSectionProps) {
    const { config: globalConfig } = useCompany();
    const config = previewConfig || globalConfig;

    // Parse Styles (including granular layout controls)
    let styles: any = {
        buttonStyle: "modern",
        fontStyle: "sans",
        heroBadgeStyle: "solid",
        heroOverlay: "none",
        buttonAnimation: "none",
        // Granular layout controls
        heroTextAlign: "center",
        heroShowImage: "yes",
        heroImagePosition: "background",
        heroHeight: "normal",
        heroSpacing: "normal"
    };
    try {
        if (config?.branding_styles) {
            const parsed = JSON.parse(config.branding_styles);
            styles = { ...styles, ...parsed };
        }
    } catch (e) { }

    const fontClasses = {
        sans: "font-sans",
        serif: "font-serif",
        mono: "font-mono",
        display: "font-display",
        handwriting: "font-handwriting"
    };

    // Map granular controls to CSS classes
    const heightClasses = {
        compact: "h-[60vh]",
        normal: "h-[80vh]",
        large: "h-[90vh]",
        fullscreen: "h-[100vh]"
    };

    const spacingClasses = {
        compact: "py-8",
        normal: "py-16",
        wide: "py-24"
    };

    const textAlignClasses = {
        left: "text-left",
        center: "text-center",
        right: "text-right"
    };

    const showImage = styles.heroShowImage === "yes";
    const imagePos = styles.heroImagePosition || "background";
    const isBackgroundImage = imagePos === "background";
    const isSideImage = imagePos === "left" || imagePos === "right";

    return (
        <section className={`relative ${heightClasses[styles.heroHeight as keyof typeof heightClasses] || heightClasses.normal} flex items-center overflow-hidden ${fontClasses[styles.fontStyle as keyof typeof fontClasses] || fontClasses.sans}`}>
            {/* Background Image (only if background mode) */}
            {showImage && isBackgroundImage && (
                <div className="absolute inset-0 z-0">
                    {config?.heroImagen ? (
                        <img
                            src={config.heroImagen}
                            alt="Background"
                            className="w-full h-full object-cover opacity-60"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900" />
                    )}
                    {/* Pattern Overlay */}
                    <div className={getOverlayClasses((styles.heroOverlay || 'none') as OverlayStyle)} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
                </div>
            )}

            {/* No image background fallback */}
            {!showImage || !isBackgroundImage ? (
                <div className="absolute inset-0 z-0">
                    <div className="w-full h-full bg-slate-900" />
                    <div className={getOverlayClasses((styles.heroOverlay || 'none') as OverlayStyle)} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
                </div>
            ) : null}

            <div className={`container mx-auto px-4 relative z-10 ${spacingClasses[styles.heroSpacing as keyof typeof spacingClasses] || spacingClasses.normal}`}>
                <div className={`max-w-6xl mx-auto ${isSideImage ? 'grid md:grid-cols-2 gap-12 items-center' : ''}`}>

                    {/* Side Image Left */}
                    {showImage && imagePos === "left" && config?.heroImagen && (
                        <div className="order-1">
                            <img src={config.heroImagen} alt="Hero" className="w-full h-auto rounded-2xl shadow-2xl" />
                        </div>
                    )}

                    {/* Content */}
                    <div className={`${textAlignClasses[styles.heroTextAlign as keyof typeof textAlignClasses] || textAlignClasses.center} ${isSideImage && imagePos === 'left' ? 'order-2' : isSideImage && imagePos === 'right' ? 'order-1' : ''}`}>
                        {config?.heroBadge && (
                            <div className={`mb-6 flex ${styles.heroTextAlign === 'center' ? 'justify-center' : styles.heroTextAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                                <Badge className={customStyles?.badgeCss || getBadgeClasses((styles.heroBadgeStyle || 'solid') as BadgeStyle)}>
                                    {config.heroBadge}
                                </Badge>
                            </div>
                        )}

                        <h1 className={`font-bold text-white mb-6 leading-tight text-5xl md:text-7xl`}>
                            {config?.heroTitulo || config?.slogan || "Potencia Tu Negocio"}
                        </h1>

                        <p className={`text-xl text-gray-300 max-w-2xl mb-10 ${styles.heroTextAlign === 'center' ? 'mx-auto' : ''}`}>
                            {config?.heroDescripcion || "Soluciones digitales a medida para hacer crecer tu empresa."}
                        </p>

                        <div className={`flex flex-col sm:flex-row gap-4 ${styles.heroTextAlign === 'center' ? 'justify-center' : styles.heroTextAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                            {/* Button 1: Ver Catálogo (Hardcoded) */}
                            <Link href="/catalogo">
                                <button
                                    className={`${customStyles?.buttonCss ? customStyles.buttonCss + ' px-8 py-3 rounded-lg' : getButtonClasses('primary', (styles.buttonStyle || 'modern') as ButtonStyle, 'lg')} w-[180px] ${getAnimationClasses((styles.buttonAnimation || 'none') as ButtonAnimation)}`}
                                >
                                    Ver Catálogo
                                </button>
                            </Link>

                            {/* Button 2: Agendar Cita (Hardcoded) */}
                            <Link href="/agendar">
                                <button
                                    className={`${customStyles?.buttonCss ? customStyles.buttonCss + ' opacity-90 px-8 py-3 rounded-lg' : getButtonClasses('secondary', (styles.buttonStyle || 'modern') as ButtonStyle, 'lg')} w-[180px] ${getAnimationClasses((styles.buttonAnimation || 'none') as ButtonAnimation)}`}
                                >
                                    Agendar Cita
                                </button>
                            </Link>
                        </div>

                        {config?.ctaDescuento && (
                            <div className={`mt-8 flex items-center gap-2 ${styles.heroTextAlign === 'center' ? 'justify-center' : styles.heroTextAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                                {(() => {
                                    // Get animation classes for badge
                                    const badgeAnimations: Record<string, string> = {
                                        none: "",
                                        pulse: "animate-pulse",
                                        bounce: "animate-bounce",
                                        ping: "relative after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-current after:opacity-75",
                                        wiggle: "hover:animate-[wiggle_1s_ease-in-out_infinite]",
                                        glow: "animate-pulse shadow-lg shadow-yellow-400/50"
                                    };

                                    const animClass = badgeAnimations[styles.ctaBadgeAnimation as keyof typeof badgeAnimations] || "";

                                    // Get badge style CSS
                                    const badgeStyleCss = (customStyles as any)?.ctaBadgeCss || 'bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full';

                                    return (
                                        <span className={`flex items-center ${badgeStyleCss} ${animClass}`}>
                                            {(() => {
                                                const IconName = config.ctaDescuentoIcono || 'Award';
                                                const Icon = ICON_MAP[IconName] || Award;
                                                return <Icon className="mr-2 h-4 w-4 inline-block" />;
                                            })()}
                                            {config.ctaDescuento}
                                        </span>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Side Image Right */}
                    {showImage && imagePos === "right" && config?.heroImagen && (
                        <div className="order-2">
                            <img src={config.heroImagen} alt="Hero" className="w-full h-auto rounded-2xl shadow-2xl" />
                        </div>
                    )}

                    {/* Top Image */}
                    {showImage && imagePos === "top" && config?.heroImagen && (
                        <div className="col-span-full mb-8">
                            <img src={config.heroImagen} alt="Hero" className="w-full max-h-[300px] object-cover rounded-2xl shadow-2xl" />
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
}
