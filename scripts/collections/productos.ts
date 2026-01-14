import { Databases, Permission, Role } from 'node-appwrite';

export async function createProductos(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Productos');

    const collection = await databases.createCollection(
        databaseId,
        'productos',
        'Productos',
        [Permission.read(Role.any()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'descripcion', 5000, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'categoria', 100, true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'precio', true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'precioDescuento', false);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'stock', true);
    await databases.createStringAttribute(databaseId, collection.$id, 'imagenes', 5000, false, undefined, true);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'destacado', false);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);
    await databases.createStringAttribute(databaseId, collection.$id, 'sku', 50, false);

    console.log('✅ Productos creada');
    return collection;
}
