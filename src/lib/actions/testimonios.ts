'use server';

import { databases } from '@/lib/appwrite-admin';
import { DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'node-appwrite';

const COLLECTION_ID = 'testimonials';

export interface Testimonial {
    $id?: string;
    author: string;
    role?: string;
    content: string;
    rating?: number;
    image?: string;
    order?: number;
    active: boolean;
}

export async function obtenerTestimonios() {
    try {

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('active', true),
                Query.orderAsc('order')
            ]
        );

        return { success: true, data: response.documents as unknown as Testimonial[] };
    } catch (error) {
        console.error('❌ Error obteniendo testimonios:', error);
        return { success: false, data: [] };
    }
}

export async function crearTestimonio(data: Omit<Testimonial, '$id'>) {
    try {
        const result = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                author: data.author,
                role: data.role || '',
                content: data.content,
                rating: data.rating || 5,
                image: data.image || '',
                order: data.order || 0,
                active: data.active !== false
            }
        );
        return { success: true, data: result };
    } catch (error) {
        console.error('Error creando testimonio:', error);
        return { success: false, error };
    }
}

export async function actualizarTestimonio(id: string, data: Partial<Testimonial>) {
    try {
        const result = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            id,
            data
        );
        return { success: true, data: result };
    } catch (error) {
        console.error('Error actualizando testimonio:', error);
        return { success: false, error };
    }
}

export async function eliminarTestimonio(id: string) {
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
        return { success: true };
    } catch (error) {
        console.error('Error eliminando testimonio:', error);
        return { success: false, error };
    }
}
