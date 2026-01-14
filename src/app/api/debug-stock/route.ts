
import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PRODUCTOS,
            [Query.limit(5)] // Fetch 5 to see variation
        );

        return NextResponse.json({
            count: response.total,
            products: response.documents
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
