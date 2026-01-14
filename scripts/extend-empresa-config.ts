/**
 * Script para extender la colección empresa_config con campos adicionales
 * USO: npx tsx scripts/extend-empresa-config.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases } from 'node-appwrite';

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
║   🔧 Extender empresa_config              ║
╚══════════════════════════════════════════╝
  ${colors.reset}\n`);

    const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const API_KEY = process.env.APPWRITE_API_KEY!;

    if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID || !API_KEY) {
        console.error(`${colors.red}❌ Error: Faltan variables de entorno.${colors.reset}`);
        process.exit(1);
    }

    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);
    const collectionId = 'empresa_config';

    console.log(`📡 Conectando a Proyecto: ${PROJECT_ID}`);
    console.log(`💾 Database ID: ${DATABASE_ID}`);
    console.log(`📂 Collection ID: ${collectionId}`);

    const createAttribute = async (type: 'string' | 'integer' | 'boolean', key: string, size?: number, required: boolean = false) => {
        try {
            if (type === 'string') {
                await databases.createStringAttribute(DATABASE_ID, collectionId, key, size!, required);
            } else if (type === 'integer') {
                await databases.createIntegerAttribute(DATABASE_ID, collectionId, key, required);
            } else if (type === 'boolean') {
                await databases.createBooleanAttribute(DATABASE_ID, collectionId, key, required);
            }
            console.log(`${colors.green}  ✓ ${key} creado${colors.reset}`);
        } catch (error: any) {
            if (error.message && error.message.includes('already exists')) {
                console.log(`${colors.yellow}  ⚠️ ${key} ya existe (OK)${colors.reset}`);
            } else {
                console.error(`${colors.red}  ❌ Error creando ${key}: ${error.message}${colors.reset}`);
            }
        }
    };

    console.log(`\n${colors.blue}📝 Procesando atributos...${colors.reset}`);

    // Hero Section
    await createAttribute('string', 'heroBadge', 200);
    await createAttribute('string', 'heroImagen', 100);
    await createAttribute('string', 'ctaPrimario', 100);
    await createAttribute('string', 'ctaSecundario', 100);
    await createAttribute('string', 'ctaDescuento', 100);

    // Estadísticas
    await createAttribute('integer', 'statClientes');
    await createAttribute('integer', 'statServicios');
    await createAttribute('integer', 'statProfesionales');
    await createAttribute('string', 'statSatisfaccion', 20);

    // CTA Final
    await createAttribute('string', 'ctaFinalTitulo', 200);
    await createAttribute('string', 'ctaFinalSubtitulo', 500);
    await createAttribute('string', 'ctaFinalBoton', 100);

    // Horarios
    await createAttribute('string', 'horarioDias', 100);
    await createAttribute('string', 'horarioHoras', 100);
    await createAttribute('boolean', 'disponibilidad247');

    // SEO
    await createAttribute('string', 'metaDescripcion', 500);
    await createAttribute('string', 'keywords', 500);

    console.log(`\n${colors.blue}🚀 Agregando campos de Landing Dinámica...${colors.reset}`);

    // Campos grandes para JSONs
    await createAttribute('string', 'landing_equipo', 100000);
    await createAttribute('string', 'landing_testimonios', 100000);
    await createAttribute('string', 'landing_catalogo_ids', 10000);
    await createAttribute('string', 'branding_colors', 5000);
    await createAttribute('string', 'logo', 500);

    console.log(`\n${colors.green}✅ ¡Proceso verificado!${colors.reset}`);
    console.log(`${colors.yellow}⏳ Si se crearon nuevos atributos, espera 30-60 segundos antes de usarlos.${colors.reset}\n`);
}

main();
