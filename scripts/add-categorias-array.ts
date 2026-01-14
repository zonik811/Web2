
import { Client, Databases, Query } from "node-appwrite";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error("❌ .env.local file not found at " + envPath);
    process.exit(1);
}

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
    console.error("❌ NEXT_PUBLIC_APPWRITE_ENDPOINT is missing");
    process.exit(1);
}

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

// IDs
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const SERVICIOS_COLLECTION = "servicios"; // Ensure this matches your collection ID in constants

async function migrate() {
    console.log("🚀 Starting migration: Update services to use 'categorias' array...");

    try {
        // 1. Add 'categorias' attribute (Array of Strings)
        console.log("1️⃣ Adding 'categorias' attribute...");
        try {
            await databases.createStringAttribute(DATABASE_ID, SERVICIOS_COLLECTION, "categorias", 255, false, undefined, true); // isArray = true
            console.log("   ✅ Attribute 'categorias' created (requires waiting for availability).");
            // Wait for attribute to be available
            console.log("   ⏳ Waiting 5 seconds for attribute propagation...");
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error: any) {
            if (error.code === 409) {
                console.log("   ℹ️ Attribute 'categorias' already exists.");
            } else {
                throw error;
            }
        }

        // 2. Migrate Data
        console.log("2️⃣ Migrating existing data...");
        let hasMore = true;
        let offset = 0;
        const limit = 50;

        while (hasMore) {
            const response = await databases.listDocuments(DATABASE_ID, SERVICIOS_COLLECTION, [
                Query.limit(limit),
                Query.offset(offset)
            ]);

            if (response.documents.length === 0) {
                hasMore = false;
                break;
            }

            for (const doc of response.documents) {
                const oldCategory = doc.categoria; // The single string
                const newCategories = doc.categorias; // The array

                // If old category exists and new array is empty or undefined, migrate
                if (oldCategory && (!newCategories || newCategories.length === 0)) {
                    console.log(`   🔄 Migrating service: ${doc.nombre} (${oldCategory}) -> [${oldCategory}]`);
                    try {
                        await databases.updateDocument(DATABASE_ID, SERVICIOS_COLLECTION, doc.$id, {
                            categorias: [oldCategory]
                        });
                    } catch (e) {
                        console.error(`   ❌ Failed to migrate ${doc.$id}:`, e);
                    }
                } else {
                    console.log(`   Example skipped: ${doc.nombre} already has categories or no old category.`);
                }
            }

            offset += limit;
        }

        console.log("✅ Migration complete!");

    } catch (error) {
        console.error("❌ Fatal error during migration:", error);
    }
}

migrate();
