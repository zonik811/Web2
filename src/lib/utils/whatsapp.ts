import { CartItem } from '@/types/tienda';
import { formatearPrecio } from '../utils';

export function generateWhatsAppMessage(
    items: CartItem[],
    total: number,
    config?: {
        saludo?: string;
        despedida?: string;
    }
): string {
    const saludo = config?.saludo || '¡Hola! Quiero hacer el siguiente pedido:';
    const despedida = config?.despedida || '¿Puede confirmar disponibilidad y método de pago?';

    let mensaje = `${saludo}\n\n`;
    mensaje += '🛒 *Mi Pedido:*\n\n';

    items.forEach((item, index) => {
        const numero = `${index + 1}️⃣`;
        const precio = item.producto.tiene_descuento
            ? (item.producto.precio_promocional ?? 0)
            : (item.producto.precio_venta ?? 0);
        const subtotal = precio * item.cantidad;

        mensaje += `${numero} ${item.producto.nombre}\n`;
        mensaje += `   • Cantidad: ${item.cantidad}\n`;
        mensaje += `   • Precio unitario: ${formatearPrecio(precio)}\n`;
        mensaje += `   • Subtotal: ${formatearPrecio(subtotal)}\n\n`;
    });

    mensaje += `💰 *Total: ${formatearPrecio(total)}*\n\n`;
    mensaje += despedida;

    return mensaje;
}

export function openWhatsApp(phoneNumber: string, message: string) {
    // Limpiar número (quitar espacios, guiones, etc.)
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // Encodear mensaje para URL
    const encodedMessage = encodeURIComponent(message);

    // Construir URL
    const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

    // Abrir en nueva ventana
    window.open(url, '_blank');
}

export function formatPhoneNumber(phone: string): string {
    // Formato: +57 322 323 8781
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('57') && cleaned.length === 12) {
        return `+57 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    return phone;
}
