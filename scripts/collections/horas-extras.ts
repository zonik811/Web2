import { Databases, Permission, Role } from 'node-appwrite';

/**
 * Colección: horas_extras
 * Registro de horas extra trabajadas con cálculo de recargos
 */
export async function createHorasExtras(databases: Databases, databaseId: string) {
    console.log('🕒 Creando: Horas Extras');

    const collection = await databases.createCollection(
        databaseId,
        'horas_extras',
        'Horas Extras',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Helper para crear atributos ignorando errores de "ya existe"
    const safeCreate = async (promise: Promise<any>) => {
        try { await promise; } catch (e) { console.log('   - Atributo ya existe o error:', (e as any).message); }
    };

    // Atributos
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'empleadoId', 100, true));
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'asistenciaId', 100, false));
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'fecha', 30, true)); // YYYY-MM-DD
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'horaInicio', 10, true)); // HH:MM
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'horaFin', 10, true)); // HH:MM
    await safeCreate(databases.createFloatAttribute(databaseId, collection.$id, 'cantidadHoras', true));

    // Enum simulado con string, validaremos en código
    // DIURNA, NOCTURNA, DOMINICAL, FESTIVA
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'tipo', 50, true));

    await safeCreate(databases.createFloatAttribute(databaseId, collection.$id, 'multiplicador', true));
    await safeCreate(databases.createFloatAttribute(databaseId, collection.$id, 'horasEquivalentes', true));

    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'motivo', 500, false));

    // PENDIENTE, APROBADO, RECHAZADO
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'estado', 20, true, 'PENDIENTE'));

    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'aprobadoPor', 100, false));

    // Índices
    await new Promise(resolve => setTimeout(resolve, 1000));
    await safeCreate(databases.createIndex(databaseId, collection.$id, 'idx_extras_empleado', 'key', ['empleadoId']));
    await safeCreate(databases.createIndex(databaseId, collection.$id, 'idx_extras_estado', 'key', ['estado']));
    await safeCreate(databases.createIndex(databaseId, collection.$id, 'idx_extras_fecha', 'key', ['fecha']));

    console.log('✅ Horas Extras creada con índices');
    return collection;
}

/**
 * Colección: dias_festivos
 * Catálogo de días festivos para cálculo de horas extras
 */
export async function createDiasFestivos(databases: Databases, databaseId: string) {
    console.log('📅 Creando: Días Festivos');

    const collection = await databases.createCollection(
        databaseId,
        'dias_festivos',
        'Dias Festivos',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Atributos
    await databases.createStringAttribute(databaseId, collection.$id, 'fecha', 30, true); // YYYY-MM-DD
    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 100, true);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'esIrrenunciable', true, false);
    await databases.createFloatAttribute(databaseId, collection.$id, 'multiplicador', true, 1.75);

    // Índices
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createIndex(databaseId, collection.$id, 'idx_festivos_fecha', 'unique', ['fecha']);

    console.log('✅ Días Festivos creada con índices');
    return collection;
}
