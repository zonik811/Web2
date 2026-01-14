
import { Client, Databases } from "node-appwrite";
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.APPWRITE_API_KEY) {
    console.error("Error: Missing endpoint or API Key");
    process.exit(1);
}

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_SERVICIOS = 'servicios';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function migrateCategory() {
    console.log("🛠️ Starting migration of 'categoria' attribute...");

    try {
        console.log("1️⃣ Deleting existing 'categoria' attribute (Enum)...");
        await databases.deleteAttribute(DATABASE_ID, COLLECTION_SERVICIOS, "categoria");
        console.log("✅ Attribute deleted. Waiting for Appwrite to process...");

        // Wait for Appwrite to flush the deletion (safe margin)
        await sleep(5000);
    } catch (e: any) {
        console.log(`ℹ️ Delete failed (maybe it didn't exist or was already processing): ${e.message}`);
    }

    try {
        console.log("2️⃣ Creating new 'categoria' attribute (String)...");
        // Creating as String, size 100, required=true
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_SERVICIOS,
            "categoria",
            100,
            true
        );
        console.log("✅ New 'categoria' attribute created successfully as String!");
    } catch (e: any) {
        console.error("❌ Error creating new attribute:", e.message);
        // If it failed because it's still being deleted, we might need to wait more and retry manually
    }
}

migrateCategory();
