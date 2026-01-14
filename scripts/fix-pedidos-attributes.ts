import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.APPWRITE_API_KEY) {
    console.error('❌ Faltan variables de entorno necesarias');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'pedidos_catalogo';

async function fixAttributes() {
    console.log('🔧 Reparando atributos de pedidos_catalogo...');
    console.log(`Database ID: ${DATABASE_ID}`);
    console.log(`Collection ID: ${COLLECTION_ID}`);

    try {
        console.log('Intentando crear atributo "estado"...');
        // Intentar crear con valor por defecto para evitar errores si hay documentos
        await databases.createEnumAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'estado',
            ['creado', 'confirmado', 'pagado', 'enviado', 'completado', 'cancelado'],
            true, // required
            'creado' // default
        );
        console.log('✅ Atributo "estado" creado correctamente');
    } catch (error: any) {
        console.log(`⚠️ Reporte creación "estado": ${error.message}`);
    }

    try {
        console.log('Intentando crear atributo "stock_descontado"...');
        await databases.createBooleanAttribute(DATABASE_ID, COLLECTION_ID, 'stock_descontado', true, false);
        console.log('✅ Atributo "stock_descontado" creado correctamente');
    } catch (error: any) {
        console.log(`⚠️ Reporte creación "stock_descontado": ${error.message}`);
    }

    try {
        console.log('Intentando crear atributo "items" (verificando tamaño)...');
        // Si items existe, no se puede modificar el tamaño fácilmente, pero intentaremos crear si no existe
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'items', 50000, true);
        console.log('✅ Atributo "items" creado correctamente');
    } catch (error: any) {
        console.log(`⚠️ Reporte creación "items": ${error.message}`);
    }

    console.log('🏁 Reparación finalizada');
}

fixAttributes();
