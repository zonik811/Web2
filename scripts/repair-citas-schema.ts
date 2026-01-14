
import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import { COLLECTIONS, DATABASE_ID } from '@/lib/appwrite'; // Using appwrite.ts config if possible, but for script simplicity I'll hardcode or use envs

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const collectionId = 'citas'; // Confirmed by scripts/collections/citas.ts

async function repairCitasSchema() {
    console.log('🛠️ Iniciando reparación de schema para Citas...');

    try {
        const attrs = await databases.listAttributes(databaseId, collectionId);
        const existingKeys = attrs.attributes.map((a: any) => a.key);
        console.log('📋 Atributos actuales:', existingKeys.join(', '));

        // 1. empleadosAsignados (Array of Strings)
        if (!existingKeys.includes('empleadosAsignados')) {
            console.log('👉 Creando "empleadosAsignados" (Array String)...');
            // key, size, required, default, array
            await databases.createStringAttribute(databaseId, collectionId, 'empleadosAsignados', 5000, false, undefined, true);
            console.log('✅ "empleadosAsignados" creado.');
        } else {
            console.log('✅ "empleadosAsignados" ya existe.');
        }

        // 2. horasTrabajadas (Float, Optional)
        if (!existingKeys.includes('horasTrabajadas')) {
            console.log('👉 Creando "horasTrabajadas" (Float)...');
            await databases.createFloatAttribute(databaseId, collectionId, 'horasTrabajadas', false);
        }

        // 3. estado (String) - Using String for robust compatibility
        if (!existingKeys.includes('estado')) {
            console.log('👉 Creando "estado" (String)...');
            await databases.createStringAttribute(databaseId, collectionId, 'estado', 50, true);
            console.log('✅ "estado" creado.');
        }

        // 4. fechaCita (String, Required)
        if (!existingKeys.includes('fechaCita')) {
            console.log('👉 Creando "fechaCita" (String)...');
            await databases.createStringAttribute(databaseId, collectionId, 'fechaCita', 20, true);
            console.log('✅ "fechaCita" creado.');
        }

        // 5. precioCliente (Float, Optional)
        if (!existingKeys.includes('precioCliente')) {
            console.log('👉 Creando "precioCliente" (Float)...');
            await databases.createFloatAttribute(databaseId, collectionId, 'precioCliente', false);
            console.log('✅ "precioCliente" creado.');
        }

        console.log('✨ Reparación de Citas finalizada.');

    } catch (error: any) {
        console.error('❌ Error durante la reparación:', error.message);
    }
}

repairCitasSchema();
