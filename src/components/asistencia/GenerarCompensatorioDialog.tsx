"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { generarCompensatorio } from "@/lib/actions/compensatorios";
import type { Empleado } from "@/types";

interface GenerarCompensatorioDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function GenerarCompensatorioDialog({ open, onOpenChange, onSuccess }: GenerarCompensatorioDialogProps) {
    const [loading, setLoading] = useState(false);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [empleadoId, setEmpleadoId] = useState("");
    const [fechaGanado, setFechaGanado] = useState<Date>();
    const [motivo, setMotivo] = useState("Trabajo en Domingo/Festivo");
    const [dias, setDias] = useState("1");

    useEffect(() => {
        if (open) {
            cargarEmpleados();
        }
    }, [open]);

    const cargarEmpleados = async () => {
        try {
            const data = await obtenerEmpleados();
            setEmpleados(data);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando empleados");
        }
    };

    const handleSubmit = async () => {
        if (!empleadoId || !fechaGanado) {
            toast.error("Por favor completa todos los campos requeridos");
            return;
        }

        setLoading(true);
        try {
            const res = await generarCompensatorio({
                empleadoId,
                fechaGanado: fechaGanado.toISOString(),
                motivo,
                diasGanados: parseFloat(dias)
            });

            if (res.success) {
                toast.success("Compensatorio generado exitosamente");
                onOpenChange(false);
                // Reset form
                setEmpleadoId("");
                setFechaGanado(undefined);
                setMotivo("Trabajo en Domingo/Festivo");
                setDias("1");
                onSuccess?.();
            } else {
                toast.error(res.error || "Error al generar compensatorio");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generar Compensatorio</DialogTitle>
                    <DialogDescription>
                        Registra manualmente un día compensatorio para un empleado.
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
                        <Label>Fecha Trabajada (Generadora)</Label>
                        <Input
                            type="date"
                            value={fechaGanado ? format(fechaGanado, "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : undefined;
                                // Adjust for timezone offset if necessary, or just treat as local
                                if (date) {
                                    // Fix timezone issue by setting time to noon
                                    const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
                                    setFechaGanado(adjustedDate);
                                } else {
                                    setFechaGanado(undefined);
                                }
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Días a Compensar</Label>
                            <Input
                                type="number"
                                step="0.5"
                                min="0.5"
                                value={dias}
                                onChange={(e) => setDias(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Motivo / Observación</Label>
                        <Textarea
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej: Apoyo en inventario dominical"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
