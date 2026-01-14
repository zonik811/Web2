"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    OtChecklistVehiculo,
    CrearOtChecklistInput,
    CreateResponse,
    DeleteResponse
} from "@/types";

/**
 * Crea un nuevo checklist para una orden
 */
export async function crearChecklist(data: CrearOtChecklistInput): Promise<CreateResponse<OtChecklistVehiculo>> {
    try {
        const checklistData = {
            ordenTrabajoId: data.ordenTrabajoId,
            tipo: data.tipo,
            estadoLlantas: data.estadoLlantas,
            nivelCombustible: data.nivelCombustible,
            kilometraje: data.kilometraje,
            rayonesNotados: data.rayonesNotados,
            objetosValor: data.objetosValor,
            estadoCarroceria: data.estadoCarroceria,
            estadoInterior: data.estadoInterior,
            lucesOperativas: data.lucesOperativas,
            frenosOperativos: data.frenosOperativos,
            observacionesGenerales: data.observacionesGenerales,
            fotosVehiculo: data.fotosVehiculo || [],
            nombreClienteFirma: data.nombreClienteFirma,
            empleadoInspectorId: data.empleadoInspectorId,
            firmaClienteUrl: data.firmaClienteUrl,
            fechaHora: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };

        const nuevoChecklist = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.OT_CHECKLIST_VEHICULO,
            ID.unique(),
            checklistData
        );

        return {
            success: true,
            data: nuevoChecklist as unknown as OtChecklistVehiculo,
        };
    } catch (error: any) {
        console.error("Error creando checklist:", error);
        return {
            success: false,
            error: error.message || "Error al crear checklist",
        };
    }
}

/**
 * Obtiene los checklists de una orden
 */
export async function obtenerChecklists(ordenId: string): Promise<OtChecklistVehiculo[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.OT_CHECKLIST_VEHICULO,
            [
                Query.equal("ordenTrabajoId", ordenId),
                Query.orderDesc("fechaHora")
            ]
        );

        return response.documents as unknown as OtChecklistVehiculo[];
    } catch (error: any) {
        console.error("Error obteniendo checklists:", error);
        return [];
    }
}

/**
 * Elimina un checklist
 */
export async function eliminarChecklist(id: string): Promise<DeleteResponse> {
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.OT_CHECKLIST_VEHICULO, id);
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando checklist:", error);
        return {
            success: false,
            error: error.message || "Error al eliminar checklist"
        };
    }
}
