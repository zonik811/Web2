"use server";

import { databases } from "@/lib/appwrite-server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";

export interface Categoria {
    $id: string;
    nombre: string;
    slug: string;
    descripcion?: string;
    activo: boolean;
}

/**
 * Obtiene todas las categorías de servicios
 */
export async function obtenerCategorias(): Promise<Categoria[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CATEGORIAS,
            [
                Query.orderAsc("nombre"),
                Query.limit(100)
            ]
        );
        return response.documents as unknown as Categoria[];
    } catch (error: any) {
        console.error("Error obteniendo categorias:", error);
        return [];
    }
}

/**
 * Crea una nueva categoría
 */
export async function crearCategoria(nombre: string): Promise<{ success: boolean; data?: Categoria; error?: string }> {
    try {
        const slug = nombre.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');

        // Verificar si ya existe por slug
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CATEGORIAS,
            [Query.equal("slug", slug)]
        );

        if (existing.total > 0) {
            return { success: true, data: existing.documents[0] as unknown as Categoria };
        }

        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.CATEGORIAS,
            ID.unique(),
            {
                nombre,
                slug,
                tipo: 'servicio',
                activo: true
            }
        );

        return { success: true, data: doc as unknown as Categoria };
    } catch (error: any) {
        console.error("Error creando categoria:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza una categoría y propaga el cambio a los servicios
 */
export async function actualizarCategoria(id: string, nuevoNombre: string): Promise<{ success: boolean; data?: Categoria; error?: string }> {
    try {
        const oldDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.CATEGORIAS, id) as unknown as Categoria;
        const oldName = oldDoc.nombre;

        const slug = nuevoNombre.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

        // Update Category
        const updatedDoc = await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.CATEGORIAS,
            id,
            { nombre: nuevoNombre, slug }
        );

        // Bulk Update Services (Propagate name change)
        if (oldName !== nuevoNombre) {
            // Find services with old category
            let hasMore = true;
            let cursor = undefined;

            while (hasMore) {
                const queries = [Query.limit(100)];
                if (cursor) queries.push(Query.cursorAfter(cursor));

                const services = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SERVICIOS, queries);

                if (services.documents.length === 0) {
                    hasMore = false;
                    break;
                }

                const updates = services.documents
                    .filter((doc: any) => {
                        const cats = doc.categorias || [];
                        const cat = doc.categoria;
                        return cats.includes(oldName) || cat === oldName;
                    })
                    .map(async (doc: any) => {
                        const cats: string[] = doc.categorias || [];
                        const newCats = cats.map(c => c === oldName ? nuevoNombre : c);

                        // Also update legacy single field if match
                        const newSingle = doc.categoria === oldName ? nuevoNombre : doc.categoria;

                        return databases.updateDocument(DATABASE_ID, COLLECTIONS.SERVICIOS, doc.$id, {
                            categorias: newCats,
                            categoria: newSingle
                        });
                    });

                await Promise.all(updates);

                if (services.documents.length < 100) hasMore = false;
                cursor = services.documents[services.documents.length - 1].$id;
            }
        }

        return { success: true, data: updatedDoc as unknown as Categoria };

    } catch (error: any) {
        console.error("Error actualizando categoria:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Elimina una categoría
 */
export async function eliminarCategoria(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.CATEGORIAS,
            id
        );
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando categoria:", error);
        return { success: false, error: error.message };
    }
}
