import { Client, Databases, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'empleados';

async function createGenericEmployee() {
    console.log('🔄 Creando empleado genérico "Cajero Principal"...\n');

    try {
        // Check if generic employee already exists
        const existingEmployees = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            []
        );

        const genericExists = existingEmployees.documents.find(
            (doc: any) => doc.nombre === 'Cajero' && doc.apellido === 'Principal'
        );

        if (genericExists) {
            console.log('✅ Empleado genérico ya existe:');
            console.log(`   ID: ${genericExists.$id}`);
            console.log(`   Nombre: ${genericExists.nombre} ${genericExists.apellido}`);
            console.log(`   Cargo: ${genericExists.cargo}`);
            console.log('\n✨ No se requiere ninguna acción.');
            return;
        }

        // Create generic employee
        console.log('⏳ Creando nuevo empleado genérico...');
        const genericEmployee = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                nombre: 'Cajero',
                apellido: 'Principal',
                documento: '0000000000',
                telefono: '0000000000',
                email: 'cajero@sistema.com',
                direccion: 'Sistema',
                cargo: 'Cajero',
                fechaIngreso: new Date().toISOString().split('T')[0],
                salario: 0,
                activo: true,
                // userId will be null/undefined for generic employee
            }
        );

        console.log('✅ Empleado genérico creado exitosamente!');
        console.log(`   ID: ${genericEmployee.$id}`);
        console.log(`   Nombre: ${genericEmployee.nombre} ${genericEmployee.apellido}`);
        console.log(`   Cargo: ${genericEmployee.cargo}`);
        console.log('\n📝 Este empleado se puede usar como cajero genérico en el POS.');

    } catch (error: any) {
        console.error('❌ Error creando empleado genérico:', error.message);

        if (error.code === 404) {
            console.error('\n⚠️  La colección "empleados" no existe.');
        }

        process.exit(1);
    }
}

createGenericEmployee();
