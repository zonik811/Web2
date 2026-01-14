"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign, Package, Wrench, Calculator,
    TrendingUp, FileText, Receipt, AlertCircle,
    PieChart, CreditCard, Wallet
} from "lucide-react";
import type { OrdenTrabajo } from "@/types";
import { useState } from "react";
import { actualizarCostosOrden } from "@/lib/actions/ordenes-trabajo";
import { useRouter } from "next/navigation";

interface OrdenCostosProps {
    orden: OrdenTrabajo;
    repuestosUsados?: any[];
    procesos?: any[];
}

export function OrdenCostos({ orden, repuestosUsados = [], procesos = [] }: OrdenCostosProps) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);

    // 1. Unificar Repuestos: Si no se pasan explícitamente, extraerlos de los procesos
    const listaRepuestos = repuestosUsados.length > 0
        ? repuestosUsados
        : procesos.flatMap(p => p.repuestos || []);

    // 2. Calcular Totales
    const totalRepuestos = listaRepuestos.reduce((sum, r) => sum + r.subtotal, 0);
    const totalManoObra = procesos.reduce((sum, p) => sum + p.costoManoObra, 0);
    const subtotalCalculado = totalRepuestos + totalManoObra;
    const impuestosCalculados = orden.aplicarIva ? subtotalCalculado * (orden.porcentajeIva / 100) : 0;
    const totalCalculado = subtotalCalculado + impuestosCalculados;

    // 3. Calcular Porcentajes para Gráficos
    const percentManoObra = subtotalCalculado > 0 ? (totalManoObra / subtotalCalculado) * 100 : 0;
    const percentRepuestos = subtotalCalculado > 0 ? (totalRepuestos / subtotalCalculado) * 100 : 0;

    const handleRecalcular = async () => {
        if (!confirm("¿Deseas actualizar el total de la orden con estos valores?")) return;
        setIsUpdating(true);
        try {
            const result = await actualizarCostosOrden(orden.$id, subtotalCalculado, orden.aplicarIva, orden.porcentajeIva);
            if (result.success) {
                router.refresh();
                // Opcional: Mostrar toast de éxito
            } else {
                alert("Error al actualizar: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error al recalcular costos");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-300 text-sm font-medium mb-1">Total Estimado</p>
                                <h3 className="text-3xl font-bold">${totalCalculado.toLocaleString('es-CO')}</h3>
                            </div>
                            <div className="bg-white/10 p-2 rounded-lg">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
                            <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">COP</span>
                            <span>Moneda Local</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium mb-1">Subtotal (Neto)</p>
                                <h3 className="text-2xl font-bold text-slate-900">${subtotalCalculado.toLocaleString('es-CO')}</h3>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <Wallet className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground">
                            Antes de impuestos
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium mb-1">Impuestos (IVA)</p>
                                <h3 className="text-2xl font-bold text-slate-900">${impuestosCalculados.toLocaleString('es-CO')}</h3>
                            </div>
                            <div className="bg-purple-50 p-2 rounded-lg">
                                <Receipt className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground flex gap-2 items-center">
                            <span>Tasa: </span>
                            <Badge variant="outline" className="text-[10px] h-5">{orden.porcentajeIva}%</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Distribution Graph */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                        Distribución de Costos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                            className="h-full bg-blue-500 transition-all duration-1000"
                            style={{ width: `${percentManoObra}%` }}
                            title={`Mano de Obra: ${Math.round(percentManoObra)}%`}
                        />
                        <div
                            className="h-full bg-orange-400 transition-all duration-1000"
                            style={{ width: `${percentRepuestos}%` }}
                            title={`Repuestos: ${Math.round(percentRepuestos)}%`}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                            <span className="text-muted-foreground">Mano de Obra ({Math.round(percentManoObra)}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-orange-400" />
                            <span className="text-muted-foreground">Repuestos ({Math.round(percentRepuestos)}%)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Detailed List (Spain 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Desglose Detallado
                        </h3>
                    </div>

                    <div className="bg-white rounded-xl border shadow-sm divide-y">
                        {/* Mano de Obra Section Header */}
                        <div className="p-4 bg-slate-50 flex items-center gap-2 font-medium text-slate-700">
                            <Wrench className="h-4 w-4" />
                            <span>Mano de Obra y Servicios</span>
                        </div>
                        {procesos.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm italic">
                                No hay procesos de mano de obra registrados.
                            </div>
                        ) : (
                            procesos.map((proceso) => (
                                <div key={proceso.$id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                    <div className="flex gap-3">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">{proceso.nombre}</p>
                                            <p className="text-xs text-muted-foreground">{proceso.descripcion || 'Sin descripción'}</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-slate-700">
                                        ${proceso.costoManoObra.toLocaleString('es-CO')}
                                    </span>
                                </div>
                            ))
                        )}

                        {/* Repuestos Section Header */}
                        <div className="p-4 bg-slate-50 flex items-center gap-2 font-medium text-slate-700 border-t">
                            <Package className="h-4 w-4" />
                            <span>Repuestos e Insumos</span>
                        </div>
                        {listaRepuestos.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm italic">
                                No hay repuestos registrados.
                            </div>
                        ) : (
                            listaRepuestos.map((repuesto) => (
                                <div key={repuesto.$id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                    <div className="flex gap-3">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-orange-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">{repuesto.nombreRepuesto}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-slate-100/50">
                                                    Cant: {repuesto.cantidad}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">Unitario: ${Math.round(repuesto.subtotal / repuesto.cantidad).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-slate-700">
                                        ${repuesto.subtotal.toLocaleString('es-CO')}
                                    </span>
                                </div>
                            ))
                        )}

                        {/* Summary Footer in List */}
                        <div className="p-4 bg-slate-50/50 flex justify-end gap-6 text-sm border-t">
                            <div className="text-right">
                                <p className="text-muted-foreground">Total Servicios</p>
                                <p className="font-semibold">${totalManoObra.toLocaleString('es-CO')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-muted-foreground">Total Repuestos</p>
                                <p className="font-semibold">${totalRepuestos.toLocaleString('es-CO')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Calculations & Actions */}
                <div className="space-y-6">
                    {/* Tax Settings Card */}
                    <Card>
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calculator className="h-4 w-4" />
                                Configuración Fiscal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm">Aplicar IVA</Label>
                                    <p className="text-xs text-muted-foreground">Impuesto al valor agregado</p>
                                </div>
                                <Switch checked={orden.aplicarIva} disabled />
                            </div>
                            {orden.aplicarIva && (
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                                    <span className="text-sm font-medium">Porcentaje</span>
                                    <span className="font-mono text-sm">{orden.porcentajeIva}%</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Summary Receipt Card */}
                    <Card className="border-t-4 border-t-primary shadow-md overflow-hidden">
                        <CardHeader className="bg-slate-50 pb-6 border-b border-dashed">
                            <div className="text-center">
                                <div className="mx-auto w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center mb-3">
                                    <Receipt className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-lg">Resumen de Cuenta</CardTitle>
                                <CardDescription>Orden #{orden.numeroOrden || orden.$id.substring(0, 6)}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">${subtotalCalculado.toLocaleString('es-CO')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">IVA ({orden.aplicarIva ? orden.porcentajeIva : 0}%)</span>
                                <span className="font-medium">${impuestosCalculados.toLocaleString('es-CO')}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">${totalCalculado.toLocaleString('es-CO')}</span>
                            </div>

                            {Math.abs(orden.total - totalCalculado) > 1 && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-amber-700">Diferencia Detectada</p>
                                        <p className="text-xs text-amber-600">
                                            El total guardado (${orden.total.toLocaleString()}) difiere del calculado actual.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 bg-slate-50/50 pt-6">
                            <Button
                                className="w-full"
                                onClick={handleRecalcular}
                                disabled={isUpdating || Math.abs(orden.total - totalCalculado) <= 1}
                                variant={Math.abs(orden.total - totalCalculado) > 1 ? "default" : "outline"}
                            >
                                {isUpdating ? "Actualizando..." : "Actualizar Total Orden"}
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => window.open(`/admin/ordenes/${orden.$id}/cotizacion`, '_blank')}>
                                <FileText className="mr-2 h-4 w-4" />
                                Ver Cotización PDF
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
