"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    Compensatorio,
    CrearCompensatorioInput
} from "@/types";

export async function obtenerCompensatoriosDisponibles(empleadoId: string): Promise<Compensatorio[]> {
    try {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMPENSATORIOS,
                [
                    Query.equal("empleadoId", empleadoId),
                    Query.equal("estado", "DISPONIBLE"),
                    Query.orderAsc("fechaVencimiento")
                ]
            );
            return response.documents as unknown as Compensatorio[];
        } catch (error: any) {
            // If attribute 'estado' is missing, fall back to in-memory filtering
            if (error.message?.includes("Attribute not found")) {
                console.warn("Attribute 'estado' missing in schema, filtering in memory");
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.COMPENSATORIOS,
                    [Query.equal("empleadoId", empleadoId)]
                );
                const docs = response.documents as unknown as Compensatorio[];
                return docs.filter(d => d.estado === "DISPONIBLE").sort((a, b) =>
                    new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()
                );
            }
            throw error;
        }
    } catch (error) {
        console.error("Error al obtener compensatorios:", error);
        return [];
    }
}

export async function generarCompensatorio(data: CrearCompensatorioInput): Promise<{ success: boolean; error?: string }> {
    try {
        // Calcular vencimiento (ej: 6 meses)
        const fechaGanado = new Date(data.fechaGanado);
        const fechaVencimiento = new Date(fechaGanado);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6);

        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.COMPENSATORIOS,
            ID.unique(),
            {
                ...data,
                diasGanados: data.diasGanados || 1.0,
                estado: 'DISPONIBLE',
                fechaVencimiento: fechaVencimiento.toISOString().split('T')[0]
            }
        );

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function redimirCompensatorio(compensatorioId: string, fechaUso: string): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.COMPENSATORIOS,
            compensatorioId,
            {
                estado: 'USADO',
                fechaUso: fechaUso
            }
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function obtenerHistorialCompensatorios(empleadoId: string): Promise<Compensatorio[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMPENSATORIOS,
            [
                Query.equal("empleadoId", empleadoId),
                Query.orderDesc("fechaGanado")
            ]
        );
        return response.documents as unknown as Compensatorio[];
    } catch (error) {
        console.error("Error al obtener historial compensatorios:", error);
        return [];
    }
}

/**
 * Obtener todos los compensatorios (Vista Admin)
 */
export async function obtenerTodosLosCompensatorios(estado?: string): Promise<Compensatorio[]> {
    try {
        const queries = [
            Query.orderDesc("fechaVencimiento")
        ];

        if (estado) {
            queries.push(Query.equal("estado", estado));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMPENSATORIOS,
            queries
        );

        return response.documents as unknown as Compensatorio[];
    } catch (error: any) {
        // Fallback or Schema error
        console.error("Error al obtener todos los compensatorios:", error);

        // Try in memory if index missing
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMPENSATORIOS,
                []
            );
            let docs = response.documents as unknown as Compensatorio[];
            if (estado) {
                docs = docs.filter(d => d.estado === estado);
            }
            return docs.sort((a, b) => new Date(b.fechaVencimiento).getTime() - new Date(a.fechaVencimiento).getTime());
        } catch (e) {
            return [];
        }
    }
}
