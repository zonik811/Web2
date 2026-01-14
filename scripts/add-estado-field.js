require('dotenv').config({ path: '.env.local' });
const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = 'ordenes_trabajo';

async function agregarCampoEstado() {
    try {
        console.log('📝 Agregando campo estado a ordenes_trabajo...');

        // Create enum attribute with all states including POR_PAGAR
        await databases.createEnumAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'estado',
            ['COTIZANDO', 'ACEPTADA', 'EN_PROCESO', 'POR_PAGAR', 'COMPLETADA', 'ENTREGADA', 'CANCELADA'],
            true, // required
            'COTIZANDO' // default value
        );

        console.log('✅ Campo estado agregado exitosamente!');
        console.log('\n📋 Valores del enum:');
        console.log('  - COTIZANDO (default)');
        console.log('  - ACEPTADA');
        console.log('  - EN_PROCESO');
        console.log('  - POR_PAGAR');
        console.log('  - COMPLETADA');
        console.log('  - ENTREGADA');
        console.log('  - CANCELADA');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 409) {
            console.log('⚠️ El campo estado ya existe');
            console.log('Si necesitas actualizarlo, elimínalo primero desde el dashboard');
        }
    }
}

agregarCampoEstado();
