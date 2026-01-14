/**
 * Script simplificado para verificar colecciones
 */

const sdk = require('node-appwrite');

const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6961464c000755a12232')
    .setKey('standard_e6bd013a55aeda7aa2bd038874de9594bca921b3c57a1fc0ded8e32fa1373f4a4b92c56011b6e9e661036f87d82e462dd3298f7e6c450da2ab7e0e6de13f20ee96eb8e1cbd020099f00e667d10605496e8c5696a48dc822f9f2c56ae00df8e98f1a0079b48ec0544a600ae58775dec285787758f6d721176af8f96d14b37c180');

const DATABASE_ID = '69614665000e9d2785fa';

const collections = [
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

async function verify() {
    console.log('\\n========================================');
    console.log('VERIFICACION DE COLECCIONES');
    console.log('========================================\\n');

    for (const collId of collections) {
        try {
            const coll = await databases.getCollection(DATABASE_ID, collId);
            const attrs = await databases.listAttributes(DATABASE_ID, collId);

            console.log(`\\n[${collId}]`);
            console.log(`  Nombre: ${coll.name}`);
            console.log(`  Atributos: ${attrs.total}`);
            console.log(`  Lista:`);

            attrs.attributes.forEach(a => {
                const typeInfo = a.type === 'string' ? `${a.type}(${a.size})` : a.type;
                const req = a.required ? '[REQ]' : '[OPC]';
                const arr = a.array ? '[ARRAY]' : '';
                console.log(`    - ${a.key}: ${typeInfo} ${req} ${arr}`);

                if (a.type === 'enum') {
                    console.log(`      Valores: ${a.elements.join(', ')}`);
                }
            });

        } catch (e) {
            console.log(`\\n[${collId}] ERROR: ${e.message}`);
        }
    }

    console.log('\\n========================================');
    console.log('VERIFICACION COMPLETA');
    console.log('========================================\\n');
}

verify().catch(console.error);
