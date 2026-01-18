
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

    // Helper to safe create attribute
    const safeCreate = async (promise: Promise<any>, name: string) => {
        try {
            await promise;
            console.log(`✅ Created attribute/index: ${name}`);
        } catch (error: any) {
            console.log(`⚠️  ${name} might already exist or failed: ${error.message}`);
        }
        await new Promise(r => setTimeout(r, 1000)); // Wait 1s between ops
    };

    try {
        // 1. FIX VACACIONES
        console.log(`\n🔧 Fixing 'vacaciones'...`);
        // Attribute 'anio'
        await safeCreate(databases.createIntegerAttribute(DATABASE_ID, 'vacaciones', 'anio', true), 'anio');
        // Index 'idx_anio' (correct name)
        await safeCreate(databases.createIndex(DATABASE_ID, 'vacaciones', 'idx_anio_corrected', 'key', ['anio']), 'idx_anio_corrected');
        // Attribute 'diasSolicitados'
        await safeCreate(databases.createIntegerAttribute(DATABASE_ID, 'vacaciones', 'diasSolicitados', true), 'diasSolicitados');
        // Attribute 'estado'
        await safeCreate(databases.createStringAttribute(DATABASE_ID, 'vacaciones', 'estado', 20, true, 'PENDIENTE'), 'estado');

        // 2. FIX COMPENSATORIOS
        console.log(`\n🔧 Fixing 'compensatorios'...`);
        // Attribute 'estado'
        await safeCreate(databases.createStringAttribute(DATABASE_ID, 'compensatorios', 'estado', 20, true, 'DISPONIBLE'), 'estado');
        // Attribute 'empleadoId' (just in case)
        await safeCreate(databases.createStringAttribute(DATABASE_ID, 'compensatorios', 'empleadoId', 100, true), 'empleadoId');
        // Index
        await safeCreate(databases.createIndex(DATABASE_ID, 'compensatorios', 'idx_comp_estado', 'key', ['estado']), 'idx_comp_estado');
        await safeCreate(databases.createIndex(DATABASE_ID, 'compensatorios', 'idx_comp_empleado', 'key', ['empleadoId']), 'idx_comp_empleado');

        // 3. FIX BANCO_HORAS (Just in case)
        console.log(`\n🔧 Fixing 'banco_horas'...`);
        await safeCreate(databases.createStringAttribute(DATABASE_ID, 'banco_horas', 'empleadoId', 100, true), 'empleadoId');
        await safeCreate(databases.createIndex(DATABASE_ID, 'banco_horas', 'idx_banco_empleado', 'key', ['empleadoId']), 'idx_banco_empleado');


        console.log(`${colors.green}\n🎉 All schema fixes attempted!${colors.reset}`);

    } catch (error: any) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    }
}

main();
