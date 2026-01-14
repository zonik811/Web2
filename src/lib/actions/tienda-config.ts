"use server";

import { databases } from "@/lib/appwrite-server";
import { TiendaConfig } from "@/types/tienda";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "tienda_config";

export async function obtenerConfiguracionTienda(): Promise<TiendaConfig | null> {
    try {
        const { documents } = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID
        );

        if (documents.length === 0) {
            return null;
        }

        return documents[0] as unknown as TiendaConfig;
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        return null;
    }
}

export async function actualizarConfiguracionTienda(
    configId: string,
    data: Partial<Omit<TiendaConfig, '$id'>>
): Promise<{ success: boolean; message: string }> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            configId,
            data
        );

        return { success: true, message: 'Configuración actualizada correctamente' };
    } catch (error: any) {
        console.error('Error actualizando configuración:', error);
        return { success: false, message: error.message || 'Error desconocido' };
    }
}
