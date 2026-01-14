"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign, Calendar, CreditCard, CheckCircle, AlertCircle,
    Banknote, Landmark, FileText, ArrowDownLeft
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { RegistrarPagoDialog } from "../dialogs/RegistrarPagoDialog";
import type { Factura } from "@/lib/actions/facturas";
import type { PagoCliente } from "@/lib/actions/pagos-clientes";

interface OrdenPagosProps {
    ordenId: string;
    factura: Factura | null;
    pagos: PagoCliente[];
    saldoPendiente: number;
}

const METODO_PAGO_ICONS: Record<string, any> = {
    efectivo: Banknote,
    tarjeta: CreditCard,
    transferencia: Landmark,
    cheque: FileText
};

const METODO_PAGO_LABELS: Record<string, string> = {
    efectivo: "Efectivo",
    tarjeta: "Tarjeta",
    transferencia: "Transferencia",
    cheque: "Cheque"
};

const METODO_PAGO_COLORS: Record<string, string> = {
    efectivo: "bg-green-100 text-green-600",
    tarjeta: "bg-purple-100 text-purple-600",
    transferencia: "bg-blue-100 text-blue-600",
    cheque: "bg-amber-100 text-amber-600"
};

export function OrdenPagos({ ordenId, factura, pagos, saldoPendiente }: OrdenPagosProps) {
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);

    const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
    const totalFactura = factura?.total || 0;
    const porcentajePagado = totalFactura > 0 ? (totalPagado / totalFactura) * 100 : 0;
    const esPagadoCompleto = saldoPendiente <= 0;

    const handleRefresh = () => {
        router.refresh();
    };

    if (!factura) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="p-4 bg-white rounded-full shadow-sm">
                    <FileText className="h-10 w-10 text-slate-300" />
                </div>
                <div className="text-center max-w-sm">
                    <h3 className="text-lg font-semibold text-slate-800">Factura no generada</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                        La factura se genera automáticamente cuando la orden pasa al estado <span className="font-medium text-slate-700">"Por Pagar"</span> o <span className="font-medium text-slate-700">"Completada"</span>.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Total Facturado */}
                <Card className="bg-slate-900 border-none text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FileText className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Total Facturado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${totalFactura.toLocaleString()}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Factura #{factura.numeroFactura}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Pagado */}
                <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <CheckCircle className="h-24 w-24 text-green-600" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Abonado / Pagado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">${totalPagado.toLocaleString()}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <Progress value={Math.min(porcentajePagado, 100)} className="h-1.5 bg-green-100" indicatorClassName="bg-green-600" />
                            <span className="text-xs font-medium text-green-700">{Math.round(porcentajePagado)}%</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Saldo Pendiente */}
                <Card className={`border-slate-200 shadow-sm relative overflow-hidden ${esPagadoCompleto ? "bg-green-50/50 border-green-100" : "bg-white"}`}>
                    <div className={`absolute top-0 right-0 p-4 opacity-5 ${esPagadoCompleto ? "opacity-10" : ""}`}>
                        <AlertCircle className={`h-24 w-24 ${esPagadoCompleto ? "text-green-600" : "text-amber-500"}`} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-sm font-medium ${esPagadoCompleto ? "text-green-600" : "text-amber-600"}`}>
                            Saldo Pendiente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${esPagadoCompleto ? "text-green-700" : "text-amber-600"}`}>
                            ${saldoPendiente.toLocaleString()}
                        </div>
                        <div className="mt-2">
                            {esPagadoCompleto ? (
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Completado
                                </Badge>
                            ) : (
                                <Button size="sm" onClick={() => setDialogOpen(true)} className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white border-none shadow-sm shadow-amber-200">
                                    <DollarSign className="h-3 w-3 mr-1" /> Registrar Pago
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Historial de Pagos */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <ArrowDownLeft className="h-5 w-5" />
                        Historial de Transacciones
                    </h3>
                </div>

                <Card className="border-0 shadow-sm bg-white overflow-hidden">
                    <div className="divide-y">
                        {pagos.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <div className="p-4 bg-slate-50 rounded-full mb-3">
                                    <DollarSign className="h-6 w-6 text-slate-300" />
                                </div>
                                <p className="text-sm font-medium text-slate-900">Sin pagos registrados</p>
                                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                                    Registra el primer abono o pago total para comenzar a saldar la factura.
                                </p>
                            </div>
                        ) : (
                            pagos.map((pago) => {
                                const Icon = METODO_PAGO_ICONS[pago.metodoPago2] || DollarSign;
                                const colorClass = METODO_PAGO_COLORS[pago.metodoPago2] || "bg-slate-100 text-slate-600";

                                return (
                                    <div key={pago.$id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${colorClass}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-semibold text-slate-900">{METODO_PAGO_LABELS[pago.metodoPago2] || pago.metodoPago2}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(pago.fecha), "PPP", { locale: es })}
                                                    </span>
                                                    {pago.comprobante && (
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="h-3 w-3" />
                                                            Ref: <span className="font-mono">{pago.comprobante}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                {pago.notas && (
                                                    <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border inline-block mt-1">
                                                        "{pago.notas}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-green-700">
                                                    +${pago.monto.toLocaleString()}
                                                </p>
                                                <Badge variant="outline" className="text-[10px] text-green-700 bg-green-50 border-green-200">
                                                    Confirmado
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>

            {/* Dialog */}
            <RegistrarPagoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                ordenId={ordenId}
                facturaId={factura.$id}
                saldoPendiente={saldoPendiente}
                onPagoRegistrado={handleRefresh}
            />
        </div>
    );
}
