import { Models } from "appwrite";

export type EstadoCompensatorio = 'DISPONIBLE' | 'USADO' | 'VENCIDO';

export interface Compensatorio extends Models.Document {
    empleadoId: string;
    asistenciaId?: string;
    fechaGanado: string; // YYYY-MM-DD
    motivo: string;
    diasGanados: number;
    fechaVencimiento: string; // YYYY-MM-DD
    estado: EstadoCompensatorio;
    fechaUso?: string;
    usadoEnPermisoId?: string;
}

// Inputs

export interface CrearCompensatorioInput {
    empleadoId: string;
    asistenciaId?: string;
    fechaGanado: string;
    motivo: string;
    diasGanados?: number;
}
