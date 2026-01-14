"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PedidoCatalogo, parseItems } from "@/types/pedidos-catalogo";
import { formatearPrecio } from "@/lib/utils";
import { Package, Truck, CreditCard, User, MapPin, FileText, Calendar, ExternalLink } from "lucide-react";
import Image from "next/image";

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    pedido: PedidoCatalogo | null;
}

export function OrderDetailModal({ isOpen, onClose, pedido }: OrderDetailModalProps) {
    if (!pedido) return null;

    const items = parseItems(pedido.items);

    const estadoBadgeColor = (estado: string) => {
        const colors: Record<string, string> = {
            creado: 'bg-slate-100 text-slate-700',
            confirmado: 'bg-blue-100 text-blue-700',
            pagado: 'bg-emerald-100 text-emerald-700',
            enviado: 'bg-purple-100 text-purple-700',
            completado: 'bg-green-100 text-green-700',
            cancelado: 'bg-red-100 text-red-700'
        };
        return colors[estado] || 'bg-slate-100 text-slate-700';
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <span>Pedido {pedido.numero_pedido}</span>
                            <Badge className={`${estadoBadgeColor(pedido.estado)} text-sm`}>
                                {pedido.estado}
                            </Badge>
                        </DialogTitle>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(pedido.fecha_creacion).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' })}
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* INFO CLIENTE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" /> Cliente
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-semibold">Nombre:</span> {pedido.cliente_nombre}</p>
                                <p><span className="font-semibold">Teléfono:</span> {pedido.cliente_telefono}</p>
                                <p><span className="font-semibold">Email:</span> {pedido.cliente_email || 'No registrado'}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Entrega
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="whitespace-pre-wrap">{pedido.direccion_envio || 'Recogida en tienda'}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* PRODUCTOS */}
                    <div>
                        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4" /> Productos ({items.length})
                        </h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Producto</th>
                                        <th className="px-4 py-2 text-center">Cant.</th>
                                        <th className="px-4 py-2 text-right">Precio</th>
                                        <th className="px-4 py-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2">{item.nombre}</td>
                                            <td className="px-4 py-2 text-center">{item.cantidad}</td>
                                            <td className="px-4 py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
                                            <td className="px-4 py-2 text-right font-medium">{formatearPrecio(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50 font-bold">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2 text-right text-slate-600">Total Pedido:</td>
                                        <td className="px-4 py-2 text-right text-lg text-purple-700">{formatearPrecio(pedido.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* INFO PAGO */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
                        <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" /> Información de Pago
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Método:</span>
                                    <span className="font-medium capitalize">{pedido.metodo_pago_id || 'No definido'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Total Pagado:</span>
                                    <span className="font-bold text-emerald-600">{formatearPrecio(pedido.monto_pagado)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Saldo Pendiente:</span>
                                    <span className="font-bold text-orange-600">{formatearPrecio(pedido.saldo_pendiente)}</span>
                                </div>
                            </div>
                            <div>
                                {pedido.comprobante_url ? (
                                    <a
                                        href={pedido.comprobante_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center h-full border-2 border-dashed border-emerald-200 rounded-lg p-2 hover:bg-emerald-100/50 transition-colors cursor-pointer group"
                                    >
                                        <FileText className="h-6 w-6 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-medium text-emerald-700">Ver Comprobante</span>
                                    </a>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-200 rounded-lg p-2 text-slate-400">
                                        <span className="text-xs">Sin comprobante</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* INFO ENVÍO */}
                    {(pedido.estado === 'enviado' || pedido.estado === 'completado' || pedido.guia_envio) && (
                        <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-4">
                            <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                                <Truck className="h-4 w-4" /> Información de Envío
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                <div className="flex justify-between border-b border-purple-100 pb-1">
                                    <span className="text-slate-600">Empresa:</span>
                                    <span className="font-medium">{pedido.empresa_envio || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-purple-100 pb-1">
                                    <span className="text-slate-600">Guía / Rastreo:</span>
                                    <span className="font-bold text-purple-700 font-mono tracking-wider">{pedido.guia_envio || 'N/A'}</span>
                                </div>
                                {pedido.notas && (
                                    <div className="col-span-1 md:col-span-2 mt-2 pt-2">
                                        <span className="text-slate-600 block mb-1">Notas de Envío:</span>
                                        <p className="bg-white p-2 rounded text-slate-700 italic border border-purple-100">
                                            {pedido.notas}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Cerrar Detalle</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
