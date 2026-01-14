
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'empresa_config';
const DOC_ID = 'main';

// Mapping of old keys to new JSON groups
const MAPPING = {
    landing: ['heroBadge', 'heroImagen', 'ctaPrimario', 'ctaSecundario', 'ctaDescuento', 'landing_equipo', 'landing_testimonios', 'landing_catalogo_ids'],
    stats: ['statClientes', 'statServicios', 'statProfesionales', 'statSatisfaccion'],
    cta_final: ['ctaFinalTitulo', 'ctaFinalSubtitulo', 'ctaFinalBoton'],
    horarios: ['horarioDias', 'horarioHoras', 'disponibilidad247'],
    seo: ['metaDescripcion', 'keywords'],
    branding: ['branding_colors', 'logo', 'colorPrimario', 'colorSecundario']
};

async function main() {
    console.log(`${colors.magenta}
╔══════════════════════════════════════════╗
║   🔄 Migración: Consolidación de Schema   ║
╚══════════════════════════════════════════╝
${colors.reset}`);

    try {
        // 1. BACKUP DATA
        console.log(`${colors.blue}1. 📦 Leyendo configuración actual (Backup)...${colors.reset}`);
        let currentConfig: any = {};
        try {
            currentConfig = await databases.getDocument(DATABASE_ID, COLLECTION_ID, DOC_ID);
            console.log(`${colors.green}  ✓ Datos obtenidos (${Object.keys(currentConfig).length} campos)${colors.reset}`);
        } catch (e) {
            console.log(`${colors.yellow}  ⚠️ No se encontró documento 'main'. Se usará data vacía.${colors.reset}`);
        }

        // 2. DELETE OLD ATTRIBUTES (To free up space)
        console.log(`\n${colors.blue}2. 🗑️  Eliminando atributos obsoletos...${colors.reset}`);
        const attrsToDelete = [
            ...MAPPING.landing,
            ...MAPPING.stats,
            ...MAPPING.cta_final,
            ...MAPPING.horarios,
            ...MAPPING.seo,
            // 'branding_colors' we keep in branding group
        ];

        // Filter duplicates and system attrs
        const uniqueToDelete = [...new Set(attrsToDelete)].filter(k => !k.startsWith('$') && k !== 'colorPrimario' && k !== 'colorSecundario');
        // Note: Keep colorPrimario/Secundario flat for now to avoid breaking basic UI instantly, or migrate them?
        // Plan: Migrate everything visual to JSON `config_branding` but keep flat basics 'nombre', 'email', 'telefono'.

        // We will execute deletions in parallel
        for (const key of uniqueToDelete) {
            try {
                await databases.deleteAttribute(DATABASE_ID, COLLECTION_ID, key);
                console.log(`  ✓ Eliminado: ${key}`);
                await new Promise(r => setTimeout(r, 500)); // Small delay to avoid rate limits
            } catch (e: any) {
                console.log(`  ⚠️ Skipped ${key}: ${e.message}`);
            }
        }

        console.log(`${colors.yellow}  ⏳ Esperando 5 segundos para propagación de borrado...${colors.reset}`);
        await new Promise(r => setTimeout(r, 5000));

        // 3. CREATE NEW JSON ATTRIBUTES
        console.log(`\n${colors.blue}3. ✨ Creando nuevos atributos JSON...${colors.reset}`);
        const newAttrs = [
            { key: 'config_landing', size: 100000 }, // Hero, Team, Testimonials
            { key: 'config_stats', size: 5000 },
            { key: 'config_cta_final', size: 5000 },
            { key: 'config_horarios', size: 5000 },
            { key: 'config_seo', size: 5000 },
            { key: 'config_branding', size: 5000 } // Colors, logo
        ];

        for (const attr of newAttrs) {
            try {
                await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.size, false);
                console.log(`${colors.green}  ✓ Creado: ${attr.key}${colors.reset}`);
            } catch (e: any) {
                if (e.message.includes('already exists')) {
                    console.log(`  ⚠️ Ya existe: ${attr.key}`);
                } else {
                    console.error(`${colors.red}  ❌ Fail ${attr.key}: ${e.message}${colors.reset}`);
                }
            }
        }

        console.log(`${colors.yellow}  ⏳ Esperando 5 segundos para propagación de creación...${colors.reset}`);
        await new Promise(r => setTimeout(r, 5000));

        // 4. MIGRATE DATA
        console.log(`\n${colors.blue}4. 💾 Restaurando datos en nuevo formato...${colors.reset}`);

        const landingData = {
            heroBadge: currentConfig.heroBadge,
            heroImagen: currentConfig.heroImagen,
            ctaPrimario: currentConfig.ctaPrimario,
            ctaSecundario: currentConfig.ctaSecundario,
            ctaDescuento: currentConfig.ctaDescuento,
            landing_equipo: currentConfig.landing_equipo,
            landing_testimonios: currentConfig.landing_testimonios,
            landing_catalogo_ids: currentConfig.landing_catalogo_ids
        };

        const statsData = {
            clientes: currentConfig.statClientes,
            servicios: currentConfig.statServicios,
            profesionales: currentConfig.statProfesionales,
            satisfaccion: currentConfig.statSatisfaccion
        };

        const ctaFinalData = {
            titulo: currentConfig.ctaFinalTitulo,
            subtitulo: currentConfig.ctaFinalSubtitulo,
            boton: currentConfig.ctaFinalBoton
        };

        const horariosData = {
            dias: currentConfig.horarioDias,
            horas: currentConfig.horarioHoras,
            es247: currentConfig.disponibilidad247
        };

        const seoData = {
            metaDescripcion: currentConfig.metaDescripcion,
            keywords: currentConfig.keywords
        };

        const brandingData = {
            colors: currentConfig.branding_colors, // Could be JSON inside string
            logo: currentConfig.logo,
            primary: currentConfig.colorPrimario,
            secondary: currentConfig.colorSecundario
        };

        // Update Document
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID, DOC_ID, {
                config_landing: JSON.stringify(landingData),
                config_stats: JSON.stringify(statsData),
                config_cta_final: JSON.stringify(ctaFinalData),
                config_horarios: JSON.stringify(horariosData),
                config_seo: JSON.stringify(seoData),
                config_branding: JSON.stringify(brandingData)
            });
            console.log(`${colors.green}✅ Datos migrados y guardados exitosamente.${colors.reset}`);
        } catch (e: any) {
            console.error(`${colors.red}❌ Error guardando datos migrados: ${e.message}${colors.reset}`);
        }

    } catch (error: any) {
        console.error(`\n${colors.red}❌ Fatal Error: ${error.message}${colors.reset}`);
    }
}

main();
