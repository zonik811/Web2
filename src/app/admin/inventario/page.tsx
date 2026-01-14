"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, AlertTriangle } from "lucide-react";
import { obtenerProductos, obtenerProveedores } from "@/lib/actions/inventario";
import { obtenerCompras } from "@/lib/actions/compras";
import { Producto } from "@/types/inventario";

export default function InventarioDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [productosAlerta, setProductosAlerta] = useState<Producto[]>([]);
    const [stats, setStats] = useState({
        productos: 0,
        productosBajoStock: 0,
        valorInventario: 0,
        proveedores: 0,
        comprasPendientes: 0,
        deudaPendiente: 0,
        productosEnTienda: 0
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [prods, provs, comps] = await Promise.all([
                    obtenerProductos(),
                    obtenerProveedores(),
                    obtenerCompras()
                ]);

                const bajoStock = prods.filter(p => p.stock <= (p.stock_minimo || 5));
                const valorTotal = prods.reduce((sum, p) => sum + (p.stock * p.precio_venta), 0);
                const comprasPend = comps.filter(c => c.estado_pago === 'pendiente');
                const deudaTotal = comprasPend.reduce((sum, c) => sum + c.total, 0);

                setProductosAlerta(bajoStock);
                setStats({
                    productos: prods.length,
                    productosBajoStock: bajoStock.length,
                    valorInventario: valorTotal,
                    proveedores: provs.length,
                    comprasPendientes: comprasPend.length,
                    deudaPendiente: deudaTotal,
                    productosEnTienda: prods.filter(p => p.visible_en_tienda).length
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const formatPrecio = (valor: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                                Inventario & Tienda
                            </h1>
                            <p className="text-lg text-slate-600 mt-2">Gestión centralizada de productos, proveedores y stock</p>
                        </div>
                        <button
                            onClick={() => window.open('/tienda', '_blank')}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all"
                        >
                            🏪 Ver Tienda Online
                        </button>
                    </div>
                </div>

                {/* Stats Grid - NO CLICKEABLE */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-100 p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">CATÁLOGO</span>
                        </div>
                        <div className="text-4xl font-black text-emerald-600">{stats.productos}</div>
                        <div className="text-sm font-semibold text-slate-600 mt-1">Total Productos</div>
                    </div>

                    <div className={`bg-white rounded-xl shadow-lg border-2 ${stats.productosBajoStock > 0 ? 'border-amber-100' : 'border-emerald-100'} p-6 hover:shadow-xl transition-shadow`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-3 bg-gradient-to-br ${stats.productosBajoStock > 0 ? 'from-amber-500 to-amber-600' : 'from-emerald-500 to-green-600'} rounded-lg`}>
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                            <span className={`text-xs font-bold ${stats.productosBajoStock > 0 ? 'text-amber-700 bg-amber-100' : 'text-emerald-700 bg-emerald-100'} px-3 py-1 rounded-full`}>ALERTAS</span>
                        </div>
                        <div className={`text-4xl font-black ${stats.productosBajoStock > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{stats.productosBajoStock}</div>
                        <div className="text-sm font-semibold text-slate-600 mt-1">Bajo Stock</div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-100 p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                                <span className="text-xl">💰</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">VALORACIÓN</span>
                        </div>
                        <div className="text-2xl font-black text-emerald-600">{formatPrecio(stats.valorInventario)}</div>
                        <div className="text-sm font-semibold text-slate-600 mt-1">Valor Inventario</div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border-2 border-purple-100 p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                <span className="text-xl">🏪</span>
                            </div>
                            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">PUBLICADOS</span>
                        </div>
                        <div className="text-4xl font-black text-purple-600">{stats.productosEnTienda}</div>
                        <div className="text-sm font-semibold text-slate-600 mt-1">En Tienda Online</div>
                    </div>
                </div>

                {/* Second Row Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                <span className="text-xl">🚛</span>
                            </div>
                            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">ACTIVOS</span>
                        </div>
                        <div className="text-4xl font-black text-blue-600">{stats.proveedores}</div>
                        <div className="text-sm font-semibold text-slate-600 mt-1">Total Proveedores</div>
                    </div>

                    <div className={`bg-white rounded-xl shadow-lg border-2 ${stats.comprasPendientes > 0 ? 'border-orange-100' : 'border-emerald-100'} p-6 hover:shadow-xl transition-shadow`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-3 bg-gradient-to-br ${stats.comprasPendientes > 0 ? 'from-orange-500 to-orange-600' : 'from-emerald-500 to-green-600'} rounded-lg`}>
                                <span className="text-xl">🛒</span>
                            </div>
                            <span className={`text-xs font-bold ${stats.comprasPendientes > 0 ? 'text-orange-700 bg-orange-100' : 'text-emerald-700 bg-emerald-100'} px-3 py-1 rounded-full`}>POR PAGAR</span>
                        </div>
                        <div className={`text-4xl font-black ${stats.comprasPendientes > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>{stats.comprasPendientes}</div>
                        <div className="text-sm font-semibold text-slate-600 mt-1">Compras Pendientes</div>
                    </div>

                    <div className={`bg-white rounded-xl shadow-lg border-2 ${stats.deudaPendiente > 0 ? 'border-red-100' : 'border-emerald-100'} p-6 hover:shadow-xl transition-shadow`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-3 bg-gradient-to-br ${stats.deudaPendiente > 0 ? 'from-red-500 to-red-600' : 'from-emerald-500 to-green-600'} rounded-lg`}>
                                <span className="text-xl">📈</span>
                            </div>
                            <span className={`text-xs font-bold ${stats.deudaPendiente > 0 ? 'text-red-700 bg-red-100' : 'text-emerald-700 bg-emerald-100'} px-3 py-1 rounded-full`}>PENDIENTE</span>
                        </div>
                        <div className={`text-2xl font-black ${stats.deudaPendiente > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatPrecio(stats.deudaPendiente)}</div>
                        <div className="text-sm font-semibold text-slate-600 mt-1">Deuda Total</div>
                    </div>
                </div>

                {/* Accesos Directos */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                        Accesos Directos
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button
                            onClick={() => router.push('/admin/inventario/productos')}
                            className="bg-gradient-to-br from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white p-8 rounded-2xl text-left shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                        >
                            <div className="text-5xl mb-3">📦</div>
                            <div className="text-2xl font-bold mb-2">Productos</div>
                            <div className="text-emerald-100">Catálogo completo • Gestionar stock, precios y códigos de barra</div>
                        </button>

                        <button
                            onClick={() => router.push('/admin/inventario/proveedores')}
                            className="bg-gradient-to-br from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white p-8 rounded-2xl text-left shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                        >
                            <div className="text-5xl mb-3">🚛</div>
                            <div className="text-2xl font-bold mb-2">Proveedores</div>
                            <div className="text-blue-100">Suministros • Agenda de proveedores y gestión de contactos</div>
                        </button>

                        <button
                            onClick={() => router.push('/admin/inventario/compras')}
                            className="bg-gradient-to-br from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white p-8 rounded-2xl text-left shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                        >
                            <div className="text-5xl mb-3">🛒</div>
                            <div className="text-2xl font-bold mb-2">Compras</div>
                            <div className="text-orange-100">Entradas • Registrar facturas y reabastecimiento de stock</div>
                        </button>
                    </div>
                </div>

                {/* Alertas de Stock */}
                {productosAlerta.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <div className="h-1 w-12 bg-gradient-to-r from-amber-600 to-red-600 rounded-full"></div>
                            Alertas de Stock Bajo
                            <span className="text-sm font-semibold bg-amber-500 text-white px-3 py-1 rounded-full">{productosAlerta.length} productos</span>
                        </h2>
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-amber-100 to-amber-50 border-b-2 border-amber-200">
                                    <tr>
                                        <th className="text-left p-4 font-bold text-slate-800 text-sm">PRODUCTO</th>
                                        <th className="text-center p-4 font-bold text-slate-800 text-sm">STOCK ACTUAL</th>
                                        <th className="text-center p-4 font-bold text-slate-800 text-sm">STOCK MÍNIMO</th>
                                        <th className="text-center p-4 font-bold text-slate-800 text-sm">ESTADO</th>
                                        <th className="text-right p-4 font-bold text-slate-800 text-sm">ACCIÓN</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {productosAlerta.map((prod) => (
                                        <tr key={prod.$id} className="hover:bg-amber-50/50 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                                        {prod.imagenes?.[0] ? (
                                                            <img src={prod.imagenes[0]} alt={prod.nombre} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="h-5 w-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{prod.nombre}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{prod.sku || "N/A"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`text-2xl font-black ${prod.stock <= 0 ? 'text-red-600' : 'text-amber-600'}`}>{prod.stock}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-lg font-semibold text-slate-600">{prod.stock_minimo || 5}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {prod.stock <= 0 ? (
                                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">⚠️ AGOTADO</span>
                                                ) : (
                                                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">⚡ POCO STOCK</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => router.push('/admin/inventario/productos')}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    👁️ Ver
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
