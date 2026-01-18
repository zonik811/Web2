"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";

export type ClientePOS = {
    $id: string;
    nombre: string;
    telefono: string;
    email: string;
};

export type QuickCustomerData = {
    nombre: string;
    telefono?: string;
    email?: string;
    documento?: string;
};

/**
 * Obtiene el cliente genérico "Cliente Mostrador"
 */
export async function obtenerClienteGenerico(): Promise<ClientePOS | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            [
                Query.equal("email", "mostrador@pos.com"),
                Query.limit(1)
            ]
        );

        if (response.documents.length === 0) {
            console.error("Cliente genérico no encontrado. Ejecuta: npx tsx scripts/create-generic-customer.ts");
            return null;
        }

        const cliente = response.documents[0];
        return {
            $id: cliente.$id,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email
        };
    } catch (error) {
        console.error("Error obteniendo cliente genérico:", error);
        return null;
    }
}

/**
 * Busca clientes por nombre, teléfono o documento
 */
export async function buscarClientes(query: string): Promise<ClientePOS[]> {
    try {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchTerm = query.trim().toLowerCase();

        // Fetch all clients (limit to reasonable number)
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            [
                Query.limit(100)
            ]
        );

        // Filter on server side
        const filtered = response.documents.filter((doc: any) => {
            const nombre = (doc.nombre || "").toLowerCase();
            const telefono = (doc.telefono || "").toLowerCase();
            const email = (doc.email || "").toLowerCase();

            return nombre.includes(searchTerm) ||
                telefono.includes(searchTerm) ||
                email.includes(searchTerm);
        });

        return filtered.slice(0, 20).map((doc: any) => ({
            $id: doc.$id,
            nombre: doc.nombre,
            telefono: doc.telefono || "",
            email: doc.email || ""
        }));
    } catch (error) {
        console.error("Error buscando clientes:", error);
        return [];
    }
}

/**
 * Crea un cliente rápido con datos mínimos
 */
export async function crearClienteRapido(data: QuickCustomerData): Promise<{ success: boolean; clienteId?: string; error?: string }> {
    try {
        if (!data.nombre || data.nombre.trim().length === 0) {
            return { success: false, error: "El nombre es obligatorio" };
        }

        const nuevoCliente = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.CLIENTES,
            ID.unique(),
            {
                nombre: data.nombre.trim(),
                telefono: data.telefono?.trim() || "Sin especificar",
                email: data.email?.trim() || `generico${Date.now()}@pos.com`,
                direccion: "Por definir",
                ciudad: "Por definir",
                tipoCliente: "particular",
                frecuenciaPreferida: "unica",
                totalServicios: 0,
                totalGastado: 0,
                calificacionPromedio: 0,
                notasImportantes: `Cliente creado desde POS - ${new Date().toLocaleDateString()}`
            }
        );

        return {
            success: true,
            clienteId: nuevoCliente.$id
        };
    } catch (error: any) {
        console.error("Error creando cliente rápido:", error);
        return {
            success: false,
            error: error.message || "Error al crear cliente"
        };
    }
}
