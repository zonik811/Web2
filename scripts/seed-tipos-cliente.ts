
import { Client, Databases, Query, ID } from 'node-appwrite';
import dotenv from 'dotenv';
import { COLLECTIONS } from '../src/lib/appwrite'; // Adjust path if needed, or hardcode ID if easier but try to be consistent

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function main() {
    console.log('🌱 Sembrando Tipos de Cliente...');

    const tipos = [
        { nombre: 'Residencial', descripcion: 'Hogares y particulares', activo: true },
        { nombre: 'Comercial', descripcion: 'Negocios y locales', activo: true },
        { nombre: 'Corporativo', descripcion: 'Grandes empresas', activo: true }
    ];

    for (const tipo of tipos) {
        try {
            // Check existence by name to avoid duplicates
            const existing = await databases.listDocuments(
                DATABASE_ID,
                'tipos_cliente',
                [Query.equal('nombre', tipo.nombre)]
            );

            if (existing.total > 0) {
                console.log(`⚠️ Tipo '${tipo.nombre}' ya existe.`);
            } else {
                await databases.createDocument(
                    DATABASE_ID,
                    'tipos_cliente',
                    ID.unique(),
                    tipo
                );
                console.log(`✅ Tipo '${tipo.nombre}' creado.`);
            }
        } catch (error: any) {
            console.error(`❌ Error con '${tipo.nombre}':`, error.message);
        }
    }
    console.log('🏁 Sembrado finalizado.');
}

main();
