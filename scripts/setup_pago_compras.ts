import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

console.log("Project:", process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
console.log("Endpoint:", process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);


const databases = new Databases(client);

// IDs
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLL_PAGO_COMPRAS = 'pago_compras'; // We will create this

async function main() {
    console.log(`Verificando colección ${COLL_PAGO_COMPRAS}...`);

    try {
        await databases.getCollection(DB_ID, COLL_PAGO_COMPRAS);
        console.log(`La colección ${COLL_PAGO_COMPRAS} ya existe.`);
    } catch (e) {
        console.log(`Creando colección ${COLL_PAGO_COMPRAS}...`);
        await databases.createCollection(
            DB_ID,
            COLL_PAGO_COMPRAS,
            COLL_PAGO_COMPRAS,
            [
                Permission.read(Role.any()),
                Permission.write(Role.any()),
            ]
        );
        console.log(`Colección creada.`);

        // Attributes
        console.log("Creando atributos...");

        // Link to purchase
        await databases.createStringAttribute(DB_ID, COLL_PAGO_COMPRAS, 'compra_id', 255, true);

        // Payment details
        await databases.createFloatAttribute(DB_ID, COLL_PAGO_COMPRAS, 'monto', true);
        await databases.createDatetimeAttribute(DB_ID, COLL_PAGO_COMPRAS, 'fecha_pago', true);
        await databases.createStringAttribute(DB_ID, COLL_PAGO_COMPRAS, 'metodo_pago', 50, true); // Efectivo, Transferencia, etc.
        await databases.createStringAttribute(DB_ID, COLL_PAGO_COMPRAS, 'referencia', 255, false); // Optional ref number
        await databases.createStringAttribute(DB_ID, COLL_PAGO_COMPRAS, 'notas', 1000, false); // Optional notes

        console.log("Esperando a que los atributos estén disponibles...");
        await new Promise(r => setTimeout(r, 2000));
        console.log("Listo! Colección pago_compras configurada.");
    }
}

main().catch(console.error);
