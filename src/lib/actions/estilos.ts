"use server";

import { databases } from "@/lib/appwrite";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";

export interface ComponentStyleDoc {
    $id: string;
    name: string;
    type: 'button' | 'badge' | 'card' | 'overlay';
    css_classes: string;
    preview_markup?: string;
    is_active: boolean;
}

// Standardized response type
export type EstilosResponse = {
    success: boolean;
    data?: ComponentStyleDoc[];
    error?: string;
};

export async function obtenerEstilos(): Promise<EstilosResponse> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMPONENT_STYLES,
            [
                Query.limit(500),
                Query.equal('is_active', true)
            ]
        );
        return {
            success: true,
            data: response.documents as unknown as ComponentStyleDoc[]
        };
    } catch (error: any) {
        console.error("Error fetching styles:", error);
        return {
            success: false,
            error: error.message || "Failed to fetch styles"
        };
    }
}
