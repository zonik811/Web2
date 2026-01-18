'use server';

import { databases } from "@/lib/appwrite-admin";
import { COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export interface CollectionStats {
    id: string;
    name: string;
    count: number;
}

/**
 * Obtiene estadísticas básicas (conteo) de todas las colecciones conocidas
 */
export async function getDatabaseStats(): Promise<CollectionStats[]> {
    const stats: CollectionStats[] = [];

    // Convertir el objeto COLLECTIONS a un array para iterar
    const entries = Object.entries(COLLECTIONS);

    // Ejecutar en paralelo para velocidad (con un límite de concurrencia implícito por el entorno si fuera necesario, 
    // pero para ~40 colecciones Promise.all suele estar bien)
    const promises = entries.map(async ([key, collectionId]) => {
        try {
            // Solo necesitamos el total, limitamos a 1 documento para ahorrar ancho de banda
            const response = await databases.listDocuments(
                DB_ID,
                collectionId,
                [Query.limit(1)]
            );

            // Formatear nombre legible (ej: PAGOS_COMPRAS -> Pagos Compras)
            const name = key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

            return {
                id: collectionId,
                name: name,
                count: response.total
            };
        } catch (error) {
            console.error(`Error fetching stats for ${key}:`, error);
            return null;
        }
    });

    const results = await Promise.all(promises);
    // Deduplicar por ID para evitar errores de llave en React y mostrar info redundante
    const uniqueStats = new Map<string, CollectionStats>();

    for (const stat of results) {
        if (stat && !uniqueStats.has(stat.id)) {
            uniqueStats.set(stat.id, stat);
        }
    }

    return Array.from(uniqueStats.values());
}

/**
 * Exporta todos los datos de una colección
 * Maneja paginación para obtener todos los registros
 */
export async function exportCollectionData(collectionId: string) {
    let allDocuments: any[] = [];
    let lastId = null;
    let limit = 100; // Máximo permitido por Appwrite suele ser 100

    try {
        while (true) {
            const queries = [Query.limit(limit)];
            if (lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            const response = await databases.listDocuments(
                DB_ID,
                collectionId,
                queries
            );

            if (response.documents.length === 0) break;

            const cleanedDocs = response.documents.map(doc => {
                // Removemos metadatos de sistema que no queremos importar tal cual si cambiamos de proyecto
                // Opcional: Mantener $id si queremos restaurar exactamente los mismos IDs
                const { $databaseId, $collectionId, ...rest } = doc;
                return rest;
            });

            allDocuments = [...allDocuments, ...cleanedDocs];
            lastId = response.documents[response.documents.length - 1].$id;

            // Si obtuvimos menos del límite, es la última página
            if (response.documents.length < limit) break;
        }

        return { success: true, data: allDocuments, count: allDocuments.length };
    } catch (error) {
        console.error("Export error:", error);
        return { success: false, error: "Error exportando datos" };
    }
}

/**
 * Importa datos a una colección
 * Intenta usar el ID original si existe. Si el documento existe, lo actualiza.
 */
export async function importCollectionData(collectionId: string, data: any[]) {
    let processed = 0;
    let errors = 0;
    let updated = 0;
    let created = 0;

    // Procesamos en lotes pequeños para no saturar
    // Appwrite no tiene bulk create, así que es uno por uno

    for (const doc of data) {
        try {
            const { $id, $createdAt, $updatedAt, $permissions, ...dataAttributes } = doc;
            const docId = $id || ID.unique();

            // Intentamos obtener el documento para ver si existe
            try {
                await databases.getDocument(DB_ID, collectionId, docId);
                // Si existe, actualizamos
                await databases.updateDocument(DB_ID, collectionId, docId, dataAttributes);
                updated++;
            } catch (e: any) {
                // Si no existe (404), creamos
                if (e.code === 404) {
                    await databases.createDocument(DB_ID, collectionId, docId, dataAttributes);
                    created++;
                } else {
                    throw e; // Otro error
                }
            }
            processed++;
        } catch (error) {
            console.error(`Error importing doc ${doc.$id || 'unknown'} to ${collectionId}:`, error);
            errors++;
        }
    }

    return {
        success: true,
        stats: { processed, created, updated, errors }
    };
}

export interface AttributeSchema {
    key: string;
    type: string;
    required: boolean;
    array: boolean;
    size?: number;
}

/**
 * Obtiene la estructura (esquema) de una colección
 */
export async function getCollectionSchema(collectionId: string): Promise<AttributeSchema[]> {
    try {
        const response = await databases.listAttributes(DB_ID, collectionId);

        return response.attributes.map((attr: any) => ({
            key: attr.key,
            type: attr.type,
            required: attr.required,
            array: attr.array,
            size: attr.size
        }));
    } catch (error) {
        console.error(`Error fetching schema for ${collectionId}:`, error);
        return [];
    }
}
