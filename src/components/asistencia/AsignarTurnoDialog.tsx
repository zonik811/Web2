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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { obtenerTurnos, asignarTurno } from "@/lib/actions/turnos";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import type { Empleado, Turno } from "@/types";
import { CalendarPlus, Clock, User, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface AsignarTurnoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    empleado?: Empleado;
    empleadoId?: string;
    onSuccess?: () => void;
}

export function AsignarTurnoDialog({ open, onOpenChange, empleado, empleadoId, onSuccess }: AsignarTurnoDialogProps) {
    const [loading, setLoading] = useState(false);
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [selectedEmpleadoId, setSelectedEmpleadoId] = useState(empleadoId || empleado?.$id || "");

    // Default dates: next Monday to Sunday
    const [formData, setFormData] = useState({
        turnoId: "",
        fechaInicio: "",
        fechaFin: "",
        notas: ""
    });

    useEffect(() => {
        if (open) {
            cargarTurnos();
            establecerFechasDefault();

            // Si no se proporciona un empleado específico, cargar la lista
            if (!empleado) {
                cargarEmpleados();
            }

            // Set empleado seleccionado
            setSelectedEmpleadoId(empleadoId || empleado?.$id || "");
        }
    }, [open, empleado, empleadoId]);

    const cargarEmpleados = async () => {
        const lista = await obtenerEmpleados();
        setEmpleados(lista);
    };

    const cargarTurnos = async () => {
        const lista = await obtenerTurnos();
        setTurnos(lista);
    };

    const establecerFechasDefault = () => {
        const hoy = new Date();
        const diasHastaLunes = (1 + 7 - hoy.getDay()) % 7 || 7;
        const proximoLunes = new Date(hoy);
        proximoLunes.setDate(hoy.getDate() + diasHastaLunes);

        const proximoDomingo = new Date(proximoLunes);
        proximoDomingo.setDate(proximoLunes.getDate() + 6);

        setFormData({
            turnoId: "",
            fechaInicio: proximoLunes.toISOString().split('T')[0],
            fechaFin: proximoDomingo.toISOString().split('T')[0],
            notas: ""
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedEmpleadoId) {
            toast.error("Selecciona un empleado");
            return;
        }

        setLoading(true);

        try {
            const result = await asignarTurno({
                empleadoId: selectedEmpleadoId,
                turnoId: formData.turnoId,
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin,
                notas: formData.notas
            });

            if (result.success) {
                toast.success("Turno asignado correctamente");
                onSuccess?.();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Error al asignar turno");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al asignar turno");
        } finally {
            setLoading(false);
        }
    };

    const turnoSeleccionado = turnos.find(t => t.$id === formData.turnoId);
    const empleadoSeleccionado = empleado || empleados.find(e => e.$id === selectedEmpleadoId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader className="pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                            <CalendarPlus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Asignar Turno Rotativo</DialogTitle>
                            <DialogDescription className="mt-1">
                                {empleado
                                    ? `Asigna un turno a ${empleado.nombre} por un rango de fechas.`
                                    : 'Asigna un turno a un empleado por un rango de fechas.'
                                }
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    {/* Employee Selector - only show if no empleado provided */}
                    {!empleado && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Empleado
                            </Label>
                            <Select
                                value={selectedEmpleadoId}
                                onValueChange={setSelectedEmpleadoId}
                                required
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Selecciona un empleado..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {empleados.map((emp) => (
                                        <SelectItem key={emp.$id} value={emp.$id}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {emp.nombre.charAt(0)}{emp.apellido.charAt(0)}
                                                </div>
                                                <span>{emp.nombre} {emp.apellido}</span>
                                                <span className="text-xs text-slate-500">• {emp.cargo || 'Personal'}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Seleccionar Turno
                        </Label>
                        <Select
                            value={formData.turnoId}
                            onValueChange={(val) => setFormData({ ...formData, turnoId: val })}
                            required
                        >
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Selecciona un turno..." />
                            </SelectTrigger>
                            <SelectContent>
                                {turnos.map((turno) => (
                                    <SelectItem key={turno.$id} value={turno.$id}>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full shadow-sm"
                                                style={{ backgroundColor: turno.color }}
                                            />
                                            <span className="font-medium">{turno.nombre}</span>
                                            <span className="text-xs text-slate-500 font-mono">
                                                ({turno.horaEntrada} - {turno.horaSalida})
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Desde</Label>
                            <Input
                                type="date"
                                value={formData.fechaInicio}
                                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                required
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Hasta</Label>
                            <Input
                                type="date"
                                value={formData.fechaFin}
                                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                min={formData.fechaInicio}
                                required
                                className="bg-white"
                            />
                        </div>
                    </div>

                    {turnoSeleccionado && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl border-l-4 shadow-sm"
                            style={{
                                borderLeftColor: turnoSeleccionado.color,
                                backgroundColor: `${turnoSeleccionado.color}10`
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                                    style={{ backgroundColor: turnoSeleccionado.color }}
                                >
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{turnoSeleccionado.nombre}</p>
                                    <p className="text-sm text-slate-600 font-mono">
                                        {turnoSeleccionado.horaEntrada} a {turnoSeleccionado.horaSalida}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Notas (Opcional)
                        </Label>
                        <Textarea
                            value={formData.notas}
                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                            placeholder="Ej: Cubre vacaciones de X"
                            rows={3}
                            className="bg-white resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="bg-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
                        >
                            {loading ? "Asignando..." : "Asignar Turno"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
