/**
 * Script para poblar cargos y especialidades
 * USO: npx tsx scripts/seed-cargos-especialidades.ts
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
    console.log(`${colors.cyan}Poblando cargos y especialidades...${colors.reset}\n`);

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
        // Poblar cargos
        const cargos = [
            { nombre: 'Técnico', descripcion: 'Técnico especializado en reparación', orden: 1 },
            { nombre: 'Supervisor', descripcion: 'Supervisión de operaciones', orden: 2 },
            { nombre: 'Especialista', descripcion: 'Especialista en área específica', orden: 3 },
            { nombre: 'Vendedor', descripcion: 'Ventas y atención al cliente', orden: 4 }
        ];

        for (const cargo of cargos) {
            try {
                await databases.createDocument(DATABASE_ID, 'cargos', ID.unique(), cargo);
                console.log(`${colors.green}  ✓ Cargo: ${cargo.nombre}${colors.reset}`);
            } catch (error: any) {
                console.log(`  ⏭️  ${cargo.nombre} (ya existe)`);
            }
        }

        // Poblar especialidades
        const especialidades = [
            { nombre: 'Filtros Diesel', descripcion: 'Especialista en filtros', icono: '🔧', orden: 1 },
            { nombre: 'Bombas de Inyección', descripcion: 'Reparación de bombas', icono: '⚙️', orden: 2 },
            { nombre: 'Turbocompresores', descripcion: 'Instalación y reparación', icono: '🚀', orden: 3 },
            { nombre: 'Motores Cummins', descripcion: 'Especialista en Cummins', icono: '🔩', orden: 4 },
            { nombre: 'Diagnóstico Diesel', descripcion: 'Diagnóstico general', icono: '🔍', orden: 5 },
            { nombre: 'Ventas Técnicas', descripcion: 'Asesoría en repuestos', icono: '💼', orden: 6 }
        ];

        for (const esp of especialidades) {
            try {
                await databases.createDocument(DATABASE_ID, 'especialidades', ID.unique(), esp);
                console.log(`${colors.green}  ✓ Especialidad: ${esp.nombre}${colors.reset}`);
            } catch (error: any) {
                console.log(`  ⏭️  ${esp.nombre} (ya existe)`);
            }
        }

        console.log(`\n${colors.green}✅ ¡Datos poblados!${colors.reset}\n`);

    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

main();
