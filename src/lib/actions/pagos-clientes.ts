"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type { CreateResponse } from "@/types";

/**
 * Pago interface
 */
/**
 * Pago interface
 */
export interface PagoCliente {
    $id: string;
    ordenTrabajoId?: string;
    citaId?: string | string[];
    clienteId?: string;
    facturaId?: string;
    monto: number;
    metodoPago: string;
    metodoPago2?: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';
    estado?: string;
    fecha: string;
    fechaPago: string;
    comprobante?: string;
    notas?: string;
    createdAt: string;
}

/**
 * Register payment
 */
export async function registrarPago(data: {
    ordenTrabajoId?: string;
    citaId?: string;
    clienteId?: string;
    facturaId?: string;
    monto: number;
    metodoPago?: string;
    metodoPago2?: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';
    estado?: string;
    referencia?: string;
    observaciones?: string;
    notas?: string;
    fecha?: string;
    fechaPago?: string;
    comprobante?: string;
}): Promise<CreateResponse<PagoCliente>> {
    try {
        const pago = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PAGOS_CLIENTES,
            ID.unique(),
            {
                citaId: data.citaId || "0",
                clienteId: data.clienteId,
                ordenTrabajoId: data.ordenTrabajoId || "0",
                facturaId: data.facturaId || "",
                monto: data.monto,
                metodoPago: data.metodoPago || "efectivo",
                metodoPago2: data.metodoPago2,
                estado: data.estado || "pagado",
                fecha: data.fecha || new Date().toISOString(),
                fechaPago: data.fechaPago || (data.fecha || new Date().toISOString()).substring(0, 10),
                comprobante: data.comprobante || data.referencia || "",
                notas: data.notas || data.observaciones || "",
                createdAt: new Date().toISOString()
            }
        );

        return {
            success: true,
            data: pago as unknown as PagoCliente
        };
    } catch (error: any) {
        console.error("Error registrando pago:", error);
        return {
            success: false,
            error: error.message || "Error al registrar pago"
        };
    }
}

/**
 * Get all payments for order
 */
export async function obtenerPagosOrden(ordenId: string): Promise<PagoCliente[]> {
    try {
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PAGOS_CLIENTES,
            [
                Query.equal("ordenTrabajoId", ordenId),
                Query.orderDesc("fecha")
            ]
        );

        return result.documents as unknown as PagoCliente[];
    } catch (error: any) {
        console.error("Error obteniendo pagos:", error);
        return [];
    }
}

/**
 * Calculate remaining balance
 */
export async function calcularSaldoPendiente(ordenId: string): Promise<number> {
    try {
        // Get invoice total
        const facturasDoc = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FACTURAS,
            [Query.equal("ordenTrabajoId", ordenId)]
        );

        if (facturasDoc.documents.length === 0) {
            return 0;
        }

        const factura = facturasDoc.documents[0] as any;
        const total = factura.total;

        // Get all payments
        const pagos = await obtenerPagosOrden(ordenId);
        const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);

        return total - totalPagado;
    } catch (error: any) {
        console.error("Error calculando saldo:", error);
        return 0;
    }
}

/**
 * Check if order is fully paid
 */
export async function verificarPagoCompleto(ordenId: string): Promise<boolean> {
    const saldo = await calcularSaldoPendiente(ordenId);
    return saldo <= 0;
}

/**
 * Get all client payments
 */
export async function obtenerPagosClientes(): Promise<PagoCliente[]> {
    try {
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PAGOS_CLIENTES,
            [
                Query.orderDesc("fecha")
            ]
        );

        return result.documents as unknown as PagoCliente[];
    } catch (error: any) {
        console.error("Error obteniendo todos los pagos:", error);
        return [];
    }
}

/**
 * Delete customer payment
 */
export async function eliminarPagoCliente(id: string): Promise<CreateResponse<void>> {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.PAGOS_CLIENTES,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando pago:", error);
        return { success: false, error: error.message };
    }
}

// Alias for compatibility
export const registrarPagoCliente = registrarPago;
