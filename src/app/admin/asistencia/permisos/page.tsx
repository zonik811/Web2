"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Download,
    FileText,
    Eye,
    Briefcase,
    FileCheck,
    AlertCircle
} from "lucide-react";
import {
    obtenerTodosLosPermisos,
    aprobarPermiso,
    rechazarPermiso
} from "@/lib/actions/permisos";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import type { Permiso, Empleado } from "@/types";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function PermisosAdminPage() {
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const [empleados, setEmpleados] = useState<Record<string, Empleado>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState<string>("todos");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [viewPermiso, setViewPermiso] = useState<Permiso | null>(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [perms, emps] = await Promise.all([
                obtenerTodosLosPermisos(),
                obtenerEmpleados()
            ]);

            setPermisos(perms);

            const empMap: Record<string, Empleado> = {};
            emps.forEach(e => empMap[e.$id] = e);
            setEmpleados(empMap);

        } catch (error) {
            console.error(error);
            toast.error("Error cargando permisos");
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (id: string, adminId: string = 'admin') => {
        setProcessingId(id);
        try {
            const res = await aprobarPermiso(id, adminId);
            if (res.success) {
                toast.success("Permiso aprobado");
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
        const motivo = prompt("Motivo del rechazo:");
        if (!motivo) return;

        setProcessingId(id);
        try {
            const res = await rechazarPermiso(id, adminId, motivo);
            if (res.success) {
                toast.success("Permiso rechazado");
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
            case 'MEDICO': return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Médico</Badge>;
            case 'REMUNERADO': return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Remunerado</Badge>;
            case 'NO_REMUNERADO': return <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">No Remunerado</Badge>;
            case 'CALAMIDAD': return <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">Calamidad</Badge>;
            default: return <Badge variant="outline">{tipo}</Badge>;
        }
    };

    const filteredData = permisos.filter(perm => {
        const emp = empleados[perm.empleadoId];
        const matchesSearch = emp
            ? `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        const matchesFilter = filterEstado === "todos" || perm.estado === filterEstado;
        return matchesSearch && matchesFilter;
    });

    const pendientes = permisos.filter(p => p.estado === 'PENDIENTE').length;
    const aprobadosMes = permisos.filter(p => {
        if (p.estado !== 'APROBADO') return false;
        const d = new Date(p.fechaInicio);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
            {/* Epic Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
                {/* Soft Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 via-blue-50/50 to-indigo-50/50" />
                <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

                <div className="relative px-6 pt-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Title Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                                    <Briefcase className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        Gestión de Permisos
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">
                                        Administración de incapacidades y licencias
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
                                                <p className="text-xs text-amber-100 mt-1">Requieren revisión</p>
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
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Aprobados Mes</p>
                                                <p className="text-5xl font-black mt-2">{aprobadosMes}</p>
                                                <p className="text-xs text-emerald-100 mt-1">Licencias activas</p>
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
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-cyan-100 text-sm font-semibold uppercase tracking-wider">Total Histórico</p>
                                                <p className="text-5xl font-black mt-2">{permisos.length}</p>
                                                <p className="text-xs text-cyan-100 mt-1">Solicitudes procesadas</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <FileCheck className="h-8 w-8" />
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

                            {/* Table */}
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                                        <TableRow>
                                            <TableHead className="font-bold">Empleado</TableHead>
                                            <TableHead className="font-bold">Fechas</TableHead>
                                            <TableHead className="font-bold">Tipo</TableHead>
                                            <TableHead className="font-bold">Motivo</TableHead>
                                            <TableHead className="font-bold">Estado</TableHead>
                                            <TableHead className="text-right font-bold">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-32">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                                        <p className="text-slate-600 font-medium">Cargando permisos...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-32">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <FileText className="h-12 w-12 text-slate-400" />
                                                        <p className="text-slate-600 font-medium">No se encontraron registros</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredData.map((perm, index) => {
                                                const emp = empleados[perm.empleadoId];
                                                return (
                                                    <motion.tr
                                                        key={perm.$id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="hover:bg-cyan-50/50 transition-colors"
                                                    >
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
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
                                                            <div className="flex flex-col text-sm">
                                                                <span className="font-medium">Desde: {new Date(perm.fechaInicio).toLocaleDateString()}</span>
                                                                <span className="text-slate-500">Hasta: {new Date(perm.fechaFin).toLocaleDateString()}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                {getTypeBadge(perm.tipo)}
                                                                {perm.subtipo && <p className="text-xs text-slate-500 font-medium">{perm.subtipo}</p>}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px] truncate text-sm text-slate-600" title={perm.motivo}>
                                                            {perm.motivo}
                                                        </TableCell>
                                                        <TableCell>{getStatusBadge(perm.estado)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={() => setViewPermiso(perm)}
                                                                    className="h-9 w-9 hover:bg-blue-50 shadow-sm"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                {perm.estado === 'PENDIENTE' && (
                                                                    <>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-9 w-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shadow-sm"
                                                                            onClick={() => handleAprobar(perm.$id)}
                                                                            disabled={processingId === perm.$id}
                                                                        >
                                                                            <CheckCircle2 className="h-5 w-5" />
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 shadow-sm"
                                                                            onClick={() => handleRechazar(perm.$id)}
                                                                            disabled={processingId === perm.$id}
                                                                        >
                                                                            <XCircle className="h-5 w-5" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
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
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!viewPermiso} onOpenChange={(o) => !o && setViewPermiso(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader className="pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Detalle del Permiso</DialogTitle>
                                <DialogDescription className="mt-1">
                                    Información completa de la solicitud
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    {viewPermiso && (
                        <div className="space-y-5 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <h4 className="font-bold text-sm text-slate-700 mb-2">Empleado</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                            {empleados[viewPermiso.empleadoId]?.nombre.charAt(0)}{empleados[viewPermiso.empleadoId]?.apellido.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{empleados[viewPermiso.empleadoId]?.nombre} {empleados[viewPermiso.empleadoId]?.apellido}</p>
                                            <p className="text-xs text-slate-500">{empleados[viewPermiso.empleadoId]?.cargo}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <h4 className="font-bold text-sm text-slate-700 mb-2">Tipo</h4>
                                    <div className="space-y-2">
                                        {getTypeBadge(viewPermiso.tipo)}
                                        {viewPermiso.subtipo && <p className="text-sm text-slate-600 font-medium">{viewPermiso.subtipo}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <h4 className="font-bold text-sm text-blue-800 mb-2">Fecha Inicio</h4>
                                    <p className="font-semibold text-blue-900">{new Date(viewPermiso.fechaInicio).toLocaleDateString()} {viewPermiso.horaInicio ? viewPermiso.horaInicio : ''}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <h4 className="font-bold text-sm text-blue-800 mb-2">Fecha Fin</h4>
                                    <p className="font-semibold text-blue-900">{new Date(viewPermiso.fechaFin).toLocaleDateString()} {viewPermiso.horaFin ? viewPermiso.horaFin : ''}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-sm text-slate-700 mb-2">Motivo</h4>
                                <p className="text-sm bg-slate-100 p-4 rounded-lg border border-slate-200">{viewPermiso.motivo}</p>
                            </div>

                            {viewPermiso.adjunto && (
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-2">Adjunto</h4>
                                    <Button variant="outline" size="sm" className="w-full justify-start bg-white">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Ver Documento Adjunto
                                    </Button>
                                </div>
                            )}

                            {viewPermiso.comentarios && (
                                <div>
                                    <h4 className="font-bold text-sm text-slate-500 mb-2">Notas Administrativas</h4>
                                    <p className="text-sm italic text-slate-600">{viewPermiso.comentarios}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                {viewPermiso.estado === 'PENDIENTE' ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="bg-white border-red-300 text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                handleRechazar(viewPermiso.$id);
                                                setViewPermiso(null);
                                            }}
                                        >
                                            Rechazar
                                        </Button>
                                        <Button
                                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                                            onClick={() => {
                                                handleAprobar(viewPermiso.$id);
                                                setViewPermiso(null);
                                            }}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Aprobar Solicitud
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="outline" onClick={() => setViewPermiso(null)} className="bg-white">Cerrar</Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
