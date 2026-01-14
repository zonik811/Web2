import { Databases, Permission, Role } from 'node-appwrite';

export async function createDirecciones(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Direcciones');

    const collection = await databases.createCollection(
        databaseId,
        'direcciones',
        'Direcciones',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'clienteId', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'direccion', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'ciudad', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'barrio', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'coordenadas', 100, false);
    await databases.createEnumAttribute(databaseId, collection.$id, 'tipo', ['casa', 'apartamento', 'oficina', 'local'], true);

    console.log('✅ Direcciones creada');
    return collection;
}
