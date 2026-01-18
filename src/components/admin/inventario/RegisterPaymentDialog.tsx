"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { registrarPagoCompra, obtenerPagosCompra } from "@/lib/actions/pagos-compras";
import { CompraProveedor } from "@/types/inventario";
import { formatearPrecio } from "@/lib/utils";

interface RegisterPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    compra: CompraProveedor | null;
    onSuccess: () => void;
}

export function RegisterPaymentDialog({ open, onOpenChange, compra, onSuccess }: RegisterPaymentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [maxAmount, setMaxAmount] = useState(0);

    // Form State
    const [monto, setMonto] = useState("");
    const [metodo, setMetodo] = useState("transferencia");
    const [referencia, setReferencia] = useState("");
    const [notas, setNotas] = useState("");
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (open && compra) {
            calculatePendingBalance();
            setMonto("");
            setReferencia("");
            setNotas("");
        }
    }, [open, compra]);

    const calculatePendingBalance = async () => {
        if (!compra) return;
        setCalculating(true);
        try {
            const pagos = await obtenerPagosCompra(compra.$id);
            const totalPagado = pagos.reduce((sum: number, p: any) => sum + (p.monto || 0), 0);
            const saldo = Math.max(0, compra.total - totalPagado);
            setMaxAmount(saldo);
            setMonto(saldo.toString()); // Default to full payment
        } catch (error) {
            console.error(error);
        } finally {
            setCalculating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!compra) return;

        const montoNum = parseFloat(monto);
        if (isNaN(montoNum) || montoNum <= 0) {
            toast.error("El monto debe ser mayor a 0");
            return;
        }

        if (montoNum > maxAmount + 100) { // Tiny buffer for floating point
            toast.error(`El monto excede el saldo pendiente (${formatearPrecio(maxAmount)})`);
            return;
        }

        setLoading(true);
        const res = await registrarPagoCompra({
            compra_id: compra.$id,
            monto: montoNum,
            fecha_pago: new Date(fecha).toISOString(),
            metodo_pago: metodo,
            referencia: referencia,
            notas: notas
        });
        setLoading(false);

        if (res.success) {
            toast.success("Pago registrado correctamente");
            onOpenChange(false);
            onSuccess();
        } else {
            toast.error("Error al registrar pago");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Pago</DialogTitle>
                    <DialogDescription>
                        Abono a la compra #{compra?.numeroCompra || compra?.$id.substring(0, 6)}
                    </DialogDescription>
                </DialogHeader>

                {calculating ? (
                    <div className="h-40 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <Label className="text-xs text-slate-500 uppercase">Saldo Pendiente</Label>
                            <div className="text-xl font-bold text-slate-800">{formatearPrecio(maxAmount)}</div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="monto">Monto a Pagar</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="monto"
                                    type="number"
                                    step="0.01"
                                    className="pl-9"
                                    value={monto}
                                    onChange={(e) => setMonto(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fecha">Fecha</Label>
                                <Input
                                    id="fecha"
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="metodo">Método</Label>
                                <Select value={metodo} onValueChange={setMetodo}>
                                    <SelectTrigger id="metodo">
                                        <SelectValue placeholder="Seleccione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                        <SelectItem value="transferencia">Transferencia</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="referencia">Referencia (Opcional)</Label>
                            <Input
                                id="referencia"
                                placeholder="Ej: Comprobante #1234"
                                value={referencia}
                                onChange={(e) => setReferencia(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notas">Notas</Label>
                            <Textarea
                                id="notas"
                                placeholder="Observaciones adicionales..."
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Registrar Pago
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
