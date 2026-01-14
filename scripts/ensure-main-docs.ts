
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m'
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const COLLECTIONS = {
    HERO: 'config_hero',
    BRANDING: 'config_branding',
    INFO: 'empresa_info'
};

async function main() {
    console.log(`${colors.blue}🕵️  Verificando documentos 'main'...${colors.reset}\n`);

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);

    // 1. INFO (Requires 'nombre')
    try {
        await databases.createDocument(DATABASE_ID, COLLECTIONS.INFO, 'main', {
            nombre: 'Mi Empresa Digital',
            contact_info: JSON.stringify({ email: 'contacto@ejemplo.com' })
        });
        console.log(`${colors.green}  ✓ Info 'main' creado.${colors.reset}`);
    } catch (e: any) {
        if (e.message?.includes('already exists')) console.log(`${colors.yellow}  ✓ Info ya existe.${colors.reset}`);
        else console.log(`${colors.yellow}  ⚠️ Error Info: ${e.message}${colors.reset}`);
    }

    // 2. HERO
    try {
        await databases.createDocument(DATABASE_ID, COLLECTIONS.HERO, 'main', {
            titulo: 'Bienvenido a tu Sitio',
            descripcion: 'Configura este mensaje en el panel de admin.',
            layout_mode: 'center'
        });
        console.log(`${colors.green}  ✓ Hero 'main' creado.${colors.reset}`);
    } catch (e: any) {
        if (e.message?.includes('already exists')) console.log(`${colors.yellow}  ✓ Hero ya existe.${colors.reset}`);
        else console.log(`${colors.yellow}  ⚠️ Error Hero: ${e.message}${colors.reset}`);
    }

    // 3. BRANDING
    try {
        await databases.createDocument(DATABASE_ID, COLLECTIONS.BRANDING, 'main', {
            primary_color: '#000000',
            secondary_color: '#ffffff',
            radius_global: '0.5rem'
        });
        console.log(`${colors.green}  ✓ Branding 'main' creado.${colors.reset}`);
    } catch (e: any) {
        if (e.message?.includes('already exists')) console.log(`${colors.yellow}  ✓ Branding ya existe.${colors.reset}`);
        else console.log(`${colors.yellow}  ⚠️ Error Branding: ${e.message}${colors.reset}`);
    }

    console.log(`\n${colors.green}✅ Verificación terminada.${colors.reset}\n`);
}

main();
