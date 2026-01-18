"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, List, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Download, Filter, Plus, Plane, Clock, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { obtenerTodasLasVacaciones, aprobarVacaciones, rechazarVacaciones } from "@/lib/actions/vacaciones";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { SolicitarVacacionesDialog } from "@/components/asistencia/SolicitarVacacionesDialog";
import type { Vacacion, Empleado } from "@/types";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";

export default function VacacionesAdminPage() {
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
    const [empleados, setEmpleados] = useState<Record<string, Empleado>>({});
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        cargarDatos();
    }, [currentDate.getFullYear()]); // Reload if year changes

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [vacs, emps] = await Promise.all([
                obtenerTodasLasVacaciones(currentDate.getFullYear()),
                obtenerEmpleados()
            ]);

            setVacaciones(vacs);

            // Map employees for quick lookup
            const empMap: Record<string, Empleado> = {};
            emps.forEach(e => empMap[e.$id] = e);
            setEmpleados(empMap);

        } catch (error) {
            console.error(error);
            toast.error("Error cargando vacaciones");
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (id: string, empleadoId: string) => {
        try {
            await aprobarVacaciones(id, 'admin');
            toast.success("Vacaciones aprobadas");
            cargarDatos();
        } catch (error) {
            toast.error("Error aprobando vacaciones");
        }
    };

    const handleRechazar = async (id: string, empleadoId: string) => {
        try {
            await rechazarVacaciones(id, 'admin', 'Rechazado por administrador');
            toast.success("Vacaciones rechazadas");
            cargarDatos();
        } catch (error) {
            toast.error("Error rechazando vacaciones");
        }
    };

    // Calendar Helper
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    // KPI calculations
    const pendientes = vacaciones.filter(v => v.estado === 'PENDIENTE').length;
    const aprobadasMes = vacaciones.filter(v => {
        if (v.estado !== 'APROBADO') return false;
        return new Date(v.fechaInicio).getMonth() === currentDate.getMonth();
    }).length;
    const enVacaciones = vacaciones.filter(v => {
        if (v.estado !== 'APROBADO') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(v.fechaInicio);
        const end = new Date(v.fechaFin);
        return today >= start && today <= end;
    }).length;

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const blanks = Array.from({ length: firstDay }, (_, i) => i);

        // Filter vacations for this month
        const monthlyVacations = vacaciones.filter(v => {
            if (v.estado !== 'APROBADO') return false;
            const start = new Date(v.fechaInicio);
            const end = new Date(v.fechaFin);
            const currentMonthStart = new Date(year, month, 1);
            const currentMonthEnd = new Date(year, month + 1, 0);
            return (start <= currentMonthEnd && end >= currentMonthStart);
        });

        return (
            <Card className="overflow-hidden border-slate-200 shadow-lg">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {currentDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentDate(new Date(year, month - 1))}
                                className="bg-white shadow-md hover:shadow-lg transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentDate(new Date(year, month + 1))}
                                className="bg-white shadow-md hover:shadow-lg transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6 bg-white">
                    <div className="grid grid-cols-7 gap-2 mb-3">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, i) => (
                            <div key={day} className={`text-center text-sm font-bold py-2 ${i === 0 || i === 6 ? 'text-red-500' : 'text-slate-700'
                                }`}>
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {blanks.map(i => <div key={`blank-${i}`} className="aspect-square" />)}
                        {days.map(day => {
                            const date = new Date(year, month, day);

                            // Find vacations on this day
                            const daysVacations = monthlyVacations.filter(v => {
                                const start = new Date(v.fechaInicio);
                                const end = new Date(v.fechaFin);
                                start.setHours(0, 0, 0, 0);
                                end.setHours(0, 0, 0, 0);
                                date.setHours(0, 0, 0, 0);
                                return date >= start && date <= end;
                            });

                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                            return (
                                <motion.div
                                    key={day}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: day * 0.01 }}
                                    className={`
                                        aspect-square p-2 border rounded-xl relative group cursor-pointer
                                        transition-all hover:shadow-lg hover:scale-105
                                        ${isWeekend ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}
                                        ${daysVacations.length > 0 ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300' : ''}
                                    `}
                                >
                                    <span className={`text-sm font-bold block ${isWeekend ? 'text-red-600' : 'text-slate-700'
                                        }`}>
                                        {day}
                                    </span>

                                    <div className="mt-1 space-y-1 overflow-hidden">
                                        {daysVacations.slice(0, 3).map(v => {
                                            const emp = empleados[v.empleadoId];
                                            return (
                                                <div
                                                    key={v.$id}
                                                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold truncate shadow-sm"
                                                    title={`${emp?.nombre} ${emp?.apellido}`}
                                                >
                                                    {emp ? `${emp.nombre.split(' ')[0]} ${emp.apellido.charAt(0)}.` : '...'}
                                                </div>
                                            );
                                        })}
                                        {daysVacations.length > 3 && (
                                            <div className="text-[9px] px-1.5 py-0.5 text-purple-700 font-bold">
                                                +{daysVacations.length - 3} más
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        );
    };

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
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                                    <Plane className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                                        Gestión de Vacaciones
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">
                                        Administra solicitudes y visualiza la disponibilidad del equipo
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-orange-100 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Pendientes
                                                </p>
                                                <p className="text-5xl font-black mt-2">{pendientes}</p>
                                                <p className="text-xs text-orange-100 mt-1">Requieren atención</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <XCircle className="h-8 w-8" />
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
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Aprobadas Mes</p>
                                                <p className="text-5xl font-black mt-2">{aprobadasMes}</p>
                                                <p className="text-xs text-emerald-100 mt-1">Este mes</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <CheckCircle2 className="h-8 w-8" />
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
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider">En Vacaciones</p>
                                                <p className="text-5xl font-black mt-2">{enVacaciones}</p>
                                                <p className="text-xs text-purple-100 mt-1">Ahora mismo</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <Users className="h-8 w-8" />
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
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap items-center gap-3"
                        >
                            <Button
                                size="lg"
                                onClick={() => setCreateDialogOpen(true)}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Nueva Solicitud
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                            >
                                <Filter className="mr-2 h-5 w-5" />
                                Filtros
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

            {/* Content Section */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'list')} className="space-y-6">
                        <TabsList className="bg-white border shadow-md">
                            <TabsTrigger value="calendar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-pink-50">
                                <Calendar className="mr-2 h-4 w-4" />
                                Calendario de Equipo
                            </TabsTrigger>
                            <TabsTrigger value="list" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-pink-50">
                                <List className="mr-2 h-4 w-4" />
                                Lista de Solicitudes
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="calendar">
                            {loading ? (
                                <div className="flex items-center justify-center h-96">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-slate-600 font-medium">Cargando calendario...</p>
                                    </div>
                                </div>
                            ) : (
                                renderCalendar()
                            )}
                        </TabsContent>

                        <TabsContent value="list">
                            <Card className="shadow-xl border-slate-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">Historial de Solicitudes</h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Todas las solicitudes registradas en el año {currentDate.getFullYear()}
                                            </p>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-700 px-3 py-1.5">
                                            {vacaciones.length} solicitudes
                                        </Badge>
                                    </div>

                                    <div className="border rounded-xl overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gradient-to-r from-slate-50 to-purple-50">
                                                <TableRow>
                                                    <TableHead className="font-bold">Empleado</TableHead>
                                                    <TableHead className="font-bold">Fechas</TableHead>
                                                    <TableHead className="font-bold">Días</TableHead>
                                                    <TableHead className="font-bold">Motivo</TableHead>
                                                    <TableHead className="font-bold">Estado</TableHead>
                                                    <TableHead className="text-right font-bold">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {vacaciones.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center h-32">
                                                            <div className="flex flex-col items-center gap-3">
                                                                <Calendar className="h-12 w-12 text-slate-400" />
                                                                <p className="text-slate-600 font-medium">No hay solicitudes registradas</p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    vacaciones.map((vac, index) => {
                                                        const emp = empleados[vac.empleadoId];
                                                        return (
                                                            <motion.tr
                                                                key={vac.$id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                                className="hover:bg-purple-50/50 transition-colors"
                                                            >
                                                                <TableCell className="font-medium">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                                                            {emp?.nombre.charAt(0)}{emp?.apellido.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-slate-800">
                                                                                {emp ? `${emp.nombre} ${emp.apellido}` : 'Empleado desconocido'}
                                                                            </p>
                                                                            <p className="text-xs text-slate-500">{emp?.cargo}</p>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col text-sm">
                                                                        <span className="font-medium">Del {new Date(vac.fechaInicio).toLocaleDateString()}</span>
                                                                        <span className="text-slate-500">Al {new Date(vac.fechaFin).toLocaleDateString()}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                        {vac.diasSolicitados} días
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="max-w-[200px] truncate text-sm text-slate-600" title={vac.motivo}>
                                                                    {vac.motivo || '-'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {vac.estado === 'PENDIENTE' && <Badge className="bg-orange-100 text-orange-700 border-orange-300">Pendiente</Badge>}
                                                                    {vac.estado === 'APROBADO' && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">Aprobado</Badge>}
                                                                    {vac.estado === 'RECHAZADO' && <Badge className="bg-red-100 text-red-700 border-red-300">Rechazado</Badge>}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {vac.estado === 'PENDIENTE' && (
                                                                        <div className="flex justify-end gap-2">
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="h-9 w-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shadow-sm"
                                                                                onClick={() => handleAprobar(vac.$id, vac.empleadoId)}
                                                                            >
                                                                                <CheckCircle2 className="h-5 w-5" />
                                                                            </Button>
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 shadow-sm"
                                                                                onClick={() => handleRechazar(vac.$id, vac.empleadoId)}
                                                                            >
                                                                                <XCircle className="h-5 w-5" />
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                            </motion.tr>
                                                        );
                                                    })
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <SolicitarVacacionesDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={() => {
                    cargarDatos();
                    toast.success("Solicitud creada exitosamente");
                }}
            />
        </div>
    );
}
