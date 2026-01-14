
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases, Query } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'empresa_config';

async function check() {
    console.log("🔍 Checking attributes for:", COLLECTION_ID);

    try {
        const response = await databases.listAttributes(DATABASE_ID, COLLECTION_ID, [
            Query.limit(100)
        ]);
        console.log(`\nTotal Attributes: ${response.total}`);
        console.log("----------------------------------------");

        const keys = response.attributes.map((a: any) => a.key);
        keys.sort();

        keys.forEach((k: string) => console.log(`- ${k}`));

        const missing = ['landing_equipo', 'landing_testimonios', 'branding_colors', 'logo', 'landing_catalogo_ids'].filter(k => !keys.includes(k));

        console.log("----------------------------------------");
        if (missing.length > 0) {
            console.log("❌ MISSING CRITICAL ATTRIBUTES:", missing);
        } else {
            console.log("✅ All critical attributes present.");
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

check();
