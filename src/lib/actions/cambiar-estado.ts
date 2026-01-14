"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import type { EstadoOrdenTrabajo, UpdateResponse, OtProceso } from "@/types";
import { Query } from "node-appwrite";

/**
 * Validation result for state transitions
 */
interface ValidationResult {
    valid: boolean;
    message?: string;
}

/**
 * Validate if order can transition to EN_PROCESO state
 */
export async function validarTransicionEnProceso(ordenId: string): Promise<ValidationResult> {
    // No special validation needed for starting work
    return { valid: true };
}

/**
 * Validate if order can transition to POR_PAGAR state (all processes must be completed)
 */
export async function validarTransicionPorPagar(ordenId: string): Promise<ValidationResult> {
    try {
        // Get all processes for this order
        const procesosDoc = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.OT_PROCESOS,
            [Query.equal("ordenTrabajoId", ordenId)]
        );

        const procesos = procesosDoc.documents as unknown as OtProceso[];

        // Check if there are any processes
        if (procesos.length === 0) {
            return {
                valid: false,
                message: "La orden no tiene procesos registrados"
            };
        }

        // Check if all processes are completed
        const procesosIncompletos = procesos.filter(p => p.estado !== "COMPLETADO");

        if (procesosIncompletos.length > 0) {
            return {
                valid: false,
                message: `Hay ${procesosIncompletos.length} proceso(s) sin completar. Todos los procesos deben estar en estado COMPLETADO.`
            };
        }

        return { valid: true };
    } catch (error: any) {
        console.error("Error validando transición:", error);
        return {
            valid: false,
            message: "Error al validar procesos"
        };
    }
}

/**
 * Validate if order can transition to COMPLETADA state (must be fully paid)
 */
export async function validarTransicionCompletada(ordenId: string): Promise<ValidationResult> {
    try {
        // Get invoice
        const facturasDoc = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FACTURAS || "facturas",
            [Query.equal("ordenTrabajoId", ordenId)]
        );

        if (facturasDoc.documents.length === 0) {
            return {
                valid: false,
                message: "No hay factura generada para esta orden"
            };
        }

        const factura = facturasDoc.documents[0] as any;

        // Get all payments
        const pagosDoc = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PAGOS_CLIENTES || "pagos_clientes",
            [Query.equal("ordenTrabajoId", ordenId)]
        );

        const totalPagado = pagosDoc.documents.reduce((sum: number, pago: any) => sum + pago.monto, 0);

        if (totalPagado < factura.total) {
            const saldoPendiente = factura.total - totalPagado;
            return {
                valid: false,
                message: `Saldo pendiente: $${saldoPendiente.toLocaleString()}. La orden debe estar completamente pagada.`
            };
        }

        return { valid: true };
    } catch (error: any) {
        console.error("Error validando pago:", error);
        // If collections don't exist yet, allow transition
        if (error.code === 404) {
            return { valid: true };
        }
        return {
            valid: false,
            message: "Error al validar pagos"
        };
    }
}

/**
 * Change order state with validation
 */
export async function cambiarEstadoOrden(
    ordenId: string,
    nuevoEstado: EstadoOrdenTrabajo,
    observaciones?: string
): Promise<UpdateResponse> {
    try {
        // Get current order
        const orden = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            ordenId
        );

        const estadoActual = orden.estado as EstadoOrdenTrabajo;

        // Validate transition based on target state
        let validation: ValidationResult = { valid: true };

        if (nuevoEstado === "EN_PROCESO") {
            validation = await validarTransicionEnProceso(ordenId);
        } else if (nuevoEstado === "POR_PAGAR") {
            validation = await validarTransicionPorPagar(ordenId);
        } else if (nuevoEstado === "COMPLETADA") {
            validation = await validarTransicionCompletada(ordenId);
        }

        if (!validation.valid) {
            return {
                success: false,
                error: validation.message || "No se puede cambiar al estado solicitado"
            };
        }

        // Update order state
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            ordenId,
            {
                estado: nuevoEstado,
                updatedAt: new Date().toISOString()
            }
        );

        // TODO: Log state change in history with observaciones

        return { success: true };
    } catch (error: any) {
        console.error("Error cambiando estado:", error);
        return {
            success: false,
            error: error.message || "Error al cambiar estado"
        };
    }
}

export type { ValidationResult };
