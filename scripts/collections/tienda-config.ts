import { ID, Permission, Role, Databases } from 'node-appwrite';

const COLLECTION_ID = 'tienda_config';

export async function createTiendaConfigCollection(databases: Databases, databaseId: string) {
    try {
        console.log('📦 Creando colección: Configuración de Tienda...');

        await databases.createCollection(
            databaseId,
            COLLECTION_ID,
            'Configuración de Tienda',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        await new Promise(resolve => setTimeout(resolve, 500));

        // Información del Negocio
        await databases.createStringAttribute(databaseId, COLLECTION_ID, 'nombre_negocio', 100, true);
        await databases.createStringAttribute(databaseId, COLLECTION_ID, 'descripcion', 500, false);
        await databases.createStringAttribute(databaseId, COLLECTION_ID, 'whatsapp', 20, true);
        await databases.createStringAttribute(databaseId, COLLECTION_ID, 'email', 100, true);
        await databases.createStringAttribute(databaseId, COLLECTION_ID, 'logo_url', 500, false);

        // Apariencia
        await databases.createStringAttribute(databaseId, 'tienda_config', 'color_primario', 7, true);
        await databases.createStringAttribute(databaseId, 'tienda_config', 'color_secundario', 7, true);

        // Mensajes
        await databases.createStringAttribute(databaseId, 'tienda_config', 'mensaje_bienvenida', 200, true);
        await databases.createStringAttribute(databaseId, 'tienda_config', 'mensaje_whatsapp', 1000, true);

        // Configuración de Ventas
        await databases.createBooleanAttribute(databaseId, 'tienda_config', 'mostrar_stock', true);
        await databases.createBooleanAttribute(databaseId, 'tienda_config', 'permitir_pedidos_sin_stock', true);
        await databases.createStringAttribute(databaseId, 'tienda_config', 'moneda', 3, true);
        await databases.createBooleanAttribute(databaseId, 'tienda_config', 'iva_incluido', true);
        await databases.createStringAttribute(databaseId, COLLECTION_ID, 'terminos_condiciones', 5000, false);

        // Estado
        await databases.createBooleanAttribute(databaseId, COLLECTION_ID, 'activo', true);

        console.log('✅ Colección Configuración de Tienda creada exitosamente');
        return true;
    } catch (error: any) {
        if (error.code === 409) {
            console.log('⚠️ La colección Configuración de Tienda ya existe');
            return true;
        }
        console.error('❌ Error creando colección Configuración de Tienda:', error);
        throw error;
    }
}

export async function seedTiendaConfig(databases: Databases, databaseId: string) {
    try {
        console.log('🌱 Inicializando configuración de tienda por defecto...');

        const { documents } = await databases.listDocuments(databaseId, COLLECTION_ID);

        if (documents.length > 0) {
            console.log('⚠️ Ya existe configuración de tienda');
            return;
        }

        await databases.createDocument(
            databaseId,
            COLLECTION_ID,
            ID.unique(),
            {
                nombre_negocio: 'DieselParts',
                descripcion: 'Repuestos y partes diesel de alta calidad',
                whatsapp: '573223238781',
                email: 'contacto@altioragroup.com.co',
                logo_url: '',
                color_primario: '#9333EA',
                color_secundario: '#3B82F6',
                mensaje_bienvenida: 'Catálogo Online - DieselParts',
                mensaje_whatsapp: '¡Hola! Quiero hacer el siguiente pedido:',
                mostrar_stock: true,
                permitir_pedidos_sin_stock: false,
                moneda: 'COP',
                iva_incluido: true,
                terminos_condiciones: '',
                activo: true
            }
        );

        console.log('✅ Configuración de tienda inicializada');
    } catch (error) {
        console.error('❌ Error inicializando configuración de tienda:', error);
    }
}
