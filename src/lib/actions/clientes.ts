"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    Cliente,
    CreateResponse,
    UpdateResponse,
    TipoCliente,
    FrecuenciaCliente,
} from "@/types";

interface CrearClienteInput {
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    ciudad: string;
    tipoCliente: TipoCliente;
    frecuenciaPreferida: FrecuenciaCliente;
    notasImportantes?: string;
}

/**
 * Obtiene la lista de todos los clientes
 */
export async function obtenerClientes(): Promise<Cliente[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            [Query.orderDesc("$createdAt"), Query.limit(100)]
        );

        return response.documents as unknown as Cliente[];
    } catch (error: any) {
        console.error("Error obteniendo clientes:", error);
        throw new Error(error.message || "Error al obtener clientes");
    }
}

/**
 * Obtiene un cliente por su ID
 */
export async function obtenerCliente(id: string): Promise<Cliente> {
    try {
        const cliente = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            id
        );

        return cliente as unknown as Cliente;
    } catch (error: any) {
        console.error("Error obteniendo cliente:", error);
        throw new Error(error.message || "Error al obtener cliente");
    }
}

/**
 * Obtiene un cliente por su email
 */
export async function obtenerClientePorEmail(
    email: string
): Promise<Cliente | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            [Query.equal("email", email), Query.limit(1)]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as Cliente;
        }

        return null;
    } catch (error: any) {
        console.warn("Index query failed for email, attempting memory fallback:", error);
        // Fallback: Si falla el índice (ej: faltan permisos o index), buscar en los últimos 100 clientes
        try {
            const fallbackList = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.CLIENTES,
                [Query.orderDesc("$createdAt"), Query.limit(100)]
            );
            const found = fallbackList.documents.find((doc: any) =>
                doc.email?.trim().toLowerCase() === email?.trim().toLowerCase()
            );
            return (found as unknown as Cliente) || null;
        } catch (fallbackError) {
            console.error("Critical: Memory fallback failed for email", fallbackError);
            return null;
        }
    }
}

/**
 * Obtiene un cliente por su teléfono
 */
export async function obtenerClientePorTelefono(
    telefono: string
): Promise<Cliente | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            [Query.equal("telefono", telefono), Query.limit(1)]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as Cliente;
        }

        return null;
    } catch (error: any) {
        console.warn("Index query failed for phone, attempting memory fallback:", error);
        try {
            const fallbackList = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.CLIENTES,
                [Query.orderDesc("$createdAt"), Query.limit(100)]
            );
            // Normalizar teléfono eliminando espacios y signos
            const cleanPhone = (p: string) => p?.replace(/\D/g, "") || "";
            const targetPhone = cleanPhone(telefono);

            const found = fallbackList.documents.find((doc: any) =>
                cleanPhone(doc.telefono) === targetPhone
            );
            return (found as unknown as Cliente) || null;
        } catch (fallbackError) {
            console.error("Critical: Memory fallback failed for phone", fallbackError);
            return null;
        }
    }
}

/**
 * Crea un nuevo cliente
 */
export async function crearCliente(
    data: CrearClienteInput
): Promise<CreateResponse<Cliente>> {
    try {
        const clienteData = {
            nombre: data.nombre,
            telefono: data.telefono,
            email: data.email,
            direccion: data.direccion,
            ciudad: data.ciudad,
            tipoCliente: data.tipoCliente,
            frecuenciaPreferida: data.frecuenciaPreferida,
            totalServicios: 0,
            totalGastado: 0,
            calificacionPromedio: 0,
            notasImportantes: data.notasImportantes,
        };

        const newCliente = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            ID.unique(),
            clienteData
        );

        return {
            success: true,
            data: newCliente as unknown as Cliente,
        };
    } catch (error: any) {
        console.error("Error creando cliente:", error);
        return {
            success: false,
            error: error.message || "Error al crear cliente",
        };
    }
}

/**
 * Actualiza un cliente existente
 */
