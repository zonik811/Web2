import { Databases, Permission, Role } from 'node-appwrite';

/**
 * Colección: compensatorios
 * Gestión de días compensatorios ganados por trabajo en domingos/festivos
 */
export async function createCompensatorios(databases: Databases, databaseId: string) {
    console.log('🎁 Creando: Compensatorios');

    const collection = await databases.createCollection(
        databaseId,
        'compensatorios',
        'Compensatorios',
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
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'fechaGanado', 30, true)); // YYYY-MM-DD
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'motivo', 255, true));
    await safeCreate(databases.createFloatAttribute(databaseId, collection.$id, 'diasGanados', true)); // 1.0, 0.5

    // Fecha calculada (ej: 6 meses después)
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'fechaVencimiento', 30, false));

    // DISPONIBLE, USADO, VENCIDO
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'estado', 20, true, 'DISPONIBLE'));

    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'fechaUso', 30, false));
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'usadoEnPermisoId', 100, false));

    // Índices
    await new Promise(resolve => setTimeout(resolve, 1000));
    await safeCreate(databases.createIndex(databaseId, collection.$id, 'idx_comp_empleado', 'key', ['empleadoId']));
    await safeCreate(databases.createIndex(databaseId, collection.$id, 'idx_comp_estado', 'key', ['estado']));

    console.log('✅ Compensatorios creada con índices');
    return collection;
}
