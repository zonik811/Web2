"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus,
    Calendar as CalendarIcon,
    Search,
    MapPin,
    Clock,
    User,
    ChevronRight,
    Users,
    LayoutGrid,
    List,
    CheckCircle,
    TrendingUp,
    DollarSign
} from "lucide-react";
import { obtenerCitas } from "@/lib/actions/citas";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { formatearFecha, formatearPrecio, nombreCompleto } from "@/lib/utils";
import { obtenerURLArchivo } from "@/lib/appwrite";
import { EstadoCita, type Cita, type Empleado } from "@/types";
import { CalendarView } from "@/components/citas/calendar-view";
import { motion } from "framer-motion";

export default function CitasPage() {
    const [citas, setCitas] = useState<Cita[]>([]);
    const [empleadosMap, setEmpleadosMap] = useState<Record<string, Empleado>>({});
    const [citasFiltradas, setCitasFiltradas] = useState<Cita[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState<EstadoCita | "todos">("todos");
    const [view, setView] = useState("list");

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        filtrarCitas();
    }, [citas, filtroEstado, busqueda]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [citasData, empleadosData] = await Promise.all([
                obtenerCitas(),
                obtenerEmpleados()
            ]);

            const empMap: Record<string, Empleado> = {};
            empleadosData.forEach(emp => {
                empMap[emp.$id] = emp;
            });

            setEmpleadosMap(empMap);
            setCitas(citasData);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarCitas = () => {
        let filtradas = citas;

        if (filtroEstado !== "todos") {
            filtradas = filtradas.filter((c) => c.estado === filtroEstado);
        }

        if (busqueda) {
            const query = busqueda.toLowerCase();
            filtradas = filtradas.filter((c) =>
                c.clienteNombre.toLowerCase().includes(query) ||
                c.direccion.toLowerCase().includes(query) ||
                c.ciudad.toLowerCase().includes(query)
            );
        }

        setCitasFiltradas(filtradas);
    };

    const getEstadoBadge = (estado: EstadoCita) => {
        const styles = {
            [EstadoCita.PENDIENTE]: "bg-amber-100 text-amber-700 border-amber-300",
            [EstadoCita.CONFIRMADA]: "bg-blue-100 text-blue-700 border-blue-300",
            [EstadoCita.EN_PROGRESO]: "bg-violet-100 text-violet-700 border-violet-300",
            [EstadoCita.COMPLETADA]: "bg-emerald-100 text-emerald-700 border-emerald-300",
            [EstadoCita.CANCELADA]: "bg-rose-100 text-rose-700 border-rose-300",
        };

        return (
            <Badge className={`capitalize font-semibold px-3 py-1.5 ${styles[estado] || "bg-gray-100"}`}>
                {estado.replace("-", " ")}
            </Badge>
        );
    };

    // Calculate stats
    const stats = {
        total: citas.length,
        pendientes: citas.filter(c => c.estado === EstadoCita.PENDIENTE).length,
        confirmadas: citas.filter(c => c.estado === EstadoCita.CONFIRMADA).length,
        completadas: citas.filter(c => c.estado === EstadoCita.COMPLETADA).length,
        ingresoTotal: citas
            .filter(c => c.estado === EstadoCita.COMPLETADA)
            .reduce((sum, c) => sum + (c.precioAcordado || c.precioCliente), 0),
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-16 w-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Cargando agenda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
            {/* Epic Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 via-emerald-50/50 to-blue-50/50" />
                <div className="absolute top-0 -left-4 w-72 h-72 bg-teal-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

                <div className="relative px-6 pt-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg">
                                    <CalendarIcon className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-teal-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                        Agenda de Servicios
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">
                                        Gestiona y visualiza todas tus citas programadas ({citasFiltradas.length} citas)
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
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-teal-100 text-sm font-semibold uppercase tracking-wider">Total Citas</p>
                                                <p className="text-5xl font-black mt-2">{stats.total}</p>
                                                <p className="text-xs text-teal-100 mt-1">Todas las citas</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <CalendarIcon className="h-8 w-8" />
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
                                <Card className="shadow-lg border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-amber-100 rounded-xl">
                                                <Clock className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-slate-600">Pendientes</p>
                                                <p className="text-3xl font-black text-slate-900 mt-1">{stats.pendientes}</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stats.total ? (stats.pendientes / stats.total) * 100 : 0}%` }} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="shadow-lg border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-emerald-100 rounded-xl">
                                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-slate-600">Completadas</p>
                                                <p className="text-3xl font-black text-slate-900 mt-1">{stats.completadas}</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.total ? (stats.completadas / stats.total) * 100 : 0}%` }} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Ingresos</p>
                                                <p className="text-3xl font-black mt-2">{formatearPrecio(stats.ingresoTotal)}</p>
                                                <p className="text-xs text-blue-100 mt-1">De servicios completados</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <DollarSign className="h-8 w-8" />
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
                            className="flex items-center gap-3"
                        >
                            <Link href="/admin/citas/nueva">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Nueva Cita
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Main Tabs */}
                    <Tabs defaultValue="list" value={view} onValueChange={setView} className="space-y-6">
                        <Card className="shadow-lg border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                    {/* View Switcher */}
                                    <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-slate-100">
                                        <TabsTrigger value="list" className="px-4 data-[state=active]:bg-white data-[state=active]:shadow-md">
                                            <List className="h-4 w-4 mr-2" />
                                            Lista
                                        </TabsTrigger>
                                        <TabsTrigger value="calendar" className="px-4 data-[state=active]:bg-white data-[state=active]:shadow-md">
                                            <LayoutGrid className="h-4 w-4 mr-2" />
                                            Calendario
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Filter Bar */}
                                    <div className="flex bg-slate-100 p-1.5 rounded-xl shadow-inner w-full sm:w-auto overflow-x-auto">
                                        {[
                                            { label: "Todas", value: "todos" },
                                            { label: "Pendientes", value: EstadoCita.PENDIENTE },
                                            { label: "Confirmadas", value: EstadoCita.CONFIRMADA },
                                            { label: "Completadas", value: EstadoCita.COMPLETADA },
                                        ].map((f) => (
                                            <button
                                                key={f.value}
                                                onClick={() => setFiltroEstado(f.value as any)}
                                                className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${filtroEstado === f.value
                                                        ? "bg-white text-slate-900 shadow-md"
                                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        placeholder="Buscar por cliente, dirección o ciudad..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="pl-11 h-12 bg-slate-50 border-slate-300 focus:bg-white transition-colors text-base"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <TabsContent value="list" className="mt-0">
                            <Card className="shadow-xl border-slate-200">
                                {citasFiltradas.length === 0 ? (
                                    <CardContent className="p-12">
                                        <div className="text-center">
                                            <div className="bg-slate-50 p-6 rounded-full shadow-inner inline-block mb-4">
                                                <CalendarIcon className="h-16 w-16 text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">No se encontraron citas</h3>
                                            <p className="text-slate-500">
                                                {busqueda
                                                    ? `No hay resultados para "${busqueda}"`
                                                    : "No hay citas registradas con este filtro."}
                                            </p>
                                        </div>
                                    </CardContent>
                                ) : (
                                    <CardContent className="p-6">
                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-slate-800">Agenda de Citas</h3>
                                            <p className="text-sm text-slate-500 mt-1">Listado de servicios programados</p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                                            <Table>
                                                <TableHeader className="bg-gradient-to-r from-slate-50 to-teal-50">
                                                    <TableRow>
                                                        <TableHead className="w-[300px] pl-6 py-4 font-bold text-slate-700">Cliente & Ubicación</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Fecha y Hora</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Estado</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Precio</TableHead>
                                                        <TableHead className="font-bold text-slate-700">Personal</TableHead>
                                                        <TableHead className="text-right pr-6 font-bold text-slate-700">Acciones</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {citasFiltradas.map((cita, index) => (
                                                        <motion.tr
                                                            key={cita.$id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.03 }}
                                                            className="hover:bg-teal-50/50 transition-colors border-b border-slate-100 last:border-0 group"
                                                        >
                                                            <TableCell className="pl-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <div className="p-1.5 bg-teal-100 rounded-lg">
                                                                            <User className="h-4 w-4 text-teal-600" />
                                                                        </div>
                                                                        <span className="font-bold text-slate-900">{cita.clienteNombre}</span>
                                                                    </div>
                                                                    <div className="flex items-start gap-2 text-sm text-slate-500 ml-8">
                                                                        <MapPin className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
                                                                        <span className="line-clamp-1" title={`${cita.direccion}, ${cita.ciudad}`}>
                                                                            {cita.direccion}, {cita.ciudad}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                                                        <CalendarIcon className="h-4 w-4 text-teal-600" />
                                                                        {formatearFecha(cita.fechaCita)}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                                        {cita.horaCita}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getEstadoBadge(cita.estado)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-black text-slate-900 text-lg">
                                                                    {formatearPrecio(cita.precioAcordado || cita.precioCliente)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                {cita.empleadosAsignados && cita.empleadosAsignados.length > 0 ? (
                                                                    <div className="flex items-center -space-x-2 overflow-hidden hover:space-x-1 transition-all">
                                                                        {cita.empleadosAsignados.slice(0, 3).map((empId, i) => {
                                                                            const empleado = empleadosMap[empId];
                                                                            if (!empleado) return null;

                                                                            const initials = (empleado.nombre?.[0] || "") + (empleado.apellido?.[0] || "");

                                                                            return (
                                                                                <div key={i} className="group/avatar relative" title={nombreCompleto(empleado.nombre || "", empleado.apellido || "")}>
                                                                                    <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-2 ring-teal-100 transition-transform group-hover/avatar:scale-110 z-10">
                                                                                        <AvatarImage src={obtenerURLArchivo(empleado.foto || "")} className="object-cover" />
                                                                                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-xs font-bold">
                                                                                            {initials}
                                                                                        </AvatarFallback>
                                                                                    </Avatar>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        {cita.empleadosAsignados.length > 3 && (
                                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 shadow-md ring-2 ring-teal-100 z-0">
                                                                                <span className="text-xs font-bold text-slate-600">
                                                                                    +{cita.empleadosAsignados.length - 3}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-slate-400 italic">Sin asignar</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right pr-6">
                                                                <Link href={`/admin/citas/${cita.$id}`}>
                                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all shadow-sm">
                                                                        <ChevronRight className="h-5 w-5" />
                                                                    </Button>
                                                                </Link>
                                                            </TableCell>
                                                        </motion.tr>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </TabsContent>

                        <TabsContent value="calendar" className="mt-0">
                            <CalendarView citas={citasFiltradas} empleadosMap={empleadosMap} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
