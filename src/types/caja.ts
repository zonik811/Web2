import { Models } from "node-appwrite";

export interface TurnoCaja extends Models.Document {
    usuario_id: string; // The cashier who opened it
    usuario_nombre?: string;
    usuario_cierre_id?: string; // The person who closed it
    fecha_apertura: string;
    fecha_cierre?: string;
    base_inicial: number;
    total_ventas_efectivo: number; // Calculated system total
    total_ventas_tarjeta: number; // Calculated system total
    total_ventas_transferencia: number; // Calculated system total
    efectivo_cierre?: number; // Declared by user
    tarjetas_cierre?: number; // Declared by user
    diferencia?: number; // Calculated (Declared - System)
    estado: 'abierta' | 'cerrada';
    observaciones?: string;
}

export interface MovimientoCaja extends Models.Document {
    turno_id: string;
    tipo: 'venta' | 'ingreso' | 'retiro';
    monto: number;
    descripcion: string;
    metodo_pago: string; // 'efectivo', 'tarjeta', etc.
    referencia_id?: string; // Optional link to a sale or other entity
    fecha: string;
    usuario_id: string; // Who made the movement
}
