"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    OtProceso,
    CrearOtProcesoInput,
    ProcesoConDetalles,
    CreateResponse,
    UpdateResponse,
    DeleteResponse,
    EstadoProceso,
} from "@/types";

/**
 * Obtiene procesos de una orden
 */
export async function obtenerProcesosPorOrden(ordenTrabajoId: string): Promise<OtProceso[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.OT_PROCESOS,
            [
                Query.equal("ordenTrabajoId", ordenTrabajoId),
                Query.orderAsc("orden")
            ]
        );

        return response.documents as unknown as OtProceso[];
    } catch (error: any) {
        console.error("Error obteniendo procesos:", error);
        return [];
    }
}

/**
 * Obtiene un proceso con todos sus detalles
 */
export async function obtenerProcesoConDetalles(procesoId: string): Promise<ProcesoConDetalles> {
    try {
        const [proceso, actividades, repuestos, pruebas] = await Promise.all([
            databases.getDocument(DATABASE_ID, COLLECTIONS.OT_PROCESOS, procesoId),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_ACTIVIDADES, [
                Query.equal("procesoId", procesoId),
                Query.orderDesc("fechaHora")
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_REPUESTOS, [
                Query.equal("procesoId", procesoId),
                Query.orderDesc("fechaUso")
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_PRUEBAS, [
                Query.equal("procesoId", procesoId),
                Query.orderDesc("fechaHora")
            ])
        ]);

        return {
            ...(proceso as unknown as OtProceso),
            actividades: actividades.documents as any[],
            repuestos: repuestos.documents as any[],
            pruebas: pruebas.documents as any[],
        };
    } catch (error: any) {
        console.error("Error obteniendo proceso con detalles:", error);
        throw new Error(error.message || "Error al obtener detalles del proceso");
    }
}

/**
 * Crea un nuevo proceso
 */
export async function crearProceso(data: CrearOtProcesoInput): Promise<CreateResponse<OtProceso>> {
    try {
        const procesoData = {
            ordenTrabajoId: data.ordenTrabajoId,
            nombre: data.nombre,
            descripcion: data.descripcion,
            orden: data.orden,
            estado: 'PENDIENTE' as EstadoProceso,
            tecnicoResponsableId: data.tecnicoResponsableId,
            tecnicoAuxiliarId: data.tecnicoAuxiliarId,
            horasEstimadas: data.horasEstimadas,
            costoManoObra: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const nuevoProceso = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.OT_PROCESOS,
            ID.unique(),
            procesoData
        );

        return {
            success: true,
            data: nuevoProceso as unknown as OtProceso,
        };
    } catch (error: any) {
        console.error("Error creando proceso:", error);
        return {
            success: false,
            error: error.message || "Error al crear proceso",
        };
    }
}

/**
 * Actualiza un proceso
 */
export async function actualizarProceso(
    id: string,
    data: Partial<OtProceso>
): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.OT_PROCESOS,
            id,
            {
                ...data,
                updatedAt: new Date().toISOString(),
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando proceso:", error);
        return {
            success: false,
            error: error.message || "Error al actualizar proceso",
        };
    }
}

/**
 * Inicia un proceso
 */
export async function iniciarProceso(procesoId: string): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.OT_PROCESOS,
            procesoId,
            {
                estado: 'EN_PROGRESO',
                fechaInicio: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error iniciando proceso:", error);
        return {
            success: false,
            error: error.message || "Error al iniciar proceso",
        };
    }
}

/**
 * Completa un proceso y calcula costo de mano de obra
 */
export async function completarProceso(
    procesoId: string,
    horasReales: number,
    tarifaPorHora: number
): Promise<UpdateResponse> {
    try {
        const costoManoObra = horasReales * tarifaPorHora;

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.OT_PROCESOS,
            procesoId,
            {
                estado: 'COMPLETADO',
                fechaFin: new Date().toISOString(),
                horasReales,
                costoManoObra,
                updatedAt: new Date().toISOString(),
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error completando proceso:", error);
        return {
            success: false,
            error: error.message || "Error al completar proceso",
        };
    }
}

/**
 * Elimina un proceso
 */
export async function eliminarProceso(id: string): Promise<DeleteResponse> {
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.OT_PROCESOS, id);
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando proceso:", error);
        return {
            success: false,
            error: error.message || "Error al eliminar proceso",
        };
    }
}
