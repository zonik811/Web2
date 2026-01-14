/**
 * Script para crear colecciones de cargos y especialidades
 * USO: npx tsx scripts/create-param-collections.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases, ID } from 'node-appwrite';
import { createCargos } from './collections/cargos';
import { createEspecialidades } from './collections/especialidades';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

async function main() {
    console.log(`${colors.cyan}Creando colecciones paramétricas...${colors.reset}\n`);

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
        // Crear colecciones
        await createCargos(databases, DATABASE_ID);
        await createEspecialidades(databases, DATABASE_ID);

        console.log(`\n${colors.green}✅ Colecciones creadas${colors.reset}`);
        console.log(`${colors.blue}Poblando datos iniciales...${colors.reset}\n`);

        // Poblar cargos
        const cargos = [
            { nombre: 'Técnico', descripcion: 'Técnico especializado en reparación', orden: 1, activo: true },
            { nombre: 'Supervisor', descripcion: 'Supervisión de operaciones', orden: 2, activo: true },
            { nombre: 'Especialista', descripcion: 'Especialista en área específica', orden: 3, activo: true },
            { nombre: 'Vendedor', descripcion: 'Ventas y atención al cliente', orden: 4, activo: true }
        ];

        for (const cargo of cargos) {
            await databases.createDocument(DATABASE_ID, 'cargos', ID.unique(), cargo);
            console.log(`${colors.green}  ✓ Cargo: ${cargo.nombre}${colors.reset}`);
        }

        // Poblar especialidades
        const especialidades = [
            { nombre: 'Filtros Diesel', descripcion: 'Especialista en filtros', icono: '🔧', orden: 1, activo: true },
            { nombre: 'Bombas de Inyección', descripcion: 'Reparación de bombas', icono: '⚙️', orden: 2, activo: true },
            { nombre: 'Turbocompresores', descripcion: 'Instalación y reparación', icono: '🚀', orden: 3, activo: true },
            { nombre: 'Motores Cummins', descripcion: 'Especialista en Cummins', icono: '🔩', orden: 4, activo: true },
            { nombre: 'Diagnóstico Diesel', descripcion: 'Diagnóstico general', icono: '🔍', orden: 5, activo: true },
            { nombre: 'Ventas Técnicas', descripcion: 'Asesoría en repuestos', icono: '💼', orden: 6, activo: true }
        ];

        for (const esp of especialidades) {
            await databases.createDocument(DATABASE_ID, 'especialidades', ID.unique(), esp);
            console.log(`${colors.green}  ✓ Especialidad: ${esp.nombre}${colors.reset}`);
        }

        console.log(`\n${colors.green}🎉 ¡Completado!${colors.reset}\n`);

    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

main();
