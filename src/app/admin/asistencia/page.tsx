"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, UserCheck, UserX, AlertCircle, Plus, Settings, Calendar, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { obtenerAsistenciasDia, obtenerConfiguracionAsistencia } from "@/lib/actions/asistencia";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { obtenerEmpleadosConPermisoEnFecha } from "@/lib/actions/permisos";
import type { Asistencia, Empleado, ConfiguracionAsistencia } from "@/types";
import { MarcacionManualDialog } from "@/components/asistencia/MarcacionManualDialog";
import { ConfiguracionDialog } from "@/components/asistencia/ConfiguracionDialog";
import { SolicitarPermisoDialog } from "@/components/asistencia/SolicitarPermisoDialog";
import { PermisosPendientesTab } from "@/components/asistencia/PermisosPendientesTab";
import { SolicitarVacacionesDialog } from "@/components/asistencia/SolicitarVacacionesDialog";
import { VacacionesPendientesTab } from "@/components/asistencia/VacacionesPendientesTab";
import { ConfiguracionTurnosDialog } from "@/components/asistencia/ConfiguracionTurnosDialog";
import { GestionFestivosDialog } from "@/components/asistencia/GestionFestivosDialog";
import { ExtrasPendientesTab } from "@/components/asistencia/ExtrasPendientesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface EmpleadoConStatus {
    empleado: Empleado;
    ultimaMarcacion?: Asistencia;
    status: 'PRESENTE' | 'AUSENTE' | 'RETARDO';
    horaEntrada?: string;
}

