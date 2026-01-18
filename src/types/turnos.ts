import { Models } from "appwrite";

/**
 * Representa un tipo de turno (catálogo)
 */
export interface Turno extends Models.Document {
    nombre: string;
    horaEntrada: string; // HH:MM
    horaSalida: string; // HH:MM
    color?: string; // Hex code
    activo: boolean;
}

/**
 * Asignación de un turno a un empleado en un rango de fechas
 */
export interface AsignacionTurno extends Models.Document {
    empleadoId: string;
    turnoId: string;
    fechaInicio: string; // YYYY-MM-DD
    fechaFin: string; // YYYY-MM-DD
    notas?: string;
    turno?: Turno; // Para join
}

// Inputs

export interface CrearTurnoInput {
    nombre: string;
    horaEntrada: string;
    horaSalida: string;
    color?: string;
}

export interface AsignarTurnoInput {
    empleadoId: string;
    turnoId: string;
    fechaInicio: string;
    fechaFin: string;
    notas?: string;
}
