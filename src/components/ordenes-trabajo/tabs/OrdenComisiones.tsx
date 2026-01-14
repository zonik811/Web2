"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    DollarSign, UserCheck, Calendar, CheckCircle, XCircle,
    Banknote, Clock, Wallet, Users
} from "lucide-react";
import type { Comision, Empleado } from "@/types";
import { EstadoComision } from "@/types";
import { RegistrarComisionDialog } from "../dialogs/RegistrarComisionDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { actualizarEstadoComision } from "@/lib/actions/comisiones";
import { useState } from "react";

interface OrdenComisionesProps {
    ordenId: string;
    comisiones: Comision[];
    empleados: Empleado[];
}

export function OrdenComisiones({ ordenId, comisiones, empleados }: OrdenComisionesProps) {
    const router = useRouter();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleRefresh = () => {
        router.refresh();
    };

    const handleTogglePagado = async (comisionId: string, currentEstado: string) => {
        setUpdatingId(comisionId);
        const nuevoEstado = currentEstado === EstadoComision.PAGADO
            ? EstadoComision.PENDIENTE
            : EstadoComision.PAGADO;

        try {
            const result = await actualizarEstadoComision(comisionId, nuevoEstado);
            if (result.success) {
                router.refresh();
            } else {
                alert("Error al actualizar estado: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error al actualizar estado");
        } finally {
            setUpdatingId(null);
        }
    };

    // Calcular totales
    const totalComisiones = comisiones.reduce((sum, c) => sum + c.monto, 0);
    const totalPagado = comisiones.filter(c => c.estado === EstadoComision.PAGADO).reduce((sum, c) => sum + c.monto, 0);
    const totalPendiente = comisiones.filter(c => c.estado === EstadoComision.PENDIENTE).reduce((sum, c) => sum + c.monto, 0);
    const porcentajePagado = totalComisiones > 0 ? (totalPagado / totalComisiones) * 100 : 0;

    // Mapear empleados a comisiones
    const comisionesConEmpleado = comisiones.map(comision => {
        const empleado = empleados.find(e => e.$id === comision.empleadoId);
        return { ...comision, empleado };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-slate-900 border-none text-white shadow-lg overflow-hidden relative">
                    <div className="absolute -right-6 -top-6 text-slate-800 opacity-20 transform rotate-12">
                        <Wallet className="w-32 h-32" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Banknote className="h-4 w-4" /> Total Comisiones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold">${totalComisiones.toLocaleString()}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Para {comisiones.length} registro(s)
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" /> Pagado a Personal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">${totalPagado.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(porcentajePagado)}% del total
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute right-2 top-2">
                        {totalPendiente > 0 && (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                        )}
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Pendiente por Pagar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">${totalPendiente.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Requiere atención administrativa
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content: Header + Table */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Nómina de Orden
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Gestión detallada de pagos por servicios y comisiones.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <RegistrarComisionDialog
                            ordenId={ordenId}
                            empleados={empleados}
                            onComisionCreated={handleRefresh}
                        />
                    </div>
                </div>

                <Card className="overflow-hidden border shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[250px]">Empleado</TableHead>
                                    <TableHead>Concepto / Detalle</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comisionesConEmpleado.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <DollarSign className="h-8 w-8 opacity-20" />
                                                <p>No hay comisiones registradas en esta orden.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    comisionesConEmpleado.map((comision) => (
                                        <TableRow key={comision.$id} className="hover:bg-slate-50/50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border bg-slate-100">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comision.empleado?.nombre}`} />
                                                        <AvatarFallback className="text-slate-500">
                                                            {comision.empleado?.nombre?.[0] || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-slate-900">
                                                            {comision.empleado?.nombre || "N/A"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {comision.empleado?.cargo || "Sin cargo"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm text-slate-700">{comision.concepto}</span>
                                                    {comision.observaciones && (
                                                        <span className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                                                            "{comision.observaciones}"
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    {format(new Date(comision.fecha), "dd MMM yyyy", { locale: es })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-700">
                                                ${comision.monto.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="secondary"
                                                    className={`
                                                        ${comision.estado === EstadoComision.PAGADO
                                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"}
                                                        border-0 px-2.5 py-0.5
                                                    `}
                                                >
                                                    {comision.estado === EstadoComision.PAGADO ? (
                                                        <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> Pagado</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Pendiente</span>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className={`
                                                        h-8 text-xs font-medium border
                                                        ${comision.estado === EstadoComision.PAGADO
                                                            ? "text-slate-500 border-slate-200 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50"
                                                            : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-emerald-50/30"}
                                                    `}
                                                    onClick={() => handleTogglePagado(comision.$id, comision.estado)}
                                                    disabled={updatingId === comision.$id}
                                                >
                                                    {updatingId === comision.$id ? (
                                                        <span className="animate-pulse">...</span>
                                                    ) : (
                                                        comision.estado === EstadoComision.PAGADO ? "Marcar Pendiente" : "Pagar"
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
