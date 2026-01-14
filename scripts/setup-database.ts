/**
 * 🚀 Script Maestro - Configuración Completa de Base de Datos
 * 
 * Este script ejecuta todos los módulos de colecciones en orden.
 * Cada colección se crea con TODOS sus atributos completos.
 * 
 * USO: npx tsx scripts/setup-database.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { Client, Databases } from 'node-appwrite';
import { createEmpresaConfig } from './collections/empresa-config';
import { createServicios } from './collections/servicios';
import { createEmpleados } from './collections/empleados';
import { createClientes } from './collections/clientes';
import { createCitas } from './collections/citas';
import { createGastos } from './collections/gastos';
import { createPagosEmpleados } from './collections/pagos-empleados';
import { createPagosClientes } from './collections/pagos-clientes';
import { createDirecciones } from './collections/direcciones';
import { createHistorialPuntos } from './collections/historial-puntos';
import { createProductos } from './collections/productos';
// Nuevas colecciones de inventario y catálogo
import { createCategorias } from './collections/categorias';
import { createMovimientosInventario } from './collections/movimientos-inventario';
import { createProveedores } from './collections/proveedores';
import { createOrdenes } from './collections/ordenes';
import { createCompras } from './collections/compras';
// Colecciones paramétricas y configuración
import { createMetodosPago } from './collections/metodos-pago';
import { createEstados } from './collections/estados';
import { createNotificaciones } from './collections/notificaciones';
import { createUserProfile } from './collections/user-profile';
import { createTiendaConfigCollection } from './collections/tienda-config';
import { createPedidosCatalogo } from './collections/pedidos-catalogo';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

interface Stats {
    created: string[];
    skipped: string[];
    failed: Array<{ name: string; error: string }>;
}

const stats: Stats = {
    created: [],
    skipped: [],
    failed: []
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
║   🚀 Configuración de Base de Datos       ║
╚══════════════════════════════════════════╝
  ${colors.reset}\n`);

    // Validar variables
    const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const API_KEY = process.env.APPWRITE_API_KEY;

    if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID || !API_KEY) {
        console.error(`${colors.red}❌ Faltan variables de entorno en .env.local${colors.reset}`);
        process.exit(1);
    }

    console.log(`${colors.green}✅ Variables de entorno validadas${colors.reset}\n`);

    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);

    // Verificar conexión
    console.log(`${colors.cyan}🔗 Verificando conexión...${colors.reset}`);
    try {
        await databases.get(DATABASE_ID);
        console.log(`${colors.green}✅ Conectado a Appwrite${colors.reset}\n`);
    } catch (error: any) {
        console.error(`${colors.red}❌ Error de conexión: ${error.message}${colors.reset}`);
        process.exit(1);
    }

    // Lista de colecciones en orden
    const collections = [
        // Configuración base
        { id: 'empresa_config', name: 'Empresa Config', fn: createEmpresaConfig },
        { id: 'user_profile', name: 'User Profile', fn: createUserProfile },

        // Paramétricas
        { id: 'categorias', name: 'Categorías', fn: createCategorias },
        { id: 'metodos_pago', name: 'Métodos de Pago', fn: createMetodosPago },
        { id: 'estados', name: 'Estados', fn: createEstados },
        { id: 'tienda_config', name: 'Configuración Tienda', fn: createTiendaConfigCollection },

        // Catálogo
        { id: 'servicios', name: 'Servicios', fn: createServicios },
        { id: 'productos', name: 'Productos', fn: createProductos },

        // Personas
        { id: 'empleados', name: 'Empleados', fn: createEmpleados },
        { id: 'clientes', name: 'Clientes', fn: createClientes },
        { id: 'proveedores', name: 'Proveedores', fn: createProveedores },

        // Operaciones
        { id: 'citas', name: 'Citas', fn: createCitas },
        { id: 'ordenes', name: 'Órdenes', fn: createOrdenes },
        { id: 'compras', name: 'Compras', fn: createCompras },
        { id: 'pedidos_catalogo', name: 'Pedidos del Catálogo', fn: createPedidosCatalogo },
        { id: 'movimientos_inventario', name: 'Movimientos Inventario', fn: createMovimientosInventario },

        // Finanzas
        { id: 'gastos', name: 'Gastos', fn: createGastos },
        { id: 'pagos_empleados', name: 'Pagos Empleados', fn: createPagosEmpleados },
        { id: 'pagos_clientes', name: 'Pagos Clientes', fn: createPagosClientes },

        // Complementarias
        { id: 'direcciones', name: 'Direcciones', fn: createDirecciones },
        { id: 'historial_puntos', name: 'Historial Puntos', fn: createHistorialPuntos },
        { id: 'notificaciones', name: 'Notificaciones', fn: createNotificaciones }
    ];

    console.log(`${colors.cyan}📦 Creando ${collections.length} colecciones...\n${colors.reset}`);

    for (const col of collections) {
        try {
            const exists = await collectionExists(databases, DATABASE_ID, col.id);

            if (exists) {
                console.log(`${colors.yellow}⏭️  ${col.name} ya existe, saltando...${colors.reset}\n`);
                stats.skipped.push(col.name);
                continue;
            }

            await col.fn(databases, DATABASE_ID);
            stats.created.push(col.name);
            console.log('');

        } catch (error: any) {
            console.error(`${colors.red}❌ Error en ${col.name}: ${error.message}${colors.reset}\n`);
            stats.failed.push({ name: col.name, error: error.message });
        }
    }

    // Resumen
    console.log(`\n${colors.cyan}
╔══════════════════════════════════════════╗
║           📊 RESUMEN FINAL                ║
╚══════════════════════════════════════════╝
  ${colors.reset}`);

    console.log(`${colors.green}✅ Creadas: ${stats.created.length}${colors.reset}`);
    stats.created.forEach(name => console.log(`   - ${name}`));

    if (stats.skipped.length > 0) {
        console.log(`\n${colors.yellow}⏭️  Saltadas: ${stats.skipped.length}${colors.reset}`);
        stats.skipped.forEach(name => console.log(`   - ${name}`));
    }

    if (stats.failed.length > 0) {
        console.log(`\n${colors.red}❌ Fallidas: ${stats.failed.length}${colors.reset}`);
        stats.failed.forEach(({ name, error }) => console.log(`   - ${name}: ${error}`));
    }

    if (stats.created.length > 0) {
        console.log(`\n${colors.green}🎉 ¡Base de datos configurada exitosamente!${colors.reset}`);
        console.log(`\n${colors.cyan}📝 Próximos pasos:${colors.reset}`);
        console.log('   1. Ve a Appwrite Console y crea el documento en "empresa_config":');
        console.log('      - Document ID: "main"');
        console.log('      - Llena los campos con tu información');
        console.log('   2. Actualiza src/lib/appwrite.ts si es necesario');
        console.log('   3. Ejecuta: npm run dev\n');
    }

    process.exit(stats.failed.length > 0 ? 1 : 0);
}

main();
