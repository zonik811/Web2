"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { solicitarPermiso } from "@/lib/actions/permisos";
import type { Empleado, TipoPermiso } from "@/types";

interface SolicitarPermisoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function SolicitarPermisoDialog({ open, onOpenChange, onSuccess }: SolicitarPermisoDialogProps) {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        empleadoId: "",
        tipo: "PERMISO" as TipoPermiso,
        subtipo: "",
        fechaInicio: "",
        fechaFin: "",
        horaInicio: "",
        horaFin: "",
        motivo: "",
        esPermisoParcial: false
    });

    useEffect(() => {
        if (open) {
            cargarEmpleados();
            resetForm();
        }
    }, [open]);

    const cargarEmpleados = async () => {
        try {
            const lista = await obtenerEmpleados();
            setEmpleados(lista.filter(e => e.activo));
        } catch (error) {
            console.error('Error cargando empleados:', error);
        }
    };

    const resetForm = () => {
        const hoy = new Date().toISOString().split('T')[0];
        setFormData({
            empleadoId: "",
            tipo: "PERMISO",
            subtipo: "",
            fechaInicio: hoy,
            fechaFin: hoy,
            horaInicio: "",
            horaFin: "",
            motivo: "",
            esPermisoParcial: false
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.empleadoId) {
            toast.error("Selecciona un empleado");
            return;
        }

        if (!formData.motivo) {
            toast.error("Describe el motivo del permiso");
            return;
        }

        setLoading(true);
        try {
            const result = await solicitarPermiso({
                empleadoId: formData.empleadoId,
                tipo: formData.tipo,
                subtipo: formData.subtipo || undefined,
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin,
                horaInicio: formData.esPermisoParcial ? formData.horaInicio : undefined,
                horaFin: formData.esPermisoParcial ? formData.horaFin : undefined,
                motivo: formData.motivo
            });

            if (result.success) {
                toast.success(`${formData.tipo.toLowerCase()} solicitado(a) correctamente`);
                onSuccess?.();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Error al solicitar permiso");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Error al solicitar permiso");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Solicitar Permiso o Justificación</DialogTitle>
                    <DialogDescription>
                        Registra ausencias autorizadas o justificaciones
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Empleado */}
                    <div className="space-y-2">
                        <Label htmlFor="empleado">Empleado *</Label>
                        <Select
                            value={formData.empleadoId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, empleadoId: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona empleado" />
                            </SelectTrigger>
                            <SelectContent>
                                {empleados.map(emp => (
                                    <SelectItem key={emp.$id} value={emp.$id}>
                                        {emp.nombre} {emp.apellido} - {emp.cargo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tipo */}
                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo *</Label>
                        <Select
                            value={formData.tipo}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as TipoPermiso }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PERMISO">Permiso</SelectItem>
                                <SelectItem value="JUSTIFICACION">Justificación</SelectItem>
                                <SelectItem value="LICENCIA">Licencia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Subtipo */}
                    <div className="space-y-2">
                        <Label htmlFor="subtipo">Motivo Específico</Label>
                        <Select
                            value={formData.subtipo}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, subtipo: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Opcional" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="medico">Médico</SelectItem>
                                <SelectItem value="personal">Personal</SelectItem>
                                <SelectItem value="familiar">Familiar</SelectItem>
                                <SelectItem value="estudio">Estudio</SelectItem>
                                <SelectItem value="tramite">Trámite</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fechaInicio">Fecha Inicio *</Label>
                            <Input
                                id="fechaInicio"
                                type="date"
                                value={formData.fechaInicio}
                                onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fechaFin">Fecha Fin *</Label>
                            <Input
                                id="fechaFin"
                                type="date"
                                value={formData.fechaFin}
                                onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    {/* Permiso Parcial */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="parcial"
                            checked={formData.esPermisoParcial}
                            onChange={(e) => setFormData(prev => ({ ...prev, esPermisoParcial: e.target.checked }))}
                            className="rounded"
                        />
                        <Label htmlFor="parcial" className="cursor-pointer">
                            Permiso parcial (solo parte del día)
                        </Label>
                    </div>

                    {/* Horas (si es parcial) */}
                    {formData.esPermisoParcial && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="horaInicio">Hora Inicio</Label>
                                <Input
                                    id="horaInicio"
                                    type="time"
                                    value={formData.horaInicio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="horaFin">Hora Fin</Label>
                                <Input
                                    id="horaFin"
                                    type="time"
                                    value={formData.horaFin}
                                    onChange={(e) => setFormData(prev => ({ ...prev, horaFin: e.target.value }))}
                                />
                            </div>
                        </div>
                    )}

                    {/* Motivo */}
                    <div className="space-y-2">
                        <Label htmlFor="motivo">Descripción/Motivo *</Label>
                        <Textarea
                            id="motivo"
                            value={formData.motivo}
                            onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                            placeholder="Describe el motivo del permiso o justificación"
                            rows={4}
                            required
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Solicitando..." : "Solicitar Permiso"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
