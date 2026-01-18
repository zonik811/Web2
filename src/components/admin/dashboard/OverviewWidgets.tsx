"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    AlertTriangle,
    Banknote,
    Calendar,
    CheckCircle,
    Clock,
    Users,
    PackageX,
    Wrench
} from "lucide-react";
import { OperationalSummary } from "@/lib/actions/admin-dashboard";
import { formatearPrecio } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function OperationalStatusWidget({ summary }: { summary: OperationalSummary['operaciones'] }) {
    return (
        <Card className="h-full border-l-4 border-l-blue-500 shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-blue-600" /> Estado Operativo
                </CardTitle>
                <CardDescription>Resumen de la jornada actual</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Citas Hoy</span>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold">{summary.citasHoy}</span>
                            <Badge variant="secondary" className="mb-1 text-[10px]">{summary.citasPendientes} Pendientes</Badge>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">OTs Activas</span>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-blue-600">{summary.otsActivas}</span>
                            {summary.otsUrgentes > 0 && (
                                <Badge variant="destructive" className="mb-1 text-[10px] animate-pulse">
                                    {summary.otsUrgentes} Urgentes
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-2">
                    <Link href="/admin/citas">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                            <Calendar className="w-3 h-3 mr-1" /> Ver Agenda
                        </Button>
                    </Link>
                    <Link href="/admin/ordenes">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                            <Wrench className="w-3 h-3 mr-1" /> Ver Taller
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export function FinanceOverviewWidget({ summary }: { summary: OperationalSummary['finanzas'] }) {
    const isPositive = summary.balanceMes >= 0;

    return (
        <Card className="h-full border-l-4 border-l-emerald-500 shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Banknote className="h-5 w-5 text-emerald-600" /> Finanzas del Mes
                </CardTitle>
                <CardDescription>Consolidado Citas + OTs + POS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-medium text-slate-600">Ingresos Totales</span>
                        <span className="text-lg font-bold text-slate-800">{formatearPrecio(summary.ingresosMes)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full" />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-medium text-slate-600">Gastos Operativos</span>
                        <span className="text-lg font-bold text-slate-800">{formatearPrecio(summary.gastosMes)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        {/* Simple bar width calc */}
                        <div
                            className="h-full bg-rose-500 transition-all duration-500"
                            style={{ width: `${Math.min((summary.gastosMes / (summary.ingresosMes || 1)) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <div className={`mt-2 p-3 rounded-lg border flex justify-between items-center ${isPositive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <span className="text-sm font-bold text-slate-700">Balance Neto</span>
                    <span className={`text-xl font-black ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isPositive ? "+" : ""}{formatearPrecio(summary.balanceMes)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

export function CriticalAlertsWidget({ alerts, rrhh }: { alerts: OperationalSummary['alertas'], rrhh: OperationalSummary['rrhh'] }) {
    const hasInventoryAlerts = alerts.stockBajo > 0 || alerts.solicitudesRepuestos > 0;

    return (
        <Card className="h-full border-l-4 border-l-amber-500 shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" /> Centro de Alertas
                </CardTitle>
                <CardDescription>Atención requerida inmediata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Inventory Alerts */}
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-full">
                            <PackageX className="h-4 w-4 text-amber-700" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-amber-900">Logística</span>
                            <span className="text-xs text-amber-700">
                                {alerts.stockBajo} low stock · {alerts.solicitudesRepuestos} pedidos
                            </span>
                        </div>
                    </div>
                    {hasInventoryAlerts && (
                        <Link href="/admin/inventario">
                            <Button size="sm" variant="ghost" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100">
                                Ver
                            </Button>
                        </Link>
                    )}
                </div>

                {/* HR Alerts */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-200 p-2 rounded-full">
                            <Users className="h-4 w-4 text-slate-700" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">Personal</span>
                            <span className="text-xs text-slate-600">
                                {rrhh.presentes} / {rrhh.totalActivos} presentes
                            </span>
                        </div>
                    </div>
                    <Link href="/admin/asistencia/hoy">
                        <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900">
                            Check
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
