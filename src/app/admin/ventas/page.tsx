"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ShoppingBag,
    DollarSign,
    TrendingUp,
    Package,
    Users,
    ArrowLeft
} from "lucide-react";
import { obtenerPedidos } from "@/lib/actions/pedidos-catalogo";
import { PedidoCatalogo } from "@/types/pedidos-catalogo";
import { formatearPrecio } from "@/lib/utils";
import Link from "next/link";

export default function VentasPage() {
    const [pedidos, setPedidos] = useState<PedidoCatalogo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await obtenerPedidos();
        setPedidos(data);
        setLoading(false);
    };

    // Calcular métricas
    const totalVentas = pedidos.filter(p => p.estado !== 'cancelado').reduce((sum, p) => sum + p.total, 0);
    const ventasCompletadas = pedidos.filter(p => p.estado === 'completado').length;
    const ventasPendientes = pedidos.filter(p => !['completado', 'cancelado'].includes(p.estado)).length;
    const porCobrar = pedidos.filter(p => p.estado !== 'cancelado').reduce((sum, p) => sum + p.saldo_pendiente, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-50 p-8">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <Link href="/admin">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Dashboard Principal
                                </Button>
                            </Link>
                        </div>
                        <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Módulo de Ventas
                        </h1>
                        <p className="text-slate-600 mt-2 text-lg">
                            Gestión de pedidos del catálogo online
                        </p>
                    </div>
                </div>

                {/* KPIs Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="border-2 border-purple-100 overflow-hidden hover:shadow-xl transition-shadow">
                        <CardHeader className="bg-gradient-to-br from-purple-50 to-blue-50 border-b pb-3">
                            <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-purple-600" />
                                Ventas Totales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-purple-600">{formatearPrecio(totalVentas)}</div>
                            <p className="text-xs text-slate-500 mt-1">Total acumulado</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-emerald-100 overflow-hidden hover:shadow-xl transition-shadow">
                        <CardHeader className="bg-gradient-to-br from-emerald-50 to-green-50 border-b pb-3">
                            <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-emerald-600" />
                                Pedidos Completados
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-emerald-600">{ventasCompletadas}</div>
                            <p className="text-xs text-slate-500 mt-1">Transacciones finalizadas</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-orange-100 overflow-hidden hover:shadow-xl transition-shadow">
                        <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b pb-3">
                            <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Package className="h-5 w-5 text-orange-600" />
                                Pendientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-orange-600">{ventasPendientes}</div>
                            <p className="text-xs text-slate-500 mt-1">En proceso</p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-100 overflow-hidden hover:shadow-xl transition-shadow">
                        <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50 border-b pb-3">
                            <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                Por Cobrar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-blue-600">{formatearPrecio(porCobrar)}</div>
                            <p className="text-xs text-slate-500 mt-1">Saldos pendientes</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Accesos Rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/admin/ventas/pedidos-catalogo">
                        <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl transition-all cursor-pointer group">
                            <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <div className="p-3 bg-purple-600 rounded-xl">
                                        <ShoppingBag className="h-6 w-6 text-white" />
                                    </div>
                                    Pedidos del Catálogo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-slate-600 mb-4">
                                    Gestiona todos los pedidos del catálogo online: cambiar estados, registrar pagos, ver detalles.
                                </p>
                                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 group-hover:from-purple-700 group-hover:to-blue-700">
                                    Ver Pedidos
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>

                    <Card className="border-2 border-slate-200 opacity-60">
                        <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-100">
                            <CardTitle className="flex items-center gap-3 text-xl text-slate-400">
                                <div className="p-3 bg-slate-300 rounded-xl">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                Reportes de Ventas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-slate-400 mb-4">
                                Análisis detallado de ventas por período, productos más vendidos, clientes frecuentes.
                            </p>
                            <Button disabled className="w-full bg-slate-300">
                                Próximamente
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
