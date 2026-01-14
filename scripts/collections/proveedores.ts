import { Databases, Permission, Role } from 'node-appwrite';

export async function createProveedores(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Proveedores');

    const collection = await databases.createCollection(
        databaseId,
        'proveedores',
        'Proveedores',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'nit', 50, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'telefono', 20, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'email', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'direccion', 200, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'ciudad', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'contacto', 100, false); // Nombre del contacto
    await databases.createStringAttribute(databaseId, collection.$id, 'categoria', 100, false); // 'productos_limpieza', 'equipos', etc.
    await databases.createStringAttribute(databaseId, collection.$id, 'notas', 2000, false);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);

    console.log('✅ Proveedores creada');
    return collection;
}
