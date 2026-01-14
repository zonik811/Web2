"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DollarSign,
    Calendar as CalendarIcon,
    Plus,
    Search,
    User,
    Wallet,
    CheckCircle2,
    X,
    AlertCircle,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    MoreHorizontal,
    Trash2,
    Paperclip,
    Eye,
    Image as ImageIcon
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { obtenerPagosEmpleado, registrarPago, eliminarPago, type Pago } from "@/lib/actions/pagos";
import { obtenerEmpleados, obtenerEstadisticasEmpleado } from "@/lib/actions/empleados";
import { subirArchivo, obtenerURLArchivo } from "@/lib/appwrite";
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

const COLORS = ['#10B981', '#3b82f6', '#f97316', '#eab308', '#8b5cf6', '#ef4444'];

export default function PagosEmpleadosPage() {
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [filteredPagos, setFilteredPagos] = useState<Pago[]>([]);
    const [empleados, setEmpleados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedEmpleadoInfo, setSelectedEmpleadoInfo] = useState<any>(null);
    const [stats, setStats] = useState({
        totalPagado: 0,
        pagosCount: 0,
        promedioPago: 0
    });

    // Filtros
    const [filtros, setFiltros] = useState({
        empleadoId: "todos",
        mes: (new Date().getMonth() + 1).toString(),
        anio: new Date().getFullYear().toString(),
        search: ""
    });

    const [nuevoPago, setNuevoPago] = useState({
        empleadoId: "",
        monto: 0,
        concepto: "servicio",
        metodoPago: "transferencia",
        periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
        fechaPago: new Date().toISOString().split("T")[0],
        notas: ""
    });

    const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [globalStats, setGlobalStats] = useState({
        totalPendiente: 0,
        totalPagadoPeriodo: 0,
        topEmpleado: null as any,
        topIngresos: null as any,
        totalHoras: 0
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [filtros, pagos]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const empleadosData = await obtenerEmpleados();
            setEmpleados(empleadosData);

            // 1. Obtener pagos (existente)
            const allPagosPromises = empleadosData.map(emp => obtenerPagosEmpleado(emp.$id));
            const allPagosResults = await Promise.all(allPagosPromises);
            const allPagos = allPagosResults.flat().sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());

            // 2. Obtener estadísticas de TODOS los empleados para KPIs globales
            const statsPromises = empleadosData.map(emp => obtenerEstadisticasEmpleado(emp.$id));
            const statsResults = await Promise.all(statsPromises);

            // Vincular stats con empleado
            const empleadosConStats = empleadosData.map((emp, index) => ({
                ...emp,
                stats: statsResults[index]
            }));

            // 3. Calcular KPIs Globales
            const totalPendiente = statsResults.reduce((sum, s) => sum + s.pendientePorPagar, 0);
            const totalHoras = statsResults.reduce((sum, s) => sum + s.horasTrabajadasMes, 0);

            const topEmpleado = [...empleadosConStats].sort((a, b) => b.stats.totalServicios - a.stats.totalServicios)[0];
            const topIngresos = [...empleadosConStats].sort((a, b) => b.stats.totalGanado - a.stats.totalGanado)[0];

            setPagos(allPagos);
            setGlobalStats(prev => ({
                ...prev,
                totalPendiente,
                totalHoras,
                topEmpleado,
                topIngresos
            }));

        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let resultado = [...pagos];

        // Filtro por Empleado
        if (filtros.empleadoId !== "todos") {
            resultado = resultado.filter(p => p.empleadoId === filtros.empleadoId);
        }

        // Filtro por Fecha (Mes/Año)
        if (filtros.mes && filtros.anio) {
            resultado = resultado.filter(p => {
                const fecha = new Date(p.fechaPago);
                const mesPago = fecha.getMonth() + 1;
                const anioPago = fecha.getFullYear();
                return mesPago.toString() === filtros.mes && anioPago.toString() === filtros.anio;
            });
        }

        // Búsqueda global
        if (filtros.search) {
            const searchLower = filtros.search.toLowerCase();
            resultado = resultado.filter(p =>
                p.concepto.toLowerCase().includes(searchLower) ||
                p.notas?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredPagos(resultado);

        const total = resultado.reduce((sum, p) => sum + p.monto, 0);
        setGlobalStats(prev => ({
            ...prev,
            totalPagadoPeriodo: total
        }));
        setStats({
            totalPagado: total,
            pagosCount: resultado.length,
            promedioPago: resultado.length > 0 ? total / resultado.length : 0
        });
    };

    const handleEmpleadoChange = async (empleadoId: string) => {
        setNuevoPago({ ...nuevoPago, empleadoId });
        if (empleadoId) {
            try {
                const estadisticas = await obtenerEstadisticasEmpleado(empleadoId);
                setSelectedEmpleadoInfo(estadisticas);
                if (estadisticas.pendientePorPagar > 0) {
                    setNuevoPago(prev => ({ ...prev, empleadoId, monto: estadisticas.pendientePorPagar }));
                }
            } catch (error) {
                console.error("Error obteniendo estadísticas del empleado:", error);
            }
        } else {
            setSelectedEmpleadoInfo(null);
        }
    };

    const handleRegistrarPago = async () => {
        if (!nuevoPago.empleadoId || nuevoPago.monto <= 0) return;

        try {
            let comprobanteId = undefined;

            if (comprobanteFile) {
                setIsUploading(true);
                try {
                    comprobanteId = await subirArchivo(comprobanteFile);
                } catch (error) {
                    console.error("Error subiendo archivo:", error);
                    alert("Error al subir el comprobante. Intenta de nuevo.");
                    setIsUploading(false);
                    return;
                }
                setIsUploading(false);
            }

            const result = await registrarPago({
                ...nuevoPago,
                periodo: nuevoPago.fechaPago.slice(0, 7), // Asegurar always YYYY-MM
                comprobante: comprobanteId
            });
            if (result.success) {
                setShowDialog(false);
                setNuevoPago({
                    empleadoId: "",
                    monto: 0,
                    concepto: "servicio",
                    metodoPago: "transferencia",
                    periodo: new Date().toISOString().slice(0, 7),
                    fechaPago: new Date().toISOString().split("T")[0],
                    notas: ""
                });
                setComprobanteFile(null);
                setSelectedEmpleadoInfo(null);
                cargarDatos();
            }
        } catch (error) {
            console.error("Error registrando pago:", error);
        }
    };

    const handleEliminarPago = async (pagoId: string) => {
        if (confirm("¿Estás seguro de eliminar este pago? Se recalculará el saldo pendiente del empleado.")) {
            try {
                setLoading(true);
                await eliminarPago(pagoId);
                await cargarDatos();
            } catch (error) {
                console.error("Error eliminando pago:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const chartData = empleados.map(emp => {
        const pagosEmpleadoEnPeriodo = filteredPagos.filter(p => p.empleadoId === emp.$id);
        const total = pagosEmpleadoEnPeriodo.reduce((sum, p) => sum + p.monto, 0);
        return {
            name: `${emp.nombre.split(' ')[0]} ${emp.apellido.split(' ')[0]}`,
            monto: total
        };
    })
        .filter(item => item.monto > 0)
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 10);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pagos a Empleados</h1>
                    <p className="text-gray-500 mt-1">Gestión de nómina y pagos por servicios</p>
                </div>
                <Button
                    onClick={() => setShowDialog(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
                    disabled={loading}
                >
                    <Plus className="mr-2 h-4 w-4" /> Registrar Pago
                </Button>
            </div>

            {/* NEW Dashboard KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* 1. Total Pendiente (ALERTA) */}
                <Card className={`border-none shadow-md overflow-hidden relative ${globalStats.totalPendiente > 0 ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white' : 'bg-white'}`}>
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <AlertCircle className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className={`text-sm font-medium flex items-center ${globalStats.totalPendiente > 0 ? 'text-red-100' : 'text-gray-500'}`}>
                            <DollarSign className="mr-2 h-4 w-4" /> Deuda Total Pendiente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className={`text-3xl font-bold ${globalStats.totalPendiente > 0 ? 'text-white' : 'text-gray-900'}`}>
                            {formatearPrecio(globalStats.totalPendiente)}
                        </div>
                        <p className={`text-xs mt-1 ${globalStats.totalPendiente > 0 ? 'text-red-100' : 'text-gray-500'}`}>
                            Acumulado de todos los empleados
                        </p>
                    </CardContent>
                </Card>

                {/* 2. Top Empleado (Servicios) */}
                <Card className="border-none shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <CheckCircle2 className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-blue-100 font-medium text-sm flex items-center">
                            <User className="mr-2 h-4 w-4" /> Más Servicios
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold truncate">
                            {globalStats.topEmpleado ? `${globalStats.topEmpleado.nombre} ${globalStats.topEmpleado.apellido}` : '---'}
                        </div>
                        <p className="text-blue-100/90 text-sm mt-1">
                            {globalStats.topEmpleado ? `${globalStats.topEmpleado.stats.totalServicios} servicios completados` : 'Sin datos'}
                        </p>
                    </CardContent>
                </Card>

                {/* 3. Top Ingresos (Ganancias) */}
                <Card className="border-none shadow-md bg-gradient-to-br from-purple-500 to-violet-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Wallet className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-purple-100 font-medium text-sm flex items-center">
                            <DollarSign className="mr-2 h-4 w-4" /> Mayor Ingreso
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold truncate">
                            {globalStats.topIngresos ? `${globalStats.topIngresos.nombre} ${globalStats.topIngresos.apellido}` : '---'}
                        </div>
                        <p className="text-purple-100/90 text-sm mt-1">
                            {globalStats.topIngresos ? `Ganado: ${formatearPrecio(globalStats.topIngresos.stats.totalGanado)}` : 'Sin datos'}
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Total Pagado Periodo */}
                <Card className="border-none shadow-md bg-emerald-50 border-emerald-100 overflow-hidden relative">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-emerald-800 font-medium text-sm flex items-center">
                            <Wallet className="mr-2 h-4 w-4" /> Pagado este Periodo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-700">{formatearPrecio(globalStats.totalPagadoPeriodo)}</div>
                        <p className="text-emerald-600/80 text-xs mt-1">
                            {stats.pagosCount} transacciones registradas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Graphs Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-white lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-gray-800">Pagos por Empleado</CardTitle>
                        <CardDescription>Distribución de nómina en este periodo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number | undefined) => formatearPrecio(value || 0)}
                                    />
                                    <Bar dataKey="monto" radius={[4, 4, 0, 0]} barSize={40}>
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

            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2 text-gray-500 w-full md:w-auto">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filtrar:</span>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={filtros.mes}
                        onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}
                        className="h-9 px-3 bg-gray-50 border-gray-200 border rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none flex-1 md:flex-none"
                    >
                        {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => (
                            <option key={i} value={(i + 1).toString()}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={filtros.anio}
                        onChange={(e) => setFiltros({ ...filtros, anio: e.target.value })}
                        className="h-9 px-3 bg-gray-50 border-gray-200 border rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none flex-1 md:flex-none"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y.toString()}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block"></div>

                <div className="relative flex-1 w-full">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <select
                        value={filtros.empleadoId}
                        onChange={(e) => setFiltros({ ...filtros, empleadoId: e.target.value })}
                        className="w-full h-9 pl-9 pr-3 bg-gray-50 border-gray-200 border rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none"
                    >
                        <option value="todos">Todos los empleados</option>
                        {empleados.map(emp => (
                            <option key={emp.$id} value={emp.$id}>{emp.nombre} {emp.apellido}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden ring-1 ring-gray-100">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/80 border-b border-gray-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold text-gray-600 pl-6 h-12">Empleado</TableHead>
                                <TableHead className="font-semibold text-gray-600 h-12">Concepto</TableHead>
                                <TableHead className="font-semibold text-gray-600 h-12">Fecha</TableHead>
                                <TableHead className="font-semibold text-gray-600 h-12">Método</TableHead>
                                <TableHead className="text-right font-semibold text-gray-600 h-12 pr-6">Monto</TableHead>
                                <TableHead className="w-[50px] h-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16 text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
                                            <span className="text-sm font-medium animate-pulse">Cargando nómina...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredPagos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-24 text-gray-500">
                                        <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
                                            <Wallet className="h-10 w-10 text-gray-300" />
                                        </div>
                                        <p className="font-medium text-gray-900 text-lg">No hay pagos registrados</p>
                                        <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Prueba ajustando los filtros de fecha o empleado para ver más resultados.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPagos.map((pago) => {
                                    const empleado = empleados.find(e => e.$id === pago.empleadoId);

                                    // Badge Colors logic
                                    let badgeVariant = "secondary";
                                    let badgeClass = "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200";

                                    switch (pago.concepto) {
                                        case 'servicio':
                                            badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100";
                                            break;
                                        case 'bono':
                                            badgeClass = "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100";
                                            break;
                                        case 'anticipo':
                                            badgeClass = "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100";
                                            break;
                                        case 'pago_mensual':
                                            badgeClass = "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100";
                                            break;
                                    }

                                    return (
                                        <TableRow key={pago.$id} className="group hover:bg-gray-50/80 transition-all duration-200 border-b border-gray-50 last:border-0">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-700 font-bold text-sm ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform">
                                                        {empleado ? `${empleado.nombre[0]}${empleado.apellido[0]}` : 'EM'}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                            {empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado Desconocido'}
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                                                            ID: {pago.empleadoId.substring(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`capitalize font-medium px-2.5 py-0.5 shadow-sm ${badgeClass}`}>
                                                    {pago.concepto.replace("_", " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-700">{formatearFecha(pago.fechaPago)}</span>
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5">
                                                        Periodo: {pago.periodo}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-full ${pago.metodoPago === 'efectivo' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {pago.metodoPago === 'transferencia' ? <ArrowUpRight className="h-3.5 w-3.5" /> :
                                                            pago.metodoPago === 'efectivo' ? <Wallet className="h-3.5 w-3.5" /> :
                                                                <ArrowDownLeft className="h-3.5 w-3.5" />}
                                                    </div>
                                                    <span className="text-sm text-gray-600 capitalize font-medium">{pago.metodoPago}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <span className="font-bold text-gray-900 tracking-tight text-base">
                                                    {formatearPrecio(pago.monto)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 shadow-xl border border-gray-100 p-1 bg-white z-50">
                                                        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 px-2 py-1.5 uppercase tracking-wider bg-gray-50/50 rounded-t-sm mb-1">
                                                            Opciones
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-sm cursor-pointer p-2 transition-colors"
                                                            onClick={() => handleEliminarPago(pago.$id)}
                                                        >
                                                            <div className="flex items-center gap-2 w-full">
                                                                <div className="h-7 w-7 rounded-md bg-red-100/80 flex items-center justify-center shadow-sm">
                                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                                </div>
                                                                <span className="font-medium text-sm">Eliminar Pago</span>
                                                            </div>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl bg-white/95 backdrop-blur-md">
                    <DialogHeader className="pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl text-gray-900 tracking-tight">Registrar Pago</DialogTitle>
                                <DialogDescription className="text-gray-500 text-sm mt-0.5">
                                    Detalles de la transacción
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid gap-5 py-4">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Empleado</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <select
                                        value={nuevoPago.empleadoId}
                                        onChange={(e) => handleEmpleadoChange(e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none shadow-sm hover:border-gray-300 transition-colors"
                                    >
                                        <option value="">Seleccionar Empleado...</option>
                                        {empleados.map((emp) => (
                                            <option key={emp.$id} value={emp.$id}>
                                                {emp.nombre} {emp.apellido}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {selectedEmpleadoInfo && (
                                <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-in zoom-in-95 duration-200">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5 flex-shrink-0">
                                        <Wallet className="h-4 w-4" />
                                    </div>
                                    <div className="w-full">
                                        <p className="text-sm font-semibold text-blue-900">Estado de Cuenta</p>
                                        <div className="mt-2 grid grid-cols-2 gap-4">
                                            <div className="bg-white/60 rounded px-2 py-1">
                                                <span className="text-[10px] text-blue-500 uppercase font-bold block">Ganado Histórico</span>
                                                <span className="text-sm text-blue-700 font-medium">{formatearPrecio(selectedEmpleadoInfo.totalGanado)}</span>
                                            </div>
                                            <div className="bg-white/80 rounded px-2 py-1 shadow-sm ring-1 ring-blue-100">
                                                <span className="text-[10px] text-blue-500 uppercase font-bold block">Pendiente</span>
                                                <span className="text-sm text-blue-800 font-bold">{formatearPrecio(selectedEmpleadoInfo.pendientePorPagar)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="col-span-2 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Monto a Pagar</Label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <Input
                                        type="number"
                                        value={nuevoPago.monto}
                                        onChange={(e) => setNuevoPago({ ...nuevoPago, monto: parseInt(e.target.value) || 0 })}
                                        className="pl-14 h-14 text-2xl font-bold text-gray-900 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 bg-white shadow-sm"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="date"
                                        value={nuevoPago.fechaPago}
                                        onChange={(e) => setNuevoPago({ ...nuevoPago, fechaPago: e.target.value })}
                                        className="pl-9 h-10 border-gray-200 bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Método</Label>
                                <select
                                    value={nuevoPago.metodoPago}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, metodoPago: e.target.value })}
                                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 appearance-none"
                                >
                                    <option value="transferencia">Transferencia</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="nequi">Nequi</option>
                                    <option value="daviplata">Daviplata</option>
                                </select>
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Concepto</Label>
                                <select
                                    value={nuevoPago.concepto}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, concepto: e.target.value })}
                                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 appearance-none"
                                >
                                    <option value="servicio">Pago por Servicio</option>
                                    <option value="pago_mensual">Pago Mensual/Quincenal</option>
                                    <option value="anticipo">Anticipo</option>
                                    <option value="bono">Bono / Extra</option>
                                    <option value="deduccion">Deducción</option>
                                </select>
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Periodo / Notas</Label>
                                <Input
                                    value={nuevoPago.periodo}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, periodo: e.target.value })}
                                    placeholder="Ej: Nomina Enero 2024"
                                    className="border-gray-200 bg-white"
                                />
                            </div>

                            {/* Comprobante Upload */}
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Comprobante (Opcional)</Label>
                                <div className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative"
                                    onClick={() => document.getElementById('file-upload-empleado')?.click()}>

                                    <input
                                        id="file-upload-empleado"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => setComprobanteFile(e.target.files ? e.target.files[0] : null)}
                                    />

                                    {comprobanteFile ? (
                                        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full z-10">
                                            <ImageIcon className="h-4 w-4" />
                                            <span className="text-sm font-medium truncate max-w-[200px]">{comprobanteFile.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 hover:bg-blue-200 rounded-full ml-1"
                                                onClick={(e) => { e.stopPropagation(); setComprobanteFile(null); }}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mb-2">
                                                <Paperclip className="h-4 w-4" />
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium">Adjuntar imagen</p>
                                            <p className="text-xs text-gray-400">JPG, PNG (Max 5MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2 border-t border-gray-100">
                        <Button variant="ghost" onClick={() => setShowDialog(false)} className="hover:bg-gray-100 text-gray-600">Cancelar</Button>
                        <Button
                            onClick={handleRegistrarPago}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-6"
                            disabled={!nuevoPago.empleadoId || nuevoPago.monto <= 0 || isUploading}
                        >
                            {isUploading ? "Subiendo..." : "Confirmar Pago"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
