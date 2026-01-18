import { Models } from "appwrite";

// Tipos de permisos
export type TipoPermiso = 'PERMISO' | 'JUSTIFICACION' | 'LICENCIA';
export type EstadoPermiso = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

/**
 * Permiso o justificación de ausencia
 */
export interface Permiso extends Models.Document {
    empleadoId: string;
    tipo: TipoPermiso;
    subtipo?: string; // médico, personal, familiar, estudio
    fechaInicio: string;
    fechaFin: string;
    horaInicio?: string; // Para permisos parciales
    horaFin?: string;
    motivo: string;
    adjunto?: string; // Storage ID del archivo
    estado: EstadoPermiso;
    aprobadoPor?: string;
    fechaAprobacion?: string;
    comentarios?: string;
}

/**
 * Input para solicitar permiso
 */
export interface SolicitarPermisoInput {
    empleadoId: string;
    tipo: TipoPermiso;
    subtipo?: string;
    fechaInicio: string;
    fechaFin: string;
    horaInicio?: string;
    horaFin?: string;
    motivo: string;
    adjunto?: string;
}
