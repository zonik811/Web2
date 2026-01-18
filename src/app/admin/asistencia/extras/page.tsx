"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Search, Download, Plus, Calendar, Zap, Moon, Sun } from "lucide-react";
import { obtenerTodasLasExtras, aprobarHoraExtra, rechazarHoraExtra } from "@/lib/actions/horas-extras";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import type { HoraExtra, Empleado } from "@/types";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistrarHoraExtraDialog } from "@/components/asistencia/RegistrarHoraExtraDialog";
import { motion } from "framer-motion";

export default function ExtrasAdminPage() {
    const [extras, setExtras] = useState<HoraExtra[]>([]);
    const [empleados, setEmpleados] = useState<Record<string, Empleado>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState<string>("todos");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [exts, emps] = await Promise.all([
                obtenerTodasLasExtras(),
                obtenerEmpleados()
            ]);

            setExtras(exts);

            const empMap: Record<string, Empleado> = {};
            emps.forEach(e => empMap[e.$id] = e);
            setEmpleados(empMap);

        } catch (error) {
            console.error(error);
            toast.error("Error cargando horas extras");
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (id: string, adminId: string = 'admin') => {
        setProcessingId(id);
        try {
            const res = await aprobarHoraExtra(id, adminId);
            if (res.success) {
                toast.success("Hora extra aprobada");
                await cargarDatos();
            } else {
                toast.error(res.error || "Error al aprobar");
            }
        } catch (e) {
            toast.error("Error inesperado");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRechazar = async (id: string, adminId: string = 'admin') => {
        setProcessingId(id);
        try {
            const res = await rechazarHoraExtra(id, adminId);
            if (res.success) {
                toast.success("Hora extra rechazada");
                await cargarDatos();
            } else {
                toast.error(res.error || "Error al rechazar");
            }
        } catch (e) {
            toast.error("Error inesperado");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'APROBADO': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100">Aprobado</Badge>;
            case 'RECHAZADO': return <Badge className="bg-red-100 text-red-700 border-red-300 hover:bg-red-100">Rechazado</Badge>;
            case 'PENDIENTE': return <Badge className="bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-100">Pendiente</Badge>;
            default: return <Badge variant="outline">{estado}</Badge>;
        }
    };

    const getTypeBadge = (tipo: string) => {
        switch (tipo) {
            case 'NOCTURNA': return (
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300">
                    <Moon className="h-3 w-3 mr-1" />
                    Nocturna
                </Badge>
            );
            case 'DOMINICAL': return (
                <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                    <Calendar className="h-3 w-3 mr-1" />
                    Dominical
                </Badge>
            );
            case 'FESTIVA': return (
                <Badge className="bg-red-100 text-red-700 border-red-300">
                    <Zap className="h-3 w-3 mr-1" />
                    Festiva
                </Badge>
            );
            default: return (
                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                    <Sun className="h-3 w-3 mr-1" />
                    Diurna
                </Badge>
            );
        }
    };

    const filteredData = extras.filter(ex => {
        const emp = empleados[ex.empleadoId];
        const matchesSearch = emp
            ? `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        const matchesFilter = filterEstado === "todos" || ex.estado === filterEstado;
        return matchesSearch && matchesFilter;
    });

    const pendientes = extras.filter(e => e.estado === 'PENDIENTE').length;
    const aprobadasMes = extras.filter(e => {
        if (e.estado !== 'APROBADO') return false;
        const d = new Date(e.fecha);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const horasTotalesMes = extras
        .filter(e => {
            const d = new Date(e.fecha);
            const now = new Date();
            return e.estado === 'APROBADO' && d.getMonth() === now.getMonth();
        })
        .reduce((acc, curr) => acc + curr.cantidadHoras, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
            {/* Epic Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
                {/* Soft Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/50 via-orange-50/50 to-amber-50/50" />
                <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

                <div className="relative px-6 pt-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Title Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                                    <Zap className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                                        Horas Extras
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">
                                        Gestión y aprobación de tiempo suplementario
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
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Pendientes
                                                </p>
                                                <p className="text-5xl font-black mt-2">{pendientes}</p>
                                                <p className="text-xs text-amber-100 mt-1">Requieren aprobación</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <Clock className="h-8 w-8" />
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
                                                <p className="text-xs text-emerald-100 mt-1">Registros procesados</p>
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
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Horas Totales</p>
                                                <p className="text-5xl font-black mt-2">{horasTotalesMes.toFixed(1)}</p>
                                                <p className="text-xs text-blue-100 mt-1">Acumuladas este mes</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <Zap className="h-8 w-8" />
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
                                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Nueva Solicitud
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                            >
                                <Calendar className="mr-2 h-5 w-5" />
                                Festivos
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
                    <Card className="shadow-xl border-slate-200">
                        <Tabs defaultValue="listado" className="w-full">
                            <div className="p-6 pb-0">
                                <TabsList className="bg-gradient-to-r from-slate-100 to-orange-50 border shadow-sm">
                                    <TabsTrigger value="listado" className="data-[state=active]:bg-white data-[state=active]:shadow">
                                        Listado General
                                    </TabsTrigger>
                                    <TabsTrigger value="pendientes" className="data-[state=active]:bg-white data-[state=active]:shadow">
                                        Sólo Pendientes
                                    </TabsTrigger>
                                </TabsList>

                                <div className="flex items-center justify-between mt-6 mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Historial de Horas Extras</h3>
                                        <p className="text-sm text-slate-500 mt-1">Registro completo de tiempo suplementario</p>
                                    </div>
                                    <Badge className="bg-yellow-100 text-yellow-700 px-3 py-1.5">
                                        {extras.length} registros
                                    </Badge>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Buscar empleado..."
                                            className="pl-10 bg-white border-slate-300"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select value={filterEstado} onValueChange={setFilterEstado}>
                                        <SelectTrigger className="w-[200px] bg-white border-slate-300">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos los estados</SelectItem>
                                            <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                                            <SelectItem value="APROBADO">Aprobados</SelectItem>
                                            <SelectItem value="RECHAZADO">Rechazados</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <TabsContent value="listado" className="m-0 p-6 pt-0">
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gradient-to-r from-slate-50 to-orange-50">
                                            <TableRow>
                                                <TableHead className="font-bold">Empleado</TableHead>
                                                <TableHead className="font-bold">Fecha</TableHead>
                                                <TableHead className="font-bold">Horario</TableHead>
                                                <TableHead className="font-bold">Horas</TableHead>
                                                <TableHead className="font-bold">Tipo</TableHead>
                                                <TableHead className="font-bold">Estado</TableHead>
                                                <TableHead className="text-right font-bold">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center h-32">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="h-12 w-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                                                            <p className="text-slate-600 font-medium">Cargando horas extras...</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center h-32">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <Zap className="h-12 w-12 text-slate-400" />
                                                            <p className="text-slate-600 font-medium">No se encontraron registros</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredData.map((extra, index) => {
                                                    const emp = empleados[extra.empleadoId];
                                                    return (
                                                        <motion.tr
                                                            key={extra.$id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="hover:bg-orange-50/50 transition-colors"
                                                        >
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                                        {emp?.nombre.charAt(0)}{emp?.apellido.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-800">
                                                                            {emp ? `${emp.nombre} ${emp.apellido}` : 'Desconocido'}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500">{emp?.cargo}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-slate-400" />
                                                                    <span className="font-medium">{new Date(extra.fecha).toLocaleDateString()}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-slate-600 font-medium">
                                                                {extra.horaInicio} - {extra.horaFin}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-blue-100 text-blue-700 border-blue-300 font-bold text-base">
                                                                    {extra.cantidadHoras}h
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{getTypeBadge(extra.tipo)}</TableCell>
                                                            <TableCell>{getStatusBadge(extra.estado)}</TableCell>
                                                            <TableCell className="text-right">
                                                                {extra.estado === 'PENDIENTE' && (
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-9 w-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shadow-sm"
                                                                            onClick={() => handleAprobar(extra.$id)}
                                                                            disabled={processingId === extra.$id}
                                                                        >
                                                                            <CheckCircle2 className="h-5 w-5" />
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 shadow-sm"
                                                                            onClick={() => handleRechazar(extra.$id)}
                                                                            disabled={processingId === extra.$id}
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
                            </TabsContent>

                            <TabsContent value="pendientes" className="m-0 p-6 pt-0">
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gradient-to-r from-slate-50 to-orange-50">
                                            <TableRow>
                                                <TableHead className="font-bold">Empleado</TableHead>
                                                <TableHead className="font-bold">Fecha</TableHead>
                                                <TableHead className="font-bold">Horario</TableHead>
                                                <TableHead className="font-bold">Horas</TableHead>
                                                <TableHead className="font-bold">Tipo</TableHead>
                                                <TableHead className="text-right font-bold">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredData.filter(e => e.estado === 'PENDIENTE').length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center h-32">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                                                            <p className="text-slate-600 font-medium">No hay solicitudes pendientes</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredData.filter(e => e.estado === 'PENDIENTE').map((extra, index) => {
                                                    const emp = empleados[extra.empleadoId];
                                                    return (
                                                        <motion.tr
                                                            key={extra.$id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="hover:bg-amber-50 transition-colors"
                                                        >
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                                        {emp?.nombre.charAt(0)}{emp?.apellido.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-800">
                                                                            {emp ? `${emp.nombre} ${emp.apellido}` : 'Desconocido'}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500">{emp?.cargo}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-slate-400" />
                                                                    <span className="font-medium">{new Date(extra.fecha).toLocaleDateString()}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-slate-600 font-medium">
                                                                {extra.horaInicio} - {extra.horaFin}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-blue-100 text-blue-700 border-blue-300 font-bold text-base">
                                                                    {extra.cantidadHoras}h
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>{getTypeBadge(extra.tipo)}</TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
                                                                        onClick={() => handleAprobar(extra.$id)}
                                                                        disabled={processingId === extra.$id}
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                        Aprobar
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                                                        onClick={() => handleRechazar(extra.$id)}
                                                                        disabled={processingId === extra.$id}
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-1" />
                                                                        Rechazar
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </motion.tr>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </Card>
                </div>
            </div>

            <RegistrarHoraExtraDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={cargarDatos}
            />
        </div>
    );
}
