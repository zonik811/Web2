
import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// Usar el ID real que está en src/lib/appwrite.ts, que resultó ser 'pagos_empleados'
// pero asegurémonos de que coincida con lo que espera el servidor.
const PAGOS_EMPLEADOS_COLLECTION_ID = 'pagos_empleados';

async function main() {
    console.log('🚀 Agregando atributo "estado" a pagos_empleados...');

    try {
        await databases.createStringAttribute(
            DATABASE_ID,
            PAGOS_EMPLEADOS_COLLECTION_ID,
            'estado',
            20,
            false,
            'pagado'
        );
        console.log('✅ Atributo "estado" creado exitosamente.');
    } catch (error: any) {
        if (error.code === 409) {
            console.log('⚠️ El atributo "estado" ya existe.');
        } else {
            console.error('❌ Error creando atributo:', error);
        }
    }
}

main();
