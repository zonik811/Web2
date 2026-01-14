
import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

async function main() {
    console.log('🔄 Agregando campo completedAt a la colección Citas...');

    // Hardcoded IDs from environment or knowledge
    // Using environment variables is safer, but user might need to ensure they are set when running the script
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    // Actually, create-collections.ts likely uses env vars. Let's stick to env vars and user instructions.

    // If I don't have the exact IDs handy, I should rely on the user having .env setup correctly.
    // However, I can try to fetch the database ID or just use the one I've seen in other files if available.
    // Looking at previous valid file views, I don't recall seeing the hardcoded database ID exposed directly in the simplified views, 
    // but the user environment is usually set up.

    // Let's assume standard env var names.
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const CITAS_COLLECTION_ID = 'citas'; // Based on scripts/collections/citas.ts creation call 'citas'

    try {
        await databases.createDatetimeAttribute(
            DATABASE_ID,
            CITAS_COLLECTION_ID,
            'completedAt',
            false
        );
        console.log('✅ Campo completedAt agregado exitosamente');
    } catch (error: any) {
        if (error.code === 409) {
            console.log('⚠️ El campo completedAt ya existe');
        } else {
            console.error('❌ Error:', error);
        }
    }
}

main();
