
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { Client, Databases } from 'node-appwrite';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

async function main() {
    const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const API_KEY = process.env.APPWRITE_API_KEY;

    if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID || !API_KEY) {
        console.error(`${colors.red}❌ Faltan variables de entorno${colors.reset}`);
        process.exit(1);
    }

    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);

    const collectionsToCheck = ['vacaciones', 'compensatorios', 'banco_horas'];

    for (const name of collectionsToCheck) {
        try {
            console.log(`\n🔍 Inspecting collection '${name}'...`);
            const collection = await databases.getCollection(DATABASE_ID, name);

            console.log('   Attributes:');
            collection.attributes.forEach((attr: any) => {
                console.log(`   - ${attr.key} (${attr.type}) [required: ${attr.required}]`);
            });

            console.log('   Indexes:');
            collection.indexes.forEach((idx: any) => {
                console.log(`   - ${idx.key} (${idx.type}) -> [${idx.attributes.join(', ')}]`);
            });

        } catch (error: any) {
            console.error(`${colors.red}❌ Error checking ${name}: ${error.message}${colors.reset}`);
        }
    }
}

main();
