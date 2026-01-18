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
import { toast } from "sonner";
import { asignarHorarioEspecial } from "@/lib/actions/horarios-empleado";
import type { Empleado } from "@/types";

interface AsignarHorarioDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    empleado: Empleado;
    onSuccess?: () => void;
}

export function AsignarHorarioDialog({ open, onOpenChange, empleado, onSuccess }: AsignarHorarioDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        horarioEntrada: "08:00",
        horarioSalida: "18:00",
        fechaInicio: "",
        fechaFin: "",
        notas: ""
    });

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        const hoy = new Date().toISOString().split('T')[0];
        setFormData({
            horarioEntrada: "08:00",
            horarioSalida: "18:00",
            fechaInicio: hoy,
            fechaFin: "",
            notas: ""
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await asignarHorarioEspecial({
                empleadoId: empleado.$id,
                horarioEntrada: formData.horarioEntrada,
                horarioSalida: formData.horarioSalida,
                fechaInicio: formData.fechaInicio || undefined,
                fechaFin: formData.fechaFin || undefined,
                notas: formData.notas || undefined
            });

            if (result.success) {
                toast.success("Horario especial asignado correctamente");
                onSuccess?.();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Error al asignar horario");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Error al asignar horario");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Asignar Horario Especial</DialogTitle>
                    <DialogDescription>
                        Configura un horario personalizado para {empleado.nombre} {empleado.apellido}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Horarios */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="horarioEntrada">Hora de Entrada *</Label>
                            <Input
                                id="horarioEntrada"
                                type="time"
                                value={formData.horarioEntrada}
                                onChange={(e) => setFormData(prev => ({ ...prev, horarioEntrada: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="horarioSalida">Hora de Salida *</Label>
                            <Input
                                id="horarioSalida"
                                type="time"
                                value={formData.horarioSalida}
                                onChange={(e) => setFormData(prev => ({ ...prev, horarioSalida: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    {/* Vigencia */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fechaInicio">Desde</Label>
                            <Input
                                id="fechaInicio"
                                type="date"
                                value={formData.fechaInicio}
                                onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">Vacío = desde hoy</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fechaFin">Hasta</Label>
                            <Input
                                id="fechaFin"
                                type="date"
                                value={formData.fechaFin}
                                onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">Vacío = indefinido</p>
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                        <Label htmlFor="notas">Notas (opcional)</Label>
                        <Textarea
                            id="notas"
                            value={formData.notas}
                            onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                            placeholder="Ej: Turno especial, cambio temporal, etc."
                            rows={3}
                        />
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                        <p className="font-medium text-blue-900">ℹ️ Importante:</p>
                        <ul className="text-blue-700 text-xs mt-1 space-y-1">
                            <li>• Este horario sobreescribirá la configuración global</li>
                            <li>• Se desactivarán horarios anteriores automáticamente</li>
                            <li>• Los retardos se calcularán según este horario</li>
                        </ul>
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
                            {loading ? "Asignando..." : "Asignar Horario"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
