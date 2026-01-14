"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type { OtRepuesto, CrearOtRepuestoInput, CreateResponse, DeleteResponse } from "@/types";

export async function obtenerRepuestosPorProceso(procesoId: string): Promise<OtRepuesto[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.OT_REPUESTOS,
            [Query.equal("procesoId", procesoId), Query.orderDesc("fechaUso")]
        );
        return response.documents as unknown as OtRepuesto[];
    } catch (error: any) {
        console.error("Error obteniendo repuestos:", error);
        return [];
    }
}

export async function obtenerRepuestosPorOrden(ordenTrabajoId: string): Promise<OtRepuesto[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.OT_REPUESTOS,
            [Query.equal("ordenTrabajoId", ordenTrabajoId), Query.orderDesc("fechaUso")]
        );
        return response.documents as unknown as OtRepuesto[];
    } catch (error: any) {
        console.error("Error obteniendo repuestos de la orden:", error);
        return [];
    }
}

import { registrarMovimiento } from "./inventario";

export async function agregarRepuesto(data: CrearOtRepuestoInput): Promise<CreateResponse<OtRepuesto>> {
    try {
        const subtotal = data.cantidad * data.precioUnitario;

        const repuestoData = {
            ordenTrabajoId: data.ordenTrabajoId,
            procesoId: data.procesoId,
            repuestoId: data.repuestoId,
            nombreRepuesto: data.nombreRepuesto,
            cantidad: data.cantidad,
            precioUnitario: data.precioUnitario,
            subtotal,
            empleadoQueSolicito: data.empleadoQueSolicito,
            fechaUso: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };

        const nuevoRepuesto = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.OT_REPUESTOS,
            ID.unique(),
            repuestoData
        );

        // Descontar de inventario si es un producto real (no temporal)
        // Asumimos que si tiene ID válido (no "temp-id") es un producto
        if (data.repuestoId && data.repuestoId !== "temp-id") {
            const resultMovimiento = await registrarMovimiento({
                producto_id: data.repuestoId,
                tipo: 'salida',
                cantidad: data.cantidad,
                motivo: `Uso en Orden de Trabajo ${data.ordenTrabajoId}`,
                referencia: data.ordenTrabajoId,
                fecha: new Date().toISOString(),
                notas: `Repuesto: ${data.nombreRepuesto}`
            });

            if (!resultMovimiento.success) {
                // ROLLBACK: Eliminar el repuesto creado si falla el inventario
                console.error("Error en inventario, haciendo rollback. Error:", resultMovimiento.error);
                await databases.deleteDocument(DATABASE_ID, COLLECTIONS.OT_REPUESTOS, nuevoRepuesto.$id);
                return { success: false, error: "Error actualizando inventario: " + (resultMovimiento.error || "Desconocido") };
            }
        }

        return { success: true, data: nuevoRepuesto as unknown as OtRepuesto };
    } catch (error: any) {
        console.error("Error agregando repuesto:", error);
        return { success: false, error: error.message || "Error al agregar repuesto" };
    }
}

export async function eliminarRepuesto(id: string): Promise<DeleteResponse> {
    try {
        // 1. Obtener repuesto para saber qué devolver
        const repuesto = await databases.getDocument(DATABASE_ID, COLLECTIONS.OT_REPUESTOS, id) as unknown as OtRepuesto;

        // 2. Eliminar documento
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.OT_REPUESTOS, id);

        // 3. Devolver al inventario
        if (repuesto.repuestoId && repuesto.repuestoId !== "temp-id") {
            await registrarMovimiento({
                producto_id: repuesto.repuestoId,
                tipo: 'entrada', // Entrada por devolución
                cantidad: repuesto.cantidad,
                motivo: `Devolución de Orden de Trabajo ${repuesto.ordenTrabajoId}`,
                referencia: repuesto.ordenTrabajoId,
                fecha: new Date().toISOString(),
                notas: `Repuesto eliminado: ${repuesto.nombreRepuesto}`
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando repuesto:", error);
        return { success: false, error: error.message || "Error al eliminar repuesto" };
    }
}

export async function actualizarRepuesto(id: string, data: Partial<CrearOtRepuestoInput>): Promise<CreateResponse<OtRepuesto>> {
    try {
        // 1. Obtener repuesto original para comparar
        const repuestoOriginal = await databases.getDocument(DATABASE_ID, COLLECTIONS.OT_REPUESTOS, id) as unknown as OtRepuesto;

        const updateData: any = { ...data };

        // Recalcular subtotal si cambia precio o cantidad
        if (data.cantidad !== undefined || data.precioUnitario !== undefined) {
            const cantidad = data.cantidad !== undefined ? data.cantidad : repuestoOriginal.cantidad;
            const precio = data.precioUnitario !== undefined ? data.precioUnitario : repuestoOriginal.precioUnitario;
            updateData.subtotal = cantidad * precio;
        }

        // 2. Actualizar documento
        const repuestoActualizado = await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.OT_REPUESTOS,
            id,
            updateData
        );

        // 3. Ajustar Inventario si cambió la cantidad
        if (data.cantidad !== undefined && data.cantidad !== repuestoOriginal.cantidad) {
            const diferencia = data.cantidad - repuestoOriginal.cantidad;
            const productoId = repuestoOriginal.repuestoId || data.repuestoId;

            if (productoId && productoId !== "temp-id") {
                let resultMovimiento;

                if (diferencia > 0) {
                    // Aumentó cantidad (consumió más) -> Salida
                    resultMovimiento = await registrarMovimiento({
                        producto_id: productoId,
                        tipo: 'salida',
                        cantidad: diferencia,
                        motivo: `Ajuste (aumento) en Orden de Trabajo ${repuestoOriginal.ordenTrabajoId}`,
                        referencia: repuestoOriginal.ordenTrabajoId,
                        fecha: new Date().toISOString(),
                    });
                } else {
                    // Disminuyó cantidad (devolvió) -> Entrada
                    resultMovimiento = await registrarMovimiento({
                        producto_id: productoId,
                        tipo: 'entrada',
                        cantidad: Math.abs(diferencia),
                        motivo: `Ajuste (disminución) en Orden de Trabajo ${repuestoOriginal.ordenTrabajoId}`,
                        referencia: repuestoOriginal.ordenTrabajoId,
                        fecha: new Date().toISOString(),
                    });
                }

                if (!resultMovimiento.success) {
                    // ROLLBACK: Revertir la actualización del repuesto
                    console.error("Error en inventario tras actualización, haciendo rollback.", resultMovimiento.error);
                    await databases.updateDocument(
                        DATABASE_ID,
                        COLLECTIONS.OT_REPUESTOS,
                        id,
                        {
                            subtotal: repuestoOriginal.subtotal,
                            cantidad: repuestoOriginal.cantidad,
                            precioUnitario: repuestoOriginal.precioUnitario
                            // Revertimos a lo original
                        }
                    );
                    return { success: false, error: "Error actualizando inventario: " + resultMovimiento.error };
                }
            }
        }

        return { success: true, data: repuestoActualizado as unknown as OtRepuesto };
    } catch (error: any) {
        console.error("Error actualizando repuesto:", error);
        return { success: false, error: error.message || "Error al actualizar repuesto" };
    }
}
