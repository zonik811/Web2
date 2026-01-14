
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'empresa_config';

async function testCreate() {
    try {
        console.log("Attempting to create 'landing_equipo'...");
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'landing_equipo', 100000, false);
        console.log("✅ Success!");
    } catch (e: any) {
        console.error("❌ ERROR:", e.message);
        console.error("Code:", e.code);
        console.error("Type:", e.type);
    }
}

testCreate();
