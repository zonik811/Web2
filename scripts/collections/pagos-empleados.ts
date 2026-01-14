import { Databases, Permission, Role } from 'node-appwrite';

export async function createPagosEmpleados(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Pagos Empleados');

    const collection = await databases.createCollection(
        databaseId,
        'pagos_empleados',
        'Pagos Empleados',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'empleadoId', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'citaId', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'periodo', 10, false);
    await databases.createEnumAttribute(databaseId, collection.$id, 'concepto', ['servicio', 'anticipo', 'pago_mensual', 'bono', 'deduccion'], true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'monto', true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaPago', 10, false);
    await databases.createEnumAttribute(databaseId, collection.$id, 'metodoPago', ['efectivo', 'transferencia', 'nequi', 'bancolombia', 'por_cobrar'], true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'estado', ['pendiente', 'pagado', 'parcial'], true);
    await databases.createStringAttribute(databaseId, collection.$id, 'comprobante', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'notas', 5000, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'creadoPor', 100, true);

    console.log('✅ Pagos Empleados creada');
    return collection;
}
