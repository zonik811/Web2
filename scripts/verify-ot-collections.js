/**
 * Script para verificar la estructura de las colecciones de OT en Appwrite
 * Ejecutar con: node scripts/verify-ot-collections.js
 */

const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6961464c000755a12232')
    .setKey('standard_e6bd013a55aeda7aa2bd038874de9594bca921b3c57a1fc0ded8e32fa1373f4a4b92c56011b6e9e661036f87d82e462dd3298f7e6c450da2ab7e0e6de13f20ee96eb8e1cbd020099f00e667d10605496e8c5696a48dc822f9f2c56ae00df8e98f1a0079b48ec0544a600ae58775dec285787758f6d721176af8f96d14b37c180');

const DATABASE_ID = '69614665000e9d2785fa';

const collectionsToVerify = [
    'vehiculos',
    'ordenes_trabajo',
    'ot_procesos',
    'ot_actividades',
    'ot_repuestos',
    'ot_pruebas',
    'ot_checklist_vehiculo',
    'ot_autorizaciones',
    'ot_solicitudes_repuestos',
    'ot_plantillas_procesos'
];

async function verifyCollection(collectionId) {
    try {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`📋 COLECCIÓN: ${collectionId.toUpperCase()}`);
        console.log('='.repeat(80));

        const collection = await databases.getCollection(DATABASE_ID, collectionId);

        console.log(`✅ Estado: Existe`);
        console.log(`📛 Nombre: ${collection.name}`);
        console.log(`🆔 ID: ${collection.$id}`);
        console.log(`📅 Creada: ${new Date(collection.$createdAt).toLocaleString()}`);

        // Obtener atributos
        const attributes = await databases.listAttributes(DATABASE_ID, collectionId);

        console.log(`\n📊 ATRIBUTOS (Total: ${attributes.total}):`);
        console.log('-'.repeat(80));
        console.log(
            '| %-30s | %-15s | %-10s | %-10s |',
            'NOMBRE',
            'TIPO',
            'REQUERIDO',
            'ARRAY'
        );
        console.log('-'.repeat(80));

        attributes.attributes.forEach(attr => {
            const type = attr.type === 'string'
                ? `${attr.type}(${attr.size})`
                : attr.type === 'enum'
                    ? `enum[${attr.elements?.length || 0}]`
                    : attr.type;

            console.log(
                '| %-30s | %-15s | %-10s | %-10s |',
                attr.key,
                type,
                attr.required ? 'Sí' : 'No',
                attr.array ? 'Sí' : 'No'
            );

            // Mostrar elementos de enum si aplica
            if (attr.type === 'enum' && attr.elements) {
                console.log('  └─> Valores: ' + attr.elements.join(', '));
            }

            // Mostrar valor por defecto si existe
            if (attr.default !== null && attr.default !== undefined) {
                console.log(`  └─> Default: ${attr.default}`);
            }
        });

        console.log('-'.repeat(80));

    } catch (error) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`📋 COLECCIÓN: ${collectionId.toUpperCase()}`);
        console.log('='.repeat(80));
        console.log(`❌ ERROR: ${error.message}`);
        console.log(`   Código: ${error.code}`);
    }
}

async function main() {
    console.log('\n🔍 VERIFICACIÓN DE COLECCIONES DE ÓRDENES DE TRABAJO');
    console.log('='.repeat(80));
    console.log(`📊 Colecciones a verificar: ${collectionsToVerify.length}`);

    for (const collectionId of collectionsToVerify) {
        await verifyCollection(collectionId);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('='.repeat(80));
    console.log('\n📝 Revisa la estructura de cada colección arriba.');
    console.log('💡 Si falta algún atributo o el tipo no es correcto, avísame.\n');
}

// Helper para formatear printf-style (simple)
console.log = (function (oldLog) {
    return function () {
        const args = Array.from(arguments);
        if (typeof args[0] === 'string' && args[0].includes('%')) {
            const format = args.shift();
            const parts = format.split(/%[-\d]*s/);
            const matches = format.match(/%[-\d]*s/g) || [];

            let result = '';
            for (let i = 0; i < parts.length; i++) {
                result += parts[i];
                if (i < matches.length && args[i]) {
                    const match = matches[i];
                    const widthMatch = match.match(/%-?(\d+)s/);
                    if (widthMatch) {
                        const width = parseInt(widthMatch[1]);
                        const leftAlign = match.startsWith('%-');
                        let val = String(args[i]);

                        if (leftAlign) {
                            val = val.padEnd(width, ' ');
                        } else {
                            val = val.padStart(width, ' ');
                        }
                        result += val;
                    } else {
                        result += args[i];
                    }
                }
            }
            oldLog(result);
        } else {
            oldLog.apply(console, arguments);
        }
    };
})(console.log);

main().catch(console.error);
