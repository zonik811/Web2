
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

    try {
        console.log(`Fixing collection 'saldo_vacaciones' in database '${DATABASE_ID}'...`);

        const collectionId = 'saldo_vacaciones';

        // Helper to safe create attribute
        const safeCreateInt = async (key: string, required: boolean, min?: number, max?: number, def?: any) => {
            try {
                await databases.createIntegerAttribute(DATABASE_ID, collectionId, key, required, min, max, def);
                console.log(`✅ Created attribute: ${key}`);
            } catch (error: any) {
                console.log(`⚠️  Attribute ${key} might already exist or failed: ${error.message}`);
            }
            await new Promise(r => setTimeout(r, 500)); // Wait a bit
        };

        await safeCreateInt('anioActual', true);
        await safeCreateInt('diasTotales', true);
        await safeCreateInt('diasUsados', true);
        await safeCreateInt('diasPendientes', true);
        await safeCreateInt('diasDisponibles', true);

        // Index
        try {
            await databases.createIndex(DATABASE_ID, collectionId, 'idx_empleadoId_unique', 'unique', ['empleadoId']);
            console.log(`✅ Created index: idx_empleadoId_unique`);
        } catch (error: any) {
            console.log(`⚠️  Index idx_empleadoId_unique might already exist: ${error.message}`);
        }

        console.log(`${colors.green}🎉 Fix completed!${colors.reset}`);

    } catch (error: any) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    }
}

main();
