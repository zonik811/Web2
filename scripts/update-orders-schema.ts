
import { Client, Databases, Storage, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'pedidos_catalogo';
const BUCKET_ID = 'comprobantes_pago';

async function main() {
    console.log('🚀 Iniciando actualización de estructura para Pedidos...');

    // 1. Actualizar Schema de Pedidos
    try {
        console.log('📋 Verificando atributos de colección...');
        const { attributes } = await databases.listAttributes(DATABASE_ID, COLLECTION_ID);
        const attributeKeys = attributes.map((a: any) => a.key);

        // Nuevos atributos requeridos
        const newAttributes = [
            { key: 'comprobante_url', type: 'url', required: false },
            { key: 'guia_envio', type: 'string', size: 100, required: false },
            { key: 'empresa_envio', type: 'string', size: 100, required: false }
        ];

        for (const attr of newAttributes) {
            if (!attributeKeys.includes(attr.key)) {
                console.log(`⚡ Creando atributo '${attr.key}'...`);
                if (attr.type === 'url') {
                    await databases.createUrlAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.required);
                } else if (attr.type === 'string') {
                    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.size!, attr.required);
                }
            } else {
                console.log(`✅ Atributo '${attr.key}' ya existe.`);
            }
        }
    } catch (error) {
        console.error('❌ Error actualizando schema:', error);
    }

    // 2. Crear Bucket de Comprobantes
    try {
        console.log('📦 Verificando bucket de comprobantes...');
        try {
            await storage.getBucket(BUCKET_ID);
            console.log('✅ Bucket ya existe.');
        } catch {
            console.log('⚡ Creando bucket para comprobantes...');
            await storage.createBucket(
                BUCKET_ID,
                'Comprobantes de Pago',
                [Permission.read(Role.any()), Permission.write(Role.users())],
                false, // fileSecurity
                true, // enabled
                undefined, // maxFileSize
                ['jpg', 'jpeg', 'png', 'pdf'] // allowedFileExtensions
            );
            console.log('✅ Bucket creado correctamente.');
        }
    } catch (error) {
        console.error('❌ Error gestionando bucket:', error);
    }

    console.log('✨ Proceso finalizado.');
}

main();
