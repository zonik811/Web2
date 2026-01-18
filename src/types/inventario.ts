import { Models } from "node-appwrite";

export interface Proveedor extends Models.Document {
    nombre: string;
    nit_rut?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    nombre_contacto?: string;
    activo: boolean;
}

export interface Producto extends Models.Document {
    nombre: string;
    descripcion?: string;
    sku?: string;
    codigo_barras?: string;
    precio_compra: number;
    precio_venta: number;
    stock: number;
    stock_minimo: number;
    categoria_id?: string;
    proveedor_id?: string;
    // Store fields
    visible_en_tienda: boolean;
    tiene_descuento: boolean;
    porcentaje_descuento?: number;
    precio_promocional?: number;
    imagenes: string[];

    // Relations (joined)
    proveedor?: Proveedor;
}

export interface MovimientoInventario extends Models.Document {
    producto_id: string;
    tipo: 'entrada' | 'salida' | 'ajuste' | 'venta' | 'compra';
    cantidad: number;
    motivo?: string;
    fecha: string;
    usuario_id?: string;
    referencia?: string; // ID de orden o referencia externa
    notas?: string;
}

export interface CompraProveedor extends Models.Document {
    proveedor_id: string;
    fecha_compra: string;
    total: number;
    estado_pago: 'pendiente' | 'pagado';
    factura_referencia?: string;
    comprobante_url?: string;
    detalles_items?: string; // JSON string of items bought
    subtotal?: number;
    iva?: number;

    // Legacy/Schema Fields
    numeroCompra?: string;
    proveedorNombre?: string; // Flattened or joined
    estado?: string; // Legacy status 'recibida', 'pendiente'
    metodoPago?: string;
    creadoPor?: string;
    pagado?: boolean;
    monto_pagado?: number; // Total amount paid so far

    // Relations
    proveedor?: Proveedor;
}

export interface DetalleItemCompra {
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
}

export interface PagoCompra extends Models.Document {
    compra_id: string; // ID of the purchase
    monto: number;
    fecha_pago: string;
    metodo_pago: string;
    referencia?: string;
    notas?: string;
}
