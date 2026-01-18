"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Search, Download, Plus, Gift, Calendar, TrendingUp } from "lucide-react";
import { obtenerTodosLosCompensatorios } from "@/lib/actions/compensatorios";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import type { Compensatorio, Empleado } from "@/types";
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
import { GenerarCompensatorioDialog } from "@/components/asistencia/GenerarCompensatorioDialog";
import { motion } from "framer-motion";

export default function CompensatoriosAdminPage() {
    const [compensatorios, setCompensatorios] = useState<Compensatorio[]>([]);
    const [empleados, setEmpleados] = useState<Record<string, Empleado>>({});
    const [loading, setLoading] = useState(true);
    const [filterEstado, setFilterEstado] = useState<string>("todos");
    const [searchTerm, setSearchTerm] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [comps, emps] = await Promise.all([
                obtenerTodosLosCompensatorios(),
                obtenerEmpleados()
            ]);

            setCompensatorios(comps);

            const empMap: Record<string, Empleado> = {};
            emps.forEach(e => empMap[e.$id] = e);
            setEmpleados(empMap);

        } catch (error) {
            console.error(error);
            toast.error("Error cargando compensatorios");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'DISPONIBLE': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100">Disponible</Badge>;
            case 'USADO': return <Badge className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100">Redimido</Badge>;
            case 'VENCIDO': return <Badge className="bg-red-100 text-red-700 border-red-300 hover:bg-red-100">Vencido</Badge>;
            default: return <Badge variant="outline">{estado}</Badge>;
        }
    };

    const filteredData = compensatorios.filter(comp => {
        const emp = empleados[comp.empleadoId];
        const matchesSearch = emp
            ? `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        const matchesFilter = filterEstado === "todos" || comp.estado === filterEstado;
        return matchesSearch && matchesFilter;
    });

    const totalDisponibles = compensatorios.reduce((acc, curr) => curr.estado === 'DISPONIBLE' ? acc + curr.diasGanados : acc, 0);

    const porVencer = compensatorios.filter(c => {
        if (c.estado !== 'DISPONIBLE') return false;
        const venc = new Date(c.fechaVencimiento);
        const now = new Date();
        const diffTime = venc.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
    }).length;

    const redimidosMes = compensatorios.filter(c => {
        if (c.estado !== 'USADO' || !c.fechaUso) return false;
        const uso = new Date(c.fechaUso);
        const now = new Date();
        return uso.getMonth() === now.getMonth() && uso.getFullYear() === now.getFullYear();
    }).length;

    // Check if compensation is expiring soon
    const isExpiringSoon = (fechaVencimiento: string) => {
        const venc = new Date(fechaVencimiento);
        const now = new Date();
        const diffTime = venc.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            {/* Epic Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
                {/* Soft Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 via-emerald-50/50 to-teal-50/50" />
                <div className="absolute top-0 -left-4 w-72 h-72 bg-green-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

                <div className="relative px-6 pt-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Title Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                                    <Gift className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                        Días Compensatorios
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">
                                        Gestión de días ganados por trabajo en dominicales y festivos
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
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Días Disponibles
                                                </p>
                                                <p className="text-5xl font-black mt-2">{totalDisponibles.toFixed(1)}</p>
                                                <p className="text-xs text-emerald-100 mt-1">Acumulados por el equipo</p>
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
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider">Por Vencer (30d)</p>
                                                <p className="text-5xl font-black mt-2">{porVencer}</p>
                                                <p className="text-xs text-amber-100 mt-1">Requieren atención</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <AlertCircle className="h-8 w-8" />
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
                                                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Redimidos Mes</p>
                                                <p className="text-5xl font-black mt-2">{redimidosMes}</p>
                                                <p className="text-xs text-blue-100 mt-1">Este mes</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <CheckCircle2 className="h-8 w-8" />
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
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Generar Manual
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
                        <CardContent className="p-6">
                            {/* Filters */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Historial de Compensatorios</h3>
                                    <p className="text-sm text-slate-500 mt-1">Registro completo de días generados y su estado</p>
                                </div>
                                <Badge className="bg-green-100 text-green-700 px-3 py-1.5">
                                    {compensatorios.length} registros
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
                                        <SelectItem value="DISPONIBLE">Disponibles</SelectItem>
                                        <SelectItem value="USADO">Redimidos</SelectItem>
                                        <SelectItem value="VENCIDO">Vencidos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Table */}
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gradient-to-r from-slate-50 to-green-50">
                                        <TableRow>
                                            <TableHead className="font-bold">Empleado</TableHead>
                                            <TableHead className="font-bold">Fecha Ganado</TableHead>
                                            <TableHead className="font-bold">Vencimiento</TableHead>
                                            <TableHead className="font-bold">Días</TableHead>
                                            <TableHead className="font-bold">Motivo</TableHead>
                                            <TableHead className="font-bold">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-32">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                                                        <p className="text-slate-600 font-medium">Cargando compensatorios...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-32">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Gift className="h-12 w-12 text-slate-400" />
                                                        <p className="text-slate-600 font-medium">No se encontraron registros</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredData.map((comp, index) => {
                                                const emp = empleados[comp.empleadoId];
                                                const expiringSoon = isExpiringSoon(comp.fechaVencimiento);

                                                return (
                                                    <motion.tr
                                                        key={comp.$id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className={`hover:bg-green-50/50 transition-colors ${expiringSoon ? 'bg-orange-50/30' : ''}`}
                                                    >
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
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
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                                <span className="font-medium">{new Date(comp.fechaGanado).toLocaleDateString()}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-medium ${expiringSoon ? 'text-orange-600' : 'text-slate-600'}`}>
                                                                    {new Date(comp.fechaVencimiento).toLocaleDateString()}
                                                                </span>
                                                                {expiringSoon && (
                                                                    <Badge className="bg-orange-100 text-orange-700 text-xs border-orange-300">
                                                                        ¡Pronto!
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className="bg-green-100 text-green-700 border-green-300 font-bold">
                                                                {comp.diasGanados} {comp.diasGanados === 1 ? 'día' : 'días'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px] truncate text-sm text-slate-600" title={comp.motivo}>
                                                            {comp.motivo || 'Trabajo Dominical/Festivo'}
                                                        </TableCell>
                                                        <TableCell>{getStatusBadge(comp.estado)}</TableCell>
                                                    </motion.tr>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <GenerarCompensatorioDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={cargarDatos}
            />
        </div>
    );
}
