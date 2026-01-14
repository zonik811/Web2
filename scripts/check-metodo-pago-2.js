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

async function checkMetodoPago2() {
    try {
        console.log('🔧 Verificando campo metodoPago2 en pagos_clientes...');

        const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);

        console.log('📋 Atributos existentes:', collection.attributes.map(a => a.key).join(', '));

        const hasMetodoPago2 = collection.attributes.some(attr => attr.key === 'metodoPago2');

        if (hasMetodoPago2) {
            console.log('✅ El campo metodoPago2 ya existe');
        } else {
            console.log('⚠️ Campo metodoPago2 NO existe. Creándolo...');
            await databases.createEnumAttribute(
                DATABASE_ID,
                COLLECTION_ID,
                'metodoPago2',
                ['efectivo', 'tarjeta', 'transferencia', 'cheque'],
                true,
                'efectivo' // Default value
            );
            console.log('✅ Campo metodoPago2 creado exitosamente');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkMetodoPago2();
