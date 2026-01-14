/**
 * Script para completar datos faltantes (solo productos y proveedores)
 * USO: npx tsx scripts/complete-seed.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases, ID } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

async function main() {
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
        console.log(`${colors.blue}📦 Creando productos...${colors.reset}`);

        const productos = [
            {
                nombre: 'Filtro de Aceite Cat 1R-0750',
                descripcion: 'Filtro de aceite de alta eficiencia para motores Caterpillar',
                categoria: 'Filtros',
                precio: 45000,
                stock: 50
            },
            {
                nombre: 'Bomba de Inyección Bosch CP3',
                descripcion: 'Bomba de inyección common rail Bosch CP3',
                categoria: 'Bombas de Inyección',
                precio: 3500000,
                stock: 8
            },
            {
                nombre: 'Turbocompresor Garrett GT2556V',
                descripcion: 'Turbocompresor de geometría variable',
                categoria: 'Turbocompresores',
                precio: 2800000,
                stock: 5
            },
            {
                nombre: 'Kit de Anillos Cummins ISX',
                descripcion: 'Juego completo de anillos para motor Cummins ISX',
                categoria: 'Piezas de Motor',
                precio: 850000,
                stock: 12
            }
        ];

        for (const prod of productos) {
            try {
                await databases.createDocument(DATABASE_ID, 'productos', ID.unique(), prod);
                console.log(`${colors.green}  ✓ ${prod.nombre}${colors.reset}`);
            } catch (error: any) {
                console.log(`  ⏭️  ${prod.nombre} (error o ya existe)`);
            }
        }

        console.log(`\n${colors.blue}🏭 Creando proveedor...${colors.reset}`);
        try {
            await databases.createDocument(DATABASE_ID, 'proveedores', ID.unique(), {
                nombre: 'Diesel Import Colombia',
                telefono: '+57 1 234 5678',
                email: 'ventas@dieselimport.com.co'
            });
            console.log(`${colors.green}✅ Proveedor creado${colors.reset}\n`);
        } catch (error: any) {
            console.log(`⏭️  Proveedor (error o ya existe)\n`);
        }

        console.log(`${colors.green}🎉 ¡Completado!${colors.reset}\n`);

    } catch (error: any) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    }
}

main();
