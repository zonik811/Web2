/**
 * Script para crear usuario admin en Appwrite
 * USO: npx tsx scripts/create-admin-user.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Account, Users, Databases, ID } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

async function main() {
    console.log(`${colors.cyan}Creando usuario admin...${colors.reset}`);

    const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const API_KEY = process.env.APPWRITE_API_KEY!;

    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const users = new Users(client);
    const databases = new Databases(client);

    try {
        // Crear usuario
        console.log('Creando usuario admin@admin.com...');

        const user = await users.create(
            ID.unique(),
            'admin@admin.com',
            undefined, // phone
            'altiora123',
            'Admin User'
        );

        console.log(`${colors.green}✓ Usuario creado: ${user.$id}${colors.reset}`);

        // Crear perfil de usuario
        console.log('Creando perfil de usuario...');

        await databases.createDocument(
            DATABASE_ID,
            'user_profile',
            ID.unique(),
            {
                userId: user.$id,
                rol: 'admin',
                nombre: 'Admin',
                apellido: 'User',
                telefono: '+57 300 000 0000',
                permisos: ['all'],
                activo: true,
                cargo: 'Administrador',
                departamento: 'Sistemas'
            }
        );

        console.log(`${colors.green}✓ Perfil creado${colors.reset}`);
        console.log(`\n${colors.green}✅ Usuario admin creado exitosamente!${colors.reset}`);
        console.log(`   Email: admin@admin.com`);
        console.log(`   Password: altiora123\n`);

    } catch (error: any) {
        if (error.message.includes('already exists')) {
            console.log(`${colors.cyan}ℹ Usuario ya existe${colors.reset}\n`);
        } else {
            console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
        }
    }
}

main();