export default function AsistenciaPage() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get("tab") || "empleados";
    const [activeTab, setActiveTab] = useState(defaultTab);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const [empleados, setEmpleados] = useState<EmpleadoConStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [permisoDialogOpen, setPermisoDialogOpen] = useState(false);
    const [vacacionDialogOpen, setVacacionDialogOpen] = useState(false);
    const [turnosDialogOpen, setTurnosDialogOpen] = useState(false);
    const [festivosDialogOpen, setFestivosDialogOpen] = useState(false);
    const [config, setConfig] = useState<ConfiguracionAsistencia | null>(null);
    const [stats, setStats] = useState({
        presentes: 0,
        ausentes: 0,
        retardos: 0
    });

    const cargarAsistencia = async () => {
        setLoading(true);
        try {
            const [listaEmpleados, marcacionesHoy, cfg] = await Promise.all([
                obtenerEmpleados(),
                obtenerAsistenciasDia(fecha),
                obtenerConfiguracionAsistencia()
            ]);

            setConfig(cfg);

            const fechaHoy = new Date(fecha);
            const horarioLimite = new Date(fechaHoy);
            horarioLimite.setHours(8, 15, 0, 0);

            const empleadosActivos = listaEmpleados.filter(e => e.activo);
            const empleadosConPermisoHoy = await obtenerEmpleadosConPermisoEnFecha(fecha);

            const empleadosConStatus: EmpleadoConStatus[] = empleadosActivos.map(empleado => {
                const entrada = marcacionesHoy.find(
                    m => m.empleadoId === empleado.$id && m.tipo === 'ENTRADA'
                );

                let status: 'PRESENTE' | 'AUSENTE' | 'RETARDO' = 'AUSENTE';
                let horaEntrada: string | undefined;

                if (entrada) {
                    horaEntrada = new Date(entrada.fechaHora).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    const horaEntradaDate = new Date(entrada.fechaHora);
                    status = horaEntradaDate > horarioLimite ? 'RETARDO' : 'PRESENTE';
                } else {
                    const tienePermiso = empleadosConPermisoHoy.includes(empleado.$id);
                    if (tienePermiso) {
                        status = 'PRESENTE';
                    }
                }

                return {
                    empleado,
                    ultimaMarcacion: entrada,
                    status,
                    horaEntrada
                };
            });

            setEmpleados(empleadosConStatus);

            const presentes = empleadosConStatus.filter(e => e.status === 'PRESENTE').length;
            const retardos = empleadosConStatus.filter(e => e.status === 'RETARDO').length;
            const ausentes = empleadosConStatus.filter(e => e.status === 'AUSENTE').length;

            setStats({ presentes, ausentes, retardos });
        } catch (error) {
            console.error('Error cargando asistencia:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarAsistencia();
    }, [fecha]);

    const getStatusBadge = (status: 'PRESENTE' | 'AUSENTE' | 'RETARDO') => {
        switch (status) {
            case 'PRESENTE':
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100"><UserCheck className="w-3 h-3 mr-1" />Presente</Badge>;
            case 'RETARDO':
                return <Badge className="bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-100"><AlertCircle className="w-3 h-3 mr-1" />Retardo</Badge>;
            case 'AUSENTE':
                return <Badge className="bg-red-100 text-red-700 border-red-300 hover:bg-red-100"><UserX className="w-3 h-3 mr-1" />Ausente</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Epic Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50" />
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

                <div className="relative px-6 pt-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                                    <Users className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Control de Asistencia
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">
                                        Gestión de marcaciones y reportes
                                        {config && (
                                            <span className="ml-2">
                                                • Horario: {config.horarioEntrada} - {config.horarioSalida}
                                                <span className="text-xs ml-1">(+{config.minutosTolerancia}min tolerancia)</span>
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Date Selector */}
                        <div className="mb-6 flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-md border border-slate-200">
                                <Calendar className="h-5 w-5 text-slate-500" />
                                <Input
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-medium"
                                />
                            </div>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Presentes</p>
                                                <p className="text-5xl font-black mt-2">{stats.presentes}</p>
                                                <p className="text-xs text-emerald-100 mt-1">
                                                    {((stats.presentes / (empleados.length || 1)) * 100).toFixed(0)}% del personal
                                                </p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <UserCheck className="h-8 w-8" />
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
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider">Retardos</p>
                                                <p className="text-5xl font-black mt-2">{stats.retardos}</p>
                                                <p className="text-xs text-amber-100 mt-1">Llegaron después de las 8:15 AM</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <AlertCircle className="h-8 w-8" />
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
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-500 to-pink-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-red-100 text-sm font-semibold uppercase tracking-wider">Ausentes</p>
                                                <p className="text-5xl font-black mt-2">{stats.ausentes}</p>
                                                <p className="text-xs text-red-100 mt-1">No han marcado entrada</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <UserX className="h-8 w-8" />
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
                                onClick={() => setDialogOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Marcar Manualmente
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setConfigDialogOpen(true)}
                                className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                            >
                                <Settings className="h-5 w-5 mr-2" />
                                Configuración
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setPermisoDialogOpen(true)}
                                className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Solicitar Permiso
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setVacacionDialogOpen(true)}
                                className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Solicitar Vacaciones
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setTurnosDialogOpen(true)}
                                className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                            >
                                <Settings className="h-5 w-5 mr-2" />
                                Gestionar Turnos
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setFestivosDialogOpen(true)}
                                className="bg-white border-slate-300 hover:bg-slate-50 shadow-md hover:shadow-lg transition-all"
                            >
                                <Calendar className="h-5 w-5 mr-2" />
                                Festivos
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="bg-gradient-to-r from-slate-100 to-blue-50 border shadow-sm">
                            <TabsTrigger value="empleados" className="data-[state=active]:bg-white data-[state=active]:shadow">
                                Personal del Día
                            </TabsTrigger>
                            <TabsTrigger value="permisos" className="data-[state=active]:bg-white data-[state=active]:shadow">
                                Permisos Pendientes
                            </TabsTrigger>
                            <TabsTrigger value="vacaciones" className="data-[state=active]:bg-white data-[state=active]:shadow">
                                Vacaciones Pendientes
                            </TabsTrigger>
                            <TabsTrigger value="extras" className="data-[state=active]:bg-white data-[state=active]:shadow">
                                Horas Extras
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="empleados">
                            <Card className="shadow-xl border-slate-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">Personal del Día</h3>
                                            <p className="text-sm text-slate-500 mt-1">{empleados.length} empleados activos</p>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-700 px-3 py-1.5">
                                            {empleados.length} empleados
                                        </Badge>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-12">
                                            <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                            <p className="text-slate-600 font-medium">Cargando personal...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {empleados.map(({ empleado, status, horaEntrada }, index) => (
                                                <motion.div
                                                    key={empleado.$id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                >
                                                    <Link
                                                        href={`/admin/asistencia/${empleado.$id}`}
                                                        className="block"
                                                    >
                                                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-blue-50/50 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                                                                    {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-800">
                                                                        {empleado.nombre} {empleado.apellido}
                                                                    </p>
                                                                    <p className="text-sm text-slate-500">
                                                                        {empleado.cargo}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4">
                                                                {horaEntrada && (
                                                                    <div className="text-right">
                                                                        <p className="text-sm font-medium text-slate-700">Entrada</p>
                                                                        <p className="text-xs text-slate-500">{horaEntrada}</p>
                                                                    </div>
                                                                )}
                                                                {getStatusBadge(status)}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="permisos">
                            <Card className="shadow-xl border-slate-200">
                                <CardContent className="p-6">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-800">Permisos Pendientes de Aprobación</h3>
                                        <p className="text-sm text-slate-500 mt-1">Solicitudes que requieren tu revisión</p>
                                    </div>
                                    <PermisosPendientesTab />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="vacaciones">
                            <Card className="shadow-xl border-slate-200">
                                <CardContent className="p-6">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-800">Vacaciones Pendientes de Aprobación</h3>
                                        <p className="text-sm text-slate-500 mt-1">Solicitudes de vacaciones que requieren aprobación</p>
                                    </div>
                                    <VacacionesPendientesTab />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="extras">
                            <Card className="shadow-xl border-slate-200">
                                <CardContent className="p-6">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-slate-800">Horas Extras Pendientes</h3>
                                        <p className="text-sm text-slate-500 mt-1">Solicitudes de horas extras que requieren aprobación</p>
                                    </div>
                                    <ExtrasPendientesTab />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Dialogs */}
            <MarcacionManualDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={() => {
                    setDialogOpen(false);
                    cargarAsistencia();
                }}
            />

            <ConfiguracionDialog
                open={configDialogOpen}
                onOpenChange={setConfigDialogOpen}
                onSuccess={() => {
                    cargarAsistencia();
                }}
            />

            <SolicitarPermisoDialog
                open={permisoDialogOpen}
                onOpenChange={setPermisoDialogOpen}
                onSuccess={() => {
                    cargarAsistencia();
                }}
            />

            <SolicitarVacacionesDialog
                open={vacacionDialogOpen}
                onOpenChange={setVacacionDialogOpen}
                onSuccess={() => {
                    cargarAsistencia();
                }}
            />

            <ConfiguracionTurnosDialog
                open={turnosDialogOpen}
                onOpenChange={setTurnosDialogOpen}
            />

            <GestionFestivosDialog
                open={festivosDialogOpen}
                onOpenChange={setFestivosDialogOpen}
            />
        </div>
    );
}
