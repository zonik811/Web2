
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m'
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const OLD_COLLECTION_ID = 'empresa_config';

// New Collection IDs
const COLS = {
    HERO: 'config_hero',
    BRANDING: 'config_branding',
    STYLES: 'component_styles',
    INFO: 'empresa_info',
    SECTIONS: 'config_sections'
};

async function main() {
    console.log(`${colors.cyan}
╔══════════════════════════════════════════╗
║   🏗️  Migración a Arquitectura Modular    ║
╚══════════════════════════════════════════╝
  ${colors.reset}\n`);

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);

    // Helper to create collection and attributes
    async function initCollection(id: string, name: string, attributes: any[]) {
        console.log(`${colors.blue}📂 Verificando colección: ${name} (${id})...${colors.reset}`);

        try {
            await databases.getCollection(DATABASE_ID, id);
            console.log(`  ✓ Colección ya existe.`);
        } catch (e) {
            console.log(`  Creation colección...`);
            await databases.createCollection(DATABASE_ID, id, name, [
                Permission.read(Role.any()),
                Permission.write(Role.users()) // or specific roles
            ]);
            console.log(`  ✓ Colección creada.`);
        }

        console.log(`  📝 Verificando atributos...`);
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DATABASE_ID, id, attr.key, attr.size, attr.required, attr.default);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(DATABASE_ID, id, attr.key, attr.required, attr.default);
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(DATABASE_ID, id, attr.key, attr.required, attr.min, attr.max, attr.default);
                }
                process.stdout.write('.');
            } catch (e: any) {
                if (!e.message?.includes('already exists')) {
                    console.log(`\n  ❌ Error attr ${attr.key}: ${e.message}`);
                }
            }
            await new Promise(r => setTimeout(r, 200)); // Rate limit buffer
        }

        // Wait for attributes to be active
        console.log(`  ⏳ Esperando propagación de atributos...`);
        for (const attr of attributes) {
            let ready = false;
            let retries = 0;
            while (!ready && retries < 10) {
                try {
                    await databases.getAttribute(DATABASE_ID, id, attr.key);
                    ready = true;
                } catch (e) {
                    await new Promise(r => setTimeout(r, 1000));
                    retries++;
                }
            }
            if (!ready) console.log(`    ⚠️ Warning: Atributo ${attr.key} podría no estar listo.`);
        }
        console.log(`\n  ✓ Atributos listos.\n`);
    }

    try {
        // 1. Define Schemas

        // --- HERO CONFIG ---
        await initCollection(COLS.HERO, 'Configuración Hero', [
            { key: 'titulo', type: 'string', size: 255, required: false },
            { key: 'descripcion', type: 'string', size: 1000, required: false },
            { key: 'badge_text', type: 'string', size: 100, required: false },
            { key: 'badge_style', type: 'string', size: 50, required: false, default: 'solid' }, // solid, outline...
            { key: 'imagen_fondo', type: 'string', size: 5000, required: false }, // URL
            { key: 'overlay_type', type: 'string', size: 50, required: false, default: 'none' },
            { key: 'layout_mode', type: 'string', size: 50, required: false, default: 'center' },
            { key: 'cta_primary', type: 'string', size: 1000, required: false }, // JSON: {text, url}
            { key: 'cta_secondary', type: 'string', size: 1000, required: false }, // JSON
            { key: 'cta_discount', type: 'string', size: 1000, required: false } // JSON
        ]);

        // --- BRANDING CONFIG ---
        await initCollection(COLS.BRANDING, 'Configuración Branding', [
            { key: 'primary_color', type: 'string', size: 20, required: false, default: '#000000' },
            { key: 'secondary_color', type: 'string', size: 20, required: false },
            { key: 'font_heading', type: 'string', size: 50, required: false, default: 'sans' },
            { key: 'font_body', type: 'string', size: 50, required: false, default: 'sans' },
            { key: 'button_style_id', type: 'string', size: 50, required: false }, // ID from ComponentStyles
            { key: 'button_anim_id', type: 'string', size: 50, required: false },
            { key: 'radius_global', type: 'string', size: 20, required: false, default: '0.5rem' }
        ]);

        // --- COMPONENT STYLES (The Registry) ---
        await initCollection(COLS.STYLES, 'Estilos de Componentes', [
            { key: 'name', type: 'string', size: 100, required: true },
            { key: 'type', type: 'string', size: 50, required: true }, // button, badge, card
            { key: 'css_classes', type: 'string', size: 5000, required: true },
            { key: 'preview_markup', type: 'string', size: 5000, required: false },
            { key: 'is_active', type: 'boolean', required: false, default: true }
        ]);

        // --- SECTIONS ---
        await initCollection(COLS.SECTIONS, 'Configuración Secciones', [
            { key: 'layout_order', type: 'string', size: 5000, required: false }, // JSON Array
            { key: 'visibility', type: 'string', size: 5000, required: false } // JSON Object
        ]);

        // --- INFO (Basic) ---
        await initCollection(COLS.INFO, 'Información Empresa', [
            { key: 'nombre', type: 'string', size: 255, required: true },
            { key: 'descripcion_corta', type: 'string', size: 1000, required: false },
            { key: 'contact_info', type: 'string', size: 5000, required: false }, // JSON {email, phone...}
            { key: 'social_links', type: 'string', size: 5000, required: false }, // JSON
            { key: 'logo_url', type: 'string', size: 5000, required: false }
        ]);

        // 2. Migrate Data
        console.log(`\n${colors.yellow}📦 Migrando datos existentes...${colors.reset}`);

        let oldDoc;
        try {
            oldDoc = await databases.getDocument(DATABASE_ID, OLD_COLLECTION_ID, 'main');
        } catch (e) { console.log("  No se encontró doc 'main' viejo, omitiendo migración de datos."); }

        if (oldDoc) {
            console.log("  Lectura de 'main' vieja exitosa. Distribuyendo...");

            // HERO
            try {
                await databases.createDocument(DATABASE_ID, COLS.HERO, 'main', {
                    titulo: oldDoc.heroTitulo || oldDoc.slogan,
                    descripcion: oldDoc.heroDescripcion || oldDoc.descripcion,
                    badge_text: oldDoc.heroBadge,
                    badge_style: oldDoc.heroBadgeStyle || 'solid', // Assumption, fix logic if stored in json
                    imagen_fondo: oldDoc.heroImagen,
                    // Parse from branding_styles JSON if available
                    overlay_type: parseJson(oldDoc.branding_styles)?.heroOverlay || 'none',
                    layout_mode: parseJson(oldDoc.branding_styles)?.heroLayout || 'center',
                    cta_primary: JSON.stringify({ text: oldDoc.ctaPrimario, url: '/agendar' }),
                    cta_secondary: JSON.stringify({ text: oldDoc.ctaSecundario, url: '/#servicios' }),
                    cta_discount: JSON.stringify({ text: oldDoc.ctaDescuento, icon: oldDoc.ctaDescuentoIcono })
                });
                console.log(`  ✓ Hero migrado.`);
            } catch (e: any) {
                if (e.message.includes('already exists')) {
                    // Try update
                    console.log(`  Refrescando Hero main...`);
                    await databases.updateDocument(DATABASE_ID, COLS.HERO, 'main', { /* update payload same as above if needed */ });
                } else console.log(`  Error Hero: ${e.message}`);
            }

            // BRANDING
            try {
                const styles = parseJson(oldDoc.branding_styles);
                await databases.createDocument(DATABASE_ID, COLS.BRANDING, 'main', {
                    primary_color: oldDoc.colorPrimario,
                    secondary_color: oldDoc.colorSecundario,
                    font_heading: styles?.fontStyle || 'sans',
                    button_style_id: styles?.buttonStyle || 'modern', // Initially storing string ID, will link to ComponentStyles later
                    button_anim_id: styles?.buttonAnimation || 'none'
                });
                console.log(`  ✓ Branding migrado.`);
            } catch (e: any) {
                if (e.message.includes('already exists')) console.log(`  Branding main ya existe.`);
                else console.log(`  Error Branding: ${e.message}`);
            }

            // INFO
            try {
                await databases.createDocument(DATABASE_ID, COLS.INFO, 'main', {
                    nombre: oldDoc.nombre,
                    descripcion_corta: oldDoc.descripcion,
                    contact_info: JSON.stringify({
                        email: oldDoc.email,
                        telefono: oldDoc.telefono,
                        whatsapp: oldDoc.whatsapp,
                        direccion: oldDoc.direccion
                    }),
                    logo_url: oldDoc.logo
                });
                console.log(`  ✓ Info migrada.`);
            } catch (e: any) {
                if (e.message.includes('already exists')) console.log(`  Info main ya existe.`);
                else console.log(`  Error Info: ${e.message}`);
            }
        }

        // 3. Seed Component Styles (Dynamic Registry)
        console.log(`\n${colors.cyan}🌱 Sembrando Estilos Base...${colors.reset}`);

        const SEED_STYLES = [
            // Buttons
            { name: 'modern', type: 'button', classes: 'relative overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg active:scale-95' },
            { name: 'neobrutalism', type: 'button', classes: 'border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none' },
            { name: 'glass', type: 'button', classes: 'backdrop-blur-md bg-white/10 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/20' },
            { name: 'cyber', type: 'button', classes: 'border border-cyan-500 text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(6,182,212,0.7)] uppercase tracking-widest font-mono' },
            // Badges
            { name: 'solid', type: 'badge', classes: 'bg-primary text-primary-foreground border-transparent shadow hover:bg-primary/80' },
            { name: 'outline', type: 'badge', classes: 'text-foreground border border-input hover:bg-accent hover:text-accent-foreground' },
            { name: 'glow', type: 'badge', classes: 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)]' }
        ];

        for (const style of SEED_STYLES) {
            const docId = `style_${style.name}_${style.type}`;
            try {
                // Check exist first to key by specific ID
                await databases.createDocument(DATABASE_ID, COLS.STYLES, docId, {
                    name: style.name,
                    type: style.type,
                    css_classes: style.classes,
                    is_active: true
                });
                console.log(`  + Estilo creado: ${style.name} (${style.type})`);
            } catch (e: any) {
                // console.log(`  . Estilo ya existe: ${style.name}`);
            }
        }

        console.log(`\n${colors.green}✅ ¡Migración Completa!${colors.reset}`);

    } catch (error: any) {
        console.error(`\n${colors.red}❌ Error Fatal: ${error.message}${colors.reset}`);
    }
}

function parseJson(str: string) {
    try { return JSON.parse(str); } catch { return {}; }
}

main();
