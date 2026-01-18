import { Models } from "appwrite";

/**
 * Solicitud de vacaciones
 */
export interface Vacacion extends Models.Document {
    empleadoId: string;
    anio: number;
    fechaInicio: string;
    fechaFin: string;
    diasSolicitados: number;
    estado: EstadoVacacion;
    motivo?: string;
    aprobadoPor?: string;
    fechaAprobacion?: string;
    comentariosRechazo?: string;
}

/**
 * Saldo de vacaciones de un empleado
 */
export interface SaldoVacaciones extends Models.Document {
    empleadoId: string;
    anioActual: number;
    diasTotales: number; // Días totales por año
    diasUsados: number; // Días ya tomados
    diasPendientes: number; // Días en solicitudes pendientes
    diasDisponibles: number; // Calculado: total - usado - pendientes
}

/**
 * Estados de solicitud de vacaciones
 */
export type EstadoVacacion = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

/**
 * Input para solicitar vacaciones
 */
export interface SolicitarVacacionInput {
    empleadoId: string;
    fechaInicio: string;
    fechaFin: string;
    motivo?: string;
}

/**
 * Input para inicializar saldo
 */
export interface InicializarSaldoInput {
    empleadoId: string;
    anioActual: number;
    diasTotales: number;
}
