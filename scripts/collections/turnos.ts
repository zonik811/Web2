import { Databases, Permission, Role } from 'node-appwrite';

/**
 * Colección: turnos
 * Catálogo de tipos de turnos (ej: Mañana, Tarde, Noche)
 */
export async function createTurnos(databases: Databases, databaseId: string) {
    console.log('🕒 Creando: Turnos');

    const collection = await databases.createCollection(
        databaseId,
        'turnos',
        'Turnos',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Atributos
    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 50, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'horaEntrada', 10, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'horaSalida', 10, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'color', 20, false); // Hex color
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true, true);

    // Índices
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createIndex(databaseId, collection.$id, 'idx_turnos_activo', 'key', ['activo']);

    console.log('✅ Turnos creada con índices');
    return collection;
}

/**
 * Colección: asignacion_turnos
 * Asignación de un turno específico a un empleado por un rango de fechas
 */
export async function createAsignacionTurnos(databases: Databases, databaseId: string) {
    console.log('📅 Creando: Asignacion Turnos');

    const collection = await databases.createCollection(
        databaseId,
        'asignacion_turnos',
        'Asignacion Turnos',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Relaciones y Fechas
    await databases.createStringAttribute(databaseId, collection.$id, 'empleadoId', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'turnoId', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaInicio', 30, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaFin', 30, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'notas', 500, false);

    // Índices
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createIndex(databaseId, collection.$id, 'idx_asignacion_empleado_fecha', 'key', ['empleadoId', 'fechaInicio']);

    console.log('✅ Asignacion Turnos creada con índices');
    return collection;
}
