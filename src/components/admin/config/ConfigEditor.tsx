
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { ColorPicker } from "@/components/ui/color-picker";
import { EditableList } from "@/components/admin/config/EditableList";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { StyleGridPicker } from "@/components/admin/config/StyleGridPicker";
import { Sparkles } from "lucide-react";
import { Palette, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { EmpresaConfig, DynamicStylesState } from "@/types/nuevos-tipos";

interface ConfigEditorProps {
    config: Partial<EmpresaConfig>;
    colors: { primary: string; secondary: string };
    setColors: (colors: { primary: string; secondary: string }) => void;
    styles: {
        buttonStyle: string;
        heroBadgeStyle: string;
        serviceCardStyle: string;
        fontStyle: string;
        heroTextAlign: string;
        heroShowImage: string;
        heroImagePosition: string;
        heroHeight: string;
        heroSpacing: string;
        buttonAnimation: string;
        heroOverlay: string;
        ctaBadgeStyle: string;
        ctaBadgeAnimation: string;
        catalogCardStyle: string;
        catalogGridCols: string;
        catalogShowImages: string;
        catalogLimit: string;
    };
    setStyles: (styles: any) => void;
    dynamicStyles: DynamicStylesState;
    teamList: any[];
    setTeamList: (list: any[]) => void;
    testimonialList: any[];
    setTestimonialList: (list: any[]) => void;
    handleChange: (key: keyof EmpresaConfig, value: any) => void;
}

export function ConfigEditor({
    config,
    colors,
    setColors,
    styles,
    setStyles,
    dynamicStyles,
    teamList,
    setTeamList,
    testimonialList,
    setTestimonialList,
    handleChange
}: ConfigEditorProps) {
    return (
        <div className="space-y-6">
            <TabsContent value="hero" className="mt-0 space-y-6">
                <Card className="border-0 shadow-md bg-white ring-1 ring-slate-100">
                    <CardHeader>
                        <CardTitle>Sección Hero</CardTitle>
                        <CardDescription>Configura el encabezado principal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-semibold text-slate-500">Título Principal</Label>
                                <Textarea
                                    value={config.heroTitulo || ""}
                                    onChange={e => handleChange('heroTitulo', e.target.value)}
                                    rows={2}
                                    className="font-bold text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-semibold text-slate-500">Subtítulo / Descripción</Label>
                                <Textarea
                                    value={config.heroDescripcion || ""}
                                    onChange={e => handleChange('heroDescripcion', e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-semibold text-slate-500">Imagen Principal</Label>
                                <ImageUploader
                                    value={config.heroImagen}
                                    onChange={url => handleChange('heroImagen', url)}
                                    aspectRatio="video"
                                    className="h-40"
                                />
                            </div>
                        </div>

                        {/* Visual Customization Accordion */}
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-indigo-500" />
                                    <h3 className="text-sm font-semibold text-slate-800">Personalización Visual</h3>
                                </div>
                                <Link href="/admin/configuracion/estilos">
                                    <Button variant="ghost" size="sm" className="text-xs h-7 text-indigo-600 hover:text-indigo-700">
                                        Ver Galería
                                        <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                                    </Button>
                                </Link>
                            </div>

                            <Accordion type="single" collapsible className="w-full bg-white">
                                {/* BUTTONS */}
                                <AccordionItem value="buttons">
                                    <AccordionTrigger className="px-4 hover:bg-slate-50/50 hover:no-underline">
                                        <span className="text-sm font-medium text-slate-700">🎨 Estilo de Botones</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="h-72 overflow-y-auto pr-2 pt-2">
                                            <StyleGridPicker
                                                value={styles.buttonStyle || "modern"}
                                                onChange={(val) => setStyles({ ...styles, buttonStyle: val })}
                                                columns={3}
                                                options={dynamicStyles.buttons.length > 0 ? dynamicStyles.buttons.map(s => ({
                                                    id: s.$id || s.id,
                                                    label: s.name.replace('Modern ', '').replace('Button ', '').replace('Glass ', ''),
                                                    raw: s
                                                })) : []}
                                                renderPreview={(opt) => {
                                                    const rawStyle = dynamicStyles.buttons.find(s => (s.$id || s.id) === opt.id);
                                                    if (rawStyle) {
                                                        return (
                                                            <button className={`${rawStyle.css_classes} px-3 py-1 text-[10px] rounded-md transition-all`}>
                                                                Button
                                                            </button>
                                                        );
                                                    }
                                                    return <div className="text-[10px]">Loading...</div>;
                                                }}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* BADGES */}
                                <AccordionItem value="badges">
                                    <AccordionTrigger className="px-4 hover:bg-slate-50/50 hover:no-underline">
                                        <span className="text-sm font-medium text-slate-700">🏷️ Estilo de Badges</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="h-64 overflow-y-auto pr-2 pt-2">
                                            <StyleGridPicker
                                                value={styles.heroBadgeStyle || "solid"}
                                                onChange={(val) => setStyles({ ...styles, heroBadgeStyle: val })}
                                                columns={3}
                                                options={dynamicStyles.badges.length > 0 ? dynamicStyles.badges.map(s => ({
                                                    id: s.$id || s.id,
                                                    label: s.name.replace('Badge ', ''),
                                                    raw: s
                                                })) : []}
                                                renderPreview={(opt) => {
                                                    const rawStyle = dynamicStyles.badges.find(s => (s.$id || s.id) === opt.id);
                                                    if (rawStyle) {
                                                        return (
                                                            <span className={`${rawStyle.css_classes} px-2 py-0.5 text-[10px] rounded-full`}>
                                                                New
                                                            </span>
                                                        );
                                                    }
                                                    return <div className="text-[10px]">Loading...</div>;
                                                }}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* CTA / DESCUENTO */}
                                <AccordionItem value="cta" className="border-b-0">
                                    <AccordionTrigger className="px-4 hover:bg-slate-50/50 hover:no-underline">
                                        <span className="text-sm font-medium text-slate-700">🎁 CTA Promocional</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-4 pt-2">
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase font-semibold text-slate-500">Texto Oferta</Label>
                                                <Input
                                                    value={config.ctaDescuento || ""}
                                                    onChange={(e) => handleChange("ctaDescuento", e.target.value)}
                                                    placeholder="Ej: -20% Primera Compra"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase font-semibold text-slate-500">Medalla / Icono</Label>
                                                <select
                                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    value={config.ctaDescuentoIcono || "Award"}
                                                    onChange={(e) => handleChange("ctaDescuentoIcono", e.target.value)}
                                                >
                                                    <option value="Award">Medalla</option>
                                                    <option value="Star">Estrella</option>
                                                    <option value="Zap">Rayo</option>
                                                    <option value="Sparkles">Destello</option>
                                                </select>
                                            </div>

                                            {/* Badge Style Picker */}
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase font-semibold text-slate-500">Estilo Visual del Badge</Label>
                                                <div className="h-48 overflow-y-auto pr-2 border rounded-lg p-2 bg-slate-50">
                                                    <StyleGridPicker
                                                        value={styles.ctaBadgeStyle || dynamicStyles.badges[0]?.$id}
                                                        onChange={(val) => setStyles({ ...styles, ctaBadgeStyle: val })}
                                                        columns={2}
                                                        options={dynamicStyles.badges.length > 0 ? dynamicStyles.badges.map(s => ({
                                                            id: s.$id || s.id,
                                                            label: s.name.replace('Badge ', ''),
                                                            raw: s
                                                        })) : []}
                                                        renderPreview={(opt) => {
                                                            const rawStyle = dynamicStyles.badges.find(s => (s.$id || s.id) === opt.id);
                                                            if (rawStyle) {
                                                                return (
                                                                    <span className={`${rawStyle.css_classes} px-2 py-0.5 text-[9px] rounded-full`}>
                                                                        Oferta
                                                                    </span>
                                                                );
                                                            }
                                                            return <div className="text-[10px]">...</div>;
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Animation Selector */}
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase font-semibold text-slate-500">Animación / Efecto</Label>
                                                <select
                                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    value={styles.ctaBadgeAnimation || "none"}
                                                    onChange={(e) => setStyles({ ...styles, ctaBadgeAnimation: e.target.value })}
                                                >
                                                    <option value="none">❌ Sin animación</option>
                                                    <option value="pulse">💓 Pulso constante</option>
                                                    <option value="bounce">⚡ Rebote</option>
                                                    <option value="ping">📡 Ping (onda)</option>
                                                    <option value="wiggle">🔔 Vibración</option>
                                                    <option value="glow">✨ Resplandor</option>
                                                </select>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* FONT SELECTION */}
                                <AccordionItem value="font">
                                    <AccordionTrigger className="px-4 hover:bg-slate-50/50 hover:no-underline">
                                        <span className="text-sm font-medium text-slate-700">📝 Tipograf ía</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500">Familia de Fuente</Label>
                                            <select
                                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={styles.fontStyle || "sans"}
                                                onChange={(e) => setStyles({ ...styles, fontStyle: e.target.value })}
                                            >
                                                <option value="sans">Sans-Serif (Moderna/Inter)</option>
                                                <option value="serif">Serif (Clásica/Elegante)</option>
                                                <option value="mono">Monospace (Código/Tech)</option>
                                                <option value="display">Display (Títulos Grandes)</option>
                                                <option value="handwriting">Handwriting (Manuscrita)</option>
                                            </select>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* TEXT ALIGNMENT */}
                                <AccordionItem value="text-align">
                                    <AccordionTrigger className="px-4 hover:bg-slate-50/50 hover:no-underline">
                                        <span className="text-sm font-medium text-slate-700">📐 Alineación del Texto</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500">Posición del Contenido</Label>
                                            <select
                                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={styles.heroTextAlign || "center"}
                                                onChange={(e) => setStyles({ ...styles, heroTextAlign: e.target.value })}
                                            >
                                                <option value="left">⬅️ Izquierda</option>
                                                <option value="center">⬆️ Centro</option>
                                                <option value="right">➡️ Derecha</option>
                                            </select>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* IMAGE VISIBILITY */}
                                <AccordionItem value="image-visibility">
                                    <AccordionTrigger className="px-4 hover:bg-slate-50/50 hover:no-underline">
                                        <span className="text-sm font-medium text-slate-700">🖼️ Mostrar Imagen</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500">Visibilidad</Label>
                                            <select
                                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={styles.heroShowImage || "yes"}
                                                onChange={(e) => setStyles({ ...styles, heroShowImage: e.target.value })}
                                            >
                                                <option value="yes">✅ Sí, mostrar imagen</option>
                                                <option value="no">❌ No, solo texto</option>
                                            </select>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* IMAGE POSITION */}
                                <AccordionItem value="image-position">
                                    <AccordionTrigger className="px-4 hover:bg-slate-50/50 hover:no-underline">
                                        <span className="text-sm font-medium text-slate-700">📍 Posición de la Imagen</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500">Ubicación</Label>
                                            <select
                                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={styles.heroImagePosition || "background"}
                                                onChange={(e) => setStyles({ ...styles, heroImagePosition: e.target.value })}
                                            >
                                                <option value="background">🌄 Fondo (Detrás del texto)</option>
                                                <option value="left">⬅️ Izquierda (2 columnas)</option>
                                                <option value="right">➡️ Derecha (2 columnas)</option>
                                                <option value="top">⬆️ Arriba (Apilado)</option>
                                            </select>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* SECTION HEIGHT */}
                                <AccordionItem value="section-height">
                                    <AccordionTrigger className="px-4 hover:bg-slate-50/50 hover:no-underline">
                                        <span className="text-sm font-medium text-slate-700">📏 Altura de Sección</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500">Tamaño Vertical</Label>
                                            <select
                                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={styles.heroHeight || "normal"}
                                                onChange={(e) => setStyles({ ...styles, heroHeight: e.target.value })}
                                            >
                                                <option value="compact">📦 Compacta (60vh)</option>
                                                <option value="normal">📐 Normal (80vh)</option>
                                                <option value="large">📏 Grande (90vh)</option>
                                                <option value="fullscreen">🖥️ Pantalla Completa (100vh)</option>
                                            </select>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* SPACING */}
                                <AccordionItem value="spacing">
                                    <AccordionTrigger className="px-4 hover:bg-slate-50/50 hover:no-underline">
                                        <span className="text-sm font-medium text-slate-700">↔️ Espaciado</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500">Padding Interno</Label>
                                            <select
                                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={styles.heroSpacing || "normal"}
                                                onChange={(e) => setStyles({ ...styles, heroSpacing: e.target.value })}
                                            >
                                                <option value="compact">🔹 Compacto (Ajustado)</option>
                                                <option value="normal">🔸 Normal (Balanceado)</option>
                                                <option value="wide">🔶 Amplio (Espacioso)</option>
                                            </select>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* BUTTON ANIMATION */}
                                <AccordionItem value="animation">
                                    <AccordionTrigger className="px-4 hover:bg-slate-50/50 hover:no-underline">
                                        <span className="text-sm font-medium text-slate-700">✨ Animación de Botones</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500">Efecto Visual</Label>
                                            <select
                                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={styles.buttonAnimation || "none"}
                                                onChange={(e) => setStyles({ ...styles, buttonAnimation: e.target.value })}
                                            >
                                                <option value="none">❌ Ninguno</option>
                                                <option value="pulse">💓 Pulso (Suave)</option>
                                                <option value="bounce">⚡ Rebote (Enérgico)</option>
                                                <option value="shine">✨ Brillo (Elegante)</option>
                                                <option value="wiggle">🔔 Vibración (Llamativo)</option>
                                                <option value="float">☁️ Flotante (Sutil)</option>
                                                <option value="glow">🌟 Resplandor</option>
                                                <option value="shake">📳 Temblor</option>
                                            </select>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* OVERLAY */}
                                <AccordionItem value="overlay" className="border-b-0">
                                    <AccordionTrigger className="px-4 hover:bg-slate-50/50 hover:no-underline">
                                        <span className="text-sm font-medium text-slate-700">🌈 Overlay de Imagen</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500">Patrón de Fondo</Label>
                                            <select
                                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={styles.heroOverlay || "none"}
                                                onChange={(e) => setStyles({ ...styles, heroOverlay: e.target.value })}
                                            >
                                                <option value="none">🚫 Ninguno</option>
                                                <option value="dots">⚪ Puntos</option>
                                                <option value="grid">🔲 Cuadrícula</option>
                                                <option value="aurora">🌌 Aurora</option>
                                                <option value="noise">📺 Ruido / Grano</option>
                                                <option value="circuit">🔌 Circuito</option>
                                                <option value="waves">🌊 Ondas</option>
                                                <option value="vignette">📷 Viñeta</option>
                                                <option value="diagonal">📐 Líneas Diagonales</option>
                                                <option value="hexagon">⬡ Hexágonos</option>
                                            </select>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="servicios" className="space-y-6 mt-0">
                <Card className="border-0 shadow-md bg-white ring-1 ring-slate-100">
                    <CardHeader>
                        <CardTitle className="text-lg">Personalización del Catálogo</CardTitle>
                        <CardDescription>Configura cómo se muestran tus productos/servicios</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* CARD STYLE PICKER */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">🎨 Estilo de Tarjetas</Label>
                            <div className="h-60 overflow-y-auto pr-2 border rounded-lg p-3 bg-slate-50">
                                <StyleGridPicker
                                    value={styles.catalogCardStyle || dynamicStyles.cards[0]?.$id}
                                    onChange={(val) => setStyles({ ...styles, catalogCardStyle: val })}
                                    columns={2}
                                    options={dynamicStyles.cards.length > 0 ? dynamicStyles.cards.map(s => ({
                                        id: s.$id || s.id,
                                        label: s.name.replace('Card ', ''),
                                        raw: s
                                    })) : []}
                                    renderPreview={(opt) => {
                                        const rawStyle = dynamicStyles.cards.find(s => (s.$id || s.id) === opt.id);
                                        if (rawStyle) {
                                            return (
                                                <div className={`${rawStyle.css_classes} p-2 text-[9px]`}>
                                                    <div className="font-bold mb-1">Producto</div>
                                                    <div className="text-[8px]">$1,250</div>
                                                </div>
                                            );
                                        }
                                        return <div className="text-[10px]">...</div>;
                                    }}
                                />
                            </div>
                        </div>

                        {/* GRID LAYOUT */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">📐 Columnas del Grid</Label>
                            <select
                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={styles.catalogGridCols || "3"}
                                onChange={(e) => setStyles({ ...styles, catalogGridCols: e.target.value })}
                            >
                                <option value="2">⚏ 2 Columnas (Grande)</option>
                                <option value="3">⚏⚏ 3 Columnas (Balanceado)</option>
                                <option value="4">⚏⚏⚏ 4 Columnas (Compacto)</option>
                            </select>
                        </div>

                        {/* SHOW IMAGES */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">🖼️ Mostrar Imágenes de Productos</Label>
                            <select
                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={styles.catalogShowImages || "yes"}
                                onChange={(e) => setStyles({ ...styles, catalogShowImages: e.target.value })}
                            >
                                <option value="yes">✅ Sí, mostrar imágenes</option>
                                <option value="no">❌ No, solo texto</option>
                            </select>
                        </div>

                        {/* PRODUCT LIMIT */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">🔢 Productos a Mostrar</Label>
                            <select
                                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={styles.catalogLimit || "6"}
                                onChange={(e) => setStyles({ ...styles, catalogLimit: e.target.value })}
                            >
                                <option value="4">4 productos</option>
                                <option value="6">6 productos</option>
                                <option value="8">8 productos</option>
                                <option value="12">12 productos</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6 mt-0">
                <Card className="border-0 shadow-md bg-white ring-1 ring-slate-100">
                    <CardHeader>
                        <CardTitle className="text-lg">Cifras de Impacto</CardTitle>
                        <CardDescription>Números que generan confianza</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { label: "Clientes", key: "statClientes", type: "number" },
                            { label: "Servicios", key: "statServicios", type: "number" },
                            { label: "Profesionales", key: "statProfesionales", type: "number" },
                            { label: "Satisfacción", key: "statSatisfaccion", type: "text" },
                        ].map((stat) => (
                            <div key={stat.key} className="space-y-2">
                                <Label className="text-xs uppercase font-semibold text-slate-500">{stat.label}</Label>
                                <Input
                                    type={stat.type}
                                    value={(config as any)[stat.key] || ""}
                                    onChange={(e) => {
                                        const value = stat.type === "number"
                                            ? (e.target.value === "" ? 0 : parseInt(e.target.value) || 0)
                                            : e.target.value;
                                        handleChange(stat.key as keyof EmpresaConfig, value);
                                    }}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="cta" className="space-y-6 mt-0">
                <Card className="border-0 shadow-md bg-white ring-1 ring-slate-100">
                    <CardHeader>
                        <CardTitle className="text-lg">Footer CTA</CardTitle>
                        <CardDescription>Llamada a la acción al final de la página</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-500 uppercase font-semibold">Título</Label>
                            <Input
                                value={config.ctaFinalTitulo || ""}
                                onChange={(e) => handleChange("ctaFinalTitulo", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-500 uppercase font-semibold">Descripción</Label>
                            <Textarea
                                value={config.ctaFinalSubtitulo || ""}
                                onChange={(e) => handleChange("ctaFinalSubtitulo", e.target.value)}
                                rows={2}
                            />
                        </div>

                        {/* Button Style Pickers */}
                        <div className="space-y-2">
                            <Label className="text-xs text-slate-500 uppercase font-semibold">Estilo Botón Primario</Label>
                            <div className="h-48 overflow-y-auto pr-2 border rounded-lg p-2 bg-slate-50">
                                <StyleGridPicker
                                    value={(styles as any).ctaFinalButtonPrimary || dynamicStyles.buttons[0]?.$id}
                                    onChange={(val) => setStyles({ ...styles, ctaFinalButtonPrimary: val } as any)}
                                    columns={2}
                                    options={dynamicStyles.buttons.length > 0 ? dynamicStyles.buttons.map(s => ({
                                        id: s.$id || s.id,
                                        label: s.name.replace('Button ', ''),
                                        raw: s
                                    })) : []}
                                    renderPreview={(opt) => {
                                        const rawStyle = dynamicStyles.buttons.find(s => (s.$id || s.id) === opt.id);
                                        if (rawStyle) {
                                            return (
                                                <button className={`${rawStyle.css_classes} px-3 py-1.5 text-xs rounded-md`}>
                                                    Primario
                                                </button>
                                            );
                                        }
                                        return <div className="text-[10px]">Loading...</div>;
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-slate-500 uppercase font-semibold">Estilo Botón Secundario</Label>
                            <div className="h-48 overflow-y-auto pr-2 border rounded-lg p-2 bg-slate-50">
                                <StyleGridPicker
                                    value={(styles as any).ctaFinalButtonSecondary || dynamicStyles.buttons[1]?.$id}
                                    onChange={(val) => setStyles({ ...styles, ctaFinalButtonSecondary: val } as any)}
                                    columns={2}
                                    options={dynamicStyles.buttons.length > 0 ? dynamicStyles.buttons.map(s => ({
                                        id: s.$id || s.id,
                                        label: s.name.replace('Button ', ''),
                                        raw: s
                                    })) : []}
                                    renderPreview={(opt) => {
                                        const rawStyle = dynamicStyles.buttons.find(s => (s.$id || s.id) === opt.id);
                                        if (rawStyle) {
                                            return (
                                                <button className={`${rawStyle.css_classes} px-3 py-1.5 text-xs rounded-md`}>
                                                    Secundario
                                                </button>
                                            );
                                        }
                                        return <div className="text-[10px]">Loading...</div>;
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-slate-500 uppercase font-semibold">Imagen Fondo</Label>
                            <ImageUploader
                                value={config.ctaFinalImagen}
                                onChange={(url) => handleChange("ctaFinalImagen", url)}
                                aspectRatio="video"
                                className="h-32"
                            />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-6 mt-0">
                <Card className="border-0 shadow-md bg-white ring-1 ring-slate-100">
                    <CardHeader>
                        <CardTitle className="text-lg">Identidad de Marca</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <ColorPicker
                                label="Color Primario"
                                value={colors.primary}
                                onChange={(v) => setColors({ ...colors, primary: v })}
                            />
                            <ColorPicker
                                label="Color Secundario"
                                value={colors.secondary}
                                onChange={(v) => setColors({ ...colors, secondary: v })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-semibold text-slate-500">Logo</Label>
                            <ImageUploader
                                value={config.logo}
                                onChange={(url) => handleChange("logo", url)}
                                aspectRatio="auto"
                                className="h-32"
                            />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="equipo" className="space-y-6 mt-0">
                <Card className="border-0 shadow-md bg-white ring-1 ring-slate-100">
                    <CardContent className="pt-6">
                        <EditableList
                            title="Miembros del Equipo"
                            emptyMessage="Sin miembros del equipo."
                            items={teamList}
                            onItemsChange={setTeamList}
                            fields={[
                                { key: "name", label: "Nombre", type: "text" },
                                { key: "role", label: "Cargo", type: "text" },
                                { key: "image", label: "Foto", type: "image" }
                            ]}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="catalogo" className="space-y-6 mt-0">
                <Card className="border-0 shadow-md bg-white ring-1 ring-slate-100">
                    <CardHeader>
                        <CardTitle>Fuente del Catálogo</CardTitle>
                        <CardDescription>Decide qué mostrar en la sección "Servicios"</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-semibold text-slate-500">Diseño Tarjetas</Label>
                            <select
                                value={styles.serviceCardStyle || "clean"}
                                onChange={(e) => setStyles({ ...styles, serviceCardStyle: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="clean">Limpio (Clean)</option>
                                <option value="hover-lift">Hover Lift</option>
                                <option value="neo-border">Neo-Border</option>
                                <option value="glass-morphism">Glass</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-semibold text-slate-500">Origen de Datos</Label>
                            <select
                                value={config.catalogo_source || "servicios"}
                                onChange={(e) => handleChange("catalogo_source", e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="servicios">Servicios (Colección Servicios)</option>
                                <option value="productos">Productos (Tienda Online)</option>
                                <option value="manual">Manual (Selección Especial - Próximamente)</option>
                            </select>
                            <p className="text-xs text-slate-500">
                                {config.catalogo_source === 'productos'
                                    ? "Se mostrarán los productos destacados de tu tienda."
                                    : "Se mostrarán los servicios registrados en el sistema."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="testimonios" className="space-y-6 mt-0">
                <Card className="border-0 shadow-md bg-white ring-1 ring-slate-100">
                    <CardContent className="pt-6">
                        <EditableList
                            title="Testimonios"
                            emptyMessage="Sin testimonios."
                            items={testimonialList}
                            onItemsChange={setTestimonialList}
                            fields={[
                                { key: "author", label: "Cliente", type: "text" },
                                { key: "rating", label: "Estrellas", type: "number" },
                                { key: "content", label: "Opinión", type: "textarea" },
                                { key: "image", label: "Foto", type: "image" }
                            ]}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
        </div>
    );
}
