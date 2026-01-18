"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type { Turno, AsignacionTurno, CrearTurnoInput, AsignarTurnoInput } from "@/types";

// --- GESTIÓN DE TURNOS (CATÁLOGO) ---

export async function obtenerTurnos(activosOnly = true): Promise<Turno[]> {
    try {
        // Simplified query - just order by name
        // The 'activo' attribute may not exist in all schemas
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TURNOS,
            [Query.orderAsc("nombre")]
        );

        let turnos = response.documents as unknown as Turno[];

        // Filter by activo in memory if the attribute exists
        if (activosOnly) {
            turnos = turnos.filter(t => t.activo !== false);
        }

        return turnos;
    } catch (error) {
        console.error("Error obteniendo turnos:", error);
        return [];
    }
}

export async function crearTurno(data: CrearTurnoInput): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.TURNOS,
            ID.unique(),
            {
                ...data,
                activo: true
            }
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error creando turno:", error);
        return { success: false, error: error.message };
    }
}

export async function eliminarTurno(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Soft delete (desactivar) en lugar de borrar físico para mantener histórico
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.TURNOS,
            id,
            { activo: false }
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando turno:", error);
        return { success: false, error: error.message };
    }
}

// --- GESTIÓN DE ASIGNACIONES ---

export async function asignarTurno(data: AsignarTurnoInput): Promise<{ success: boolean; error?: string }> {
    try {
        // Verificar si ya tiene turno asignado en ese rango (opcional: superposición)
        // Por ahora permitimos sobreescribir o tener múltiples, la lógica de asistencia tomará el último creado

        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.ASIGNACION_TURNOS,
            ID.unique(),
            data
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error asignando turno:", error);
        return { success: false, error: error.message };
    }
}

export async function obtenerAsignacionesEmpleado(
    empleadoId: string,
    fechaInicio?: string,
    fechaFin?: string
): Promise<AsignacionTurno[]> {
    try {
        const queries = [
            Query.equal("empleadoId", empleadoId),
            Query.orderDesc("fechaInicio")
        ];

        // Filtro básico, idealmente sería rango vs rango pero Appwrite Queries son limitados
        if (fechaInicio) queries.push(Query.greaterThanEqual("fechaFin", fechaInicio));
        if (fechaFin) queries.push(Query.lessThanEqual("fechaInicio", fechaFin));

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ASIGNACION_TURNOS,
            queries
        );

        const asignaciones = response.documents as unknown as AsignacionTurno[];

        // Enriquecer con info del turno
        const turnosMap = new Map<string, Turno>();
        // Cargar todos los turnos para evitar N+1 queries
        // Asumimos que no hay miles de tipos de turnos
        const turnosResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TURNOS,
            [Query.limit(100)]
        );

        turnosResponse.documents.forEach((doc) => {
            turnosMap.set(doc.$id, doc as unknown as Turno);
        });

        return asignaciones.map(a => ({
            ...a,
            turno: turnosMap.get(a.turnoId)
        }));

    } catch (error) {
        console.error("Error obteniendo asignaciones:", error);
        return [];
    }
}

/**
 * Obtiene el turno activo para un empleado en una fecha específica.
 * Si hay múltiples, toma el más reciente creado o actualizado.
 */
export async function obtenerTurnoActivoEnFecha(empleadoId: string, fecha: string): Promise<Turno | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ASIGNACION_TURNOS,
            [
                Query.equal("empleadoId", empleadoId),
                Query.lessThanEqual("fechaInicio", fecha),
                Query.greaterThanEqual("fechaFin", fecha),
                Query.limit(1),
                Query.orderDesc("$createdAt") // Prioridad al último asignado
            ]
        );

        if (response.documents.length === 0) return null;

        const asignacion = response.documents[0] as unknown as AsignacionTurno;

        const turnoDoc = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.TURNOS,
            asignacion.turnoId
        );

        return turnoDoc as unknown as Turno;

    } catch (error) {
        console.error("Error obteniendo turno activo:", error);
        return null;
    }
}

export async function eliminarAsignacion(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.ASIGNACION_TURNOS,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando asignación:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtener todas las asignaciones (para vista Admin Calendario)
 * Idealmente filtrado por rango de fechas (mes actual)
 */
export async function obtenerAsignacionesTodos(fechaInicio?: string, fechaFin?: string): Promise<AsignacionTurno[]> {
    try {
        // Nota: Appwrite no soporta queries complejos de rango OR rango fácilmente sin un índice específico
        // y Query.or() no siempre es eficiente.
        // Para MVP cargamos los últimos N asignaciones ordenadas por fechaInicio

        const queries = [
            Query.orderDesc("fechaInicio"),
            Query.limit(500) // Límite razonable para visualización mensual
        ];

        // Si tenemos fechas, intentamos filtrar lo que empiece antes del fin
        if (fechaFin) {
            queries.push(Query.lessThanEqual("fechaInicio", fechaFin));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ASIGNACION_TURNOS,
            queries
        );

        const asignaciones = response.documents as unknown as AsignacionTurno[];

        // Enriquecer con info del turno
        const turnosMap = new Map<string, Turno>();
        const turnosResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TURNOS,
            [Query.limit(100)]
        );

        turnosResponse.documents.forEach((doc) => {
            turnosMap.set(doc.$id, doc as unknown as Turno);
        });

        // Filtrar en memoria por fechaInicio (si el usuario pidió >= fechaInicio)
        // Ya que Query.greaterThanEqual en fechaInicio podría excluir los que empezaron antes pero siguen activos
        // La lógica de "Activo en fecha" es compleja.
        // Simplificación: Retornamos todo lo que devuelve el query (limit 500) y el frontend pinta.

        return asignaciones.map(a => ({
            ...a,
            turno: turnosMap.get(a.turnoId)
        }));

    } catch (error) {
        console.error("Error obteniendo todas las asignaciones:", error);
        return [];
    }
}
