"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { obtenerOrdenConDetalles } from "@/lib/actions/ordenes-trabajo";
import { OtConDetalles } from "@/types";
import { Loader2, Printer, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CotizacionPage() {
    const params = useParams();
    const [orden, setOrden] = useState<OtConDetalles | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadOrden() {
            try {
                const data = await obtenerOrdenConDetalles(params.id as string);
                setOrden(data);
            } catch (error) {
                console.error("Error cargando orden:", error);
            } finally {
                setLoading(false);
            }
        }
        loadOrden();
    }, [params.id]);

    useEffect(() => {
        if (orden && !loading) {
            // Auto-print after a short delay to ensure rendering
            setTimeout(() => {
                window.print();
            }, 1000);
        }
    }, [orden, loading]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!orden) {
        return <div className="p-8 text-center">Orden no encontrada</div>;
    }

    // Calcular totales de repuestos agrupados para la vista
    const repuestos = (orden.procesos as any[])?.flatMap(p => p.repuestos || []) || [];
    const totalRepuestos = repuestos.reduce((sum: number, r: any) => sum + r.subtotal, 0);

    // Calcular mano de obra
    const procesosConCosto = orden.procesos?.filter(p => p.costoManoObra > 0) || [];
    const totalManoObra = procesosConCosto.reduce((sum, p) => sum + p.costoManoObra, 0);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans print:p-0 p-8">
            {/* Toolbar No Imprimible */}
            <div className="print:hidden mb-8 max-w-4xl mx-auto flex justify-between items-center bg-slate-100 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Vista previa de impresión</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir / Guardar PDF
                    </Button>
                    {/* Futura funcionalidad de envío por correo */}
                    {/* <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar al Cliente
                    </Button> */}
                </div>
            </div>

            {/* Documento A4 */}
            <div className="max-w-4xl mx-auto bg-white print:max-w-none">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-8 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            {/* Logo Placeholder - idealmente usar una imagen real de la empresa */}
                            <div className="h-12 w-12 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                A
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">ALTIORA AUTOMOTRIZ</h1>
                                <p className="text-sm text-slate-500">Servicio Especializado</p>
                            </div>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p>NIT: 900.123.456-7</p>
                            <p>Calle 123 # 45-67, Bogotá</p>
                            <p>Taller: (601) 123 4567 | WhatsApp: 300 123 4567</p>
                            <p>contacto@altiora.com.co</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-light text-slate-300 mb-2">COTIZACIÓN</h2>
                        <div className="space-y-1">
                            <p className="text-lg font-semibold">#{orden.numeroOrden}</p>
                            <p className="text-sm text-slate-500">
                                Fecha: {new Date(orden.createdAt).toLocaleDateString('es-CO')}
                            </p>
                            <p className="text-sm text-slate-500">
                                Validez: 15 días
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Cliente</h3>
                        <div className="space-y-1 text-sm">
                            <p className="font-semibold text-lg">{orden.cliente?.nombre || "Consumidor Final"}</p>
                            <p>{(orden.cliente as any)?.documento || "CC no registrada"}</p>
                            <p>{orden.cliente?.telefono}</p>
                            <p>{orden.cliente?.direccion}, {orden.cliente?.ciudad}</p>
                            <p>{orden.cliente?.email}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Vehículo</h3>
                        <div className="space-y-1 text-sm bg-slate-50 p-4 rounded-lg border">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500">Marca / Modelo</p>
                                    <p className="font-semibold">{orden.vehiculo?.marca} {orden.vehiculo?.modelo}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Placa</p>
                                    <p className="font-semibold bg-yellow-100 px-2 py-0.5 rounded-sm inline-block border border-yellow-300 text-yellow-800">
                                        {orden.vehiculo?.placa}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Año</p>
                                    <p className="font-medium">{orden.vehiculo?.ano}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Kilometraje</p>
                                    <p className="font-medium">{orden.vehiculo?.kilometraje?.toLocaleString()} km</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Repuestos Table */}
                <div className="mb-10">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                        Repuestos y Materiales
                    </h3>
                    {repuestos.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="text-left py-3 font-semibold text-slate-600 pl-2">Descripción</th>
                                    <th className="text-center py-3 font-semibold text-slate-600">Cant.</th>
                                    <th className="text-right py-3 font-semibold text-slate-600">Unitario</th>
                                    <th className="text-right py-3 font-semibold text-slate-600 pr-2">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {repuestos.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-3 pl-2">{item.nombreRepuesto}</td>
                                        <td className="py-3 text-center text-slate-500">{item.cantidad}</td>
                                        <td className="py-3 text-right text-slate-500">${item.precioUnitario.toLocaleString('es-CO')}</td>
                                        <td className="py-3 text-right font-medium pr-2">${item.subtotal.toLocaleString('es-CO')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm text-slate-500 italic py-4 border-b">No se requieren repuestos.</p>
                    )}
                </div>

                {/* Mano de Obra Table */}
                <div className="mb-10">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                        Mano de Obra y Servicios
                    </h3>
                    {procesosConCosto.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="text-left py-3 font-semibold text-slate-600 pl-2">Descripción del Servicio</th>
                                    <th className="text-center py-3 font-semibold text-slate-600">Horas</th>
                                    <th className="text-right py-3 font-semibold text-slate-600 pr-2">Costo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {procesosConCosto.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-3 pl-2">
                                            <p className="font-medium text-slate-900">{item.nombre}</p>
                                            <p className="text-xs text-slate-500">{item.descripcion}</p>
                                        </td>
                                        <td className="py-3 text-center text-slate-500">{item.horasReales || item.horasEstimadas} h</td>
                                        <td className="py-3 text-right font-medium pr-2">${item.costoManoObra.toLocaleString('es-CO')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm text-slate-500 italic py-4 border-b">No hay cargos de mano de obra registrados.</p>
                    )}
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-16">
                    <div className="w-80 bg-slate-50 p-6 rounded-xl space-y-3">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal Repuestos</span>
                            <span>${totalRepuestos.toLocaleString('es-CO')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal Mano de Obra</span>
                            <span>${totalManoObra.toLocaleString('es-CO')}</span>
                        </div>
                        <div className="border-t border-slate-200 my-2"></div>

                        <div className="flex justify-between text-base font-medium text-slate-900">
                            <span>Subtotal Neto</span>
                            <span>${orden.subtotal.toLocaleString('es-CO')}</span>
                        </div>

                        {orden.aplicarIva && (
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>IVA ({orden.porcentajeIva}%)</span>
                                <span>${orden.impuestos.toLocaleString('es-CO')}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-300">
                            <span>Total</span>
                            <span>${orden.total.toLocaleString('es-CO')}</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Terms */}
                <div className="grid grid-cols-2 gap-12 mt-auto pt-12 border-t text-sm text-slate-500">
                    <div>
                        <h4 className="font-bold text-slate-700 mb-2">Términos y Condiciones</h4>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                            <li>La garantía de repuestos se limita a la ofrecida por el fabricante.</li>
                            <li>Los tiempos de entrega son estimados y pueden variar.</li>
                            <li>Todo trabajo adicional será notificado y requerirá aprobación.</li>
                        </ul>
                    </div>
                    <div className="text-center pt-8">
                        <div className="border-t border-slate-300 w-48 mx-auto mb-2"></div>
                        <p>Firma del Cliente / Aprobado</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
