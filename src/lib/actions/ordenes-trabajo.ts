"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import { obtenerCliente } from "./clientes";
import { obtenerVehiculo } from "./vehiculos";
import type {
    OrdenTrabajo,
    CrearOrdenTrabajoInput,
    OtConDetalles,
    CreateResponse,
    UpdateResponse,
    DeleteResponse,
    EstadoOrdenTrabajo,
} from "@/types";

/**
 * Genera el número de orden automáticamente
 */
async function generarNumeroOrden(): Promise<string> {
    const año = new Date().getFullYear();
    const mes = String(new Date().getMonth() + 1).padStart(2, '0');

    // Obtener última orden del mes
    const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ORDENES_TRABAJO,
        [
            Query.orderDesc("$createdAt"),
            Query.limit(1)
        ]
    );

    let numero = 1;
    if (response.documents.length > 0) {
        const ultimaOrden = response.documents[0] as unknown as OrdenTrabajo;
        const match = ultimaOrden.numeroOrden.match(/OT-\d{4}-\d{2}-(\d{4})/);
        if (match) {
            numero = parseInt(match[1]) + 1;
        }
    }

    return `OT-${año}-${mes}-${String(numero).padStart(4, '0')}`;
}

/**
 * Obtiene todas las órdenes de trabajo
 */
export async function obtenerOrdenesTrabajo(
    limite: number = 50
): Promise<OrdenTrabajo[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            [Query.orderDesc("$createdAt"), Query.limit(limite)]
        );

        return response.documents as unknown as OrdenTrabajo[];
    } catch (error: any) {
        console.error("Error obteniendo órdenes de trabajo:", error);
        throw new Error(error.message || "Error al obtener órdenes de trabajo");
    }
}

/**
 * Obtiene órdenes con detalles de cliente y vehículo para listados
 */
export async function obtenerOrdenesTrabajoPopuladas(
    limite: number = 50
): Promise<OtConDetalles[]> {
    try {
        const ordenes = await obtenerOrdenesTrabajo(limite);

        const ordenesPopuladas = await Promise.all(
            ordenes.map(async (orden) => {
                const [cliente, vehiculo] = await Promise.all([
                    obtenerCliente(orden.clienteId).catch(() => undefined),
                    obtenerVehiculo(orden.vehiculoId).catch(() => undefined)
                ]);

                return {
                    ...orden,
                    cliente,
                    vehiculo
                } as OtConDetalles;
            })
        );

        return ordenesPopuladas;
    } catch (error: any) {
        console.error("Error obteniendo órdenes populadas:", error);
        return [];
    }
}

/**
 * Obtiene órdenes por estado
 */
export async function obtenerOrdenesPorEstado(
    estado: EstadoOrdenTrabajo
): Promise<OrdenTrabajo[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            [
                Query.equal("estado", estado),
                Query.orderDesc("$createdAt"),
                Query.limit(100)
            ]
        );

        return response.documents as unknown as OrdenTrabajo[];
    } catch (error: any) {
        console.error("Error obteniendo órdenes por estado:", error);
        return [];
    }
}

/**
 * Obtiene órdenes de un cliente
 */
export async function obtenerOrdenesCliente(clienteId: string): Promise<OrdenTrabajo[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            [
                Query.equal("clienteId", clienteId),
                Query.orderDesc("$createdAt")
            ]
        );

        return response.documents as unknown as OrdenTrabajo[];
    } catch (error: any) {
        console.error("Error obteniendo órdenes del cliente:", error);
        return [];
    }
}

/**
 * Obtiene órdenes de un vehículo (historial)
 */
export async function obtenerOrdenesVehiculo(vehiculoId: string): Promise<OrdenTrabajo[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            [
                Query.equal("vehiculoId", vehiculoId),
                Query.orderDesc("$createdAt")
            ]
        );

        return response.documents as unknown as OrdenTrabajo[];
    } catch (error: any) {
        console.error("Error obteniendo historial del vehículo:", error);
        return [];
    }
}

/**
 * Obtiene una orden de trabajo por ID
 */
export async function obtenerOrdenTrabajo(id: string): Promise<OrdenTrabajo> {
    try {
        const orden = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            id
        );

        return orden as unknown as OrdenTrabajo;
    } catch (error: any) {
        console.error("Error obteniendo orden de trabajo:", error);
        throw new Error(error.message || "Error al obtener orden de trabajo");
    }
}

/**
 * Obtiene orden con todos los detalles (procesos, checklist, etc)
 */
