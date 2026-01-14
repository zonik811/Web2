"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, ChevronRight, Wrench, Calendar, Clock, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";
import {
    ClienteSelector,
    VehiculoSelector,
    ChecklistVehiculoForm
} from "@/components/ordenes-trabajo";
import type { Cliente, Vehiculo, PrioridadOrden } from "@/types";
import { crearOrdenTrabajo } from "@/lib/actions/ordenes-trabajo";
import { crearChecklist } from "@/lib/actions/ot-checklist-vehiculo";

interface NuevaOrdenPageClientProps {
    clientes: Cliente[];
    vehiculosIniciales: Vehiculo[];
}

export default function NuevaOrdenPageClient({
    clientes, // Still receiving initial list, but client selector will search dynamically
    vehiculosIniciales
}: NuevaOrdenPageClientProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Cliente y Vehículo
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null);
    const [vehiculosDisponibles, setVehiculosDisponibles] = useState<Vehiculo[]>([]);

    // Step 2: Detalles de la OT
    const [fechaIngreso, setFechaIngreso] = useState<Date>(new Date());
    const [fechaEntrega, setFechaEntrega] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const [motivoIngreso, setMotivoIngreso] = useState("");
    const [diagnostico, setDiagnostico] = useState("");
    const [prioridad, setPrioridad] = useState<PrioridadOrden>("NORMAL");
    const [tieneGarantia, setTieneGarantia] = useState(true);
    const [diasGarantia, setDiasGarantia] = useState(90);

    // Step 3: Checklist
    const [checklistData, setChecklistData] = useState<any>(null);

    const handleClienteSelect = (cliente: Cliente | null) => {
        setClienteSeleccionado(cliente);
        setVehiculoSeleccionado(null);
        if (cliente) {
            // In a real optimized app, we would fetch vehicles for this client here via Server Action
            // For now, filtering the initial list (assuming it's all vehicles or we need to fetch)
            // But since 'vehiculosIniciales' might be too big or empty if we optimized fetching, 
            // the robust way is to pass initial ones or fetch them.
            // As per current architecture, we are receiving ALL vehicles.
            const vehiculosCliente = vehiculosIniciales.filter(v => v.clienteId === cliente.$id);
            setVehiculosDisponibles(vehiculosCliente);
        } else {
            setVehiculosDisponibles([]);
        }
    };

    const handleCrearOrden = async () => {
        if (!clienteSeleccionado || !vehiculoSeleccionado || !checklistData) return;

        setLoading(true);
        try {
            // 1. Crear Orden de Trabajo
            const ordenResponse = await crearOrdenTrabajo({
                clienteId: clienteSeleccionado.$id,
                vehiculoId: vehiculoSeleccionado.$id,
                fechaIngreso: fechaIngreso.toISOString(),
                fechaEstimadaEntrega: fechaEntrega.toISOString(),
                motivoIngreso,
                diagnosticoInicial: diagnostico,
                prioridad,
                tieneGarantia,
                diasGarantia: tieneGarantia ? diasGarantia : undefined,
            });

            if (!ordenResponse.success || !ordenResponse.data) {
                throw new Error(ordenResponse.error || "Error creando orden");
            }

            // 2. Crear Checklist de Recepción
            await crearChecklist({
                ...checklistData,
                ordenTrabajoId: ordenResponse.data.$id,
            });

            // 3. Redirigir a la orden creada
            router.push(`/admin/ordenes-trabajo/${ordenResponse.data.$id}`);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al crear la orden de trabajo");
        } finally {
            setLoading(false);
        }
    };

    const canContinueStep1 = clienteSeleccionado && vehiculoSeleccionado;
    const canContinueStep2 = motivoIngreso.trim() !== "";
    const canCreateOrder = checklistData !== null;

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl">
            {/* Header */}
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <Link href="/admin/ordenes-trabajo">
                    <Button variant="ghost" className="gap-2 mb-4 text-slate-500 hover:text-slate-900 -ml-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver al Listado
                    </Button>
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nueva Orden de Trabajo</h1>
                        <p className="text-slate-500 mt-1">Registra un nuevo servicio en el sistema</p>
                    </div>
                    {/* Steps Visual Indicator */}
                    <div className="hidden md:flex items-center gap-2 bg-white p-2 rounded-full shadow-sm border border-slate-100">
                        <StepPill number={1} active={step === 1} completed={step > 1} label="Cliente" />
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                        <StepPill number={2} active={step === 2} completed={step > 2} label="Detalles" />
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                        <StepPill number={3} active={step === 3} completed={false} label="Checklist" />
                    </div>
                </div>
            </div>

            <div className="grid gap-8 animate-in fade-in duration-700">

                {/* Step 1: Cliente y Vehículo */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-12 gap-6">
                            {/* Left Column: Client Selection */}
                            <div className="md:col-span-12 lg:col-span-5">
                                <Card className="h-full border-none shadow-md bg-white">
                                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
                                            Seleccionar Cliente
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <ClienteSelector
                                            clientes={clientes}
                                            clienteSeleccionado={clienteSeleccionado}
                                            onClienteSelect={handleClienteSelect}
                                            onNuevoCliente={() => {/* Implement new client modal later if needed */ }}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Vehicle Selection */}
                            <div className={`md:col-span-12 lg:col-span-7 transition-all duration-300 ${!clienteSeleccionado ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                <Card className="h-full border-none shadow-md bg-white">
                                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>
                                            Seleccionar Vehículo
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {clienteSeleccionado ? (
                                            <VehiculoSelector
                                                clienteId={clienteSeleccionado.$id}
                                                vehiculos={vehiculosDisponibles}
                                                vehiculoSeleccionado={vehiculoSeleccionado}
                                                onVehiculoSelect={setVehiculoSeleccionado}
                                            // When new vehicle created, current selector handles adding it to list
                                            // We don't need additional logic here unless we want to refetch
                                            />
                                        ) : (
                                            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
                                                Selecciona un cliente primero
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={() => setStep(2)}
                                disabled={!canContinueStep1}
                                size="lg"
                                className="px-8 shadow-lg shadow-primary/20"
                            >
                                Continuar a Detalles
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Detalles de la OT */}
                {step === 2 && (
                    <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-right-4 duration-500">
                        <Card className="border-none shadow-lg bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 py-6">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Wrench className="h-5 w-5 text-primary" />
                                    </div>
                                    Detalles del Servicio
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-8 px-8">
                                {/* Fechas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-slate-700 font-semibold flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            Fecha de Ingreso
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                value={fechaIngreso.toISOString().split('T')[0]}
                                                onChange={(e) => setFechaIngreso(new Date(e.target.value))}
                                                className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-primary/20 hover:border-primary/30 transition-all font-medium text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-slate-700 font-semibold flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-400" />
                                            Fecha Estimada de Entrega
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                value={fechaEntrega.toISOString().split('T')[0]}
                                                onChange={(e) => setFechaEntrega(new Date(e.target.value))}
                                                className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-primary/20 hover:border-primary/30 transition-all font-medium text-slate-700"
                                                min={fechaIngreso.toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 w-full" />

                                {/* Diagnóstico */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="motivo" className="text-slate-700 font-semibold flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            Motivo de Ingreso <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="motivo"
                                            value={motivoIngreso}
                                            onChange={(e) => setMotivoIngreso(e.target.value)}
                                            placeholder="Describe detalladamente el problema reportado por el cliente..."
                                            className="resize-none min-h-[120px] bg-amber-50/30 border-amber-100 focus:border-amber-300 focus:ring-amber-200/50 transition-all text-base"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="diagnostico" className="text-slate-700 font-semibold flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-slate-400" />
                                            Diagnóstico Inicial (Opcional)
                                        </Label>
                                        <Textarea
                                            id="diagnostico"
                                            value={diagnostico}
                                            onChange={(e) => setDiagnostico(e.target.value)}
                                            placeholder="Observaciones técnicas iniciales del receptor..."
                                            className="resize-none min-h-[100px] bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 w-full" />

                                {/* Configuración */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <div className="space-y-3">
                                        <Label htmlFor="prioridad" className="text-slate-700 font-medium">Prioridad</Label>
                                        <Select value={prioridad} onValueChange={(v) => setPrioridad(v as PrioridadOrden)}>
                                            <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NORMAL">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                                                        Normal
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="URGENTE">
                                                    <div className="flex items-center gap-2 text-red-600 font-medium">
                                                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                                        URGENTE
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="garantia" className="text-slate-700 font-medium">¿Aplica Garantía?</Label>
                                        <Select value={tieneGarantia ? "si" : "no"} onValueChange={(v) => setTieneGarantia(v === "si")}>
                                            <SelectTrigger className={`h-11 border-slate-200 shadow-sm ${tieneGarantia ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white'}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="si">Sí, con garantía</SelectItem>
                                                <SelectItem value="no">No, servicio regular</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {tieneGarantia && (
                                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                                            <Label htmlFor="diasGarantia" className="text-slate-700 font-medium">Duración de Garantía</Label>
                                            <Select value={diasGarantia.toString()} onValueChange={(v) => setDiasGarantia(parseInt(v))}>
                                                <SelectTrigger className="h-11 bg-white border-green-200 text-green-700 shadow-sm font-medium">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="30">30 días</SelectItem>
                                                    <SelectItem value="60">60 días</SelectItem>
                                                    <SelectItem value="90">90 días</SelectItem>
                                                    <SelectItem value="180">6 meses</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-between pt-6">
                            <Button variant="outline" onClick={() => setStep(1)} size="lg" className="h-12 px-6 border-slate-200 hover:bg-slate-50 hover:text-slate-900 group">
                                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                Atrás (Vehículo)
                            </Button>
                            <Button
                                onClick={() => setStep(3)}
                                disabled={!canContinueStep2}
                                size="lg"
                                className="h-12 px-8 shadow-xl shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold group transition-all hover:scale-105 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:scale-100 disabled:pointer-events-none"
                            >
                                Continuar a Checklist
                                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Checklist */}
                {step === 3 && vehiculoSeleccionado && clienteSeleccionado && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <ChecklistVehiculoForm
                            nombreCliente={clienteSeleccionado.nombre}
                            empleadoInspectorId="ADMIN" // TODO: Get from auth
                            onChecklistComplete={setChecklistData}
                        />

                        <div className="flex justify-between pt-4 pb-12">
                            <Button variant="outline" onClick={() => setStep(2)} size="lg">
                                Atrás
                            </Button>
                            <Button
                                onClick={handleCrearOrden}
                                disabled={!canCreateOrder || loading}
                                size="lg"
                                className="gap-2 px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                            >
                                {loading ? "Creando Orden..." : (
                                    <>
                                        <Check className="h-5 w-5" />
                                        Crear Orden de Trabajo
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StepPill({ number, active, completed, label }: { number: number; active: boolean; completed: boolean; label: string }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${active ? 'bg-primary text-primary-foreground shadow-sm' : completed ? 'text-primary font-medium' : 'text-slate-400'}`}>
            <div className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${active ? 'bg-white text-primary' : completed ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                {completed ? <Check className="h-3 w-3" /> : number}
            </div>
            <span className="text-sm">{label}</span>
        </div>
    );
}
