'use server';

import { databases } from '@/lib/appwrite-admin';
import { DATABASE_ID } from '@/lib/appwrite';
import { ID, Query } from 'node-appwrite';

const COLLECTION_ID = 'team_members';

export interface TeamMember {
    $id?: string;
    name: string;
    role: string;
    bio?: string;
    image?: string;
    order?: number;
    active: boolean;
}

export async function obtenerMiembrosEquipo() {
    try {

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.equal('active', true),
                Query.orderAsc('order')
            ]
        );

        return { success: true, data: response.documents as unknown as TeamMember[] };
    } catch (error) {
        console.error('❌ Error obteniendo miembros equipo:', error);
        return { success: false, data: [] };
    }
}

export async function crearMiembroEquipo(data: Omit<TeamMember, '$id'>) {
    try {
        const result = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                name: data.name,
                role: data.role,
                bio: data.bio || '',
                image: data.image || '',
                order: data.order || 0,
                active: data.active !== false
            }
        );
        return { success: true, data: result };
    } catch (error) {
        console.error('Error creando miembro equipo:', error);
        return { success: false, error };
    }
}

export async function actualizarMiembroEquipo(id: string, data: Partial<TeamMember>) {
    try {
        const result = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            id,
            data
        );
        return { success: true, data: result };
    } catch (error) {
        console.error('Error actualizando miembro equipo:', error);
        return { success: false, error };
    }
}

export async function eliminarMiembroEquipo(id: string) {
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
        return { success: true };
    } catch (error) {
        console.error('Error eliminando miembro equipo:', error);
        return { success: false, error };
    }
}
