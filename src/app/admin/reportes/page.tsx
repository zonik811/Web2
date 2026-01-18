"use client";

import { useEffect, useState } from "react";
import { obtenerEstadisticasDashboard, DashboardStats } from "@/lib/actions/reportes-dashboard";
import { AdvancedMetricsCharts } from "@/components/admin/reportes/AdvancedMetricsCharts";
import { CustomerMetricsCharts } from "@/components/admin/reportes/CustomerMetricsCharts";
import { EmployeeMetricsCharts } from "@/components/admin/reportes/EmployeeMetricsCharts";
import { InventoryMetricsCharts } from "@/components/admin/reportes/InventoryMetricsCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, Store, Globe, Wrench, Users, UserPlus, Briefcase, UserCheck, Package, AlertTriangle, Boxes, Calendar } from "lucide-react";
import { formatearPrecio } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReportesDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await obtenerEstadisticasDashboard();
                setStats(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-96" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full max-w-md rounded-lg" />
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                            Panel de Reportes
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Visión general del estado de tu negocio en tiempo real.
                        </p>
                    </div>
                </div>

                {/* Tabs Interface */}
                {stats && (
                    <Tabs defaultValue="ventas" className="w-full space-y-6">
                        <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 h-auto grid grid-cols-2 md:grid-cols-4 gap-2">
                            <TabsTrigger value="ventas" className="py-2.5 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none font-medium">
                                <DollarSign className="w-4 h-4 mr-2" /> Ventas
                            </TabsTrigger>
                            <TabsTrigger value="clientes" className="py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none font-medium">
                                <Users className="w-4 h-4 mr-2" /> Clientes
                            </TabsTrigger>
                            <TabsTrigger value="empleados" className="py-2.5 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 data-[state=active]:shadow-none font-medium">
                                <Briefcase className="w-4 h-4 mr-2" /> Empleados
                            </TabsTrigger>
                            <TabsTrigger value="inventario" className="py-2.5 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-none font-medium">
                                <Package className="w-4 h-4 mr-2" /> Inventario
                            </TabsTrigger>
                        </TabsList>



                        {/* --- VENTAS CONTENT --- */}
                        <TabsContent value="ventas" className="space-y-6 outline-none animate-in fade-in-50 duration-500">

                            {/* Nested Tabs for Sales Channels */}
                            <Tabs defaultValue="global" className="w-full space-y-6">
                                <TabsList className="bg-slate-100/50 p-1 rounded-lg h-auto flex flex-wrap gap-1">
                                    <TabsTrigger value="global" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Global</TabsTrigger>
                                    <TabsTrigger value="pos" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"><Store className="w-3 h-3" /> Punto de Venta</TabsTrigger>
                                    <TabsTrigger value="citas" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"><Calendar className="w-3 h-3" /> Citas</TabsTrigger>
                                    <TabsTrigger value="ots" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"><Wrench className="w-3 h-3" /> Órdenes Trabajo</TabsTrigger>
                                    <TabsTrigger value="catalogo" className="data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2"><Globe className="w-3 h-3" /> Catálogo Web</TabsTrigger>
                                </TabsList>

                                {/* GLOBAL TAB */}
                                <TabsContent value="global" className="space-y-6">
                                    {/* Main Sales Stats Grid (Existing) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                        {/* Total Sales Month Card */}
                                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/60 ring-1 ring-black/5 transition-all hover:shadow-xl">
                                            <CardContent className="p-5 flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" /> Mes Actual
                                                        </p>
                                                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                                                            {formatearPrecio(stats.ventas.totalMes)}
                                                        </h2>
                                                    </div>
                                                    <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${stats.ventas.progresoMensual >= 0 ? 'bg-emerald-100/80 text-emerald-700' : 'bg-rose-100/80 text-rose-700'}`}>
                                                        {stats.ventas.progresoMensual > 0 ? '+' : ''}{stats.ventas.progresoMensual}%
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5 bg-white/60 p-3 rounded-xl border border-emerald-100/50 mt-auto shadow-sm">
                                                    <div className="flex justify-between text-xs text-slate-600">
                                                        <span className="flex items-center gap-1.5"><Store className="w-3 h-3 text-blue-500" /> POS</span>
                                                        <span className="font-bold text-slate-800">{formatearPrecio(stats.ventas.desgloseMes?.pos || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-600">
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-amber-500" /> Citas</span>
                                                        <span className="font-bold text-slate-800">{formatearPrecio(stats.ventas.desgloseMes?.servicios || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-600">
                                                        <span className="flex items-center gap-1.5"><Wrench className="w-3 h-3 text-slate-500" /> OTs</span>
                                                        <span className="font-bold text-slate-800">{formatearPrecio(stats.ventas.desgloseMes?.ordenesTrabajo || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-600">
                                                        <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-purple-500" /> Web</span>
                                                        <span className="font-bold text-purple-700">{formatearPrecio(stats.ventas.desgloseMes?.catalogo || 0)}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Sales Week Card */}
                                        <Card className="border-slate-100 shadow-sm bg-white hover:border-blue-100 transition-colors">
                                            <CardContent className="p-5 flex flex-col h-full">
                                                <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider mb-2">Esta Semana</p>
                                                <p className="text-2xl font-bold text-slate-800 mb-4">{formatearPrecio(stats.ventas.totalSemana)}</p>
                                                <div className="space-y-1 bg-slate-50/50 p-2 rounded-lg border border-slate-100 mt-auto">
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>POS</span>
                                                        <span className="font-bold text-slate-700">{formatearPrecio(stats.ventas.desgloseSemana?.pos || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>Citas</span>
                                                        <span className="font-bold text-slate-700">{formatearPrecio(stats.ventas.desgloseSemana?.servicios || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>OTs</span>
                                                        <span className="font-bold text-slate-700">{formatearPrecio(stats.ventas.desgloseSemana?.ordenesTrabajo || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>Web</span>
                                                        <span className="font-bold text-purple-700">{formatearPrecio(stats.ventas.desgloseSemana?.catalogo || 0)}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Sales Yesterday Card */}
                                        <Card className="border-slate-100 shadow-sm bg-white hover:border-slate-200 transition-colors">
                                            <CardContent className="p-5 flex flex-col h-full">
                                                <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider mb-2">Ayer</p>
                                                <p className="text-2xl font-bold text-slate-700 mb-4">{formatearPrecio(stats.ventas.totalAyer)}</p>
                                                <div className="space-y-1 bg-slate-50/50 p-2 rounded-lg border border-slate-100 mt-auto">
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>POS</span>
                                                        <span className="font-bold text-slate-700">{formatearPrecio(stats.ventas.desgloseAyer?.pos || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>Citas</span>
                                                        <span className="font-bold text-slate-700">{formatearPrecio(stats.ventas.desgloseAyer?.servicios || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>OTs</span>
                                                        <span className="font-bold text-slate-700">{formatearPrecio(stats.ventas.desgloseAyer?.ordenesTrabajo || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>Web</span>
                                                        <span className="font-bold text-purple-700">{formatearPrecio(stats.ventas.desgloseAyer?.catalogo || 0)}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Sales Hoy Card */}
                                        <Card className="border-emerald-100 shadow-sm bg-white hover:border-emerald-200 transition-colors relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 z-0 group-hover:scale-110 transition-transform"></div>
                                            <CardContent className="p-5 flex flex-col h-full relative z-10">
                                                <p className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Hoy
                                                </p>
                                                <p className="text-2xl font-bold text-emerald-950 mb-4">{formatearPrecio(stats.ventas.totalHoy)}</p>
                                                <div className="space-y-1 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 mt-auto">
                                                    <div className="flex justify-between text-xs text-slate-600">
                                                        <span>POS</span>
                                                        <span className="font-bold text-slate-800">{formatearPrecio(stats.ventas.desgloseHoy?.pos || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-600">
                                                        <span>Citas</span>
                                                        <span className="font-bold text-slate-800">{formatearPrecio(stats.ventas.desgloseHoy?.servicios || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-600">
                                                        <span>OTs</span>
                                                        <span className="font-bold text-slate-800">{formatearPrecio(stats.ventas.desgloseHoy?.ordenesTrabajo || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-600">
                                                        <span>Web</span>
                                                        <span className="font-bold text-purple-700">{formatearPrecio(stats.ventas.desgloseHoy?.catalogo || 0)}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Breakdown Link Cards (Keeping existing simple nav cards) */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <Link href="/admin/ventas/reportes" className="p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all text-center group">
                                            <Store className="w-6 h-6 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-semibold text-slate-600 block">Reporte POS</span>
                                        </Link>
                                        <Link href="/admin/citas" className="p-4 bg-white border border-slate-100 rounded-xl hover:border-amber-200 hover:shadow-sm transition-all text-center group">
                                            <Calendar className="w-6 h-6 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-semibold text-slate-600 block">Reporte Citas</span>
                                        </Link>
                                        <Link href="/admin/ordenes-trabajo" className="p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all text-center group">
                                            <Wrench className="w-6 h-6 text-slate-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-semibold text-slate-600 block">Reporte OTs</span>
                                        </Link>
                                        <Link href="/admin/ventas/pedidos-catalogo" className="p-4 bg-white border border-slate-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all text-center group">
                                            <Globe className="w-6 h-6 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-semibold text-slate-600 block">Reporte Web</span>
                                        </Link>
                                    </div>

                                    <AdvancedMetricsCharts metrics={stats.ventas.metricsGlobal} title="Estadísticas de Ventas (Este Mes)" />
                                </TabsContent>

                                {/* INDIVIDUAL TABS */}
                                <TabsContent value="pos" className="space-y-6 animate-in fade-in-50">
                                    <AdvancedMetricsCharts metrics={stats.ventas.metricsPorOrigen.pos} title="Estadísticas Punto de Venta" description="Datos basados en ventas directas registradas en caja." />
                                </TabsContent>
                                <TabsContent value="citas" className="space-y-6 animate-in fade-in-50">
                                    <AdvancedMetricsCharts metrics={stats.ventas.metricsPorOrigen.citas} title="Estadísticas de Citas" description="Datos basados en citas completadas." />
                                </TabsContent>
                                <TabsContent value="ots" className="space-y-6 animate-in fade-in-50">
                                    <AdvancedMetricsCharts metrics={stats.ventas.metricsPorOrigen.ordenesTrabajo} title="Estadísticas de Órdenes de Trabajo" description="Datos basados en órdenes de reparación completadas." />
                                </TabsContent>
                                <TabsContent value="catalogo" className="space-y-6 animate-in fade-in-50">
                                    <AdvancedMetricsCharts metrics={stats.ventas.metricsPorOrigen.catalogo} title="Estadísticas Catálogo Web" description="Datos basados en pedidos online." />
                                </TabsContent>

                            </Tabs>
                        </TabsContent>

                        {/* --- CLIENTES CONTENT --- */}
                        <TabsContent value="clientes" className="space-y-6 outline-none animate-in fade-in-50 duration-500">
                            <CustomerMetricsCharts
                                metrics={stats.clientes.metrics}
                                nuevosMes={stats.clientes.nuevosMes}
                                totalClientes={stats.clientes.total}
                            />

                            <div className="flex justify-end mt-4">
                                <Link href="/admin/clientes" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors">
                                    Ver Directorio de Clientes <Users className="w-4 h-4" />
                                </Link>
                            </div>
                        </TabsContent>

                        {/* --- EMPLEADOS CONTENT --- */}
                        <TabsContent value="empleados" className="space-y-6 outline-none animate-in fade-in-50 duration-500">
                            <EmployeeMetricsCharts
                                metrics={stats.empleados.metrics}
                                totalEmpleados={stats.empleados.total}
                                activosEmpleados={stats.empleados.activos}
                            />

                            <div className="flex justify-end mt-4">
                                <Link href="/admin/empleados" className="text-sm text-violet-600 hover:text-violet-800 flex items-center gap-1 font-medium transition-colors">
                                    Ver Directorio de Personal <Briefcase className="w-4 h-4" />
                                </Link>
                            </div>
                        </TabsContent>

                        {/* --- INVENTARIO CONTENT --- */}
                        <TabsContent value="inventario" className="space-y-6 outline-none animate-in fade-in-50 duration-500">
                            <InventoryMetricsCharts
                                metrics={stats.inventario.metrics}
                                totalProductos={stats.inventario.totalProductos}
                                bajoStock={stats.inventario.bajoStock}
                            />

                            <div className="flex justify-end mt-4">
                                <Link href="/admin/inventario" className="text-sm text-amber-600 hover:text-amber-800 flex items-center gap-1 font-medium transition-colors">
                                    Ir a Gestión de Inventario <Package className="w-4 h-4" />
                                </Link>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}
