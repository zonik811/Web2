"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    CalendarIcon, TrendingUp, CreditCard, Banknote,
    DollarSign, Wallet, Download, ChevronDown, ChevronRight,
    Clock, User, CheckCircle2, XCircle
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn, formatearPrecio } from "@/lib/utils";
import { obtenerReporteVentas, obtenerHistorialCierres, obtenerVentasDetalladas, ReporteResumen, VentaDetallada } from "@/lib/actions/reportes-pos";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
    efectivo: '#10b981',
    tarjeta: '#8b5cf6',
    transferencia: '#f59e0b',
};

export default function POSReportesPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [period, setPeriod] = useState<'dia' | 'semana' | 'mes'>('dia');
    const [loading, setLoading] = useState(false);
    const [reporte, setReporte] = useState<ReporteResumen | null>(null);
    const [historialCierres, setHistorialCierres] = useState<any[]>([]);
    const [ventasDetalladas, setVentasDetalladas] = useState<VentaDetallada[]>([]);
    const [expandedSale, setExpandedSale] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [date, period]);

    const loadData = async () => {
        if (!date) return;
        setLoading(true);

        let start = startOfDay(date);
        let end = endOfDay(date);

        if (period === 'semana') {
            start = subDays(start, 7);
        } else if (period === 'mes') {
            start = subDays(start, 30);
        }

        try {
            const [dataResumen, dataCierres, dataVentas] = await Promise.all([
                obtenerReporteVentas(start, end),
                obtenerHistorialCierres(start, end),
                obtenerVentasDetalladas(start, end)
            ]);
            setReporte(dataResumen);
            setHistorialCierres(dataCierres);
            setVentasDetalladas(dataVentas);
        } catch (error) {
            console.error("Error loading reports", error);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const chartData = reporte ? [
        { name: 'Efectivo', value: reporte.totalEfectivo, color: COLORS.efectivo },
        { name: 'Tarjetas', value: reporte.totalTarjeta, color: COLORS.tarjeta },
        { name: 'Transferencias', value: reporte.totalTransferencia, color: COLORS.transferencia },
    ].filter(item => item.value > 0) : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            Reportes de Ventas
                        </h1>
                        <p className="text-slate-500 mt-1">Análisis de rendimiento y medios de pago</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Quick filters */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                            <Button
                                size="sm"
                                variant={period === 'dia' ? 'default' : 'ghost'}
                                onClick={() => setPeriod('dia')}
                                className="text-xs"
                            >
                                Hoy
                            </Button>
                            <Button
                                size="sm"
                                variant={period === 'semana' ? 'default' : 'ghost'}
                                onClick={() => setPeriod('semana')}
                                className="text-xs"
                            >
                                7 días
                            </Button>
                            <Button
                                size="sm"
                                variant={period === 'mes' ? 'default' : 'ghost'}
                                onClick={() => setPeriod('mes')}
                                className="text-xs"
                            >
                                30 días
                            </Button>
                        </div>

                        {/* Date picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[200px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                    size="sm"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: es }) : <span>Fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Export button */}
                        <Button size="sm" variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Exportar
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Ventas */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Ventas Totales</p>
                            <h3 className="text-3xl font-bold text-slate-900 mb-2">
                                {loading ? "..." : formatearPrecio(reporte?.totalVentas || 0)}
                            </h3>
                            <p className="text-xs text-slate-400">100% del período</p>
                        </CardContent>
                    </Card>

                    {/* Efectivo */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                    <Banknote className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                    {reporte?.totalVentas ? Math.round((reporte.totalEfectivo / reporte.totalVentas) * 100) : 0}%
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Efectivo</p>
                            <h3 className="text-3xl font-bold text-slate-900 mb-3">
                                {loading ? "..." : formatearPrecio(reporte?.totalEfectivo || 0)}
                            </h3>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${reporte?.totalVentas ? (reporte.totalEfectivo / reporte.totalVentas) * 100 : 0}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tarjetas */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                                    <CreditCard className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                    {reporte?.totalVentas ? Math.round((reporte.totalTarjeta / reporte.totalVentas) * 100) : 0}%
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Tarjetas</p>
                            <h3 className="text-3xl font-bold text-slate-900 mb-3">
                                {loading ? "..." : formatearPrecio(reporte?.totalTarjeta || 0)}
                            </h3>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${reporte?.totalVentas ? (reporte.totalTarjeta / reporte.totalVentas) * 100 : 0}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transferencias */}
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-amber-50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                                    <Wallet className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                    {reporte?.totalVentas ? Math.round((reporte.totalTransferencia / reporte.totalVentas) * 100) : 0}%
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Transferencias</p>
                            <h3 className="text-3xl font-bold text-slate-900 mb-3">
                                {loading ? "..." : formatearPrecio(reporte?.totalTransferencia || 0)}
                            </h3>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${reporte?.totalVentas ? (reporte.totalTransferencia / reporte.totalVentas) * 100 : 0}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pie Chart - Distribution */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Distribución por Método de Pago</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-64 flex items-center justify-center">
                                    <p className="text-slate-400">Cargando...</p>
                                </div>
                            ) : chartData.length === 0 ? (
                                <div className="h-64 flex items-center justify-center">
                                    <p className="text-slate-400">No hay datos para mostrar</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatearPrecio(value as number)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Breakdown List */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Desglose Detallado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <p className="text-center text-slate-400 py-10">Cargando...</p>
                                ) : reporte?.desglosePagos.length === 0 ? (
                                    <p className="text-center text-slate-400 py-10">No hay datos</p>
                                ) : (
                                    reporte?.desglosePagos.map((item, idx) => (
                                        <div key={idx} className="space-y-2 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <span className="capitalize flex items-center gap-2 font-medium">
                                                    {item.metodo === 'transferencia' ? (
                                                        <Wallet className="h-4 w-4 text-amber-500" />
                                                    ) : item.metodo === 'tarjeta' ? (
                                                        <CreditCard className="h-4 w-4 text-purple-500" />
                                                    ) : (
                                                        <Banknote className="h-4 w-4 text-blue-500" />
                                                    )}
                                                    {item.detalle || item.metodo}
                                                </span>
                                                <span className="font-bold">{formatearPrecio(item.total)}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        item.metodo === 'transferencia' ? 'bg-amber-500' :
                                                            item.metodo === 'tarjeta' ? 'bg-purple-500' : 'bg-blue-500'
                                                    )}
                                                    style={{ width: `${(item.total / (reporte?.totalVentas || 1)) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {item.cantidad} {item.cantidad === 1 ? 'transacción' : 'transacciones'}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Timeline - Cash Register Closures */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Historial de Cierres de Caja
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center text-slate-400 py-10">Cargando...</p>
                        ) : historialCierres.length === 0 ? (
                            <p className="text-center text-slate-400 py-10">No hay cierres registrados</p>
                        ) : (
                            <div className="space-y-4">
                                {historialCierres.map((turno, idx) => {
                                    const diferencia = turno.diferencia || 0;
                                    const isDiferenciaPositiva = diferencia >= 0;

                                    return (
                                        <div
                                            key={turno.$id}
                                            className="relative pl-8 pb-8 border-l-2 border-slate-200 last:border-0 last:pb-0"
                                        >
                                            {/* Timeline dot */}
                                            <div className={cn(
                                                "absolute left-[-9px] top-1 w-4 h-4 rounded-full border-4 border-white",
                                                turno.estado === 'abierta' ? 'bg-emerald-500' : 'bg-slate-400'
                                            )} />

                                            <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-[200px]">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <User className="h-4 w-4 text-slate-400" />
                                                            <span className="font-semibold text-slate-900">
                                                                {turno.usuario_nombre}
                                                            </span>
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                                                turno.estado === 'abierta'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-slate-100 text-slate-600'
                                                            )}>
                                                                {turno.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-500">
                                                            {format(new Date(turno.fecha_apertura), "PPP 'a las' HH:mm", { locale: es })}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-6">
                                                        <div className="text-right">
                                                            <p className="text-xs text-slate-500 mb-1">Total Sistema</p>
                                                            <p className="text-lg font-bold text-slate-900">
                                                                {formatearPrecio(
                                                                    (turno.total_ventas_efectivo || 0) +
                                                                    (turno.total_ventas_tarjeta || 0) +
                                                                    (turno.total_ventas_transferencia || 0)
                                                                )}
                                                            </p>
                                                        </div>

                                                        {turno.estado === 'cerrada' && (
                                                            <>
                                                                <div className="text-right">
                                                                    <p className="text-xs text-slate-500 mb-1">Declarado</p>
                                                                    <p className="text-lg font-bold text-slate-900">
                                                                        {formatearPrecio(
                                                                            (turno.efectivo_cierre || 0) +
                                                                            (turno.tarjetas_cierre || 0)
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                <div className="text-right">
                                                                    <p className="text-xs text-slate-500 mb-1">Diferencia</p>
                                                                    <div className="flex items-center gap-1 justify-end">
                                                                        {isDiferenciaPositiva ? (
                                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                                        ) : (
                                                                            <XCircle className="h-4 w-4 text-red-600" />
                                                                        )}
                                                                        <p className={cn(
                                                                            "text-lg font-bold",
                                                                            isDiferenciaPositiva ? "text-emerald-600" : "text-red-600"
                                                                        )}>
                                                                            {formatearPrecio(diferencia)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detailed Sales Table */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Detalle de Ventas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                                    <tr>
                                        <th className="p-4 text-left font-semibold text-slate-700">Orden</th>
                                        <th className="p-4 text-left font-semibold text-slate-700">Fecha</th>
                                        <th className="p-4 text-left font-semibold text-slate-700">Cliente</th>
                                        <th className="p-4 text-left font-semibold text-slate-700">Método</th>
                                        <th className="p-4 text-right font-semibold text-slate-700">Total</th>
                                        <th className="p-4 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-400">
                                                Cargando...
                                            </td>
                                        </tr>
                                    ) : ventasDetalladas.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-400">
                                                No hay ventas registradas
                                            </td>
                                        </tr>
                                    ) : (
                                        ventasDetalladas.map((venta) => (
                                            <>
                                                <tr
                                                    key={venta.$id}
                                                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                                                    onClick={() => setExpandedSale(expandedSale === venta.$id ? null : venta.$id)}
                                                >
                                                    <td className="p-4 font-mono text-xs text-slate-600">
                                                        {venta.numeroOrden}
                                                    </td>
                                                    <td className="p-4 text-slate-700">{venta.fechaOrden}</td>
                                                    <td className="p-4 text-slate-700">{venta.clienteNombre}</td>
                                                    <td className="p-4">
                                                        <span className={cn(
                                                            "px-2 py-1 rounded-full text-xs font-medium capitalize",
                                                            venta.metodoPago === 'efectivo' ? 'bg-blue-100 text-blue-700' :
                                                                venta.metodoPago === 'tarjeta' ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                        )}>
                                                            {venta.metodoPago}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right font-bold text-slate-900">
                                                        {formatearPrecio(venta.total)}
                                                    </td>
                                                    <td className="p-4">
                                                        {expandedSale === venta.$id ? (
                                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4 text-slate-400" />
                                                        )}
                                                    </td>
                                                </tr>
                                                {expandedSale === venta.$id && (
                                                    <tr>
                                                        <td colSpan={6} className="p-0 bg-gradient-to-r from-slate-50 to-slate-100">
                                                            <div className="p-6 border-t">
                                                                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                                                                    Productos
                                                                </p>
                                                                <div className="bg-white rounded-lg p-4 shadow-inner">
                                                                    <table className="w-full text-xs">
                                                                        <thead>
                                                                            <tr className="text-slate-500 border-b">
                                                                                <th className="text-left pb-2 font-semibold">Producto</th>
                                                                                <th className="text-right pb-2 font-semibold">Cant.</th>
                                                                                <th className="text-right pb-2 font-semibold">Precio Unit.</th>
                                                                                <th className="text-right pb-2 font-semibold">Subtotal</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-100">
                                                                            {venta.detalles.map((det, idx) => (
                                                                                <tr key={idx}>
                                                                                    <td className="py-2 text-slate-700">{det.productoNombre}</td>
                                                                                    <td className="py-2 text-right text-slate-600">{det.cantidad}</td>
                                                                                    <td className="py-2 text-right text-slate-600">
                                                                                        {formatearPrecio(det.precioUnitario)}
                                                                                    </td>
                                                                                    <td className="py-2 text-right font-semibold text-slate-900">
                                                                                        {formatearPrecio(det.subtotal)}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
