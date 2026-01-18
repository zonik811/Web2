"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    ShoppingBag,
    DollarSign,
    Clock,
    CheckCircle,
    Search,
    ArrowLeft,
    Eye,
    Package
} from "lucide-react";
import { obtenerPedidos, cambiarEstadoPedido, registrarPago } from "@/lib/actions/pedidos-catalogo";
import { PedidoCatalogo, EstadoPedido, parseItems } from "@/types/pedidos-catalogo";
import { formatearPrecio } from "@/lib/utils";
import Link from "next/link";
import { OrderStateModals } from "@/components/admin/orders/OrderStateModals";
import { OrderDetailModal } from "@/components/admin/orders/OrderDetailModal";
import { toast } from "sonner";
import { ExportExcelButton } from "@/components/ui/ExportExcelButton";

export default function PedidosCatalogoPage() {
    const [pedidos, setPedidos] = useState<PedidoCatalogo[]>([]);
    const [filteredPedidos, setFilteredPedidos] = useState<PedidoCatalogo[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");

    useEffect(() => {
        loadPedidos();
    }, []);

    useEffect(() => {
        filterPedidos();
    }, [pedidos, search, estadoFiltro]);

    const loadPedidos = async () => {
        setLoading(true);
        const data = await obtenerPedidos();
        setPedidos(data);
        setLoading(false);
    };

    const filterPedidos = () => {
        let filtered = [...pedidos];

        if (search) {
            filtered = filtered.filter(p =>
                p.numero_pedido.toLowerCase().includes(search.toLowerCase()) ||
                p.cliente_nombre.toLowerCase().includes(search.toLowerCase()) ||
                p.cliente_telefono.includes(search)
            );
        }

        if (estadoFiltro !== "todos") {
            filtered = filtered.filter(p => p.estado === estadoFiltro);
        }

        setFilteredPedidos(filtered);
    };

    // Estado para modales de acción
    const [modalData, setModalData] = useState<{
        isOpen: boolean;
        type: 'confirmar' | 'pagar' | 'enviar' | 'corregir' | null;
        pedido: PedidoCatalogo | null;
    }>({ isOpen: false, type: null, pedido: null });

    // Estado para modal de detalle
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState<PedidoCatalogo | null>(null);

    const handleActionClick = (pedido: PedidoCatalogo, action: 'confirmar' | 'pagar' | 'enviar' | 'cancelar' | 'completar' | 'corregir') => {
        if (action === 'cancelar' || action === 'completar') {
            handleCambiarEstado(pedido.$id, action === 'cancelar' ? 'cancelado' : 'completado');
            return;
        }
        setModalData({ isOpen: true, type: action, pedido });
    };

    const handleViewDetail = (pedido: PedidoCatalogo) => {
        setSelectedPedido(pedido);
        setDetailModalOpen(true);
    };

    const handleModalConfirm = async (data?: any) => {
        if (!modalData.pedido || !modalData.type) return;

        let nuevoEstado: EstadoPedido = 'creado';
        let promise;

        if (modalData.type === 'confirmar') nuevoEstado = 'confirmado';
        if (modalData.type === 'enviar') nuevoEstado = 'enviado';
        if (modalData.type === 'corregir') nuevoEstado = 'creado';

        if (modalData.type === 'pagar') {
            // Pagar usa registrarPago
            promise = registrarPago(
                modalData.pedido.$id,
                data.monto,
                data.metodo_pago_id,
                'admin',
                data.comprobanteFileId
            );
        } else {
            // Confirmar, Enviar y Corregir usan cambiarEstadoPedido
            promise = cambiarEstadoPedido(modalData.pedido.$id, nuevoEstado, 'admin', data);
        }

        const result = await promise;

        if (result.success) {
            toast.success(result.message);
            loadPedidos();
        } else {
            toast.error("Error: " + result.message);
        }
    };

    const handleCambiarEstado = async (pedidoId: string, nuevoEstado: EstadoPedido) => {
        if (!confirm(`¿Cambiar el estado a "${nuevoEstado}"?`)) return;

        const result = await cambiarEstadoPedido(pedidoId, nuevoEstado, 'admin');
        if (result.success) {
            toast.success(result.message);
            loadPedidos();
        } else {
            toast.error('Error: ' + result.message);
        }
    };

    // KPIs CORREGIDOS: Excluyen pedidos 'cancelado'
    const totalVentas = pedidos
        .filter(p => p.estado !== 'cancelado')
        .reduce((sum, p) => sum + p.total, 0);

    const pedidosPendientes = pedidos
        .filter(p => !['completado', 'cancelado'].includes(p.estado)).length;

    // Ventas cobradas (lo que realmente entró) - Opcional, si se quisiera mostrar lo cobrado real
    // const montoNetoVentas = pedidos
    //    .filter(p => p.estado !== 'cancelado')
    //    .reduce((sum, p) => sum + p.monto_pagado, 0);

    const porCobrar = pedidos
        .filter(p => p.estado !== 'cancelado')
        .reduce((sum, p) => sum + p.saldo_pendiente, 0);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-50 p-8">
            <OrderStateModals
                isOpen={modalData.isOpen}
                onClose={() => setModalData({ ...modalData, isOpen: false })}
                type={modalData.type}
                pedido={modalData.pedido}
                onConfirm={handleModalConfirm}
            />

            <OrderDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                pedido={selectedPedido}
            />

            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <Link href="/admin/inventario">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver
                                </Button>
                            </Link>
                        </div>
                        <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Pedidos del Catálogo
                        </h1>
                        <p className="text-slate-600 mt-2 text-lg">
                            Gestión completa de pedidos online
                        </p>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="border-2 border-purple-100 overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-purple-50 to-blue-50 border-b pb-3">
                            <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-purple-600" />
                                Total Pedidos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-purple-600">{pedidos.length}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-100 overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50 border-b pb-3">
                            <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                                Ventas Totales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-blue-600">{formatearPrecio(totalVentas)}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-orange-100 overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-orange-50 to-yellow-50 border-b pb-3">
                            <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                Pendientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-orange-600">{pedidosPendientes}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-emerald-100 overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-emerald-50 to-green-50 border-b pb-3">
                            <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                Por Cobrar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-emerald-600">{formatearPrecio(porCobrar)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <Card className="mb-6 border-2 border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Buscar por número, cliente o teléfono..."
                                    className="pl-12 h-12 border-2"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                                <SelectTrigger className="w-full md:w-64 h-12 border-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos los Estados</SelectItem>
                                    <SelectItem value="creado">Creado</SelectItem>
                                    <SelectItem value="confirmado">Confirmado</SelectItem>
                                    <SelectItem value="pagado">Pagado</SelectItem>
                                    <SelectItem value="enviado">Enviado</SelectItem>
                                    <SelectItem value="completado">Completado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de Pedidos */}
                <Card className="border-0 shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 border-b-2 border-purple-200 flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                            Listado de Pedidos ({filteredPedidos.length})
                        </CardTitle>
                        <ExportExcelButton
                            data={filteredPedidos}
                            fileName="Reporte_Ventas_Catalogo"
                            mapData={(p) => ({
                                Pedido: p.numero_pedido,
                                Cliente: p.cliente_nombre,
                                Telefono: p.cliente_telefono,
                                Fecha: new Date(p.fecha_creacion).toLocaleDateString() + ' ' + new Date(p.fecha_creacion).toLocaleTimeString(),
                                Estado: p.estado,
                                Total: p.total,
                                Pagado: p.monto_pagado,
                                Saldo: p.saldo_pendiente,
                                Cantidad_Items: parseItems(p.items).length
                            })}
                            className="bg-white/80 hover:bg-white text-purple-700 border-purple-200 shadow-sm h-9"
                        />
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Package className="h-12 w-12 animate-pulse text-purple-600" />
                            </div>
                        ) : filteredPedidos.length === 0 ? (
                            <div className="text-center py-16">
                                <Package className="h-20 w-20 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-600 text-lg">No hay pedidos que mostrar</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200">
                                {filteredPedidos.map((pedido) => {
                                    const items = parseItems(pedido.items);
                                    return (
                                        <div
                                            key={pedido.$id}
                                            className="p-6 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-2xl font-bold text-slate-900">
                                                            {pedido.numero_pedido}
                                                        </h3>
                                                        <Badge className={`${estadoBadgeColor(pedido.estado)} text-xs uppercase font-bold`}>
                                                            {pedido.estado}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-slate-400 hover:text-purple-600"
                                                            onClick={() => handleViewDetail(pedido)}
                                                            title="Ver Detalle Completo"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-slate-600">
                                                        <span className="font-semibold">{pedido.cliente_nombre}</span> · {pedido.cliente_telefono}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {new Date(pedido.fecha_creacion).toLocaleString('es-CO')}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 uppercase mb-1">Total</p>
                                                    <p className="text-3xl font-black text-purple-600">
                                                        {formatearPrecio(pedido.total)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase mb-1">Items</p>
                                                    <p className="font-bold text-slate-900">{items.length} productos</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase mb-1">Pagado</p>
                                                    <p className="font-bold text-emerald-600">{formatearPrecio(pedido.monto_pagado)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase mb-1">Saldo</p>
                                                    <p className="font-bold text-orange-600">{formatearPrecio(pedido.saldo_pendiente)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase mb-1">Acciones</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {pedido.estado === 'creado' && (
                                                            <Button size="sm" onClick={() => handleActionClick(pedido, 'confirmar')} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                                                Confirmar
                                                            </Button>
                                                        )}
                                                        {(pedido.estado === 'confirmado' || (pedido.estado === 'pagado' && pedido.saldo_pendiente > 0)) && (
                                                            <Button size="sm" onClick={() => handleActionClick(pedido, 'pagar')} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                                                Reg. Pago
                                                            </Button>
                                                        )}
                                                        {pedido.estado === 'pagado' && (
                                                            <Button size="sm" onClick={() => handleActionClick(pedido, 'enviar')} variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                                                Enviar
                                                            </Button>
                                                        )}
                                                        {pedido.estado === 'enviado' && (
                                                            <Button size="sm" onClick={() => handleActionClick(pedido, 'completar')} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                                                                Completar
                                                            </Button>
                                                        )}
                                                        {/* Opción de Corregir/Editar (visible para estados confirmados) */}
                                                        {['confirmado', 'pagado', 'enviado'].includes(pedido.estado) && (
                                                            <Button size="sm" onClick={() => handleActionClick(pedido, 'corregir')} variant="ghost" className="text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                                                                Corregir
                                                            </Button>
                                                        )}
                                                        {!['cancelado', 'completado'].includes(pedido.estado) && (
                                                            <Button size="sm" onClick={() => handleActionClick(pedido, 'cancelar')} variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                                                Cancelar
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items del pedido (versión compacta) */}
                                            <div className="bg-slate-50 rounded-lg p-3">
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                                                    {items.slice(0, 3).map((item, idx) => (
                                                        <span key={idx}>• {item.nombre} x{item.cantidad}</span>
                                                    ))}
                                                    {items.length > 3 && <span>... (+{items.length - 3} más)</span>}
                                                </div>
                                                {pedido.comprobante_url && (
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                                                        <FileText className="h-3 w-3" />
                                                        <span>Con comprobante</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Icono faltante
function FileText(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
    );
}
