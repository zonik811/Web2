"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { registrarMovimientoBanco } from "@/lib/actions/banco-horas";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { Empleado } from "@/types";

interface AjusteBancoDialogProps {
    empleadoId?: string;
    currentBalance?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AjusteBancoDialog({ empleadoId: initialEmpleadoId, open, onOpenChange, onSuccess }: AjusteBancoDialogProps) {
    const [loading, setLoading] = useState(false);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [selectedEmpleadoId, setSelectedEmpleadoId] = useState(initialEmpleadoId || "");

    const [tipo, setTipo] = useState<'ABONO' | 'DEUDA'>('ABONO');
    const [origen, setOrigen] = useState('AJUSTE_MANUAL');
    const [cantidadHoras, setCantidadHoras] = useState("");
    const [notas, setNotas] = useState("");

    useEffect(() => {
        if (open) {
            // Si no se proporcionó empleadoId, cargar lista de empleados
            if (!initialEmpleadoId) {
                obtenerEmpleados().then(setEmpleados).catch(() => toast.error("Error cargando empleados"));
            } else {
                setSelectedEmpleadoId(initialEmpleadoId);
            }

            // Reset fields
            if (!initialEmpleadoId) setSelectedEmpleadoId("");
            setTipo('ABONO');
            setCantidadHoras("");
            setNotas("");
        }
    }, [open, initialEmpleadoId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedEmpleadoId) {
            toast.error("Seleccione un empleado");
            return;
        }

        setLoading(true);

        try {
            const minutos = Math.round(parseFloat(cantidadHoras) * 60);
            if (isNaN(minutos) || minutos <= 0) {
                toast.error("Ingrese una cantidad válida");
                setLoading(false);
                return;
            }

            const result = await registrarMovimientoBanco({
                empleadoId: selectedEmpleadoId,
                fecha: new Date().toISOString().split('T')[0],
                tipo,
                origen: origen as any,
                cantidadMinutos: minutos,
                notas
            });

            if (result.success) {
                toast.success("Movimiento registrado");
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Error al registrar movimiento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajuste Manual - Banco de Horas</DialogTitle>
                    <DialogDescription>
                        Registra un abono o una deuda manualmente para corregir el saldo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Selector de Empleado si no viene predefinido */}
                    {!initialEmpleadoId && (
                        <div className="space-y-2">
                            <Label>Empleado</Label>
                            <Select value={selectedEmpleadoId} onValueChange={setSelectedEmpleadoId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar empleado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {empleados.map(emp => (
                                        <SelectItem key={emp.$id} value={emp.$id}>
                                            {emp.nombre} {emp.apellido}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={tipo} onValueChange={(v: 'ABONO' | 'DEUDA') => setTipo(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ABONO">Abono (Favor Empleado)</SelectItem>
                                    <SelectItem value="DEUDA">Deuda (Contra Empleado)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Origen</Label>
                            <Select value={origen} onValueChange={setOrigen}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AJUSTE_MANUAL">Ajuste Manual</SelectItem>
                                    <SelectItem value="HORA_EXTRA_CANJEADA">Canje Hora Extra</SelectItem>
                                    <SelectItem value="PERMISO_NO_REMUNERADO">Permiso No Remunerado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Cantidad (Horas)</Label>
                        <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            placeholder="Ej: 1.5 horas"
                            value={cantidadHoras}
                            onChange={e => setCantidadHoras(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            {cantidadHoras ? `${Math.round(parseFloat(cantidadHoras) * 60)} minutos` : 'Ingrese decimales (1.5 = 1h 30m)'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Notas</Label>
                        <Textarea
                            value={notas}
                            onChange={e => setNotas(e.target.value)}
                            placeholder="Razón del ajuste..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Registrar Ajuste"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
