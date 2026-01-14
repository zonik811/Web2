"use server";

import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import type { Producto } from "@/types/nuevos-tipos";

/**
 * Obtener servicios destacados
 */
export async function obtenerServiciosDestacados() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.SERVICIOS,
            [
                // Query.equal("destacado", true),
                // Query.equal("activo", true),
                // Query.limit(3)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error('Error obteniendo servicios:', error);
        return [];
    }
}

/**
 * Obtener todos los servicios activos
 */
export async function obtenerServicios() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.SERVICIOS
        );
        return response.documents;
    } catch (error) {
        console.error('Error obteniendo servicios:', error);
        return [];
    }
}

/**
 * Obtener un servicio por ID
 */
export async function obtenerServicio(id: string) {
    try {
        const doc = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.SERVICIOS,
            id
        );
        return doc;
    } catch (error) {
        console.error('Error obteniendo servicio:', error);
        return null;
    }
}

/**
 * Obtener productos destacados
 */
export async function obtenerProductosDestacados(): Promise<Producto[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PRODUCTOS
        );
        return response.documents as unknown as Producto[];
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        return [];
    }
}
