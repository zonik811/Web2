"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft, FileText, Settings, DollarSign, FileCheck, Users,
    CheckCircle, Play, Printer, AlertTriangle, CreditCard
} from "lucide-react";
import Link from "next/link";
import { OrdenOverview } from "@/components/ordenes-trabajo/tabs/OrdenOverview";
import { OrdenProcesos } from "@/components/ordenes-trabajo/tabs/OrdenProcesos";
import { OrdenCostos } from "@/components/ordenes-trabajo/tabs/OrdenCostos";
import { OrdenDocumentos } from "@/components/ordenes-trabajo/tabs/OrdenDocumentos";
import { OrdenComisiones } from "@/components/ordenes-trabajo/tabs/OrdenComisiones";
import { OrdenPagos } from "@/components/ordenes-trabajo/tabs/OrdenPagos";
import { CambiarEstadoDialog } from "@/components/ordenes-trabajo/dialogs/CambiarEstadoDialog";
import { GenerarFacturaDialog } from "@/components/ordenes-trabajo/dialogs/GenerarFacturaDialog";
import { cambiarEstadoOrden, validarTransicionPorPagar, type ValidationResult } from "@/lib/actions/cambiar-estado";
import type { OtConDetalles, Cliente, Vehiculo, Empleado } from "@/types";

interface OrdenDetalleClientProps {
    orden: OtConDetalles;
    cliente?: Cliente;
    vehiculo?: Vehiculo;
    empleados?: Empleado[];
}

