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
import { obtenerPermisosPendientes, aprobarPermiso, rechazarPermiso } from "@/lib/actions/permisos";
import { obtenerEmpleado } from "@/lib/actions/empleados";
import type { Permiso, Empleado } from "@/types";
import { toast } from "sonner";
import { Calendar, Clock, Check, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PermisoConEmpleado extends Permiso {
    empleadoNombre?: string;
}

export function PermisosPendientesTab() {
    const [permisos, setPermisos] = useState<PermisoConEmpleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [accion, setAccion] = useState<'aprobar' | 'rechazar'>('aprobar');
    const [permisoSeleccionado, setPermisoSeleccionado] = useState<Permiso | null>(null);
    const [comentarios, setComentarios] = useState('');
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        cargarPermisos();
    }, []);

    const cargarPermisos = async () => {
        setLoading(true);
        try {
            const lista = await obtenerPermisosPendientes();

            // Cargar nombres de empleados
            const permisosConNombres = await Promise.all(
                lista.map(async (permiso) => {
                    try {
                        const empleado = await obtenerEmpleado(permiso.empleadoId);
                        return {
                            ...permiso,
                            empleadoNombre: `${empleado.nombre} ${empleado.apellido}`
                        };
                    } catch {
                        return { ...permiso, empleadoNombre: 'Desconocido' };
                    }
                })
            );

            setPermisos(permisosConNombres);
        } catch (error) {
            console.error('Error cargando permisos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccion = (permiso: Permiso, tipo: 'aprobar' | 'rechazar') => {
        setPermisoSeleccionado(permiso);
        setAccion(tipo);
        setComentarios('');
        setDialogOpen(true);
    };

    const confirmarAccion = async () => {
        if (!permisoSeleccionado) return;

        setProcesando(true);
        try {
            const result = accion === 'aprobar'
                ? await aprobarPermiso(permisoSeleccionado.$id, 'admin', comentarios)
                : await rechazarPermiso(permisoSeleccionado.$id, 'admin', comentarios || 'Sin motivo especificado');

            if (result.success) {
                toast.success(`Permiso ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} correctamente`);
                setDialogOpen(false);
                cargarPermisos();
            } else {
                toast.error(result.error || 'Error al procesar permiso');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al procesar permiso');
        } finally {
            setProcesando(false);
        }
    };

    const getTipoBadge = (tipo: string) => {
        switch (tipo) {
            case 'PERMISO':
                return <Badge variant="outline" className="bg-blue-100">Permiso</Badge>;
            case 'JUSTIFICACION':
                return <Badge variant="outline" className="bg-yellow-100">Justificación</Badge>;
            case 'LICENCIA':
                return <Badge variant="outline" className="bg-purple-100">Licencia</Badge>;
            default:
                return <Badge>{tipo}</Badge>;
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Cargando permisos pendientes...</div>;
    }

    if (permisos.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay permisos pendientes</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fechas</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {permisos.map((permiso) => (
                        <TableRow key={permiso.$id}>
                            <TableCell className="font-medium">
                                {permiso.empleadoNombre}
                            </TableCell>
                            <TableCell>
                                {getTipoBadge(permiso.tipo)}
                                {permiso.subtipo && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        ({permiso.subtipo})
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(permiso.fechaInicio).toLocaleDateString('es-CO', {
                                            day: '2-digit',
                                            month: 'short'
                                        })}
                                        {' - '}
                                        {new Date(permiso.fechaFin).toLocaleDateString('es-CO', {
                                            day: '2-digit',
                                            month: 'short'
                                        })}
                                    </div>
                                    {permiso.horaInicio && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {permiso.horaInicio} - {permiso.horaFin}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <p className="text-sm max-w-xs truncate" title={permiso.motivo}>
                                    {permiso.motivo}
                                </p>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 hover:bg-green-50"
                                        onClick={() => handleAccion(permiso, 'aprobar')}
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Aprobar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => handleAccion(permiso, 'rechazar')}
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
                            {accion === 'aprobar' ? '✅ Aprobar Permiso' : '❌ Rechazar Permiso'}
                        </DialogTitle>
                        <DialogDescription>
                            {permisoSeleccionado && (
                                <>
                                    <strong>{permisoSeleccionado.tipo}</strong> de{' '}
                                    {permisos.find(p => p.$id === permisoSeleccionado.$id)?.empleadoNombre}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                Comentarios {accion === 'rechazar' && '(requeridos)'}:
                            </p>
                            <Textarea
                                value={comentarios}
                                onChange={(e) => setComentarios(e.target.value)}
                                placeholder={
                                    accion === 'aprobar'
                                        ? 'Comentarios adicionales (opcional)'
                                        : 'Explica el motivo del rechazo'
                                }
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                disabled={procesando}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmarAccion}
                                disabled={procesando || (accion === 'rechazar' && !comentarios)}
                                className={accion === 'aprobar' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            >
                                {procesando ? 'Procesando...' : (accion === 'aprobar' ? 'Aprobar' : 'Rechazar')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
