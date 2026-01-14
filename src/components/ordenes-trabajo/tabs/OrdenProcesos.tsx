"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Plus, Play, CheckCircle, Clock, User, Trash2,
    Wrench, AlertCircle, ChevronDown, ChevronUp,
    Hammer, PenTool, ClipboardCheck
} from "lucide-react";
import type { OtProceso, Empleado, OtActividad, OtRepuesto, OtPrueba, ProcesoConDetalles } from "@/types";
import { useRouter } from "next/navigation";
import { AgregarProcesoDialog } from "@/components/ordenes-trabajo/dialogs/AgregarProcesoDialog";
import { iniciarProceso } from "@/lib/actions/ot-procesos";
// Dialogs
import { RegistrarActividadDialog } from "@/components/ordenes-trabajo/dialogs/RegistrarActividadDialog";
import { EditarActividadDialog } from "@/components/ordenes-trabajo/dialogs/EditarActividadDialog";
import { eliminarActividad } from "@/lib/actions/ot-actividades";
import { AgregarRepuestoDialog } from "@/components/ordenes-trabajo/dialogs/AgregarRepuestoDialog";
import { EditarRepuestoDialog } from "@/components/ordenes-trabajo/dialogs/EditarRepuestoDialog";
import { eliminarRepuesto } from "@/lib/actions/ot-repuestos";
import { RegistrarPruebaDialog } from "@/components/ordenes-trabajo/dialogs/RegistrarPruebaDialog";
import { CompletarProcesoDialog } from "@/components/ordenes-trabajo/dialogs/CompletarProcesoDialog";

interface OrdenProcesosProps {
    procesos: ProcesoConDetalles[];
    ordenId: string;
    empleados?: Empleado[];
}

