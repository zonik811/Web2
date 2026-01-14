require('dotenv').config({ path: '.env.local' });
const sdk = require('node-appwrite');

// Configuración
const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = 'comisiones';

async function createComisionesCollection() {
    try {
        console.log('🎯 Creando colección de Comisiones...');

        // Crear colección
        const collection = await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'Comisiones',
            [
                sdk.Permission.read(sdk.Role.any()),
                sdk.Permission.create(sdk.Role.users()),
                sdk.Permission.update(sdk.Role.users()),
                sdk.Permission.delete(sdk.Role.users())
            ]
        );

        console.log('✅ Colección creada:', collection.$id);

        // Crear atributos
        console.log('📝 Creando atributos...');

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'empleadoId', 255, true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, 'monto', true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'concepto', 500, true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, 'fecha', true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'ordenTrabajoId', 255, false);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'procesoId', 255, false);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'referenciaId', 255, false);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createBooleanAttribute(DATABASE_ID, COLLECTION_ID, 'pagado', true, false);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createEnumAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'estado',
            ['pendiente', 'pagado', 'anulado'],
            true,
            'pendiente'
        );
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'observaciones', 2000, false);
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('✅ Atributos creados');

        // Crear índices
        console.log('🔍 Creando índices...');

        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'idx_empleado',
            'key',
            ['empleadoId'],
            ['ASC']
        );
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'idx_orden',
            'key',
            ['ordenTrabajoId'],
            ['ASC']
        );
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'idx_estado',
            'key',
            ['estado'],
            ['ASC']
        );
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'idx_fecha',
            'key',
            ['fecha'],
            ['DESC']
        );

        console.log('✅ Índices creados');
        console.log('🎉 ¡Colección de Comisiones configurada exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 409) {
            console.log('⚠️ La colección ya existe');
        }
    }
}

createComisionesCollection();
