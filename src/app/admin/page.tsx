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
    Plus,
    FileText,
    Settings,
    UserPlus,
    Wallet,
    ArrowRight
} from "lucide-react";
import { obtenerCitasHoy, obtenerCitasSemana, obtenerCitas } from "@/lib/actions/citas";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { obtenerGastos } from "@/lib/actions/gastos";
import { formatearPrecio, nombreCompleto } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { obtenerURLArchivo } from "@/lib/appwrite";
import Link from "next/link";
import type { Cita, Empleado, EstadisticasDashboard } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
    const [gastosMes, setGastosMes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Buenos días");
        else if (hour < 18) setGreeting("Buenas tardes");
        else setGreeting("Buenas noches");

        cargarDashboard();
    }, []);

    const cargarDashboard = async () => {
        try {
            setLoading(true);

            // Obtener fechas clave
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);
            const finMes = new Date(inicioMes.getFullYear(), inicioMes.getMonth() + 1, 0);

            // Fetch data in parallel
            const [
                citasHoy,
                citasSemana,
                // empleados, // Comentado temporalmente
                citasMes,
                gastosData
            ] = await Promise.all([
                obtenerCitasHoy(),
                obtenerCitasSemana(),
                // obtenerEmpleados({ activo: true }), // Removido temporalmente - causa error con query activo
                obtenerCitas({
                    fechaInicio: inicioMes.toISOString().split("T")[0],
                }),
                obtenerGastos({
                    fechaInicio: inicioMes.toISOString().split("T")[0],
                    fechaFin: finMes.toISOString().split("T")[0]
                })
            ]);

            // Calcular ingresos del mes (Solo pagados y completados)
            const ingresosMes = citasMes
                .filter((c) => c.estado === "completada" && c.pagadoPorCliente)
                .reduce((sum, c) => sum + c.precioAcordado, 0);

            // Calcular gastos del mes
            const totalGastos = gastosData.reduce((sum, g) => sum + g.monto, 0);

            // Servicios completados
            const serviciosCompletados = citasMes.filter(
                (c) => c.estado === "completada"
            ).length;

            setStats({
                citasHoy: citasHoy.length,
                citasEstaSemana: citasSemana.length,
                citasEsteMes: citasMes.length,
                empleadosActivos: 0, // TODO: Fix query issue
                ingresosMes: citasMes.reduce((acc: number, cita: Cita) => acc + (cita.precioAcordado || 0), 0),
                pagosEmpleadosPendientes: 0,
                serviciosCompletados,
                clientesNuevos: 0,
            });

            setGastosMes(totalGastos);

            // Obtener próximas citas (Pending or Confirmed, sorted by date)
            const proximas = citasSemana
                .filter((c) => ["pendiente", "confirmada", "en-progreso"].includes(c.estado))
                .sort((a, b) => new Date(a.fechaCita + "T" + a.horaCita).getTime() - new Date(b.fechaCita + "T" + b.horaCita).getTime())
                .slice(0, 5);

            setCitasProximas(proximas);

        } catch (error) {
            console.error("Error cargando dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-gray-500 font-medium">Cargando panel de control...</p>
                </div>
            </div>
        );
    }

    const netIncome = stats.ingresosMes - gastosMes;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                        {format(new Date(), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {greeting}, Admin
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Aquí tienes el resumen de tu operación hoy.
                    </p>
                </div>
                <Link href="/agendar">
                    <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        <Plus className="h-4 w-4 mr-2" /> Nueva Cita
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Citas Hoy"
                    value={stats.citasHoy}
                    description="Servicios programados"
                    icon={Calendar}
                    variant="primary"
                    trend={{ value: 12, isPositive: true }} // Simulated trend
                />
                <StatsCard
                    title="Ingresos (Mes)"
                    value={formatearPrecio(stats.ingresosMes)}
                    description="Pagos cobrados"
                    icon={DollarSign}
                    variant="default"
                    trend={{ value: 8, isPositive: true }}
                />
                <StatsCard
                    title="Actividad"
                    value={stats.serviciosCompletados || 0}
                    description="Servicios finalizados"
                    icon={CheckCircle}
                    variant="secondary"
                />
                <StatsCard
                    title="Equipo Activo"
                    value={stats.empleadosActivos || 0}
                    description="Disponibles hoy"
                    icon={Users}
                    variant="warning"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Side: Upcoming Appointments (2/3) */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="border-gray-200 shadow-sm overflow-hidden h-full">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Próximas Citas
                                </CardTitle>
                                <Link href="/admin/citas">
                                    <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary hover:text-primary/80">
                                        Ver Calendario <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {citasProximas.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-gray-900 font-medium mb-1">¡Todo tranquilo por ahora!</h3>
                                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                        No hay citas confirmadas o pendientes para los próximos días.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {citasProximas.map((cita) => (
                                        <div
                                            key={cita.$id}
                                            className="group flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-colors"
                                        >
                                            {/* Date Box */}
                                            <div className="flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-white border border-gray-200 shadow-sm shrink-0">
                                                <span className="text-xs font-bold text-gray-400 uppercase">
                                                    {format(new Date(cita.fechaCita), "MMM", { locale: es })}
                                                </span>
                                                <span className="text-xl font-bold text-gray-900 leading-none">
                                                    {format(new Date(cita.fechaCita), "d")}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold text-gray-900 truncate pr-2">
                                                        {cita.clienteNombre}
                                                    </h4>
                                                    <Badge
                                                        variant="outline"
                                                        className={`
                                                            text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold
                                                            ${cita.estado === "confirmada" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                                cita.estado === "pendiente" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                                    "bg-gray-100 text-gray-600 border-gray-200"}
                                                        `}
                                                    >
                                                        {cita.estado}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {cita.horaCita}
                                                    </div>
                                                    <div className="flex items-center gap-1 truncate max-w-[200px]">
                                                        <DollarSign className="h-3.5 w-3.5" />
                                                        {formatearPrecio(cita.precioAcordado)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* View Action */}
                                            <Link href={`/admin/citas/${cita.$id}`}>
                                                <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Ver Detalle
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Quick Actions & Financial (1/3) */}
                <div className="space-y-6">
                    {/* Quick Actions Panel */}
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Accesos Rápidos</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            <Link href="/admin/citas" className="block">
                                <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-medium">Ver Agenda</span>
                                </Button>
                            </Link>
                            <Link href="/admin/pagos/empleados" className="block">
                                <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-medium">Pagos</span>
                                </Button>
                            </Link>
                            <Link href="/admin/gastos" className="block">
                                <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                    <div className="p-2 bg-rose-50 text-rose-600 rounded-full">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-medium">Reg. Gasto</span>
                                </Button>
                            </Link>
                            <Link href="/admin/clientes" className="block">
                                <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                    <div className="p-2 bg-violet-50 text-violet-600 rounded-full">
                                        <UserPlus className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-medium">Clientes</span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Mini Financial Summary */}
                    <Card className={`border-gray-200 shadow-sm ${netIncome >= 0 ? "bg-gradient-to-br from-white to-emerald-50/30" : "bg-white"}`}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold">Resumen del Mes</CardTitle>
                                <Badge variant="outline" className="bg-white/50">Estimado</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Ingresos</span>
                                    <span className="font-medium text-gray-900">{formatearPrecio(stats.ingresosMes)}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Gastos</span>
                                    <span className="font-medium text-gray-900">{formatearPrecio(gastosMes)}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min((gastosMes / (stats.ingresosMes || 1)) * 100, 100)}%` }}></div>
                                </div>
                            </div>

                            <div className="pt-4 mt-2 border-t border-gray-200/60 flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Balance Neto</span>
                                <span className={`text-lg font-bold ${netIncome >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                    {netIncome >= 0 ? "+" : ""}{formatearPrecio(netIncome)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
