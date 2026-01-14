"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Search, Store, ShoppingCart, ArrowLeft, AlertTriangle, Plus } from "lucide-react";
import { obtenerProductos } from "@/lib/actions/inventario";
import { Producto } from "@/types/inventario";
import { formatearPrecio } from "@/lib/utils";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { CartButton } from "@/components/tienda/CartButton";
import { CartDrawer } from "@/components/tienda/CartDrawer";
import { UserMenu } from "@/components/layout/UserMenu";

function TiendaCatalog() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<'nombre' | 'precio_asc' | 'precio_desc'>('nombre');

    const { addItem } = useCart(); // Hook del carrito

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterAndSort();
    }, [productos, search, sortBy]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await obtenerProductos();
            // Solo productos visibles en tienda
            const productosVisibles = data.filter(p => p.visible_en_tienda);
            setProductos(productosVisibles);
        } catch (error) {
            console.error('Error cargando catálogo:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSort = () => {
        let filtered = [...productos];

        // Filtro de búsqueda
        if (search) {
            filtered = filtered.filter(p =>
                p.nombre.toLowerCase().includes(search.toLowerCase()) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(search.toLowerCase())) ||
                (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
            );
        }

        // Ordenamiento
        filtered.sort((a, b) => {
            if (sortBy === 'nombre') {
                return a.nombre.localeCompare(b.nombre);
            } else if (sortBy === 'precio_asc') {
                const precioA = a.tiene_descuento ? (a.precio_promocional ?? 0) : (a.precio_venta ?? 0);
                const precioB = b.tiene_descuento ? (b.precio_promocional ?? 0) : (b.precio_venta ?? 0);
                return precioA - precioB;
            } else { // precio_desc
                const precioA = a.tiene_descuento ? (a.precio_promocional ?? 0) : (a.precio_venta ?? 0);
                const precioB = b.tiene_descuento ? (b.precio_promocional ?? 0) : (b.precio_venta ?? 0);
                return precioB - precioA;
            }
        });

        setFilteredProductos(filtered);
    };

    const handleAddToCart = (producto: Producto) => {
        addItem(producto, 1);
        // Opcional: mostrar toast de confirmación
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white shadow-2xl">
                    <div className="max-w-[1600px] mx-auto px-8 py-8">
                        <div className="flex items-center justify-between mb-4">
                            <Link href="/">
                                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Inicio
                                </Button>
                            </Link>
                            <UserMenu />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
                                    <Store className="h-12 w-12 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-5xl font-black mb-2">Catálogo Online</h1>
                                    <p className="text-purple-100 text-lg">
                                        {productos.length} productos disponibles
                                    </p>
                                </div>
                            </div>
                            <Link href="/agendar">
                                <Button className="bg-white text-purple-600 hover:bg-purple-50 h-12 px-6 rounded-xl font-bold shadow-xl hidden md:flex items-center">
                                    <Package className="mr-2 h-5 w-5" />
                                    Agendar Servicio
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                    <div className="max-w-[1600px] mx-auto px-8 py-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            {/* Search */}
                            <div className="relative flex-1 w-full group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                                <Input
                                    placeholder="Buscar productos por nombre, descripción o SKU..."
                                    className="pl-12 h-12 border-2 border-slate-200 focus:border-purple-500 transition-all rounded-xl bg-white shadow-sm font-medium w-full"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Sort */}
                            <div className="w-full md:w-64">
                                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                                    <SelectTrigger className="h-12 border-2 border-slate-200 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white z-50">
                                        <SelectItem value="nombre">Ordenar: A-Z</SelectItem>
                                        <SelectItem value="precio_asc">Precio: Menor a Mayor</SelectItem>
                                        <SelectItem value="precio_desc">Precio: Mayor a Menor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="max-w-[1600px] mx-auto px-8 py-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <Package className="h-20 w-20 animate-pulse text-purple-600" />
                            <p className="text-slate-600 font-semibold text-lg">Cargando catálogo...</p>
                        </div>
                    ) : filteredProductos.length === 0 ? (
                        <Card className="border-0 shadow-2xl p-16">
                            <div className="flex flex-col items-center gap-6 text-center">
                                <div className="p-8 bg-slate-100 rounded-full">
                                    <Package className="h-20 w-20 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-3">
                                        {search ? 'No se encontraron productos' : 'Catálogo en construcción'}
                                    </h3>
                                    <p className="text-slate-600 max-w-md text-lg">
                                        {search
                                            ? 'Intenta con otros términos de búsqueda'
                                            : 'Estamos preparando nuestro catálogo. Vuelve pronto para ver todos nuestros productos.'
                                        }
                                    </p>
                                </div>
                                {search && (
                                    <Button
                                        onClick={() => setSearch('')}
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4"
                                    >
                                        Limpiar Búsqueda
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProductos.map((prod) => {
                                const precioFinal = prod.tiene_descuento ? (prod.precio_promocional ?? 0) : (prod.precio_venta ?? 0);
                                const enStock = (prod.stock ?? 0) > 0;

                                return (
                                    <Card
                                        key={prod.$id}
                                        className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 bg-white"
                                    >
                                        {/* Image */}
                                        <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
                                            {prod.imagenes && prod.imagenes.length > 0 && prod.imagenes[0] ? (
                                                <img
                                                    src={prod.imagenes[0]}
                                                    alt={prod.nombre}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <Package className="h-20 w-20 text-slate-300 opacity-50" />
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                                                {!enStock && (
                                                    <Badge variant="destructive" className="shadow-lg font-bold border-2 border-white backdrop-blur-sm text-sm">
                                                        ⚠️ AGOTADO
                                                    </Badge>
                                                )}
                                                {prod.tiene_descuento && enStock && (
                                                    <Badge className="bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg border-2 border-white backdrop-blur-sm font-bold text-sm">
                                                        🔥 {prod.porcentaje_descuento}% OFF
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Stock Badge */}
                                            {enStock && (prod.stock ?? 0) <= (prod.stock_minimo || 5) && (
                                                <Badge className="absolute top-3 right-3 bg-amber-500/90 text-white backdrop-blur-sm shadow-lg border-2 border-white font-semibold">
                                                    ⚡ Solo {prod.stock} disponibles
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <CardContent className="p-6 space-y-4">
                                            {/* Product Name */}
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-xl leading-tight line-clamp-2 mb-2 group-hover:text-purple-700 transition-colors min-h-[3.5rem]">
                                                    {prod.nombre}
                                                </h3>
                                                {prod.descripcion && (
                                                    <p className="text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
                                                        {prod.descripcion}
                                                    </p>
                                                )}
                                            </div>

                                            {/* SKU */}
                                            {prod.sku && (
                                                <p className="text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg inline-block">
                                                    SKU: {prod.sku}
                                                </p>
                                            )}

                                            {/* Price */}
                                            <div className="pt-3 border-t-2 border-slate-100">
                                                <div className="flex items-end justify-between mb-4">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                                                            Precio
                                                        </p>
                                                        <div className="flex flex-col">
                                                            <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                                                {formatearPrecio(precioFinal)}
                                                            </span>
                                                            {prod.tiene_descuento && (
                                                                <span className="text-sm text-slate-400 line-through">
                                                                    {formatearPrecio(prod.precio_venta ?? 0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Stock Indicator */}
                                                    <div className="text-right">
                                                        <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                                                            Stock
                                                        </p>
                                                        <div className={`text-xl font-bold ${enStock ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {enStock ? (prod.stock ?? 0) : '0'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* CTA Button - AHORA CON AGREGAR AL CARRITO */}
                                                <Button
                                                    onClick={() => handleAddToCart(prod)}
                                                    disabled={!enStock}
                                                    className={`w-full h-12 rounded-xl font-bold text-base ${enStock
                                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl shadow-purple-500/40'
                                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {enStock ? (
                                                        <>
                                                            <Plus className="mr-2 h-5 w-5" />
                                                            Agregar al Carrito
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertTriangle className="mr-2 h-5 w-5" />
                                                            No Disponible
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Results Count */}
                    {!loading && filteredProductos.length > 0 && (
                        <div className="mt-12 text-center">
                            <p className="text-slate-600 font-semibold">
                                Mostrando <span className="text-purple-600 font-bold">{filteredProductos.length}</span> de{' '}
                                <span className="text-purple-600 font-bold">{productos.length}</span> productos
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12 mt-20">
                    <div className="max-w-[1600px] mx-auto px-8 text-center">
                        <Store className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                        <h3 className="text-2xl font-bold mb-2">¿Necesitas ayuda?</h3>
                        <p className="text-slate-300 max-w-2xl mx-auto mb-6">
                            Si tienes dudas sobre algún producto o necesitas más información, no dudes en contactarnos.
                        </p>
                        <Link href="/agendar">
                            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 px-8 rounded-xl font-bold">
                                Agendar Cita
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Cart Components */}
            <CartButton />
            <CartDrawer />
        </>
    );
}

// Wrapper con CartProvider
export default function TiendaOnlinePage() {
    return (
        <CartProvider>
            <TiendaCatalog />
        </CartProvider>
    );
}
