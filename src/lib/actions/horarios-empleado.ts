"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type { HorarioEmpleado, HorarioEmpleadoInput } from "@/types";

/**
 * Asignar horario especial a un empleado
 */
export async function asignarHorarioEspecial(data: HorarioEmpleadoInput): Promise<{ success: boolean; error?: string }> {
    try {
        // Desactivar horarios anteriores del empleado
        const horariosAnteriores = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HORARIOS_EMPLEADO,
            [
                Query.equal("empleadoId", data.empleadoId),
                Query.equal("activo", true)
            ]
        );

        for (const horario of horariosAnteriores.documents) {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.HORARIOS_EMPLEADO,
                horario.$id,
                { activo: false }
            );
        }

        // Crear nuevo horario
        const nuevoHorario = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.HORARIOS_EMPLEADO,
            ID.unique(),
            {
                empleadoId: data.empleadoId,
                horarioEntrada: data.horarioEntrada,
                horarioSalida: data.horarioSalida,
                diasLaborables: data.diasLaborables ? JSON.stringify(data.diasLaborables) : null,
                fechaInicio: data.fechaInicio || null,
                fechaFin: data.fechaFin || null,
                activo: true,
                notas: data.notas || ''
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error asignando horario:", error);
        return {
            success: false,
            error: error.message || "Error al asignar horario"
        };
    }
}

/**
 * Obtener horario activo de un empleado para una fecha específica
 */
export async function obtenerHorarioEmpleado(empleadoId: string, fecha?: string): Promise<HorarioEmpleado | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HORARIOS_EMPLEADO,
            [
                Query.equal("empleadoId", empleadoId),
                Query.equal("activo", true),
                Query.limit(10)
            ]
        );

        if (response.documents.length === 0) {
            return null;
        }

        const horarios = response.documents as unknown as HorarioEmpleado[];

        // Si se proporciona fecha, filtrar por vigencia
        if (fecha) {
            const fechaObj = new Date(fecha);
            const horarioValido = horarios.find(h => {
                const inicio = h.fechaInicio ? new Date(h.fechaInicio) : null;
                const fin = h.fechaFin ? new Date(h.fechaFin) : null;

                if (inicio && fechaObj < inicio) return false;
                if (fin && fechaObj > fin) return false;

                return true;
            });

            return horarioValido || null;
        }

        // Retornar el primero activo
        return horarios[0];
    } catch (error) {
        console.error("Error obteniendo horario:", error);
        return null;
    }
}

/**
 * Obtener todos los horarios de un empleado
 */
export async function obtenerHorariosEmpleado(empleadoId: string): Promise<HorarioEmpleado[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.HORARIOS_EMPLEADO,
            [
                Query.equal("empleadoId", empleadoId),
                Query.orderDesc("$createdAt")
            ]
        );

        return response.documents as unknown as HorarioEmpleado[];
    } catch (error) {
        console.error("Error obteniendo horarios:", error);
        return [];
    }
}

/**
 * Eliminar horario especial
 */
export async function eliminarHorarioEspecial(horarioId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.HORARIOS_EMPLEADO,
            horarioId,
            { activo: false }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando horario:", error);
        return {
            success: false,
            error: error.message || "Error al eliminar horario"
        };
    }
}
