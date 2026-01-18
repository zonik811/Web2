import { Client, Databases, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'clientes';

async function createGenericCustomer() {
    console.log('🔄 Creando cliente genérico "Cliente Mostrador"...\n');

    try {
        // Check if generic customer already exists
        const existingCustomers = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [] // No filters, we'll check manually
        );

        const genericExists = existingCustomers.documents.find(
            (doc: any) => doc.email === 'mostrador@pos.com' || doc.nombre === 'Cliente Mostrador'
        );

        if (genericExists) {
            console.log('✅ Cliente genérico ya existe:');
            console.log(`   ID: ${genericExists.$id}`);
            console.log(`   Nombre: ${genericExists.nombre}`);
            console.log(`   Email: ${genericExists.email}`);
            console.log('\n✨ No se requiere ninguna acción.');
            return;
        }

        // Create generic customer
        console.log('⏳ Creando nuevo cliente genérico...');
        const genericCustomer = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                nombre: 'Cliente Mostrador',
                telefono: '0000000000',
                email: 'mostrador@pos.com',
                direccion: 'N/A',
                ciudad: 'N/A',
                tipoCliente: 'mostrador',
                frecuenciaPreferida: 'unica',
                totalServicios: 0,
                totalGastado: 0,
                calificacionPromedio: 0,
                notasImportantes: 'Cliente genérico para ventas POS sin cliente específico'
            }
        );

        console.log('✅ Cliente genérico creado exitosamente!');
        console.log(`   ID: ${genericCustomer.$id}`);
        console.log(`   Nombre: ${genericCustomer.nombre}`);
        console.log(`   Email: ${genericCustomer.email}`);
        console.log('\n📝 Este cliente se usará por defecto en ventas POS cuando no se seleccione un cliente específico.');

    } catch (error: any) {
        console.error('❌ Error creando cliente genérico:', error.message);

        if (error.code === 404) {
            console.error('\n⚠️  La colección "clientes" no existe. Asegúrate de que esté creada en Appwrite.');
        }

        process.exit(1);
    }
}

createGenericCustomer();
