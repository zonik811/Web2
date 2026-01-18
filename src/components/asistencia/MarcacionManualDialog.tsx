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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { registrarMarcacion } from "@/lib/actions/asistencia";
import type { Empleado, TipoMarcacion } from "@/types";

interface MarcacionManualDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function MarcacionManualDialog({ open, onOpenChange, onSuccess }: MarcacionManualDialogProps) {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        empleadoId: "",
        tipo: "ENTRADA" as TipoMarcacion,
        fechaHora: "",
        notas: ""
    });

    useEffect(() => {
        if (open) {
            cargarEmpleados();
            // Establecer fecha/hora actual por defecto
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
            setFormData(prev => ({ ...prev, fechaHora: localDateTime }));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.empleadoId) {
            toast.error("Selecciona un empleado");
            return;
        }

        setLoading(true);
        try {
            const result = await registrarMarcacion({
                empleadoId: formData.empleadoId,
                tipo: formData.tipo,
                fechaHora: new Date(formData.fechaHora).toISOString(),
                notas: formData.notas,
                // TODO: Agregar adminId desde user context
            });

            if (result.success) {
                toast.success(`Marcación de ${formData.tipo.toLowerCase()} registrada`);
                onSuccess?.();
                // Reset form
                setFormData({
                    empleadoId: "",
                    tipo: "ENTRADA",
                    fechaHora: "",
                    notas: ""
                });
            } else {
                toast.error(result.error || "Error al registrar marcación");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Error al registrar marcación");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Marcación Manual</DialogTitle>
                    <DialogDescription>
                        Marca entrada o salida para un empleado
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Seleccionar Empleado */}
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

                    {/* Tipo de Marcación */}
                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo *</Label>
                        <Select
                            value={formData.tipo}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as TipoMarcacion }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ENTRADA">Entrada</SelectItem>
                                <SelectItem value="SALIDA">Salida</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="space-y-2">
                        <Label htmlFor="fechaHora">Fecha y Hora *</Label>
                        <input
                            id="fechaHora"
                            type="datetime-local"
                            value={formData.fechaHora}
                            onChange={(e) => setFormData(prev => ({ ...prev, fechaHora: e.target.value }))}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                        <Label htmlFor="notas">Notas (opcional)</Label>
                        <Textarea
                            id="notas"
                            value={formData.notas}
                            onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                            placeholder="Ej: Marcación manual por olvido"
                            rows={3}
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
                            {loading ? "Registrando..." : "Registrar Marcación"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
