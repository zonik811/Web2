import { Databases, Permission, Role } from 'node-appwrite';

export async function createMetodosPago(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Métodos de Pago');

    const collection = await databases.createCollection(
        databaseId,
        'metodos_pago',
        'Métodos de Pago',
        [Permission.read(Role.any()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'codigo', 50, true); // 'efectivo', 'transferencia', etc.
    await databases.createStringAttribute(databaseId, collection.$id, 'descripcion', 300, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'icono', 50, false); // Nombre del ícono
    await databases.createBooleanAttribute(databaseId, collection.$id, 'requiereCuenta', false); // Si requiere datos bancarios
    await databases.createStringAttribute(databaseId, collection.$id, 'cuentaBancaria', 100, false); // Número de cuenta si aplica
    await databases.createIntegerAttribute(databaseId, collection.$id, 'orden', false);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);

    console.log('✅ Métodos de Pago creada');
    return collection;
}
