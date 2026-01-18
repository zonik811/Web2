"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search, Users as UsersIcon, ChevronRight, UserCheck, UserX, Award, TrendingUp, Briefcase } from "lucide-react";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { obtenerURLArchivo } from "@/lib/appwrite";
import { nombreCompleto } from "@/lib/utils";
import type { Empleado } from "@/types";
import { Input } from "@/components/ui/input";
import { EmployeeOrderCount } from "@/components/admin/personal/EmployeeOrderCount";
import { motion } from "framer-motion";
import { ExportExcelButton } from "@/components/ui/ExportExcelButton";

export default function PersonalPage() {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState<"todos" | "activos" | "inactivos">("activos");

    useEffect(() => {
        cargarEmpleados();
    }, []);

    useEffect(() => {
        filtrarEmpleados();
    }, [empleados, busqueda, filtro]);

    const cargarEmpleados = async () => {
        try {
            setLoading(true);
            const data = await obtenerEmpleados();
            setEmpleados(data);
        } catch (error) {
            console.error("Error cargando empleados:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarEmpleados = () => {
        let filtrados = empleados;

        if (filtro === "activos") {
            filtrados = filtrados.filter((e) => e.activo);
        } else if (filtro === "inactivos") {
            filtrados = filtrados.filter((e) => !e.activo);
        }

        if (busqueda) {
            filtrados = filtrados.filter((e) =>
                nombreCompleto(e.nombre, e.apellido)
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()) ||
                e.documento.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        setEmpleadosFiltrados(filtrados);
    };

    // Calculate stats
    const stats = {
        total: empleados.length,
        activos: empleados.filter(e => e.activo).length,
        inactivos: empleados.filter(e => !e.activo).length,
        serviciosTotales: empleados.reduce((sum, e) => sum + (e.totalServicios || 0), 0),
        especialistas: empleados.filter(e => e.cargo === "especialista").length,
        supervisores: empleados.filter(e => e.cargo === "supervisor").length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Cargando equipo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Epic Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50" />
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

                <div className="relative px-6 pt-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                                    <UsersIcon className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Gestión de Personal
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">
                                        Administra y supervisa a tu equipo de trabajo ({empleadosFiltrados.length} miembros)
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
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Total Equipo</p>
                                                <p className="text-5xl font-black mt-2">{stats.total}</p>
                                                <p className="text-xs text-blue-100 mt-1">Empleados registrados</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <UsersIcon className="h-8 w-8" />
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
                                                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Activos</p>
                                                <p className="text-5xl font-black mt-2">{stats.activos}</p>
                                                <p className="text-xs text-emerald-100 mt-1">Disponibles hoy</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <UserCheck className="h-8 w-8" />
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
                                                <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider">Servicios</p>
                                                <p className="text-5xl font-black mt-2">{stats.serviciosTotales}</p>
                                                <p className="text-xs text-purple-100 mt-1">Total realizados</p>
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
                                transition={{ delay: 0.4 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-orange-100 text-sm font-semibold uppercase tracking-wider">Especialistas</p>
                                                <p className="text-5xl font-black mt-2">{stats.especialistas}</p>
                                                <p className="text-xs text-orange-100 mt-1">Expertos técnicos</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <Award className="h-8 w-8" />
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
                            <div className="flex gap-3">
                                <ExportExcelButton
                                    data={empleadosFiltrados}
                                    fileName="Reporte_Personal"
                                    mapData={(e) => ({
                                        Nombre: nombreCompleto(e.nombre, e.apellido),
                                        Documento: e.documento,
                                        Cargo: e.cargo,
                                        Especialidades: e.especialidades.join(", "),
                                        Servicios: e.totalServicios || 0,
                                        Activo: e.activo ? "Si" : "No",
                                        Email: e.email,
                                        Telefono: e.telefono
                                    })}
                                    className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50 shadow-sm"
                                />
                                <Link href="/admin/personal/nuevo">
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                                    >
                                        <Plus className="mr-2 h-5 w-5" />
                                        Nuevo Empleado
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Filter Bar */}
                    <Card className="shadow-lg border-slate-200 mb-6">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="relative w-full sm:max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        placeholder="Buscar por nombre o documento..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="pl-11 h-12 bg-slate-50 border-slate-300 focus:bg-white transition-colors text-base"
                                    />
                                </div>
                                <div className="flex bg-slate-100 p-1.5 rounded-xl shadow-inner w-full sm:w-auto">
                                    {(["activos", "todos", "inactivos"] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFiltro(f)}
                                            className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${filtro === f
                                                ? "bg-white text-slate-900 shadow-md"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                                } capitalize`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employee Table */}
                    <Card className="shadow-xl border-slate-200">
                        {empleadosFiltrados.length === 0 ? (
                            <CardContent className="p-12">
                                <div className="text-center">
                                    <div className="bg-slate-50 p-6 rounded-full shadow-inner inline-block mb-4">
                                        <UsersIcon className="h-16 w-16 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">No se encontraron empleados</h3>
                                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                        {busqueda
                                            ? `No hay resultados para "${busqueda}"`
                                            : "Tu equipo está vacío. Comienza agregando un nuevo empleado."}
                                    </p>
                                    {!busqueda && (
                                        <Link href="/admin/personal/nuevo">
                                            <Button variant="outline" className="border-slate-300 shadow-md">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Registrar Primer Empleado
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent className="p-6">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-800">Miembros del Equipo</h3>
                                    <p className="text-sm text-slate-500 mt-1">Gestiona la información de cada empleado</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                                            <TableRow>
                                                <TableHead className="w-[350px] pl-6 py-4 font-bold text-slate-700">Empleado</TableHead>
                                                <TableHead className="font-bold text-slate-700">Cargo</TableHead>
                                                <TableHead className="font-bold text-slate-700">Especialidades</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">Servicios</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">Órdenes</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">Estado</TableHead>
                                                <TableHead className="text-right pr-6 font-bold text-slate-700">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {empleadosFiltrados.map((empleado, index) => (
                                                <motion.tr
                                                    key={empleado.$id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="hover:bg-blue-50/50 transition-colors border-b border-slate-100 last:border-0 group"
                                                >
                                                    <TableCell className="pl-6 py-4">
                                                        <div className="flex items-center space-x-4">
                                                            <Avatar className="h-12 w-12 border-2 border-white shadow-lg ring-2 ring-blue-100">
                                                                {empleado.foto ? (
                                                                    <AvatarImage
                                                                        src={obtenerURLArchivo(empleado.foto || "")}
                                                                        alt={nombreCompleto(empleado.nombre, empleado.apellido)}
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                                                                        {empleado.nombre[0]}{empleado.apellido[0]}
                                                                    </AvatarFallback>
                                                                )}
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                                    {nombreCompleto(empleado.nombre, empleado.apellido)}
                                                                </p>
                                                                <p className="text-sm text-slate-500 font-mono">{empleado.documento}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={`font-semibold capitalize px-3 py-1.5 ${empleado.cargo === "supervisor"
                                                                ? "text-violet-700 border-violet-300 bg-violet-50"
                                                                : empleado.cargo === "especialista"
                                                                    ? "text-blue-700 border-blue-300 bg-blue-50"
                                                                    : "text-slate-700 border-slate-300 bg-slate-50"
                                                                }`}
                                                        >
                                                            <Briefcase className="h-3 w-3 mr-1" />
                                                            {empleado.cargo}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                                                            {empleado.especialidades.slice(0, 2).map((esp, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
                                                                >
                                                                    {esp.replace(/_/g, " ")}
                                                                </span>
                                                            ))}
                                                            {empleado.especialidades.length > 2 && (
                                                                <span
                                                                    className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                                                                    title={empleado.especialidades.slice(2).join(", ")}
                                                                >
                                                                    +{empleado.especialidades.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className="bg-purple-100 text-purple-700 border-purple-300 font-bold text-base px-3 py-1">
                                                            {empleado.totalServicios || 0}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <EmployeeOrderCount empleadoId={empleado.$id} />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex justify-center">
                                                            <div
                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${empleado.activo
                                                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                                                    : "bg-slate-100 text-slate-600 border border-slate-300"
                                                                    }`}
                                                            >
                                                                <span
                                                                    className={`h-2 w-2 rounded-full ${empleado.activo ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                                                        }`}
                                                                />
                                                                {empleado.activo ? "Activo" : "Inactivo"}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <Link href={`/admin/personal/${empleado.$id}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all shadow-sm"
                                                            >
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
                </div>
            </div>
        </div>
    );
}
