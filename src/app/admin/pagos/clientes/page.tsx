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
    TrendingUp,
    Plus,
    X,
    User,
    Calendar,
    Briefcase,
    Filter,
    Search,
    Trash2,
    AlertTriangle,
    Wallet,
    ArrowUpRight,
    Star,
    AlertCircle,
    ShoppingBag,
    CheckCircle2,
    MoreHorizontal,
    CalendarIcon,
    Paperclip,
    Eye,
    Image as ImageIcon
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { obtenerPagosClientes, registrarPagoCliente, eliminarPagoCliente, type PagoCliente } from "@/lib/actions/pagos-clientes";
import { obtenerCitas } from "@/lib/actions/citas";
import { obtenerClientes } from "@/lib/actions/clientes";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

export default function PagosClientesPage() {
    const [pagos, setPagos] = useState<PagoCliente[]>([]);
    const [filteredPagos, setFilteredPagos] = useState<PagoCliente[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);
    const [citas, setCitas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedCitaInfo, setSelectedCitaInfo] = useState<{ precio: number, pagado: number, restante: number } | null>(null);

    // Global Stats State
    const [globalStats, setGlobalStats] = useState({
        totalRecibido: 0,
        cuentasPorCobrar: 0,
        ticketPromedio: 0,
        topCliente: null as any
    });

    // Filtros
    const [filtros, setFiltros] = useState({
        clienteId: "todos",
        mes: (new Date().getMonth() + 1).toString(),
        anio: new Date().getFullYear().toString(),
        search: ""
    });

    // Estados para el formulario
    const [selectedClienteId, setSelectedClienteId] = useState("");
    const [citasCliente, setCitasCliente] = useState<any[]>([]);

    const [nuevoPago, setNuevoPago] = useState({
        citaId: "",
        monto: 0,
        metodoPago: "transferencia",
        estado: "pagado",
        fechaPago: new Date().toISOString().split("T")[0],
        notas: ""
    });

    const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [filtros, pagos, citas]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [pagosData, clientesData, citasData, citasPendientes] = await Promise.all([
                obtenerPagosClientes(),
                obtenerClientes(),
                obtenerCitas(), // Historial reciente
                obtenerCitas({ pagadoPorCliente: false }) // Para calcular deuda global
            ]);

            setPagos(pagosData);
            setClientes(clientesData);
            setCitas(citasData);

            // --- Calcular Cuentas por Cobrar (Global) ---
            // Iterar sobre citas pendientes y calcular restante real cruzando con pagos
            let deudaTotal = 0;
            citasPendientes.forEach(cita => {
                const pagosDeEstaCita = pagosData.filter(p => p.citaId === cita.$id || (Array.isArray(p.citaId) && p.citaId[0] === cita.$id));
                const totalPagado = pagosDeEstaCita.reduce((s, p) => s + p.monto, 0);
                const precio = cita.precioAcordado || cita.precioCliente || 0;
                const restante = Math.max(0, precio - totalPagado);
                deudaTotal += restante;
            });

            // --- Calcular Top Cliente (Histórico basado en pagos cargados) ---
            // Agrupar pagos por cliente
            const pagosPorCliente: Record<string, number> = {};
            pagosData.forEach(p => {
                // Encontrar clienteID de la cita asociada
                const cita = citasData.find(c => c.$id === p.citaId || (Array.isArray(p.citaId) && p.citaId[0] === c.$id)) ||
                    citasPendientes.find(c => c.$id === p.citaId || (Array.isArray(p.citaId) && p.citaId[0] === c.$id));

                if (cita && cita.clienteId) {
                    pagosPorCliente[cita.clienteId] = (pagosPorCliente[cita.clienteId] || 0) + p.monto;
                }
            });

            const topClienteId = Object.keys(pagosPorCliente).sort((a, b) => pagosPorCliente[b] - pagosPorCliente[a])[0];
            const topCliente = clientesData.find(c => c.$id === topClienteId);
            const topClienteMonto = topClienteId ? pagosPorCliente[topClienteId] : 0;

            setGlobalStats(prev => ({
                ...prev,
                cuentasPorCobrar: deudaTotal,
                topCliente: topCliente ? { ...topCliente, totalPagado: topClienteMonto } : null
            }));

        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let resultado = [...pagos];

        if (filtros.clienteId !== "todos") {
            resultado = resultado.filter(p => {
                const cita = citas.find(c => c.id === p.citaId || c.id === p.citaId[0]);
                return cita && cita.clienteId === filtros.clienteId;
            });
        }

        if (filtros.mes && filtros.anio) {
            resultado = resultado.filter(p => {
                const fecha = new Date(p.fechaPago);
                const mesPago = fecha.getMonth() + 1;
                const anioPago = fecha.getFullYear();
                return mesPago.toString() === filtros.mes && anioPago.toString() === filtros.anio;
            });
        }

        if (filtros.search) {
            const searchLower = filtros.search.toLowerCase();
            resultado = resultado.filter(p => {
                const cita = citas.find(c => c.id === p.citaId || c.id === p.citaId[0]);
                const cliente = clientes.find(c => c.$id === cita?.clienteId);
                const clienteNombre = cliente ? `${cliente.nombre} ${cliente.apellido}` : "";
                return clienteNombre.toLowerCase().includes(searchLower) ||
                    p.metodoPago.toLowerCase().includes(searchLower) ||
                    p.notas?.toLowerCase().includes(searchLower);
            });
        }

        setFilteredPagos(resultado);

        // Recalcular stats dependientes del filtro
        const totalRecibido = resultado.reduce((sum, p) => sum + p.monto, 0);
        const ticketPromedio = resultado.length > 0 ? totalRecibido / resultado.length : 0;

        setGlobalStats(prev => ({
            ...prev,
            totalRecibido,
            ticketPromedio
        }));
    };

    const handleClienteChange = async (clienteId: string) => {
        setSelectedClienteId(clienteId);
        setNuevoPago(prev => ({ ...prev, citaId: "", monto: 0 }));
        setSelectedCitaInfo(null);

        if (clienteId) {
            try {
                const citasDelCliente = await obtenerCitas({
                    clienteId,
                    pagadoPorCliente: false
                });
                setCitasCliente(citasDelCliente);
            } catch (error) {
                console.error("Error obteniendo citas del cliente:", error);
                setCitasCliente([]);
            }
        } else {
            setCitasCliente([]);
        }
    };

    const handleCitaChange = (citaId: string) => {
        const cita = citasCliente.find(c => c.id === citaId);

        if (cita) {
            const pagosDeEstaCita = pagos.filter(p => p.citaId === citaId || p.citaId[0] === citaId);
            const totalPagado = pagosDeEstaCita.reduce((s, p) => s + p.monto, 0);
            const precioTotal = cita.precioAcordado || cita.precioCliente || 0;
            const restante = Math.max(0, precioTotal - totalPagado);

            setSelectedCitaInfo({
                precio: precioTotal,
                pagado: totalPagado,
                restante: restante
            });

            setNuevoPago({
                ...nuevoPago,
                citaId,
                monto: restante
            });
        } else {
            setNuevoPago({ ...nuevoPago, citaId });
            setSelectedCitaInfo(null);
        }
    };

    const handleRegistrarPago = async () => {
        if (!nuevoPago.citaId || nuevoPago.monto <= 0) return;

        if (selectedCitaInfo && nuevoPago.monto > selectedCitaInfo.restante) {
            if (!confirm(`El monto ($${nuevoPago.monto}) es mayor al restante calculado ($${selectedCitaInfo.restante}). ¿Deseas continuar igual?`)) {
                return;
            }
        }

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

            const result = await registrarPagoCliente({
                clienteId: selectedClienteId,
                citaId: nuevoPago.citaId,
                monto: nuevoPago.monto,
                metodoPago: nuevoPago.metodoPago,
                estado: nuevoPago.estado,
                fechaPago: nuevoPago.fechaPago,
                notas: nuevoPago.notas,
                comprobante: comprobanteId
            });

            if (result.success) {
                setShowDialog(false);
                setSelectedClienteId("");
                setCitasCliente([]);
                setNuevoPago({
                    citaId: "",
                    monto: 0,
                    metodoPago: "transferencia",
                    estado: "pagado",
                    fechaPago: new Date().toISOString().split("T")[0],
                    notas: ""
                });
                setComprobanteFile(null);
                setSelectedCitaInfo(null);
                cargarDatos();
            }
        } catch (error) {
            console.error("Error registrando pago:", error);
        }
    };

    const handleEliminarPago = async (pagoId: string) => {
        if (!confirm("¿Estás seguro de eliminar este cobro?")) return;

        try {
            setLoading(true);
            await eliminarPagoCliente(pagoId);
            await cargarDatos();
        } catch (error) {
            console.error("Error eliminando pago:", error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = clientes.map(cliente => {
        const pagosDelCliente = filteredPagos.filter(p => {
            const cita = citas.find(c => c.id === p.citaId || c.id === p.citaId[0]);
            return cita && cita.clienteId === cliente.$id;
        });

        const total = pagosDelCliente.reduce((sum, p) => sum + p.monto, 0);

        return {
            name: `${cliente.nombre.split(' ')[0]} ${cliente.apellido ? cliente.apellido.split(' ')[0] : ''}`,
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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pagos de Clientes</h1>
                    <p className="text-gray-500 mt-1">Gestión de ingresos por servicios realizados</p>
                </div>
                <Button
                    onClick={() => setShowDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                >
                    <Plus className="mr-2 h-4 w-4" /> Registrar Cobro
                </Button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Ingresos Totales */}
                <Card className="border-none shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <TrendingUp className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-blue-100 font-medium text-sm flex items-center">
                            <Wallet className="mr-2 h-4 w-4" /> Ingresos Totales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">{formatearPrecio(globalStats.totalRecibido)}</div>
                        <p className="text-blue-100/90 text-xs mt-1">En periodo seleccionado</p>
                    </CardContent>
                </Card>

                {/* 2. Cuentas por Cobrar */}
                <Card className={`border-none shadow-md overflow-hidden relative ${globalStats.cuentasPorCobrar > 0 ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : 'bg-white'}`}>
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <AlertTriangle className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className={`text-sm font-medium flex items-center ${globalStats.cuentasPorCobrar > 0 ? 'text-orange-100' : 'text-gray-500'}`}>
                            <AlertCircle className="mr-2 h-4 w-4" /> Cuentas por Cobrar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className={`text-3xl font-bold ${globalStats.cuentasPorCobrar > 0 ? 'text-white' : 'text-green-600'}`}>
                            {formatearPrecio(globalStats.cuentasPorCobrar)}
                        </div>
                        <p className={`text-xs mt-1 ${globalStats.cuentasPorCobrar > 0 ? 'text-orange-100' : 'text-gray-400'}`}>
                            Saldo pendiente global
                        </p>
                    </CardContent>
                </Card>

                {/* 3. Top Cliente */}
                <Card className="border-none shadow-md bg-gradient-to-br from-purple-500 to-violet-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Star className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-purple-100 font-medium text-sm flex items-center">
                            <User className="mr-2 h-4 w-4" /> Top Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold truncate">
                            {globalStats.topCliente ? `${globalStats.topCliente.nombre} ${globalStats.topCliente.apellido}` : '---'}
                        </div>
                        <p className="text-purple-100/90 text-sm mt-1">
                            {globalStats.topCliente ? `Ha pagado: ${formatearPrecio(globalStats.topCliente.totalPagado)}` : 'Sin datos'}
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Ticket Promedio */}
                <Card className="border-none shadow-md bg-emerald-50 border-emerald-100 overflow-hidden relative">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-emerald-800 font-medium text-sm flex items-center">
                            <ShoppingBag className="mr-2 h-4 w-4" /> Ticket Promedio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-700">{formatearPrecio(globalStats.ticketPromedio)}</div>
                        <p className="text-emerald-600/80 text-xs mt-1">
                            Por transacción
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4 justify-between">
                <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar cliente, método..."
                            value={filtros.search}
                            onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                            className="pl-9 border-gray-200 bg-gray-50 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filtros.mes}
                            onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}
                            className="h-10 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => (
                                <option key={i} value={(i + 1).toString()}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={filtros.anio}
                            onChange={(e) => setFiltros({ ...filtros, anio: e.target.value })}
                            className="h-10 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                <option key={y} value={y.toString()}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Filter className="h-4 w-4" />
                    <span>{filteredPagos.length} resultados</span>
                    {(filtros.search || filtros.clienteId !== 'todos') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setFiltros({ clienteId: "todos", mes: (new Date().getMonth() + 1).toString(), anio: new Date().getFullYear().toString(), search: "" })}
                        >
                            <X className="h-3 w-3 mr-1" /> Limpiar
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Table Section (Left, larger) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden ring-1 ring-gray-100">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-gray-50/80 border-b border-gray-100">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-semibold text-gray-600 pl-6 h-12">Fecha</TableHead>
                                        <TableHead className="font-semibold text-gray-600 h-12">Cliente</TableHead>
                                        <TableHead className="font-semibold text-gray-600 h-12">Detalle</TableHead>
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
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                                                    <span className="text-sm font-medium animate-pulse">Cargando cobros...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredPagos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-24 text-gray-500">
                                                <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
                                                    <Wallet className="h-10 w-10 text-gray-300" />
                                                </div>
                                                <p className="font-medium text-gray-900 text-lg">No hay cobros registrados</p>
                                                <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Intenta registrar un nuevo cobro o cambia los filtros.</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPagos.map((pago) => {
                                            const cita = citas.find(c => c.id === pago.citaId[0] || c.id === pago.citaId);
                                            const cliente = clientes.find(c => c.$id === cita?.clienteId);
                                            const clienteNombre = cliente ? `${cliente.nombre} ${cliente.apellido}` : (cita?.clienteNombre || "Desconocido");

                                            return (
                                                <TableRow key={pago.$id} className="group hover:bg-gray-50/80 transition-all duration-200 border-b border-gray-50 last:border-0">
                                                    <TableCell className="pl-6 font-medium text-gray-700">
                                                        {formatearFecha(pago.fechaPago)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                                {clienteNombre.charAt(0)}
                                                            </div>
                                                            <div className="font-medium text-gray-900">{clienteNombre}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-500 text-sm">
                                                        {cita ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-semibold text-gray-700">{cita.tipoPropiedad}</span>
                                                                <span className="text-[10px] text-gray-400">ID: {cita.$id.substring(0, 6)}...</span>
                                                            </div>
                                                        ) : <span className="text-red-400 text-xs italic">Cita no encontrada</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className={`capitalize font-normal border-0 shadow-sm ${pago.metodoPago === 'transferencia' ? 'bg-blue-50 text-blue-700' :
                                                                pago.metodoPago === 'efectivo' ? 'bg-green-50 text-green-700' :
                                                                    'bg-purple-50 text-purple-700'
                                                                }`}>
                                                                {pago.metodoPago}
                                                            </Badge>
                                                            {pago.comprobante && (
                                                                <div className="tooltip" title="Ver Comprobante">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                                                        onClick={() => window.open(obtenerURLArchivo(pago.comprobante!), '_blank')}
                                                                    >
                                                                        <Paperclip className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            )}
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
                                                            <DropdownMenuContent align="end" className="bg-white z-50 shadow-xl border border-gray-100">
                                                                <DropdownMenuLabel className="text-xs text-gray-400 uppercase">Acciones</DropdownMenuLabel>
                                                                {pago.comprobante && (
                                                                    <DropdownMenuItem
                                                                        className="text-blue-600 focus:text-blue-700 focus:bg-blue-50 cursor-pointer"
                                                                        onClick={() => window.open(obtenerURLArchivo(pago.comprobante!), '_blank')}
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4" /> Ver Comprobante
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem
                                                                    className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                                                                    onClick={() => handleEliminarPago(pago.$id)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cobro
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
                </div>

                {/* Graph Section (Right) */}
                <Card className="border-none shadow-md bg-white h-fit">
                    <CardHeader>
                        <CardTitle className="text-gray-800 text-base">Top Clientes</CardTitle>
                        <CardDescription>Mayor facturación</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={80}
                                        tick={{ fill: '#6B7280', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => formatearPrecio(Number(value))}
                                    />
                                    <Bar dataKey="monto" radius={[0, 4, 4, 0]} barSize={20}>
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

            {/* Create Dialog (Pro Version) */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-[550px] border-0 shadow-2xl bg-white/95 backdrop-blur-md">
                    <DialogHeader className="pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl text-gray-900 tracking-tight">Registrar Cobro</DialogTitle>
                                <DialogDescription className="text-gray-500 text-sm mt-0.5">
                                    Nuevo pago recibido de cliente
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid gap-5 py-4">
                        {/* Selector de Cliente */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <select
                                    value={selectedClienteId}
                                    onChange={(e) => handleClienteChange(e.target.value)}
                                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none shadow-sm hover:border-gray-300 transition-colors"
                                >
                                    <option value="">Seleccionar Cliente...</option>
                                    {clientes.map((c) => (
                                        <option key={c.$id} value={c.$id}>
                                            {c.nombre} {c.apellido} ({c.telefono})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Selector de Cita (Pendientes) */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cita / Servicio (Pendientes)</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <select
                                    value={nuevoPago.citaId}
                                    onChange={(e) => handleCitaChange(e.target.value)}
                                    disabled={!selectedClienteId}
                                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none shadow-sm hover:border-gray-300 transition-colors"
                                >
                                    <option value="">
                                        {selectedClienteId ? (citasCliente.length > 0 ? "Seleccionar Cita..." : "No hay pagos pendientes") : "Primero selecciona un cliente"}
                                    </option>
                                    {citasCliente.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {formatearFecha(c.fechaCita)} - {c.tipoPropiedad} ({formatearPrecio(c.precioAcordado || c.precioCliente)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Card Info Saldo */}
                        {selectedCitaInfo && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100/50 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-in zoom-in-95 duration-200">
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5 flex-shrink-0">
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                                <div className="w-full">
                                    <p className="text-sm font-semibold text-amber-900">Estado del Cobro</p>
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        <div className="bg-white/60 rounded px-2 py-1">
                                            <span className="text-[10px] text-amber-600 uppercase font-bold block">Total</span>
                                            <span className="text-sm text-gray-700 font-medium">{formatearPrecio(selectedCitaInfo.precio)}</span>
                                        </div>
                                        <div className="bg-white/60 rounded px-2 py-1">
                                            <span className="text-[10px] text-green-600 uppercase font-bold block">Pagado</span>
                                            <span className="text-sm text-gray-700 font-medium">{formatearPrecio(selectedCitaInfo.pagado)}</span>
                                        </div>
                                        <div className="bg-white/90 rounded px-2 py-1 shadow-sm ring-1 ring-amber-200">
                                            <span className="text-[10px] text-red-500 uppercase font-bold block">Restante</span>
                                            <span className="text-sm text-red-700 font-bold">{formatearPrecio(selectedCitaInfo.restante)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-5">
                            {/* Input Monto BIG */}
                            <div className="col-span-2 sm:col-span-1 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Monto a Recibir</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <DollarSign className="h-4 w-4" />
                                    </div>
                                    <Input
                                        type="number"
                                        value={nuevoPago.monto}
                                        onChange={(e) => setNuevoPago({ ...nuevoPago, monto: parseInt(e.target.value) || 0 })}
                                        className="pl-12 h-12 text-xl font-bold text-gray-900 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white shadow-sm"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Fecha */}
                            <div className="col-span-2 sm:col-span-1 space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="date"
                                        value={nuevoPago.fechaPago}
                                        onChange={(e) => setNuevoPago({ ...nuevoPago, fechaPago: e.target.value })}
                                        className="pl-9 h-12 border-gray-200 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            {/* Metodo */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Método</Label>
                                <select
                                    value={nuevoPago.metodoPago}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, metodoPago: e.target.value })}
                                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 appearance-none"
                                >
                                    <option value="transferencia">Transferencia</option>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="nequi">Nequi</option>
                                    <option value="daviplata">Daviplata</option>
                                </select>
                            </div>

                            {/* Notas */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas</Label>
                                <Input
                                    value={nuevoPago.notas}
                                    onChange={(e) => setNuevoPago({ ...nuevoPago, notas: e.target.value })}
                                    placeholder="Opcional..."
                                    className="h-10 border-gray-200 bg-white"
                                />
                            </div>
                        </div>

                        {/* Comprobante Upload */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Comprobante (Opcional)</Label>
                            <div className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative"
                                onClick={() => document.getElementById('file-upload')?.click()}>

                                <input
                                    id="file-upload"
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

                    <DialogFooter className="pt-2 border-t border-gray-100">
                        <Button variant="ghost" onClick={() => setShowDialog(false)} className="hover:bg-gray-100 text-gray-600">Cancelar</Button>
                        <Button
                            onClick={handleRegistrarPago}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-6"
                            disabled={!nuevoPago.citaId || nuevoPago.monto <= 0 || isUploading}
                        >
                            {isUploading ? "Subiendo..." : "Confirmar Cobro"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
