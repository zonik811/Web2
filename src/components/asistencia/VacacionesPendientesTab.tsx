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
import { Calendar, User, Check, X } from "lucide-react";
import { obtenerVacacionesPendientes, aprobarVacaciones, rechazarVacaciones } from "@/lib/actions/vacaciones";
import { obtenerEmpleado } from "@/lib/actions/empleados";
import type { Vacacion } from "@/types";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface VacacionConEmpleado extends Vacacion {
    empleadoNombre?: string;
}

export function VacacionesPendientesTab() {
    const [vacaciones, setVacaciones] = useState<VacacionConEmpleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [accion, setAccion] = useState<'aprobar' | 'rechazar'>('aprobar');
    const [vacacionSeleccionada, setVacacionSeleccionada] = useState<Vacacion | null>(null);
    const [motivo, setMotivo] = useState('');
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        cargarVacaciones();
    }, []);

    const cargarVacaciones = async () => {
        setLoading(true);
        try {
            const lista = await obtenerVacacionesPendientes();

            const vacacionesConNombres = await Promise.all(
                lista.map(async (vac) => {
                    try {
                        const empleado = await obtenerEmpleado(vac.empleadoId);
                        return {
                            ...vac,
                            empleadoNombre: `${empleado.nombre} ${empleado.apellido}`
                        };
                    } catch {
                        return { ...vac, empleadoNombre: 'Desconocido' };
                    }
                })
            );

            setVacaciones(vacacionesConNombres);
        } catch (error) {
            console.error('Error cargando vacaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccion = (vacacion: Vacacion, tipo: 'aprobar' | 'rechazar') => {
        setVacacionSeleccionada(vacacion);
        setAccion(tipo);
        setMotivo('');
        setDialogOpen(true);
    };

    const confirmarAccion = async () => {
        if (!vacacionSeleccionada) return;

        setProcesando(true);
        try {
            const result = accion === 'aprobar'
                ? await aprobarVacaciones(vacacionSeleccionada.$id, 'admin')
                : await rechazarVacaciones(vacacionSeleccionada.$id, 'admin', motivo || 'Sin motivo especificado');

            if (result.success) {
                toast.success(`Vacaciones ${accion === 'aprobar' ? 'aprobadas' : 'rechazadas'} correctamente`);
                setDialogOpen(false);
                cargarVacaciones();
            } else {
                toast.error(result.error || 'Error al procesar vacaciones');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al procesar vacaciones');
        } finally {
            setProcesando(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Cargando vacaciones pendientes...</div>;
    }

    if (vacaciones.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay vacaciones pendientes de aprobación</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Fechas</TableHead>
                        <TableHead>Días</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vacaciones.map((vac) => (
                        <TableRow key={vac.$id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    {vac.empleadoNombre}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(vac.fechaInicio).toLocaleDateString('es-CO', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                        {' → '}
                                        {new Date(vac.fechaFin).toLocaleDateString('es-CO', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="bg-purple-50">
                                    {vac.diasSolicitados} días
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <p className="text-sm max-w-xs truncate" title={vac.motivo}>
                                    {vac.motivo || '-'}
                                </p>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 hover:bg-green-50"
                                        onClick={() => handleAccion(vac, 'aprobar')}
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Aprobar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => handleAccion(vac, 'rechazar')}
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Rechazar
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Dialog de confirmación */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {accion === 'aprobar' ? '✅ Aprobar Vacaciones' : '❌ Rechazar Vacaciones'}
                        </DialogTitle>
                        <DialogDescription>
                            {vacacionSeleccionada && (
                                <>
                                    <strong>{vacacionSeleccionada.diasSolicitados} días</strong> de{' '}
                                    {vacaciones.find(v => v.$id === vacacionSeleccionada.$id)?.empleadoNombre}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {accion === 'rechazar' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Motivo del rechazo *:</p>
                                <Textarea
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    placeholder="Explica por qué se rechazan las vacaciones"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            disabled={procesando}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmarAccion}
                            disabled={procesando || (accion === 'rechazar' && !motivo)}
                            className={accion === 'aprobar' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            {procesando ? 'Procesando...' : (accion === 'aprobar' ? 'Aprobar' : 'Rechazar')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
