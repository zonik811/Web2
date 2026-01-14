"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DollarSign,
    TrendingDown,
    Filter,
    Calendar as CalendarIcon,
    Plus,
    Search,
    Edit2,
    X
} from "lucide-react";
import { TestNotification } from "@/components/admin/TestNotification";
import { obtenerGastos, registrarGasto, actualizarGasto, obtenerGastosPorCategoria, type Gasto } from "@/lib/actions/gastos";
import { formatearPrecio, formatearFecha } from "@/lib/utils";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

export default function GastosPage() {
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [statsPorCategoria, setStatsPorCategoria] = useState<{ [key: string]: number }>({});
    const [filtros, setFiltros] = useState({
        categoria: "todos",
        anio: new Date().getFullYear().toString(),
        mes: (new Date().getMonth() + 1).toString(),
        tipo: "mes" // "mes", "anio", "dia"
    });
    const [fechaEspecifica, setFechaEspecifica] = useState(new Date().toISOString().split('T')[0]);
    const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);

    const [nuevoGasto, setNuevoGasto] = useState({
        categoria: "materiales",
        concepto: "",
        monto: 0,
        metodoPago: "efectivo",
        proveedor: "",
        fecha: new Date().toISOString().split("T")[0],
        notas: ""
    });

    const [globalStats, setGlobalStats] = useState({
        totalGastos: 0,
        promedioGasto: 0,
        mayorGasto: 0,
        categoriaTop: { nombre: '', monto: 0, porcentaje: 0 },
        count: 0
    });

    useEffect(() => {
        cargarDatos();
    }, [filtros, fechaEspecifica]);

    const cargarDatos = async () => {
        try {
            setLoading(true);

            // Construir fechas de inicio y fin según el filtro
            let fechaInicio = "";
            let fechaFin = "";

            if (filtros.tipo === "dia") {
                fechaInicio = fechaEspecifica;
                fechaFin = fechaEspecifica;
            } else if (filtros.tipo === "mes") {
                const year = parseInt(filtros.anio);
                const month = parseInt(filtros.mes) - 1; // 0-indexed
                const start = new Date(year, month, 1);
                const end = new Date(year, month + 1, 0); // Last day of month

                // Formato YYYY-MM-DD
                fechaInicio = start.toISOString().split('T')[0];
                fechaFin = end.toISOString().split('T')[0];
            } else if (filtros.tipo === "anio") {
                fechaInicio = `${filtros.anio}-01-01`;
                fechaFin = `${filtros.anio}-12-31`;
            }

            const [gastosData, stats] = await Promise.all([
                obtenerGastos({
                    categoria: filtros.categoria,
                    fechaInicio,
                    fechaFin
                }),
                obtenerGastosPorCategoria()
            ]);
            setGastos(gastosData);
            setStatsPorCategoria(stats);

            // Calcular KPIs
            const total = gastosData.reduce((sum, g) => sum + g.monto, 0);
            const count = gastosData.length;
            const promedio = count > 0 ? total / count : 0;
            const max = gastosData.reduce((max, g) => Math.max(max, g.monto), 0);

            // Categoria Top (de los datos actuales filtrados)
            const catStats: Record<string, number> = {};
            gastosData.forEach(g => {
                catStats[g.categoria] = (catStats[g.categoria] || 0) + g.monto;
            });
            const topCatKey = Object.keys(catStats).sort((a, b) => catStats[b] - catStats[a])[0];
            const topCatNombre = topCatKey || '---';
            const topCatMonto = topCatKey ? catStats[topCatKey] : 0;
            const topCatPorcentaje = total > 0 ? (topCatMonto / total) * 100 : 0;

            setGlobalStats({
                totalGastos: total,
                promedioGasto: promedio,
                mayorGasto: max,
                categoriaTop: {
                    nombre: topCatNombre,
                    monto: topCatMonto,
                    porcentaje: topCatPorcentaje
                },
                count
            });

        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGuardarGasto = async () => {
        if (!nuevoGasto.concepto || nuevoGasto.monto <= 0) return;

        try {
            let result;

            if (editingGasto) {
                result = await actualizarGasto(editingGasto.$id, nuevoGasto);
            } else {
                result = await registrarGasto(nuevoGasto);
            }

            if (result.success) {
                cerrarDialogo();
                cargarDatos();
            }
        } catch (error) {
            console.error("Error guardando gasto:", error);
        }
    };

    const iniciarEdicion = (gasto: Gasto) => {
        setEditingGasto(gasto);
        setNuevoGasto({
            categoria: gasto.categoria,
            concepto: gasto.concepto,
            monto: gasto.monto,
            metodoPago: gasto.metodoPago,
            proveedor: gasto.proveedor || "",
            fecha: gasto.fecha.split('T')[0],
            notas: gasto.notas || ""
        });
        setShowDialog(true);
    };

    const cerrarDialogo = () => {
        setShowDialog(false);
        setEditingGasto(null);
        setNuevoGasto({
            categoria: "materiales",
            concepto: "",
            monto: 0,
            metodoPago: "efectivo",
            proveedor: "",
            fecha: new Date().toISOString().split("T")[0],
            notas: ""
        });
    };

    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
    const chartData = Object.entries(statsPorCategoria).map(([categoria, monto]) => ({
        name: categoria.replace("_", " "),
        monto: monto
    })).sort((a, b) => b.monto - a.monto);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Control de Gastos</h1>
                    <p className="text-gray-500 mt-1">Gestiona y visualiza los egresos operativos</p>
                </div>
                <div className="flex items-center gap-2">
                    <TestNotification />
                    <Button
                        onClick={() => setShowDialog(true)}
                        className="bg-black hover:bg-zinc-800 text-white shadow-lg shadow-black/10 transition-all hover:scale-105"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Registrar Gasto
                    </Button>
                </div>
            </div>

            {/* Dashboard Grid */}
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Total Gastos */}
                <Card className="border-none shadow-md bg-gradient-to-br from-rose-500 to-pink-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <TrendingDown className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-rose-100 font-medium text-sm flex items-center">
                            <DollarSign className="mr-2 h-4 w-4" /> Total Gastos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{formatearPrecio(globalStats.totalGastos)}</div>
                        <p className="text-rose-100/80 text-xs mt-1">
                            {globalStats.count} transacciones
                        </p>
                    </CardContent>
                </Card>

                {/* 2. Promedio */}
                <Card className="border-none shadow-md bg-white overflow-hidden relative">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-gray-500 font-medium text-sm">Promedio por Gasto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{formatearPrecio(globalStats.promedioGasto)}</div>
                        <p className="text-gray-400 text-xs mt-1">Ticket promedio de salida</p>
                    </CardContent>
                </Card>

                {/* 3. Mayor Gasto */}
                <Card className="border-none shadow-md bg-white overflow-hidden relative">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-gray-500 font-medium text-sm">Mayor Gasto Registrado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-rose-600">{formatearPrecio(globalStats.mayorGasto)}</div>
                        <p className="text-gray-400 text-xs mt-1">En el periodo seleccionado</p>
                    </CardContent>
                </Card>

                {/* 4. Categoría Top */}
                <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Filter className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-indigo-100 font-medium text-sm">Categoría Principal</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold capitalize truncate">{globalStats.categoriaTop.nombre.replace("_", " ")}</div>
                        <p className="text-indigo-100/90 text-xs mt-1">
                            {globalStats.categoriaTop.porcentaje.toFixed(1)}% del total ({formatearPrecio(globalStats.categoriaTop.monto)})
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Chart */}
                <Card className="border-none shadow-md bg-white">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Distribución de Gastos</CardTitle>
                        <CardDescription>Gastos acumulados por categoría</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={120}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => formatearPrecio(value)}
                                    />
                                    <Bar dataKey="monto" radius={[0, 4, 4, 0]} barSize={32}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Table Section */}
            <div className="space-y-4">
                {/* Filters Toolbar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-medium">Filtrar por:</span>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {["dia", "mes", "anio"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFiltros({ ...filtros, tipo: type })}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filtros.tipo === type
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                {type === "dia" ? "Día" : type === "mes" ? "Mes" : "Año"}
                            </button>
                        ))}
                    </div>

                    {filtros.tipo === "dia" && (
                        <div className="relative">
                            <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                type="date"
                                value={fechaEspecifica}
                                onChange={(e) => setFechaEspecifica(e.target.value)}
                                className="w-40 pl-9 h-9 text-sm"
                            />
                        </div>
                    )}

                    {filtros.tipo !== "dia" && (
                        <select
                            value={filtros.anio}
                            onChange={(e) => setFiltros({ ...filtros, anio: e.target.value })}
                            className="h-9 px-3 py-1 bg-white border rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    )}

                    {filtros.tipo === "mes" && (
                        <select
                            value={filtros.mes}
                            onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}
                            className="h-9 px-3 py-1 bg-white border rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    )}

                    <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>

                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            value={filtros.categoria}
                            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                            className="w-full h-9 pl-9 pr-3 py-1 bg-white border rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                        >
                            <option value="todos">Todas las categorías</option>
                            <option value="transporte">Transporte</option>
                            <option value="materiales">Materiales</option>
                            <option value="arriendo">Arriendo</option>
                            <option value="servicios">Servicios</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <Card className="border-none shadow-md overflow-hidden bg-white">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="font-semibold text-gray-600 pl-6">Fecha</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Categoría</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Concepto</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Proveedor</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Método</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-600 pr-6">Monto</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                            Cargando datos...
                                        </TableCell>
                                    </TableRow>
                                ) : gastos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                            <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                                <TrendingDown className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <p className="font-medium text-gray-900">No hay gastos registrados</p>
                                            <p className="text-sm mt-1">Intenta cambiar los filtros o registra un nuevo gasto</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    gastos.map((gasto) => (
                                        <TableRow key={gasto.$id} className="hover:bg-gray-50/50 transition-colors group">
                                            <TableCell className="font-medium text-gray-900 pl-6">{formatearFecha(gasto.fecha)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="capitalize font-normal border-0 shadow-sm px-2.5 py-0.5"
                                                    style={{
                                                        backgroundColor: COLORS[Math.abs(gasto.categoria.length) % COLORS.length] + '15',
                                                        color: COLORS[Math.abs(gasto.categoria.length) % COLORS.length]
                                                    }}
                                                >
                                                    {gasto.categoria.replace("_", " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600 font-medium">{gasto.concepto}</TableCell>
                                            <TableCell className="text-gray-500 text-sm">{gasto.proveedor || "-"}</TableCell>
                                            <TableCell className="text-gray-500 text-sm capitalize">{gasto.metodoPago}</TableCell>
                                            <TableCell className="text-right font-bold text-gray-900 pr-6">
                                                {formatearPrecio(gasto.monto)}
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600"
                                                        onClick={() => iniciarEdicion(gasto)}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Modal Form */}
            {showDialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                        {/* Header Premium */}
                        <div className="px-6 py-5 bg-gradient-to-r from-rose-600 to-pink-600 text-white flex justify-between items-center shadow-md">
                            <div>
                                <h3 className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
                                    {editingGasto ? <Edit2 className="h-5 w-5 opacity-80" /> : <Plus className="h-5 w-5 opacity-80" />}
                                    {editingGasto ? "Editar Gasto" : "Registrar Nuevo Gasto"}
                                </h3>
                                <p className="text-rose-100/90 text-sm mt-0.5 font-medium">Completa la información financiera</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={cerrarDialogo}
                                className="rounded-full hover:bg-white/20 text-white hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-6 grid grid-cols-2 gap-5">
                            <div className="col-span-2 sm:col-span-1 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Filter className="h-3.5 w-3.5" /> Categoría
                                </label>
                                <div className="relative">
                                    <select
                                        value={nuevoGasto.categoria}
                                        onChange={(e) => setNuevoGasto({ ...nuevoGasto, categoria: e.target.value })}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white hover:border-rose-200 transition-all outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500 text-sm font-medium appearance-none cursor-pointer"
                                    >
                                        <option value="transporte">Transporte</option>
                                        <option value="materiales">Materiales</option>
                                        <option value="arriendo">Arriendo</option>
                                        <option value="servicios">Servicios</option>
                                        <option value="otros">Otros</option>
                                    </select>
                                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 sm:col-span-1 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <DollarSign className="h-3.5 w-3.5" /> Monto
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-3 h-5 w-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 transition-transform group-focus-within:scale-110">
                                        <DollarSign className="h-3 w-3" />
                                    </div>
                                    <Input
                                        type="number"
                                        value={nuevoGasto.monto}
                                        onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: parseInt(e.target.value) || 0 })}
                                        className="pl-10 h-11 border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white hover:border-rose-200 focus:ring-rose-100 focus:border-rose-500 font-semibold text-gray-900"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Edit2 className="h-3.5 w-3.5" /> Concepto
                                </label>
                                <Input
                                    value={nuevoGasto.concepto}
                                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, concepto: e.target.value })}
                                    placeholder="Ej: Compra de insumos de limpieza"
                                    className="h-11 border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white hover:border-rose-200 focus:ring-rose-100 focus:border-rose-500 transition-all font-medium"
                                />
                            </div>

                            <div className="col-span-2 sm:col-span-1 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Filter className="h-3.5 w-3.5" /> Método
                                </label>
                                <div className="relative">
                                    <select
                                        value={nuevoGasto.metodoPago}
                                        onChange={(e) => setNuevoGasto({ ...nuevoGasto, metodoPago: e.target.value })}
                                        className="w-full h-11 px-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white hover:border-rose-200 transition-all outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500 text-sm font-medium appearance-none cursor-pointer"
                                    >
                                        <option value="efectivo">Efectivo</option>
                                        <option value="transferencia">Transferencia</option>
                                        <option value="nequi">Nequi</option>
                                        <option value="tarjeta">Tarjeta</option>
                                    </select>
                                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 sm:col-span-1 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <CalendarIcon className="h-3.5 w-3.5" /> Fecha
                                </label>
                                <Input
                                    type="date"
                                    value={nuevoGasto.fecha}
                                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })}
                                    className="h-11 border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white hover:border-rose-200 focus:ring-rose-100 focus:border-rose-500 font-medium text-gray-600 block w-full"
                                />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Proveedor (Opcional)</label>
                                <Input
                                    value={nuevoGasto.proveedor}
                                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, proveedor: e.target.value })}
                                    placeholder="Nombre del proveedor o tienda"
                                    className="h-11 border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white hover:border-rose-200 focus:ring-rose-100 focus:border-rose-500 transition-all text-sm"
                                />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Notas (Opcional)</label>
                                <Input
                                    value={nuevoGasto.notas}
                                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, notas: e.target.value })}
                                    placeholder="Detalles adicionales..."
                                    className="h-11 border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white hover:border-rose-200 focus:ring-rose-100 focus:border-rose-500 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex gap-3 justify-end items-center">
                            <Button variant="ghost" onClick={cerrarDialogo} className="h-11 px-6 font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl">
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleGuardarGasto}
                                className="h-11 px-8 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg shadow-rose-200 rounded-xl font-bold tracking-wide transition-all transform hover:scale-[1.02]"
                            >
                                {editingGasto ? "Actualizar Gasto" : "Guardar Gasto"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
