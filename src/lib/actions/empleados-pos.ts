"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";

export type EmpleadoPOS = {
    $id: string;
    nombre: string;
    apellido: string;
    cargo: string;
};

/**
 * Obtiene lista de empleados activos para selección en POS
 */
export async function obtenerEmpleadosActivos(): Promise<EmpleadoPOS[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.EMPLEADOS,
            [
                Query.equal("activo", true),
                Query.limit(50)
            ]
        );

        return response.documents.map((doc: any) => ({
            $id: doc.$id,
            nombre: doc.nombre,
            apellido: doc.apellido,
            cargo: doc.cargo || "Empleado"
        }));
    } catch (error) {
        console.error("Error obteniendo empleados:", error);
        return [];
    }
}

/**
 * Obtiene un empleado por su ID
 */
export async function obtenerEmpleadoPorId(empleadoId: string): Promise<EmpleadoPOS | null> {
    try {
        const empleado = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.EMPLEADOS,
            empleadoId
        );

        return {
            $id: empleado.$id,
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            cargo: empleado.cargo || "Empleado"
        };
    } catch (error) {
        console.error("Error obteniendo empleado:", error);
        return null;
    }
}
