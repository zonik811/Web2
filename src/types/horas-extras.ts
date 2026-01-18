import { Models } from "appwrite";

export type TipoHoraExtra = 'DIURNA' | 'NOCTURNA' | 'DOMINICAL' | 'FESTIVA';
export type EstadoHoraExtra = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export interface HoraExtra extends Models.Document {
    empleadoId: string;
    asistenciaId?: string;
    fecha: string;        // YYYY-MM-DD
    horaInicio: string;   // HH:MM
    horaFin: string;      // HH:MM
    cantidadHoras: number;
    tipo: TipoHoraExtra;
    multiplicador: number;
    horasEquivalentes: number;
    motivo?: string;
    estado: EstadoHoraExtra;
    aprobadoPor?: string;
}

export interface DiaFestivo extends Models.Document {
    fecha: string; // YYYY-MM-DD
    nombre: string;
    esIrrenunciable: boolean;
    multiplicador: number;
}

// Inputs

export interface CrearHoraExtraInput {
    empleadoId: string;
    asistenciaId?: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    tipo: TipoHoraExtra;
    motivo?: string;
}

export interface CrearDiaFestivoInput {
    fecha: string;
    nombre: string;
    esIrrenunciable?: boolean;
    multiplicador?: number;
}
