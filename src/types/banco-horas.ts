import { Models } from "appwrite";

export type TipoMovimientoBanco = 'DEUDA' | 'ABONO';
export type OrigenMovimientoBanco = 'RETARDO' | 'SALIDA_ANTICIPADA' | 'PERMISO_NO_REMUNERADO' | 'HORA_EXTRA_CANJEADA' | 'AJUSTE_MANUAL';

export interface MovimientoBancoHoras extends Models.Document {
    empleadoId: string;
    fecha: string; // YYYY-MM-DD
    tipo: TipoMovimientoBanco;
    origen: OrigenMovimientoBanco;
    cantidadMinutos: number;
    asistenciaId?: string;
    notas?: string;
    saldoAcumulado?: number;
}

// Inputs

export interface CrearMovimientoBancoInput {
    empleadoId: string;
    fecha: string;
    tipo: TipoMovimientoBanco;
    origen: OrigenMovimientoBanco;
    cantidadMinutos: number;
    asistenciaId?: string;
    notas?: string;
}
