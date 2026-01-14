/**
 * Script para agregar SOLO los campos de costos faltantes
 * Ejecutar con: node scripts/add-cost-fields.js
 */

const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6961464c000755a12232')
    .setKey('standard_e6bd013a55aeda7aa2bd038874de9594bca921b3c57a1fc0ded8e32fa1373f4a4b92c56011b6e9e661036f87d82e462dd3298f7e6c450da2ab7e0e6de13f20ee96eb8e1cbd020099f00e667d10605496e8c5696a48dc822f9f2c56ae00df8e98f1a0079b48ec0544a600ae58775dec285787758f6d721176af8f96d14b37c180');

const DATABASE_ID = '69614665000e9d2785fa';
const COLLECTION_ID = 'ordenes_trabajo';

async function agregarCamposCostos() {
    console.log('💰 Agregando campos de costos a ordenes_trabajo...\n');

    const campos = [
        { key: 'subtotal', default: 0 },
        { key: 'porcentajeIva', default: 19 },
        { key: 'impuestos', default: 0 },
        { key: 'total', default: 0 },
    ];

    for (const campo of campos) {
        try {
            console.log(`➕ Agregando: ${campo.key} (float, default: ${campo.default})...`);

            await databases.createFloatAttribute(
                DATABASE_ID,
                COLLECTION_ID,
                campo.key,
                false,  // required
                null,   // min
                null,   // max
                campo.default
            );

            console.log(`✅ ${campo.key} agregado exitosamente!\n`);
            await new Promise(resolve => setTimeout(resolve, 1500));

        } catch (error) {
            if (error.code === 409) {
                console.log(`⚠️  ${campo.key} ya existe\n`);
            } else {
                console.error(`❌ Error en ${campo.key}:`, error.message, '\n');
            }
        }
    }

    console.log('\n✅ Proceso completado!');
    console.log('⏳ Espera 30-60 segundos y recarga Appwrite para ver los campos.\n');
}

agregarCamposCostos().catch(console.error);
