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

async function actualizarEstadoEnum() {
    try {
        console.log('🔄 Actualizando campo estado en ordenes_trabajo...');

        // Delete old attribute
        console.log('Eliminando atributo antiguo...');
        try {
            await databases.deleteAttribute(DATABASE_ID, COLLECTION_ID, 'estado');
            console.log('✅ Atributo eliminado');
            // Wait for deletion to complete
            await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
            console.log('Atributo ya no existe o no se puede eliminar');
        }

        // Create new enum with POR_PAGAR
        console.log('Creando nuevo atributo con POR_PAGAR...');
        await databases.createEnumAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'estado',
            ['COTIZANDO', 'ACEPTADA', 'EN_PROCESO', 'POR_PAGAR', 'COMPLETADA', 'ENTREGADA', 'CANCELADA'],
            true,
            'COTIZANDO'
        );

        console.log('✅ Campo estado actualizado exitosamente!');
        console.log('\n📋 Valores permitidos:');
        console.log('  - COTIZANDO');
        console.log('  - ACEPTADA');
        console.log('  - EN_PROCESO');
        console.log('  - POR_PAGAR ⭐ (nuevo)');
        console.log('  - COMPLETADA');
        console.log('  - ENTREGADA');
        console.log('  - CANCELADA');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n⚠️ IMPORTANTE: Si hay un error, es porque hay datos en la colección.');
        console.log('Opciones:');
        console.log('1. Actualizar manualmente desde el dashboard de Appwrite');
        console.log('2. O crear el campo con otro nombre temporal');
    }
}

actualizarEstadoEnum();
