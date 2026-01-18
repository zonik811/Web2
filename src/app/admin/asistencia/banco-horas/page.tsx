"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    TrendingDown,
    TrendingUp,
    Search,
    Download,
    Plus,
    AlertTriangle,
    PiggyBank,
    Calendar
} from "lucide-react";
import {
    obtenerTodosLosMovimientos,
    obtenerBalancesGlobales
} from "@/lib/actions/banco-horas";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import type { MovimientoBancoHoras, Empleado } from "@/types";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AjusteBancoDialog } from "@/components/asistencia/AjusteBancoDialog";
import { motion } from "framer-motion";

export default function BancoHorasAdminPage() {
    const [movimientos, setMovimientos] = useState<MovimientoBancoHoras[]>([]);
    const [empleados, setEmpleados] = useState<Record<string, Empleado>>({});
    const [balances, setBalances] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterTipo, setFilterTipo] = useState<string>("todos");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [movs, bal, emps] = await Promise.all([
                obtenerTodosLosMovimientos(),
                obtenerBalancesGlobales(),
                obtenerEmpleados()
            ]);

            setMovimientos(movs);
            setBalances(bal);

            const empMap: Record<string, Empleado> = {};
            emps.forEach(e => empMap[e.$id] = e);
            setEmpleados(empMap);

        } catch (error) {
            console.error(error);
            toast.error("Error cargando banco de horas");
        } finally {
            setLoading(false);
        }
    };

    const getTypeBadge = (tipo: string) => {
        switch (tipo) {
            case 'ABONO': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100">Abono</Badge>;
            case 'DEUDA': return <Badge className="bg-red-100 text-red-700 border-red-300 hover:bg-red-100">Deuda</Badge>;
            default: return <Badge variant="outline">{tipo}</Badge>;
        }
    };

    const formatMinutos = (minutos: number) => {
        const horas = Math.floor(Math.abs(minutos) / 60);
        const mins = Math.abs(minutos) % 60;
        const sign = minutos < 0 ? "-" : "+";
        return `${sign} ${horas}h ${mins}m`;
    };

    const formatMinutosAbs = (minutos: number) => {
        const horas = Math.floor(Math.abs(minutos) / 60);
        const mins = Math.abs(minutos) % 60;
        return `${horas}h ${mins}m`;
    };

    const filteredData = movimientos.filter(mov => {
        const emp = empleados[mov.empleadoId];
        const matchesSearch = emp
            ? `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        const matchesFilter = filterTipo === "todos" || mov.tipo === filterTipo;
        return matchesSearch && matchesFilter;
    });

    // KPI Calculations
    const totalDeudaGlobal = Object.values(balances).reduce((acc, curr) => curr < 0 ? acc + Math.abs(curr) : acc, 0);
    const totalAbonoGlobal = Object.values(balances).reduce((acc, curr) => curr > 0 ? acc + curr : acc, 0);
    const empleadosCriticos = Object.values(balances).filter(b => b < -600).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
            {/* Epic Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
                {/* Soft Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-violet-50/50 to-purple-50/50" />
                <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-violet-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

                <div className="relative px-6 pt-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Title Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg">
                                    <PiggyBank className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                                        Banco de Horas
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">
                                        Control de horas a favor y en contra de empleados
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-500 to-pink-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-red-100 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                                                    <TrendingDown className="h-4 w-4" />
                                                    Deuda Total
                                                </p>
                                                <p className="text-5xl font-black mt-2">{formatMinutosAbs(totalDeudaGlobal)}</p>
                                                <p className="text-xs text-red-100 mt-1">Tiempo que deben empleados</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <Clock className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Saldo a Favor
                                                </p>
                                                <p className="text-5xl font-black mt-2">{formatMinutosAbs(totalAbonoGlobal)}</p>
                                                <p className="text-xs text-emerald-100 mt-1">Tiempo compensable</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <TrendingUp className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider">Casos Críticos</p>
                                                <p className="text-5xl font-black mt-2">{empleadosCriticos}</p>
                                                <p className="text-xs text-amber-100 mt-1">Deuda {'>'}10h</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <AlertTriangle className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap items-center gap-3"
                        >
                            <Button
                                size="lg"
                                onClick={() => setCreateDialogOpen(true)}
                                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Nuevo Ajuste
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Exportar
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <Card className="shadow-xl border-slate-200">
                        <CardContent className="p-6">
                            {/* Filters */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Historial de Movimientos</h3>
                                    <p className="text-sm text-slate-500 mt-1">Registro completo de abonos y deudas</p>
                                </div>
                                <Badge className="bg-indigo-100 text-indigo-700 px-3 py-1.5">
                                    {movimientos.length} movimientos
                                </Badge>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Buscar empleado..."
                                        className="pl-10 bg-white border-slate-300"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={filterTipo} onValueChange={setFilterTipo}>
                                    <SelectTrigger className="w-[200px] bg-white border-slate-300">
                                        <SelectValue placeholder="Tipo Movimiento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos los tipos</SelectItem>
                                        <SelectItem value="ABONO">Abonos</SelectItem>
                                        <SelectItem value="DEUDA">Deudas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Table */}
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gradient-to-r from-slate-50 to-indigo-50">
                                        <TableRow>
                                            <TableHead className="font-bold">Empleado</TableHead>
                                            <TableHead className="font-bold">Fecha</TableHead>
                                            <TableHead className="font-bold">Tipo</TableHead>
                                            <TableHead className="font-bold">Origen</TableHead>
                                            <TableHead className="font-bold">Cantidad</TableHead>
                                            <TableHead className="font-bold">Notas</TableHead>
                                            <TableHead className="text-right font-bold">Balance Actual</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-32">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                        <p className="text-slate-600 font-medium">Cargando movimientos...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-32">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <PiggyBank className="h-12 w-12 text-slate-400" />
                                                        <p className="text-slate-600 font-medium">No se encontraron movimientos</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredData.map((mov, index) => {
                                                const emp = empleados[mov.empleadoId];
                                                const balanceActual = balances[mov.empleadoId] || 0;
                                                const isCritical = balanceActual < -600;

                                                return (
                                                    <motion.tr
                                                        key={mov.$id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className={`hover:bg-indigo-50/50 transition-colors ${isCritical ? 'bg-orange-50/30' : ''}`}
                                                    >
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                                    {emp?.nombre.charAt(0)}{emp?.apellido.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-800">
                                                                        {emp ? `${emp.nombre} ${emp.apellido}` : 'Desconocido'}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500">{emp?.cargo}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                                <span className="font-medium">{new Date(mov.fecha).toLocaleDateString()}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{getTypeBadge(mov.tipo)}</TableCell>
                                                        <TableCell className="text-xs text-slate-500 font-medium">{mov.origen}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="font-bold">
                                                                {formatMinutosAbs(mov.cantidadMinutos)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-xs text-slate-600 truncate max-w-[200px]" title={mov.notas}>
                                                            {mov.notas || '-'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className={`font-black text-lg ${balanceActual >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                    {formatMinutos(balanceActual)}
                                                                </span>
                                                                {isCritical && (
                                                                    <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                                                                        Crítico
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </motion.tr>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AjusteBancoDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={cargarDatos}
            />
        </div>
    );
}
