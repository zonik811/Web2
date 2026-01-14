"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    FileCheck, Fuel, Gauge, AlertTriangle, UserCheck, Calendar,
    Image as ImageIcon, FolderOpen, ArrowRight, ArrowLeft,
    CheckCircle2, XCircle, Search
} from "lucide-react";
import type { OtChecklistVehiculo } from "@/types";
import { RegistrarChecklistDialog } from "../dialogs/RegistrarChecklistDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface OrdenDocumentosProps {
    ordenId: string;
    checklists: OtChecklistVehiculo[];
    empleadoId?: string;
}

export function OrdenDocumentos({ ordenId, checklists, empleadoId = "current_user" }: OrdenDocumentosProps) {
    const router = useRouter();

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FolderOpen className="h-6 w-6 text-blue-600" />
                        Expediente Digital
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Historial de condiciones y evidencia fotográfica del vehículo.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-8 px-3 bg-slate-50">
                        {checklists.length} Documentos
                    </Badge>
                    <RegistrarChecklistDialog
                        ordenId={ordenId}
                        empleadoId={empleadoId}
                        onChecklistCreated={handleRefresh}
                    />
                </div>
            </div>

            {/* Grid de Documentos */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                {checklists.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <FileCheck className="h-10 w-10 text-slate-300" />
                        </div>
                        <h4 className="text-lg font-medium text-slate-900">Sin documentación registrada</h4>
                        <p className="text-muted-foreground text-sm max-w-md text-center mt-2">
                            Registra el checklist de entrada (Recepción) para documentar el estado inicial del vehículo y sus pertenencias.
                        </p>
                        <div className="mt-6">
                            <RegistrarChecklistDialog
                                ordenId={ordenId}
                                empleadoId={empleadoId}
                                onChecklistCreated={handleRefresh}
                            />
                        </div>
                    </div>
                ) : (
                    checklists.map((checklist) => (
                        <ChecklistCard key={checklist.$id} checklist={checklist} />
                    ))
                )}
            </div>
        </div>
    );
}

function ChecklistCard({ checklist }: { checklist: OtChecklistVehiculo }) {
    const isRecepcion = checklist.tipo === 'RECEPCION';

    return (
        <Card className={`overflow-hidden border-t-4 shadow-md transition-all hover:shadow-lg ${isRecepcion ? 'border-t-blue-500' : 'border-t-green-500'}`}>
            <CardHeader className="bg-slate-50/50 pb-4 border-b">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge className={`${isRecepcion ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} border-0 px-3 py-1`}>
                                {isRecepcion ? (
                                    <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> Entrada</span>
                                ) : (
                                    <span className="flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Salida</span>
                                )}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">#{checklist.$id.substring(checklist.$id.length - 6)}</span>
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-800">
                            {isRecepcion ? 'Recepción de Vehículo' : 'Entrega de Vehículo'}
                        </CardTitle>
                    </div>
                    <div className="flex flex-col items-end text-right">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {format(new Date(checklist.fechaHora), "d MMM, yyyy", { locale: es })}
                        </div>
                        <span className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(checklist.fechaHora), "h:mm a", { locale: es })}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                {/* Metricas Principales */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                            <Gauge className="h-4 w-4" /> Kilometraje
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">
                            {checklist.kilometraje.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">km</span>
                        </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                            <Fuel className="h-4 w-4" /> Combustible
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-bold text-slate-900">{checklist.nivelCombustible}%</span>
                            </div>
                            <Progress value={checklist.nivelCombustible} className="h-1.5" />
                        </div>
                    </div>
                </div>

                {/* Condiciones Visuales */}
                <div className="space-y-3">
                    <h5 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-slate-400" />
                        Estado General
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`p-2.5 rounded-lg border text-sm flex justify-between items-center ${checklist.estadoLlantas === 'MALO' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-white border-slate-100'}`}>
                            <span className="text-muted-foreground">Llantas</span>
                            <span className="font-medium">{checklist.estadoLlantas}</span>
                        </div>
                        <div className={`p-2.5 rounded-lg border text-sm flex justify-between items-center ${checklist.estadoCarroceria === 'MALO' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-white border-slate-100'}`}>
                            <span className="text-muted-foreground">Carrocería</span>
                            <span className="font-medium">{checklist.estadoCarroceria}</span>
                        </div>
                    </div>
                </div>

                {/* Observaciones (Alertas) */}
                {(checklist.rayonesNotados || checklist.objetosValor) && (
                    <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-100 space-y-2">
                        <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            Observaciones Importantes
                        </div>
                        <div className="space-y-1 pl-6">
                            {checklist.rayonesNotados && (
                                <p className="text-sm text-amber-900/80">
                                    <span className="font-medium">Daños:</span> {checklist.rayonesNotados}
                                </p>
                            )}
                            {checklist.objetosValor && (
                                <p className="text-sm text-amber-900/80">
                                    <span className="font-medium">Pertenencias:</span> {checklist.objetosValor}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Galería de Fotos */}
                {checklist.fotosVehiculo && checklist.fotosVehiculo.length > 0 && (
                    <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                            Evidencia Fotográfica ({checklist.fotosVehiculo.length})
                        </h5>
                        <div className="grid grid-cols-4 gap-2">
                            {checklist.fotosVehiculo.slice(0, 3).map((foto, idx) => (
                                <Dialog key={idx}>
                                    <DialogTrigger asChild>
                                        <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-zoom-in border hover:opacity-90 transition-opacity">
                                            <Image
                                                src={foto}
                                                alt={`Evidencia ${idx}`}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl bg-black border-slate-800 p-1">
                                        <div className="relative w-full h-[80vh]">
                                            <Image
                                                src={foto}
                                                alt="Evidencia Full"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                            {checklist.fotosVehiculo.length > 3 && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="aspect-square bg-slate-100 rounded-lg border flex flex-col items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer transition-colors">
                                            <span className="text-lg font-bold">+{checklist.fotosVehiculo.length - 3}</span>
                                            <span className="text-[10px] uppercase font-medium">Ver Todo</span>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Galería Completa</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                            {checklist.fotosVehiculo.map((foto, idx) => (
                                                <div key={idx} className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border">
                                                    <Image src={foto} alt={`Foto ${idx}`} fill className="object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Footer con Firma */}
            <CardFooter className="bg-slate-50/30 border-t pt-4 pb-6">
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-full">
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Firmado por cliente</p>
                            <p className="text-sm font-bold text-slate-800">{checklist.nombreClienteFirma}</p>
                        </div>
                    </div>
                    {checklist.firmaClienteUrl && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    Ver Firma Digital
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm">
                                <DialogHeader>
                                    <DialogTitle>Firma Digital del Cliente</DialogTitle>
                                </DialogHeader>
                                <div className="relative h-40 bg-white rounded-xl border border-slate-200 mt-4">
                                    <Image
                                        src={checklist.firmaClienteUrl}
                                        alt="Firma"
                                        fill
                                        className="object-contain p-4"
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
