"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar as CalendarIcon, DollarSign, Star } from "lucide-react";
import Link from "next/link";
import { obtenerEmpleado, obtenerEstadisticasEmpleado } from "@/lib/actions/empleados";
import { obtenerURLArchivo } from "@/lib/appwrite";
import { nombreCompleto, formatearPrecio, formatearFecha } from "@/lib/utils";
import type { Empleado, EstadisticasEmpleado } from "@/types";

export default function PerfilEmpleadoPage() {
    const params = useParams();
    const empleadoId = params.id as string;
    const [empleado, setEmpleado] = useState<Empleado | null>(null);
    const [stats, setStats] = useState<EstadisticasEmpleado | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarEmpleado();
    }, [empleadoId]);

    const cargarEmpleado = async () => {
        try {
            setLoading(true);
            const data = await obtenerEmpleado(empleadoId);
            setEmpleado(data);

            const estadisticas = await obtenerEstadisticasEmpleado(empleadoId);
            setStats(estadisticas);
        } catch (error) {
            console.error("Error cargando empleado:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (!empleado) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Empleado no encontrado</p>
                <Link href="/admin/personal">
                    <Button className="mt-4">Volver a Personal</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/admin/personal">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {nombreCompleto(empleado.nombre, empleado.apellido)}
                    </h1>
                    <p className="text-gray-600 mt-1">Perfil de Empleado</p>
                </div>
                <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                </Button>
            </div>

            {/* Info Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <Avatar className="w-32 h-32">
                            {empleado.foto && (
                                <AvatarImage
                                    src={obtenerURLArchivo(empleado.foto)}
                                    alt={nombreCompleto(empleado.nombre, empleado.apellido)}
                                />
                            )}
                            <AvatarFallback className="text-3xl">
                                {empleado.nombre[0]}
                                {empleado.apellido[0]}
                            </AvatarFallback>
                        </Avatar>

                        {/* Información básica */}
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Teléfono</p>
                                        <p className="font-medium">{empleado.telefono}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{empleado.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Dirección</p>
                                        <p className="font-medium">{empleado.direccion}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Fecha de Contratación</p>
                                        <p className="font-medium">{formatearFecha(empleado.fechaContratacion)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">{empleado.cargo}</Badge>
                                <Badge variant={empleado.activo ? "success" : "destructive"}>
                                    {empleado.activo ? "Activo" : "Inactivo"}
                                </Badge>
                                {empleado.especialidades.map((esp, i) => (
                                    <Badge key={i} variant="secondary">
                                        {esp.replace(/_/g, " ")}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Estadísticas */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Servicios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats.totalServicios}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Horas Este Mes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{Math.round(stats.horasTrabajadasMes)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Ganado
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatearPrecio(stats.totalGanado)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Pendiente por Pagar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-warning">
                                {formatearPrecio(stats.pendientePorPagar)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Información de Pago */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span>Información de Pago</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Modalidad de Pago:</span>
                        <span className="font-medium">{empleado.modalidadPago}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Tarifa por Hora:</span>
                        <span className="font-medium">{formatearPrecio(empleado.tarifaPorHora)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
