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

export enum CategoriaServicio {
    RESIDENCIAL = "residencial",
    COMERCIAL = "comercial",
    ESPECIALIZADO = "especializado",
}

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

export enum TipoCliente {
    RESIDENCIAL = "residencial",
    COMERCIAL = "comercial",
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
    especialidades: string[]; // ['limpieza_profunda', 'ventanas', 'oficinas']
    tarifaPorHora: number; // o porcentaje del servicio
    modalidadPago: ModalidadPago;
    activo: boolean;
    foto?: string; // Storage ID
    documentos?: string[]; // Contratos, certificados (Storage IDs)
    calificacionPromedio: number;
    totalServicios: number;
    createdAt: string;
    updatedAt: string;
}

export interface Cita {
    $id: string;
    servicioId: string;
    servicio?: Servicio; // Populated
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

export interface Cliente {
    $id: string;
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
    createdAt: string;
    ultimoServicio?: string;
}

// Tipos para formularios y DTOs

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
    servicioId: string;
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
    pagosEmpleadosPendientes: number;
    serviciosCompletados: number;
    clientesNuevos: number;
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
