"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/admin/StatsCard";
import {
    Calendar,
    Users,
    DollarSign,
    CheckCircle,
    Clock,
    TrendingUp,
} from "lucide-react";
import { obtenerCitasHoy, obtenerCitasSemana, obtenerCitas } from "@/lib/actions/citas";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { formatearPrecio } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Cita, Empleado, EstadisticasDashboard } from "@/types";

export default function AdminDashboard() {
    const [stats, setStats] = useState<EstadisticasDashboard>({
        citasHoy: 0,
        citasEstaSemana: 0,
        citasEsteMes: 0,
        empleadosActivos: 0,
        ingresosMes: 0,
        pagosEmpleadosPendientes: 0,
        serviciosCompletados: 0,
        clientesNuevos: 0,
    });
    const [citasProximas, setCitasProximas] = useState<Cita[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDashboard();
    }, []);

    const cargarDashboard = async () => {
        try {
            setLoading(true);

            // Obtener citas del día
            const citasHoy = await obtenerCitasHoy();

            // Obtener citas de la semana
            const citasSemana = await obtenerCitasSemana();

            // Obtener empleados activos
            const empleados = await obtenerEmpleados({ activo: true });

            // Obtener citas del mes para calcular ingresos
            const inicioMes = new Date();
            inicioMes.setDate(1);
            const citasMes = await obtenerCitas({
                fechaInicio: inicioMes.toISOString().split("T")[0],
            });

            // Calcular ingresos del mes
            const ingresosMes = citasMes
                .filter((c) => c.estado === "completada" && c.pagadoPorCliente)
                .reduce((sum, c) => sum + c.precioAcordado, 0);

            // Servicios completados
            const serviciosCompletados = citasMes.filter(
                (c) => c.estado === "completada"
            ).length;

            setStats({
                citasHoy: citasHoy.length,
                citasEstaSemana: citasSemana.length,
                citasEsteMes: citasMes.length,
                empleadosActivos: empleados.length,
                ingresosMes,
                pagosEmpleadosPendientes: 0, // TODO: Implementar cuando se haga módulo de pagos
                serviciosCompletados,
                clientesNuevos: 0, // TODO: Calcular clientes nuevos del mes
            });

            // Obtener próximas citas (confirmadas y pendientes)
            const proximasCitas = citasSemana
                .filter((c) => c.estado === "confirmada" || c.estado === "pendiente")
                .slice(0, 5);
            setCitasProximas(proximasCitas);

        } catch (error) {
            console.error("Error cargando dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Resumen de operaciones y métricas clave
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Citas Hoy"
                    value={stats.citasHoy}
                    description="Servicios programados para hoy"
                    icon={Calendar}
                    variant="primary"
                />
                <StatsCard
                    title="Empleados Activos"
                    value={stats.empleadosActivos}
                    description="Personal disponible"
                    icon={Users}
                    variant="secondary"
                />
                <StatsCard
                    title="Ingresos del Mes"
                    value={formatearPrecio(stats.ingresosMes)}
                    description="Pagos recibidos"
                    icon={DollarSign}
                    variant="default"
                />
                <StatsCard
                    title="Servicios Completados"
                    value={stats.serviciosCompletados}
                    description="Este mes"
                    icon={CheckCircle}
                    variant="secondary"
                />
            </div>

            {/* Próximas Citas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span>Próximas Citas</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {citasProximas.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No hay citas próximas programadas
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {citasProximas.map((cita) => (
                                <div
                                    key={cita.$id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {cita.clienteNombre}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {cita.direccion}, {cita.ciudad}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(cita.fechaCita).toLocaleDateString("es-CO", {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                            })}{" "}
                                            a las {cita.horaCita}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge
                                            variant={
                                                cita.estado === "confirmada" ? "success" : "outline"
                                            }
                                        >
                                            {cita.estado}
                                        </Badge>
                                        <p className="text-sm font-medium text-gray-900 mt-2">
                                            {formatearPrecio(cita.precioAcordado)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
