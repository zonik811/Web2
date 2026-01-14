
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

async function main() {
    console.log("🧪 Testing tiny attribute creation...");
    try {
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'test_tiny', 10, false);
        console.log("✅ SUCCESS: Created 'test_tiny' (Size 10). It was a size limit issue with larger fields, or previously stuck.");

        // Clean up
        await databases.deleteAttribute(DATABASE_ID, COLLECTION_ID, 'test_tiny');
        console.log("🗑️  Cleaned up 'test_tiny'");
    } catch (e: any) {
        console.log("❌ FAILED:", e.message);
        console.log("Code:", e.code);
        console.log("Type:", e.type);
    }
}

main();
