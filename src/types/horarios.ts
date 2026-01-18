import { Models } from "appwrite";

/**
 * Horario especial de un empleado
 */
export interface HorarioEmpleado extends Models.Document {
    empleadoId: string;
    horarioEntrada: string; // HH:mm
    horarioSalida: string;
    diasLaborables?: string; // JSON array: ["lunes", "martes", ...]
    fechaInicio?: string;
    fechaFin?: string; // null = indefinido
    activo: boolean;
    notas?: string;
}

/**
 * Input para crear/actualizar horario
 */
export interface HorarioEmpleadoInput {
    empleadoId: string;
    horarioEntrada: string;
    horarioSalida: string;
    diasLaborables?: string[];
    fechaInicio?: string;
    fechaFin?: string;
    notas?: string;
}
