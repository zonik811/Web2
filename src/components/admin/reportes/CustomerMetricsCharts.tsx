"use client";

import { CustomerAdvancedMetrics } from "@/lib/actions/reportes-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";
import { formatearPrecio } from "@/lib/utils";
import { TrendingUp, MapPin, Users, Crown, Activity } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface CustomerMetricsChartsProps {
    metrics: CustomerAdvancedMetrics;
    nuevosMes: number;
    totalClientes: number;
}

export function CustomerMetricsCharts({ metrics, nuevosMes, totalClientes }: CustomerMetricsChartsProps) {

    // Prepare Data
    const topClientsData = metrics.topClientes.map(c => ({
        name: c.nombre.length > 15 ? c.nombre.substring(0, 15) + '...' : c.nombre,
        full_name: c.nombre,
        total: c.total
    }));

    const cityData = metrics.distribucionCiudades.map(c => ({
        name: c.nombre,
        value: c.cantidad
    }));

    // Retention / Activity logic approximation for display
    // "Activos" vs "Inactivos" (Total - Activos) ??
    // Let's just show a simple distribution of "Nuevos" vs "Antiguos Activos" (Active - New)
    const activeOld = Math.max(0, metrics.totalActivos - nuevosMes);
    const activityData = [
        { name: 'Nuevos (Mes)', value: nuevosMes },
        { name: 'Recurrentes (Mes)', value: activeOld }
    ];

    return (
        <div className="space-y-6">

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Nuevos Clientes */}
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-500" /> Nuevos Clientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {nuevosMes}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Registrados este mes</p>
                    </CardContent>
                </Card>

                {/* Clientes Activos */}
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-500" /> Clientes Activos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {metrics.totalActivos}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Realizaron compras este mes</p>
                    </CardContent>
                </Card>

                {/* Top Cliente (MVP) */}
                <Card className="bg-white border-slate-100 shadow-sm md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-500" /> Cliente Estrella
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xl font-bold text-slate-800 truncate max-w-[200px]">
                                    {metrics.topClientes[0]?.nombre || 'N/A'}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Mayor volumen de compra</p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-emerald-600">
                                    {formatearPrecio(metrics.topClientes[0]?.total || 0)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top Clientes Chart */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                            <Users className="w-4 h-4 text-violet-500" /> Top 5 Clientes
                        </CardTitle>
                        <CardDescription>Clientes con mayor facturación este mes</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={topClientsData} margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 11, fill: '#334155' }}
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [formatearPrecio(value), 'Total Compras']}
                                />
                                <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* City Distribution */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                            <MapPin className="w-4 h-4 text-red-500" /> Distribución Geográfica
                        </CardTitle>
                        <CardDescription>Ubicación de clientes activos</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={cityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {cityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table (Optional, reused from Top Clients logic if needed, but the Chart covers it well) */}
        </div>
    );
}
