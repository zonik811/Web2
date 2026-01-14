"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PedidoCatalogo, parseItems } from "@/types/pedidos-catalogo";
import { formatearPrecio } from "@/lib/utils";
import { subirArchivo } from "@/lib/appwrite";
import { toast } from "sonner";
import { Package, Truck, CreditCard, UploadCloud, AlertTriangle, RotateCcw, Calculator } from "lucide-react";

interface OrderStateModalsProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'confirmar' | 'pagar' | 'enviar' | 'corregir' | null;
    pedido: PedidoCatalogo | null;
    onConfirm: (data?: any) => Promise<void>;
}

export function OrderStateModals({ isOpen, onClose, type, pedido, onConfirm }: OrderStateModalsProps) {
    const [loading, setLoading] = useState(false);
    const [paymentFile, setPaymentFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        metodo_pago: 'transferencia',
        monto: pedido?.saldo_pendiente || 0,
        guia_envio: '',
        empresa_envio: '',
        notas: ''
    });

    if (!pedido || !type) return null;

    const items = parseItems(pedido.items);
    const saldoPendiente = pedido.saldo_pendiente > 0 ? pedido.saldo_pendiente : 0;
    const cambio = formData.monto > saldoPendiente ? formData.monto - saldoPendiente : 0;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            let data: any = {};

            if (type === 'pagar') {
                if (paymentFile) {
                    try {
                        const fileId = await subirArchivo(paymentFile);
                        data.comprobanteFileId = fileId;
                    } catch (e) {
                        toast.error("Error subiendo el comprobante");
                        setLoading(false);
                        return;
                    }
                }
                data.metodo_pago_id = formData.metodo_pago;
                data.monto = Number(formData.monto);
            }

            if (type === 'enviar') {
                if (!formData.guia_envio || !formData.empresa_envio) {
                    toast.error("Guía y Empresa son obligatorios");
                    setLoading(false);
                    return;
                }
                data.guia_envio = formData.guia_envio;
                data.empresa_envio = formData.empresa_envio;
                data.notas = formData.notas;
            }

            await onConfirm(data);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error procesando la acción");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {type === 'confirmar' && <><Package className="h-6 w-6 text-blue-600" /> Confirmar Pedido</>}
                        {type === 'pagar' && <><CreditCard className="h-6 w-6 text-green-600" /> Registrar Pago</>}
                        {type === 'enviar' && <><Truck className="h-6 w-6 text-purple-600" /> Enviar Pedido</>}
                        {type === 'corregir' && <><RotateCcw className="h-6 w-6 text-orange-600" /> Corregir Pedido</>}
                    </DialogTitle>
                    <DialogDescription>
                        {type === 'confirmar' && "Se descontará el stock de los siguientes productos:"}
                        {type === 'pagar' && "Registra un abono o pago total. El sistema calculará el saldo."}
                        {type === 'enviar' && "Ingresa los datos de rastreo para el cliente."}
                        {type === 'corregir' && "Regresar el pedido a estado 'Creado' devolverá el stock al inventario."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* CONFIRMACIÓN DE STOCK */}
                    {type === 'confirmar' && (
                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 text-slate-700">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Producto</th>
                                            <th className="px-3 py-2 text-right">Cant.</th>
                                            <th className="px-3 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-3 py-2">{item.nombre}</td>
                                                <td className="px-3 py-2 text-right font-bold">-{item.cantidad}</td>
                                                <td className="px-3 py-2 text-right text-slate-500">{formatearPrecio(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg text-sm border border-amber-100">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <p><strong>Advertencia:</strong> El stock se reducirá inmediatamente. Asegúrate de tener disponibilidad física.</p>
                            </div>
                        </div>
                    )}

                    {/* REGISTRO DE PAGO CON CALCULADORA */}
                    {type === 'pagar' && (
                        <>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 mb-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Total Pedido:</span>
                                    <span className="font-bold">{formatearPrecio(pedido.total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Ya Pagado:</span>
                                    <span className="text-emerald-600 font-bold">{formatearPrecio(pedido.monto_pagado)}</span>
                                </div>
                                <div className="flex justify-between text-base border-t border-slate-200 pt-2 mt-2">
                                    <span>Saldo Pendiente:</span>
                                    <span className="text-orange-600 font-black">{formatearPrecio(pedido.saldo_pendiente)}</span>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Monto Recibido</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        type="number"
                                        className="pl-9 font-bold text-lg"
                                        value={formData.monto}
                                        onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}
                                    />
                                </div>
                                {cambio > 0 && (
                                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-md text-sm font-bold animate-in fade-in slide-in-from-top-1">
                                        <Calculator className="h-4 w-4" />
                                        <span>Cambio a devolver: {formatearPrecio(cambio)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label>Método de Pago</Label>
                                <Select
                                    value={formData.metodo_pago}
                                    onValueChange={(val) => setFormData({ ...formData, metodo_pago: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="efectivo">Efectivo</SelectItem>
                                        <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                                        <SelectItem value="nequi">Nequi / Daviplata</SelectItem>
                                        <SelectItem value="tarjeta">Tarjeta de Crédito</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Comprobante (Opcional)</Label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                                    />
                                    <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
                                    <p className="text-xs font-medium text-slate-600">
                                        {paymentFile ? paymentFile.name : "Subir foto / PDF"}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ENVÍO */}
                    {type === 'enviar' && (
                        <>
                            <div className="grid gap-2">
                                <Label>Empresa de Transporte</Label>
                                <Input
                                    placeholder="Ej: Servientrega, Interrapidísimo"
                                    value={formData.empresa_envio}
                                    onChange={(e) => setFormData({ ...formData, empresa_envio: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Número de Guía / Rastreo</Label>
                                <Input
                                    placeholder="Ej: 123456789"
                                    value={formData.guia_envio}
                                    onChange={(e) => setFormData({ ...formData, guia_envio: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Notas Adicionales</Label>
                                <Textarea
                                    placeholder="Instrucciones para la entrega..."
                                    value={formData.notas}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {/* CORRECCIÓN / REVERSIÓN */}
                    {type === 'corregir' && (
                        <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-800 text-sm">
                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                    <RotateCcw className="h-4 w-4" /> ¿Regresar a borrador?
                                </h4>
                                <ul className="list-disc list-inside space-y-1 ml-1 opacity-90">
                                    <li>El estado cambiará de <strong>{pedido.estado}</strong> a <strong>creado</strong>.</li>
                                    <li>Se <strong>devolverá el stock</strong> reservado (si aplica).</li>
                                    <li>Podrás editar el pedido y volver a confirmarlo después.</li>
                                </ul>
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                                Usa esta opción si confirmaste por error o necesitas modificar los items.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading} className={`${type === 'corregir' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-slate-900 hover:bg-slate-800'} text-white`}>
                        {loading ? 'Procesando...' : type === 'corregir' ? 'Confirmar Corrección' : 'Confirmar Acción'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { DollarSign } from "lucide-react";
