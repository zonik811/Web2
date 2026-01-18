"use client";

import { InventoryAdvancedMetrics } from "@/lib/actions/reportes-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Package, AlertTriangle, TrendingUp, DollarSign, Tag } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899'];

interface InventoryMetricsChartsProps {
    metrics: InventoryAdvancedMetrics;
    totalProductos: number;
    bajoStock: number;
}

export function InventoryMetricsCharts({ metrics, totalProductos, bajoStock }: InventoryMetricsChartsProps) {

    // Category Data
    const categoryData = metrics.distribucionCategorias.map(c => ({
        name: c.nombre,
        value: c.cantidad
    }));

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">

            {/* KPI Grid - Valuation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Costo Total */}
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-blue-500" /> Costo Inventario
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {formatCurrency(metrics.valoracion.costoTotal)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Valor de compra actual</p>
                    </CardContent>
                </Card>

                {/* Venta Total */}
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-500" /> Valor Venta Estimado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {formatCurrency(metrics.valoracion.ventaTotal)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Si se vende todo el stock</p>
                    </CardContent>
                </Card>

                {/* Ganancia */}
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-amber-500" /> Ganancia Potencial
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {formatCurrency(metrics.valoracion.gananciaEstimada)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Margen bruto proyectado</p>
                    </CardContent>
                </Card>
            </div>


            {/* Charts & Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Category Distribution */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                            <Package className="w-4 h-4 text-indigo-500" /> Distribución por Categoría
                        </CardTitle>
                        <CardDescription>Segmentación del catálogo ({totalProductos} productos)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Sin datos de categorías
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Low Stock Alerts */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                            <AlertTriangle className="w-4 h-4 text-rose-500" /> Alertas de Stock Bajo
                        </CardTitle>
                        <CardDescription>
                            {bajoStock > 0 ? `${bajoStock} productos requieren reabastecimiento` : 'Inventario saludable'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {metrics.alertasStock.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Stock</TableHead>
                                        <TableHead className="text-right">Mínimo</TableHead>
                                        <TableHead className="text-center">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {metrics.alertasStock.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-sm truncate max-w-[150px]" title={item.producto}>
                                                {item.producto}
                                                <div className="text-[10px] text-slate-400">{item.sku}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-rose-600">
                                                {item.stock}
                                            </TableCell>
                                            <TableCell className="text-right text-slate-500">
                                                {item.minimo}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="destructive" className="h-5 text-[10px]">Crítico</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Package className="w-8 h-8 opacity-20" />
                                <p>Todo en orden</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>

        </div>
    );
}
