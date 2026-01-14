"use server";

import { databases, storage } from "@/lib/appwrite-server"; // Use Server SDK
import { DATABASE_ID, COLLECTIONS, STORAGE_BUCKET_ID } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import {
    type Servicio,
    type CrearServicioInput,
    type ActualizarServicioInput,
    type CreateResponse,
    type UpdateResponse,
    type DeleteResponse
} from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Obtiene todos los servicios (Admin: incluye inactivos)
 */
export async function obtenerServiciosAdmin(): Promise<Servicio[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.SERVICIOS,
            [
                Query.orderDesc("$createdAt"),
                Query.limit(100)
            ]
        );
        return response.documents as unknown as Servicio[];
    } catch (error: any) {
        console.error("Error obteniendo servicios admin:", error);
        return [];
    }
}

/**
 * Helper para subir archivos usando Node Appwrite SDK
 */
async function uploadFileServer(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    // Create a File object compatible with Appwrite SDK (which uses standard File)
    const fileObj = new File([buffer], file.name, { type: file.type });

    const upload = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        fileObj
    );
    return upload.$id;
}

/**
 * Crea un nuevo servicio
 */
export async function crearServicio(data: CrearServicioInput): Promise<CreateResponse<Servicio>> {
    try {
        let imagenId = undefined;

        // Subir imagen si existe
        if (data.imagen && data.imagen instanceof File && data.imagen.size > 0) {
            try {
                imagenId = await uploadFileServer(data.imagen);
            } catch (uploadError) {
                console.error("Error subiendo imagen:", uploadError);
            }
        }

        const slug = data.nombre.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');

        const cats = data.categorias && data.categorias.length > 0
            ? data.categorias
            : (data.categoria ? [data.categoria] : []);

        const mainCat = cats.length > 0 ? cats[0] : (data.categoria || '');

        const servicioData = {
            nombre: data.nombre,
            slug: slug,
            descripcion: data.descripcion,
            descripcionCorta: data.descripcionCorta,
            categoria: mainCat,
            categorias: cats,
            precioBase: data.precioBase,
            unidadPrecio: data.unidadPrecio,
            duracionEstimada: data.duracionEstimada,
            caracteristicas: data.caracteristicas,
            requierePersonal: data.requierePersonal,
            activo: data.activo !== undefined ? data.activo : true,
            imagen: imagenId
        };

        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.SERVICIOS,
            ID.unique(),
            servicioData
        );

        revalidatePath("/admin/servicios");
        return { success: true, data: doc as unknown as Servicio };
    } catch (error: any) {
        console.error("Error creando servicio:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualiza un servicio existente
 */
export async function actualizarServicio(data: ActualizarServicioInput): Promise<UpdateResponse> {
    try {
        const { id, imagen, ...camposActualizables } = data;
        let updateData: any = {
            ...camposActualizables
        };

        // Sync logic for dual fields if categories changed
        if (data.categorias || data.categoria) {
            const cats = data.categorias && data.categorias.length > 0
                ? data.categorias
                : (data.categoria ? [data.categoria] : []);

            const mainCat = cats.length > 0 ? cats[0] : (data.categoria || '');

            updateData.categorias = cats;
            updateData.categoria = mainCat;
        }

        // Manejo de imagen (solo si se provee una nueva)
        if (imagen && imagen instanceof File && imagen.size > 0) {
            try {
                const newImageId = await uploadFileServer(imagen);
                updateData.imagen = newImageId;
            } catch (uploadError) {
                console.error("Error subiendo nueva imagen:", uploadError);
            }
        }

        // Si el nombre cambia, actualizar slug
        if (data.nombre) {
            updateData.slug = data.nombre.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
        }

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.SERVICIOS,
            id,
            updateData
        );

        revalidatePath("/admin/servicios");
        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando servicio:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Elimina (o desactiva) un servicio
 */
export async function eliminarServicio(id: string): Promise<DeleteResponse> {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.SERVICIOS,
            id
        );
        revalidatePath("/admin/servicios");
        return { success: true };
    } catch (error: any) {
        // Fallback: si no se puede eliminar por integridad referencial, desactivar
        console.warn("Intento de eliminar fallido, intentando desactivar...", error);
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.SERVICIOS,
                id,
                { activo: false }
            );
            revalidatePath("/admin/servicios");
            return { success: true }; // Consideramos éxito parcial
        } catch (updateError: any) {
            return { success: false, error: updateError.message };
        }
    }
}
