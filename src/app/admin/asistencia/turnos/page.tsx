"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Settings,
    CalendarPlus,
    Download,
    Users,
    CalendarDays,
    TrendingUp,
    Sparkles
} from "lucide-react";
import {
    obtenerAsignacionesTodos
} from "@/lib/actions/turnos";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import type { AsignacionTurno, Empleado } from "@/types";
import { toast } from "sonner";
import { CalendarioTurnos } from "@/components/asistencia/CalendarioTurnos";
import { ConfiguracionTurnosDialog } from "@/components/asistencia/ConfiguracionTurnosDialog";
import { AsignarTurnoDialog } from "@/components/asistencia/AsignarTurnoDialog";

export default function TurnosAdminPage() {
    const [asignaciones, setAsignaciones] = useState<AsignacionTurno[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [configOpen, setConfigOpen] = useState(false);
    const [asignarOpen, setAsignarOpen] = useState(false);

    // Pre-filled data for assign dialog
    const [selectedEmpleadoId, setSelectedEmpleadoId] = useState("");

    useEffect(() => {
        cargarDatos();
    }, [currentDate]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [asigs, emps] = await Promise.all([
                obtenerAsignacionesTodos(),
                obtenerEmpleados()
            ]);

            setAsignaciones(asigs);
            setEmpleados(emps);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando turnos");
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleCellClick = (empleadoId: string, date: Date, currentAsignacion?: AsignacionTurno) => {
        setSelectedEmpleadoId(empleadoId);
        setAsignarOpen(true);
    };

    // Calculate KPIs
    const totalEmpleados = empleados.length;
    const empleadosConTurno = new Set(asignaciones.map(a => a.empleadoId)).size;
    const cobertura = totalEmpleados > 0 ? Math.round((empleadosConTurno / totalEmpleados) * 100) : 0;
    const totalAsignaciones = asignaciones.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Epic Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
                {/* Soft Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50" />
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

                <div className="relative px-6 pt-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Title Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                    <CalendarDays className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Gestión de Turnos
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">
                                        Cuadrante inteligente de horarios rotativos
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Total Empleados</p>
                                                <p className="text-5xl font-black mt-2">{totalEmpleados}</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <Users className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider">Cobertura</p>
                                                <p className="text-5xl font-black mt-2">{cobertura}%</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <TrendingUp className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Asignaciones</p>
                                                <p className="text-5xl font-black mt-2">{totalAsignaciones}</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <CalendarPlus className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider">Con Turno</p>
                                                <p className="text-5xl font-black mt-2">{empleadosConTurno}</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <Sparkles className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap items-center gap-3"
                        >
                            <Button
                                size="lg"
                                onClick={() => {
                                    setSelectedEmpleadoId("");
                                    setAsignarOpen(true);
                                }}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                            >
                                <CalendarPlus className="mr-2 h-5 w-5" />
                                Asignar Turno
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setConfigOpen(true)}
                                className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                            >
                                <Settings className="mr-2 h-5 w-5" />
                                Configurar Turnos
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Exportar
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Calendar Section */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card className="p-6 bg-white border-slate-200 shadow-xl">
                            {/* Month Navigator */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handlePreviousMonth}
                                        className="h-12 w-12 rounded-xl shadow-md hover:shadow-lg transition-all border-slate-300 bg-white hover:bg-slate-50"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <motion.div
                                        key={currentDate.toISOString()}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="min-w-[280px] text-center"
                                    >
                                        <h2 className="text-3xl font-black capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                                        </h2>
                                    </motion.div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleNextMonth}
                                        className="h-12 w-12 rounded-xl shadow-md hover:shadow-lg transition-all border-slate-300 bg-white hover:bg-slate-50"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            {loading ? (
                                <div className="flex items-center justify-center h-96">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-slate-600 font-medium">Cargando turnos...</p>
                                    </div>
                                </div>
                            ) : (
                                <CalendarioTurnos
                                    empleados={empleados}
                                    asignaciones={asignaciones}
                                    currentDate={currentDate}
                                    onCellClick={handleCellClick}
                                />
                            )}
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Dialogs */}
            <ConfiguracionTurnosDialog
                open={configOpen}
                onOpenChange={setConfigOpen}
            />

            <AsignarTurnoDialog
                open={asignarOpen}
                onOpenChange={setAsignarOpen}
                empleadoId={selectedEmpleadoId || undefined}
                onSuccess={cargarDatos}
            />
        </div>
    );
}
