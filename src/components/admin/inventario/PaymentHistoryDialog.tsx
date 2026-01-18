"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { obtenerPagosCompra } from "@/lib/actions/pagos-compras";
import { CompraProveedor, PagoCompra } from "@/types/inventario";
import { Loader2, Receipt } from "lucide-react";
import { formatearPrecio } from "@/lib/utils";

interface PaymentHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    compra: CompraProveedor | null;
}

export function PaymentHistoryDialog({ open, onOpenChange, compra }: PaymentHistoryDialogProps) {
    const [pagos, setPagos] = useState<PagoCompra[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && compra) {
            cargarPagos();
        }
    }, [open, compra]);

    const cargarPagos = async () => {
        if (!compra) return;
        setLoading(true);
        try {
            const data = await obtenerPagosCompra(compra.$id);
            // Cast or validate data roughly matches PagoCompra
            setPagos(data as unknown as PagoCompra[]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
    const saldoPendiente = compra ? compra.total - totalPagado : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-blue-500" />
                        Historial de Pagos
                    </DialogTitle>
                    <DialogDescription>
                        Compra #{compra?.numeroCompra || compra?.$id.substring(0, 8)} - {compra?.proveedorNombre || 'Proveedor'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium uppercase">Total Compra</p>
                        <p className="text-lg font-bold text-slate-800">{formatearPrecio(compra?.total || 0)}</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <p className="text-xs text-emerald-600 font-medium uppercase">Total Pagado</p>
                        <p className="text-lg font-bold text-emerald-700">{formatearPrecio(totalPagado)}</p>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                        <p className="text-xs text-rose-600 font-medium uppercase">Saldo Pendiente</p>
                        <p className="text-lg font-bold text-rose-700">{formatearPrecio(saldoPendiente)}</p>
                    </div>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Ref.</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                                    </TableCell>
                                </TableRow>
                            ) : pagos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                        No hay pagos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pagos.map((pago) => (
                                    <TableRow key={pago.$id}>
                                        <TableCell>
                                            {format(new Date(pago.fecha_pago), "d MMM yyyy", { locale: es })}
                                        </TableCell>
                                        <TableCell className="capitalize">{pago.metodo_pago}</TableCell>
                                        <TableCell className="text-xs text-slate-500 truncate max-w-[100px]">
                                            {pago.referencia || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatearPrecio(pago.monto)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
