"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type { OtPlantillaProceso, CrearPlantillaProcesoInput, CreateResponse, UpdateResponse } from "@/types";

export async function obtenerPlantillas(): Promise<OtPlantillaProceso[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.OT_PLANTILLAS_PROCESOS,
            [Query.equal("activa", true), Query.orderDesc("vecesUsada")]
        );
        return response.documents as unknown as OtPlantillaProceso[];
    } catch (error: any) {
        console.error("Error obteniendo plantillas:", error);
        return [];
    }
}

export async function obtenerPlantilla(id: string): Promise<OtPlantillaProceso> {
    try {
        const plantilla = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.OT_PLANTILLAS_PROCESOS,
            id
        );
        return plantilla as unknown as OtPlantillaProceso;
    } catch (error: any) {
        console.error("Error obteniendo plantilla:", error);
        throw new Error(error.message || "Error al obtener plantilla");
    }
}

export async function crearPlantilla(data: CrearPlantillaProcesoInput): Promise<CreateResponse<OtPlantillaProceso>> {
    try {
        const plantillaData = {
            nombre: data.nombre,
            descripcion: data.descripcion,
            procesos: JSON.stringify(data.procesos),
            costoEstimadoTotal: data.costoEstimadoTotal,
            vecesUsada: 0,
            activa: true,
            createdBy: data.createdBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const nuevaPlantilla = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.OT_PLANTILLAS_PROCESOS,
            ID.unique(),
            plantillaData
        );

        return { success: true, data: nuevaPlantilla as unknown as OtPlantillaProceso };
    } catch (error: any) {
        console.error("Error creando plantilla:", error);
        return { success: false, error: error.message || "Error al crear plantilla" };
    }
}

export async function incrementarUsoPlantilla(id: string): Promise<UpdateResponse> {
    try {
        const plantilla = await obtenerPlantilla(id);
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.OT_PLANTILLAS_PROCESOS,
            id,
            {
                vecesUsada: plantilla.vecesUsada + 1,
                updatedAt: new Date().toISOString(),
            }
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error incrementando uso:", error);
        return { success: false, error: error.message };
    }
}

export async function desactivarPlantilla(id: string): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.OT_PLANTILLAS_PROCESOS,
            id,
            {
                activa: false,
                updatedAt: new Date().toISOString(),
            }
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error desactivando plantilla:", error);
        return { success: false, error: error.message };
    }
}
