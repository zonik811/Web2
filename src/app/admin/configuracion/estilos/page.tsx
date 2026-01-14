"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Box, Check, Copy, Grid, Layers, Layout, Palette, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import { obtenerEstilos, ComponentStyleDoc } from "@/lib/actions/estilos";

export default function StyleGalleryPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("buttons");
    const [filter, setFilter] = useState<string>("all");
    const [dbStyles, setDbStyles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStyles = async () => {
            const result = await obtenerEstilos();
            if (result.success && result.data) {
                setDbStyles(Array.isArray(result.data) ? result.data : []);
            } else {
                setDbStyles([]);
            }
            setLoading(false);
        };
        fetchStyles();
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copiado",
            description: "Clases copiadas al portapapeles",
        });
    };

    const getStylesByType = (type: string) => {
        // Safety check
        if (!Array.isArray(dbStyles)) return [];
        return dbStyles.filter(s => s.type === type || (type === "buttons" && s.type === "button"));
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/configuracion/pagina">
                        <Button variant="ghost" size="icon" className="group rounded-full bg-white shadow-sm hover:shadow-md transition-all">
                            <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-slate-900" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Galería de Estilos</h1>
                        <p className="text-slate-500 mt-1">
                            {loading ? "Cargando biblioteca de estilos..." : `Explorando ${dbStyles.length} componentes visuales.`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <Tabs defaultValue="buttons" className="space-y-8" onValueChange={setActiveTab}>
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit">
                        <TabsList className="bg-transparent gap-2">
                            <TabsTrigger value="buttons" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-xl px-6">
                                <Box className="w-4 h-4 mr-2" /> Botones
                            </TabsTrigger>
                            <TabsTrigger value="badges" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-xl px-6">
                                <Check className="w-4 h-4 mr-2" /> Badges
                            </TabsTrigger>
                            <TabsTrigger value="cards" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-xl px-6">
                                <Layout className="w-4 h-4 mr-2" /> Tarjetas
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <>
                            {/* BUTTONS */}
                            <TabsContent value="buttons" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {getStylesByType('button').map((style) => (
                                    <StyleCard key={style.$id} title={style.name} onCopy={() => copyToClipboard(style.css_classes)}>
                                        <button className={style.css_classes + " px-6 py-2"}>
                                            Button
                                        </button>
                                    </StyleCard>
                                ))}
                            </TabsContent>

                            {/* BADGES */}
                            <TabsContent value="badges" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {getStylesByType('badge').map((style) => (
                                    <StyleCard key={style.$id} title={style.name} onCopy={() => copyToClipboard(style.css_classes)}>
                                        <div className="flex flex-col gap-2 items-center">
                                            <span className={style.css_classes}>Badge</span>
                                        </div>
                                    </StyleCard>
                                ))}
                            </TabsContent>

                            {/* CARDS */}
                            <TabsContent value="cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {getStylesByType('card').map((style) => (
                                    <StyleCard key={style.$id} title={style.name} onCopy={() => copyToClipboard(style.css_classes)}>
                                        <div className={cn("w-full h-full min-h-[120px] flex flex-col justify-between", style.css_classes)}>
                                            <h4 className="font-bold text-lg">Card Title</h4>
                                            <p className="text-sm opacity-80">Content inside the card...</p>
                                        </div>
                                    </StyleCard>
                                ))}
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </div>
    );
}

function StyleCard({ title, children, onCopy }: { title: string, children: React.ReactNode, onCopy: () => void }) {
    return (
        <div className="group relative bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-between gap-6 hover:shadow-lg hover:border-indigo-100 transition-all duration-300">
            <div className="w-full flex items-center justify-center min-h-[80px] overflow-visible p-2">
                {children}
            </div>
            <div className="w-full flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                <span className="text-xs font-medium text-slate-500 truncate max-w-[150px]">
                    {title}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCopy}
                    className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full"
                    title="Copiar Clases CSS"
                >
                    <Copy className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