export async function actualizarCliente(
    id: string,
    data: Partial<Cliente>
): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            id,
            data
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando cliente:", error);
        return {
            success: false,
            error: error.message || "Error al actualizar cliente",
        };
    }
}

/**
 * Recalcula el número de servicios completados por un cliente
 * contando las citas completadas en la base de datos
 */
export async function recalcularServiciosCliente(clienteId: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
        console.log(`🔄 Recalculando servicios para cliente: ${clienteId}`);

        // Contar citas completadas de este cliente
        const citasCompletadas = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CITAS,
            [
                Query.equal('estado', 'COMPLETADA'),
                Query.equal('clienteId', clienteId)
            ]
        );

        const count = citasCompletadas.total;
        console.log(`📊 Cliente ${clienteId}: ${count} servicios completados`);

        // Actualizar el contador
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            clienteId,
            { serviciosCompletados: count }
        );

        return { success: true, count };
    } catch (error: any) {
        console.error(`❌ Error recalculando servicios de cliente ${clienteId}:`, error);
        return { success: false, error: error.message };
    }
}
/**
 * Elimina un cliente y sus datos relacionados
 */
export async function eliminarCliente(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando cliente:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene el detalle completo de un cliente incluyendo estadísticas financieras
 */
export async function obtenerDetalleCliente(clienteId: string) {
    try {
        const cliente = await obtenerCliente(clienteId);

        // 1. Obtener Citas (para historial y saldo pendiente)
        const citasResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CITAS,
            [
                Query.equal('clienteId', clienteId),
                Query.orderDesc('fechaCita'),
                Query.limit(100) // Considerar paginación en el futuro
            ]
        );
        const citas = citasResponse.documents as unknown as any[];

        // 2. Obtener Pagos Realizados
        const pagosResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PAGOS_CLIENTES,
            [
                Query.equal('clienteId', clienteId),
                Query.orderDesc('fechaPago')
            ]
        );
        const pagos = pagosResponse.documents as unknown as any[];

        // 3. Calcular Estadísticas
        const totalServicios = citas.filter(c => c.estado === 'completada').length;

        // Total gastado = Suma de todos los pagos registrados
        const totalPagado = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);

        // Saldo pendiente: Suma de precios de citas completadas que NO están marcadas como pagadas
        const saldoPendiente = citas
            .filter(c => c.estado === 'completada' && !c.pagadoPorCliente)
            .reduce((sum, c) => sum + (c.precioAcordado || c.precioCliente || 0), 0);

        // Próxima cita
        const proximaCita = citas
            .filter(c => new Date(c.fechaCita) > new Date() && c.estado !== 'cancelada' && c.estado !== 'completada')
            .sort((a, b) => new Date(a.fechaCita).getTime() - new Date(b.fechaCita).getTime())[0];

        return {
            cliente,
            estadisticas: {
                totalServicios,
                totalPagado,
                saldoPendiente,
                proximaCita: proximaCita || null
            },
            citas,
            pagos
        };

    } catch (error: any) {
        console.error("Error obteniendo detalle del cliente:", error);
        throw new Error(error.message || "Error al obtener detalle del cliente");
    }
}

/**
 * Busca clientes por nombre, teléfono o email para autocomplete
 */
export async function buscarClientes(query: string): Promise<Cliente[]> {
    try {
        if (!query || query.length < 2) return [];

        // Intentar búsqueda por índice de texto completo si está configurado
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.CLIENTES,
                [
                    Query.search("nombre", query),
                    Query.limit(5)
                ]
            );
            if (response.documents.length > 0) return response.documents as unknown as Cliente[];
        } catch (e) {
            // Si falla search (no index), intentar contains o startsWith
        }

        // Fallback: búsqueda simple
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            [
                Query.contains("nombre", query),
                Query.limit(5)
            ]
        );

        return response.documents as unknown as Cliente[];
    } catch (error: any) {
        console.error("Error buscando clientes:", error);
        return [];
    }
}
