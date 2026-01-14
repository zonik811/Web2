"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { crearComision } from "@/lib/actions/comisiones";
import type { Empleado } from "@/types";

interface RegistrarComisionDialogProps {
    ordenId: string;
    empleados: Empleado[];
    onComisionCreated: () => void;
}

export function RegistrarComisionDialog({
    ordenId,
    empleados,
    onComisionCreated
}: RegistrarComisionDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        empleadoId: "",
        monto: 0,
        concepto: "",
        observaciones: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await crearComision({
                empleadoId: formData.empleadoId,
                monto: formData.monto,
                concepto: formData.concepto,
                fecha: new Date().toISOString(),
                ordenTrabajoId: ordenId,
                observaciones: formData.observaciones
            });

            if (result.success) {
                setFormData({
                    empleadoId: "",
                    monto: 0,
                    concepto: "",
                    observaciones: ""
                });
                setOpen(false);
                onComisionCreated();
            } else {
                alert("Error al registrar comisión: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    Registrar Comisión
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Comisión Manual</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="empleado">Empleado *</Label>
                        <Select
                            value={formData.empleadoId}
                            onValueChange={val => setFormData({ ...formData, empleadoId: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un empleado" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {empleados.map((empleado) => (
                                    <SelectItem key={empleado.$id} value={empleado.$id}>
                                        {empleado.nombre} - {empleado.cargo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="monto">Monto (COP) *</Label>
                        <Input
                            id="monto"
                            type="number"
                            min="0"
                            step="1000"
                            value={formData.monto}
                            onChange={e => setFormData({ ...formData, monto: Number(e.target.value) })}
                            placeholder="50000"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="concepto">Concepto *</Label>
                        <Input
                            id="concepto"
                            value={formData.concepto}
                            onChange={e => setFormData({ ...formData, concepto: e.target.value })}
                            placeholder="Ej: Captación de cliente, referencia..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Textarea
                            id="observaciones"
                            value={formData.observaciones}
                            onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                            placeholder="Detalles adicionales..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || !formData.empleadoId}>
                            {loading ? "Guardando..." : "Registrar Comisión"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
