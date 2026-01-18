import { Models } from "appwrite";

// Tipos de marcación
export type TipoMarcacion = 'ENTRADA' | 'SALIDA';

// Estado de asistencia
export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'RETARDO' | 'SALIDA_ANTICIPADA' | 'PERMISO' | 'VACACIONES';

/**
 * Registro de marcación de asistencia
 */
export interface Asistencia extends Models.Document {
    empleadoId: string;
    tipo: TipoMarcacion;
    fechaHora: string; // ISO datetime
    latitud?: number; // GPS opcional
    longitud?: number;
    marcadoPorAdminId?: string; // Si admin marcó manualmente
    notas?: string;
}

/**
 * Configuración global de asistencia
 */
export interface ConfiguracionAsistencia extends Models.Document {
    horarioEntrada: string; // "08:00"
    horarioSalida: string; // "18:00"
    minutosTolerancia: number; // 15
    requiereJustificacion: boolean;
}

/**
 * Input para registrar marcación
 */
export interface RegistrarMarcacionInput {
    empleadoId: string;
    tipo: TipoMarcacion;
    notas?: string;
    adminId?: string;
    fechaHora?: string; // Opcional, si admin marca con fecha/hora custom
}

/**
 * Resumen de asistencia de un día
 */
export interface ResumenAsistenciaDia {
    fecha: string;
    entrada?: Asistencia;
    salida?: Asistencia;
    horasTrabajadas: number;
    estado: EstadoAsistencia;
    minutosRetardo?: number;
}

/**
 * Estadísticas de asistencia de un empleado
 */
export interface EstadisticasAsistencia {
    totalDias: number;
    diasPresente: number;
    diasAusente: number;
    diasRetardo: number;
    porcentajePuntualidad: number;
    totalHorasTrabajadas: number;
    promedioHorasPorDia: number;
}
