"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, XCircle, FileText, Download, TrendingUp, User, Briefcase, PiggyBank, Gift } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { obtenerEmpleado } from "@/lib/actions/empleados";
import { obtenerResumenAsistenciaPorDia, calcularHorasTrabajadasMes } from "@/lib/actions/asistencia";
import { obtenerTurnoActivoEnFecha, obtenerAsignacionesEmpleado } from "@/lib/actions/turnos";
import { obtenerPermisosEmpleado } from "@/lib/actions/permisos";
import { obtenerHorarioEmpleado } from "@/lib/actions/horarios-empleado";
import { obtenerVacacionesEmpleado, obtenerSaldoVacaciones } from "@/lib/actions/vacaciones";
import { obtenerCompensatoriosDisponibles } from "@/lib/actions/compensatorios";
import { obtenerBalanceBancoHoras } from "@/lib/actions/banco-horas";
import { AjusteBancoDialog } from "@/components/asistencia/AjusteBancoDialog";
import type { Empleado, ResumenAsistenciaDia, Permiso, HorarioEmpleado, Vacacion, SaldoVacaciones, Turno, Compensatorio } from "@/types";
import { exportarAsistenciaExcel } from "@/lib/utils/excel-export";
import { AsignarHorarioDialog } from "@/components/asistencia/AsignarHorarioDialog";
import { AsignarTurnoDialog } from "@/components/asistencia/AsignarTurnoDialog";
import { motion } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function HistorialAsistenciaPage() {
    const params = useParams();
    const empleadoId = params?.id as string;

    const [empleado, setEmpleado] = useState<Empleado | null>(null);
    const [resumen, setResumen] = useState<ResumenAsistenciaDia[]>([]);
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
    const [saldo, setSaldo] = useState<SaldoVacaciones | null>(null);
    const [turnoActivo, setTurnoActivo] = useState<Turno | null>(null);
    const [compensatorios, setCompensatorios] = useState<Compensatorio[]>([]);
    const [horarioEspecial, setHorarioEspecial] = useState<HorarioEmpleado | null>(null);
    const [horarioDialogOpen, setHorarioDialogOpen] = useState(false);
    const [turnoDialogOpen, setTurnoDialogOpen] = useState(false);
    const [bancoBalance, setBancoBalance] = useState(0);
    const [bancoDialogOpen, setBancoDialogOpen] = useState(false);
    const [totalHoras, setTotalHoras] = useState(0);
    const [loading, setLoading] = useState(true);

    const hoy = new Date();
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [año, setAño] = useState(hoy.getFullYear());

    useEffect(() => {
        if (empleadoId) {
            cargarDatos();
        }
    }, [empleadoId, mes, año]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const añoActual = new Date().getFullYear();
            const hoy = new Date().toISOString().split('T')[0];

            const [emp, horas, permisosEmp, horario, vacacionesEmp, saldoVac, turnoAct, compensatoriosDisp, balanceBanco] = await Promise.all([
                obtenerEmpleado(empleadoId),
                calcularHorasTrabajadasMes(empleadoId, mes, año),
                obtenerPermisosEmpleado(empleadoId),
                obtenerHorarioEmpleado(empleadoId),
                obtenerVacacionesEmpleado(empleadoId, añoActual),
                obtenerSaldoVacaciones(empleadoId),
                obtenerTurnoActivoEnFecha(empleadoId, hoy),
                obtenerCompensatoriosDisponibles(empleadoId),
                obtenerBalanceBancoHoras(empleadoId)
            ]);

            setEmpleado(emp);
            setTotalHoras(horas);
            setPermisos(permisosEmp.filter((p: Permiso) => p.estado === 'APROBADO'));
            setHorarioEspecial(horario);
            setVacaciones(vacacionesEmp.filter((v: Vacacion) => v.estado === 'APROBADO'));
            setSaldo(saldoVac);
            setTurnoActivo(turnoAct);
            setCompensatorios(compensatoriosDisp);
            setBancoBalance(balanceBanco);

            const fechaInicio = new Date(año, mes - 1, 1).toISOString();
            const fechaFin = new Date(año, mes, 0, 23, 59, 59).toISOString();
            const resumenMes = await obtenerResumenAsistenciaPorDia(empleadoId, fechaInicio, fechaFin);
            setResumen(resumenMes);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'PRESENTE':
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">Puntual</Badge>;
            case 'RETARDO':
                return <Badge className="bg-amber-100 text-amber-700 border-amber-300">Retardo</Badge>;
            case 'AUSENTE':
                return <Badge className="bg-red-100 text-red-700 border-red-300">Ausente</Badge>;
            case 'PERMISO':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Permiso</Badge>;
            case 'VACACIONES':
                return <Badge className="bg-purple-100 text-purple-700 border-purple-300">Vacaciones</Badge>;
            default:
                return <Badge variant="outline">{estado}</Badge>;
        }
    };

    const puntualidad = resumen.length > 0
        ? (resumen.filter(r => r.estado === 'PRESENTE').length / resumen.length) * 100
        : 0;

    const exportarExcel = () => {
        if (!empleado) return;
        exportarAsistenciaExcel(empleado, resumen, mes, año, totalHoras);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Cargando información del empleado...</p>
                </div>
            </div>
        );
    }

    if (!empleado) {
        return <div className="p-6">Empleado no encontrado</div>;
    }

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Epic Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-blue-50/50 to-indigo-50/50" />
                <div className="absolute top-0 -left-4 w-72 h-72 bg-slate-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

                <div className="relative px-6 pt-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <Link href="/admin/asistencia">
                                        <Button variant="outline" size="icon" className="rounded-xl shadow-md hover:shadow-lg">
                                            <ArrowLeft className="w-5 h-5" />
                                        </Button>
                                    </Link>

                                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                                        {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
                                    </div>

                                    <div>
                                        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            {empleado.nombre} {empleado.apellido}
                                        </h1>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Badge className="bg-slate-100 text-slate-700 border-slate-300">
                                                <Briefcase className="w-3 h-3 mr-1" />
                                                {empleado.cargo}
                                            </Badge>
                                            {turnoActivo && (
                                                <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Turno: {turnoActivo.nombre} ({turnoActivo.horaEntrada} - {turnoActivo.horaSalida})
                                                </Badge>
                                            )}
                                            {horarioEspecial && (
                                                <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Horario Esp: {horarioEspecial.horarioEntrada} - {horarioEspecial.horarioSalida}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() => setTurnoDialogOpen(true)}
                                        className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                                    >
                                        <CalendarIcon className="h-5 w-5 mr-2" />
                                        Asignar Turno
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() => setHorarioDialogOpen(true)}
                                        className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                                    >
                                        <Clock className="h-5 w-5 mr-2" />
                                        Horario Especial
                                    </Button>
                                    <Button
                                        size="lg"
                                        onClick={exportarExcel}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                                    >
                                        <Download className="h-5 w-5 mr-2" />
                                        Exportar Excel
                                    </Button>
                                </div>
                            </div>

                            {/* Period Selector */}
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="h-5 w-5 text-slate-500" />
                                <Select value={mes.toString()} onValueChange={(v) => setMes(Number(v))}>
                                    <SelectTrigger className="w-[180px] bg-white border-slate-300 shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {meses.map((m, i) => (
                                            <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={año.toString()} onValueChange={(v) => setAño(Number(v))}>
                                    <SelectTrigger className="w-[120px] bg-white border-slate-300 shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2024, 2025, 2026].map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* KPI Cards - Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:shadow-xl transition-shadow">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                <CardContent className="p-6 relative">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Total Horas</p>
                                            <p className="text-5xl font-black mt-2">{totalHoras.toFixed(1)}<span className="text-2xl">h</span></p>
                                            <p className="text-xs text-blue-100 mt-1">{resumen.length} días trabajados</p>
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
                                            <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Puntualidad</p>
                                            <p className="text-5xl font-black mt-2">{puntualidad.toFixed(0)}<span className="text-2xl">%</span></p>
                                            <p className="text-xs text-emerald-100 mt-1">Llegadas a tiempo</p>
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
                            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-xl transition-shadow">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                <CardContent className="p-6 relative">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider">Promedio Diario</p>
                                            <p className="text-5xl font-black mt-2">
                                                {resumen.length > 0 ? (totalHoras / resumen.length).toFixed(1) : 0}<span className="text-2xl">h</span>
                                            </p>
                                            <p className="text-xs text-purple-100 mt-1">Por día trabajado</p>
                                        </div>
                                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                            <Clock className="h-8 w-8" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* KPI Cards - Row 2: Banco & Compensatorios */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="shadow-lg border-slate-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl">
                                                <PiggyBank className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-600">Banco de Horas</p>
                                                <p className={`text-3xl font-black ${bancoBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {bancoBalance > 0 ? '+' : ''}{Math.floor(bancoBalance / 60)}h {Math.abs(bancoBalance % 60)}m
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {bancoBalance >= 0 ? 'Tiempo a favor' : 'Tiempo en contra'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setBancoDialogOpen(true)}>
                                            Ajustar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="shadow-lg border-slate-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                                                <Gift className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-600">Días Compensatorios</p>
                                                <p className="text-3xl font-black text-green-600">
                                                    {compensatorios.reduce((acc, c) => acc + c.diasGanados, 0).toFixed(1)} Días
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {compensatorios.length} registros disponibles
                                                </p>
                                            </div>
                                        </div>
                                        {compensatorios.length > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Vence:</p>
                                                <p className="text-sm font-medium">{new Date(compensatorios[0].fechaVencimiento).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Saldo de Vacaciones */}
                    {saldo && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Card className="shadow-lg border-slate-200">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Saldo de Vacaciones {saldo.anioActual}</h3>
                                    <div className="grid grid-cols-3 gap-6 mb-4">
                                        <div className="text-center">
                                            <p className="text-4xl font-black text-blue-600">{saldo.diasTotales}</p>
                                            <p className="text-sm text-slate-500 mt-1">Total</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-4xl font-black text-orange-600">{saldo.diasUsados}</p>
                                            <p className="text-sm text-slate-500 mt-1">Usados</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-4xl font-black text-emerald-600">{saldo.diasDisponibles}</p>
                                            <p className="text-sm text-slate-500 mt-1">Disponibles</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-4">
                                        <div
                                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-4 rounded-full transition-all"
                                            style={{ width: `${(saldo.diasDisponibles / saldo.diasTotales) * 100}%` }}
                                        />
                                    </div>
                                    {saldo.diasPendientes > 0 && (
                                        <p className="text-sm text-center text-slate-500 mt-2">
                                            {saldo.diasPendientes} días en solicitudes pendientes
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Tabla de Asistencia */}
                    <Card className="shadow-xl border-slate-200">
                        <CardContent className="p-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Detalle de Asistencia</h3>
                                <p className="text-sm text-slate-500 mt-1">Historial completo del mes seleccionado</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                                        <TableRow>
                                            <TableHead className="font-bold">Fecha</TableHead>
                                            <TableHead className="font-bold">Entrada</TableHead>
                                            <TableHead className="font-bold">Salida</TableHead>
                                            <TableHead className="font-bold">Horas</TableHead>
                                            <TableHead className="font-bold">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {resumen.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-32">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <FileText className="h-12 w-12 text-slate-400" />
                                                        <p className="text-slate-600 font-medium">No hay registros para este período</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            resumen.map((dia, index) => (
                                                <motion.tr
                                                    key={dia.fecha}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="hover:bg-blue-50/50 transition-colors"
                                                >
                                                    <TableCell className="font-medium">
                                                        {new Date(dia.fecha).toLocaleDateString('es-CO', {
                                                            weekday: 'short',
                                                            day: '2-digit',
                                                            month: 'short'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {dia.entrada
                                                            ? new Date(dia.entrada.fechaHora).toLocaleTimeString('es-CO', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {dia.salida
                                                            ? new Date(dia.salida.fechaHora).toLocaleTimeString('es-CO', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {dia.horasTrabajadas > 0 ? `${dia.horasTrabajadas}h` : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getEstadoBadge(dia.estado)}
                                                        {dia.minutosRetardo && (
                                                            <span className="ml-2 text-xs text-amber-600 font-medium">
                                                                +{dia.minutosRetardo}min
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permisos y Vacaciones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {permisos.length > 0 && (
                            <Card className="shadow-lg border-slate-200">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Permisos Aprobados</h3>
                                    <div className="space-y-3">
                                        {permisos.map((permiso) => (
                                            <div
                                                key={permiso.$id}
                                                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-blue-50/30"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-blue-500 text-white">{permiso.tipo}</Badge>
                                                        {permiso.subtipo && (
                                                            <span className="text-sm text-slate-600">
                                                                ({permiso.subtipo})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm mt-1 text-slate-700">{permiso.motivo}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {new Date(permiso.fechaInicio).toLocaleDateString('es-CO', {
                                                            day: '2-digit',
                                                            month: 'short'
                                                        })}
                                                        {' - '}
                                                        {new Date(permiso.fechaFin).toLocaleDateString('es-CO', {
                                                            day: '2-digit',
                                                            month: 'short'
                                                        })}
                                                    </p>
                                                    {permiso.horaInicio && (
                                                        <p className="text-xs text-slate-500">
                                                            {permiso.horaInicio} - {permiso.horaFin}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {vacaciones.length > 0 && (
                            <Card className="shadow-lg border-slate-200">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Vacaciones Aprobadas {new Date().getFullYear()}</h3>
                                    <div className="space-y-3">
                                        {vacaciones.map((vacacion) => (
                                            <div
                                                key={vacacion.$id}
                                                className="flex items-center justify-between p-4 border border-purple-200 rounded-lg bg-purple-50"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-purple-500 text-white">{vacacion.diasSolicitados} días</Badge>
                                                        {vacacion.motivo && (
                                                            <span className="text-sm text-slate-600">
                                                                {vacacion.motivo}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {new Date(vacacion.fechaInicio).toLocaleDateString('es-CO', {
                                                            day: '2-digit',
                                                            month: 'short'
                                                        })}
                                                        {' - '}
                                                        {new Date(vacacion.fechaFin).toLocaleDateString('es-CO', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            {empleado && (
                <>
                    <AsignarHorarioDialog
                        open={horarioDialogOpen}
                        onOpenChange={setHorarioDialogOpen}
                        empleado={empleado}
                        onSuccess={() => {
                            toast.success("Horario actualizado");
                            cargarDatos();
                        }}
                    />

                    <AsignarTurnoDialog
                        open={turnoDialogOpen}
                        onOpenChange={setTurnoDialogOpen}
                        empleado={empleado}
                        onSuccess={() => {
                            cargarDatos();
                        }}
                    />

                    <AjusteBancoDialog
                        open={bancoDialogOpen}
                        onOpenChange={setBancoDialogOpen}
                        empleadoId={empleadoId}
                        currentBalance={bancoBalance}
                        onSuccess={() => {
                            toast.success("Balance actualizado");
                            cargarDatos();
                        }}
                    />
                </>
            )}
        </div>
    );
}