export async function obtenerOrdenConDetalles(id: string): Promise<OtConDetalles> {
    try {
        const [orden, procesosDoc, checklist, autorizaciones, actividadesDoc, repuestosDoc, pruebasDoc] = await Promise.all([
            obtenerOrdenTrabajo(id),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_PROCESOS, [
                Query.equal("ordenTrabajoId", id),
                Query.orderAsc("orden")
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_CHECKLIST_VEHICULO, [
                Query.equal("ordenTrabajoId", id)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_AUTORIZACIONES, [
                Query.equal("ordenTrabajoId", id),
                Query.orderDesc("$createdAt")
            ]),
            // Fetch all related items for this order
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_ACTIVIDADES, [
                Query.equal("ordenTrabajoId", id),
                Query.orderDesc("$createdAt")
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_REPUESTOS, [
                Query.equal("ordenTrabajoId", id),
                Query.orderDesc("$createdAt")
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_PRUEBAS, [
                Query.equal("ordenTrabajoId", id),
                Query.orderDesc("$createdAt")
            ])
        ]);

        // Fetch comisiones (optional, may not exist yet)
        let comisionesDoc;
        try {
            comisionesDoc = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COMISIONES, [
                Query.equal("ordenTrabajoId", id),
                Query.orderDesc("fecha")
            ]);
        } catch (error) {
            console.warn("Comisiones collection not found, skipping...");
            comisionesDoc = { documents: [] };
        }

        // Fetch factura and pagos
        let facturaDoc, pagosDoc;
        try {

            [facturaDoc, pagosDoc] = await Promise.all([
                databases.listDocuments(DATABASE_ID, COLLECTIONS.FACTURAS, [
                    Query.equal("ordenTrabajoId", id)
                ]),
                databases.listDocuments(DATABASE_ID, COLLECTIONS.PAGOS_CLIENTES, [
                    Query.equal("ordenTrabajoId", id),
                    Query.orderDesc("fecha")
                ])
            ]);

        } catch (error) {
            console.error("❌ Error fetching facturas/pagos:", error);
            facturaDoc = { documents: [] };
            pagosDoc = { documents: [] };
        }

        const procesos = procesosDoc.documents.map((proceso: any) => ({
            ...proceso,
            actividades: actividadesDoc.documents.filter((a: any) => a.procesoId === proceso.$id),
            repuestos: repuestosDoc.documents.filter((r: any) => r.procesoId === proceso.$id),
            pruebas: pruebasDoc.documents.filter((p: any) => p.procesoId === proceso.$id),
        }));

        return {
            ...orden,
            procesos: procesos as any[],
            checklist: checklist.documents as any[],
            autorizaciones: autorizaciones.documents as any[],
            comisiones: comisionesDoc.documents as any[],
            factura: facturaDoc.documents[0] || null,
            pagos: pagosDoc.documents as any[],
        };
    } catch (error: any) {
        console.error("Error obteniendo orden con detalles:", error);
        throw new Error(error.message || "Error al obtener detalles de la orden");
    }
}

/**
 * Crea una nueva orden de trabajo
 */
export async function crearOrdenTrabajo(
    data: CrearOrdenTrabajoInput
): Promise<CreateResponse<OrdenTrabajo>> {
    try {
        const numeroOrden = await generarNumeroOrden();

        const ordenData = {
            numeroOrden,
            clienteId: data.clienteId,
            vehiculoId: data.vehiculoId,
            fechaIngreso: data.fechaIngreso,
            fechaEstimadaEntrega: data.fechaEstimadaEntrega,
            motivoIngreso: data.motivoIngreso,
            diagnosticoInicial: data.diagnosticoInicial,
            estado: 'COTIZANDO' as EstadoOrdenTrabajo,
            prioridad: data.prioridad,
            cotizacionAprobada: false,
            subtotal: 0,
            aplicarIva: true,
            porcentajeIva: 19,
            impuestos: 0,
            total: 0,
            tieneGarantia: data.tieneGarantia,
            diasGarantia: data.diasGarantia,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const nuevaOrden = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            ID.unique(),
            ordenData
        );

        return {
            success: true,
            data: nuevaOrden as unknown as OrdenTrabajo,
        };
    } catch (error: any) {
        console.error("Error creando orden de trabajo:", error);
        return {
            success: false,
            error: error.message || "Error al crear orden de trabajo",
        };
    }
}

/**
 * Actualiza una orden de trabajo
 */
export async function actualizarOrdenTrabajo(
    id: string,
    data: Partial<OrdenTrabajo>
): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            id,
            {
                ...data,
                updatedAt: new Date().toISOString(),
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando orden de trabajo:", error);
        return {
            success: false,
            error: error.message || "Error al actualizar orden de trabajo",
        };
    }
}

