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

async function agregarCamposOT() {
    try {
        console.log('📝 Agregando campos para Órdenes de Trabajo a pagos_clientes...');

        // 1. ordenTrabajoId (opcional)
        console.log('Agregando ordenTrabajoId...');
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'ordenTrabajoId',
            255,
            false // opcional
        );
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 2. facturaId (opcional)
        console.log('Agregando facturaId...');
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'facturaId',
            255,
            false // opcional
        );
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. metodoPago2 enum (opcional) - para pagos de OT
        console.log('Agregando metodoPago2...');
        await databases.createEnumAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'metodoPago2',
            ['efectivo', 'tarjeta', 'transferencia', 'cheque'],
            false, // opcional
            'efectivo' // valor por defecto
        );

        console.log('✅ Campos agregados exitosamente!');
        console.log('\n📋 Campos agregados:');
        console.log('  - ordenTrabajoId (string, opcional)');
        console.log('  - facturaId (string, opcional)');
        console.log('  - metodoPago2 (enum, opcional)');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

agregarCamposOT();
