
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

    // 1. INSPECT VACACIONES
    try {
        console.log(`\n🔍 Checking 'vacaciones'...`);
        const col = await databases.getCollection(DATABASE_ID, 'vacaciones');
        const hasAnio = col.attributes.find((a: any) => a.key === 'anio');
        console.log(`   - Attribute 'anio': ${hasAnio ? '✅ EXISTS' : '❌ MISSING'}`);

        if (!hasAnio) {
            console.log(`   - Creating 'anio'...`);
            await databases.createIntegerAttribute(DATABASE_ID, 'vacaciones', 'anio', true);
            console.log(`   ✅ Created 'anio'`);
        }
    } catch (e: any) {
        console.error(`   ❌ Error: ${e.message}`);
    }

    // 2. INSPECT COMPENSATORIOS
    try {
        console.log(`\n🔍 Checking 'compensatorios'...`);
        const col = await databases.getCollection(DATABASE_ID, 'compensatorios');
        const hasEstado = col.attributes.find((a: any) => a.key === 'estado');
        console.log(`   - Attribute 'estado': ${hasEstado ? '✅ EXISTS' : '❌ MISSING'}`);

        if (!hasEstado) {
            console.log(`   - Creating 'estado'...`);
            await databases.createStringAttribute(DATABASE_ID, 'compensatorios', 'estado', 20, true, 'DISPONIBLE');
            console.log(`   ✅ Created 'estado'`);
        }
    } catch (e: any) {
        console.error(`   ❌ Error: ${e.message}`);
    }
}

main();
