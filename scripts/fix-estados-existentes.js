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

async function actualizarEstadosExistentes() {
    try {
        console.log('🔄 Actualizando estados de órdenes existentes...\n');

        // Obtener todas las órdenes
        const ordenes = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [sdk.Query.limit(100)]
        );

        console.log(`📋 Encontradas ${ordenes.documents.length} órdenes\n`);

        let actualizadas = 0;
        let errores = 0;

        for (const orden of ordenes.documents) {
            try {
                // Si no tiene estado o está vacío, asignar COTIZANDO
                if (!orden.estado) {
                    await databases.updateDocument(
                        DATABASE_ID,
                        COLLECTION_ID,
                        orden.$id,
                        { estado: 'COTIZANDO' }
                    );
                    console.log(`✅ ${orden.numeroOrden}: estado → COTIZANDO`);
                    actualizadas++;
                } else {
                    console.log(`⏭️  ${orden.numeroOrden}: ya tiene estado (${orden.estado})`);
                }

                // Pequeña pausa para evitar rate limits
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error(`❌ Error con ${orden.numeroOrden}:`, error.message);
                errores++;
            }
        }

        console.log('\n📊 Resumen:');
        console.log(`   Actualizadas: ${actualizadas}`);
        console.log(`   Errores: ${errores}`);
        console.log(`   Total procesadas: ${ordenes.documents.length}`);
        console.log('\n✅ Proceso completado!');

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

actualizarEstadosExistentes();
