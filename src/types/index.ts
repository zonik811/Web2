import { Models } from "appwrite";

// Enums para estados y categorías
export enum EstadoCita {
    PENDIENTE = "pendiente",
    CONFIRMADA = "confirmada",
    EN_PROGRESO = "en-progreso",
    COMPLETADA = "completada",
    CANCELADA = "cancelada",
}

export enum CargoEmpleado {
    LIMPIADOR = "limpiador",
    SUPERVISOR = "supervisor",
    ESPECIALISTA = "especialista",
    TECNICO = "Técnico",
}


export enum ModalidadPago {
    HORA = "hora",
    SERVICIO = "servicio",
    FIJO_MENSUAL = "fijo_mensual",
}

export enum TipoPropiedad {
    CASA = "casa",
    APARTAMENTO = "apartamento",
    OFICINA = "oficina",
    LOCAL = "local",
}

// export enum CategoriaServicio {
//     RESIDENCIAL = "residencial",
//     COMERCIAL = "comercial",
//     ESPECIALIZADO = "especializado",
// }
export type CategoriaServicio = string;

export enum MetodoPago {
    EFECTIVO = "efectivo",
    TRANSFERENCIA = "transferencia",
    NEQUI = "nequi",
    BANCOLOMBIA = "bancolombia",
    POR_COBRAR = "por_cobrar",
}

export enum ConceptoPago {
    SERVICIO = "servicio",
    ANTICIPO = "anticipo",
    PAGO_MENSUAL = "pago_mensual",
    BONO = "bono",
    DEDUCCION = "deduccion",
}

export enum EstadoPago {
    PENDIENTE = "pendiente",
    PAGADO = "pagado",
    PARCIAL = "parcial",
}

// export enum TipoCliente {
//     RESIDENCIAL = "residencial",
//     COMERCIAL = "comercial",
// }
export type TipoCliente = string;

export enum NivelFidelidad {
    BRONCE = "bronce",
    PLATA = "plata",
    ORO = "oro",
    PLATINO = "platino",
}

export interface Logro {
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    fechaDesbloqueo: string;
}

export enum FrecuenciaCliente {
    UNICA = "unica",
    SEMANAL = "semanal",
    QUINCENAL = "quincenal",
    MENSUAL = "mensual",
}

// Interfaces principales

