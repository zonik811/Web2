"use server";

import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite-admin";
import { Query, ID } from "node-appwrite";

// ========== CARGOS ==========

export async function obtenerCargos() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CARGOS,
            [Query.orderAsc("orden"), Query.limit(100)]
        );
        return response.documents;
    } catch (error: any) {
        console.error("Error obteniendo cargos:", error);
        throw new Error(error.message || "Error al obtener cargos");
    }
}

export async function crearCargo(data: { nombre: string; descripcion?: string; orden?: number }) {
    try {
        const cargo = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.CARGOS,
            ID.unique(),
            {
                nombre: data.nombre,
                descripcion: data.descripcion || "",
                orden: data.orden || 0,
                activo: true,
            }
        );
        return { success: true, data: cargo };
    } catch (error: any) {
        console.error("Error creando cargo:", error);
        return { success: false, error: error.message };
    }
}

export async function actualizarCargo(id: string, data: Partial<{ nombre: string; descripcion: string; orden: number }>) {
    try {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.CARGOS, id, data);
        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando cargo:", error);
        return { success: false, error: error.message };
    }
}

export async function eliminarCargo(id: string) {
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.CARGOS, id);
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando cargo:", error);
        return { success: false, error: error.message };
    }
}

// ========== ESPECIALIDADES ==========

export async function obtenerEspecialidades() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ESPECIALIDADES,
            [Query.orderAsc("orden"), Query.limit(100)]
        );
        return response.documents;
    } catch (error: any) {
        console.error("Error obteniendo especialidades:", error);
        throw new Error(error.message || "Error al obtener especialidades");
    }
}

export async function crearEspecialidad(data: { nombre: string; descripcion?: string; icono?: string; orden?: number }) {
    try {
        const especialidad = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.ESPECIALIDADES,
            ID.unique(),
            {
                nombre: data.nombre,
                descripcion: data.descripcion || "",
                icono: data.icono || "",
                orden: data.orden || 0,
                activo: true,
            }
        );
        return { success: true, data: especialidad };
    } catch (error: any) {
        console.error("Error creando especialidad:", error);
        return { success: false, error: error.message };
    }
}

export async function actualizarEspecialidad(id: string, data: Partial<{ nombre: string; descripcion: string; icono: string; orden: number }>) {
    try {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.ESPECIALIDADES, id, data);
        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando especialidad:", error);
        return { success: false, error: error.message };
    }
}

export async function eliminarEspecialidad(id: string) {
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ESPECIALIDADES, id);
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando especialidad:", error);
        return { success: false, error: error.message };
    }
}

// ========== MÉTODOS DE PAGO ==========

export async function obtenerMetodosPago() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.METODOS_PAGO,
            [Query.orderAsc("orden"), Query.limit(100)]
        );
        return response.documents;
    } catch (error: any) {
        console.error("Error obteniendo métodos de pago:", error);
        throw new Error(error.message || "Error al obtener métodos de pago");
    }
}

export async function crearMetodoPago(data: { nombre: string; descripcion?: string; icono?: string; orden?: number; codigo: string }) {
    try {
        const metodoPago = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.METODOS_PAGO,
            ID.unique(),
            {
                nombre: data.nombre,
                descripcion: data.descripcion || "",
                icono: data.icono || "",
                orden: data.orden || 0,
                codigo: data.codigo,
            }
        );
        return { success: true, data: metodoPago };
    } catch (error: any) {
        console.error("Error creando método de pago:", error);
        return { success: false, error: error.message };
    }
}

export async function actualizarMetodoPago(id: string, data: Partial<{ nombre: string; descripcion: string; icono: string; orden: number; codigo: string }>) {
    try {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.METODOS_PAGO, id, data);
        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando método de pago:", error);
        return { success: false, error: error.message };
    }
}

export async function eliminarMetodoPago(id: string) {
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.METODOS_PAGO, id);
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando método de pago:", error);
        return { success: false, error: error.message };
    }
}

// ========== TIPOS DE CLIENTE ==========

export async function obtenerTiposCliente() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            'tipos_cliente',
            [Query.limit(100)]
        );
        return response.documents;
    } catch (error: any) {
        console.error("Error obteniendo tipos de cliente:", error);
        return [];
    }
}

export async function crearTipoCliente(data: { nombre: string; descripcion?: string }) {
    try {
        const doc = await databases.createDocument(
            DATABASE_ID,
            'tipos_cliente',
            ID.unique(),
            {
                nombre: data.nombre,
                descripcion: data.descripcion || "",
                activo: true,
            }
        );
        return { success: true, data: doc };
    } catch (error: any) {
        console.error("Error creando tipo de cliente:", error);
        return { success: false, error: error.message };
    }
}

export async function actualizarTipoCliente(id: string, data: { nombre: string; descripcion?: string }) {
    try {
        const doc = await databases.updateDocument(
            DATABASE_ID,
            'tipos_cliente',
            id,
            {
                nombre: data.nombre,
                descripcion: data.descripcion || "",
                activo: true,
            }
        );
        return { success: true, data: doc };
    } catch (error: any) {
        console.error("Error actualizando tipo de cliente:", error);
        return { success: false, error: error.message };
    }
}

export async function eliminarTipoCliente(id: string) {
    try {
        await databases.deleteDocument(DATABASE_ID, 'tipos_cliente', id);
        return { success: true };
    } catch (error: any) {
        console.error("Error eliminando tipo de cliente:", error);
        return { success: false, error: error.message };
    }
}
