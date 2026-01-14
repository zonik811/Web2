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

async function checkDateFields() {
    try {
        console.log('🔧 Verificando campos de fecha en pagos_clientes...');

        const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);

        console.log('📋 Atributos existentes:', collection.attributes.map(a => `${a.key} (${a.type})`).join(', '));

        const fecha = collection.attributes.find(attr => attr.key === 'fecha');
        const fechaPago = collection.attributes.find(attr => attr.key === 'fechaPago');

        console.log('\n📅 Detalle fechas:');
        console.log('- fecha:', fecha ? `✅ Existe (Required: ${fecha.required})` : '❌ No existe');
        console.log('- fechaPago:', fechaPago ? `✅ Existe (Required: ${fechaPago.required})` : '❌ No existe');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkDateFields();
