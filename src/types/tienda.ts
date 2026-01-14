// Tipos para el Carrito de Compra
import { Producto } from './inventario';

export interface CartItem {
    producto: Producto;
    cantidad: number;
}

export interface Cart {
    items: CartItem[];
    total: number;
    totalItems: number;
}

// Tipos para Configuración de Tienda
export interface TiendaConfig {
    $id: string;
    nombre_negocio: string;
    descripcion: string;
    whatsapp: string;
    email: string;
    logo_url?: string;
    color_primario: string;
    color_secundario: string;
    mensaje_bienvenida: string;
    mensaje_whatsapp: string;
    mostrar_stock: boolean;
    permitir_pedidos_sin_stock: boolean;
    moneda: string;
    iva_incluido: boolean;
    terminos_condiciones?: string;
    activo: boolean;
}
