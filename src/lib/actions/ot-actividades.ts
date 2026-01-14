"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type { OtActividad, CrearOtActividadInput, CreateResponse, UpdateResponse, DeleteResponse } from "@/types";

export async function obtenerActividadesPorProceso(procesoId: string): Promise<OtActividad[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.OT_ACTIVIDADES,
            [Query.equal("procesoId", procesoId), Query.orderDesc("fechaHora")]
        );
        return response.documents as unknown as OtActividad[];
    } catch (error: any) {
        console.error("Error obteniendo actividades:", error);
        return [];
    }
}

export async function crearActividad(data: CrearOtActividadInput): Promise<CreateResponse<OtActividad>> {
    try {
        const actividadData = {
            procesoId: data.procesoId,
            ordenTrabajoId: data.ordenTrabajoId,
            descripcion: data.descripcion,
            notas: data.notas,
            empleadoId: data.empleadoId,
            fechaHora: new Date().toISOString(),
            horasTrabajadas: data.horasTrabajadas,
            imagenes: data.imagenes || [],
            createdAt: new Date().toISOString(),
        };

        const nuevaActividad = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.OT_ACTIVIDADES,
            ID.unique(),
            actividadData
        );

        // Actualizar acumulados del proceso
        try {
            // 1. Obtener tarifa del empleado
            const empleado = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.EMPLEADOS,
                data.empleadoId
            );
            const tarifaPorHora = (empleado.tarifaPorHora as number) || 0;

            // 2. Obtener proceso actual
            const proceso = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.OT_PROCESOS,
                data.procesoId
            );

            const horasAnteriores = (proceso.horasReales as number) || 0;
            const costoAnterior = (proceso.costoManoObra as number) || 0;

            const nuevasHoras = horasAnteriores + data.horasTrabajadas;
            const nuevoCosto = costoAnterior + (data.horasTrabajadas * tarifaPorHora);

            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.OT_PROCESOS,
                data.procesoId,
                {
                    horasReales: nuevasHoras,
                    costoManoObra: nuevoCosto,
                    updatedAt: new Date().toISOString()
                }
            );
        } catch (updateError) {
            console.error("Error actualizando proceso parent:", updateError);
            // No fallamos la request completa si solo falla el update del acumulado, pero es bueno loguearlo
        }

        return { success: true, data: nuevaActividad as unknown as OtActividad };
    } catch (error: any) {
        console.error("Error creando actividad:", error);
        return { success: false, error: error.message || "Error al crear actividad" };
    }
}

export async function actualizarActividad(
    id: string,
    data: Partial<OtActividad>
): Promise<UpdateResponse> {
    try {
        // 1. Obtener actividad original para comparar horas
        const actividadOriginal = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.OT_ACTIVIDADES,
            id
        );

        // 2. Actualizar actividad
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.OT_ACTIVIDADES,
            id,
            {
                ...data,
                updatedAt: new Date().toISOString()
            }
        );

        // 3. Si cambiaron las horas, actualizar proceso
        if (data.horasTrabajadas !== undefined && data.horasTrabajadas !== actividadOriginal.horasTrabajadas) {
            const diferenciaHoras = data.horasTrabajadas - actividadOriginal.horasTrabajadas;
            const procesoId = actividadOriginal.procesoId;

            try {
                // Obtener tarifa del empleado de la actividad
                const empleado = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.EMPLEADOS,
                    actividadOriginal.empleadoId
                );
                const tarifaPorHora = (empleado.tarifaPorHora as number) || 0;

                const proceso = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.OT_PROCESOS,
                    procesoId
                );

                const horasAnteriores = (proceso.horasReales as number) || 0;
                const costoAnterior = (proceso.costoManoObra as number) || 0;

                const nuevasHoras = horasAnteriores + diferenciaHoras;
                const nuevoCosto = costoAnterior + (diferenciaHoras * tarifaPorHora);

                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.OT_PROCESOS,
                    procesoId,
                    {
                        horasReales: nuevasHoras,
                        costoManoObra: nuevoCosto,
                        updatedAt: new Date().toISOString()
                    }
                );
            } catch (updateError) {
                console.error("Error actualizando acumulados proceso:", updateError);
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando actividad:", error);
        return { success: false, error: error.message || "Error al actualizar actividad" };
    }
}

export async function eliminarActividad(id: string): Promise<DeleteResponse> {
    try {
        // 1. Obtener actividad para restar horas
        const actividad = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.OT_ACTIVIDADES,
            id
        );

        // 2. Eliminar actividad
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.OT_ACTIVIDADES, id);

        // 3. Actualizar proceso (restar)
        if (actividad.horasTrabajadas > 0) {
            try {
                // Obtener tarifa del empleado
                const empleado = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.EMPLEADOS,
                    actividad.empleadoId
                );
                const tarifaPorHora = (empleado.tarifaPorHora as number) || 0;

                const proceso = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.OT_PROCESOS,
                    actividad.procesoId
                );

                const horasAnteriores = (proceso.horasReales as number) || 0;
                const costoAnterior = (proceso.costoManoObra as number) || 0;

                const nuevasHoras = Math.max(0, horasAnteriores - actividad.horasTrabajadas);
                const nuevoCosto = Math.max(0, costoAnterior - (actividad.horasTrabajadas * tarifaPorHora));

                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.OT_PROCESOS,
                    actividad.procesoId,
                    {
                        horasReales: nuevasHoras,
                        costoManoObra: nuevoCosto,
                        updatedAt: new Date().toISOString()
                    }
                );
            } catch (updateError) {
                console.error("Error actualizando acumulados proceso:", updateError);
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando actividad:", error);
        return { success: false, error: error.message || "Error al eliminar actividad" };
    }
}
