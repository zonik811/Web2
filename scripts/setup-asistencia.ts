/**
 * 🚀 Setup de Colecciones de Asistencia
 * 
 * Crea las colecciones necesarias para el módulo de control de asistencia.
 * 
 * USO: npx tsx scripts/setup-asistencia.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { Client, Databases } from 'node-appwrite';
import { createAsistencias } from './collections/asistencias';
import { createConfiguracionAsistencia } from './collections/configuracion-asistencia';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

async function collectionExists(databases: Databases, databaseId: string, collectionId: string): Promise<boolean> {
    try {
        await databases.getCollection(databaseId, collectionId);
        return true;
    } catch {
        return false;
    }
}

async function main() {
    console.log(`${colors.cyan}
╔══════════════════════════════════════════╗
║   🕐 Setup Módulo de Asistencia          ║
╚══════════════════════════════════════════╝
  ${colors.reset}\n`);

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

    // Verificar conexión
    try {
        await databases.get(DATABASE_ID);
        console.log(`${colors.green}✅ Conectado a Appwrite\n${colors.reset}`);
    } catch (error: any) {
        console.error(`${colors.red}❌ Error de conexión: ${error.message}${colors.reset}`);
        process.exit(1);
    }

    const collections = [
        { id: 'asistencias', name: 'Asistencias', fn: createAsistencias },
        { id: 'configuracion_asistencia', name: 'Configuración Asistencia', fn: createConfiguracionAsistencia }
    ];

    for (const col of collections) {
        try {
            const exists = await collectionExists(databases, DATABASE_ID, col.id);

            if (exists) {
                console.log(`${colors.yellow}⏭️  ${col.name} ya existe, saltando...${colors.reset}\n`);
                continue;
            }

            await col.fn(databases, DATABASE_ID);
            console.log('');

        } catch (error: any) {
            console.error(`${colors.red}❌ Error en ${col.name}: ${error.message}${colors.reset}\n`);
            process.exit(1);
        }
    }

    console.log(`${colors.green}
🎉 ¡Colecciones de Asistencia creadas exitosamente!

📝 Próximos pasos:
   1. Verificar en Appwrite Console que las colecciones existen
   2. Continuar con Tarea 1.3 (agregar a appwrite.ts)
${colors.reset}`);

    process.exit(0);
}

main();
