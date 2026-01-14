"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, User, LogOut, ShoppingBag, Calendar, Award } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { obtenerPedidosCliente } from "@/lib/actions/pedidos-catalogo";
import { obtenerMisCitas } from "@/lib/actions/citas"; // Importar action de citas
import { PedidoCatalogo } from "@/types/pedidos-catalogo";
import { Cita, EstadoCita } from "@/types"; // Importar tipos de Citas
import { formatearPrecio, formatearFecha } from "@/lib/utils";
import Link from "next/link";
import { CitaDetailModal } from "@/components/citas/CitaDetailModal"; // Importar Modal

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { parseItems } from "@/types/pedidos-catalogo";

export default function MiCuentaPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [pedidos, setPedidos] = useState<PedidoCatalogo[]>([]);
    const [citas, setCitas] = useState<Cita[]>([]); // Estado para citas
    const [loading, setLoading] = useState(true);
    const [selectedPedido, setSelectedPedido] = useState<PedidoCatalogo | null>(null);
    const [selectedCita, setSelectedCita] = useState<Cita | null>(null); // Estado cita seleccionada

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else {
                loadData();
            }
        }
    }, [user, authLoading, router]);

    const loadData = async () => {
        if (!user) return;

        // Cargar pedidos y citas en paralelo
        const [userPedidos, userCitas] = await Promise.all([
            obtenerPedidosCliente(user.$id),
            user.email ? obtenerMisCitas(user.email) : Promise.resolve([])
        ]);

        setPedidos(userPedidos);
        setCitas(userCitas);
        setLoading(false);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect via useEffect
    }

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900">Mi Cuenta</h1>
                        <p className="text-slate-600 mt-2">Bienvenido, {user?.name}</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/tienda">
                            <Button variant="outline" className="h-12">
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Ir al Catálogo
                            </Button>
                        </Link>
                        <Button onClick={handleLogout} variant="outline" className="h-12">
                            <LogOut className="mr-2 h-5 w-5" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>

                {/* Tabs Dashboard */}
                <Tabs defaultValue="pedidos" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 h-14">
                        <TabsTrigger value="pedidos" className="text-lg">
                            <Package className="mr-2 h-5 w-5" />
                            Mis Pedidos
                        </TabsTrigger>
                        <TabsTrigger value="citas" className="text-lg">
                            <Calendar className="mr-2 h-5 w-5" />
                            Mis Citas
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Pedidos */}
                    <TabsContent value="pedidos">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="border-2 border-blue-100">
                                <CardHeader>
                                    <CardTitle className="text-sm text-slate-600 font-semibold">Total Pedidos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-blue-600">{pedidos.length}</div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-emerald-100">
                                <CardHeader>
                                    <CardTitle className="text-sm text-slate-600 font-semibold">Pedidos Completados</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-emerald-600">
                                        {pedidos.filter(p => p.estado === 'completado').length}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-orange-100">
                                <CardHeader>
                                    <CardTitle className="text-sm text-slate-600 font-semibold">Pedidos Pendientes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-orange-600">
                                        {pedidos.filter(p => !['completado', 'cancelado'].includes(p.estado)).length}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Mis Pedidos */}
                        <Card className="border-0 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 border-b-2 border-blue-200">
                                <CardTitle className="text-2xl font-bold">Historial de Pedidos</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {pedidos.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-600 text-lg">No tienes pedidos todavía</p>
                                        <Link href="/tienda">
                                            <Button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
                                                Ir al Catálogo
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pedidos.map((pedido) => (
                                            <div
                                                key={pedido.$id}
                                                className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900">
                                                            {pedido.numero_pedido}
                                                        </h3>
                                                        <p className="text-sm text-slate-600">
                                                            {new Date(pedido.fecha_creacion).toLocaleDateString('es-CO')}
                                                        </p>
                                                    </div>
                                                    <span className={`px-4 py-2 rounded-full font-bold text-sm uppercase ${estadoBadgeColor(pedido.estado)}`}>
                                                        {pedido.estado}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase">Total</p>
                                                        <p className="text-lg font-bold text-slate-900">{formatearPrecio(pedido.total)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase">Pagado</p>
                                                        <p className="text-lg font-bold text-emerald-600">{formatearPrecio(pedido.monto_pagado)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase">Saldo</p>
                                                        <p className="text-lg font-bold text-orange-600">{formatearPrecio(pedido.saldo_pendiente)}</p>
                                                    </div>
                                                    <div>
                                                        <Button
                                                            onClick={() => setSelectedPedido(pedido)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full"
                                                        >
                                                            Ver Detalle
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab Citas */}
                    <TabsContent value="citas">
                        {/* Stats Citas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="border-2 border-green-100">
                                <CardHeader>
                                    <CardTitle className="text-sm text-slate-600 font-semibold">Total Citas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-green-600">{citas.length}</div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-emerald-100">
                                <CardHeader>
                                    <CardTitle className="text-sm text-slate-600 font-semibold">Citas Completadas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-emerald-600">
                                        {citas.filter(c => c.estado === EstadoCita.COMPLETADA).length}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-amber-100">
                                <CardHeader>
                                    <CardTitle className="text-sm text-slate-600 font-semibold">Citas Pendientes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-amber-600">
                                        {citas.filter(c => [EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA, EstadoCita.EN_PROGRESO].includes(c.estado)).length}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-0 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-green-200">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl font-bold">Historial de Citas</CardTitle>
                                    <Link href="/agendar">
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Nueva Cita
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {citas.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-600 text-lg">No tienes servicios agendados</p>
                                        <Link href="/agendar">
                                            <Button className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600">
                                                Agendar Servicio
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {citas.map((cita) => (
                                            <div
                                                key={cita.$id}
                                                className="border-2 border-slate-100 rounded-xl p-6 hover:border-green-300 transition-colors bg-white"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                            {cita.servicio?.nombre || cita.categoriaSeleccionada || "Servicio Personalizado"}
                                                        </h3>
                                                        <div className="flex items-center text-sm text-slate-600 mt-1">
                                                            <Calendar className="mr-1 h-3 w-3" />
                                                            {formatearFecha(cita.fechaCita)} • {cita.horaCita}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider
                                                            ${cita.estado === EstadoCita.PENDIENTE ? 'bg-amber-100 text-amber-700' :
                                                                cita.estado === EstadoCita.CONFIRMADA ? 'bg-blue-100 text-blue-700' :
                                                                    cita.estado === EstadoCita.COMPLETADA ? 'bg-emerald-100 text-emerald-700' :
                                                                        cita.estado === EstadoCita.CANCELADA ? 'bg-rose-100 text-rose-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {cita.estado.replace("-", " ")}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">Ubicación</p>
                                                        <p className="text-sm font-medium text-slate-900 truncate" title={cita.direccion}>
                                                            {cita.direccion}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{cita.ciudad}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">Personal</p>
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {cita.empleadosAsignados && cita.empleadosAsignados.length > 0
                                                                ? `${cita.empleadosAsignados.length} Asignado(s)`
                                                                : "Por asignar"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase font-semibold">Precio Est.</p>
                                                        <p className="text-lg font-bold text-slate-900">
                                                            {formatearPrecio(cita.precioCliente)}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-end">
                                                        <Button
                                                            onClick={() => setSelectedCita(cita)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300"
                                                        >
                                                            Ver Detalles
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Modal de Detalle de Pedido */}
                <Dialog open={!!selectedPedido} onOpenChange={(open) => !open && setSelectedPedido(null)}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex flex-col md:flex-row md:items-center gap-2">
                                <span>Detalle del Pedido</span>
                                {selectedPedido && (
                                    <span className="text-slate-500 text-lg font-normal">
                                        {selectedPedido.numero_pedido}
                                    </span>
                                )}
                            </DialogTitle>
                        </DialogHeader>

                        {selectedPedido && (
                            <div className="space-y-6">
                                {/* Estado */}
                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">Estado del Pedido</p>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${estadoBadgeColor(selectedPedido.estado)}`}>
                                            {selectedPedido.estado}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 mb-1">Fecha</p>
                                        <p className="font-semibold text-slate-900">
                                            {new Date(selectedPedido.fecha_creacion).toLocaleDateString('es-CO', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-3">Productos</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50">
                                                    <TableHead>Producto</TableHead>
                                                    <TableHead className="text-center">Cant.</TableHead>
                                                    <TableHead className="text-right">Precio</TableHead>
                                                    <TableHead className="text-right">Subtotal</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {parseItems(selectedPedido.items).map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">
                                                            <div>
                                                                {item.nombre}
                                                                {item.sku && <span className="text-xs text-slate-400 block">{item.sku}</span>}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">{item.cantidad}</TableCell>
                                                        <TableCell className="text-right">{formatearPrecio(item.precio_unitario)}</TableCell>
                                                        <TableCell className="text-right font-bold text-slate-900">
                                                            {formatearPrecio(item.cantidad * item.precio_unitario)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {/* Información Adicional (Envío y Pago) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                            <MapPin className="h-4 w-4" /> Entrega
                                        </h4>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap mb-2">
                                            {selectedPedido.direccion_envio || 'Recogida en tienda'}
                                        </p>
                                        {(selectedPedido.guia_envio || selectedPedido.empresa_envio) && (
                                            <div className="mt-2 pt-2 border-t border-slate-200">
                                                <p className="text-xs text-slate-500">Empresa: <span className="font-medium text-slate-900">{selectedPedido.empresa_envio || 'N/A'}</span></p>
                                                <p className="text-xs text-slate-500">Guía: <span className="font-medium text-purple-700">{selectedPedido.guia_envio || 'N/A'}</span></p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                            <Award className="h-4 w-4" /> Pago
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-slate-600">Método: <span className="font-medium capitalize text-slate-900">{selectedPedido.metodo_pago_id || 'No definido'}</span></p>
                                            {selectedPedido.comprobante_url ? (
                                                <a
                                                    href={selectedPedido.comprobante_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-1 font-medium"
                                                >
                                                    Ver Comprobante
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Sin comprobante adjunto</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen Financiero */}
                                <div className="bg-slate-50 p-6 rounded-lg space-y-2">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Subtotal</span>
                                        <span>{formatearPrecio(selectedPedido.subtotal)}</span>
                                    </div>
                                    {/* Mostramos descuento si aplica */}
                                    {selectedPedido.descuento > 0 && (
                                        <div className="flex justify-between items-center text-green-600">
                                            <span>Descuento</span>
                                            <span>-{formatearPrecio(selectedPedido.descuento)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 my-2"></div>
                                    <div className="flex justify-between items-center text-xl font-black text-slate-900">
                                        <span>Total</span>
                                        <span>{formatearPrecio(selectedPedido.total)}</span>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">Pagado hasta la fecha:</span>
                                            <span className="font-bold text-emerald-600">{formatearPrecio(selectedPedido.monto_pagado)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mt-1">
                                            <span className="text-slate-600">Pendiente por pagar:</span>
                                            <span className="font-bold text-orange-600">{formatearPrecio(selectedPedido.saldo_pendiente)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
                {/* Modal Detalle Cita */}
                <CitaDetailModal
                    isOpen={!!selectedCita}
                    onClose={() => setSelectedCita(null)}
                    cita={selectedCita}
                />
            </div>
        </div>
    );
}
