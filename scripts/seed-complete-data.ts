/**
 * Script para poblar datos de prueba completos para DieselParts
 * USO: npx tsx scripts/seed-complete-data.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases, ID } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

async function main() {
    console.log(`${colors.cyan}
╔══════════════════════════════════════════╗
║   🌱 Datos de Prueba DieselParts          ║
╚══════════════════════════════════════════╝
  ${colors.reset}\n`);

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
        // SERVICIOS
        console.log(`${colors.blue}🔧 Creando servicios...${colors.reset}`);
        const servicios = [
            {
                nombre: 'Venta de Filtros Diesel',
                descripcion: 'Amplio catálogo de filtros de aceite, combustible y aire para todo tipo de motores diesel. Marcas originales y alternativas de calidad.',
                categoria: 'Filtros',
                precio: 45000,
                unidadPrecio: 'servicio',
                duracionEstimada: 30,
                requierePersonal: 1,
                activo: true,
                destacado: true
            },
            {
                nombre: 'Reparación de Bombas de Inyección',
                descripcion: 'Servicio especializado de reparación y mantenimiento de bombas de inyección diesel. Incluye diagnóstico, reparación y prueba en banco.',
                categoria: 'Bombas de Inyección',
                precio: 850000,
                unidadPrecio: 'servicio',
                duracionEstimada: 480,
                requierePersonal: 2,
                activo: true,
                destacado: true
            },
            {
                nombre: 'Venta e Instalación de Turbocompresores',
                descripcion: 'Turbocompresores nuevos y remanufacturados. Instalación profesional incluida. Garantía extendida disponible.',
                categoria: 'Turbocompresores',
                precio: 3200000,
                unidadPrecio: 'servicio',
                duracionEstimada: 360,
                requierePersonal: 2,
                activo: true,
                destacado: true
            },
            {
                nombre: 'Venta de Repuestos Cummins',
                descripcion: 'Repuestos originales y genéricos para motores Cummins. Kits completos de mantenimiento disponibles.',
                categoria: 'Piezas de Motor',
                precio: 250000,
                unidadPrecio: 'servicio',
                duracionEstimada: 60,
                requierePersonal: 1,
                activo: true,
                destacado: false
            },
            {
                nombre: 'Mantenimiento Preventivo Diesel',
                descripcion: 'Servicio completo de mantenimiento preventivo: cambio de filtros, revisión de inyectores, ajustes y diagnóstico completo.',
                categoria: 'Mantenimiento',
                precio: 450000,
                unidadPrecio: 'servicio',
                duracionEstimada: 240,
                requierePersonal: 2,
                activo: true,
                destacado: false
            }
        ];

        for (const servicio of servicios) {
            try {
                await databases.createDocument(DATABASE_ID, 'servicios', ID.unique(), servicio);
                console.log(`${colors.green}  ✓ ${servicio.nombre}${colors.reset}`);
            } catch (error: any) {
                if (!error.message.includes('already exists')) {
                    console.log(`  ⏭️  ${servicio.nombre} (ya existe o error)`);
                }
            }
        }

        // EMPLEADOS DESTACADOS
        console.log(`\n${colors.blue}👥 Creando empleados destacados...${colors.reset}`);
        const empleados = [
            {
                nombre: 'Carlos',
                apellido: 'Rodríguez',
                telefono: '+57 300 123 4567',
                email: 'carlos.rodriguez@dieselparts.com',
                fechaNacimiento: '1985-03-15',
                fechaContratacion: '2018-06-01',
                cargo: 'especialista',
                especialidades: ['Bombas de Inyección', 'Diagnóstico Diesel'],
                tarifaPorHora: 45000,
                modalidadPago: 'fijo_mensual',
                activo: true
            },
            {
                nombre: 'María',
                apellido: 'Silva',
                telefono: '+57 301 234 5678',
                email: 'maria.silva@dieselparts.com',
                fechaNacimiento: '1990-08-22',
                fechaContratacion: '2019-03-15',
                cargo: 'especialista',
                especialidades: ['Turbocompresores', 'Motores Cummins'],
                tarifaPorHora: 50000,
                modalidadPago: 'fijo_mensual',
                activo: true
            },
            {
                nombre: 'Jorge',
                apellido: 'Mendoza',
                telefono: '+57 302 345 6789',
                email: 'jorge.mendoza@dieselparts.com',
                fechaNacimiento: '1988-11-10',
                fechaContratacion: '2020-01-20',
                cargo: 'supervisor',
                especialidades: ['Gestión de Inventario', 'Ventas Técnicas'],
                tarifaPorHora: 40000,
                modalidadPago: 'fijo_mensual',
                activo: true
            }
        ];

        for (const empleado of empleados) {
            try {
                await databases.createDocument(DATABASE_ID, 'empleados', ID.unique(), empleado);
                console.log(`${colors.green}  ✓ ${empleado.nombre} ${empleado.apellido}${colors.reset}`);
            } catch (error: any) {
                console.log(`  ⏭️  ${empleado.nombre} (ya existe o error)`);
            }
        }

        // CLIENTES DE EJEMPLO
        console.log(`\n${colors.blue}🏢 Creando clientes de ejemplo...${colors.reset}`);
        const clientes = [
            {
                nombre: 'Transportes del Valle',
                telefono: '+57 320 111 2222',
                email: 'compras@transportesvalle.com',
                tipo: 'empresa',
                activo: true
            },
            {
                nombre: 'Maquinaria Pesada S.A.S',
                telefono: '+57 321 222 3333',
                email: 'ventas@maquinariapesada.com',
                tipo: 'empresa',
                activo: true
            }
        ];

        for (const cliente of clientes) {
            try {
                await databases.createDocument(DATABASE_ID, 'clientes', ID.unique(), cliente);
                console.log(`${colors.green}  ✓ ${cliente.nombre}${colors.reset}`);
            } catch (error: any) {
                console.log(`  ⏭️  ${cliente.nombre} (ya existe)`);
            }
        }

        console.log(`\n${colors.green}✅ ¡Datos de prueba creados!${colors.reset}\n`);

    } catch (error: any) {
        console.error(`Error: ${error.message}`);
    }
}

main();
