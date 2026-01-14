"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Calendar, User, Truck, Clock, CheckCircle, AlertCircle,
    MapPin, Phone, Mail, DollarSign, Activity, FileText
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { OrdenTrabajo, Cliente, Vehiculo } from "@/types";

interface OrdenOverviewProps {
    orden: OrdenTrabajo;
    cliente?: Cliente;
    vehiculo?: Vehiculo;
}

export function OrdenOverview({ orden, cliente, vehiculo }: OrdenOverviewProps) {
    const formatDate = (date: string) => format(new Date(date), "PPP", { locale: es });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Estado Actual"
                    value={<EstadoBadge estado={orden.estado} />}
                    icon={<Activity className="h-4 w-4" />}
                />
                <StatCard
                    title="Prioridad"
                    value={<PrioridadBadge prioridad={orden.prioridad} />}
                    icon={<AlertCircle className="h-4 w-4" />}
                />
                <StatCard
                    title="Total Estimado"
                    value={`$${orden.total.toLocaleString('es-CO')}`}
                    icon={<DollarSign className="h-4 w-4" />}
                    highlight
                />
                <StatCard
                    title="Fecha Entrega"
                    value={format(new Date(orden.fechaEstimadaEntrega), "d MMM, yyyy", { locale: es })}
                    icon={<Clock className="h-4 w-4" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Entidades (2/3 ancho) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Cliente & Vehículo en Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cliente Card */}
                        <Card className="overflow-hidden border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4 bg-slate-50/50">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {cliente ? (
                                    <>
                                        <div>
                                            <p className="font-semibold text-lg">{cliente.nombre}</p>
                                            <p className="text-sm text-muted-foreground">ID: {cliente.$id.substring(0, 8)}...</p>
                                        </div>
                                        <Separator />
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-start gap-3">
                                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <span>{cliente.telefono}</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <span className="truncate">{cliente.email}</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <span>{cliente.direccion}, {cliente.ciudad}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-32 flex items-center justify-center text-muted-foreground">
                                        Cargando información...
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Vehículo Card */}
                        <Card className="overflow-hidden border-t-4 border-t-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4 bg-slate-50/50">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                        <Truck className="h-5 w-5" />
                                    </div>
                                    Vehículo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {vehiculo ? (
                                    <>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-lg">{vehiculo.marca} {vehiculo.modelo}</p>
                                                <p className="text-sm text-muted-foreground">{vehiculo.ano}</p>
                                            </div>
                                            <div className="px-2 py-1 bg-yellow-400/20 border border-yellow-500/50 rounded text-yellow-900 font-mono font-bold text-sm">
                                                {vehiculo.placa}
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Tipo</p>
                                                    <p className="font-medium">{vehiculo.tipoVehiculo}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Combustible</p>
                                                    <p className="font-medium">{vehiculo.tipoCombustible}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Kilometraje</p>
                                                    <p className="font-medium">{vehiculo.kilometraje.toLocaleString()} km</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Color</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full border bg-gray-500" style={{ backgroundColor: vehiculo.color?.toLowerCase() }}></div>
                                                        <span className="font-medium">{vehiculo.color}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-32 flex items-center justify-center text-muted-foreground">
                                        Cargando información...
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detalle Orden */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Detalles del Servicio</CardTitle>
                            <CardDescription>Resumen de la solicitud de servicio</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Motivo de Ingreso</h4>
                                <p className="text-base leading-relaxed bg-slate-50 p-4 rounded-lg border">
                                    {orden.motivoIngreso}
                                </p>
                            </div>

                            {orden.diagnosticoInicial && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Diagnóstico Inicial</h4>
                                    <p className="text-base leading-relaxed bg-slate-50 p-4 rounded-lg border">
                                        {orden.diagnosticoInicial}
                                    </p>
                                </div>
                            )}

                            {orden.tieneGarantia && (
                                <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-900">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <CheckCircle className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">Servicio con Garantía</p>
                                        <p className="text-blue-700 mt-1">
                                            Este servicio cuenta con <strong>{orden.diasGarantia} días</strong> de garantía a partir de la entrega.
                                            {orden.fechaVencimientoGarantia && (
                                                <span className="block mt-1 text-sm opacity-80">
                                                    Vence el {formatDate(orden.fechaVencimientoGarantia)}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Columna Derecha: Sidebar (1/3 ancho) */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <Card className="overflow-hidden shadow-sm">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-base font-semibold">Línea de Tiempo</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-2">
                                {/* Ingreso */}
                                <div className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 p-1 bg-white border-2 border-blue-500 rounded-full">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 mb-1">Fecha de Ingreso</p>
                                        <p className="text-lg font-semibold">{formatDate(orden.fechaIngreso)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Orden Creada</p>
                                    </div>
                                </div>

                                {/* Estimada */}
                                <div className="relative pl-8">
                                    <div className={`absolute -left-[9px] top-0 p-1 bg-white border-2 rounded-full ${orden.fechaRealEntrega ? 'border-slate-300' : 'border-orange-500'}`}>
                                        <div className={`w-2 h-2 rounded-full ${orden.fechaRealEntrega ? 'bg-slate-300' : 'bg-orange-500'}`}></div>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium mb-1 ${orden.fechaRealEntrega ? 'text-muted-foreground' : 'text-orange-600'}`}>Estimada Entrega</p>
                                        <p className={`text-lg font-semibold ${orden.fechaRealEntrega ? 'text-muted-foreground' : ''}`}>{formatDate(orden.fechaEstimadaEntrega)}</p>
                                        {!orden.fechaRealEntrega && (
                                            <p className="text-xs text-orange-600/80 mt-1">Objetivo actual</p>
                                        )}
                                    </div>
                                </div>

                                {/* Entrega Real */}
                                {orden.fechaRealEntrega && (
                                    <div className="relative pl-8">
                                        <div className="absolute -left-[9px] top-0 p-1 bg-white border-2 border-green-500 rounded-full">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-green-600 mb-1">Entregado el</p>
                                            <p className="text-lg font-semibold">{formatDate(orden.fechaRealEntrega)}</p>
                                            <p className="text-xs text-green-600/80 mt-1">Servicio finalizado</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resumen Financiero */}
                    <Card className="bg-slate-900 text-white shadow-lg overflow-hidden relative">
                        {/* Background Deco */}
                        <div className="absolute top-0 right-0 p-10 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-slate-200 text-base font-medium flex items-center justify-between">
                                Resumen Financiero
                                <DollarSign className="h-4 w-4 text-slate-400" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10 mt-2">
                            <div>
                                <p className="text-4xl font-bold tracking-tight">
                                    ${orden.total.toLocaleString('es-CO')}
                                </p>
                                <p className="text-slate-400 text-sm mt-1">Total Orden</p>
                            </div>

                            <Separator className="bg-slate-700" />

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-300">
                                    <span>Subtotal</span>
                                    <span>${orden.subtotal.toLocaleString('es-CO')}</span>
                                </div>
                                {orden.aplicarIva && (
                                    <div className="flex justify-between text-slate-300">
                                        <span>IVA ({orden.porcentajeIva}%)</span>
                                        <span>${orden.impuestos.toLocaleString('es-CO')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <Badge variant="outline" className={`w-full justify-center py-1.5 border-slate-700 ${orden.cotizacionAprobada
                                        ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                        : "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                                    }`}>
                                    {orden.cotizacionAprobada ? "Cotización Aprobada" : "Cotización Pendiente"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, highlight = false }: { title: string, value: React.ReactNode, icon: React.ReactNode, highlight?: boolean }) {
    return (
        <Card className={`shadow-sm ${highlight ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
                    <div className="text-xl font-bold">{value}</div>
                </div>
                <div className={`p-2 rounded-full ${highlight ? 'bg-primary text-primary-foreground' : 'bg-slate-100 text-slate-500'}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}

function EstadoBadge({ estado }: { estado: string }) {
    const estilos: Record<string, { color: string; label: string }> = {
        'COTIZANDO': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Cotizando' },
        'ACEPTADA': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Aceptada' },
        'EN_PROCESO': { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'En Proceso' },
        'POR_PAGAR': { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Por Pagar' },
        'COMPLETADA': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completada' },
        'ENTREGADA': { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Entregada' },
        'CANCELADA': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelada' },
    };
    const estilo = estilos[estado] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: estado };
    return <Badge variant="outline" className={`${estilo.color} px-2.5 py-0.5 shadow-sm`}>{estilo.label}</Badge>;
}

function PrioridadBadge({ prioridad }: { prioridad: string }) {
    if (prioridad === 'URGENTE') {
        return <Badge variant="destructive" className="font-semibold shadow-sm animate-pulse">🔥 Urgente</Badge>;
    }
    return <Badge variant="secondary" className="text-slate-600 font-medium">Normal</Badge>;
}
