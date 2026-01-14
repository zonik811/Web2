
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
║   🔧 Reparar Atributos (Size Fix)         ║
╚══════════════════════════════════════════╝
  ${colors.reset}\n`);

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const COLLECTION_ID = 'empresa_config';

    try {
        // 1. Fix heroImagen (Delete and Recreate with larger size)
        console.log(`${colors.blue}📝 Reparando 'heroImagen'...${colors.reset}`);
        try {
            await databases.deleteAttribute(DATABASE_ID, COLLECTION_ID, 'heroImagen');
            console.log(`${colors.yellow}  🗑️ 'heroImagen' eliminado (para redimensionar)${colors.reset}`);
            // Wait a bit for deletion to propagate
            await new Promise(r => setTimeout(r, 2000));
        } catch (e: any) {
            console.log(`${colors.yellow}  ℹ️ 'heroImagen' no existía o error al borrar: ${e.message}${colors.reset}`);
        }

        try {
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'heroImagen', 5000, false);
            console.log(`${colors.green}  ✓ 'heroImagen' recreado con size 5000${colors.reset}`);
        } catch (e: any) {
            console.error(`${colors.red}  ❌ Error creando 'heroImagen': ${e.message}${colors.reset}`);
        }

        // 2. Create branding_colors if missing
        console.log(`\n${colors.blue}📝 Creando 'branding_colors'...${colors.reset}`);
        try {
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'branding_colors', 5000, false);
            console.log(`${colors.green}  ✓ 'branding_colors' creado con size 5000${colors.reset}`);
        } catch (e: any) {
            if (e.message?.includes('already exists')) {
                console.log(`${colors.green}  ✓ 'branding_colors' ya existe${colors.reset}`);
            } else {
                console.error(`${colors.red}  ❌ Error creando 'branding_colors': ${e.message}${colors.reset}`);
            }
        }

        // 3. Create branding_styles (JSON for Font, Button, Layout, Overlay)
        console.log(`\n${colors.blue}📝 Creando 'branding_styles'...${colors.reset}`);
        try {
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'branding_styles', 5000, false);
            console.log(`${colors.green}  ✓ 'branding_styles' creado con size 5000${colors.reset}`);
        } catch (e: any) {
            if (e.message?.includes('already exists')) {
                console.log(`${colors.green}  ✓ 'branding_styles' ya existe${colors.reset}`);
            } else {
                console.error(`${colors.red}  ❌ Error creando 'branding_styles': ${e.message}${colors.reset}`);
            }
        }

        // 4. Create heroTitulo
        console.log(`\n${colors.blue}📝 Creando 'heroTitulo'...${colors.reset}`);
        try {
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'heroTitulo', 255, false);
            console.log(`${colors.green}  ✓ 'heroTitulo' creado${colors.reset}`);
        } catch (e: any) {
            if (e.message?.includes('already exists')) {
                console.log(`${colors.green}  ✓ 'heroTitulo' ya existe${colors.reset}`);
            } else {
                console.error(`${colors.red}  ❌ Error creando 'heroTitulo': ${e.message}${colors.reset}`);
            }
        }

        // 5. Create heroDescripcion
        console.log(`\n${colors.blue}📝 Creando 'heroDescripcion'...${colors.reset}`);
        try {
            // Description can be long
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'heroDescripcion', 1000, false);
            console.log(`${colors.green}  ✓ 'heroDescripcion' creado${colors.reset}`);
        } catch (e: any) {
            if (e.message?.includes('already exists')) {
                console.log(`${colors.green}  ✓ 'heroDescripcion' ya existe${colors.reset}`);
            } else {
                console.error(`${colors.red}  ❌ Error creando 'heroDescripcion': ${e.message}${colors.reset}`);
            }
        }

        console.log(`\n${colors.green}✅ ¡Reparación completada! Espera unos segundos.${colors.reset}\n`);

    } catch (error: any) {
        console.error(`\n${colors.red}❌ Error General: ${error.message}${colors.reset}`);
    }
}

main();
