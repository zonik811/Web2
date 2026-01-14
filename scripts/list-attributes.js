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

async function listAllAttributes() {
    try {
        console.log('🔍 Listando TODOS los atributos de pagos_clientes...');

        const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID);

        console.log('\n📋 ATRIBUTOS ENCONTRADOS:');
        console.log('----------------------------------------');
        collection.attributes.forEach(attr => {
            console.log(`🔹 Key: ${attr.key}`);
            console.log(`   Type: ${attr.type}`);
            console.log(`   Required: ${attr.required}`);
            console.log('----------------------------------------');
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

listAllAttributes();
