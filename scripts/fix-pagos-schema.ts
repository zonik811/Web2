
import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// Asegurar ID correcto de Appwrite
const PAGOS_CLIENTES_COLLECTION_ID = 'pagos_clientes';
const PAGOS_EMPLEADOS_COLLECTION_ID = 'pagos_empleados';

async function addEstado(collectionId: string) {
    console.log(`\n🚀 Intentando agregar atributo "estado" a ${collectionId}...`);
    try {
        await databases.createStringAttribute(
            DATABASE_ID,
            collectionId,
            'estado',
            20,
            false,
            'pagado'
        );
        console.log(`✅ Atributo "estado" creado exitosamente en ${collectionId}.`);
    } catch (error: any) {
        if (error.code === 409) {
            console.log(`⚠️ El atributo "estado" ya existe en ${collectionId}.`);
        } else {
            console.error(`❌ Error creando atributo en ${collectionId}:`, error);
        }
    }
}

async function main() {
    // Intentar en ambas para asegurar consistencia
    await addEstado(PAGOS_EMPLEADOS_COLLECTION_ID);
    await addEstado(PAGOS_CLIENTES_COLLECTION_ID);
}

main();