/**
 * Actualiza los costos de la orden
 */
export async function actualizarCostosOrden(
    ordenId: string,
    subtotal: number,
    aplicarIva: boolean = true,
    porcentajeIva: number = 19
): Promise<UpdateResponse> {
    try {
        const impuestos = aplicarIva ? (subtotal * porcentajeIva) / 100 : 0;
        const total = subtotal + impuestos;

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            ordenId,
            {
                subtotal,
                aplicarIva,
                porcentajeIva,
                impuestos,
                total,
                updatedAt: new Date().toISOString(),
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando costos:", error);
        return {
            success: false,
            error: error.message || "Error al actualizar costos",
        };
    }
}

/**
 * Cambia el estado de la orden
 */
export async function cambiarEstadoOrden(
    ordenId: string,
    nuevoEstado: EstadoOrdenTrabajo
): Promise<UpdateResponse> {
    try {
        const updateData: any = {
            estado: nuevoEstado,
            updatedAt: new Date().toISOString(),
        };

        // Si se completa, agregar fecha de entrega y calcular garantía
        if (nuevoEstado === 'COMPLETADA' || nuevoEstado === 'ENTREGADA') {
            const orden = await obtenerOrdenTrabajo(ordenId);
            updateData.fechaRealEntrega = new Date().toISOString();

            if (orden.tieneGarantia && orden.diasGarantia) {
                const fechaVencimiento = new Date();
                fechaVencimiento.setDate(fechaVencimiento.getDate() + orden.diasGarantia);
                updateData.fechaVencimientoGarantia = fechaVencimiento.toISOString();
            }
        }

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            ordenId,
            updateData
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error cambiando estado:", error);
        return {
            success: false,
            error: error.message || "Error al cambiar estado",
        };
    }
}

/**
 * Aprueba una cotización
 */
export async function aprobarCotizacion(ordenId: string): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            ordenId,
            {
                cotizacionAprobada: true,
                fechaAprobacion: new Date().toISOString(),
                estado: 'ACEPTADA',
                updatedAt: new Date().toISOString(),
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error aprobando cotización:", error);
        return {
            success: false,
            error: error.message || "Error al aprobar cotización",
        };
    }
}

/**
 * Cancela una orden de trabajo
 */
export async function cancelarOrden(
    ordenId: string,
    motivo?: string
): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            ordenId,
            {
                estado: 'CANCELADA',
                diagnosticoInicial: motivo ? `CANCELADA: ${motivo}` : undefined,
                updatedAt: new Date().toISOString(),
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error cancelando orden:", error);
        return {
            success: false,
            error: error.message || "Error al cancelar orden",
        };
    }
}

/**
 * Obtiene órdenes filtradas con paginación
 */
export async function obtenerOrdenesFiltradas(filtros: {
    query?: string;
    clienteId?: string;
    estado?: string;
    page?: number;
    limit?: number;
}): Promise<{ ordenes: OtConDetalles[]; total: number }> {
    try {
        const { query, clienteId, estado, page = 1, limit = 50 } = filtros;
        const queries = [Query.orderDesc("$createdAt")];

        // Filtro por Cliente
        if (clienteId && clienteId !== "all") {
            queries.push(Query.equal("clienteId", clienteId));
        }

        // Filtro por Estado
        if (estado && estado !== "all") {
            queries.push(Query.equal("estado", estado));
        }

        // Filtro por Texto (N° Orden)
        if (query) {
            queries.push(Query.contains("numeroOrden", query));
        }

        // Paginación
        const offset = (page - 1) * limit;
        queries.push(Query.limit(limit));
        queries.push(Query.offset(offset));

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            queries
        );

        // Popular detalles (Cliente y Vehículo)
        const ordenesPopuladas = await Promise.all(
            response.documents.map(async (orden: any) => {
                const [cliente, vehiculo] = await Promise.all([
                    obtenerCliente(orden.clienteId).catch(() => undefined),
                    obtenerVehiculo(orden.vehiculoId).catch(() => undefined)
                ]);

                return {
                    ...orden,
                    cliente,
                    vehiculo
                } as OtConDetalles;
            })
        );

        return {
            ordenes: ordenesPopuladas,
            total: response.total,
        };
    } catch (error: any) {
        console.error("Error obteniendo órdenes filtradas:", error);
        return { ordenes: [], total: 0 };
    }
}
