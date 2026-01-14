"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    Empleado,
    CrearEmpleadoInput,
    ActualizarEmpleadoInput,
    FiltrosEmpleados,
    CreateResponse,
    UpdateResponse,
    DeleteResponse,
    EstadisticasEmpleado,
} from "@/types";
import { obtenerHistorialOrdenesEmpleado } from "@/lib/actions/reportes-empleados";

/**
 * Obtiene la lista de empleados con filtros opcionales
 */
export async function obtenerEmpleados(
    filtros?: FiltrosEmpleados
): Promise<Empleado[]> {
    try {
        const queries: string[] = [];

        if (filtros?.cargo) {
            queries.push(Query.equal("cargo", filtros.cargo));
        }

        if (filtros?.activo !== undefined) {
            queries.push(Query.equal("activo", filtros.activo));
        }

        if (filtros?.especialidad) {
            queries.push(Query.contains("especialidades", filtros.especialidad));
        }



        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.EMPLEADOS,
            queries
        );

        return response.documents as unknown as Empleado[];
    } catch (error: any) {
        console.error("Error obteniendo empleados:", error);
        throw new Error(error.message || "Error al obtener empleados");
        return [];
    }
}

/**
 * Obtiene un empleado por su ID
 */
export async function obtenerEmpleado(id: string): Promise<Empleado> {
    try {
        const empleado = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.EMPLEADOS,
            id
        );

        return empleado as unknown as Empleado;
    } catch (error: any) {
        console.error("Error obteniendo empleado:", error);
        throw new Error(error.message || "Error al obtener empleado");
    }
}

/**
 * Obtiene un empleado por su email
 */
export async function obtenerEmpleadoPorEmail(email: string): Promise<Empleado | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.EMPLEADOS,
            [Query.equal("email", email), Query.limit(1)]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as Empleado;
        }

        return null;
    } catch (error) {
        console.error("Error buscando empleado por email:", error);
        return null;
    }
}

/**
 * Crea un nuevo empleado
 */
export async function crearEmpleado(
    data: CrearEmpleadoInput
): Promise<CreateResponse<Empleado>> {
    try {
        const empleadoData = {
            nombre: data.nombre,
            apellido: data.apellido,
            documento: data.documento,
            telefono: data.telefono,
            email: data.email,
            direccion: data.direccion,
            fechaNacimiento: data.fechaNacimiento,
            fechaContratacion: data.fechaContratacion,
            cargo: data.cargo,
            especialidades: data.especialidades,
            tarifaPorHora: data.tarifaPorHora,
            modalidadPago: data.modalidadPago,
            activo: true,
            calificacionPromedio: 0,
            totalServicios: 0,
        };

        const newEmpleado = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.EMPLEADOS,
            ID.unique(),
            empleadoData
        );

        return {
            success: true,
            data: newEmpleado as unknown as Empleado,
        };
    } catch (error: any) {
        console.error("Error creando empleado:", error);
        return {
            success: false,
            error: error.message || "Error al crear empleado",
        };
    }
}

/**
 * Actualiza un empleado existente
 */
export async function actualizarEmpleado(
    id: string,
    data: ActualizarEmpleadoInput
): Promise<UpdateResponse> {
    try {
        const updateData = {
            ...data,
        };

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.EMPLEADOS,
            id,
            updateData
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando empleado:", error);
        return {
            success: false,
            error: error.message || "Error al actualizar empleado",
        };
    }
}

/**
 * Recalcula el número de servicios realizados por un empleado
 * contando las citas completadas en la base de datos
 */
export async function recalcularServiciosEmpleado(empleadoId: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {


        // Contar citas completadas con este empleado asignado
        const citasCompletadas = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CITAS,
            [
                Query.equal('estado', 'COMPLETADA'),
                Query.contains('empleadosAsignados', empleadoId)
            ]
        );

        const count = citasCompletadas.total;

        // Actualizar el contador
        const updateResult = await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.EMPLEADOS,
            empleadoId,
            { totalServicios: count }
        );


        return { success: true, count };
    } catch (error: any) {
        console.error(`❌ Error recalculando servicios de empleado ${empleadoId}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Elimina un empleado (soft delete - marca como inactivo)
 */
export async function eliminarEmpleado(id: string): Promise<DeleteResponse> {
    try {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.EMPLEADOS, id, {
            activo: false,
            updatedAt: new Date().toISOString(),
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando empleado:", error);
        return {
            success: false,
            error: error.message || "Error al eliminar empleado",
        };
    }
}

/**
 * Obtiene las estadísticas de un empleado
 */
export async function obtenerEstadisticasEmpleado(
    empleadoId: string
): Promise<EstadisticasEmpleado> {
    try {
        // Obtener empleado
        const empleado = await obtenerEmpleado(empleadoId);

        // Obtener citas completadas
        const citasCompletadas = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CITAS,
            [
                Query.contains("empleadosAsignados", empleadoId),
                Query.equal("estado", "completada"),
            ]
        );

        // Calcular horas trabajadas este mes
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const citasEsteMes = citasCompletadas.documents.filter((cita: any) => {
            const fechaCita = new Date(cita.fechaCita);
            return fechaCita >= inicioMes;
        });

        // Calcular horas usando horasTrabajadas (default 8 si no existe)
        const horasTrabajadasMes = citasEsteMes.reduce((total: number, cita: any) => {
            return total + (cita.horasTrabajadas || 8);
        }, 0);

        // Obtener pagos realizados al empleado
        const pagos = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PAGOS_EMPLEADOS,
            [
                Query.equal('empleadoId', empleadoId)
            ]
        );

        // Obtener comisiones del empleado (pendientes y pagadas)
        // Para calcular pendiente por pagar, sumamos las comisiones PENDIENTES al saldo
        // O más fácil: Total Ganado (Servicios + Comisiones) - Total Pagado

        // Vamos a sumar comisiones al Total Ganado
        const comisiones = await databases.listDocuments(
            DATABASE_ID,
            'comisiones', // Hardcoding collection ID as it might not be in config yet
            [
                Query.equal('empleadoId', empleadoId)
            ]
        );

        // Calcular total pagado
        const totalPagado = pagos.documents.reduce((total: number, pago: any) => {
            return total + (pago.monto || 0);
        }, 0);

        // Calcular total ganado histórico usando horasTrabajadas + Comisiones
        const ganadoServicios = citasCompletadas.documents.reduce((total: number, cita: any) => {
            const horas = cita.horasTrabajadas || 8;
            return total + (horas * empleado.tarifaPorHora);
        }, 0);

        const ganadoComisiones = comisiones.documents.reduce((total: number, com: any) => {
            return total + (com.monto || 0);
        }, 0);

        // Obtener historial de órdenes de trabajo para calcular ganancias estimadas
        const historialOrdenes = await obtenerHistorialOrdenesEmpleado(empleadoId);
        const ganadoOrdenes = historialOrdenes.reduce((total, orden) => total + orden.totalGanadoEstimado, 0);

        const totalGanado = ganadoServicios + ganadoComisiones + ganadoOrdenes;

        // Pendiente por pagar = Total Ganado - Total Pagado
        const pendientePorPagar = totalGanado - totalPagado;

        return {
            totalServicios: empleado.totalServicios,
            horasTrabajadasMes,
            calificacionPromedio: empleado.calificacionPromedio,
            totalGanado,
            pendientePorPagar,
        };
    } catch (error: any) {
        console.error("Error obteniendo estadísticas:", error);
        throw new Error(error.message || "Error al obtener estadísticas");
    }
}
