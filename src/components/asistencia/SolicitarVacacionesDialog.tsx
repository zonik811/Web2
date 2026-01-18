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
import { solicitarVacaciones, calcularDiasHabiles, obtenerSaldoVacaciones } from "@/lib/actions/vacaciones";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import type { Empleado, SaldoVacaciones } from "@/types";

interface SolicitarVacacionesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function SolicitarVacacionesDialog({ open, onOpenChange, onSuccess }: SolicitarVacacionesDialogProps) {
    const [loading, setLoading] = useState(false);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [saldo, setSaldo] = useState<SaldoVacaciones | null>(null);
    const [diasCalculados, setDiasCalculados] = useState(0);

    const [formData, setFormData] = useState({
        empleadoId: "",
        fechaInicio: "",
        fechaFin: "",
        motivo: ""
    });

    useEffect(() => {
        if (open) {
            cargarEmpleados();
            resetForm();
        }
    }, [open]);

    useEffect(() => {
        const calcular = async () => {
            if (formData.fechaInicio && formData.fechaFin) {
                const dias = await calcularDiasHabiles(formData.fechaInicio, formData.fechaFin);
                setDiasCalculados(dias);
            } else {
                setDiasCalculados(0);
            }
        };
        calcular();
    }, [formData.fechaInicio, formData.fechaFin]);

    useEffect(() => {
        if (formData.empleadoId) {
            cargarSaldo(formData.empleadoId);
        } else {
            setSaldo(null);
        }
    }, [formData.empleadoId]);

    const cargarEmpleados = async () => {
        const lista = await obtenerEmpleados();
        setEmpleados(lista.filter(e => e.activo));
    };

    const cargarSaldo = async (empleadoId: string) => {
        const saldoEmpleado = await obtenerSaldoVacaciones(empleadoId);
        setSaldo(saldoEmpleado);
    };

    const resetForm = () => {
        setFormData({
            empleadoId: "",
            fechaInicio: "",
            fechaFin: "",
            motivo: ""
        });
        setDiasCalculados(0);
        setSaldo(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (diasCalculados === 0) {
            toast.error("Selecciona fechas válidas");
            return;
        }

        if (saldo && diasCalculados > saldo.diasDisponibles) {
            toast.error(`Solo tienes ${saldo.diasDisponibles} días disponibles`);
            return;
        }

        setLoading(true);

        try {
            const result = await solicitarVacaciones({
                empleadoId: formData.empleadoId,
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin,
                motivo: formData.motivo
            });

            if (result.success) {
                toast.success("Vacaciones solicitadas correctamente");
                onSuccess?.();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Error al solicitar vacaciones");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Error al solicitar vacaciones");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Solicitar Vacaciones</DialogTitle>
                    <DialogDescription>
                        Completa los datos para solicitar días de vacaciones
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Empleado */}
                    <div className="space-y-2">
                        <Label htmlFor="empleado">Empleado *</Label>
                        <Select
                            value={formData.empleadoId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, empleadoId: value }))}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona empleado" />
                            </SelectTrigger>
                            <SelectContent>
                                {empleados.map((emp) => (
                                    <SelectItem key={emp.$id} value={emp.$id}>
                                        {emp.nombre} {emp.apellido} - {emp.cargo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Mostrar saldo si hay empleado seleccionado */}
                    {saldo && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">Saldo disponible</p>
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-blue-700">Total: {saldo.diasTotales} días</span>
                                <span className="text-xs text-blue-700">Usados: {saldo.diasUsados}</span>
                                <span className="text-sm font-bold text-blue-900">
                                    Disponibles: {saldo.diasDisponibles} días
                                </span>
                            </div>
                        </div>
                    )}

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
                                min={formData.fechaInicio}
                                required
                            />
                        </div>
                    </div>

                    {/* Días calculados */}
                    {diasCalculados > 0 && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm">
                                <span className="font-medium text-green-900">Días hábiles: </span>
                                <span className="text-2xl font-bold text-green-600">{diasCalculados}</span>
                                <span className="text-xs text-green-700 ml-2">(excluye fines de semana)</span>
                            </p>
                        </div>
                    )}

                    {/* Motivo */}
                    <div className="space-y-2">
                        <Label htmlFor="motivo">Motivo (opcional)</Label>
                        <Textarea
                            id="motivo"
                            value={formData.motivo}
                            onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                            placeholder="Ej: Vacaciones familiares, viaje, etc."
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
                        <Button
                            type="submit"
                            disabled={loading || !formData.empleadoId || diasCalculados === 0}
                        >
                            {loading ? "Solicitando..." : "Solicitar Vacaciones"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
