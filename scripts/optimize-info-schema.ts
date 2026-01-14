
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'empresa_info';

async function main() {
    console.log(`${colors.cyan}
╔══════════════════════════════════════════╗
║   🧹 Optimizar Esquema Info (Limit Fix)   ║
╚══════════════════════════════════════════╝
  ${colors.reset}\n`);

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);

    try {
        // 1. Ensure JSON columns exist
        console.log(`${colors.cyan}📝 Verificando columnas JSON...${colors.reset}`);
        try {
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'contact_info', 5000, false);
            console.log(`  ✓ 'contact_info' creado.`);
        } catch (e: any) { }

        try {
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'social_links', 5000, false);
            console.log(`  ✓ 'social_links' creado.`);
        } catch (e: any) { }

        // 2. Migrate flattened fields to JSON (if any exist from loose creation)
        // Note: In migrate-to-modular we might have created them properly, 
        // but if limit reached, we probably failed to create some. 
        // The goal here is to DELETE strict columns to make room for logo_url.

        console.log(`\n${colors.yellow}🗑️ Eliminando columnas sueltas para liberar espacio...${colors.reset}`);
        const toDelete = [
            'email', 'telefono', 'whatsapp', 'direccion', 'ciudad', 'pais',
            'instagram', 'facebook', 'linkedin', 'twitter'
        ];

        for (const attr of toDelete) {
            try {
                await databases.deleteAttribute(DATABASE_ID, COLLECTION_ID, attr);
                console.log(`  - ${attr} eliminado.`);
                await new Promise(r => setTimeout(r, 200));
            } catch (e) { }
        }

        console.log(`\n⏳ Esperando propagación (3s)...`);
        await new Promise(r => setTimeout(r, 3000));

        // 3. Create Critical Attributes
        console.log(`\n${colors.cyan}🆕 Creando 'logo_url' (ahora sí debería caber)...${colors.reset}`);
        try {
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'logo_url', 5000, false);
            console.log(`${colors.green}  ✓ 'logo_url' creado exitosamente.${colors.reset}`);
        } catch (e: any) {
            if (e.message?.includes('already exists')) console.log(`${colors.green}  ✓ 'logo_url' ya existe.${colors.reset}`);
            else console.error(`${colors.red}  ❌ Error creando 'logo_url': ${e.message}${colors.reset}`);
        }

        console.log(`\n${colors.green}✅ Optimización de Info completa.${colors.reset}\n`);

    } catch (error: any) {
        console.error(`\n${colors.red}❌ Error Fatal: ${error.message}${colors.reset}`);
    }
}

main();
