import { Databases, Permission, Role } from 'node-appwrite';

/**
 * Colección: banco_horas
 * Registro de movimientos de tiempo (Deudas y Abonos)
 */
export async function createBancoHoras(databases: Databases, databaseId: string) {
    console.log('🏦 Creando: Banco de Horas');

    const collection = await databases.createCollection(
        databaseId,
        'banco_horas',
        'Banco de Horas',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Helper para crear atributos ignorando errores de "ya existe"
    const safeCreate = async (promise: Promise<any>) => {
        try { await promise; } catch (e) { console.log('   - Atributo ya existe o error:', (e as any).message); }
    };

    // Atributos
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'empleadoId', 100, true));
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'fecha', 30, true)); // YYYY-MM-DD

    // DEUDA, ABONO
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'tipo', 20, true));

    // RETARDO, SALIDA_ANTICIPADA, PERMISO_NO_REMUNERADO, HORA_EXTRA_CANJEADA, AJUSTE_MANUAL
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'origen', 50, true));

    await safeCreate(databases.createIntegerAttribute(databaseId, collection.$id, 'cantidadMinutos', true)); // Siempre positivo

    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'asistenciaId', 100, false));
    await safeCreate(databases.createStringAttribute(databaseId, collection.$id, 'notas', 500, false));

    // Snapshot del saldo en ese momento (opcional)
    await safeCreate(databases.createIntegerAttribute(databaseId, collection.$id, 'saldoAcumulado', false));

    // Índices
    await new Promise(resolve => setTimeout(resolve, 1000));
    await safeCreate(databases.createIndex(databaseId, collection.$id, 'idx_banco_empleado', 'key', ['empleadoId']));
    await safeCreate(databases.createIndex(databaseId, collection.$id, 'idx_banco_fecha', 'key', ['fecha']));

    console.log('✅ Banco de Horas creada con índices');
    return collection;
}
