
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases, ID } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'empresa_config';

async function main() {
    console.log(`${colors.cyan}
╔══════════════════════════════════════════╗
║   🧹 Optimizar Esquema (Schema Cleanup)   ║
╚══════════════════════════════════════════╝
  ${colors.reset}\n`);

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);

    try {
        // 1. Ensure JSON columns exist
        const jsonAttributes = ['config_stats', 'config_cta_final', 'config_horarios', 'config_seo', 'config_landing', 'config_branding'];
        console.log(`${colors.blue}📝 Verificando columnas JSON...${colors.reset}`);

        for (const attr of jsonAttributes) {
            try {
                await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr, 5000, false);
                console.log(`${colors.green}  ✓ ${attr} creado.${colors.reset}`);
                await new Promise(r => setTimeout(r, 1000)); // Wait for propagation
            } catch (e: any) {
                if (e.message?.includes('already exists')) {
                    // console.log(`${colors.yellow}  • ${attr} ya existe.${colors.reset}`);
                } else if (e.message?.includes('limit')) {
                    console.log(`${colors.red}  ⚠️ Límite alcanzado al intentar crear ${attr}. Intentando migración parcial...${colors.reset}`);
                } else {
                    console.error(`${colors.red}Error ${attr}: ${e.message}${colors.reset}`);
                }
            }
        }

        // 2. Migrate Data
        console.log(`\n${colors.blue}📦 Migrando datos a JSON...${colors.reset}`);
        let doc;
        try {
            doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, 'main');
        } catch (e) {
            console.log(`${colors.yellow}  ℹ️ No se encontró documento 'main'. Creándolo después...${colors.reset}`);
        }

        if (doc) {
            const updates: any = {};

            // Stats
            if (!doc.config_stats && (doc.statClientes || doc.statServicios)) {
                updates.config_stats = JSON.stringify({
                    clientes: doc.statClientes,
                    servicios: doc.statServicios,
                    profesionales: doc.statProfesionales,
                    satisfaccion: doc.statSatisfaccion
                });
                console.log(`  ✓ Preparando migración Stats`);
            }

            // CTA Final
            if (!doc.config_cta_final && (doc.ctaFinalTitulo || doc.ctaFinalBoton)) {
                updates.config_cta_final = JSON.stringify({
                    titulo: doc.ctaFinalTitulo,
                    subtitulo: doc.ctaFinalSubtitulo,
                    boton: doc.ctaFinalBoton,
                    imagen: doc.ctaFinalImagen
                });
                console.log(`  ✓ Preparando migración CTA Final`);
            }

            // SEO
            if (!doc.config_seo && (doc.metaDescripcion || doc.keywords)) {
                updates.config_seo = JSON.stringify({
                    metaDescripcion: doc.metaDescripcion,
                    keywords: doc.keywords
                });
                console.log(`  ✓ Preparando migración SEO`);
            }

            // Horarios
            if (!doc.config_horarios && (doc.horarioDias || doc.horarioHoras)) {
                updates.config_horarios = JSON.stringify({
                    dias: doc.horarioDias,
                    horas: doc.horarioHoras,
                    es247: doc.disponibilidad247
                });
                console.log(`  ✓ Preparando migración Horarios`);
            }

            if (Object.keys(updates).length > 0) {
                await databases.updateDocument(DATABASE_ID, COLLECTION_ID, 'main', updates);
                console.log(`${colors.green}  💾 Datos migrados guardados en 'main'.${colors.reset}`);
            } else {
                console.log(`${colors.green}  ✓ Datos ya migrados o no necesarios.${colors.reset}`);
            }
        }

        // 3. Delete Redundant Attributes
        console.log(`\n${colors.blue}🗑️ Eliminando columnas redundantes (Liberando espacio)...${colors.reset}`);
        const toDelete = [
            'statClientes', 'statServicios', 'statProfesionales', 'statSatisfaccion',
            'ctaFinalTitulo', 'ctaFinalSubtitulo', 'ctaFinalBoton', 'ctaFinalImagen',
            'metaDescripcion', 'keywords',
            'horarioDias', 'horarioHoras', 'disponibilidad247',
            'branding_colors' // If we decide to put this in branding_styles or config_branding
        ];

        for (const attr of toDelete) {
            try {
                await databases.deleteAttribute(DATABASE_ID, COLLECTION_ID, attr);
                console.log(`${colors.yellow}  - ${attr} eliminado.${colors.reset}`);
                await new Promise(r => setTimeout(r, 500));
            } catch (e: any) {
                // Ignore if not found
            }
        }

        console.log(`\n⏳ Esperando propagación (5s)...`);
        await new Promise(r => setTimeout(r, 5000));

        // 4. Create New Attributes
        console.log(`\n${colors.blue}🆕 Creando atributos faltantes...${colors.reset}`);

        const newAttrs = [
            { key: 'branding_styles', size: 5000 },
            { key: 'heroImagen', size: 5000 }, // Retry this one
            { key: 'heroTitulo', size: 255 },
            { key: 'heroDescripcion', size: 1000 }
        ];

        for (const attr of newAttrs) {
            try {
                await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.size, false);
                console.log(`${colors.green}  ✓ ${attr.key} creado exitosamente.${colors.reset}`);
            } catch (e: any) {
                if (e.message?.includes('already exists')) {
                    console.log(`${colors.green}  ✓ ${attr.key} ya existe.${colors.reset}`);
                } else {
                    console.error(`${colors.red}  ❌ Error ${attr.key}: ${e.message}${colors.reset}`);
                }
            }
        }

        console.log(`\n${colors.green}✅ ¡Optimización Finalizada!${colors.reset}\n`);

    } catch (error: any) {
        console.error(`\n${colors.red}❌ Error Fatal: ${error.message}${colors.reset}`);
    }
}

main();
