"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { obtenerConfiguracion, actualizarConfiguracion } from "@/lib/actions/configuracion";
import { obtenerEstilos } from "@/lib/actions/estilos";
import { obtenerMiembrosEquipo, crearMiembroEquipo, actualizarMiembroEquipo, eliminarMiembroEquipo } from "@/lib/actions/equipo";
import { obtenerTestimonios, crearTestimonio, actualizarTestimonio, eliminarTestimonio } from "@/lib/actions/testimonios";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { EmpresaConfig, DynamicStylesState } from "@/types/nuevos-tipos";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfigEditor } from "@/components/admin/config/ConfigEditor";
import { ConfigPreview } from "@/components/admin/config/ConfigPreview";

export default function ConfiguracionPaginaPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // State
    const [config, setConfig] = useState<Partial<EmpresaConfig>>({});
    const [colors, setColors] = useState({ primary: '#3b82f6', secondary: '#1e293b' }); // Defaults
    const [styles, setStyles] = useState({
        buttonStyle: 'modern',
        heroBadgeStyle: 'solid',
        serviceCardStyle: 'clean',
        fontStyle: 'sans',
        // Individual layout controls (replacing heroLayout)
        heroTextAlign: 'center',        // left | center | right
        heroShowImage: 'yes',            // yes | no
        heroImagePosition: 'background', // left | right | background | top
        heroHeight: 'normal',            // compact | normal | large | fullscreen
        heroSpacing: 'normal',           // compact | normal | wide
        buttonAnimation: 'none',
        heroOverlay: 'none',
        // Promotional CTA badge controls
        ctaBadgeStyle: '',               // Dynamic badge style ID
        ctaBadgeAnimation: 'none',       // none | pulse | bounce | ping | wiggle | glow
        // Catalog controls
        catalogCardStyle: '',            // Dynamic card style ID
        catalogGridCols: '3',            // 2 | 3 | 4
        catalogShowImages: 'yes',        // yes | no
        catalogLimit: '6',               // 4 | 6 | 8 | 12
        // Team & Testimonials card styles
        teamCardStyle: '',               // Dynamic card style ID
        testimonialCardStyle: '',        // Dynamic card style ID
    });
    const [dynamicStyles, setDynamicStyles] = useState<DynamicStylesState>({ buttons: [], badges: [], cards: [] });
    const [teamList, setTeamList] = useState<any[]>([]);
    const [testimonialList, setTestimonialList] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [configData, stylesResult, teamResult, testimonialsResult] = await Promise.all([
                obtenerConfiguracion(),
                obtenerEstilos(),
                obtenerMiembrosEquipo(),
                obtenerTestimonios()
            ]);



            if (configData) {
                setConfig(configData);
                // Parse branding (colors)
                if ((configData as any).branding) {
                    try {
                        const parsed = JSON.parse((configData as any).branding);
                        setColors({ primary: parsed.primary || '#3b82f6', secondary: parsed.secondary || '#8b5cf6' });
                    } catch (e) { }
                }
                // Load team from collection
                if (teamResult.success && teamResult.data) {
                    setTeamList(teamResult.data);
                }
                // Load testimonials from collection
                if (testimonialsResult.success && testimonialsResult.data) {
                    setTestimonialList(testimonialsResult.data);

                }
                // Parse branding_styles
                if (configData.branding_styles) {
                    try {
                        const parsed = JSON.parse(configData.branding_styles);
                        setStyles(prev => ({ ...prev, ...parsed }));
                    } catch (e) {
                        console.error('Error parsing branding_styles:', e);
                    }
                }
            }

            // Load dynamic styles - ALWAYS ensure arrays
            if (stylesResult.success && stylesResult.data) {
                const allStyles = stylesResult.data;
                const categorized = {
                    buttons: allStyles.filter((s: any) => s.type === 'button') || [],
                    badges: allStyles.filter((s: any) => s.type === 'badge') || [],
                    cards: allStyles.filter((s: any) => s.type === 'card') || []
                };

                setDynamicStyles(categorized);
            } else {
                console.warn('⚠️ Failed to load styles, using empty arrays');
                setDynamicStyles({ buttons: [], badges: [], cards: [] });
            }
        } catch (error) {
            console.error('Error loading configuration:', error);
            toast({ title: "Error", description: "No se pudo cargar la configuración", variant: "destructive" });
            // Ensure dynamicStyles has arrays even on error
            setDynamicStyles({ buttons: [], badges: [], cards: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: keyof EmpresaConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    // Team sync wrapper
    const handleTeamChange = async (newTeam: any[]) => {
        setTeamList(newTeam);

        // Sync with Appwrite
        try {
            const promises = newTeam.map(async (member) => {
                if (member.$id) {
                    // Update existing
                    return actualizarMiembroEquipo(member.$id, member);
                } else {
                    // Create new
                    return crearMiembroEquipo({ ...member, active: true, order: 0 });
                }
            });
            await Promise.all(promises);
        } catch (error) {
            console.error('Error syncing team:', error);
        }
    };

    // Testimonials sync wrapper
    const handleTestimonialsChange = async (newTestimonials: any[]) => {
        setTestimonialList(newTestimonials);

        // Sync with Appwrite
        try {
            const promises = newTestimonials.map(async (testimonial) => {
                if (testimonial.$id) {
                    // Update existing
                    return actualizarTestimonio(testimonial.$id, testimonial);
                } else {
                    // Create new
                    return crearTestimonio({ ...testimonial, active: true, order: 0 });
                }
            });
            await Promise.all(promises);
        } catch (error) {
            console.error('Error syncing testimonials:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Create plain object instead of FormData
            const submissionData: any = {
                ...config,
                branding: JSON.stringify(colors),
                branding_styles: JSON.stringify(styles),
                // team_members and testimonials now in dedicated collections - not saved here
            };

            await actualizarConfiguracion(submissionData);
            toast({ title: "Guardado", description: "Cambios guardados correctamente" });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Falló el guardado", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // Helper to get resolved styles for preview
    const getResolvedStyles = () => {
        const btnStyle = dynamicStyles.buttons.find(s => (s.$id || s.id) === styles.buttonStyle);
        const badgeStyle = dynamicStyles.badges.find(s => (s.$id || s.id) === styles.heroBadgeStyle);
        const ctaBadgeStyle = dynamicStyles.badges.find(s => (s.$id || s.id) === styles.ctaBadgeStyle);
        const catalogCardStyle = dynamicStyles.cards.find(s => (s.$id || s.id) === styles.catalogCardStyle);
        const ctaBtnPrimary = dynamicStyles.buttons.find(s => (s.$id || s.id) === (styles as any).ctaFinalButtonPrimary);
        const ctaBtnSecondary = dynamicStyles.buttons.find(s => (s.$id || s.id) === (styles as any).ctaFinalButtonSecondary);
        return {
            buttonCss: btnStyle?.css_classes,
            badgeCss: badgeStyle?.css_classes,
            ctaBadgeCss: ctaBadgeStyle?.css_classes,
            catalogCardCss: catalogCardStyle?.css_classes,
            ctaButtonPrimaryCss: ctaBtnPrimary?.css_classes,
            ctaButtonSecondaryCss: ctaBtnSecondary?.css_classes,
        };
    };
    const resolvedStyles = getResolvedStyles();

    const previewConfig = {
        ...config,
        colors,
        branding: JSON.stringify(colors), // Helper for compatibility with legacy components expecting string
        branding_styles: JSON.stringify(styles), // Inject live styles for preview
        team_members: JSON.stringify(teamList), // For previewConfig compatibility
        testimonials: JSON.stringify(testimonialList), // For previewConfig compatibility
        _teamList: teamList, // Direct array access if needed
        _testimonialList: testimonialList // Direct array access if needed
    };



    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

    return (
        <div className="container mx-auto py-6 max-w-[1800px] px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Editor de Landing Page</h1>
                    <p className="text-slate-500">Personaliza cada aspecto de tu página de presentación.</p>
                </div>
                <Link href="/admin">
                    <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Volver</Button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="relative pb-24">
                {/* Main Content Area - Tabs Wrapper */}
                <Tabs defaultValue="hero" className="space-y-6">
                    {/* Tab Navigation */}
                    <div className="bg-white p-2 rounded-lg border shadow-sm mb-6">
                        <TabsList className="bg-slate-100 p-1 rounded-lg w-full grid grid-cols-7">
                            <TabsTrigger value="hero" className="data-[state=active]:bg-white">Sección Hero</TabsTrigger>
                            <TabsTrigger value="servicios" className="data-[state=active]:bg-white">Catálogo</TabsTrigger>
                            <TabsTrigger value="stats" className="data-[state=active]:bg-white">Cifras</TabsTrigger>
                            <TabsTrigger value="cta" className="data-[state=active]:bg-white">CTA Final</TabsTrigger>
                            <TabsTrigger value="equipo" className="data-[state=active]:bg-white">Equipo</TabsTrigger>
                            <TabsTrigger value="testimonios" className="data-[state=active]:bg-white">Testimonios</TabsTrigger>
                            <TabsTrigger value="branding" className="data-[state=active]:bg-white">Branding</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="grid grid-cols-[1fr_1fr] gap-6">
                        {/* Left Panel - Editor */}
                        <div className="space-y-6">
                            <ConfigEditor
                                config={config}
                                colors={colors}
                                setColors={setColors}
                                styles={styles}
                                setStyles={setStyles}
                                dynamicStyles={dynamicStyles}
                                teamList={teamList}
                                setTeamList={handleTeamChange}
                                testimonialList={testimonialList}
                                setTestimonialList={handleTestimonialsChange}
                                handleChange={handleChange}
                            />
                        </div>

                        {/* Right Panel - Live Preview */}
                        <div>
                            <ConfigPreview previewConfig={previewConfig} resolvedStyles={resolvedStyles} />
                        </div>
                    </div>
                </Tabs>

                {/* Floating Action Bar */}
                <div className="fixed bottom-6 right-6 flex items-center gap-4 z-50">
                    <Button
                        type="submit"
                        disabled={saving}
                        size="lg"
                        className="rounded-full bg-slate-900 hover:bg-black text-white px-8 shadow-2xl shadow-slate-900/40 transition-all hover:-translate-y-1 hover:shadow-xl border-2 border-white/20"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5 mr-2" />
                                Guardar Todo
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
