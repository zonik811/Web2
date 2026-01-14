"use server";

import { databases, storage } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS, STORAGE_BUCKET_ID } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";

export interface RegistrarPagoInput {
    empleadoId: string;
    citaId?: string;
    periodo: string;
    concepto: string;
    monto: number;
    metodoPago: string;
    estado?: string;
    comprobante?: string;
    notas?: string;
    fechaPago: string;
}

export interface Pago {
    $id: string;
    empleadoId: string;
    citaId?: string;
    periodo: string;
    concepto: string;
    monto: number;
    metodoPago: string;
    estado: string;
    comprobante?: string;
    notas?: string;
    fechaPago: string;
    createdAt: string;
    updatedAt?: string;
}

/**
 * Obtiene el historial de pagos de un empleado
 */
export async function obtenerPagosEmpleado(empleadoId: string): Promise<Pago[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PAGOS_EMPLEADOS,
            [
                Query.equal('empleadoId', empleadoId),
                Query.orderDesc('fechaPago'),
                Query.limit(100)
            ]
        );

        return response.documents as unknown as Pago[];
    } catch (error: any) {
        console.error("Error obteniendo pagos:", error);
        return [];
    }
}

/**
 * Registra un nuevo pago a un empleado
 */
export async function registrarPago(data: RegistrarPagoInput): Promise<{ success: boolean; data?: Pago; error?: string }> {
    try {
        const pagoData = {
            ...data,
            estado: data.estado || 'pagado',
            createdAt: new Date().toISOString()
        };

        const newPago = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PAGOS_EMPLEADOS,
            ID.unique(),
            pagoData
        );


        return { success: true, data: newPago as unknown as Pago };
    } catch (error: any) {
        console.error("❌ Error registrando pago:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Elimina un pago
 */
export async function eliminarPago(pagoId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const pago = await databases.getDocument(DATABASE_ID, COLLECTIONS.PAGOS_EMPLEADOS, pagoId);

        if (pago.comprobante) {
            try {
                await storage.deleteFile(STORAGE_BUCKET_ID, pago.comprobante);

            } catch (storageError) {
                console.error(`⚠️ Error eliminando comprobante ${pago.comprobante}:`, storageError);
            }
        }

        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.PAGOS_EMPLEADOS,
            pagoId
        );


        return { success: true };
    } catch (error: any) {
        console.error("❌ Error eliminando pago:", error);
        return { success: false, error: error.message };
    }
}
