"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    Comision,
    CrearComisionInput,
    EstadoComision,
    CreateResponse,
    UpdateResponse,
    DeleteResponse
} from "@/types";

/**
 * Crear una comisión manual para un empleado
 */
export async function crearComision(data: CrearComisionInput & { ordenTrabajoId?: string; procesoId?: string }): Promise<CreateResponse<Comision>> {
    try {
        const comisionData = {
            empleadoId: data.empleadoId,
            monto: data.monto,
            concepto: data.concepto,
            fecha: data.fecha || new Date().toISOString(),
            referenciaId: data.referenciaId,
            ordenTrabajoId: data.ordenTrabajoId,
            procesoId: data.procesoId,
            pagado: false,
            estado: "pendiente" as EstadoComision,
            observaciones: data.observaciones,
            createdAt: new Date().toISOString(),
        };

        const nuevaComision = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.COMISIONES,
            ID.unique(),
            comisionData
        );

        return {
            success: true,
            data: nuevaComision as unknown as Comision,
        };
    } catch (error: any) {
        console.error("Error creando comisión:", error);
        return {
            success: false,
            error: error.message || "Error al crear comisión",
        };
    }
}

/**
 * Obtener todas las comisiones de una orden de trabajo
 */
export async function obtenerComisionesOrden(ordenId: string): Promise<Comision[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMISIONES,
            [
                Query.equal("ordenTrabajoId", ordenId),
                Query.orderDesc("fecha")
            ]
        );

        return response.documents as unknown as Comision[];
    } catch (error: any) {
        console.error("Error obteniendo comisiones:", error);
        return [];
    }
}

/**
 * Marcar una comisión como pagada
 */
export async function marcarComisionPagada(id: string): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.COMISIONES,
            id,
            {
                pagado: true,
                estado: "pagado",
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error marcando comisión como pagada:", error);
        return {
            success: false,
            error: error.message || "Error al marcar comisión como pagada"
        };
    }
}

/**
 * Actualizar estado de una comisión
 */
export async function actualizarEstadoComision(id: string, estado: EstadoComision): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.COMISIONES,
            id,
            {
                estado,
                pagado: estado === "pagado",
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando estado de comisión:", error);
        return {
            success: false,
            error: error.message || "Error al actualizar estado"
        };
    }
}

/**
 * Eliminar una comisión
 */
export async function eliminarComision(id: string): Promise<DeleteResponse> {
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.COMISIONES, id);
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando comisión:", error);
        return {
            success: false,
            error: error.message || "Error al eliminar comisión"
        };
    }
}

/**
 * Obtener todas las comisiones de un empleado
 */
export async function obtenerComisionesEmpleado(empleadoId: string): Promise<Comision[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMISIONES,
            [
                Query.equal("empleadoId", empleadoId),
                Query.orderDesc("fecha")
            ]
        );

        return response.documents as unknown as Comision[];
    } catch (error: any) {
        console.error("Error obteniendo comisiones de empleado:", error);
        return [];
    }
}
