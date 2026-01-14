import { Client, Databases, Storage, Account } from "appwrite";

// Cliente de Appwrite
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

// Servicios de Appwrite
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// IDs de recursos
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;

// Nombres de colecciones
export const COLLECTIONS = {
    EMPRESA_CONFIG: 'empresa_config',
    CONFIG_HERO: 'config_hero',
    CONFIG_BRANDING: 'config_branding',
    COMPONENT_STYLES: 'component_styles',
    CONFIG_SECTIONS: 'config_sections',
    EMPRESA_INFO: 'empresa_info',
    CLIENTES: 'clientes',
    SERVICIOS: 'servicios',
    EMPLEADOS: 'empleados',
    CITAS: 'citas',
    PRODUCTOS: 'productos',
    ORDENES: 'ordenes',
    GASTOS: 'gastos',
    CATEGORIAS: 'categorias',
    METODOS_PAGO: 'metodos_pago',
    ESTADOS: 'estados',
    PROVEEDORES: 'proveedores',
    COMPRAS: 'compras',
    MOVIMIENTOS_INVENTARIO: 'movimientos_inventario',
    NOTIFICACIONES: 'notificaciones',
    PAGOS_EMPLEADOS: 'pagos_empleados',
    PAGOS_CLIENTES: 'pagos_clientes',
    DIRECCIONES: 'direcciones',
    HISTORIAL_PUNTOS: 'historial_puntos',
    USER_PROFILE: 'user_profile',
    CARGOS: 'cargos',
    ESPECIALIDADES: 'especialidades',

    // Órdenes de Trabajo
    VEHICULOS: 'vehiculos',
    ORDENES_TRABAJO: 'ordenes_trabajo',
    OT_PROCESOS: 'ot_procesos',
    OT_ACTIVIDADES: 'ot_actividades',
    OT_REPUESTOS: 'ot_repuestos',
    OT_PRUEBAS: 'ot_pruebas',
    OT_CHECKLIST_VEHICULO: 'ot_checklist_vehiculo',
    OT_AUTORIZACIONES: 'ot_autorizaciones',
    OT_PLANTILLAS_PROCESOS: 'ot_plantillas_procesos',

    // Comisiones
    COMISIONES: 'comisiones',
    OT_SOLICITUDES_REPUESTOS: 'ot_solicitudes_repuestos',

    // Facturas y Pagos
    FACTURAS: 'facturas',

    // Alias
    MOVIMIENTOS: 'movimientos_inventario',
};

// Funciones helper para Storage

/**
 * Sube un archivo a Appwrite Storage
 */
export async function subirArchivo(file: File): Promise<string> {
    try {
        const response = await storage.createFile(
            STORAGE_BUCKET_ID,
            "unique()",
            file
        );
        return response.$id;
    } catch (error) {
        console.error("Error subiendo archivo:", error);
        throw new Error("No se pudo subir el archivo");
    }
}

/**
 * Obtiene la URL de un archivo desde Appwrite Storage
 */
export function obtenerURLArchivo(fileId: string): string {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
}

/**
 * Elimina un archivo de Appwrite Storage
 */
export async function eliminarArchivo(fileId: string): Promise<void> {
    try {
        await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
    } catch (error) {
        console.error("Error eliminando archivo:", error);
        throw new Error("No se pudo eliminar el archivo");
    }
}

export default client;
