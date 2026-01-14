"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type { OtAutorizacion, CrearOtAutorizacionInput, CreateResponse, UpdateResponse, EstadoAutorizacion } from "@/types";

export async function obtenerAutorizacionesPorOrden(ordenTrabajoId: string): Promise<OtAutorizacion[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.OT_AUTORIZACIONES,
            [Query.equal("ordenTrabajoId", ordenTrabajoId), Query.orderDesc("fechaSolicitud")]
        );
        return response.documents as unknown as OtAutorizacion[];
    } catch (error: any) {
        console.error("Error obteniendo autorizaciones:", error);
        return [];
    }
}

export async function crearAutorizacion(data: CrearOtAutorizacionInput): Promise<CreateResponse<OtAutorizacion>> {
    try {
        const costoTotal = data.costoEstimadoRepuestos + data.costoEstimadoManoObra;

        const autorizacionData = {
            ordenTrabajoId: data.ordenTrabajoId,
            procesoId: data.procesoId,
            descripcionProblema: data.descripcionProblema,
            trabajoAdicionalRequerido: data.trabajoAdicionalRequerido,
            urgente: data.urgente,
            costoEstimadoRepuestos: data.costoEstimadoRepuestos,
            costoEstimadoManoObra: data.costoEstimadoManoObra,
            costoTotal,
            estado: 'PENDIENTE' as EstadoAutorizacion,
            solicitadoPor: data.solicitadoPor,
            fechaSolicitud: new Date().toISOString(),
            fotosProblema: data.fotosProblema || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const nuevaAutorizacion = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.OT_AUTORIZACIONES,
            ID.unique(),
            autorizacionData
        );

        return { success: true, data: nuevaAutorizacion as unknown as OtAutorizacion };
    } catch (error: any) {
        console.error("Error creando autorización:", error);
        return { success: false, error: error.message || "Error al crear autorización" };
    }
}

export async function aprobarAutorizacion(
    id: string,
    aprobadoPor: string
): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.OT_AUTORIZACIONES,
            id,
            {
                estado: 'APROBADA',
                fechaRespuesta: new Date().toISOString(),
                respuestaPor: aprobadoPor,
                updatedAt: new Date().toISOString(),
            }
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error aprobando autorización:", error);
        return { success: false, error: error.message || "Error al aprobar autorización" };
    }
}

export async function rechazarAutorizacion(
    id: string,
    motivo: string,
    rechazadoPor: string
): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.OT_AUTORIZACIONES,
            id,
            {
                estado: 'RECHAZADA',
                fechaRespuesta: new Date().toISOString(),
                respuestaPor: rechazadoPor,
                motivoRechazo: motivo,
                updatedAt: new Date().toISOString(),
            }
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error rechazando autorización:", error);
        return { success: false, error: error.message || "Error al rechazar autorización" };
    }
}
