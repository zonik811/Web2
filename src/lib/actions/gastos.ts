"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";

export interface RegistrarGastoInput {
    categoria: string;
    concepto: string;
    monto: number;
    metodoPago: string;
    proveedor?: string;
    fecha: string;
    comprobante?: string;
    notas?: string;
}

export interface Gasto {
    $id: string;
    categoria: string;
    concepto: string;
    monto: number;
    metodoPago: string;
    proveedor?: string;
    fecha: string;
    comprobante?: string;
    notas?: string;
    createdAt: string;
}

/**
 * Obtiene todos los gastos con filtros opcionales
 */
export async function obtenerGastos(filters?: {
    categoria?: string;
    fechaInicio?: string;
    fechaFin?: string;
}): Promise<Gasto[]> {
    try {
        const queries = [
            Query.orderDesc('fecha'),
            Query.limit(100)
        ];

        if (filters?.categoria && filters.categoria !== "todos") {
            queries.push(Query.equal('categoria', filters.categoria));
        }

        if (filters?.fechaInicio) {
            queries.push(Query.greaterThanEqual('fecha', filters.fechaInicio));
        }

        if (filters?.fechaFin) {
            queries.push(Query.lessThanEqual('fecha', filters.fechaFin));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.GASTOS,
            queries
        );
        return response.documents as unknown as Gasto[];
    } catch (error: any) {
        console.error("Error obteniendo gastos:", error);
        return [];
    }
}

/**
 * Registra un nuevo gasto
 */
export async function registrarGasto(data: RegistrarGastoInput): Promise<{ success: boolean; data?: Gasto; error?: string }> {
    try {
        const gastoData = {
            ...data,
            createdAt: new Date().toISOString()
        };

        const newGasto = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.GASTOS,
            ID.unique(),
            gastoData
        );


        return { success: true, data: newGasto as unknown as Gasto };
    } catch (error: any) {
        console.error("❌ Error registrando gasto:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza un gasto existente
 */
export async function actualizarGasto(gastoId: string, data: Partial<RegistrarGastoInput>): Promise<{ success: boolean; data?: Gasto; error?: string }> {
    try {
        const updatedGasto = await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.GASTOS,
            gastoId,
            data
        );


        return { success: true, data: updatedGasto as unknown as Gasto };
    } catch (error: any) {
        console.error("❌ Error actualizando gasto:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Elimina un gasto
 */
export async function eliminarGasto(gastoId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.GASTOS,
            gastoId
        );

        return { success: true };
    } catch (error: any) {
        console.error("❌ Error eliminando gasto:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene estadísticas de gastos por categoría
 */
export async function obtenerGastosPorCategoria(): Promise<{ [key: string]: number }> {
    try {
        const gastos = await obtenerGastos();
        const stats: { [key: string]: number } = {};

        gastos.forEach(gasto => {
            if (!stats[gasto.categoria]) {
                stats[gasto.categoria] = 0;
            }
            stats[gasto.categoria] += gasto.monto;
        });

        return stats;
    } catch (error) {
        console.error("Error obteniendo stats de gastos:", error);
        return {};
    }
}
