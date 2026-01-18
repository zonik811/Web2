"use client";

import { EmployeeAdvancedMetrics, EmployeeStatus } from "@/lib/actions/reportes-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Clock, Trophy, AlertCircle, CheckCircle, XCircle, Briefcase, Calendar, FileText, UserMinus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface EmployeeMetricsChartsProps {
    metrics: EmployeeAdvancedMetrics;
    totalEmpleados: number;
    activosEmpleados: number;
}

export function EmployeeMetricsCharts({ metrics, totalEmpleados, activosEmpleados }: EmployeeMetricsChartsProps) {

    // Performance Data
    const performanceData = metrics.topRendimiento.map(e => ({
        name: e.nombre.length > 15 ? e.nombre.substring(0, 15) + '...' : e.nombre,
        full_name: e.nombre,
        cargo: e.cargo,
        value: e.cantidad
    }));

    // Role Distribution Data
    const roleData = metrics.distribucionCargos.map(c => ({
        name: c.cargo,
        value: c.cantidad
    }));

    const attendanceRate = metrics.asistenciaHoy.totalActivos > 0
        ? Math.round((metrics.asistenciaHoy.presentes / metrics.asistenciaHoy.totalActivos) * 100)
        : 0;

    const getStatusBadge = (status: EmployeeStatus['estado']) => {
        switch (status) {
            case 'PRESENTE': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Presente</Badge>;
            case 'TARDE': return <Badge className="bg-amber-500 hover:bg-amber-600">Tarde</Badge>;
            case 'AUSENTE': return <Badge variant="destructive">Ausente</Badge>;
            case 'VACACIONES': return <Badge className="bg-blue-500 hover:bg-blue-600">Vacaciones</Badge>;
            case 'PERMISO': return <Badge className="bg-violet-500 hover:bg-violet-600">Permiso</Badge>;
            default: return <Badge variant="outline">Desconocido</Badge>;
        }
    };

    return (
        <div className="space-y-6">

            {/* KPI Grid - Novedades */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Total Activos */}
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-500" /> Total Personal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {activosEmpleados} <span className="text-sm text-slate-400 font-normal">Activos</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Vacaciones */}
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" /> En Vacaciones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {metrics.novedades.vacacionesTomadas}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Empleados ausentes hoy</p>
                    </CardContent>
                </Card>

                {/* Permisos */}
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-violet-500" /> Permisos Activos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {metrics.novedades.permisosTomados}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Con justificación hoy</p>
                    </CardContent>
                </Card>

                {/* Retardos */}
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" /> Llegadas Tarde
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">
                            {metrics.novedades.retardos}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Registrados hoy (&gt;9:00 AM)</p>
                    </CardContent>
                </Card>
            </div>


            {/* Main Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Asistencia Hoy Chart/Bar */}
                <Card className="border-slate-100 shadow-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-500" /> Resumen de Asistencia ({format(new Date(), 'dd MMM', { locale: es })})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                                <span className="text-4xl font-bold text-slate-800">
                                    {metrics.asistenciaHoy.presentes} <span className="text-lg text-slate-400 font-normal">/ {metrics.asistenciaHoy.totalActivos}</span>
                                </span>
                                <span className="text-sm text-slate-500">
                                    Presentes en sitio
                                </span>
                            </div>

                            <div className="flex gap-6 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-1">
                                        <CheckCircle className="w-5 h-5" /> {metrics.asistenciaHoy.presentes}
                                    </div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold mt-1">Presentes</p>
                                </div>
                                {metrics.asistenciaHoy.tarde > 0 && (
                                    <div>
                                        <div className="text-2xl font-bold text-amber-500 flex items-center justify-center gap-1">
                                            <Clock className="w-5 h-5" /> {metrics.asistenciaHoy.tarde}
                                        </div>
                                        <p className="text-[10px] uppercase text-slate-400 font-bold mt-1">Tarde</p>
                                    </div>
                                )}
                                <div>
                                    <div className="text-2xl font-bold text-rose-500 flex items-center justify-center gap-1">
                                        <UserMinus className="w-5 h-5" /> {metrics.asistenciaHoy.ausentes}
                                    </div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold mt-1">Ausentes</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-3 rounded-full mt-6 overflow-hidden flex">
                            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${attendanceRate}%` }} />
                            {/* Can add segments for Late if desired separately */}
                        </div>
                        <p className="text-right text-xs text-slate-400 mt-2">
                            {attendanceRate}% de asistencia total hoy
                        </p>
                    </CardContent>
                </Card>

                {/* Horas */}
                <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
                    <CardHeader>
                        <CardTitle className="text-base text-indigo-700 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Horas Turnos (Hoy)
                        </CardTitle>
                        <CardDescription>Estimación basada en plantilla</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="text-5xl font-black text-indigo-600 tracking-tighter">
                            {metrics.horas.programadas}h
                        </div>
                        <p className="text-sm font-medium text-indigo-400 mt-2">Programadas Totales</p>
                    </CardContent>
                </Card>

                {/* Costo Estimado */}
                <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
                    <CardHeader>
                        <CardTitle className="text-base text-emerald-700 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Nómina Diaria
                        </CardTitle>
                        <CardDescription>Costo Estimado (Activos)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="text-3xl font-black text-emerald-600 tracking-tighter">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(metrics.costoDiarioEstimado)}
                        </div>
                        <p className="text-sm font-medium text-emerald-400 mt-2">Valor Total Día</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Role Distribution */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                            <Users className="w-4 h-4 text-blue-500" /> Distribución por Cargo
                        </CardTitle>
                        <CardDescription>Composición de la fuerza laboral</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Performance */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                            <Trophy className="w-4 h-4 text-amber-500" /> Top Rendimiento
                        </CardTitle>
                        <CardDescription>Servicios y OTs completadas (Mes)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={performanceData} margin={{ left: 10, right: 30 }}>
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
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [value, 'Total']}
                                />
                                <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>

            {/* Attendance Table */}
            <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-slate-700">
                        <Clock className="w-4 h-4 text-slate-500" /> Estado del Personal en Vivo
                    </CardTitle>
                    <CardDescription>Detalle de registros de hoy</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Empleado</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Hora Entrada</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metrics.estadoDetallado.map((emp) => (
                                <TableRow key={emp.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={emp.avatar} alt={emp.nombre} />
                                            <AvatarFallback>{emp.nombre.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {emp.nombre}
                                    </TableCell>
                                    <TableCell className="text-slate-500">{emp.cargo}</TableCell>
                                    <TableCell>{emp.horaEntrada || '--:--'}</TableCell>
                                    <TableCell>{getStatusBadge(emp.estado)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
