import { Databases, Permission, Role } from 'node-appwrite';

export async function createCargos(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Cargos');

    const collection = await databases.createCollection(
        databaseId,
        'cargos',
        'Cargos',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'descripcion', 500, false);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'orden', false);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);

    console.log('✅ Cargos creada');
    return collection;
}
