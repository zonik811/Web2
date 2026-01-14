/**
 * Script para verificar y actualizar el rol del usuario admin
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases, Query } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m'
};

async function main() {
    console.log(`${colors.cyan}Verificando usuario admin...${colors.reset}`);

    const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const API_KEY = process.env.APPWRITE_API_KEY!;

    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);

    try {
        //  Buscar perfil con email admin
        console.log('Buscando perfil de admin@admin.com...');

        const profiles = await databases.listDocuments(
            DATABASE_ID,
            'user_profile',
            [
                Query.limit(100)
            ]
        );

        console.log(`${colors.yellow}Perfiles encontrados: ${profiles.documents.length}${colors.reset}`);

        profiles.documents.forEach((profile: any) => {
            console.log(`- ID: ${profile.$id}, Nombre: ${profile.nombre}, Rol: ${profile.rol}, UserID: ${profile.userId}`);
        });

        // Buscar el perfil del admin por nombre
        const adminProfile = profiles.documents.find((p: any) =>
            p.nombre === 'Admin' || p.rol === 'admin'
        );

        if (adminProfile) {
            console.log(`\n${colors.green}✓ Perfil admin encontrado${colors.reset}`);
            console.log(`ID: ${adminProfile.$id}`);
            console.log(`Rol actual: ${(adminProfile as any).rol}`);

            if ((adminProfile as any).rol !== 'admin') {
                console.log(`${colors.yellow}Actualizando rol a 'admin'...${colors.reset}`);
                await databases.updateDocument(
                    DATABASE_ID,
                    'user_profile',
                    adminProfile.$id,
                    { rol: 'admin' }
                );
                console.log(`${colors.green}✓ Rol actualizado${colors.reset}`);
            } else {
                console.log(`${colors.green}✓ Rol ya es 'admin'${colors.reset}`);
            }
        } else {
            console.log(`${colors.yellow}⚠ No se encontró perfil admin${colors.reset}`);
        }

    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

main();
