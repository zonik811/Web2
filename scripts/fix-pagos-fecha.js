require('dotenv').config({ path: '.env.local' });
const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = 'pagos_clientes';

async function fixPagosFechaField() {
    try {
        console.log('🔧 Verificando campo fecha en pagos_clientes...');

        // Try to get collection attributes
        const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);

        console.log('📋 Atributos existentes:', collection.attributes.map(a => a.key).join(', '));

        const hasFecha = collection.attributes.some(attr => attr.key === 'fecha');

        if (hasFecha) {
            console.log('✅ El campo fecha ya existe');
            return;
        }

        console.log('⚠️ Campo fecha no encontrado, agregándolo...');

        await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, 'fecha', true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create index for fecha
        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'idx_fecha',
            'key',
            ['fecha'],
            ['DESC']
        );

        console.log('✅ Campo fecha agregado exitosamente');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixPagosFechaField();
