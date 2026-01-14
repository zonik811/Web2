// Nuevos tipos para las colecciones agregadas

import { Models } from "appwrite";

/**
 * Configuración de la empresa
 */
export interface EmpresaConfig extends Models.Document {
    // Información Básica
    nombre: string;
    nombreCompleto?: string;
    slogan?: string;
    telefono: string;
    email: string;
    direccion?: string;
    ciudad?: string;
    pais?: string;
    colorPrimario?: string;
    colorSecundario?: string;
    logo?: string;
    whatsapp?: string;

    // Hero Section
    heroBadge?: string;
    heroTitulo?: string; // Adding explicit title field too if missing, though it might use slogan/nombre
    heroDescripcion?: string;
    heroImagen?: string;
    ctaPrimario?: string;
    ctaSecundario?: string;
    ctaDescuento?: string;
    ctaDescuentoIcono?: string;

    // Estadísticas
    statClientes?: number;
    statServicios?: number;
    statProfesionales?: number;
    statSatisfaccion?: string;

    // CTA Final
    ctaFinalTitulo?: string;
    ctaFinalSubtitulo?: string;
    ctaFinalBoton?: string;
    ctaFinalImagen?: string;

    // Advanced Styling & Features
    branding_styles?: string; // JSON: { buttonShape, buttonEffect, fontStyle }
    catalogo_source?: string; // 'productos' | 'servicios' | 'manual'

    // Horarios
    horarioDias?: string;
    horarioHoras?: string;
    disponibilidad247?: boolean;

    // SEO
    metaDescripcion?: string;
    keywords?: string;

    // Configuración Avanzada (JSON Strings)
    landing_equipo?: string; // JSON: [{ nombre, cargo, fotoUrl }]
    landing_testimonios?: string; // JSON: [{ nombre, texto, calificacion, fecha }]
    landing_catalogo_ids?: string; // JSON: string[] con IDs de productos
    branding_colors?: string; // JSON: { primary, secondary }
}

/**
 * Categorías de productos o servicios
 */
export interface Categoria extends Models.Document {
    nombre: string;
    slug: string;
    descripcion?: string;
    icono?: string;
    imagen?: string;
    tipo: 'producto' | 'servicio';
    orden?: number;
}

/**
 * Producto del catálogo
 */
export interface Producto extends Models.Document {
    nombre: string;
    descripcion: string;
    categoria: string;
    precio: number;
    precioDescuento?: number;
    stock: number;
    imagenes?: string[];
    destacado?: boolean;
    sku?: string;
}

/**
 * Métodos de pago disponibles
 */
export interface MetodoPago extends Models.Document {
    nombre: string;
    codigo: string;
    descripcion?: string;
    icono?: string;
    requiereCuenta?: boolean;
    cuentaBancaria?: string;
    orden?: number;
}

/**
 * Estados de diferentes entidades
 */
export interface Estado extends Models.Document {
    nombre: string;
    codigo: string;
    tipo: 'cita' | 'orden' | 'pago' | 'compra';
    descripcion?: string;
    color?: string;
    icono?: string;
    orden?: number;
    esFinal?: boolean;
}

/**
 * Proveedor
 */
export interface Proveedor extends Models.Document {
    nombre: string;
    nit?: string;
    telefono: string;
    email?: string;
    direccion?: string;
    ciudad?: string;
    contacto?: string;
    categoria?: string;
    notas?: string;
}

/**
 * Orden de venta
 */
export interface Orden extends Models.Document {
    numeroOrden: string;
    clienteId?: string;
    clienteNombre: string;
    clienteTelefono: string;
    clienteEmail?: string;
    direccionEntrega?: string;
    items: string[];
    subtotal: number;
    descuento?: number;
    envio?: number;
    total: number;
    estado: 'pendiente' | 'confirmada' | 'en_preparacion' | 'enviada' | 'entregada' | 'cancelada';
    metodoPago: 'efectivo' | 'transferencia' | 'nequi' | 'contraentrega';
    pagado?: boolean;
    fechaOrden: string;
    fechaEntrega?: string;
    notas?: string;
}

/**
 * Compra a proveedor
 */
export interface Compra extends Models.Document {
    numeroCompra: string;
    proveedorId: string;
    items: string[];
    subtotal: number;
    impuestos?: number;
    total: number;
    estado: 'pendiente' | 'confirmada' | 'recibida' | 'cancelada';
    metodoPago: 'efectivo' | 'transferencia' | 'credito';
    pagado?: boolean;
    fechaCompra: string;
    fechaRecepcion?: string;
    comprobante?: string;
    notas?: string;
    creadoPor: string;
}

/**
 * Movimiento de inventario
 */
export interface MovimientoInventario extends Models.Document {
    productoId: string;
    tipo: 'entrada' | 'salida' | 'ajuste';
    cantidad: number;
    stockAnterior: number;
    stockNuevo: number;
    motivo: string;
    referenciaId?: string;
    notas?: string;
    creadoPor: string;
    fecha: string;
}

/**
 * Notificación
 */
export interface Notificacion extends Models.Document {
    usuarioId: string;
    tipo: 'info' | 'exito' | 'advertencia' | 'error';
    titulo: string;
    mensaje: string;
    icono?: string;
    url?: string;
    referenciaId?: string;
    referenciaTipo?: string;
    leida?: boolean;
    fechaCreacion: string;
    fechaLeida?: string;
}

/**
 * Perfil de usuario
 */
export interface UserProfile extends Models.Document {
    userId: string;
    rol: 'admin' | 'empleado' | 'cliente';
    nombre: string;
    apellido?: string;
    telefono?: string;
    avatar?: string;
    permisos?: string[];
    departamento?: string;
    cargo?: string;
    ultimoAcceso?: string;
    configuracion?: string;
}

/**
 * Estado de estilos dinámicos
 */
export interface DynamicStylesState {
    buttons: any[];
    badges: any[];
    cards: any[];
}
