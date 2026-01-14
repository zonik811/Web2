"use server";

import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";

export async function obtenerPerfilPorEmail(email: string) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USER_PROFILE,
            [Query.equal("email", email), Query.limit(1)]
        );

        if (response.documents.length > 0) {
            return response.documents[0];
        }

        return null;
    } catch (error) {
        console.error("Error obteniendo perfil por email:", error);
        return null;
    }
}

export async function obtenerPerfilPorUserId(userId: string) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USER_PROFILE,
            [Query.equal("userId", userId), Query.limit(1)]
        );

        if (response.documents.length > 0) {
            return response.documents[0];
        }

        return null;
    } catch (error) {
        console.error("Error obteniendo perfil por userId:", error);
        return null;
    }
}
