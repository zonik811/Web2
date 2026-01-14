"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type { OtSolicitudRepuesto, CrearOtSolicitudRepuestoInput, CreateResponse, UpdateResponse, EstadoSolicitudRepuesto } from "@/types";

export async function obtenerSolicitudesPorOrden(ordenTrabajoId: string): Promise<OtSolicitudRepuesto[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.OT_SOLICITUDES_REPUESTOS,
            [Query.equal("ordenTrabajoId", ordenTrabajoId), Query.orderDesc("fechaSolicitud")]
        );
        return response.documents as unknown as OtSolicitudRepuesto[];
    } catch (error: any) {
        console.error("Error obteniendo solicitudes:", error);
        return [];
    }
}

export async function crearSolicitudRepuesto(data: CrearOtSolicitudRepuestoInput): Promise<CreateResponse<OtSolicitudRepuesto>> {
    try {
        const solicitudData = {
            ordenTrabajoId: data.ordenTrabajoId,
            procesoId: data.procesoId,
            nombreRepuesto: data.nombreRepuesto,
            codigoReferencia: data.codigoReferencia,
            descripcion: data.descripcion,
            cantidad: data.cantidad,
            urgente: data.urgente,
            estado: 'SOLICITADO' as EstadoSolicitudRepuesto,
            solicitadoPor: data.solicitadoPor,
            fechaSolicitud: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const nuevaSolicitud = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.OT_SOLICITUDES_REPUESTOS,
            ID.unique(),
            solicitudData
        );

        return { success: true, data: nuevaSolicitud as unknown as OtSolicitudRepuesto };
    } catch (error: any) {
        console.error("Error creando solicitud:", error);
        return { success: false, error: error.message || "Error al crear solicitud" };
    }
}

export async function marcarComoPedido(
    id: string,
    pedidoPor: string,
    proveedorId?: string,
    nombreProveedor?: string,
    costoEstimado?: number,
    fechaEstimadaLlegada?: string
): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.OT_SOLICITUDES_REPUESTOS,
            id,
            {
                estado: 'PEDIDO',
                pedidoPor,
                proveedorId,
                nombreProveedor,
                costoEstimado,
                fechaEstimadaLlegada,
                fechaPedido: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error marcando como pedido:", error);
        return { success: false, error: error.message };
    }
}

export async function marcarComoRecibido(
    id: string,
    costoReal: number
): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.OT_SOLICITUDES_REPUESTOS,
            id,
            {
                estado: 'RECIBIDO',
                costoReal,
                fechaRecepcion: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error marcando como recibido:", error);
        return { success: false, error: error.message };
    }
}
