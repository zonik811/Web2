
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

    const collectionId = 'compensatorios';

    try {
        console.log(`Fixing collection '${collectionId}' in database '${DATABASE_ID}'...`);

        // Helper to safe create attribute
        const safeCreate = async (promise: Promise<any>, name: string) => {
            try {
                await promise;
                console.log(`✅ Created attribute/index: ${name}`);
            } catch (error: any) {
                console.log(`⚠️  ${name} might already exist: ${error.message}`);
            }
            await new Promise(r => setTimeout(r, 500)); // Wait a bit
        };

        // Atributos
        await safeCreate(databases.createStringAttribute(DATABASE_ID, collectionId, 'empleadoId', 100, true), 'empleadoId');
        await safeCreate(databases.createStringAttribute(DATABASE_ID, collectionId, 'asistenciaId', 100, false), 'asistenciaId');
        await safeCreate(databases.createStringAttribute(DATABASE_ID, collectionId, 'fechaGanado', 30, true), 'fechaGanado');
        await safeCreate(databases.createStringAttribute(DATABASE_ID, collectionId, 'motivo', 255, true), 'motivo');
        await safeCreate(databases.createFloatAttribute(DATABASE_ID, collectionId, 'diasGanados', true), 'diasGanados');
        await safeCreate(databases.createStringAttribute(DATABASE_ID, collectionId, 'fechaVencimiento', 30, false), 'fechaVencimiento');

        // El problemático
        await safeCreate(databases.createStringAttribute(DATABASE_ID, collectionId, 'estado', 20, true, 'DISPONIBLE'), 'estado');

        await safeCreate(databases.createStringAttribute(DATABASE_ID, collectionId, 'fechaUso', 30, false), 'fechaUso');
        await safeCreate(databases.createStringAttribute(DATABASE_ID, collectionId, 'usadoEnPermisoId', 100, false), 'usadoEnPermisoId');

        // Indexes
        await safeCreate(databases.createIndex(DATABASE_ID, collectionId, 'idx_comp_empleado', 'key', ['empleadoId']), 'idx_comp_empleado');
        await safeCreate(databases.createIndex(DATABASE_ID, collectionId, 'idx_comp_estado', 'key', ['estado']), 'idx_comp_estado');

        console.log(`${colors.green}🎉 Fix completed for compensatorios!${colors.reset}`);

    } catch (error: any) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    }
}

main();
