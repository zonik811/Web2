
import { Client, Databases, Permission, Role, Query } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function main() {
    console.log('🚀 Iniciando migración de Clientes...');

    // 1. Crear colección tipos_cliente
    try {
        console.log('📋 Creando colección tipos_cliente...');
        const tipCol = await databases.createCollection(
            DATABASE_ID,
            'tipos_cliente',
            'Tipos de Cliente',
            [Permission.read(Role.any()), Permission.write(Role.users())]
        );
        console.log('✅ Colección tipos_cliente creada:', tipCol.$id);

        await databases.createStringAttribute(DATABASE_ID, 'tipos_cliente', 'nombre', 100, true);
        await databases.createStringAttribute(DATABASE_ID, 'tipos_cliente', 'descripcion', 500, false);
        await databases.createBooleanAttribute(DATABASE_ID, 'tipos_cliente', 'activo', true);

        console.log('⏳ Esperando 10s para indexado de atributos tipos_cliente...');
        await new Promise(r => setTimeout(r, 10000));

        // Crear datos iniciales
        console.log('🌱 Sembrando datos iniciales...');
        try {
            await databases.createDocument(DATABASE_ID, 'tipos_cliente', 'residencial', { nombre: 'Residencial', descripcion: 'Hogares y particulares', activo: true });
            await databases.createDocument(DATABASE_ID, 'tipos_cliente', 'comercial', { nombre: 'Comercial', descripcion: 'Negocios y locales', activo: true });
            await databases.createDocument(DATABASE_ID, 'tipos_cliente', 'corporativo', { nombre: 'Corporativo', descripcion: 'Grandes empresas', activo: true });
        } catch (e: any) {
            console.log('⚠️ Error creando datos iniciales (posiblemente ya existen):', e.message);
        }

    } catch (e: any) {
        if (e.code === 409) {
            console.log('⚠️ Colección tipos_cliente ya existe o atributo duplicado.');
        } else {
            console.error('❌ Error creando tipos_cliente:', e);
        }
    }

    // 2. Migrar atributo tipoCliente en Clientes (Enum -> String)
    try {
        console.log('🔄 Migrando atributo tipoCliente en Clientes...');

        // A. Leer todos los clientes para backup en memoria
        let allClients = [];
        let cursor = null;
        do {
            const queries = [Query.limit(100)];
            if (cursor) queries.push(Query.cursorAfter(cursor));

            const response = await databases.listDocuments(DATABASE_ID, 'clientes', queries);
            allClients.push(...response.documents);

            if (response.documents.length < 100) break;
            cursor = response.documents[response.documents.length - 1].$id;
        } while (true);

        console.log(`📦 Backup temporarl de ${allClients.length} clientes realizado.`);

        // B. Intentar eliminar el atributo Enum (esto borrará los datos de esa columna)
        try {
            await databases.deleteAttribute(DATABASE_ID, 'clientes', 'tipoCliente');
            console.log('🗑️ Atributo Enum tipoCliente eliminado.');

            // Esperar a que Appwrite procese (es asíncrono)
            console.log('⏳ Esperando 15s para procesado de eliminación...');
            await new Promise(r => setTimeout(r, 15000));
        } catch (e: any) {
            console.log('⚠️ Error o ya eliminado attribute:', e.message);
        }

        // C. Crear nuevo atributo String
        try {
            await databases.createStringAttribute(DATABASE_ID, 'clientes', 'tipoCliente', 100, false); // No requerido temporalmente para evitar errores en creación
            console.log('✨ Nuevo atributo String tipoCliente creado.');

            console.log('⏳ Esperando 5s para procesado de creación...');
            await new Promise(r => setTimeout(r, 5000));
        } catch (e: any) {
            console.log('⚠️ Error creando atributo string:', e.message);
        }

        // D. Restaurar datos
        console.log('💾 Restaurando datos de tipoCliente...');
        for (const client of allClients) {
            if (client.tipoCliente) {
                try {
                    // Mapear valores antiguos si es necesario, o usar directo
                    // El enum era lowercase: 'residencial', 'comercial'
                    // Queremos que coincida con los IDs o nombres de la nueva colección? 
                    // Usemos el valor tal cual por ahora, o mapeémoslo a Title Case si preferimos
                    await databases.updateDocument(DATABASE_ID, 'clientes', client.$id, {
                        tipoCliente: client.tipoCliente // Appwrite a veces devuelve Enum values tal cual
                    });
                } catch (updateError) {
                    console.error(`❌ Error restaurando cliente ${client.$id}:`, updateError);
                }
            }
        }
        console.log('✅ Migración de datos completada.');

    } catch (e) {
        console.error('❌ Error general en migración:', e);
    }
}

main();
