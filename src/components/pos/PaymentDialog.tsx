"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, CreditCard, Banknote, CheckCircle2, AlertTriangle, Loader2, Landmark } from "lucide-react";
import { formatearPrecio } from "@/lib/utils";
import { procesarVenta } from "@/lib/actions/ventas-pos";
import type { ClientePOS } from "@/lib/actions/clientes-pos";


interface PaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    items: any[];
    turnoId: string;
    userId: string;
    customer?: ClientePOS | null;
    onSuccess: () => void;
}

export function PaymentDialog({ isOpen, onClose, total, items, turnoId, userId, customer, onSuccess }: PaymentDialogProps) {
    const [method, setMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
    const [detail, setDetail] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [change, setChange] = useState(0);

    const tax = total * 0.19; // 19% IVA assumed
    const totalWithTax = total + tax;

    useEffect(() => {
        if (isOpen) {
            setAmount("");
            setChange(0);
            setError("");
            setMethod('efectivo');
            setDetail("");
        }
    }, [isOpen]);

    useEffect(() => {
        if (method === 'efectivo') {
            const val = parseFloat(amount) || 0;
            setChange(val - totalWithTax);
        } else {
            setChange(0);
            setAmount(totalWithTax.toString()); // Auto-fill amount for non-cash
        }
        setDetail(""); // Reset detail on method change
    }, [amount, totalWithTax, method]);

    const handleQuickCash = (val: number) => {
        setAmount(val.toString());
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            const payAmount = parseFloat(amount) || 0;

            if (method === 'efectivo' && payAmount < totalWithTax) {
                throw new Error("El monto recibido es menor al total.");
            }

            if ((method === 'tarjeta' || method === 'transferencia') && !detail) {
                throw new Error("Por favor selecciona el tipo de " + (method === 'tarjeta' ? "tarjeta" : "banco"));
            }

            const saleData = {
                turno_id: turnoId,
                total: totalWithTax,
                subtotal: total,
                impuestos: tax,
                metodo_pago: method,
                metodo_pago_detalle: detail,
                items: items,
                usuario_id: userId,
                monto_recibido: payAmount,
                cambio: method === 'efectivo' ? (payAmount - totalWithTax) : 0,
                cliente_id: customer?.$id,
                cliente_nombre: customer?.nombre || "Cliente Mostrador",
                cliente_telefono: customer?.telefono || "0000000000",
                cliente_email: customer?.email || "venta@pos.com"
            };

            const res = await procesarVenta(saleData);
            if (!res.success) throw new Error(res.error as string);

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Error al procesar la venta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        Cobrar Venta
                    </DialogTitle>
                </DialogHeader>

                <div className="py-2">
                    <div className="bg-slate-50 p-4 rounded-xl mb-4 flex justify-between items-center border border-slate-200 shadow-sm">
                        <span className="text-slate-500 font-medium">Total a Pagar</span>
                        <span className="text-3xl font-black text-slate-900">{formatearPrecio(totalWithTax)}</span>
                    </div>

                    <Tabs value={method} onValueChange={(v: any) => setMethod(v)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
                            <TabsTrigger value="efectivo" className="text-base">Efectivo</TabsTrigger>
                            <TabsTrigger value="tarjeta" className="text-base">Tarjeta</TabsTrigger>
                            <TabsTrigger value="transferencia" className="text-base text-xs md:text-base">Transferencia</TabsTrigger>
                        </TabsList>

                        <div className="space-y-4">
                            {/* --- EFECTIVO --- */}
                            {method === 'efectivo' && (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-base">Monto Recibido</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <Input
                                                className="pl-10 h-14 text-2xl font-bold text-slate-900"
                                                placeholder="0"
                                                type="number"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        {[2000, 5000, 10000, 20000, 50000, 100000].map(val => (
                                            <Button
                                                key={val}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleQuickCash(val)}
                                                className="text-xs font-semibold text-slate-600"
                                            >
                                                {formatearPrecio(val)}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleQuickCash(totalWithTax)}
                                            className="text-xs font-bold text-emerald-700 border-emerald-200 bg-emerald-50"
                                        >
                                            Exacto
                                        </Button>
                                    </div>

                                    {change >= 0 ? (
                                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex justify-between items-center mt-4">
                                            <span className="text-emerald-700 font-semibold">Cambio / Vuelto</span>
                                            <span className="text-2xl font-bold text-emerald-800">{formatearPrecio(change)}</span>
                                        </div>
                                    ) : (amount &&
                                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2 text-red-700 text-sm">
                                            <AlertTriangle className="h-4 w-4" />
                                            Falta dinero para completar el pago
                                        </div>
                                    )}
                                </>
                            )}

                            {/* --- TARJETA --- */}
                            {method === 'tarjeta' && (
                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                    <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-4">
                                        <Landmark className="h-4 w-4" />
                                        <AlertDescription className="font-medium">
                                            Próximamente conexión a Bold Datafono
                                        </AlertDescription>
                                    </Alert>

                                    <Label>Selecciona Franquicia</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Visa', 'Mastercard', 'Amex', 'Diners', 'Debito'].map((type) => (
                                            <div
                                                key={type}
                                                onClick={() => setDetail(type)}
                                                className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${detail === type
                                                    ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900 ring-offset-2'
                                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                                    }`}
                                            >
                                                <CreditCard className="h-6 w-6" />
                                                <span className="text-sm font-bold">{type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- TRANSFERENCIA --- */}
                            {method === 'transferencia' && (
                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                    <Label>Selecciona Banco / Billetera</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Bancolombia', 'Nequi', 'Daviplata', 'Davivienda', 'BBVA', 'Otros'].map((bank) => (
                                            <div
                                                key={bank}
                                                onClick={() => setDetail(bank)}
                                                className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all ${detail === bank
                                                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-600 ring-offset-2'
                                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                                    }`}
                                            >
                                                <div className="bg-white/20 p-2 rounded-full">
                                                    <Banknote className="h-5 w-5" />
                                                </div>
                                                <span className="font-bold">{bank}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </Tabs>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg animate-in slide-in-from-top-2">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" className="h-12 text-lg" onClick={onClose}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || (method === 'efectivo' && change < 0) || ((method === 'tarjeta' || method === 'transferencia') && !detail)}
                        className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg px-8 shadow-lg shadow-emerald-500/20 w-full sm:w-auto"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Confirmar Pago'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
