/**
 * 🌱 Script de Población de Datos Iniciales
 * 
 * Este script puebla la base de datos con datos de ejemplo
 * para una empresa de repuestos de maquinaria diesel.
 * 
 * IMPORTANTE: Espera 30-60 segundos después de crear las colecciones
 * antes de ejecutar este script, para que Appwrite procese los atributos.
 * 
 * USO: npx tsx scripts/seed-data.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases, ID } from 'node-appwrite';

// Cargar variables de .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

async function main() {
    console.log(`${colors.cyan}
╔══════════════════════════════════════════╗
║   🌱 Población de Datos Iniciales         ║
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
        console.log(`${colors.blue}📝 Creando configuración de empresa...${colors.reset}`);

        // 1. EMPRESA CONFIG - Solo campos requeridos
        const empresaConfig = await databases.createDocument(
            DATABASE_ID,
            'empresa_config',
            'main',
            {
                nombre: 'DieselParts',
                telefono: '+57 3223238781',
                email: 'contacto@dieselparts.com.co',
                nombreCompleto: 'DieselParts S.A.S',
                slogan: 'Tu Socio en Repuestos Diesel',
                direccion: 'Calle 100 #45-23',
                ciudad: 'Bogotá',
                pais: 'Colombia',
                colorPrimario: '#1E40AF',
                colorSecundario: '#F59E0B',
                whatsapp: '+573223238781'
            }
        );
        console.log(`${colors.green}✅ Configuración creada${colors.reset}\n`);

        // 2. CATEGORÍAS
        console.log(`${colors.blue}📂 Categorías...${colors.reset}`);
        const categorias = [
            { nombre: 'Filtros', slug: 'filtros', tipo: 'producto' },
            { nombre: 'Bombas de Inyección', slug: 'bombas-inyeccion', tipo: 'producto' },
            { nombre: 'Turbocompresores', slug: 'turbocompresores', tipo: 'producto' },
            { nombre: 'Piezas de Motor', slug: 'piezas-motor', tipo: 'producto' },
            { nombre: 'Mantenimiento', slug: 'mantenimiento', tipo: 'servicio' }
        ];

        for (const cat of categorias) {
            await databases.createDocument(DATABASE_ID, 'categorias', ID.unique(), cat);
            console.log(`${colors.green}  ✓ ${cat.nombre}${colors.reset}`);
        }

        // 3. MÉTODOS DE PAGO
        console.log(`\n${colors.blue}💳 Métodos de pago...${colors.reset}`);
        const metodos = [
            { nombre: 'Efectivo', codigo: 'efectivo' },
            { nombre: 'Transferencia', codigo: 'transferencia' },
            { nombre: 'Nequi', codigo: 'nequi' },
            { nombre: 'Crédito 30 días', codigo: 'credito_30' }
        ];

        for (const metodo of metodos) {
            await databases.createDocument(DATABASE_ID, 'metodos_pago', ID.unique(), metodo);
            console.log(`${colors.green}  ✓ ${metodo.nombre}${colors.reset}`);
        }

        // 4. ESTADOS
        console.log(`\n${colors.blue}🎯 Estados...${colors.reset}`);
        const estados = [
            { nombre: 'Pendiente', codigo: 'pendiente', tipo: 'orden' },
            { nombre: 'Confirmada', codigo: 'confirmada', tipo: 'orden' },
            { nombre: 'Entregada', codigo: 'entregada', tipo: 'orden' },
            { nombre: 'Cancelada', codigo: 'cancelada', tipo: 'orden' }
        ];

        for (const estado of estados) {
            await databases.createDocument(DATABASE_ID, 'estados', ID.unique(), estado);
            console.log(`${colors.green}  ✓ ${estado.nombre}${colors.reset}`);
        }

        // 5. PRODUCTOS
        console.log(`\n${colors.blue}📦 Productos...${colors.reset}`);
        const productos = [
            {
                nombre: 'Filtro de Aceite Cat 1R-0750',
                descripcion: 'Filtro de aceite de alta eficiencia para motores Caterpillar. Compatible con serie 3400, C7, C9, C13 y C15.',
                categoria: 'Filtros',
                precio: 45000,
                stock: 50,
                sku: 'CAT-1R0750'
            },
            {
                nombre: 'Bomba de Inyección Bosch CP3',
                descripcion: 'Bomba de inyección common rail Bosch CP3. Remanufacturada y garantizada.',
                categoria: 'Bombas de Inyección',
                precio: 3500000,
                stock: 8,
                sku: 'BOSCH-CP3'
            },
            {
                nombre: 'Turbocompresor Garrett GT2556V',
                descripcion: 'Turbocompresor de geometría variable. Incluye actuador electrónico.',
                categoria: 'Turbocompresores',
                precio: 2800000,
                stock: 5,
                sku: 'GARRETT-GT2556V'
            },
            {
                nombre: 'Kit de Anillos Cummins ISX',
                descripcion: 'Juego completo de anillos para motor Cummins ISX. Medida estándar.',
                categoria: 'Piezas de Motor',
                precio: 850000,
                stock: 12,
                sku: 'CUM-ISX-RINGS'
            }
        ];

        for (const prod of productos) {
            await databases.createDocument(DATABASE_ID, 'productos', ID.unique(), prod);
            console.log(`${colors.green}  ✓ ${prod.nombre}${colors.reset}`);
        }

        // 6. PROVEEDOR
        console.log(`\n${colors.blue}🏭 Proveedor...${colors.reset}`);
        await databases.createDocument(DATABASE_ID, 'proveedores', ID.unique(), {
            nombre: 'Diesel Import Colombia',
            telefono: '+57 1 234 5678',
            email: 'ventas@dieselimport.com.co',
            nit: '900123456-7'
        });
        console.log(`${colors.green}✅ Proveedor creado${colors.reset}\n`);

        console.log(`\n${colors.green}🎉 ¡Datos iniciales creados exitosamente!${colors.reset}\n`);

    } catch (error: any) {
        console.error(`\n${colors.red}❌ Error: ${error.message}${colors.reset}`);
        console.error(`\n${colors.yellow}💡 Tip: Si el error dice "Unknown attribute", espera 1-2 minutos`);
        console.error(`   y vuelve a ejecutar el script. Appwrite necesita tiempo`);
        console.error(`   para procesar los atributos de las colecciones.${colors.reset}\n`);
        process.exit(1);
    }
}

main();
