
import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const collectionId = 'empleados';

async function repairSchema() {
    console.log('🛠️ Iniciando fase 2 de reparación de schema para Empleados...');

    try {
        const attrs = await databases.listAttributes(databaseId, collectionId);
        const existingKeys = attrs.attributes.map((a: any) => a.key);
        console.log('📋 Atributos actuales:', existingKeys.join(', '));

        // 1. tarifaPorHora (Float, Required)
        if (!existingKeys.includes('tarifaPorHora')) {
            console.log('👉 Creando "tarifaPorHora" (Float)...');
            await databases.createFloatAttribute(databaseId, collectionId, 'tarifaPorHora', true);
        } else {
            console.log('✅ "tarifaPorHora" ya existe.');
        }

        // 2. modalidadPago (String for flexibility, previously Enum)
        // Check if exists and is compatible. logic suggests just ensuring it exists.
        // We will make it String to match the "flexible" types pattern we adopted for Cargo.
        if (!existingKeys.includes('modalidadPago')) {
            console.log('👉 Creando "modalidadPago" (String)...');
            await databases.createStringAttribute(databaseId, collectionId, 'modalidadPago', 50, true);
        } else {
            // If it exists as Enum, we might leave it or change it. 
            // If the user's error was just "Unknown generic", creating it if missing is priority.
            console.log('✅ "modalidadPago" ya existe.');
        }

        // 3. activo (Boolean, Required)
        if (!existingKeys.includes('activo')) {
            console.log('👉 Creando "activo" (Boolean)...');
            await databases.createBooleanAttribute(databaseId, collectionId, 'activo', true);
        }

        // 4. foto (String, Optional)
        if (!existingKeys.includes('foto')) {
            console.log('👉 Creando "foto" (String, Optional)...');
            await databases.createStringAttribute(databaseId, collectionId, 'foto', 255, false);
        }

        // 5. calificacionPromedio (Float, Optional)
        if (!existingKeys.includes('calificacionPromedio')) {
            console.log('👉 Creando "calificacionPromedio" (Float, Optional)...');
            await databases.createFloatAttribute(databaseId, collectionId, 'calificacionPromedio', false);
        }

        // 6. totalServicios (Integer, Optional)
        if (!existingKeys.includes('totalServicios')) {
            console.log('👉 Creando "totalServicios" (Integer, Optional)...');
            await databases.createIntegerAttribute(databaseId, collectionId, 'totalServicios', false);
        }

        console.log('✨ Reparación finalizada.');

    } catch (error: any) {
        console.error('❌ Error durante la reparación:', error.message);
    }
}

repairSchema();
