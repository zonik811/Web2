
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    blue: '\x1b[34m'
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'empresa_info'; // The modular collection for info

async function main() {
    console.log(`${colors.blue}🔧 Reparando atributo 'logo_url' en '${COLLECTION_ID}'...${colors.reset}\n`);

    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);

    try {
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'logo_url', 5000, false);
        console.log(`${colors.green}  ✓ Atributo 'logo_url' creado exitosamente.${colors.reset}`);
    } catch (e: any) {
        if (e.message?.includes('already exists')) {
            console.log(`${colors.green}  ✓ 'logo_url' ya existe.${colors.reset}`);
        } else {
            console.error(`${colors.red}  ❌ Error creando 'logo_url': ${e.message}${colors.reset}`);
        }
    }

    console.log(`\n⏳ Esperando propagación (2s)...`);
    await new Promise(r => setTimeout(r, 2000));
    console.log(`${colors.green}✅ Reparación terminada.${colors.reset}\n`);
}

main();
