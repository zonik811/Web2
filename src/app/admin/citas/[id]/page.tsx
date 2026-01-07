"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Phone, Mail, Calendar as CalendarIcon, Clock, DollarSign, FileText, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { obtenerCita, cambiarEstadoCita, asignarEmpleados } from "@/lib/actions/citas";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { formatearFecha, formatearPrecio, nombreCompleto } from "@/lib/utils";
import type { Cita, EstadoCita, Empleado } from "@/types";

const estadoColors: Record<EstadoCita, string> = {
    pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmada: "bg-blue-100 text-blue-800 border-blue-300",
    "en-progreso": "bg-purple-100 text-purple-800 border-purple-300",
    completada: "bg-green-100 text-green-800 border-green-300",
    cancelada: "bg-red-100 text-red-800 border-red-300",
};

export default function DetalleCitaPage() {
    const params = useParams();
    const citaId = params.id as string;
    const [cita, setCita] = useState<Cita | null>(null);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [actualizando, setActualizando] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, [citaId]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [citaData, empleadosData] = await Promise.all([
                obtenerCita(citaId),
                obtenerEmpleados({ activo: true }),
            ]);
            setCita(citaData);
            setEmpleadosSeleccionados(citaData.empleadosAsignados || []);
            setEmpleados(empleadosData);
        } catch (error) {
            console.error("Error cargando cita:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCambiarEstado = async (nuevoEstado: EstadoCita) => {
        if (!cita) return;
        setActualizando(true);
        try {
            await cambiarEstadoCita(cita.$id, nuevoEstado);
            setCita({ ...cita, estado: nuevoEstado });
        } catch (error) {
            console.error("Error cambiando estado:", error);
        } finally {
            setActualizando(false);
        }
    };

    const handleAsignarEmpleados = async () => {
        if (!cita) return;
        setActualizando(true);
        try {
            await asignarEmpleados(cita.$id, empleadosSeleccionados);
            setCita({ ...cita, empleadosAsignados: empleadosSeleccionados });
        } catch (error) {
            console.error("Error asignando empleados:", error);
        } finally {
            setActualizando(false);
        }
    };

    const toggleEmpleado = (empleadoId: string) => {
        setEmpleadosSeleccionados((prev) =>
            prev.includes(empleadoId)
                ? prev.filter((id) => id !== empleadoId)
                : [...prev, empleadoId]
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando cita...</p>
                </div>
            </div>
        );
    }

    if (!cita) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Cita no encontrada</p>
                <Link href="/admin/citas">
                    <Button className="mt-4">Volver a Citas</Button>
                </Link>
            </div>
        );
    }

    const empleadosAsignados = empleados.filter((e) =>
        (cita.empleadosAsignados || []).includes(e.$id)
    );

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/admin/citas">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Detalle de Cita</h1>
                        <p className="text-gray-600 mt-1">ID: {cita.$id.slice(0, 8)}...</p>
                    </div>
                </div>
                <Badge className={estadoColors[cita.estado]} variant="outline">
                    {cita.estado}
                </Badge>
            </div>

            {/* Acciones Rápidas */}
            <Card>
                <CardHeader>
                    <CardTitle>Cambiar Estado</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant={cita.estado === "pendiente" ? "default" : "outline"}
                            onClick={() => handleCambiarEstado("pendiente")}
                            disabled={actualizando}
                        >
                            Pendiente
                        </Button>
                        <Button
                            size="sm"
                            variant={cita.estado === "confirmada" ? "default" : "outline"}
                            onClick={() => handleCambiarEstado("confirmada")}
                            disabled={actualizando}
                        >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                        </Button>
                        <Button
                            size="sm"
                            variant={cita.estado === "en-progreso" ? "default" : "outline"}
                            onClick={() => handleCambiarEstado("en-progreso")}
                            disabled={actualizando}
                        >
                            En Progreso
                        </Button>
                        <Button
                            size="sm"
                            variant={cita.estado === "completada" ? "default" : "outline"}
                            onClick={() => handleCambiarEstado("completada")}
                            disabled={actualizando}
                        >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completar
                        </Button>
                        <Button
                            size="sm"
                            variant={cita.estado === "cancelada" ? "destructive" : "outline"}
                            onClick={() => handleCambiarEstado("cancelada")}
                            disabled={actualizando}
                        >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información del Cliente */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Nombre</p>
                            <p className="font-medium text-gray-900">{cita.clienteNombre}</p>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{cita.clienteTelefono}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{cita.clienteEmail}</span>
                        </div>
                        <div className="flex items-start space-x-2 text-gray-600">
                            <MapPin className="h-4 w-4 mt-1" />
                            <div>
                                <p>{cita.direccion}</p>
                                <p>{cita.ciudad}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detalles del Servicio */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detalles del Servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatearFecha(cita.fechaCita)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                                {cita.horaCita} ({cita.duracionEstimada} min)
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tipo de Propiedad</p>
                            <Badge variant="outline">{cita.tipoPropiedad}</Badge>
                        </div>
                        {cita.metrosCuadrados && (
                            <div>
                                <p className="text-sm text-gray-500">Metros Cuadrados</p>
                                <p className="font-medium">{cita.metrosCuadrados} m²</p>
                            </div>
                        )}
                        {cita.habitaciones && (
                            <div>
                                <p className="text-sm text-gray-500">Habitaciones / Baños</p>
                                <p className="font-medium">
                                    {cita.habitaciones} hab / {cita.banos || 0} baños
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pago */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información de Pago</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-gray-500">Precio Acordado</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatearPrecio(cita.precioAcordado)}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Método de Pago</p>
                            <Badge variant="secondary">{cita.metodoPago}</Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Estado de Pago</p>
                            <Badge variant={cita.pagadoPorCliente ? "success" : "warning"}>
                                {cita.pagadoPorCliente ? "Pagado" : "Pendiente"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Asignación de Empleados */}
                <Card>
                    <CardHeader>
                        <CardTitle>Empleados Asignados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {empleadosAsignados.length > 0 && (
                            <div className="space-y-2">
                                {empleadosAsignados.map((empleado) => (
                                    <div
                                        key={empleado.$id}
                                        className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                                    >
                                        <Avatar>
                                            <AvatarFallback>
                                                {empleado.nombre[0]}
                                                {empleado.apellido[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {nombreCompleto(empleado.nombre, empleado.apellido)}
                                            </p>
                                            <p className="text-xs text-gray-500">{empleado.cargo}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium mb-2">Asignar/Reasignar:</p>
                            <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                                {empleados.map((empleado) => (
                                    <label
                                        key={empleado.$id}
                                        className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={empleadosSeleccionados.includes(empleado.$id)}
                                            onChange={() => toggleEmpleado(empleado.$id)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">
                                            {nombreCompleto(empleado.nombre, empleado.apellido)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <Button
                                onClick={handleAsignarEmpleados}
                                disabled={actualizando}
                                className="w-full mt-2"
                                size="sm"
                            >
                                Guardar Asignación
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detalles Adicionales */}
            {(cita.detallesAdicionales || cita.notasInternas) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span>Notas y Detalles</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {cita.detallesAdicionales && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                    Detalles del Cliente:
                                </p>
                                <p className="text-sm text-gray-600">{cita.detallesAdicionales}</p>
                            </div>
                        )}
                        {cita.notasInternas && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                    Notas Internas:
                                </p>
                                <p className="text-sm text-gray-600 italic">{cita.notasInternas}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