export function OrdenProcesos({ procesos, ordenId, empleados = [] }: OrdenProcesosProps) {
    const router = useRouter();

    const handleProcesoCreated = () => {
        router.refresh();
    };

    const handleIniciarProceso = async (procesoId: string) => {
        if (!confirm("¿Estás seguro de iniciar este proceso?")) return;

        try {
            const result = await iniciarProceso(procesoId);
            if (result.success) {
                router.refresh();
            } else {
                alert("Error al iniciar proceso: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al iniciar proceso");
        }
    };

    const handleEliminarActividad = async (actividadId: string) => {
        if (!confirm("¿Estás seguro de eliminar esta actividad?")) return;
        try {
            const result = await eliminarActividad(actividadId);
            if (result.success) router.refresh();
            else alert("Error: " + result.error);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEliminarRepuesto = async (repuestoId: string) => {
        if (!confirm("¿Estás seguro de eliminar este repuesto?")) return;
        try {
            const result = await eliminarRepuesto(repuestoId);
            if (result.success) router.refresh();
            else alert("Error: " + result.error);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-primary" />
                        Línea de Procesos
                    </h3>
                    <p className="text-sm text-muted-foreground">Flujo de trabajo y reparaciones</p>
                </div>
                <AgregarProcesoDialog
                    ordenId={ordenId}
                    empleados={empleados}
                    onProcesoCreated={handleProcesoCreated}
                />
            </div>

            {/* Timeline Container */}
            <div className="relative pl-4 md:pl-8 space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-[1.15rem] md:left-[2.15rem] top-4 bottom-4 w-0.5 bg-slate-200" />

                {procesos.length === 0 ? (
                    <Card className="ml-8 border-dashed shadow-sm">
                        <CardContent className="py-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Hammer className="h-8 w-8 text-slate-400" />
                            </div>
                            <h4 className="text-lg font-medium mb-1">Sin procesos iniciados</h4>
                            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                                Comienza agregando el primer proceso de diagnóstico o reparación.
                            </p>
                            <AgregarProcesoDialog
                                ordenId={ordenId}
                                empleados={empleados}
                                onProcesoCreated={handleProcesoCreated}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    procesos.map((proceso, index) => (
                        <ProcesoCard
                            key={proceso.$id}
                            proceso={proceso}
                            index={index}
                            ordenId={ordenId}
                            empleados={empleados}
                            actions={{
                                onRefresh: handleProcesoCreated,
                                onIniciar: handleIniciarProceso,
                                onEliminarActividad: handleEliminarActividad,
                                onEliminarRepuesto: handleEliminarRepuesto
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

// Subcomponente para cada Tarjeta de Proceso para mantener el código limpio
function ProcesoCard({
    proceso, index, ordenId, empleados, actions
}: {
    proceso: ProcesoConDetalles,
    index: number,
    ordenId: string,
    empleados: Empleado[],
    actions: any
}) {
    const [expanded, setExpanded] = useState(true); // Expandido por defecto
    const tecnico = empleados.find(e => e.$id === proceso.tecnicoResponsableId);

    // Calcular porcentaje de progreso
    const porcentajeHoras = proceso.horasEstimadas > 0
        ? Math.min(100, ((proceso.horasReales || 0) / proceso.horasEstimadas) * 100)
        : 0;

    // Calcular estado visual
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDIENTE': return 'bg-slate-200 text-slate-500 border-slate-300';
            case 'EN_PROGRESO': return 'bg-blue-500 text-white border-blue-600 shadow-blue-200';
            case 'COMPLETADO': return 'bg-green-500 text-white border-green-600 shadow-green-200';
            default: return 'bg-slate-200';
        }
    };

    return (
        <div className="relative group">
            {/* Timeline Dot */}
            <div className={`absolute -left-[0.6rem] md:-left-[0.6rem] top-6 w-8 h-8 rounded-full border-4 border-white z-10 flex items-center justify-center transition-all ${getStatusColor(proceso.estado)} shadow-md`}>
                <span className="font-bold text-xs">{index + 1}</span>
            </div>

            <Card className={`ml-8 md:ml-12 border-l-4 transition-all hover:shadow-md ${proceso.estado === 'EN_PROGRESO' ? 'border-l-blue-500 ring-1 ring-blue-100' :
                    proceso.estado === 'COMPLETADO' ? 'border-l-green-500' : 'border-l-slate-300'
                }`}>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">{proceso.nombre}</CardTitle>
                                <EstadoProcesoBadge estado={proceso.estado} />
                            </div>
                            <CardDescription>{proceso.descripcion}</CardDescription>
                        </div>
                        {proceso.estado === 'PENDIENTE' && (
                            <Button size="sm" onClick={() => actions.onIniciar(proceso.$id)} className="animate-pulse">
                                <Play className="h-3 w-3 mr-2" /> Iniciar
                            </Button>
                        )}
                        {proceso.estado === 'COMPLETADO' && (
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" /> Finalizado
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="pb-3">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Técnico Info */}
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <Avatar className="h-10 w-10 border shadow-sm">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${tecnico?.nombre || 'T'}`} />
                                <AvatarFallback>{tecnico?.nombre?.[0] || 'T'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Técnico Responsable</p>
                                <p className="font-semibold text-sm">
                                    {tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : 'Sin asignar'}
                                </p>
                            </div>
                        </div>

                        {/* Horas Progress */}
                        <div className="space-y-2 p-1">
                            <div className="flex justify-between text-xs font-medium">
                                <span className={porcentajeHoras > 100 ? "text-orange-600" : "text-muted-foreground"}>
                                    Progreso ({proceso.horasReales || 0} / {proceso.horasEstimadas} h)
                                </span>
                                <span className="text-slate-900">{Math.round(porcentajeHoras)}%</span>
                            </div>
                            <Progress value={Math.min(100, porcentajeHoras)} className={`h-2 ${porcentajeHoras > 100 ? "bg-orange-100" : ""}`} />
                        </div>
                    </div>

                    {/* Expandable Content section */}
                    <div className={`space-y-6 overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>

                        {/* Actividades Section */}
                        {((proceso.actividades?.length ?? 0) > 0 || proceso.estado === 'EN_PROGRESO') && (
                            <div className="space-y-3">
                                <h5 className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                    <ClipboardCheck className="h-4 w-4 text-slate-500" />
                                    Actividades Realizadas
                                </h5>
                                {(proceso.actividades?.length ?? 0) > 0 ? (
                                    <div className="bg-slate-50 rounded-lg border divide-y">
                                        {proceso.actividades!.map((act) => (
                                            <div key={act.$id} className="p-3 text-sm flex gap-3 hover:bg-white transition-colors">
                                                <div className="flex-none pt-1">
                                                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-slate-800 font-medium">{act.descripcion}</p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {act.horasTrabajadas}h</span>
                                                        <span>{new Date(act.fechaHora).toLocaleDateString()}</span>
                                                    </div>
                                                    {act.imagenes && act.imagenes.length > 0 && (
                                                        <div className="flex gap-2 mt-2">
                                                            {act.imagenes.map((img, i) => (
                                                                <img key={i} src={img} alt="Evidencia" className="h-10 w-10 rounded border object-cover hover:scale-105 transition-transform cursor-pointer" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-start">
                                                    <EditarActividadDialog actividad={act} onActividadUpdated={actions.onRefresh} />
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => actions.onEliminarActividad(act.$id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic pl-6">No hay actividades registradas aún.</p>
                                )}

                                {proceso.estado === 'EN_PROGRESO' && (
                                    <div className="pl-6 pt-1">
                                        <RegistrarActividadDialog
                                            procesoId={proceso.$id}
                                            ordenId={ordenId}
                                            empleadoId={proceso.tecnicoResponsableId}
                                            onActividadCreated={actions.onRefresh}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <Separator />

                        {/* Repuestos Section */}
                        {((proceso.repuestos?.length ?? 0) > 0 || proceso.estado === 'EN_PROGRESO') && (
                            <div className="space-y-3">
                                <h5 className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                    <PenTool className="h-4 w-4 text-slate-500" />
                                    Repuestos y Materiales
                                </h5>
                                {(proceso.repuestos?.length ?? 0) > 0 ? (
                                    <div className="bg-slate-50 rounded-lg border divide-y">
                                        {proceso.repuestos!.map((rep) => (
                                            <div key={rep.$id} className="p-3 text-sm flex justify-between items-center hover:bg-white transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="h-5 bg-white">{rep.cantidad}</Badge>
                                                    <span className="font-medium text-slate-700">{rep.nombreRepuesto}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-slate-600">${rep.subtotal.toLocaleString()}</span>
                                                    <div className="flex items-center border-l pl-2 ml-2">
                                                        <EditarRepuestoDialog repuesto={rep} onRepuestoUpdated={actions.onRefresh} />
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => actions.onEliminarRepuesto(rep.$id)}>
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic pl-6">No se han usado repuestos.</p>
                                )}

                                {proceso.estado === 'EN_PROGRESO' && (
                                    <div className="pl-6 pt-1">
                                        <AgregarRepuestoDialog
                                            procesoId={proceso.$id}
                                            ordenId={ordenId}
                                            empleadoId={proceso.tecnicoResponsableId}
                                            onRepuestoAgregado={actions.onRefresh}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {proceso.estado === 'EN_PROGRESO' && (
                            <>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-lg border border-dashed flex flex-col items-center justify-center text-center gap-2">
                                        <AlertCircle className="h-6 w-6 text-slate-400" />
                                        <p className="text-xs font-medium text-slate-600">Calidad</p>
                                        <RegistrarPruebaDialog
                                            procesoId={proceso.$id}
                                            ordenId={ordenId}
                                            empleadoId={proceso.tecnicoResponsableId}
                                            onPruebaRegistrada={actions.onRefresh}
                                        />
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex flex-col items-center justify-center text-center gap-2">
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                        <p className="text-xs font-medium text-green-700">Finalizar</p>
                                        <CompletarProcesoDialog
                                            procesoId={proceso.$id}
                                            horasEstimadas={proceso.horasEstimadas}
                                            horasRegistradas={proceso.horasReales}
                                            tarifaSugerida={empleados.find(e => e.$id === proceso.tecnicoResponsableId)?.tarifaPorHora || 50000}
                                            onProcesoCompletado={actions.onRefresh}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="bg-slate-50/50 border-t py-3 flex justify-between items-center cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => setExpanded(!expanded)}>
                    <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                        <span>Mano de Obra: ${proceso.costoManoObra.toLocaleString()}</span>
                        <span>•</span>
                        <span>Repuestos: ${(proceso.repuestos?.reduce((a, b) => a + b.subtotal, 0) || 0).toLocaleString()}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

function EstadoProcesoBadge({ estado }: { estado: string }) {
    const estilos: Record<string, { color: string; label: string }> = {
        'PENDIENTE': { color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Pendiente' },
        'EN_PROGRESO': { color: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse', label: 'En Progreso' },
        'COMPLETADO': { color: 'bg-green-100 text-green-700 border-green-200', label: 'Completado' },
        'CANCELADO': { color: 'bg-red-100 text-red-700 border-red-200', label: 'Cancelado' },
    };
    const estilo = estilos[estado] || { color: 'bg-gray-100 text-gray-800', label: estado };
    return <Badge variant="outline" className={`${estilo.color} shadow-sm border`}>{estilo.label}</Badge>;
}
