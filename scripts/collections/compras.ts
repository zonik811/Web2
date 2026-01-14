import { Databases, Permission, Role } from 'node-appwrite';

export async function createCompras(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Compras');

    const collection = await databases.createCollection(
        databaseId,
        'compras',
        'Compras',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'numeroCompra', 50, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'proveedorId', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'items', 10000, true, undefined, true); // Array de JSON con productos
    await databases.createFloatAttribute(databaseId, collection.$id, 'subtotal', true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'impuestos', false, 0);
    await databases.createFloatAttribute(databaseId, collection.$id, 'total', true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'estado', ['pendiente', 'confirmada', 'recibida', 'cancelada'], true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'metodoPago', ['efectivo', 'transferencia', 'credito'], true);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'pagado', false, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaCompra', 10, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaRecepcion', 10, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'comprobante', 100, false); // Storage ID
    await databases.createStringAttribute(databaseId, collection.$id, 'notas', 2000, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'creadoPor', 100, true);

    console.log('✅ Compras creada');
    return collection;
}
