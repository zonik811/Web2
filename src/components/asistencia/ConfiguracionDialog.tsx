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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { obtenerConfiguracionAsistencia, actualizarConfiguracionAsistencia } from "@/lib/actions/asistencia";
import type { ConfiguracionAsistencia } from "@/types";

interface ConfiguracionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ConfiguracionDialog({ open, onOpenChange, onSuccess }: ConfiguracionDialogProps) {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<ConfiguracionAsistencia | null>(null);
    const [formData, setFormData] = useState({
        horarioEntrada: "08:00",
        horarioSalida: "18:00",
        minutosTolerancia: 15,
        requiereJustificacion: false
    });

    useEffect(() => {
        if (open) {
            cargarConfiguracion();
        }
    }, [open]);

    const cargarConfiguracion = async () => {
        try {
            const cfg = await obtenerConfiguracionAsistencia();
            setConfig(cfg);
            setFormData({
                horarioEntrada: cfg.horarioEntrada,
                horarioSalida: cfg.horarioSalida,
                minutosTolerancia: cfg.minutosTolerancia,
                requiereJustificacion: cfg.requiereJustificacion || false
            });
        } catch (error) {
            console.error('Error cargando config:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await actualizarConfiguracionAsistencia(formData);

            if (result.success) {
                toast.success("Configuración actualizada correctamente");
                onSuccess?.();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Error al actualizar configuración");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Error al actualizar configuración");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Configuración de Asistencia</DialogTitle>
                    <DialogDescription>
                        Ajusta los horarios y parámetros del sistema
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Horario Entrada */}
                    <div className="space-y-2">
                        <Label htmlFor="horarioEntrada">Horario de Entrada</Label>
                        <Input
                            id="horarioEntrada"
                            type="time"
                            value={formData.horarioEntrada}
                            onChange={(e) => setFormData(prev => ({ ...prev, horarioEntrada: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Horario Salida */}
                    <div className="space-y-2">
                        <Label htmlFor="horarioSalida">Horario de Salida</Label>
                        <Input
                            id="horarioSalida"
                            type="time"
                            value={formData.horarioSalida}
                            onChange={(e) => setFormData(prev => ({ ...prev, horarioSalida: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Tolerancia */}
                    <div className="space-y-2">
                        <Label htmlFor="tolerancia">Minutos de Tolerancia</Label>
                        <Input
                            id="tolerancia"
                            type="number"
                            min="0"
                            max="60"
                            value={formData.minutosTolerancia}
                            onChange={(e) => setFormData(prev => ({ ...prev, minutosTolerancia: Number(e.target.value) }))}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Tiempo permitido después de la hora de entrada
                        </p>
                    </div>

                    {/* Requiere Justificación */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="requiereJustificacion"
                            checked={formData.requiereJustificacion}
                            onCheckedChange={(checked) =>
                                setFormData(prev => ({ ...prev, requiereJustificacion: checked as boolean }))
                            }
                        />
                        <Label htmlFor="requiereJustificacion" className="cursor-pointer">
                            Requiere justificación para ausencias
                        </Label>
                    </div>

                    {/* Info Actual */}
                    <div className="p-3 bg-muted rounded-lg text-sm">
                        <p className="font-medium mb-1">Configuración Actual:</p>
                        <p className="text-muted-foreground">
                            Horario: {config?.horarioEntrada} - {config?.horarioSalida}
                        </p>
                        <p className="text-muted-foreground">
                            Tolerancia: {config?.minutosTolerancia} minutos
                        </p>
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
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
