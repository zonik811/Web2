"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import type { HistorialPuntos, CreateResponse, Cliente } from "@/types";

interface RegistrarPuntosInput {
    clienteId: string;
    puntos: number;
    motivo: string;
    referenciaId?: string; // ID de cita
    precioServicio?: number; // Precio del servicio para actualizar totalGastado
}

/**
 * Obtiene el historial de puntos de un cliente
 */
export async function obtenerHistorialPuntos(clienteId: string): Promise<HistorialPuntos[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HISTORIAL_PUNTOS,
            [
                Query.equal("clienteId", clienteId),
                Query.orderDesc("$createdAt")
            ]
        );
        return response.documents as unknown as HistorialPuntos[];
    } catch (error) {
        console.error("Error obteniendo historial puntos:", error);
        return [];
    }
}

/**
 * Registra un movimiento de puntos y actualiza el cliente
 */
export async function registrarPuntos(data: RegistrarPuntosInput): Promise<CreateResponse<HistorialPuntos>> {
    try {
        // 1. Crear registro en historial
        const historialDoc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.HISTORIAL_PUNTOS,
            ID.unique(),
            {
                clienteId: data.clienteId,
                puntos: data.puntos,
                motivo: data.motivo,
                referenciaId: data.referenciaId,
                fecha: new Date().toISOString()
            }
        );

        // 2. Actualizar el total en el cliente (Re-fetch para asegurar consistencia)
        const clienteDoc = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            data.clienteId
        );

        const cliente = clienteDoc as unknown as Cliente;
        const nuevosPuntos = (cliente.puntosAcumulados || 0) + data.puntos;
        const nuevoTotalGastado = (cliente.totalGastado || 0) + (data.precioServicio || 0);
        const nuevosServiciosCompletados = (cliente.totalServicios || 0) + 1;

        // Calcular nivel (Misma lógica que en citas.ts)
        let nuevoNivel = cliente.nivelFidelidad || "BRONCE";
        if (nuevosPuntos >= 20) nuevoNivel = "ORO";
        else if (nuevosPuntos >= 10) nuevoNivel = "PLATA";

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            data.clienteId,
            {
                puntosAcumulados: nuevosPuntos,
                nivelFidelidad: nuevoNivel,
                totalGastado: nuevoTotalGastado,
                totalServicios: nuevosServiciosCompletados
            }
        );

        return { success: true, data: historialDoc as unknown as HistorialPuntos };
    } catch (error: any) {
        console.error("Error registrando puntos:", error);
        return { success: false, error: error.message };
    }
}
