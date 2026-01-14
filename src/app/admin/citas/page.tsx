"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    List
} from "lucide-react";
import { obtenerCitas } from "@/lib/actions/citas";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { formatearFecha, formatearPrecio, nombreCompleto } from "@/lib/utils";
import { obtenerURLArchivo } from "@/lib/appwrite";
import { EstadoCita, type Cita, type Empleado } from "@/types";
import { CalendarView } from "@/components/citas/calendar-view";

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

            // Create a map for faster employee lookup
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
        // Vibrant Colors Implementation
        const styles = {
            [EstadoCita.PENDIENTE]: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
            [EstadoCita.CONFIRMADA]: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
            [EstadoCita.EN_PROGRESO]: "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200",
            [EstadoCita.COMPLETADA]: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
            [EstadoCita.CANCELADA]: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200",
        };

        return (
            <Badge variant="outline" className={`capitalize font-semibold px-3 py-1 shadow-sm ${styles[estado] || "bg-gray-100"}`}>
                {estado.replace("-", " ")}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-gray-500 font-medium">Cargando agenda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Agenda de Servicios</h1>
                    <p className="text-gray-500 text-base mt-1">
                        Gestiona y visualiza todas tus citas programadas ({citasFiltradas.length})
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Link href="/admin/citas/nueva" className="w-full sm:w-auto">
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-md transition-all hover:shadow-lg w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Cita
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="list" value={view} onValueChange={setView} className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                    {/* View Switcher */}
                    <TabsList className="grid w-full sm:w-auto grid-cols-2">
                        <TabsTrigger value="list" className="px-4">
                            <List className="h-4 w-4 mr-2" />
                            Lista
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="px-4">
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            Calendario
                        </TabsTrigger>
                    </TabsList>

                    {/* Filter Bar (Only showing in List view for now, usually calendar filters are separate or simpler) */}
                    <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                        {[
                            { label: "Todas", value: "todos" },
                            { label: "Pendientes", value: EstadoCita.PENDIENTE },
                            { label: "Confirmadas", value: EstadoCita.CONFIRMADA },
                            { label: "Completadas", value: EstadoCita.COMPLETADA },
                        ].map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFiltroEstado(f.value as any)}
                                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${filtroEstado === f.value
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Bar - Global */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="Buscar por cliente, dirección o ciudad..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-10 h-11 bg-white border-gray-200 shadow-sm focus:bg-white transition-colors text-base"
                    />
                </div>

                <TabsContent value="list" className="mt-0">
                    <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden rounded-xl">
                        {citasFiltradas.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="bg-gray-50 p-4 rounded-full shadow-inner inline-block mb-4">
                                    <CalendarIcon className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">No se encontraron citas</h3>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                                    {busqueda
                                        ? `No hay resultados para "${busqueda}"`
                                        : "No hay citas registradas con este filtro."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                                        <TableRow>
                                            <TableHead className="w-[300px] pl-6 py-4 font-semibold text-gray-700">Cliente & Ubicación</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Fecha y Hora</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Precio</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Personal</TableHead>
                                            <TableHead className="text-right pr-6 font-semibold text-gray-700">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {citasFiltradas.map((cita) => (
                                            <TableRow key={cita.$id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100 last:border-0 group">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <span className="font-semibold text-gray-900">{cita.clienteNombre}</span>
                                                        </div>
                                                        <div className="flex items-start gap-2 text-sm text-gray-500">
                                                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-gray-400 shrink-0" />
                                                            <span className="line-clamp-1" title={`${cita.direccion}, ${cita.ciudad}`}>
                                                                {cita.direccion}, {cita.ciudad}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                            <CalendarIcon className="h-4 w-4 text-primary" />
                                                            {formatearFecha(cita.fechaCita)}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5 ml-6">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {cita.horaCita}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getEstadoBadge(cita.estado)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-gray-900 text-base">
                                                        {formatearPrecio(cita.precioAcordado || cita.precioCliente)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {/* Fixed Avatar Rendering using empleadosMap */}
                                                    {cita.empleadosAsignados && cita.empleadosAsignados.length > 0 ? (
                                                        <div className="flex items-center -space-x-2 overflow-hidden hover:space-x-1 transition-all">
                                                            {cita.empleadosAsignados.slice(0, 3).map((empId, i) => {
                                                                const empleado = empleadosMap[empId];
                                                                if (!empleado) return null; // Skip if not found

                                                                const initials = (empleado.nombre?.[0] || "") + (empleado.apellido?.[0] || "");

                                                                return (
                                                                    <div key={i} className="group/avatar relative" title={nombreCompleto(empleado.nombre || "", empleado.apellido || "")}>
                                                                        <Avatar className="h-8 w-8 border-2 border-white ring-1 ring-gray-100 transition-transform group-hover/avatar:scale-110 z-10">
                                                                            <AvatarImage src={obtenerURLArchivo(empleado.foto || "")} className="object-cover" />
                                                                            <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 text-[10px] font-bold">
                                                                                {initials}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    </div>
                                                                );
                                                            })}
                                                            {cita.empleadosAsignados.length > 3 && (
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-50 ring-1 ring-gray-100 z-0">
                                                                    <span className="text-[10px] font-medium text-gray-500">
                                                                        +{cita.empleadosAsignados.length - 3}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">Sin asignar</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Link href={`/admin/citas/${cita.$id}`}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-all">
                                                            <ChevronRight className="h-5 w-5" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                    <CalendarView citas={citasFiltradas} empleadosMap={empleadosMap} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
