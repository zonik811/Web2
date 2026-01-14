"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/hooks/use-toast";
import { obtenerConfiguracion, actualizarConfiguracion } from "@/lib/actions/configuracion";
import { Loader2, Save, ArrowLeft, Building2, Info, Mail, Phone, MapPin, Globe } from "lucide-react";
import Link from "next/link";
import type { EmpresaConfig } from "@/types/nuevos-tipos";
import { ColorPicker } from "@/components/ui/color-picker";

export default function ConfiguracionEmpresaPage() {
    const [config, setConfig] = useState<Partial<EmpresaConfig>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await obtenerConfiguracion();
            if (data) {
                setConfig(data);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cargar la configuración",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const result = await actualizarConfiguracion(config);

            if (result.success) {
                toast({
                    title: "¡Éxito!",
                    description: "Configuración actualizada correctamente",
                });

                // Recargar página para ver cambios reflejados
                setTimeout(() => window.location.reload(), 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "No se pudo guardar la configuración",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof EmpresaConfig, value: string) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/configuracion">
                        <Button variant="ghost" size="icon" className="group rounded-full hover:bg-white hover:shadow-md transition-all">
                            <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración de Empresa</h1>
                        <p className="text-slate-500 mt-1">Información básica, contacto y branding</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-indigo-50/50 text-indigo-700 px-4 py-2 rounded-full border border-indigo-100 text-sm font-medium">
                    <Building2 className="h-4 w-4" />
                    <span>Perfil Corporativo</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-24">
                {/* Información Básica */}
                <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white ring-1 ring-slate-100 group">
                    <CardHeader className="border-b border-slate-50 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold text-slate-800">Información Básica</CardTitle>
                                <CardDescription>Datos generales de tu empresa</CardDescription>
                            </div>
                            <div className="p-2 bg-slate-100 rounded-xl text-slate-600 group-hover:scale-110 transition-transform">
                                <Info className="h-5 w-5" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 group/input">
                                <Label htmlFor="nombre" className="text-xs uppercase font-semibold text-slate-500 tracking-wider group-focus-within/input:text-primary transition-colors">Nombre *</Label>
                                <Input
                                    id="nombre"
                                    value={config.nombre || ""}
                                    onChange={(e) => handleChange("nombre", e.target.value)}
                                    required
                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all h-11"
                                    placeholder="Nombre corto"
                                />
                            </div>
                            <div className="space-y-2 group/input">
                                <Label htmlFor="nombreCompleto" className="text-xs uppercase font-semibold text-slate-500 tracking-wider group-focus-within/input:text-primary transition-colors">Nombre Completo (Razón Social)</Label>
                                <Input
                                    id="nombreCompleto"
                                    value={config.nombreCompleto || ""}
                                    onChange={(e) => handleChange("nombreCompleto", e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all h-11"
                                    placeholder="Nombre legal completo"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group/input">
                            <Label htmlFor="slogan" className="text-xs uppercase font-semibold text-slate-500 tracking-wider group-focus-within/input:text-primary transition-colors">Slogan</Label>
                            <Input
                                id="slogan"
                                value={config.slogan || ""}
                                onChange={(e) => handleChange("slogan", e.target.value)}
                                placeholder="Tu Socio en Repuestos Diesel"
                                className="bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all h-11"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contacto */}
                <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white ring-1 ring-slate-100 group">
                    <CardHeader className="border-b border-slate-50 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold text-slate-800">Información de Contacto</CardTitle>
                                <CardDescription>Datos de contacto visibles en la web</CardDescription>
                            </div>
                            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                                <Phone className="h-5 w-5" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 group/input">
                                <Label htmlFor="telefono" className="text-xs uppercase font-semibold text-slate-500 tracking-wider group-focus-within/input:text-primary transition-colors">Teléfono *</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="telefono"
                                        value={config.telefono || ""}
                                        onChange={(e) => handleChange("telefono", e.target.value)}
                                        required
                                        className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all h-11"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 group/input">
                                <Label htmlFor="whatsapp" className="text-xs uppercase font-semibold text-slate-500 tracking-wider group-focus-within/input:text-primary transition-colors">WhatsApp</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                    <Input
                                        id="whatsapp"
                                        value={config.whatsapp || ""}
                                        onChange={(e) => handleChange("whatsapp", e.target.value)}
                                        className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all h-11"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 group/input">
                            <Label htmlFor="email" className="text-xs uppercase font-semibold text-slate-500 tracking-wider group-focus-within/input:text-primary transition-colors">Email *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={config.email || ""}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    required
                                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group/input">
                            <Label htmlFor="direccion" className="text-xs uppercase font-semibold text-slate-500 tracking-wider group-focus-within/input:text-primary transition-colors">Dirección</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="direccion"
                                    value={config.direccion || ""}
                                    onChange={(e) => handleChange("direccion", e.target.value)}
                                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all h-11"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2 group/input">
                                <Label htmlFor="ciudad" className="text-xs uppercase font-semibold text-slate-500 tracking-wider group-focus-within/input:text-primary transition-colors">Ciudad</Label>
                                <Input
                                    id="ciudad"
                                    value={config.ciudad || ""}
                                    onChange={(e) => handleChange("ciudad", e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all h-11"
                                />
                            </div>
                            <div className="space-y-2 group/input">
                                <Label htmlFor="pais" className="text-xs uppercase font-semibold text-slate-500 tracking-wider group-focus-within/input:text-primary transition-colors">País</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="pais"
                                        value={config.pais || ""}
                                        onChange={(e) => handleChange("pais", e.target.value)}
                                        className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 transition-all h-11"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Branding */}
                <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white ring-1 ring-slate-100 group">
                    <CardHeader className="border-b border-slate-50 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold text-slate-800">Colores Corporativos</CardTitle>
                                <CardDescription>Paleta de colores de tu marca (formato hex)</CardDescription>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                                <div className="h-5 w-5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-8">
                            <ColorPicker
                                label="Color Primario"
                                value={config.colorPrimario || "#1E40AF"}
                                onChange={(v) => handleChange("colorPrimario", v)}
                                className="bg-slate-50 p-4 rounded-xl border border-slate-100"
                            />
                            <ColorPicker
                                label="Color Secundario"
                                value={config.colorSecundario || "#F59E0B"}
                                onChange={(v) => handleChange("colorSecundario", v)}
                                className="bg-slate-50 p-4 rounded-xl border border-slate-100"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Floating Action Bar */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 backdrop-blur-xl p-2 pr-6 rounded-full shadow-2xl border border-white/50 z-50">
                    <Link href="/admin/configuracion">
                        <Button type="button" variant="ghost" className="rounded-full hover:bg-slate-100 text-slate-500">
                            Cancelar
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-slate-200" />
                    <Button
                        type="submit"
                        disabled={saving}
                        className="rounded-full bg-slate-900 hover:bg-black text-white px-8 shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Cambios
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
