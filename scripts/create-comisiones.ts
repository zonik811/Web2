
import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';
import { DATABASE_ID } from '@/lib/appwrite';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

// Use env var for DB ID if available, otherwise fallback
const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function createComisionesCollection() {
    console.log('📋 Creando colección: Comisiones');

    try {
        // Clean up previous attempt if exists partially (optional, but good practice here since it failed)
        try {
            await databases.deleteCollection(dbId, 'comisiones');
            console.log('🗑️ Colección previa eliminada/limpia.');
            // Wait for deletion
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e: any) {
            // Ignore if not exists
        }

        // 1. Create Collection
        const collection = await databases.createCollection(
            dbId,
            'comisiones',
            'Comisiones',
            [Permission.read(Role.users()), Permission.write(Role.users())]
        );
        console.log('✅ Colección creada con ID: comisiones');

        const colId = collection.$id;

        // 2. Create Attributes
        await databases.createStringAttribute(dbId, colId, 'empleadoId', 100, true);
        await databases.createFloatAttribute(dbId, colId, 'monto', true);
        await databases.createStringAttribute(dbId, colId, 'concepto', 100, true);
        await databases.createStringAttribute(dbId, colId, 'fecha', 30, true); // ISO Date
        await databases.createStringAttribute(dbId, colId, 'referenciaId', 100, false);
        await databases.createBooleanAttribute(dbId, colId, 'pagado', false);
        // Removing default value for required attribute to fix error
        await databases.createEnumAttribute(dbId, colId, 'estado', ['pendiente', 'pagado', 'anulado'], true);
        await databases.createStringAttribute(dbId, colId, 'observaciones', 1000, false);

        console.log('✅ Atributos definidos. Esperando a que Appwrite los procese...');

    } catch (error: any) {
        console.error('❌ Error creando colección:', error.message);
    }
}

createComisionesCollection();
