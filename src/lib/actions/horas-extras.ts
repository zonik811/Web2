"use server";

import { databases, storage } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    HoraExtra,
    DiaFestivo,
    CrearHoraExtraInput,
    CrearDiaFestivoInput
} from "@/types";

// --- DÍAS FESTIVOS ---

export async function obtenerFestivos(anio: number): Promise<DiaFestivo[]> {
    try {
        const fechaInicio = `${anio}-01-01`;
        const fechaFin = `${anio}-12-31`;

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DIAS_FESTIVOS,
            [
                Query.greaterThanEqual("fecha", fechaInicio),
                Query.lessThanEqual("fecha", fechaFin),
                Query.orderAsc("fecha")
            ]
        );

        return response.documents as unknown as DiaFestivo[];
    } catch (error) {
        console.error("Error obteniendo festivos:", error);
        return [];
    }
}

export async function esFestivo(fecha: string): Promise<DiaFestivo | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DIAS_FESTIVOS,
            [Query.equal("fecha", fecha)]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as DiaFestivo;
        }
        return null;
    } catch (error) {
        return null;
    }
}

export async function crearFestivo(data: CrearDiaFestivoInput): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.DIAS_FESTIVOS,
            ID.unique(),
            {
                ...data,
                esIrrenunciable: data.esIrrenunciable || false,
                multiplicador: data.multiplicador || 1.75
            }
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function eliminarFestivo(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.DIAS_FESTIVOS,
            id
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- HORAS EXTRAS ---

export async function registrarHorasExtras(data: CrearHoraExtraInput): Promise<{ success: boolean; error?: string }> {
    try {
        // Calcular horas y valor equivalente
        const inicio = new Date(`2000-01-01T${data.horaInicio}`);
        const fin = new Date(`2000-01-01T${data.horaFin}`);
        let diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60); // Horas

        if (diff < 0) diff += 24; // Cruce de medianoche

        let multiplicador = 1.0;
        switch (data.tipo) {
            case 'DIURNA': multiplicador = 1.25; break;
            case 'NOCTURNA': multiplicador = 1.75; break;
            case 'DOMINICAL': multiplicador = 1.75; break; // O 2.0 según ley
            case 'FESTIVA': multiplicador = 2.0; break;
        }

        const horasEquivalentes = diff * multiplicador;

        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.HORAS_EXTRAS,
            ID.unique(),
            {
                ...data,
                cantidadHoras: parseFloat(diff.toFixed(2)),
                multiplicador,
                horasEquivalentes: parseFloat(horasEquivalentes.toFixed(2)),
                estado: 'PENDIENTE'
            }
        );

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function obtenerExtrasPendientes(): Promise<HoraExtra[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HORAS_EXTRAS,
            [
                Query.equal("estado", "PENDIENTE"),
                Query.orderDesc("fecha")
            ]
        );

        return response.documents as unknown as HoraExtra[];
    } catch (error) {
        return [];
    }
}

export async function aprobarHoraExtra(id: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.HORAS_EXTRAS,
            id,
            {
                estado: 'APROBADO',
                aprobadoPor: adminId
            }
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function rechazarHoraExtra(id: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.HORAS_EXTRAS,
            id,
            {
                estado: 'RECHAZADO',
                aprobadoPor: adminId // Técnica de registro
            }
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Obtener todas las horas extras (Vista Admin)
 */
export async function obtenerTodasLasExtras(estado?: string): Promise<HoraExtra[]> {
    try {
        const queries = [
            Query.orderDesc("fecha")
        ];

        if (estado) {
            queries.push(Query.equal("estado", estado));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HORAS_EXTRAS,
            queries
        );

        return response.documents as unknown as HoraExtra[];
    } catch (error: any) {
        // Fallback for missing schema attributes
        if (error.message?.includes("Index not found")) {
            console.warn("Index missing, optimizing query in memory");
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.HORAS_EXTRAS,
                []
            );
            let docs = response.documents as unknown as HoraExtra[];
            if (estado) {
                docs = docs.filter(d => d.estado === estado);
            }
            return docs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        }
        return [];
    }
}
