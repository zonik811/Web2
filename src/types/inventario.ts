import { Models } from "node-appwrite";

export interface Proveedor {
    $id: string;
    nombre: string;
    nit_rut?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    nombre_contacto?: string;
    activo: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Producto {
    $id: string;
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
    createdAt?: string;
    updatedAt?: string;

    // Relations (joined)
    proveedor?: Proveedor;
}

export interface MovimientoInventario {
    $id: string;
    producto_id: string;
    tipo: 'entrada' | 'salida' | 'ajuste' | 'venta' | 'compra';
    cantidad: number;
    motivo?: string;
    fecha: string;
    usuario_id?: string;
    referencia?: string; // ID de orden o referencia externa
    notas?: string;
    createdAt?: string;
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

    // Relations
    proveedor?: Proveedor;
}

export interface DetalleItemCompra {
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
}

export interface PagoCompra {
    $id: string;
    compra_id: string; // ID of the purchase
    monto: number;
    fecha_pago: string;
    metodo_pago: string;
    referencia?: string;
    notas?: string;
    createdAt?: string;
}
