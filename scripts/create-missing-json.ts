
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
    console.log("🛠️  Ensuring JSON attributes exist...");

    // Lista de atributos JSON que necesitamos
    const jsonAttrs = [
        { key: 'config_landing', size: 100000 },
        { key: 'config_stats', size: 100000 },
        { key: 'config_cta_final', size: 100000 },
        { key: 'config_horarios', size: 100000 },
        { key: 'config_seo', size: 100000 },
        { key: 'config_branding', size: 100000 }
    ];

    for (const attr of jsonAttrs) {
        try {
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.size, false);
            console.log(`✅ Created: ${attr.key}`);
        } catch (e: any) {
            if (e.message?.includes('already exists')) {
                console.log(`⚠️ Exists: ${attr.key}`);
            } else {
                console.error(`❌ ERROR creating ${attr.key}: ${e.message}`);
            }
        }
    }
}

main();
