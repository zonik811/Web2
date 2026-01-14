"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Cita, EstadoCita } from "@/types";
import { formatearFecha, formatearPrecio, nombreCompleto } from "@/lib/utils";
import {
    Calendar,
    Clock,
    MapPin,
    CreditCard,
    CheckCircle2,
    User,
    Building,
    Users,
    FileText,
    AlertCircle
} from "lucide-react";
import { obtenerURLArchivo } from "@/lib/appwrite";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CitaDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    cita: Cita | null;
}

export function CitaDetailModal({ isOpen, onClose, cita }: CitaDetailModalProps) {
    if (!cita) return null;

    const getEstadoBadge = (estado: EstadoCita) => {
        const styles = {
            [EstadoCita.PENDIENTE]: "bg-amber-100 text-amber-700 border-amber-200",
            [EstadoCita.CONFIRMADA]: "bg-blue-100 text-blue-700 border-blue-200",
            [EstadoCita.EN_PROGRESO]: "bg-violet-100 text-violet-700 border-violet-200",
            [EstadoCita.COMPLETADA]: "bg-emerald-100 text-emerald-700 border-emerald-200",
            [EstadoCita.CANCELADA]: "bg-rose-100 text-rose-700 border-rose-200",
        };

        return (
            <Badge variant="outline" className={`capitalize px-3 py-1 text-sm font-semibold shadow-sm ${styles[estado] || "bg-gray-100"}`}>
                {estado.replace("-", " ")}
            </Badge>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <span>Detalle del Servicio</span>
                            {getEstadoBadge(cita.estado)}
                        </DialogTitle>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs text-slate-400">ID: {cita.$id}</span>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* INFO SERVICIO */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 leading-none mb-1">
                                    {cita.servicio?.nombre || cita.categoriaSeleccionada || "Servicio Personalizado"}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {cita.servicio?.categoria || "Servicio General"}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-slate-900">{formatearPrecio(cita.precioCliente)}</div>
                                <span className="text-xs text-slate-500 font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                    Precio Estimado
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-slate-700">{formatearFecha(cita.fechaCita)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-slate-700">{cita.horaCita} ({cita.duracionEstimada} min)</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* UBICACIÓN */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" /> Ubicación
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="font-semibold text-slate-900">{cita.direccion}</p>
                                <p className="text-slate-600">{cita.ciudad}</p>
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                                    <Building className="h-3 w-3 text-slate-400" />
                                    <span className="capitalize text-slate-600">
                                        {cita.tipoPropiedad}
                                        {cita.metrosCuadrados ? ` • ${cita.metrosCuadrados}m²` : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* PAGO */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-primary" /> Pago
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Método:</span>
                                    <span className="font-medium capitalize">{cita.metodoPago.replace("_", " ")}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Estado:</span>
                                    {cita.pagadoPorCliente ? (
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                            Pagado
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-500">
                                            Pendiente
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PERSONAL ASIGNADO (Solo visible si está confirmado/en progreso/completado) */}
                    {cita.empleadosAsignados && cita.empleadosAsignados.length > 0 && (
                        <div>
                            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4" /> Personal Asignado
                            </h3>
                            <div className="bg-white border rounded-lg p-3">
                                <p className="text-sm text-slate-600 italic mb-2">
                                    El siguiente personal atenderá tu servicio:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {/* Aquí podríamos mostrar fotos/nombres si tuviéramos acceso directo a la data de empleados populated.
                                        Como 'obtenerMisCitas' podría no traer 'empleados' populated por defecto si es una query simple,
                                        manejamos el caso genérico. Si 'cita.empleados' existe, lo usamos. */}

                                    {cita.empleados ? (
                                        cita.empleados.map((emp, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={obtenerURLArchivo(emp.foto || "")} />
                                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                        {emp.nombre[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium text-slate-700">{emp.nombre}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-sm text-slate-500">
                                            {cita.empleadosAsignados.length} profesional(es) asignado(s).
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTAS CLIENTE */}
                    {cita.detallesAdicionales && (
                        <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4">
                            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4" /> Tus Notas
                            </h3>
                            <p className="text-sm text-amber-900/80 italic">
                                "{cita.detallesAdicionales}"
                            </p>
                        </div>
                    )}

                </div>

                <DialogFooter>
                    <Button onClick={onClose} variant="secondary">Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
