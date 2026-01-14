import { Databases, Permission, Role } from 'node-appwrite';

export async function createServicios(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Servicios');

    const collection = await databases.createCollection(
        databaseId,
        'servicios',
        'Servicios',
        [Permission.read(Role.any()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'slug', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'descripcion', 5000, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'descripcionCorta', 500, false);
    await databases.createEnumAttribute(databaseId, collection.$id, 'categoria', ['residencial', 'comercial', 'especializado'], true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'precioBase', true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'unidadPrecio', ['hora', 'metrocuadrado', 'servicio'], true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'duracionEstimada', true);
    await databases.createStringAttribute(databaseId, collection.$id, 'imagen', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'caracteristicas', 5000, false, undefined, true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'requierePersonal', true);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'destacado', false);

    console.log('✅ Servicios creada');
    return collection;
}
