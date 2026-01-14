"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type { OtPrueba, CrearOtPruebaInput, CreateResponse } from "@/types";

export async function obtenerPruebasPorProceso(procesoId: string): Promise<OtPrueba[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.OT_PRUEBAS,
            [Query.equal("procesoId", procesoId), Query.orderDesc("fechaHora")]
        );
        return response.documents as unknown as OtPrueba[];
    } catch (error: any) {
        console.error("Error obteniendo pruebas:", error);
        return [];
    }
}

export async function registrarPrueba(data: CrearOtPruebaInput): Promise<CreateResponse<OtPrueba>> {
    try {
        const pruebaData = {
            procesoId: data.procesoId,
            ordenTrabajoId: data.ordenTrabajoId,
            tipoPrueba: data.tipoPrueba,
            resultado: data.resultado,
            observaciones: data.observaciones,
            imagenes: data.imagenes || [],
            videos: data.videos || [],
            tecnicoId: data.tecnicoId,
            fechaHora: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };

        const nuevaPrueba = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.OT_PRUEBAS,
            ID.unique(),
            pruebaData
        );

        return { success: true, data: nuevaPrueba as unknown as OtPrueba };
    } catch (error: any) {
        console.error("Error registrando prueba:", error);
        return { success: false, error: error.message || "Error al registrar prueba" };
    }
}
