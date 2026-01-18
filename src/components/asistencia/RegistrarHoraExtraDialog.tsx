"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { registrarHorasExtras } from "@/lib/actions/horas-extras";
import { Empleado, CrearHoraExtraInput } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";

interface RegistrarHoraExtraDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function RegistrarHoraExtraDialog({
    open,
    onOpenChange,
    onSuccess,
}: RegistrarHoraExtraDialogProps) {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [empleadoId, setEmpleadoId] = useState("");
    const [fecha, setFecha] = useState<Date | undefined>(undefined);
    const [horaInicio, setHoraInicio] = useState("");
    const [horaFin, setHoraFin] = useState("");
    const [tipo, setTipo] = useState<string>("DIURNA");
    const [motivo, setMotivo] = useState("");

    useEffect(() => {
        if (open) {
            cargarEmpleados();
            resetForm();
        }
    }, [open]);

    const cargarEmpleados = async () => {
        setLoading(true);
        try {
            const res = await obtenerEmpleados();
            setEmpleados(res);
        } catch (error) {
            toast.error("Error cargando empleados");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmpleadoId("");
        setFecha(undefined);
        setHoraInicio("");
        setHoraFin("");
        setTipo("DIURNA");
        setMotivo("");
    };

    const handleSubmit = async () => {
        if (!empleadoId || !fecha || !horaInicio || !horaFin) {
            toast.error("Por favor completa los campos requeridos");
            return;
        }

        setSubmitting(true);
        try {
            const data: CrearHoraExtraInput = {
                empleadoId,
                fecha: format(fecha, "yyyy-MM-dd"),
                horaInicio,
                horaFin,
                cantidadHoras: 0, // Calculated by backend
                tipo: tipo as any,
                motivo,
                estado: 'PENDIENTE'
            };

            const res = await registrarHorasExtras(data);

            if (res.success) {
                toast.success("Hora extra registrada exitosamente");
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(res.error || "Error al registrar");
            }
        } catch (error) {
            toast.error("Error inesperado");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Hora Extra Manual</DialogTitle>
                    <DialogDescription>
                        Crea un registro de tiempo suplementario para un empleado. Requiere aprobación posterior.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Empleado</Label>
                        <Select value={empleadoId} onValueChange={setEmpleadoId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar empleado" />
                            </SelectTrigger>
                            <SelectContent>
                                {empleados.map((emp) => (
                                    <SelectItem key={emp.$id} value={emp.$id}>
                                        {emp.nombre} {emp.apellido}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Fecha</Label>
                        <Input
                            type="date"
                            value={fecha ? format(fecha, "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : undefined;
                                if (date) {
                                    const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
                                    setFecha(adjustedDate);
                                } else {
                                    setFecha(undefined);
                                }
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Hora Inicio</Label>
                            <Input
                                type="time"
                                value={horaInicio}
                                onChange={(e) => setHoraInicio(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Hora Fin</Label>
                            <Input
                                type="time"
                                value={horaFin}
                                onChange={(e) => setHoraFin(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Recargo</Label>
                        <Select value={tipo} onValueChange={setTipo}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DIURNA">Extra Diurna</SelectItem>
                                <SelectItem value="NOCTURNA">Extra Nocturna</SelectItem>
                                <SelectItem value="DOMINICAL">Dominical / Festivo</SelectItem>
                                <SelectItem value="FESTIVA">Recargo Festivo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Motivo (Opcional)</Label>
                        <Input
                            placeholder="Ej. Cierre contable, reparación urgente"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Guardando..." : "Registrar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
