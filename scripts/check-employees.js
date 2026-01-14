const { Client, Databases } = require('node-appwrite');

// Inicializar cliente
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('674e178a002636f3d95c') // Project ID
    .setKey(process.env.NEXT_PUBLIC_APPWRITE_API_KEY || '674e178a002636f3d95c'); // Usar ID hardcoded si no hay env, pero mejor buscar la key real

// Necesitamos la API KEY real, voy a intentar leer .env.local primero
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.join(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_APPWRITE_API_KEY=(.+)/);
    if (match) {
        client.setKey(match[1].trim());
        console.log("API Key loaded from .env.local");
    } else {
        console.log("API Key not found in .env.local, using fallback (likely to fail if not public)");
    }

    // Database and Collection IDs
    const DATABASE_ID = '674e17bc000d0243be12'; // Buscando ID real en setup-collections...
    const EMPLEADOS_COLLECTION_ID = 'empleados';

    const databases = new Databases(client);

    async function checkEmployees() {
        console.log("Fetching employees...");
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                EMPLEADOS_COLLECTION_ID
            );

            console.log(`Found ${response.total} employees:`);
            response.documents.forEach(emp => {
                console.log(`- Name: ${emp.nombre} ${emp.apellido}`);
                console.log(`  ID: ${emp.$id}`);
                console.log(`  Cargo: '${emp.cargo}'`);
                console.log(`  Activo: ${emp.activo}`);
                console.log(`  Especialidades: ${emp.especialidades}`);
                console.log('---');
            });

            if (response.total === 0) {
                console.log("No employees found. Please create one via the admin dashboard.");
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    }

    checkEmployees();

} catch (err) {
    console.error("Error reading .env:", err);
}
