"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    Vehiculo,
    CrearVehiculoInput,
    CreateResponse,
    UpdateResponse,
    DeleteResponse,
} from "@/types";

/**
 * Obtiene todos los vehículos
 */
export async function obtenerVehiculos(): Promise<Vehiculo[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.VEHICULOS,
            [Query.orderDesc("$createdAt"), Query.limit(100)]
        );

        return response.documents as unknown as Vehiculo[];
    } catch (error: any) {
        console.error("Error obteniendo vehículos:", error);
        throw new Error(error.message || "Error al obtener vehículos");
    }
}

/**
 * Obtiene vehículos de un cliente específico
 */
export async function obtenerVehiculosPorCliente(clienteId: string): Promise<Vehiculo[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.VEHICULOS,
            [
                Query.equal("clienteId", clienteId),
                Query.equal("activo", true),
                Query.orderDesc("$createdAt")
            ]
        );

        return response.documents as unknown as Vehiculo[];
    } catch (error: any) {
        console.error("Error obteniendo vehículos del cliente:", error);
        return [];
    }
}

/**
 * Obtiene un vehículo por ID
 */
export async function obtenerVehiculo(id: string): Promise<Vehiculo> {
    try {
        const vehiculo = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.VEHICULOS,
            id
        );

        return vehiculo as unknown as Vehiculo;
    } catch (error: any) {
        console.error("Error obteniendo vehículo:", error);
        throw new Error(error.message || "Error al obtener vehículo");
    }
}

/**
 * Busca un vehículo por placa
 */
export async function obtenerVehiculoPorPlaca(placa: string): Promise<Vehiculo | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.VEHICULOS,
            [Query.equal("placa", placa.toUpperCase()), Query.limit(1)]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as Vehiculo;
        }

        return null;
    } catch (error: any) {
        console.error("Error buscando vehículo por placa:", error);
        return null;
    }
}

/**
 * Crea un nuevo vehículo
 */
export async function crearVehiculo(
    data: CrearVehiculoInput
): Promise<CreateResponse<Vehiculo>> {
    try {
        // Verificar si ya existe un vehículo con esa placa
        const existente = await obtenerVehiculoPorPlaca(data.placa);
        if (existente) {
            return {
                success: false,
                error: "Ya existe un vehículo con esa placa"
            };
        }

        const vehiculoData = {
            clienteId: data.clienteId,
            marca: data.marca,
            modelo: data.modelo,
            ano: data.ano,
            placa: data.placa.toUpperCase(),
            vin: data.vin,
            tipoVehiculo: data.tipoVehiculo,
            tipoCombustible: data.tipoCombustible,
            kilometraje: data.kilometraje,
            color: data.color,
            observaciones: data.observaciones,
            activo: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const newVehiculo = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.VEHICULOS,
            ID.unique(),
            vehiculoData
        );

        return {
            success: true,
            data: newVehiculo as unknown as Vehiculo,
        };
    } catch (error: any) {
        console.error("Error creando vehículo:", error);
        return {
            success: false,
            error: error.message || "Error al crear vehículo",
        };
    }
}

/**
 * Actualiza un vehículo existente
 */
export async function actualizarVehiculo(
    id: string,
    data: Partial<CrearVehiculoInput>
): Promise<UpdateResponse> {
    try {
        const updateData = {
            ...data,
            placa: data.placa ? data.placa.toUpperCase() : undefined,
            updatedAt: new Date().toISOString(),
        };

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.VEHICULOS,
            id,
            updateData
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando vehículo:", error);
        return {
            success: false,
            error: error.message || "Error al actualizar vehículo",
        };
    }
}

/**
 * Elimina un vehículo (soft delete)
 */
export async function eliminarVehiculo(id: string): Promise<DeleteResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.VEHICULOS,
            id,
            {
                activo: false,
                updatedAt: new Date().toISOString(),
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando vehículo:", error);
        return {
            success: false,
            error: error.message || "Error al eliminar vehículo",
        };
    }
}

/**
 * Actualiza el kilometraje de un vehículo
 */
export async function actualizarKilometraje(
    vehiculoId: string,
    nuevoKilometraje: number
): Promise<UpdateResponse> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.VEHICULOS,
            vehiculoId,
            {
                kilometraje: nuevoKilometraje,
                updatedAt: new Date().toISOString(),
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando kilometraje:", error);
        return {
            success: false,
            error: error.message || "Error al actualizar kilometraje",
        };
    }
}
/**
 * Busca vehículos por placa, marca o modelo
 */
export async function buscarVehiculos(term: string): Promise<Vehiculo[]> {
    try {
        const queries = [
            Query.search("placa", term),
            Query.orderDesc("$createdAt"),
            Query.limit(20)
        ];

        // Intento de búsqueda principal por placa
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.VEHICULOS,
            queries
        );

        return response.documents as unknown as Vehiculo[];
    } catch (error: any) {
        console.error("Error buscando vehículos:", error);
        return [];
    }
}
