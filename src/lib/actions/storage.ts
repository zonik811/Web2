"use server";

import { storage } from "@/lib/appwrite-admin";
import { STORAGE_BUCKET_ID } from "@/lib/appwrite";
import { ID } from "node-appwrite";

/**
 * Sube un archivo base64 a Appwrite Storage
 */
export async function subirImagenBase64(
    base64Image: string,
    filename: string = "image.png"
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Convertir base64 a Buffer
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Crear File from buffer
        const blob = new Blob([buffer]);
        const file = new File([blob], filename, { type: "image/png" });

        // Subir a Storage
        const response = await storage.createFile(
            STORAGE_BUCKET_ID,
            ID.unique(),
            file
        );

        // Retornar URL
        const url = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

        return { success: true, url };
    } catch (error: any) {
        console.error("Error subiendo imagen:", error);
        return {
            success: false,
            error: error.message || "Error al subir imagen",
        };
    }
}
