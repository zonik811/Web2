const { Client, Databases } = require('node-appwrite');

// Configuración Updated
const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = '6961464c000755a12232';
const API_KEY = 'standard_e6bd013a55aeda7aa2bd038874de9594bca921b3c57a1fc0ded8e32fa1373f4a4b92c56011b6e9e661036f87d82e462dd3298f7e6c450da2ab7e0e6de13f20ee96eb8e1cbd020099f00e667d10605496e8c5696a48dc822f9f2c56ae00df8e98f1a0079b48ec0544a600ae58775dec285787758f6d721176af8f96d14b37c180';
const DATABASE_ID = '69614665000e9d2785fa';
const COLLECTION_COMPRAS = 'compras';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function main() {
    try {
        console.log('Iniciando migración de schema para Compras...');

        // 1. Agregar atributo monto_pagado
        try {
            await databases.createFloatAttribute(DATABASE_ID, COLLECTION_COMPRAS, 'monto_pagado', false, 0);
            console.log('Atributo monto_pagado creado.');
            // Esperar a que se indexe
        } catch (e) {
            console.log('El atributo monto_pagado ya existe o error:', e.message);
        }

        console.log('Migración finalizada.');
    } catch (error) {
        console.error('Error fatal:', error);
    }
}

main();
