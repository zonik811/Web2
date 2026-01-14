require('dotenv').config({ path: '.env.local' });
const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = 'facturas';

async function createFacturasCollection() {
    try {
        console.log('🧾 Creando colección de Facturas...');

        // Create collection
        const collection = await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'Facturas',
            [
                sdk.Permission.read(sdk.Role.any()),
                sdk.Permission.create(sdk.Role.users()),
                sdk.Permission.update(sdk.Role.users()),
                sdk.Permission.delete(sdk.Role.users())
            ]
        );

        console.log('✅ Colección creada:', collection.$id);

        // Create attributes
        console.log('📝 Creando atributos...');

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'ordenTrabajoId', 255, true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'numeroFactura', 255, true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, 'fecha', true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, 'subtotal', true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, 'impuestos', true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, 'total', true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'terminosPago', 1000, false);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'observaciones', 2000, false);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, 'createdAt', true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('✅ Atributos creados');

        // Create indexes
        console.log('🔍 Creando índices...');

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
            'idx_numero',
            'key',
            ['numeroFactura'],
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
        console.log('🎉 ¡Colección de Facturas configurada exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 409) {
            console.log('⚠️ La colección ya existe');
        }
    }
}

createFacturasCollection();
