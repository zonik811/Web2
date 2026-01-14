import { Databases, Permission, Role } from 'node-appwrite';

export async function createOrdenes(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Órdenes');

    const collection = await databases.createCollection(
        databaseId,
        'ordenes',
        'Órdenes',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'numeroOrden', 50, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'clienteId', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'clienteNombre', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'clienteTelefono', 20, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'clienteEmail', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'direccionEntrega', 300, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'items', 10000, true, undefined, true); // Array de JSON con productos
    await databases.createFloatAttribute(databaseId, collection.$id, 'subtotal', true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'descuento', false, 0);
    await databases.createFloatAttribute(databaseId, collection.$id, 'envio', false, 0);
    await databases.createFloatAttribute(databaseId, collection.$id, 'total', true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'estado', ['pendiente', 'confirmada', 'en_preparacion', 'enviada', 'entregada', 'cancelada'], true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'metodoPago', ['efectivo', 'transferencia', 'nequi', 'contraentrega'], true);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'pagado', false, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaOrden', 10, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaEntrega', 10, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'notas', 2000, false);

    console.log('✅ Órdenes creada');
    return collection;
}
