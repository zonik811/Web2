import { Databases, Permission, Role } from 'node-appwrite';

export async function createMovimientosInventario(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Movimientos Inventario');

    const collection = await databases.createCollection(
        databaseId,
        'movimientos_inventario',
        'Movimientos Inventario',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'productoId', 100, true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'tipo', ['entrada', 'salida', 'ajuste'], true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'cantidad', true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'stockAnterior', true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'stockNuevo', true);
    await databases.createStringAttribute(databaseId, collection.$id, 'motivo', 200, true); // 'venta', 'compra', 'devolución', etc.
    await databases.createStringAttribute(databaseId, collection.$id, 'referenciaId', 100, false); // ID de orden/compra relacionada
    await databases.createStringAttribute(databaseId, collection.$id, 'notas', 1000, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'creadoPor', 100, true); // User ID
    await databases.createStringAttribute(databaseId, collection.$id, 'fecha', 10, true);

    console.log('✅ Movimientos Inventario creada');
    return collection;
}
