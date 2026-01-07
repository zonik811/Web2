import { Client, Databases, Storage, Account } from "appwrite";

// Cliente de Appwrite
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

// Servicios de Appwrite
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// IDs de recursos
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;

// Nombres de colecciones
export const COLLECTIONS = {
    SERVICIOS: "servicios",
    CITAS: "citas",
    EMPLEADOS: "empleados",
    PAGOS_EMPLEADOS: "pagos_empleados",
    CLIENTES: "clientes",
};

// Funciones helper para Storage

/**
 * Sube un archivo a Appwrite Storage
 */
export async function subirArchivo(file: File): Promise<string> {
    try {
        const response = await storage.createFile(
            STORAGE_BUCKET_ID,
            "unique()",
            file
        );
        return response.$id;
    } catch (error) {
        console.error("Error subiendo archivo:", error);
        throw new Error("No se pudo subir el archivo");
    }
}

/**
 * Obtiene la URL de un archivo desde Appwrite Storage
 */
export function obtenerURLArchivo(fileId: string): string {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
}

/**
 * Elimina un archivo de Appwrite Storage
 */
export async function eliminarArchivo(fileId: string): Promise<void> {
    try {
        await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
    } catch (error) {
        console.error("Error eliminando archivo:", error);
        throw new Error("No se pudo eliminar el archivo");
    }
}

export default client;
