/**
 * Script para poblar métodos de pago iniciales
 * USO: npx tsx scripts/seed-metodos-pago.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases, ID } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    cyan: '\x1b[36m'
};

async function main() {
    console.log(`${colors.cyan}Poblando métodos de pago...${colors.reset}\n`);

    const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const API_KEY = process.env.APPWRITE_API_KEY!;

    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);

    try {
        const metodosPago = [
            { nombre: 'Efectivo', descripcion: 'Pago en efectivo', icono: '💵', orden: 1 },
            { nombre: 'Transferencia', descripcion: 'Transferencia bancaria', icono: '🏦', orden: 2 },
            { nombre: 'Tarjeta', descripcion: 'Tarjeta de crédito/débito', icono: '💳', orden: 3 },
            { nombre: 'Nequi', descripcion: 'Pago por Nequi', icono: '📱', orden: 4 },
            { nombre: 'Daviplata', descripcion: 'Pago por Daviplata', icono: '🔵', orden: 5 }
        ];

        for (const metodo of metodosPago) {
            try {
                await databases.createDocument(DATABASE_ID, 'metodos_pago', ID.unique(), metodo);
                console.log(`${colors.green}  ✓ Método de pago: ${metodo.nombre}${colors.reset}`);
            } catch (error: any) {
                console.log(`  ⏭️  ${metodo.nombre} (ya existe)`);
            }
        }

        console.log(`\n${colors.green}✅ ¡Datos poblados!${colors.reset}\n`);

    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

main();
