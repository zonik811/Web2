"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, AlertCircle } from "lucide-react";
import { registrarPago } from "@/lib/actions/pagos-clientes";

interface RegistrarPagoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ordenId: string;
    facturaId?: string;
    saldoPendiente: number;
    onPagoRegistrado: () => void;
}

export function RegistrarPagoDialog({
    open,
    onOpenChange,
    ordenId,
    facturaId,
    saldoPendiente,
    onPagoRegistrado
}: RegistrarPagoDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        monto: 0,
        metodoPago2: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque',
        fecha: new Date().toISOString().split('T')[0], // Default to today
        referencia: "",
        observaciones: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.monto <= 0) {
            alert("El monto debe ser mayor a 0");
            return;
        }

        if (formData.monto > saldoPendiente) {
            alert(`El monto no puede ser mayor al saldo pendiente ($${saldoPendiente.toLocaleString()})`);
            return;
        }

        setLoading(true);

        try {
            const result = await registrarPago({
                ordenTrabajoId: ordenId,
                facturaId: facturaId,
                monto: formData.monto,
                metodoPago2: formData.metodoPago2,
                referencia: formData.referencia,
                observaciones: formData.observaciones,
                fecha: new Date(formData.fecha).toISOString()
            });

            if (result.success) {
                setFormData({
                    monto: 0,
                    metodoPago2: 'efectivo',
                    fecha: new Date().toISOString().split('T')[0],
                    referencia: "",
                    observaciones: ""
                });
                onPagoRegistrado();
                onOpenChange(false);
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    const pagoCompleto = formData.monto >= saldoPendiente;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Pago</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Saldo pendiente: <strong>${saldoPendiente.toLocaleString()}</strong>
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="monto">Monto a Pagar (COP) *</Label>
                        <Input
                            id="monto"
                            type="number"
                            min="0"
                            max={saldoPendiente}
                            step="1"
                            value={formData.monto || ""}
                            onChange={e => setFormData({ ...formData, monto: Number(e.target.value) })}
                            placeholder="0"
                            required
                        />
                        {pagoCompleto && formData.monto > 0 && (
                            <p className="text-sm text-green-600 font-medium">
                                ✓ Pago completo - La orden podrá ser marcada como COMPLETADA
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="metodoPago">Método de Pago *</Label>
                        <Select
                            value={formData.metodoPago2}
                            onValueChange={(val: any) => setFormData({ ...formData, metodoPago2: val })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                                <SelectItem value="tarjeta">💳 Tarjeta</SelectItem>
                                <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
                                <SelectItem value="cheque">📄 Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fecha">Fecha de Pago</Label>
                        <Input
                            id="fecha"
                            type="date"
                            value={formData.fecha}
                            onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="referencia">Referencia/Número de Transacción</Label>
                        <Input
                            id="referencia"
                            value={formData.referencia}
                            onChange={e => setFormData({ ...formData, referencia: e.target.value })}
                            placeholder="Ej: 123456789"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Textarea
                            id="observaciones"
                            value={formData.observaciones}
                            onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                            placeholder="Notas adicionales..."
                            rows={2}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || formData.monto <= 0}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            {loading ? "Registrando..." : "Registrar Pago"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
