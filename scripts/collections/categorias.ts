import { Databases, Permission, Role } from 'node-appwrite';

export async function createCategorias(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Categorías');

    const collection = await databases.createCollection(
        databaseId,
        'categorias',
        'Categorías',
        [Permission.read(Role.any()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'slug', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'descripcion', 500, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'icono', 50, false); // Nombre del ícono
    await databases.createStringAttribute(databaseId, collection.$id, 'imagen', 100, false); // Storage ID
    await databases.createStringAttribute(databaseId, collection.$id, 'tipo', 50, true); // 'producto' o 'servicio'
    await databases.createIntegerAttribute(databaseId, collection.$id, 'orden', false);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);

    console.log('✅ Categorías creada');
    return collection;
}
