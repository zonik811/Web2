"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    Permiso,
    SolicitarPermisoInput,
    EstadoPermiso
} from "@/types";

/**
 * Solicitar permiso o justificación
 */
export async function solicitarPermiso(data: SolicitarPermisoInput): Promise<{ success: boolean; permiso?: Permiso; error?: string }> {
    try {
        const permisoData: any = {
            empleadoId: data.empleadoId,
            tipo: data.tipo,
            subtipo: data.subtipo || '',
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin,
            horaInicio: data.horaInicio || null,
            horaFin: data.horaFin || null,
            motivo: data.motivo,
            adjunto: data.adjunto || null,
            estado: 'PENDIENTE',
        };

        const permiso = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PERMISOS,
            ID.unique(),
            permisoData
        );

        return {
            success: true,
            permiso: permiso as unknown as Permiso
        };
    } catch (error: any) {
        console.error("Error solicitando permiso:", error);
        return {
            success: false,
            error: error.message || "Error al solicitar permiso"
        };
    }
}

/**
 * Obtener permisos de un empleado
 */
export async function obtenerPermisosEmpleado(empleadoId: string): Promise<Permiso[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PERMISOS,
            [
                Query.equal("empleadoId", empleadoId),
                Query.orderDesc("$createdAt"),
                Query.limit(100)
            ]
        );

        return response.documents as unknown as Permiso[];
    } catch (error) {
        console.error("Error obteniendo permisos:", error);
        return [];
    }
}

/**
 * Obtener permisos pendientes (todos)
 */
export async function obtenerPermisosPendientes(): Promise<Permiso[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PERMISOS,
            [
                Query.equal("estado", "PENDIENTE"),
                Query.orderDesc("$createdAt"),
                Query.limit(100)
            ]
        );

        return response.documents as unknown as Permiso[];
    } catch (error) {
        console.error("Error obteniendo permisos pendientes:", error);
        return [];
    }
}

/**
 * Aprobar permiso
 */
export async function aprobarPermiso(
    permisoId: string,
    adminId: string,
    comentarios?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PERMISOS,
            permisoId,
            {
                estado: 'APROBADO',
                aprobadoPor: adminId,
                fechaAprobacion: new Date().toISOString(),
                comentarios: comentarios || ''
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error aprobando permiso:", error);
        return {
            success: false,
            error: error.message || "Error al aprobar permiso"
        };
    }
}

/**
 * Rechazar permiso
 */
export async function rechazarPermiso(
    permisoId: string,
    adminId: string,
    motivo: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PERMISOS,
            permisoId,
            {
                estado: 'RECHAZADO',
                aprobadoPor: adminId,
                fechaAprobacion: new Date().toISOString(),
                comentarios: motivo
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error rechazando permiso:", error);
        return {
            success: false,
            error: error.message || "Error al rechazar permiso"
        };
    }
}

/**
 * Verificar si un empleado tiene permiso aprobado en una fecha
 */
export async function tienePermisoEnFecha(empleadoId: string, fecha: string): Promise<boolean> {
    try {
        const fechaObj = new Date(fecha);
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PERMISOS,
            [
                Query.equal("empleadoId", empleadoId),
                Query.equal("estado", "APROBADO"),
                Query.limit(100)
            ]
        );

        const permisos = response.documents as unknown as Permiso[];

        // Verificar si la fecha está dentro de algún permiso
        return permisos.some(permiso => {
            const inicio = new Date(permiso.fechaInicio);
            const fin = new Date(permiso.fechaFin);
            return fechaObj >= inicio && fechaObj <= fin;
        });
    } catch (error) {
        console.error("Error verificando permiso:", error);
        return false;
    }
}

/**
 * Obtener empleados con permiso para una fecha específica
 */
export async function obtenerEmpleadosConPermisoEnFecha(fecha: string): Promise<string[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PERMISOS,
            [
                Query.equal("estado", "APROBADO"),
                Query.limit(100)
            ]
        );

        const permisos = response.documents as unknown as any[];
        const fechaObj = new Date(fecha);

        // Filtrar empleados que tienen permiso para esta fecha
        const empleadosIds: string[] = [];

        for (const permiso of permisos) {
            const inicio = new Date(permiso.fechaInicio);
            const fin = new Date(permiso.fechaFin);

            if (fechaObj >= inicio && fechaObj <= fin) {
                if (!empleadosIds.includes(permiso.empleadoId)) {
                    empleadosIds.push(permiso.empleadoId);
                }
            }
        }

        return empleadosIds;
    } catch (error) {
        console.error("Error obteniendo empleados con permiso:", error);
        return [];
    }
}

/**
 * Obtener todos los permisos (Vista Admin)
 */
export async function obtenerTodosLosPermisos(estado?: string): Promise<Permiso[]> {
    try {
        const queries = [
            Query.orderDesc("fechaInicio"),
            Query.limit(100)
        ];

        if (estado && estado !== 'todos') {
            queries.push(Query.equal("estado", estado));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PERMISOS,
            queries
        );

        return response.documents as unknown as Permiso[];
    } catch (error: any) {
        // Fallback for missing index
        if (error.message?.includes("Index not found")) {
            console.warn("Index missing, optimizing query in memory");
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PERMISOS,
                []
            );
            let docs = response.documents as unknown as Permiso[];
            if (estado && estado !== 'todos') {
                docs = docs.filter(d => d.estado === estado);
            }
            return docs.sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());
        }
        return [];
    }
}
