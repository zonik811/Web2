/**
 * 🚀 Setup de Colecciones de Vacaciones
 * 
 * USO: npx tsx scripts/setup-vacaciones.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { Client, Databases } from 'node-appwrite';
import { createVacaciones, createSaldoVacaciones } from './collections/vacaciones';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

async function main() {
    console.log(`${colors.cyan}
╔══════════════════════════════════════════╗
║   🏖️ Setup Vacaciones                    ║
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

    try {
        await databases.get(DATABASE_ID);
        console.log(`${colors.green}✅ Conectado a Appwrite\n${colors.reset}`);
    } catch (error: any) {
        console.error(`${colors.red}❌ Error de conexión: ${error.message}${colors.reset}`);
        process.exit(1);
    }

    try {
        // Vacaciones
        try {
            await databases.getCollection(DATABASE_ID, 'vacaciones');
            console.log(`${colors.yellow}⏭️  Vacaciones ya existe${colors.reset}\n`);
        } catch {
            await createVacaciones(databases, DATABASE_ID);
            console.log('');
        }

        // Saldo Vacaciones
        try {
            await databases.getCollection(DATABASE_ID, 'saldo_vacaciones');
            console.log(`${colors.yellow}⏭️  Saldo Vacaciones ya existe${colors.reset}\n`);
        } catch {
            await createSaldoVacaciones(databases, DATABASE_ID);
            console.log('');
        }

        console.log(`${colors.green}
🎉 ¡Colecciones de Vacaciones listas!
${colors.reset}`);

        process.exit(0);
    } catch (error: any) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
        process.exit(1);
    }
}

main();
