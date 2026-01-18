const { Client, Databases, Query } = require('node-appwrite');

// Configuración
const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = '6961464c000755a12232';
const API_KEY = 'standard_e6bd013a55aeda7aa2bd038874de9594bca921b3c57a1fc0ded8e32fa1373f4a4b92c56011b6e9e661036f87d82e462dd3298f7e6c450da2ab7e0e6de13f20ee96eb8e1cbd020099f00e667d10605496e8c5696a48dc822f9f2c56ae00df8e98f1a0079b48ec0544a600ae58775dec285787758f6d721176af8f96d14b37c180';
const DATABASE_ID = '69614665000e9d2785fa';
const COLL_COMPRAS = 'compras';
const COLL_PAGOS = 'pago_compras';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function main() {
    try {
        console.log('Iniciando sincronización de totales de pagos...');

        // 1. Obtener todas las compras
        let allCompras = [];
        let cursor = null;

        // Simple pagination
        while (true) {
            const queries = [Query.limit(100)];
            if (cursor) queries.push(Query.cursorAfter(cursor));

            const response = await databases.listDocuments(DATABASE_ID, COLL_COMPRAS, queries);
            allCompras = [...allCompras, ...response.documents];

            if (response.documents.length < 100) break;
            cursor = response.documents[response.documents.length - 1].$id;
        }

        console.log(`Procesando ${allCompras.length} compras...`);

        for (const compra of allCompras) {
            // 2. Obtener pagos de esta compra
            const pagos = await databases.listDocuments(DATABASE_ID, COLL_PAGOS, [
                Query.equal('compra_id', compra.$id)
            ]);

            const realTotalPagado = pagos.documents.reduce((acc, p) => acc + (p.monto || 0), 0);

            // 3. Actualizar si es diferente
            if (compra.monto_pagado !== realTotalPagado) {
                console.log(`Corrigiendo Compra ${compra.$id}: ${compra.monto_pagado || 0} -> ${realTotalPagado}`);

                // Determinar estado basado en pago real vs total
                const nuevoEstado = (realTotalPagado >= (compra.total - 1)) ? 'pagado' : 'pendiente';

                await databases.updateDocument(DATABASE_ID, COLL_COMPRAS, compra.$id, {
                    monto_pagado: realTotalPagado,
                    estado_pago: nuevoEstado
                });
            }
        }

        console.log('Sincronización completada.');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
