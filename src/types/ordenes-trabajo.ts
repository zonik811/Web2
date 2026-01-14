import { Models } from "appwrite";
import type { Cliente, Empleado } from ".";

// ==================== TIPOS BASE ====================

export type TipoVehiculo = 'CAMION' | 'PICKUP' | 'BUS' | 'OTRO';
export type TipoCombustible = 'DIESEL' | 'GASOLINA' | 'HIBRIDO';
export type EstadoOrdenTrabajo = 'COTIZANDO' | 'ACEPTADA' | 'EN_PROCESO' | 'POR_PAGAR' | 'COMPLETADA' | 'ENTREGADA' | 'CANCELADA';
export type PrioridadOrden = 'NORMAL' | 'URGENTE';
export type EstadoProceso = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO';
export type TipoChecklist = 'RECEPCION' | 'ENTREGA';
export type ResultadoPrueba = 'APROBADA' | 'FALLIDA' | 'PENDIENTE';
export type EstadoAutorizacion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
export type EstadoSolicitudRepuesto = 'SOLICITADO' | 'PEDIDO' | 'RECIBIDO' | 'CANCELADO';
export type RolEmpleado = 'ADMIN' | 'RECEPCIONISTA' | 'TECNICO';

// ==================== INTERFACES PRINCIPALES ====================

/**
 * Vehículo del cliente
 */
export interface Vehiculo extends Models.Document {
    clienteId: string;
    marca: string;
    modelo: string;
    ano: number;  // Cambiado de "año" a "ano" por limitación Appwrite
    placa: string;
    vin?: string;
    tipoVehiculo: TipoVehiculo;
    tipoCombustible: TipoCombustible;
    kilometraje: number;
    color?: string;
    observaciones?: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Orden de Trabajo principal
 */
export interface OrdenTrabajo extends Models.Document {
    numeroOrden: string;

    // Referencias
    clienteId: string;
    vehiculoId: string;

    // Fechas
    fechaIngreso: string;
    fechaEstimadaEntrega: string;
    fechaRealEntrega?: string;

    // Estado
    estado: EstadoOrdenTrabajo;
    prioridad: PrioridadOrden;

    // Problema
    motivoIngreso: string;
    diagnosticoInicial?: string;

    // Cotización
    cotizacionAprobada: boolean;
    fechaCotizacion?: string;
    fechaAprobacion?: string;

    // Costos
    subtotal: number;
    aplicarIva: boolean;
    porcentajeIva: number;
    impuestos: number;
    total: number;

    // Garantía
    tieneGarantia: boolean;
    diasGarantia?: number;
    fechaVencimientoGarantia?: string;

    createdAt: string;
    updatedAt: string;
}

/**
 * Proceso/Etapa dentro de una orden
 */
export interface OtProceso extends Models.Document {
    ordenTrabajoId: string;

    nombre: string;
    descripcion: string;
    orden: number;

    estado: EstadoProceso;

    // Personal
    tecnicoResponsableId: string;
    tecnicoAuxiliarId?: string;

    // Tiempo
    fechaInicio?: string;
    fechaFin?: string;
    horasEstimadas: number;
    horasReales?: number;

    // Costos
    costoManoObra: number;

    createdAt: string;
    updatedAt: string;
}

/**
 * Actividad/tarea específica dentro de un proceso
 */
export interface OtActividad extends Models.Document {
    procesoId: string;
    ordenTrabajoId: string;

    descripcion: string;
    notas?: string;

    empleadoId: string;
    fechaHora: string;
    horasTrabajadas: number;

    imagenes: string[];

    createdAt: string;
}

/**
 * Repuesto utilizado en un proceso
 */
export interface OtRepuesto extends Models.Document {
    ordenTrabajoId: string;
    procesoId: string;

    repuestoId: string;
    nombreRepuesto: string;

    cantidad: number;
    precioUnitario: number;
    subtotal: number;

    empleadoQueSolicito: string;
    fechaUso: string;

    createdAt: string;
}

/**
 * Prueba realizada en un proceso
 */
export interface OtPrueba extends Models.Document {
    procesoId: string;
    ordenTrabajoId: string;

    tipoPrueba: string;
    resultado: ResultadoPrueba;
    observaciones: string;

    imagenes: string[];
    videos?: string[];

    tecnicoId: string;
    fechaHora: string;

    createdAt: string;
}

/**
 * Checklist de inspección del vehículo
 */
export interface OtChecklistVehiculo extends Models.Document {
    ordenTrabajoId: string;
    tipo: TipoChecklist;

    // Items de inspección
    estadoLlantas: string;
    nivelCombustible: number;
    kilometraje: number;
    rayonesNotados: string;
    objetosValor: string;

    // Checklist detallado
    estadoCarroceria: string;
    estadoInterior: string;
    lucesOperativas: boolean;
    frenosOperativos: boolean;
    observacionesGenerales?: string;

    // Evidencias
    fotosVehiculo: string[];

    // Firma
    firmaClienteUrl?: string;
    nombreClienteFirma: string;

    empleadoInspectorId: string;
    fechaHora: string;

    createdAt: string;
}

/**
 * Autorización para trabajo adicional
 */
export interface OtAutorizacion extends Models.Document {
    ordenTrabajoId: string;
    procesoId?: string;

    descripcionProblema: string;
    trabajoAdicionalRequerido: string;
    urgente: boolean;

    costoEstimadoRepuestos: number;
    costoEstimadoManoObra: number;
    costoTotal: number;

    estado: EstadoAutorizacion;

    solicitadoPor: string;
    fechaSolicitud: string;
    fechaRespuesta?: string;
    respuestaPor?: string;
    motivoRechazo?: string;

