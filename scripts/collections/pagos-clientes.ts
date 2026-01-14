import { Databases, Permission, Role } from 'node-appwrite';

export async function createPagosClientes(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Pagos Clientes');

    const collection = await databases.createCollection(
        databaseId,
        'pagos_clientes',
        'Pagos Clientes',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'citaId', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'clienteId', 100, false);
    await databases.createFloatAttribute(databaseId, collection.$id, 'monto', true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'metodoPago', ['efectivo', 'transferencia', 'nequi', 'bancolombia', 'por_cobrar'], true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaPago', 10, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'comprobante', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'notas', 5000, false);

    console.log('✅ Pagos Clientes creada');
    return collection;
}