export interface Servicio {
    $id: string;
    nombre: string;
    slug: string;
    descripcion: string;
    descripcionCorta: string;
    categoria: CategoriaServicio;
    categorias?: string[]; // Array de strings (nombres de categorías)
    precioBase: number;
    unidadPrecio: "hora" | "metrocuadrado" | "servicio";
    duracionEstimada: number; // minutos
    imagen?: string; // Appwrite Storage ID
    caracteristicas: string[];
    requierePersonal: number; // cantidad mínima de empleados
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Empleado {
    $id: string;
    userId?: string; // Appwrite Auth (opcional para dashboard de empleado)
    nombre: string;
    apellido: string;
    documento: string; // Cédula/ID
    telefono: string;
    email: string;
    direccion: string;
    fechaNacimiento: string;
    fechaContratacion: string;
    cargo: CargoEmpleado;
    role: 'ADMIN' | 'RECEPCIONISTA' | 'TECNICO'; // NUEVO: Rol en el sistema de OT
    especialidades: string[]; // ['limpieza_profunda', 'ventanas', 'oficinas']
    tarifaPorHora: number; // o porcentaje del servicio
    modalidadPago: ModalidadPago;
    activo: boolean;
    foto?: string; // Storage ID
    documentos?: string[]; // Contratos, certificados (Storage IDs)
    calificacionPromedio: number;
    totalServicios: number; // Total servicios completados
    createdAt: string;
    updatedAt: string;
}

export interface Cita {
    $id: string;
    servicioId: string;
    servicio?: Servicio; // Populated
    categoriaSeleccionada?: string; // Categoría específica seleccionada al crear
    clienteId?: string;
    cliente?: Cliente; // Populated
    clienteNombre: string;
    clienteTelefono: string;
    clienteEmail: string;
    direccion: string;
    ciudad: string;
    tipoPropiedad: TipoPropiedad;
    metrosCuadrados?: number;
    habitaciones?: number;
    banos?: number;
    fechaCita: string; // ISO date
    horaCita: string; // "09:00"
    duracionEstimada: number; // minutos
    empleadosAsignados: string[]; // Array de IDs de empleados
    empleados?: Empleado[]; // Populated
    horasTrabajadas?: number; // Hours worked by employee (default 8)
    estado: EstadoCita;
    precioCliente: number; // Lo que cobra al cliente
    precioAcordado: number; // Lo real después de negociación
    metodoPago: MetodoPago;
    pagadoPorCliente: boolean;
    detallesAdicionales?: string;
    notasInternas?: string; // Notas solo para admin
    calificacionCliente?: number; // 1-5
    resenaCliente?: string;
    fotosAntes?: string[]; // Storage IDs
    fotosDespues?: string[]; // Storage IDs
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export interface PagoEmpleado {
    $id: string;
    empleadoId: string;
    empleado?: Empleado; // Populated
    citaId?: string; // Si es pago por servicio específico
    cita?: Cita; // Populated
    periodo: string; // "2026-01" para pagos mensuales
    concepto: ConceptoPago;
    monto: number;
    fechaPago?: string; // Cuando se pagó realmente
    metodoPago: MetodoPago;
    estado: EstadoPago;
    comprobante?: string; // Storage ID de comprobante de pago
    notas?: string;
    creadoPor: string; // userId del admin que creó el registro
    createdAt: string;
    updatedAt: string;
}

export interface Gasto {
    $id: string;
    categoria: string; // "transporte", "materiales", etc.
    concepto: string;
    monto: number;
    metodoPago: string; // "efectivo", "transferencia", etc.
    proveedor?: string;
    fecha: string; // ISO Date "YYYY-MM-DD"
    notas?: string;
    creadoPor?: string; // Admin ID
    createdAt: string;
    updatedAt: string;
}

export interface Cliente extends Models.Document {
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    ciudad: string;
    tipoCliente: TipoCliente;
    frecuenciaPreferida: FrecuenciaCliente;
    totalServicios: number;
    totalGastado: number;
    calificacionPromedio: number; // Cómo califican al servicio
    notasImportantes?: string; // Preferencias, alergias, instrucciones
    activo: boolean;
    // Loyalty
    puntosAcumulados?: number;
    nivelFidelidad?: string;
    ultimoServicio?: string;
}

// Tipos para formularios y DTOs


export interface CrearServicioInput {
    nombre: string;
    descripcion: string;
    descripcionCorta: string;
    categoria: CategoriaServicio;
    categorias?: string[];
    precioBase: number;
    unidadPrecio: "hora" | "metrocuadrado" | "servicio";
    duracionEstimada: number;
    caracteristicas: string[];
    requierePersonal: number;
    activo?: boolean;
    imagen?: File;
}

export interface ActualizarServicioInput extends Partial<CrearServicioInput> {
    id: string;
}

export interface CrearEmpleadoInput {
    nombre: string;
    apellido: string;
    documento: string;
    telefono: string;
    email: string;
    direccion: string;
    fechaNacimiento: string;
    fechaContratacion: string;
    cargo: CargoEmpleado;
    especialidades: string[];
    tarifaPorHora: number;
    modalidadPago: ModalidadPago;
    foto?: File;
}

export interface ActualizarEmpleadoInput extends Partial<CrearEmpleadoInput> {
    activo?: boolean;
}

export interface CrearCitaInput {
    servicioId?: string;
    categoriaSeleccionada?: string;
    clienteId?: string; // Si es cliente existente
    clienteNombre: string;
    clienteTelefono: string;
    clienteEmail: string;
    direccion: string;
    ciudad: string;
    tipoPropiedad: TipoPropiedad;
    metrosCuadrados?: number;
    habitaciones?: number;
    banos?: number;
    fechaCita: string;
    horaCita: string;
    duracionEstimada: number;
    empleadosAsignados?: string[];
    precioCliente: number;
    precioAcordado?: number;
    metodoPago: MetodoPago;
    detallesAdicionales?: string;
    notasInternas?: string;
}

export interface ActualizarCitaInput extends Partial<CrearCitaInput> {
    estado?: EstadoCita;
    pagadoPorCliente?: boolean;
    calificacionCliente?: number;
    resenaCliente?: string;
    horasTrabajadas?: number;
}

export interface RegistrarPagoInput {
    empleadoId: string;
    citaId?: string;
    periodo?: string;
    concepto: ConceptoPago;
    monto: number;
    fechaPago: string;
    metodoPago: MetodoPago;
    comprobante?: File;
    notas?: string;
}

// Tipos para respuestas y estadísticas

export interface EstadisticasEmpleado {
    totalServicios: number;
    horasTrabajadasMes: number;
    calificacionPromedio: number;
    totalGanado: number;
    pendientePorPagar: number;
}

export interface EstadisticasDashboard {
    citasHoy: number;
    citasEstaSemana: number;
    citasEsteMes: number;
    empleadosActivos: number;
    ingresosMes: number;
    // Missing fields restored
    pagosEmpleadosPendientes: number;
    clientesNuevos: number;
    // Loyalty
    puntosAcumulados?: number;
    nivelFidelidad?: string;
    serviciosCompletados?: number;
    totalGastado?: number;
}

export interface Direccion extends Models.Document {
    clienteId: string;
    nombre: string; // Ej: "Casa", "Oficina"
    direccion: string;
    ciudad: string;
    barrio?: string;
    coordenadas?: string;
    tipo: TipoPropiedad;
}

export interface HistorialPuntos extends Models.Document {
    clienteId: string;
    puntos: number;
    motivo: string;
    referenciaId?: string; // ID de cita relacionada
    fecha: string;
}

export interface ServicioNoPagado {
    cita: Cita;
    montoPagar: number;
    horasTrabajadas?: number;
}

export interface PendientePorPagar {
    totalPendiente: number;
    serviciosNoPagados: ServicioNoPagado[];
}

// Tipos para filtros

export interface FiltrosCitas {
    estado?: EstadoCita;
    empleadoId?: string;
    fechaInicio?: string;
    fechaFin?: string;
    clienteId?: string;
    pagadoPorCliente?: boolean;
}

export interface FiltrosEmpleados {
    cargo?: CargoEmpleado;
    activo?: boolean;
    especialidad?: string;
}

// Tipos de utilidad

export type CreateResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

export type UpdateResponse = {
    success: boolean;
    error?: string;
};

export type DeleteResponse = {
    success: boolean;
    error?: string;
};

// Comisiones
export enum EstadoComision {
    PENDIENTE = "pendiente",
    PAGADO = "pagado",
    ANULADO = "anulado"
}

export interface Comision {
    $id: string;
    empleadoId: string;
    monto: number;
    concepto: string;
    fecha: string; // ISO Date
    referenciaId?: string;
    ordenTrabajoId?: string; // NUEVO: Vincular comisión a OT
    procesoId?: string;      // NUEVO: Vincular a proceso específico
    pagado: boolean;
    estado: EstadoComision;
    observaciones?: string;
    createdAt: string;
}

export interface CrearComisionInput {
    empleadoId: string;
    monto: number;
    concepto: string;
    fecha: string;
    referenciaId?: string;
    observaciones?: string;
}

// Export all Work Order types
export * from './ordenes-trabajo';

// Export all Asistencia types
export * from './asistencia';

// Export all Permisos types
export * from './permisos';

// Export all Horarios types
export * from './horarios';

// Export all Vacaciones types
export * from './vacaciones';

// Export all Turnos types
export * from './turnos';

// Export all Horas Extras types
export * from './horas-extras';

// Export all Compensatorios types
export * from './compensatorios';

// Export all Banco Horas types
export * from './banco-horas';
