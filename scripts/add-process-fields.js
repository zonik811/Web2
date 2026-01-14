const { Client, Databases } = require('node-appwrite');

// Inicializar cliente
const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6961464c000755a12232')
    .setKey('standard_e6bd013a55aeda7aa2bd038874de9594bca921b3c57a1fc0ded8e32fa1373f4a4b92c56011b6e9e661036f87d82e462dd3298f7e6c450da2ab7e0e6de13f20ee96eb8e1cbd020099f00e667d10605496e8c5696a48dc822f9f2c56ae00df8e98f1a0079b48ec0544a600ae58775dec285787758f6d721176af8f96d14b37c180');

const DATABASE_ID = '69614665000e9d2785fa';
const COLLECTION_ID = 'ot_procesos';

const databases = new Databases(client);

async function addFields() {
    console.log(`Adding fields to ${COLLECTION_ID}...`);
    try {
        // Agregar costoManoObra (float)
        console.log("Adding costoManoObra...");
        await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, 'costoManoObra', false, 0, 1000000000, 0); // min 0, max 1B, default 0
        console.log("✅ costoManoObra added.");
    } catch (error) {
        console.log("ℹ️ costoManoObra might already exist or error:", error.message);
    }

    try {
        // Agregar horasReales (float) por si acaso falta
        console.log("Adding horasReales...");
        await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, 'horasReales', false, 0, 1000, null);
        console.log("✅ horasReales added.");
    } catch (error) {
        console.log("ℹ️ horasReales might already exist or error:", error.message);
    }
}

addFields();
