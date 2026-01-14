"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import { obtenerServicios, obtenerProductosDestacados } from "@/lib/actions/catalogo";
import type { EmpresaConfig } from "@/types/nuevos-tipos";
import { useCompany } from "@/context/CompanyContext";

import { getCardClasses, CardStyle } from "@/lib/design-system/components/card-variants";
import { getButtonClasses, ButtonStyle } from "@/lib/design-system/components/button-variants";

interface ServicesSectionProps {
    previewConfig?: Partial<EmpresaConfig>;
    customStyles?: {
        catalogCardCss?: string;
    };
}

export function ServicesSection({ previewConfig, customStyles }: ServicesSectionProps) {
    const { config: globalConfig } = useCompany();
    const config = previewConfig || globalConfig;

    // Parse Styles
    let styles: any = {
        serviceCardStyle: "clean",
        buttonStyle: "modern",
        catalogGridCols: "3",
        catalogShowImages: "yes",
        catalogLimit: "6"
    };
    try {
        if (config?.branding_styles) {
            const parsed = JSON.parse(config.branding_styles);
            styles = { ...styles, ...parsed };

        }
    } catch (e) {
        console.error('❌ Error parsing branding_styles in ServicesSection:', e);
    }

    const [servicios, setServicios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const source = config?.catalogo_source || 'productos'; // Changed default to 'productos'

    useEffect(() => {
        loadData();
    }, [source, styles.catalogLimit]); // Re-run when source or limit changes

    const loadData = async () => {
        setLoading(true);
        try {
            let data = [];
            if (source === 'servicios') {
                data = await obtenerServicios();
            } else {
                // Default: load productos (tienda)
                data = await obtenerProductosDestacados();
            }

            // Apply limit from styles
            const limit = parseInt(styles.catalogLimit || '6');
            setServicios(data.slice(0, limit));
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Grid column classes
    const gridColsMap: Record<string, string> = {
        '2': 'md:grid-cols-2',
        '3': 'md:grid-cols-3',
        '4': 'md:grid-cols-4'
    };
    const gridCols = gridColsMap[styles.catalogGridCols] || 'md:grid-cols-3';

    const showImages = styles.catalogShowImages === 'yes';

    return (
        <section id="servicios" className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                        {(config as any)?.catalogoTitulo || "Encuentra lo que Necesitas"}
                    </h2>
                    <p className="text-lg text-slate-600">
                        {(config as any)?.catalogoDescripcion || "Explora nuestra amplia gama de repuestos y accesorios de la más alta calidad para tu maquinaria."}
                    </p>
                </div>

                <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
                    {servicios.length > 0 ? (
                        servicios.map((servicio, index) => (
                            <div
                                key={index}
                                className={`p-6 flex flex-col items-center text-center ${customStyles?.catalogCardCss || getCardClasses((styles.serviceCardStyle || 'clean') as CardStyle)}`}
                            >
                                {showImages && servicio.imagen_url && (
                                    <img
                                        src={servicio.imagen_url}
                                        alt={servicio.nombre}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                    />
                                )}
                                {!servicio.imagen_url && (
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                                        <ShoppingBag className="h-6 w-6" />
                                    </div>
                                )}
                                <CardHeader className="w-full p-0 mb-4">
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{servicio.nombre}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{servicio.descripcion}</p>

                                    {/* Price */}
                                    {servicio.precio && (
                                        <p className="text-2xl font-bold text-primary mb-4">
                                            ${Number(servicio.precio).toLocaleString('es-CO')}
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent className="w-full p-0">
                                    <Link href="/tienda">
                                        <Button className={`w-full ${getButtonClasses('secondary', (styles.buttonStyle || 'modern') as ButtonStyle, 'md')}`} size="lg">
                                            Ver Detalles
                                        </Button>
                                    </Link>
                                </CardContent>
                            </div>
                        ))
                    ) : (
                        <div className={`col-span-${styles.catalogGridCols || '3'} text-center py-12`}>
                            <p className="text-gray-500">Cargando servicios...</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
