import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { X, Trash2, Plus, Minus, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatearPrecio } from "@/lib/utils";
import { generateWhatsAppMessage, openWhatsApp } from "@/lib/utils/whatsapp";
import { useEffect, useState } from "react";
import { obtenerConfiguracionTienda } from "@/lib/actions/tienda-config";
import { crearPedido } from "@/lib/actions/pedidos-catalogo";
import { PedidoItem } from "@/types/pedidos-catalogo";
import { useRouter } from "next/navigation";

export function CartDrawer() {
    const router = useRouter();
    const { items, total, totalItems, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart();
    const { user: currentUser } = useAuth();
    const [whatsappNumber, setWhatsappNumber] = useState('573223238781');
    const [sending, setSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        // Cargar configuración de la tienda
        obtenerConfiguracionTienda().then(config => {
            if (config?.whatsapp) {
                setWhatsappNumber(config.whatsapp);
            }
        }).catch(error => {
            // Si la colección no existe, usar número por defecto

        });
    };

    const handleSendOrder = async () => {
        if (items.length === 0) return;

        setSending(true);

        try {
            let numeroPedido = '';

            // Si el usuario está logueado, crear pedido automáticamente
            if (currentUser) {

                try {
                    const pedidoItems: PedidoItem[] = items.map(item => ({
                        producto_id: item.producto.$id,
                        nombre: item.producto.nombre,
                        sku: item.producto.sku,
                        cantidad: item.cantidad,
                        precio_unitario: item.producto.tiene_descuento
                            ? (item.producto.precio_promocional ?? 0)
                            : (item.producto.precio_venta ?? 0),
                        subtotal: (item.producto.tiene_descuento
                            ? (item.producto.precio_promocional ?? 0)
                            : (item.producto.precio_venta ?? 0)) * item.cantidad
                    }));

                    const result = await crearPedido({
                        cliente_id: currentUser.$id,
                        cliente_nombre: currentUser.name,
                        cliente_telefono: '000', // TODO: obtener del perfil
                        cliente_email: currentUser.email,
                        items: pedidoItems,
                        subtotal: total,
                        total: total,
                        creado_por: 'cliente_web'
                    });



                    if (result.success && result.pedido) {
                        numeroPedido = result.pedido.numero_pedido;
                    } else {
                        console.error("Falló la creación del pedido:", result);
                        alert("Hubo un problema registrando el pedido, pero te enviaremos a WhatsApp.");
                    }
                } catch (err) {
                    console.error("Error crítico creando pedido:", err);
                }
            } else {

            }

            // Generar mensaje de WhatsApp
            let message = generateWhatsAppMessage(items, total);

            // Si se creó pedido, agregar número al mensaje
            if (numeroPedido) {
                message = `📋 *Pedido #${numeroPedido}*\n\n` + message;
            }

            openWhatsApp(whatsappNumber, message);

            // Pequeño delay para dar feedback visual
            setTimeout(() => {
                setSending(false);

                if (numeroPedido) {
                    // Mostrar estado de éxito
                    setShowSuccess(true);
                } else {
                    // Si no hay usuario, solo preguntar si quiere limpiar
                    if (confirm('¿Deseas vaciar el carrito?')) {
                        clearCart();
                        closeCart();
                    }
                }
            }, 1000);
        } catch (error) {
            console.error('Error enviando pedido:', error);
            setSending(false);
            alert('Error al procesar el pedido. Intenta de nuevo.');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                onClick={closeCart}
            />
            {showSuccess && <PedidoExitoState />}

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="h-6 w-6" />
                        <div>
                            <h2 className="text-2xl font-bold">Mi Carrito</h2>
                            <p className="text-purple-100 text-sm">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
                        </div>
                    </div>
                    <button
                        onClick={closeCart}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="p-6 bg-slate-100 rounded-full mb-4">
                                <ShoppingCart className="h-16 w-16 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Carrito vacío</h3>
                            <p className="text-slate-600">Agrega productos para comenzar tu pedido</p>
                            <Button
                                onClick={closeCart}
                                className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600"
                            >
                                Ir al Catálogo
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => {
                            const precio = item.producto.tiene_descuento
                                ? (item.producto.precio_promocional ?? 0)
                                : (item.producto.precio_venta ?? 0);
                            const subtotal = precio * item.cantidad;

                            return (
                                <div
                                    key={item.producto.$id}
                                    className="bg-slate-50 rounded-xl p-4 flex gap-4 group hover:bg-slate-100 transition-colors"
                                >
                                    {/* Image */}
                                    <div className="h-20 w-20 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {item.producto.imagenes?.[0] ? (
                                            <img
                                                src={item.producto.imagenes[0]}
                                                alt={item.producto.nombre}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package className="h-8 w-8 text-slate-300" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 mb-1 line-clamp-2">
                                            {item.producto.nombre}
                                        </h4>
                                        <p className="text-sm text-purple-600 font-bold mb-2">
                                            {formatearPrecio(precio)} c/u
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.producto.$id, item.cantidad - 1)}
                                                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                                                    aria-label="Disminuir cantidad"
                                                >
                                                    <Minus className="h-4 w-4 text-slate-600" />
                                                </button>
                                                <span className="w-8 text-center font-bold text-slate-900">
                                                    {item.cantidad}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.producto.$id, item.cantidad + 1)}
                                                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                                                    disabled={item.cantidad >= (item.producto.stock ?? 0)}
                                                    aria-label="Aumentar cantidad"
                                                >
                                                    <Plus className="h-4 w-4 text-slate-600" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 uppercase">Subtotal</p>
                                                <p className="font-bold text-slate-900">{formatearPrecio(subtotal)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => {
                                            if (confirm('¿Eliminar este producto del carrito?')) {
                                                removeItem(item.producto.$id);
                                            }
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 rounded-lg self-start"
                                        aria-label="Eliminar producto"
                                    >
                                        <Trash2 className="h-5 w-5 text-red-600" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t-2 border-slate-200 p-6 space-y-4 bg-slate-50">
                        {/* Total */}
                        <div className="flex items-center justify-between text-2xl">
                            <span className="font-bold text-slate-900">Total:</span>
                            <span className="font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                {formatearPrecio(total)}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Button
                                onClick={handleSendOrder}
                                disabled={sending}
                                className={`w-full h-14 text-lg font-bold shadow-xl ${currentUser ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'}`}
                            >
                            </Button>

                            <Button
                                onClick={() => {
                                    if (confirm('¿Seguro que deseas vaciar el carrito?')) {
                                        clearCart();
                                    }
                                }}
                                variant="outline"
                                className="w-full border-2 border-slate-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 h-12"
                            >
                                <Trash2 className="h-5 w-5 mr-2" />
                                Vaciar Carrito
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

    function PedidoExitoState() {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600"></div>

                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2">¡Pedido Validado!</h3>
                    <p className="text-slate-600 mb-6">
                        Tu pedido ha sido creado correctamente y ya te enviamos la confirmación por WhatsApp.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-xl mb-6 text-left border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Estado del Pedido</p>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="font-semibold text-slate-700">Confirmado y en proceso</span>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 mb-6 italic">
                        "Un asesor te contactará en breve para coordinar el pago y envío."
                    </p>

                    <Button
                        onClick={() => {
                            clearCart();
                            closeCart();
                            router.push('/mi-cuenta');
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg"
                    >
                        Ver mis Pedidos
                    </Button>
                </div>
            </div>
        );
    }
}
