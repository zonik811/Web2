"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X, Clock, AlertCircle } from "lucide-react";
import { obtenerExtrasPendientes, aprobarHoraExtra, rechazarHoraExtra } from "@/lib/actions/horas-extras";
import { obtenerEmpleado } from "@/lib/actions/empleados";
import type { HoraExtra, Empleado } from "@/types";

export function ExtrasPendientesTab() {
    const [extras, setExtras] = useState<(HoraExtra & { empleadoNombre?: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedExtra, setSelectedExtra] = useState<HoraExtra | null>(null);
    const [action, setAction] = useState<'approve' | 'reject'>('approve');
    const [adminId, setAdminId] = useState("admin-temp"); // TODO: Get from auth context

    useEffect(() => {
        cargarExtras();
    }, []);

    const cargarExtras = async () => {
        setLoading(true);
        try {
            const lista = await obtenerExtrasPendientes();

            // Enriquecer con nombres de empleados
            const extrasConNombre = await Promise.all(lista.map(async (extra) => {
                const emp = await obtenerEmpleado(extra.empleadoId);
                return {
                    ...extra,
                    empleadoNombre: emp ? `${emp.nombre} ${emp.apellido}` : 'Desconocido'
                };
            }));

            setExtras(extrasConNombre);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (extra: HoraExtra, type: 'approve' | 'reject') => {
        setSelectedExtra(extra);
        setAction(type);
        setDialogOpen(true);
    };

    const confirmAction = async () => {
        if (!selectedExtra) return;

        try {
            let result;
            if (action === 'approve') {
                result = await aprobarHoraExtra(selectedExtra.$id, adminId);
            } else {
                result = await rechazarHoraExtra(selectedExtra.$id, adminId);
            }

            if (result.success) {
                toast.success(action === 'approve' ? "Horas aprobadas" : "Horas rechazadas");
                setDialogOpen(false);
                cargarExtras();
            } else {
                toast.error(result.error || "Error al procesar");
            }
        } catch (error) {
            toast.error("Error inesperado");
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Cargando horas extras...</div>;
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Horas Extras Pendientes</CardTitle>
                    <CardDescription>
                        Solicitudes generadas automáticamente o manualmente que requieren revisión.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Empleado</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Duración</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Motivo</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {extras.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Check className="w-8 h-8 text-green-500" />
                                            <p>No hay horas extras pendientes de revisión</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                extras.map((extra) => (
                                    <TableRow key={extra.$id}>
                                        <TableCell>
                                            {new Date(extra.fecha).toLocaleDateString('es-CO', {
                                                day: 'numeric', month: 'short'
                                            })}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {extra.empleadoNombre}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs text-muted-foreground">
                                                {extra.horaInicio} - {extra.horaFin}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">
                                                {extra.cantidadHoras}h
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                extra.tipo === 'DIURNA' ? 'bg-blue-500' :
                                                    extra.tipo === 'NOCTURNA' ? 'bg-indigo-600' :
                                                        'bg-orange-500'
                                            }>
                                                {extra.tipo} x{extra.multiplicador}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                            {extra.motivo}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                                                    onClick={() => handleAction(extra, 'approve')}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                                                    onClick={() => handleAction(extra, 'reject')}
                                                >
                                                    <X className="w-4 h-4" />
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {action === 'approve' ? 'Aprobar Horas Extras' : 'Rechazar Horas Extras'}
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de {action === 'approve' ? 'aprobar' : 'rechazar'} este registro?
                        </DialogDescription>
                    </DialogHeader>

                    {selectedExtra && (
                        <div className="py-4 bg-muted/50 rounded-lg px-4 space-y-2 text-sm">
                            <p><strong>Empleado:</strong> {(selectedExtra as any).empleadoNombre}</p>
                            <p><strong>Fecha:</strong> {selectedExtra.fecha} ({selectedExtra.cantidadHoras}h)</p>
                            <p><strong>Tipo:</strong> {selectedExtra.tipo} (x{selectedExtra.multiplicador})</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button
                            variant={action === 'approve' ? 'default' : 'destructive'}
                            onClick={confirmAction}
                        >
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
