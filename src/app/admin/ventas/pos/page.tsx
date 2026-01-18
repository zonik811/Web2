"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, RotateCcw, Loader2, User } from "lucide-react";
import { formatearPrecio } from "@/lib/utils";
import { obtenerProductos } from "@/lib/actions/inventario";
import { Producto } from "@/types/inventario";
import { obtenerTurnoActivo } from "@/lib/actions/caja";
import { TurnoCaja } from "@/types/caja";
import { CashRegisterDialog } from "@/components/pos/CashRegisterDialog";
import { PaymentDialog } from "@/components/pos/PaymentDialog";
import { UserCircle, Clock, TrendingUp, Banknote, CalendarDays } from "lucide-react";
import { obtenerResumenTurno } from "@/lib/actions/caja";
import { CustomerSelectorDialog } from "@/components/pos/CustomerSelectorDialog";
import { obtenerClienteGenerico, type ClientePOS } from "@/lib/actions/clientes-pos";

// Placeholder types - will be moved to types/pos.ts
type POSItem = {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    imagen?: string;
};

export default function POSPage() {
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<POSItem[]>([]);
    const [products, setProducts] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);

    // State for Turno & Payment
    const [turno, setTurno] = useState<TurnoCaja | null>(null);
    const [turnoStats, setTurnoStats] = useState({ totalEfectivo: 0, totalVentas: 0 }); // Local stats for dashboard
    const [isCashDialogOpen, setIsCashDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'abrir' | 'cerrar'>('abrir');
    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<ClientePOS | null>(null);

    // Simulate User (Replace with actual auth context in production)
    const currentUser = { id: "user_mock_123", name: "Cajero Principal" };

    useEffect(() => {
        loadProducts();
        checkTurno();
        loadGenericCustomer();
    }, []);

    const checkTurno = async () => {
        const active = await obtenerTurnoActivo(currentUser.id);
        setTurno(active);
        if (active) {
            updateTurnoStats(active.$id);
        }
    };

    const updateTurnoStats = async (turnoId: string) => {
        try {
            const stats = await obtenerResumenTurno(turnoId);
            setTurnoStats(stats);
        } catch (e) {
            console.error("Error fetching stats", e);
        }
    };

    const handleOpenCash = () => {
        setDialogMode('abrir');
        setIsCashDialogOpen(true);
    };

    const handleCloseCash = () => {
        setDialogMode('cerrar');
        setIsCashDialogOpen(true);
    };

    const handlePaymentSuccess = () => {
        setCart([]); // Clear cart
        checkTurno(); // Refresh stats
        setSearch(""); // Reset search
        loadGenericCustomer(); // Reset to generic customer
        loadProducts(); // Refresh product stock
    };

    const loadGenericCustomer = async () => {
        const generic = await obtenerClienteGenerico();
        if (generic) {
            setSelectedCustomer(generic);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            loadProducts(search);
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [search]);

    const loadProducts = async (term?: string) => {
        setLoading(true);
        const data = await obtenerProductos(term);
        // Ensure data is valid
        if (Array.isArray(data)) {
            setProducts(data);
        } else {
            console.error("Invalid product data:", data);
            setProducts([]);
        }
        setLoading(false);
    };

    const addToCart = (product: Producto) => {
        if (!turno) return; // Block if no session
        setCart(prev => {
            const existing = prev.find(item => item.id === product.$id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.$id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prev, {
                id: product.$id,
                nombre: product.nombre,
                precio: product.precio_venta,
                cantidad: 1,
                imagen: product.imagenes?.[0]
            }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.cantidad + delta;
                return newQty > 0 ? { ...item, cantidad: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] gap-4 p-4 overflow-hidden bg-slate-100 relative">
            {/* Block UI if Closed */}
            {!turno && (
                <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                    <Card className="w-96 text-center p-6 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-center mb-4">
                            <div className="bg-emerald-100 p-4 rounded-full shadow-inner">
                                <RotateCcw className="h-10 w-10 text-emerald-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-800">Caja Cerrada</h2>
                        <p className="text-slate-500 mb-6">Debes abrir un turno para comenzar a vender.</p>
                        <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-500/20" onClick={handleOpenCash}>
                            Abrir Caja
                        </Button>
                    </Card>
                </div>
            )}

            {/* Dialogs */}
            <CashRegisterDialog
                isOpen={isCashDialogOpen}
                onClose={() => setIsCashDialogOpen(false)}
                mode={dialogMode}
                userId={currentUser.id}
                userName={currentUser.name}
                turnoActivo={turno}
                onSuccess={checkTurno}
            />

            <CustomerSelectorDialog
                isOpen={isCustomerDialogOpen}
                onClose={() => setIsCustomerDialogOpen(false)}
                onSelectCustomer={setSelectedCustomer}
                currentCustomer={selectedCustomer}
            />

            <PaymentDialog
                isOpen={isPaymentDialogOpen}
                onClose={() => setIsPaymentDialogOpen(false)}
                total={cartTotal}
                items={cart}
                turnoId={turno?.$id || ''}
                userId={currentUser.id}
                customer={selectedCustomer}
                onSuccess={handlePaymentSuccess}
            />

            {/* HEADER DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                {/* User Info */}
                <Card className="border-0 shadow-sm bg-slate-800 text-white flex items-center p-4">
                    <div className="bg-slate-700 p-3 rounded-full mr-4">
                        <UserCircle className="h-8 w-8 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Cajero Activo</p>
                        <p className="font-bold text-lg truncate max-w-[150px]">{turno ? turno.usuario_nombre : '---'}</p>
                    </div>
                </Card>

                {/* Date/Time */}
                <Card className="border-0 shadow-sm bg-white flex items-center p-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Apertura</p>
                        <p className="font-bold text-lg text-slate-800">
                            {turno ? new Date(turno.fecha_apertura).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </p>
                    </div>
                </Card>

                {/* Cash In Hand */}
                <Card className="border-0 shadow-sm bg-white flex items-center p-4">
                    <div className="bg-emerald-100 p-3 rounded-full mr-4">
                        <Banknote className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Efectivo en Caja</p>
                        <p className="font-bold text-lg text-emerald-700">{formatearPrecio(turnoStats.totalEfectivo || 0)}</p>
                    </div>
                </Card>

                {/* Actions */}
                <Card className="border-0 shadow-sm bg-white flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 transition-colors group" onClick={handleCloseCash}>
                    <div className="flex items-center">
                        <div className="bg-red-100 p-3 rounded-full mr-4 group-hover:bg-red-200 transition-colors">
                            <RotateCcw className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 group-hover:text-red-600 uppercase font-bold tracking-wider transition-colors">Estado</p>
                            <p className="font-bold text-lg text-slate-800 group-hover:text-red-700 transition-colors">Cerrar Turno</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
                {/* Left Column: Product Grid */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {/* Search Bar */}
                    <Card className="border-0 shadow-sm shrink-0">
                        <CardContent className="p-4 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Buscar productos..."
                                    className="pl-10 h-12 text-lg"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                    disabled={!turno}
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 max-w-md opacity-50 pointer-events-none">
                                {["Todos", "Aceites", "Filtros", "Frenos", "Llantas"].map(cat => (
                                    <Button key={cat} variant="outline" className="rounded-full whitespace-nowrap">
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto pr-2">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
                                {products.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center p-10 text-slate-400">
                                        <Search className="h-10 w-10 mb-2 opacity-20" />
                                        <p>No se encontraron productos</p>
                                    </div>
                                ) : (
                                    products.map(product => (
                                        <Card
                                            key={product.$id}
                                            className={`cursor-pointer transition-all flex flex-col border-0 shadow-sm bg-white overflow-hidden group ${!turno ? 'opacity-50 grayscale pointer-events-none' : 'hover:shadow-lg active:scale-95'
                                                }`}
                                            onClick={() => addToCart(product)}
                                        >
                                            <div className="h-32 bg-slate-100 w-full flex items-center justify-center relative">
                                                {product.imagenes?.[0] ? (
                                                    <img src={product.imagenes[0]} alt={product.nombre} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-4xl opacity-50">📦</span>
                                                )}
                                                {product.stock <= 0 && (
                                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">AGOTADO</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                    Stock: {product.stock}
                                                </div>
                                            </div>
                                            <CardContent className="p-3 flex-1 flex flex-col">
                                                <h3 className="font-semibold text-slate-700 line-clamp-2 leading-tight mb-2 text-sm group-hover:text-emerald-700 transition-colors">
                                                    {product.nombre}
                                                </h3>
                                                <div className="mt-auto flex justify-between items-center">
                                                    <span className="font-bold text-lg text-emerald-600">
                                                        {formatearPrecio(product.precio_venta)}
                                                    </span>
                                                    <Button size="icon" className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: POS Cart */}
                <div className="w-[400px] flex flex-col gap-4">
                    <Card className="flex-1 border-0 shadow-xl flex flex-col overflow-hidden">
                        {/* Cart Header */}
                        <div className="p-4 bg-slate-800 text-white shrink-0">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    <span className="font-bold text-lg">Carrito</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-red-400 hover:bg-transparent"
                                    onClick={() => setCart([])}
                                    disabled={!turno || cart.length === 0}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                            {/* Customer Selector */}
                            <Button
                                variant="outline"
                                className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
                                onClick={() => setIsCustomerDialogOpen(true)}
                                disabled={!turno}
                            >
                                <User className="h-4 w-4 mr-2" />
                                {selectedCustomer?.nombre || "Cliente Mostrador"}
                            </Button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-0">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                                    <ShoppingCart className="h-16 w-16 mb-4" />
                                    <p className="text-lg">Carrito vacío</p>
                                    <p className="text-sm">Escanea o selecciona productos</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2 animate-in slide-in-from-right-5 duration-200">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium text-slate-700 line-clamp-1 text-sm">{item.nombre}</span>
                                            <span className="font-bold text-slate-900">{formatearPrecio(item.precio * item.cantidad)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-xs text-slate-500">{formatearPrecio(item.precio)} c/u</div>
                                            <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                                                <button
                                                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-4 text-center text-sm font-semibold">{item.cantidad}</span>
                                                <button
                                                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Totals & Checkout */}
                        <div className="p-6 bg-white border-t space-y-4 z-10 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatearPrecio(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>IVA (19%)</span>
                                    <span>{formatearPrecio(cartTotal * 0.19)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end border-t pt-4">
                                <span className="text-slate-500 font-medium">Total a Pagar</span>
                                <span className="text-3xl font-black text-slate-900">{formatearPrecio(cartTotal * 1.19)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <Button variant="outline" className="h-12 border-slate-300 text-slate-600 font-semibold text-lg hover:bg-slate-50" disabled>
                                    <RotateCcw className="mr-2 h-5 w-5" />
                                    Pendiente
                                </Button>
                                <Button
                                    className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-500/20"
                                    disabled={!turno || cart.length === 0}
                                    onClick={() => setIsPaymentDialogOpen(true)}
                                >
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    Cobrar
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
