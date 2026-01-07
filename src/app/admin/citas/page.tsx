"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon, Filter } from "lucide-react";
import { obtenerCitas } from "@/lib/actions/citas";
import { formatearFecha, formatearPrecio } from "@/lib/utils";
import type { Cita, EstadoCita } from "@/types";

const estadoColors: Record<EstadoCita, string> = {
    pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmada: "bg-blue-100 text-blue-800 border-blue-300",
    "en-progreso": "bg-purple-100 text-purple-800 border-purple-300",
    completada: "bg-green-100 text-green-800 border-green-300",
    cancelada: "bg-red-100 text-red-800 border-red-300",
};

export default function CitasPage() {
    const [citas, setCitas] = useState<Cita[]>([]);
    const [citasFiltradas, setCitasFiltradas] = useState<Cita[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState<EstadoCita | "todos">("todos");

    useEffect(() => {
        cargarCitas();
    }, []);

    useEffect(() => {
        filtrarCitas();
    }, [citas, filtroEstado]);

    const cargarCitas = async () => {
        try {
            setLoading(true);
            const data = await obtenerCitas();
            setCitas(data);
        } catch (error) {
            console.error("Error cargando citas:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarCitas = () => {
        let filtradas = citas;

        if (filtroEstado !== "todos") {
            filtradas = filtradas.filter((c) => c.estado === filtroEstado);
        }

        setCitasFiltradas(filtradas);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando citas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Citas</h1>
                    <p className="text-gray-600 mt-1">
                        Gestiona las citas de servicio ({citasFiltradas.length} total)
                    </p>
                </div>
                <Link href="/admin/citas/nueva">
                    <Button size="lg">
                        <Plus className="h-5 w-5 mr-2" />
                        Nueva Cita
                    </Button>
                </Link>
            </div>

            {/* Filtros */}
            <Card className="p-4">
                <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Estado:</span>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            size="sm"
                            variant={filtroEstado === "todos" ? "default" : "outline"}
                            onClick={() => setFiltroEstado("todos")}
                        >
                            Todos
                        </Button>
                        <Button
                            size="sm"
                            variant={filtroEstado === "pendiente" ? "default" : "outline"}
                            onClick={() => setFiltroEstado("pendiente")}
                        >
                            Pendientes
                        </Button>
                        <Button
                            size="sm"
                            variant={filtroEstado === "confirmada" ? "default" : "outline"}
                            onClick={() => setFiltroEstado("confirmada")}
                        >
                            Confirmadas
                        </Button>
                        <Button
                            size="sm"
                            variant={filtroEstado === "completada" ? "default" : "outline"}
                            onClick={() => setFiltroEstado("completada")}
                        >
                            Completadas
                        </Button>
                        <Button
                            size="sm"
                            variant={filtroEstado === "cancelada" ? "default" : "outline"}
                            onClick={() => setFiltroEstado("cancelada")}
                        >
                            Canceladas
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Lista de Citas */}
            {citasFiltradas.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                            {filtroEstado === "todos"
                                ? "No hay citas registradas"
                                : `No hay citas ${filtroEstado}s`}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {citasFiltradas.map((cita) => (
                        <Link key={cita.$id} href={`/admin/citas/${cita.$id}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="p-4 space-y-3">
                                    {/* Estado */}
                                    <div className="flex justify-between items-start">
                                        <Badge className={estadoColors[cita.estado]}>
                                            {cita.estado}
                                        </Badge>
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatearPrecio(cita.precioAcordado)}
                                        </span>
                                    </div>

                                    {/* Cliente */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {cita.clienteNombre}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {cita.clienteTelefono}
                                        </p>
                                    </div>

                                    {/* Ubicación */}
                                    <p className="text-sm text-gray-600 line-clamp-1">
                                        {cita.direccion}, {cita.ciudad}
                                    </p>

                                    {/* Fecha y Hora */}
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>
                                            {formatearFecha(cita.fechaCita)} - {cita.horaCita}
                                        </span>
                                    </div>

                                    {/* Empleados Asignados */}
                                    {cita.empleadosAsignados && cita.empleadosAsignados.length > 0 && (
                                        <div className="flex items-center space-x-1">
                                            <span className="text-xs text-gray-500">
                                                {cita.empleadosAsignados.length} empleado(s) asignado(s)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