    fotosProblema: string[];

    createdAt: string;
    updatedAt: string;
}

/**
 * Solicitud de repuesto no en inventario
 */
export interface OtSolicitudRepuesto extends Models.Document {
    ordenTrabajoId: string;
    procesoId: string;

    nombreRepuesto: string;
    codigoReferencia?: string;
    descripcion: string;
    cantidad: number;
    urgente: boolean;

    estado: EstadoSolicitudRepuesto;

    proveedorId?: string;
    nombreProveedor?: string;
    costoEstimado?: number;
    costoReal?: number;

    fechaSolicitud: string;
    fechaPedido?: string;
    fechaRecepcion?: string;
    fechaEstimadaLlegada?: string;

    solicitadoPor: string;
    pedidoPor?: string;

    observaciones?: string;

    createdAt: string;
    updatedAt: string;
}

/**
 * Plantilla reutilizable de procesos
 */
export interface OtPlantillaProceso extends Models.Document {
    nombre: string;
    descripcion: string;

    procesos: Array<{
        nombre: string;
        descripcion: string;
        orden: number;
        horasEstimadas: number;
        repuestosComunes?: Array<{
            nombreRepuesto: string;
            cantidad: number;
        }>;
    }>;

    costoEstimadoTotal: number;

    vecesUsada: number;
    activa: boolean;
    createdBy: string;

    createdAt: string;
    updatedAt: string;
}

// ==================== INPUTS PARA CREAR/ACTUALIZAR ====================

export interface CrearVehiculoInput {
    clienteId: string;
    marca: string;
    modelo: string;
    ano: number;  // Cambiado de "año" a "ano"
    placa: string;
    vin?: string;
    tipoVehiculo: TipoVehiculo;
    tipoCombustible: TipoCombustible;
    kilometraje: number;
    color?: string;
    imagenUrl?: string;  // URL de la imagen del vehículo
    observaciones?: string;
}

export interface CrearOrdenTrabajoInput {
    clienteId: string;
    vehiculoId: string;
    fechaIngreso: string;
    fechaEstimadaEntrega: string;
    motivoIngreso: string;
    diagnosticoInicial?: string;
    prioridad: PrioridadOrden;
    tieneGarantia: boolean;
    diasGarantia?: number;
}

export interface CrearOtProcesoInput {
    ordenTrabajoId: string;
    nombre: string;
    descripcion: string;
    orden: number;
    tecnicoResponsableId: string;
    tecnicoAuxiliarId?: string;
    horasEstimadas: number;
}

export interface CrearOtActividadInput {
    procesoId: string;
    ordenTrabajoId: string;
    descripcion: string;
    notas?: string;
    empleadoId: string;
    horasTrabajadas: number;
    imagenes?: string[];
}

export interface CrearOtRepuestoInput {
    ordenTrabajoId: string;
    procesoId: string;
    repuestoId: string;
    nombreRepuesto: string;
    cantidad: number;
    precioUnitario: number;
    empleadoQueSolicito: string;
}

export interface CrearOtPruebaInput {
    procesoId: string;
    ordenTrabajoId: string;
    tipoPrueba: string;
    resultado: ResultadoPrueba;
    observaciones: string;
    tecnicoId: string;
    imagenes?: string[];
    videos?: string[];
}

export interface CrearOtChecklistInput {
    ordenTrabajoId: string;
    tipo: TipoChecklist;
    estadoLlantas: string;
    nivelCombustible: number;
    kilometraje: number;
    rayonesNotados: string;
    objetosValor: string;
    estadoCarroceria: string;
    estadoInterior: string;
    lucesOperativas: boolean;
    frenosOperativos: boolean;
    observacionesGenerales?: string;
    fotosVehiculo: string[];
    nombreClienteFirma: string;
    empleadoInspectorId: string;
    firmaClienteUrl?: string;
    fechaHora: string;
}

export interface CrearOtAutorizacionInput {
    ordenTrabajoId: string;
    procesoId?: string;
    descripcionProblema: string;
    trabajoAdicionalRequerido: string;
    urgente: boolean;
    costoEstimadoRepuestos: number;
    costoEstimadoManoObra: number;
    solicitadoPor: string;
    fotosProblema?: string[];
}

export interface CrearOtSolicitudRepuestoInput {
    ordenTrabajoId: string;
    procesoId: string;
    nombreRepuesto: string;
    codigoReferencia?: string;
    descripcion: string;
    cantidad: number;
    urgente: boolean;
    solicitadoPor: string;
}

export interface CrearPlantillaProcesoInput {
    nombre: string;
    descripcion: string;
    procesos: Array<{
        nombre: string;
        descripcion: string;
        orden: number;
        horasEstimadas: number;
        repuestosComunes?: Array<{
            nombreRepuesto: string;
            cantidad: number;
        }>;
    }>;
    costoEstimadoTotal: number;
    createdBy: string;
}

// ==================== TIPOS DE RESPUESTA ====================

export interface OtConDetalles extends OrdenTrabajo {
    cliente?: Cliente;
    vehiculo?: Vehiculo;
    procesos?: OtProceso[];
    checklist?: OtChecklistVehiculo[];
    autorizaciones?: OtAutorizacion[];
    comisiones?: any[];
    factura?: any | null;
    pagos?: any[];
}

export interface ProcesoConDetalles extends OtProceso {
    actividades?: OtActividad[];
    repuestos?: OtRepuesto[];
    pruebas?: OtPrueba[];
    tecnicoResponsable?: Empleado;
    tecnicoAuxiliar?: Empleado;
}
