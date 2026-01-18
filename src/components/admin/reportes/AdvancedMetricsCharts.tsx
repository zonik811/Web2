"use client";

import { AdvancedMetrics } from "@/lib/actions/reportes-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";
import { formatearPrecio } from "@/lib/utils";
import { TrendingUp, Clock, CreditCard, ShoppingBag, Users } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface AdvancedMetricsChartsProps {
    metrics: AdvancedMetrics;
    title?: string;
    description?: string;
}

export function AdvancedMetricsCharts({ metrics, title, description }: AdvancedMetricsChartsProps) {

    // Prepare Data for Charts
    const hourlyData = metrics.ventasPorHora.map((val, index) => ({
        hour: `${index}:00`,
        ventas: val
    }));

    const topProductsData = metrics.topProductos.map(p => ({
        name: p.nombre.length > 15 ? p.nombre.substring(0, 15) + '...' : p.nombre,
        full_name: p.nombre,
        cantidad: p.cantidad,
        total: p.total
    }));

    const paymentMethodsData = metrics.metodosPago.map(m => ({
        name: m.nombre,
        value: m.cantidad
    }));

    return (
        <div className="space-y-6">
            {/* Header Section */}
            {(title || description) && (
                <div>
                    {title && <h3 className="text-lg font-bold text-slate-800">{title}</h3>}
                    {description && <p className="text-sm text-slate-500">{description}</p>}
                </div>
            )}

            {/* Key Metrics Grid (Ticket Avg & Clients) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" /> Ticket Promedio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {formatearPrecio(metrics.ticketPromedio)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Valor medio por transacción</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" /> Clientes Únicos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {metrics.clientes.totalUnicos}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Clientes atendidos en este periodo</p>
                    </CardContent>
                </Card>

                {/* Placeholder for future metrics or spacer */}
                <Card className="bg-white border-slate-100 shadow-sm md:col-span-2 flex flex-col justify-center items-center p-4 bg-slate-50/50">
                    <p className="text-sm text-slate-400 italic text-center">
                        "El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el valor para continuar."
                    </p>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Ventas por Hora (Heatmap-like Bar Chart) */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                            <Clock className="w-4 h-4 text-violet-500" /> Actividad por Hora
                        </CardTitle>
                        <CardDescription>Distribución de transacciones a lo largo del día</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="hour"
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    interval={3} // Show every 3rd label to avoid clutter
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="ventas" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Transacciones" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Productos (Horizontal Bar layout using generic BarChart reversed or plain list? Recharts supports horizontal layout) */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                            <ShoppingBag className="w-4 h-4 text-emerald-500" /> Productos/Servicios Top
                        </CardTitle>
                        <CardDescription>Los 5 más vendidos por cantidad</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={topProductsData} margin={{ left: 20 }}>
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
                                    formatter={(value: any) => [value, 'Cantidad']}
                                />
                                <Bar dataKey="cantidad" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                                    {/* Optional: Add labels on bars? */}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Métodos de Pago */}
                <Card className="border-slate-100 shadow-sm md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                            <CreditCard className="w-4 h-4 text-blue-500" /> Métodos de Pago
                        </CardTitle>
                        <CardDescription>Preferencias de pago de los clientes</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentMethodsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {paymentMethodsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Products by Revenue (Different View - reusing topProducts data but displaying Revenue?) 
                    User asked for "Top Productos/Servicios". We showed quantity.
                    Let's use this spot for a simple list of top products with Revenue details.
                */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                            <TrendingUp className="w-4 h-4 text-amber-500" /> Top Ingresos
                        </CardTitle>
                        <CardDescription>Productos/Servicios que más generan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...metrics.topProductos].sort((a, b) => b.total - a.total).slice(0, 5).map((prod, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs font-bold text-slate-500 shadow-sm border border-slate-100">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm font-medium text-slate-700 truncate max-w-[120px] md:max-w-[180px]">
                                            {prod.nombre}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-800">{formatearPrecio(prod.total)}</div>
                                        <div className="text-xs text-slate-500">{prod.cantidad} vendidos</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
