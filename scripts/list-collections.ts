import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

async function listAllCollections() {
    try {
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

        console.log('\n📊 LISTANDO TODAS LAS COLECCIONES (TABLAS)\n');
        console.log('='.repeat(80));

        const collections = await databases.listCollections(databaseId);

        console.log(`\n✅ Total de colecciones: ${collections.total}\n`);

        // Group collections by area
        const areas = {
            ventas: [] as any[],
            clientes: [] as any[],
            empleados: [] as any[],
            inventario: [] as any[],
            asistencia: [] as any[],
            otros: [] as any[]
        };

        for (const collection of collections.collections) {
            const name = collection.name.toLowerCase();

            if (name.includes('orden') || name.includes('venta') || name.includes('turno') || name.includes('caja')) {
                areas.ventas.push(collection);
            } else if (name.includes('cliente')) {
                areas.clientes.push(collection);
            } else if (name.includes('empleado') || name.includes('usuario')) {
                areas.empleados.push(collection);
            } else if (name.includes('producto') || name.includes('inventario') || name.includes('categoria')) {
                areas.inventario.push(collection);
            } else if (name.includes('asistencia') || name.includes('turno')) {
                areas.asistencia.push(collection);
            } else {
                areas.otros.push(collection);
            }
        }

        // Print by area
        Object.entries(areas).forEach(([area, cols]) => {
            if (cols.length > 0) {
                console.log(`\n📁 ${area.toUpperCase()}`);
                console.log('-'.repeat(80));
                cols.forEach((col: any) => {
                    console.log(`  • ${col.name} (${col.$id})`);
                    console.log(`    Atributos: ${col.attributes?.length || 0}`);
                });
            }
        });

        console.log('\n' + '='.repeat(80));
        console.log('\n📋 DETALLES DE CADA COLECCIÓN:\n');

        for (const collection of collections.collections) {
            console.log(`\n🗂️  ${collection.name} (${collection.$id})`);
            console.log('   Campos:');

            if (collection.attributes && collection.attributes.length > 0) {
                collection.attributes.forEach((attr: any) => {
                    const type = attr.type || 'unknown';
                    const required = attr.required ? '✓' : ' ';
                    const array = attr.array ? '[]' : '';
                    console.log(`     [${required}] ${attr.key}: ${type}${array}`);
                });
            } else {
                console.log('     (Sin atributos disponibles)');
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('\n💡 REPORTES SUGERIDOS POR ÁREA:\n');

        if (areas.ventas.length > 0) {
            console.log('📊 VENTAS:');
            console.log('  - Total ventas por período');
            console.log('  - Ventas por método de pago');
            console.log('  - Cierres de caja (arqueos)');
            console.log('  - Productos más vendidos\n');
        }

        if (areas.clientes.length > 0) {
            console.log('👥 CLIENTES:');
            console.log('  - Total clientes y crecimiento');
            console.log('  - Top clientes por compras');
            console.log('  - Distribución geográfica');
            console.log('  - Clientes activos vs inactivos\n');
        }

        if (areas.empleados.length > 0) {
            console.log('👔 EMPLEADOS:');
            console.log('  - Total empleados activos');
            console.log('  - Distribución por cargo');
            console.log('  - Nuevos ingresos');
            console.log('  - Rendimiento (si hay ventas)\n');
        }

        if (areas.inventario.length > 0) {
            console.log('📦 INVENTARIO:');
            console.log('  - Stock actual por categoría');
            console.log('  - Productos en stock crítico');
            console.log('  - Valor total del inventario');
            console.log('  - Movimientos de stock\n');
        }

        if (areas.asistencia.length > 0) {
            console.log('⏰ ASISTENCIA:');
            console.log('  - Asistencias del mes');
            console.log('  - Porcentaje de puntualidad');
            console.log('  - Empleados con más faltas');
            console.log('  - Horas trabajadas\n');
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

listAllCollections();
