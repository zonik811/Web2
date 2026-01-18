import { Databases, Permission, Role } from 'node-appwrite';

export async function createVacaciones(databases: Databases, databaseId: string) {
    console.log('🏖️ Creando: Vacaciones');

    const collection = await databases.createCollection(
        databaseId,
        'vacaciones',
        'Vacaciones',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Empleado
    await databases.createStringAttribute(databaseId, collection.$id, 'empleadoId', 100, true);

    // Datos de solicitud
    await databases.createIntegerAttribute(databaseId, collection.$id, 'anio', true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaInicio', 30, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaFin', 30, true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'diasSolicitados', true);

    // Estado y aprobación
    await databases.createStringAttribute(databaseId, collection.$id, 'estado', 20, true); // PENDIENTE, APROBADO, RECHAZADO
    await databases.createStringAttribute(databaseId, collection.$id, 'motivo', 500, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'aprobadoPor', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaAprobacion', 30, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'comentariosRechazo', 500, false);

    // Índices
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createIndex(databaseId, collection.$id, 'idx_empleadoId', 'key', ['empleadoId']);
    await databases.createIndex(databaseId, collection.$id, 'idx_año', 'key', ['año']);
    await databases.createIndex(databaseId, collection.$id, 'idx_estado', 'key', ['estado']);

    console.log('✅ Vacaciones creada con índices');
    return collection;
}

export async function createSaldoVacaciones(databases: Databases, databaseId: string) {
    console.log('💰 Creando: Saldo Vacaciones');

    const collection = await databases.createCollection(
        databaseId,
        'saldo_vacaciones',
        'Saldo Vacaciones',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Empleado
    await databases.createStringAttribute(databaseId, collection.$id, 'empleadoId', 100, true);

    // Saldo
    await databases.createIntegerAttribute(databaseId, collection.$id, 'anioActual', true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'diasTotales', true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'diasUsados', true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'diasPendientes', true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'diasDisponibles', true);

    // Índice único por empleado
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createIndex(databaseId, collection.$id, 'idx_empleadoId_unique', 'unique', ['empleadoId']);

    console.log('✅ Saldo Vacaciones creada con índices');
    return collection;
}