export default function OrdenDetalleClient({
    orden,
    cliente,
    vehiculo,
    empleados = []
}: OrdenDetalleClientProps) {
    const router = useRouter();
    const [currentTab, setCurrentTab] = useState("overview");
    const [cambiarEstadoOpen, setCambiarEstadoOpen] = useState(false);
    const [generarFacturaOpen, setGenerarFacturaOpen] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState<any>(null);
    const [validation, setValidation] = useState<ValidationResult | undefined>();

    // Determine next valid state
    const getNextState = () => {
        switch (orden.estado) {
            case "COTIZANDO": return "ACEPTADA";
            case "ACEPTADA": return "EN_PROCESO";
            case "EN_PROCESO": return "POR_PAGAR";
            case "POR_PAGAR": return "COMPLETADA";
            default: return null;
        }
    };

    const handleOpenCambiarEstado = async () => {
        const nextState = getNextState();
        if (!nextState) return;

        setNuevoEstado(nextState);

        // Validate transition to POR_PAGAR
        if (nextState === "POR_PAGAR") {
            const result = await validarTransicionPorPagar(orden.$id);
            setValidation(result);
        } else {
            setValidation({ valid: true });
        }

        setCambiarEstadoOpen(true);
    };

    const handleConfirmarCambio = async (observaciones: string) => {
        const result = await cambiarEstadoOrden(orden.$id, nuevoEstado, observaciones);

        if (result.success) {
            router.refresh();
        } else {
            alert("Error: " + result.error);
        }
    };

    // Calculate costs dynamically from processes
    const totalRepuestos = (orden.procesos || [])
        .flatMap((p: any) => p.repuestos || [])
        .reduce((sum: number, r: any) => sum + r.subtotal, 0);
    const totalManoObra = (orden.procesos || []).reduce((sum: number, p: any) => sum + p.costoManoObra, 0);
    const subtotalCalculado = totalRepuestos + totalManoObra;
    const impuestosCalculados = orden.aplicarIva ? subtotalCalculado * (orden.porcentajeIva / 100) : 0;
    const totalCalculado = subtotalCalculado + impuestosCalculados;

    return (
        <div className="bg-slate-50/30 min-h-screen pb-12">
            {/* --- Hero Header --- */}
            <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    {/* Top Bar: Back & Context */}
                    <div className="flex items-center justify-between mb-4">
                        <Link
                            href="/admin/ordenes-trabajo"
                            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Volver al Listado
                        </Link>
                        <div className="text-xs font-mono text-slate-400">
                            ID: {orden.$id}
                        </div>
                    </div>

                    {/* Main Header Content */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl shadow-inner border border-blue-200">
                                {orden.numeroOrden.slice(-2)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    {orden.numeroOrden}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <EstadoBadge estado={orden.estado} />
                                    <PrioridadBadge prioridad={orden.prioridad} />
                                    {orden.tieneGarantia && (
                                        <Badge variant="outline" className="text-indigo-600 bg-indigo-50 border-indigo-200 gap-1 text-[10px] h-5 px-1.5">
                                            ✓ Garantía
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="hidden sm:flex text-slate-600 border-slate-200">
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="text-slate-600 border-slate-200"
                                onClick={() => window.open(`/admin/ordenes/${orden.$id}/cotizacion`, '_blank')}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                PDF
                            </Button>

                            {getNextState() ? (
                                <ActionButton
                                    currentState={orden.estado}
                                    nextState={getNextState()!}
                                    onClick={handleOpenCambiarEstado}
                                />
                            ) : (
                                <Button disabled variant="outline" className="opacity-50 cursor-not-allowed bg-slate-50">
                                    Orden Finalizada
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Content Area --- */}
            <div className="container mx-auto px-6 py-6 transition-all duration-500">
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
                    {/* Navigation Tabs - Clean Design */}
                    <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                        <TabsList className="h-auto p-1 bg-white/60 backdrop-blur border rounded-xl inline-flex w-full md:w-auto min-w-max gap-1">
                            <TabItem value="overview" icon={FileCheck} label="Visión General" />
                            <TabItem value="procesos" icon={Settings} label="Procesos" count={orden.procesos?.length} />
                            <TabItem value="costos" icon={DollarSign} label="Costos" />
                            <TabItem value="pagos" icon={CreditCard} label="Pagos" isActive={currentTab === 'pagos'} />
                            <TabItem value="documentos" icon={FileText} label="Documentos" count={orden.checklist?.length} />
                            <TabItem value="comisiones" icon={Users} label="Comisiones" />
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <OrdenOverview orden={orden} cliente={cliente} vehiculo={vehiculo} />
                    </TabsContent>

                    <TabsContent value="procesos" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <OrdenProcesos
                            procesos={orden.procesos || []}
                            ordenId={orden.$id}
                            empleados={empleados}
                        />
                    </TabsContent>

                    <TabsContent value="costos" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <OrdenCostos
                            orden={orden}
                            repuestosUsados={[]}
                            procesos={orden.procesos || []}
                        />
                    </TabsContent>

                    <TabsContent value="documentos" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <OrdenDocumentos
                            ordenId={orden.$id}
                            checklists={orden.checklist || []}
                            empleadoId="current_user"
                        />
                    </TabsContent>

                    <TabsContent value="pagos" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {orden.factura ? (
                            <OrdenPagos
                                ordenId={orden.$id}
                                factura={orden.factura}
                                pagos={orden.pagos || []}
                                saldoPendiente={orden.factura ? (orden.factura.total - (orden.pagos || []).reduce((sum: number, p: any) => sum + p.monto, 0)) : 0}
                            />
                        ) : (
                            <EmptyStateInvoice onGenerate={() => setGenerarFacturaOpen(true)} />
                        )}
                    </TabsContent>

                    <TabsContent value="comisiones" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <OrdenComisiones
                            ordenId={orden.$id}
                            comisiones={orden.comisiones || []}
                            empleados={empleados}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* --- Dialogs --- */}

            {nuevoEstado && (
                <CambiarEstadoDialog
                    open={cambiarEstadoOpen}
                    onOpenChange={setCambiarEstadoOpen}
                    estadoActual={orden.estado}
                    estadoNuevo={nuevoEstado}
                    validationResult={validation}
                    onConfirm={handleConfirmarCambio}
                />
            )}

            <GenerarFacturaDialog
                open={generarFacturaOpen}
                onOpenChange={setGenerarFacturaOpen}
                ordenId={orden.$id}
                subtotal={subtotalCalculado}
                impuestos={impuestosCalculados}
                total={totalCalculado}
                onFacturaGenerada={() => window.location.reload()}
            />
        </div>
    );
}

// --- Helper Components ---

function TabItem({ value, icon: Icon, label, count, isActive = false }: any) {
    return (
        <TabsTrigger
            value={value}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-slate-50 transition-all border border-transparent data-[state=active]:border-slate-100"
        >
            <Icon className="h-4 w-4" />
            {label}
            {count > 0 && (
                <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full ml-1.5 font-bold">
                    {count}
                </span>
            )}
        </TabsTrigger>
    );
}

function ActionButton({ currentState, nextState, onClick }: any) {
    const config: Record<string, any> = {
        'COTIZANDO': { label: 'Aceptar Cotización', icon: CheckCircle, className: 'bg-blue-600 hover:bg-blue-700 text-white' },
        'ACEPTADA': { label: 'Iniciar Trabajo', icon: Play, className: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
        'EN_PROCESO': { label: 'Finalizar y Facturar', icon: FileText, className: 'bg-orange-600 hover:bg-orange-700 text-white' },
        'POR_PAGAR': { label: 'Completar Orden', icon: CheckCircle, className: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    };

    const style = config[currentState] || { label: 'Avanzar Estado', icon: Play, className: '' };
    const Icon = style.icon;

    return (
        <Button onClick={onClick} className={`${style.className} gap-2 shadow-sm`}>
            <Icon className="h-4 w-4" />
            {style.label}
        </Button>
    );
}

function EstadoBadge({ estado }: { estado: string }) {
    const estilos: Record<string, { color: string; label: string; dot: string }> = {
        'COTIZANDO': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', label: 'En Cotización' },
        'ACEPTADA': { color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Aceptada' },
        'EN_PROCESO': { color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', label: 'En Proceso' },
        'POR_PAGAR': { color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', label: 'Por Pagar' },
        'COMPLETADA': { color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Completada' },
        'CANCELADA': { color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Cancelada' },
    };
    const estilo = estilos[estado] || { color: 'bg-slate-100 text-slate-800', dot: 'bg-slate-500', label: estado };

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium ${estilo.color}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${estilo.dot}`} />
            {estilo.label}
        </div>
    );
}

function PrioridadBadge({ prioridad }: { prioridad: string }) {
    if (prioridad === 'URGENTE') {
        return (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider">
                <AlertTriangle className="h-3 w-3" />
                Urgente
            </div>
        );
    }
    return (
        <div className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-medium uppercase tracking-wider">
            Normal
        </div>
    );
}

function EmptyStateInvoice({ onGenerate }: { onGenerate: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-dashed border-slate-200 rounded-xl space-y-4 shadow-sm">
            <div className="p-4 bg-slate-50 rounded-full mb-2">
                <FileText className="h-10 w-10 text-slate-300" />
            </div>
            <div className="text-center max-w-sm">
                <h3 className="text-lg font-semibold text-slate-800">Facturación Pendiente</h3>
                <p className="text-muted-foreground mt-1 text-sm mb-6">
                    No se ha generado la factura para esta orden. Debes generarla para habilitar el módulo de pagos.
                </p>
                <Button onClick={onGenerate} className="gap-2 shadow-lg shadow-blue-500/20">
                    <FileText className="h-4 w-4" />
                    Generar Factura de Venta
                </Button>
            </div>
        </div>
    );
}
