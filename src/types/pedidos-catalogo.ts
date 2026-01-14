// Types para Pedidos del Catálogo

export interface PedidoItem {
    producto_id: string;
    nombre: string;
    sku?: string;
    cantidad: number;
    precio_unitario: number;
    descuento_producto?: number;
    subtotal: number;
}

export type EstadoPedido = 'creado' | 'confirmado' | 'pagado' | 'enviado' | 'completado' | 'cancelado';

export interface PedidoCatalogo {
    $id: string;
    numero_pedido: string;
    fecha_creacion: string;

    // Cliente
    cliente_id?: string;
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_email?: string;

    // Items
    items: string; // JSON string in DB, parse to PedidoItem[]

    // Totales
    subtotal: number;
    descuento: number;
    iva?: number;
    total: number;

    // Estado
    estado: EstadoPedido;
    fecha_confirmacion?: string;
    fecha_pago?: string;
    fecha_envio?: string;
    fecha_completado?: string;

    // Pagos
    metodo_pago_id?: string;
    monto_pagado: number;
    saldo_pendiente: number;

    // Detalles
    notas?: string;
    mensaje_cliente?: string;
    // Detalles - Envío
    direccion_envio?: string;
    guia_envio?: string;
    empresa_envio?: string;

    // Detalles - Pago
    comprobante_url?: string;

    // Tracking
    creado_por: string;
    modificado_por?: string;
    stock_descontado: boolean;
}

// Helper para parsear items
export function parseItems(itemsString: string): PedidoItem[] {
    try {
        return JSON.parse(itemsString);
    } catch {
        return [];
    }
}

export function stringifyItems(items: PedidoItem[]): string {
    return JSON.stringify(items);
}
