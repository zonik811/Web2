"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, Models } from "node-appwrite";
import { format } from "date-fns";

// --- HELPER TYPES ---
export interface MetricItem {
    nombre: string;
    cantidad: number;
    total: number;
}

export interface AdvancedMetrics {
    ticketPromedio: number;
    topProductos: MetricItem[];
    ventasPorHora: number[]; // 24 slots
    metodosPago: MetricItem[];
    clientes: {
        nuevos: number;
        recurrentes: number; // Placeholder
        totalUnicos: number;
    };
    topIngresos: MetricItem[]; // Top 5 by Revenue
}

export interface CustomerAdvancedMetrics {
    topClientes: MetricItem[]; // Top spenders
    distribucionCiudades: MetricItem[]; // Where are they from
    ultimosRegistros: number[]; // Placeholder
    totalActivos: number; // Unique clients who bought this month
}

export interface EmployeeStatus {
    id: string;
    nombre: string;
    cargo: string;
    estado: 'PRESENTE' | 'AUSENTE' | 'TARDE' | 'VACACIONES' | 'PERMISO';
    horaEntrada?: string;
    avatar?: string;
}

export interface InventoryAdvancedMetrics {
    distribucionCategorias: MetricItem[];
    valoracion: {
        costoTotal: number;
        ventaTotal: number;
        gananciaEstimada: number;
    };
    alertasStock: {
        id: string;
        producto: string;
        sku: string;
        stock: number;
        minimo: number; // default 5 if not set
    }[];
}

export interface EmployeeAdvancedMetrics {
    asistenciaHoy: {
        presentes: number;
        ausentes: number;
        tarde: number;
        vacaciones: number;
        permisos: number;
        totalActivos: number;
    };
    topRendimiento: {
        id: string;
        nombre: string;
        cargo: string;
        cantidad: number;
        avatar?: string;
    }[];
    distribucionCargos: {
        cargo: string;
        cantidad: number;
    }[];
    estadoDetallado: EmployeeStatus[];
    horas: {
        trabajadas: number;
        programadas: number;
        extras: number;
    };
    costoDiarioEstimado: number;
    novedades: {
        vacacionesTomadas: number;
        permisosTomados: number;
        retardos: number;
    };
}

export interface DashboardStats {
    ventas: {
        totalMes: number;
        totalSemana: number;
        totalHoy: number;
        totalAyer: number;
        progresoMensual: number; // Legacy name for compatibility

        // Legacy "Desglose" (Breakdown) for compatibility with page.tsx
        desgloseMes: { pos: number; servicios: number; ordenesTrabajo: number; catalogo: number };
        desgloseSemana: { pos: number; servicios: number; ordenesTrabajo: number; catalogo: number };
        desgloseHoy: { pos: number; servicios: number; ordenesTrabajo: number; catalogo: number };
        desgloseAyer: { pos: number; servicios: number; ordenesTrabajo: number; catalogo: number };

        // Also keep "porOrigen" totals if needed by page, usually just mapped from desglose
        porOrigen: { pos: number; servicios: number; ordenesTrabajo: number; catalogo: number };

        metricsGlobal: AdvancedMetrics;
        metricsPorOrigen: {
            pos: AdvancedMetrics;
            citas: AdvancedMetrics;
            ordenesTrabajo: AdvancedMetrics;
            catalogo: AdvancedMetrics;
        };
    };
    clientes: {
        total: number;
        nuevosMes: number;
        crecimiento: number;
        activos: number;
        metrics: CustomerAdvancedMetrics;
    };
    empleados: {
        total: number;
        activos: number;
        metrics: EmployeeAdvancedMetrics;
    };
    inventario: {
        totalProductos: number;
        bajoStock: number;
        valorTotal: number;
        metrics: InventoryAdvancedMetrics;
    };
}

// --- HELPER FUNCTIONS FOR CALCULATIONS ---

function calculateEmployeeMetrics(
    empleados: any[],
    asistenciasHoy: any[],
    citasMes: any[],
    ordenesTrabajoMes: any[],
    permisosActivos: any[],
    vacacionesActivas: any[]
): EmployeeAdvancedMetrics {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Asistencia Overview
    const attendanceMap = new Map<string, any>();
    asistenciasHoy.forEach(a => {
        if (a.tipo === 'ENTRADA') attendanceMap.set(a.empleadoId, a);
    });

    const vacationSet = new Set(vacacionesActivas.map(v => v.empleadoId));
    const permissionSet = new Set(permisosActivos.map(p => p.empleadoId));

    let countPresentes = 0;
    let countTarde = 0;
    let countAusentes = 0;
    let countVacaciones = 0;
    let countPermisos = 0;

    const detailedStatus: EmployeeStatus[] = [];
    const roleMap = new Map<string, number>();

    empleados.forEach(emp => {
        // Role Breakdown
        const cargo = emp.cargo || 'Sin Asignar';
        roleMap.set(cargo, (roleMap.get(cargo) || 0) + 1);

        // Status Determination
        let status: EmployeeStatus['estado'] = 'AUSENTE';
        let checkInTime: string | undefined = undefined;

        if (vacationSet.has(emp.$id)) {
            status = 'VACACIONES';
            countVacaciones++;
        } else if (permissionSet.has(emp.$id)) {
            status = 'PERMISO';
            countPermisos++;
        } else if (attendanceMap.has(emp.$id)) {
            const entry = attendanceMap.get(emp.$id)!;
            const entryDate = new Date(entry.fechaHora);
            checkInTime = format(entryDate, 'HH:mm');

            // Late threshold (9:00 AM) - simplified
            if (entryDate.getHours() >= 9 && entryDate.getMinutes() > 0) {
                status = 'TARDE';
                countTarde++;
            } else {
                status = 'PRESENTE';
            }
            countPresentes++;
        } else {
            status = 'AUSENTE';
            countAusentes++;
        }

        detailedStatus.push({
            id: emp.$id,
            nombre: `${emp.nombre} ${emp.apellido}`,
            cargo: emp.cargo || 'N/A',
            estado: status,
            horaEntrada: checkInTime,
            avatar: emp.avatar
        });
    });

    // 2. Top Rendimiento (Citas + OTs)
    const performanceMap = new Map<string, number>();

    // Count Citas (empleadosAsignados is array of strings or objects)
    citasMes.forEach(cita => {
        if (cita.empleadosAsignados && Array.isArray(cita.empleadosAsignados)) {
            cita.empleadosAsignados.forEach((emp: any) => {
                const empId = typeof emp === 'string' ? emp : emp.$id;
                performanceMap.set(empId, (performanceMap.get(empId) || 0) + 1);
            });
        }
    });

    // Count OTs (tecnicoResponsableId or tecnicosAsignados)
    ordenesTrabajoMes.forEach(ot => {
        if (ot.tecnicoResponsableId) {
            // Assuming tecnicoResponsableId is a string or object with $id
            const empId = typeof ot.tecnicoResponsableId === 'string' ? ot.tecnicoResponsableId : ot.tecnicoResponsableId.$id;
            performanceMap.set(empId, (performanceMap.get(empId) || 0) + 1);
        }
    });

    const topPerformers = Array.from(performanceMap.entries())
        .map(([id, count]) => {
            const emp = empleados.find(e => e.$id === id);
            return {
                id,
                nombre: emp ? `${emp.nombre} ${emp.apellido}` : 'Desconocido',
                cargo: emp?.cargo || 'N/A',
                cantidad: count,
                avatar: emp?.avatar
            };
        })
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

    // 3. Distribucion Cargos
    const distribucionCargos = Array.from(roleMap.entries()).map(([cargo, cantidad]) => ({
        cargo,
        cantidad
    }));

    // 4. Totals Calculation (Placeholders for now for hours)
    // Assuming 8 hours per active employee not on leave
    // Cost Calculation: Sum(tarifaPorHora) * 8
    let estimatedDailyCost = 0;
    empleados.forEach(emp => {
        if (!vacationSet.has(emp.$id) && !permissionSet.has(emp.$id)) {
            const hourlyRate = emp.tarifaPorHora || 0;
            estimatedDailyCost += (hourlyRate * 8);
        }
    });

    const scheduledHours = (empleados.length - countVacaciones - countPermisos) * 8;

    return {
        asistenciaHoy: {
            presentes: countPresentes, // Includes Tarde
            ausentes: countAusentes,
            tarde: countTarde,
            vacaciones: countVacaciones,
            permisos: countPermisos,
            totalActivos: empleados.length
        },
        topRendimiento: topPerformers,
        distribucionCargos,
        estadoDetallado: detailedStatus,
        horas: {
            trabajadas: 0, // Requires detailed log analysis
            programadas: scheduledHours,
            extras: 0
        },
        costoDiarioEstimado: estimatedDailyCost,
        novedades: {
            vacacionesTomadas: countVacaciones, // Placeholder: active today
            permisosTomados: countPermisos, // Placeholder: active today
            retardos: countTarde // Today
        }
    };
}


function calculateCustomerMetrics(allDocs: any[], nuevosMes: number, clientCityMap?: Map<string, string>): CustomerAdvancedMetrics {
    // 1. Top Clientes (Spenders)
    const clientMap = new Map<string, { total: number, nombre: string }>();
    const activeClientsSet = new Set<string>();

    allDocs.forEach(doc => {
        // Extract Cliente Name and ID
        let id = '';
        let nombre = 'Cliente Ocasional';

        if (doc.cliente && doc.cliente.$id) {
            id = doc.cliente.$id;
            nombre = doc.cliente.nombre || doc.clienteNombre || 'Sin Nombre';
        } else if (doc.clienteNombre) {
            // Fallback for POS if relation not expanded or simple record
            id = doc.clienteId || 'unknown';
            nombre = doc.clienteNombre;
        }

        if (id && id !== 'unknown') {
            activeClientsSet.add(id);
            const val = clientMap.get(id) || { total: 0, nombre };

            // Calculate document value
            let docValue = 0;
            if (doc.total) docValue = doc.total; // POS, OTs, Catalogo
            else if (doc.precioAcordado || doc.precioCliente) docValue = doc.precioAcordado || doc.precioCliente; // Citas

            val.total += (docValue || 0);
            val.nombre = nombre; // Update name just in case
            clientMap.set(id, val);
        }
    });

    const topClientes: MetricItem[] = Array.from(clientMap.values())
        .map(c => ({ nombre: c.nombre, cantidad: 1, total: c.total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);


    // 2. Distribucion Ciudades
    const ciudadMap = new Map<string, number>();
    allDocs.forEach(doc => {
        let city = 'No Registrada';

        // Priority 1: Check the fetched map (Verified Client Data)
        let clientId = '';
        if (doc.cliente && doc.cliente.$id) clientId = doc.cliente.$id;
        else if (doc.clienteId) clientId = doc.clienteId;

        if (clientId && clientCityMap && clientCityMap.has(clientId)) {
            city = clientCityMap.get(clientId) || 'No Registrada';
        }
        // Priority 2: Check relation if available
        else if (doc.cliente && doc.cliente.ciudad) {
            city = doc.cliente.ciudad;
        }

        // Normalize
        city = city.trim();
        if (!city || city === 'N/A' || city === 'null') city = 'No Registrada';

        const current = ciudadMap.get(city) || 0;
        ciudadMap.set(city, current + 1);
    });

    const distribucionCiudades: MetricItem[] = Array.from(ciudadMap.entries())
        .map(([nombre, cantidad]) => ({ nombre, cantidad, total: 0 }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

    return {
        topClientes,
        distribucionCiudades,
        ultimosRegistros: [],
        totalActivos: activeClientsSet.size
    };
}


function calculateAdvancedMetrics(documents: any[], type: 'pos' | 'citas' | 'ots' | 'catalogo'): AdvancedMetrics {
    const totalRevenue = documents.reduce((sum, doc) => {
        if (type === 'pos' || type === 'catalogo') return sum + (doc.total || 0);
        if (type === 'citas') return sum + (doc.precioAcordado || doc.precioCliente || 0);
        if (type === 'ots') return sum + (doc.total || 0);
        return sum;
    }, 0);

    const ticketPromedio = documents.length > 0 ? totalRevenue / documents.length : 0;

    // Let's re-loop to do it cleanly for Count.
    const ventasPorHoraCount = new Array(24).fill(0);
    documents.forEach(doc => {
        const dateStr = doc.$createdAt; // Always use creation time for "When did it happen"
        if (dateStr) {
            const date = new Date(dateStr);
            let h = date.getUTCHours() - 5;
            if (h < 0) h += 24;
            ventasPorHoraCount[h]++;
        }
    });


    // Metodos de Pago
    const metodosMap = new Map<string, number>();
    documents.forEach(doc => {
        // POS: metodoPago (Array or String)
        // Citas: often no specific field in standard layout, maybe 'metodoPago'?
        // OTs: often 'metodoPago'
        // Catalogo: 'metodoPago'
        let methods: string[] = [];
        if (Array.isArray(doc.metodoPago)) methods = doc.metodoPago;
        else if (doc.metodoPago) methods = [doc.metodoPago];
        else methods = ['Otros']; // Default

        methods.forEach(m => {
            const current = metodosMap.get(m) || 0;
            metodosMap.set(m, current + 1);
        });
    });
    const metodosPago: MetricItem[] = Array.from(metodosMap.entries()).map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
        total: 0 // We aren't summing total $ per method yet, just frequency
    })).sort((a, b) => b.cantidad - a.cantidad);


    // Top Productos
    const prodMap = new Map<string, { count: number, revenue: number }>();
    documents.forEach(doc => {
        if (type === 'pos' && doc.items) {
            // items is a JSON string or Array? In Appwrite it's often a string attribute if not relational. 
            // But usually in this project it seems like a related collection or JSON. 
            // Let's assume it's parsed if using the SDK properly with types, but Appwrite returns JSON strings for attributes?
            // Checking: In previous tasks, `items` in POS seen as array.
            const items = Array.isArray(doc.items) ? doc.items : (typeof doc.items === 'string' ? JSON.parse(doc.items) : []);
            items.forEach((item: any) => {
                const name = item.nombre || item.producto || "Item";
                const q = Number(item.cantidad || 1);
                const t = Number(item.total || 0);
                const curr = prodMap.get(name) || { count: 0, revenue: 0 };
                prodMap.set(name, { count: curr.count + q, revenue: curr.revenue + t });
            });
        }
        else if (type === 'catalogo' && doc.items) {
            const items = Array.isArray(doc.items) ? doc.items : [];
            items.forEach((item: any) => {
                const name = item.productoNombre || item.nombre || "Producto Web";
                const q = Number(item.cantidad || 1);
                const t = Number(item.precio || 0) * q;
                const curr = prodMap.get(name) || { count: 0, revenue: 0 };
                prodMap.set(name, { count: curr.count + q, revenue: curr.revenue + t });
            });
        }
        else if (type === 'citas') {
            // Group by Service Name
            const name = doc.servicioNombre || doc.motivo || "Servicio";
            const t = doc.precioAcordado || doc.precioCliente || 0;
            const curr = prodMap.get(name) || { count: 0, revenue: 0 };
            prodMap.set(name, { count: curr.count + 1, revenue: curr.revenue + t });
        }
        else if (type === 'ots') {
            const name = doc.dispositivoModelo || doc.tipoDispositivo || "Reparación";
            const t = doc.total || 0;
            const curr = prodMap.get(name) || { count: 0, revenue: 0 };
            prodMap.set(name, { count: curr.count + 1, revenue: curr.revenue + t });
        }
    });

    const topProductos: MetricItem[] = Array.from(prodMap.entries())
        .map(([nombre, val]) => ({ nombre, cantidad: val.count, total: val.revenue }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);


    // Top Ingresos (Revenue)
    const revenueMap = new Map<string, number>();
    documents.forEach(doc => {
        if (type === 'pos' && doc.items) {
            const items = Array.isArray(doc.items) ? doc.items : (typeof doc.items === 'string' ? JSON.parse(doc.items) : []);
            items.forEach((item: any) => {
                const name = item.nombre || item.producto || "Item";
                const t = Number(item.total || 0);
                const curr = revenueMap.get(name) || 0;
                revenueMap.set(name, curr + t);
            });
        }
        else if (type === 'citas') {
            const name = doc.servicioNombre || doc.motivo || "Servicio";
            const t = doc.precioAcordado || doc.precioCliente || 0;
            const curr = revenueMap.get(name) || 0;
            revenueMap.set(name, curr + t);
        }
        else if (type === 'ots') {
            // Maybe group by type of repair or keep simple
            const name = "Mano de Obra / Repuestos"; // OTs usually split, but for high level:
            const t = doc.total || 0;
            const curr = revenueMap.get(name) || 0;
            revenueMap.set(name, curr + t);
        }
    });

    const topIngresos: MetricItem[] = Array.from(revenueMap.entries())
        .map(([nombre, total]) => ({ nombre, cantidad: 1, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);


    // Clientes
    const uniqueClients = new Set();
    documents.forEach(doc => {
        if (doc.clienteId) uniqueClients.add(doc.clienteId);
        else if (doc.cliente) uniqueClients.add(doc.cliente);
    });

    return {
        ticketPromedio,
        topProductos,
        ventasPorHora: ventasPorHoraCount,
        metodosPago,
        clientes: {
            totalUnicos: uniqueClients.size,
            nuevos: 0, // Placeholder, difficult to know if "new" from transaction alone without Client creation date check
            recurrentes: 0
        },
        topIngresos
    };
}


export async function obtenerEstadisticasDashboard(): Promise<DashboardStats> {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).toISOString();

        const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const startYesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString();
        const endYesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59).toISOString();



        // Helper to get YYYY-MM-DD string (UTC to match creation logic)
        const getISODateStr = (date: Date) => date.toISOString().split('T')[0];

        // Date Strings for POS (ORDENES uses simple string date)
        const todayStr = getISODateStr(new Date());
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = getISODateStr(yesterdayDate);

        const startOfMonthStr = getISODateStr(new Date(today.getFullYear(), today.getMonth(), 1));
        const startOfLastMonthStr = getISODateStr(new Date(today.getFullYear(), today.getMonth() - 1, 1));
        const endOfLastMonthStr = getISODateStr(new Date(today.getFullYear(), today.getMonth(), 0));


        // --- VENTAS (POS + SERVICIOS + CITAS + CATALOGO) ---
        // 1. Fetch POS Orders (Corrected: using simple date string matching)
        const [ventasMes, ventasMesAnterior, ventasHoy, ventasAyer] = await Promise.all([
            databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES, [
                Query.greaterThanEqual("fechaOrden", startOfMonthStr),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES, [
                Query.greaterThanEqual("fechaOrden", startOfLastMonthStr),
                Query.lessThanEqual("fechaOrden", endOfLastMonthStr),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES, [
                Query.equal("fechaOrden", todayStr),
                Query.limit(1000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES, [
                Query.equal("fechaOrden", yesterdayStr),
                Query.limit(1000)
            ]),
        ]);

        // 2. Fetch Work Orders (Ordenes Trabajo)
        // Statuses: COMPLETADA, POR_PAGAR (Revenue generated)
        const [ordenesTrabajoMes, ordenesTrabajoMesAnterior, ordenesTrabajoHoy, ordenesTrabajoAyer] = await Promise.all([
            databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES_TRABAJO, [
                Query.greaterThanEqual("$createdAt", startOfMonth),
                Query.equal("estado", ["COMPLETADA", "POR_PAGAR"]),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES_TRABAJO, [
                Query.greaterThanEqual("$createdAt", startOfLastMonth),
                Query.lessThanEqual("$createdAt", endOfLastMonth),
                Query.equal("estado", ["COMPLETADA", "POR_PAGAR"]),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES_TRABAJO, [
                Query.greaterThanEqual("$createdAt", startToday),
                Query.equal("estado", ["COMPLETADA", "POR_PAGAR"]),
                Query.limit(1000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES_TRABAJO, [
                Query.greaterThanEqual("$createdAt", startYesterday),
                Query.lessThanEqual("$createdAt", endYesterday),
                Query.equal("estado", ["COMPLETADA", "POR_PAGAR"]),
                Query.limit(1000)
            ]),
        ]);

        // 3. Fetch Citas (Appointments)
        // Status: COMPLETADA
        const [citasMes, citasMesAnterior, citasHoy, citasAyer] = await Promise.all([
            databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, [
                Query.greaterThanEqual("fechaCita", startOfMonth),
                Query.equal("estado", "completada"),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, [
                Query.greaterThanEqual("fechaCita", startOfLastMonth),
                Query.lessThanEqual("fechaCita", endOfLastMonth),
                Query.equal("estado", "completada"),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, [
                Query.greaterThanEqual("fechaCita", startToday),
                Query.equal("estado", "completada"),
                Query.limit(1000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, [
                Query.greaterThanEqual("fechaCita", startYesterday),
                Query.lessThanEqual("fechaCita", endYesterday),
                Query.equal("estado", "completada"),
                Query.limit(1000)
            ]),
        ]);

        // 4. Fetch Catalog Orders (Pedidos Catalogo)
        // Status: All except 'cancelado' (as per module logic)
        const [catalogoMes, catalogoMesAnterior, catalogoHoy, catalogoAyer] = await Promise.all([
            databases.listDocuments(DATABASE_ID, COLLECTIONS.PEDIDOS_CATALOGO, [
                Query.greaterThanEqual("$createdAt", startOfMonth),
                Query.notEqual("estado", "cancelado"),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.PEDIDOS_CATALOGO, [
                Query.greaterThanEqual("$createdAt", startOfLastMonth),
                Query.lessThanEqual("$createdAt", endOfLastMonth),
                Query.notEqual("estado", "cancelado"),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.PEDIDOS_CATALOGO, [
                Query.greaterThanEqual("$createdAt", startToday),
                Query.notEqual("estado", "cancelado"),
                Query.limit(1000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.PEDIDOS_CATALOGO, [
                Query.greaterThanEqual("$createdAt", startYesterday),
                Query.lessThanEqual("$createdAt", endYesterday),
                Query.notEqual("estado", "cancelado"),
                Query.limit(1000)
            ]),
        ]);

        // 5. Fetch Weekly Sales (Start of Week - Monday)
        const getStartOfWeek = (date: Date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            return new Date(d.setDate(diff));
        };
        const startOfWeek = getStartOfWeek(new Date());
        // Set to beginning of the day in UTC context (simple approximation matching other logic)
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfWeekStr = getISODateStr(startOfWeek);
        const startOfWeekISO = startOfWeek.toISOString();

        const [ventasSemana, ordenesTrabajoSemana, citasSemana, catalogoSemana] = await Promise.all([
            databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES, [
                Query.greaterThanEqual("fechaOrden", startOfWeekStr),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES_TRABAJO, [
                Query.greaterThanEqual("$createdAt", startOfWeekISO),
                Query.equal("estado", ["COMPLETADA", "POR_PAGAR"]),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, [
                Query.greaterThanEqual("fechaCita", startOfWeekISO),
                Query.equal("estado", "completada"),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.PEDIDOS_CATALOGO, [
                Query.greaterThanEqual("$createdAt", startOfWeekISO),
                Query.notEqual("estado", "cancelado"),
                Query.limit(5000)
            ]),
        ]);


        // Helper to sum Work Orders
        const sumOrdenesTrabajo = (docs: any[]) => docs.reduce((sum, doc) => sum + (doc.total || 0), 0);
        // Helper to sum Citas
        const sumCitas = (docs: any[]) => docs.reduce((sum, doc) => sum + (doc.precioAcordado || doc.precioCliente || 0), 0);
        // Helper to sum Catalog
        const sumCatalogo = (docs: any[]) => docs.reduce((sum, doc) => sum + (doc.total || 0), 0);

        // Calculate Totals
        const totalPosMes = ventasMes.documents.reduce((sum, doc: any) => sum + (doc.total || 0), 0);
        const totalPosMesAnterior = ventasMesAnterior.documents.reduce((sum, doc: any) => sum + (doc.total || 0), 0);

        // Revenue Streams
        const totalOrdenesTrabajoMes = sumOrdenesTrabajo(ordenesTrabajoMes.documents);
        const totalOrdenesTrabajoMesAnterior = sumOrdenesTrabajo(ordenesTrabajoMesAnterior.documents);

        const totalCitasMes = sumCitas(citasMes.documents);
        const totalCitasMesAnterior = sumCitas(citasMesAnterior.documents);

        const totalCatalogoMes = sumCatalogo(catalogoMes.documents);
        const totalCatalogoMesAnterior = sumCatalogo(catalogoMesAnterior.documents);

        const totalVentasMes = totalPosMes + totalOrdenesTrabajoMes + totalCitasMes + totalCatalogoMes;
        const totalVentasMesAnterior = totalPosMesAnterior + totalOrdenesTrabajoMesAnterior + totalCitasMesAnterior + totalCatalogoMesAnterior;

        // Desglose Hoy
        const sumPosHoy = ventasHoy.documents.reduce((sum, doc: any) => sum + (doc.total || 0), 0);
        const sumServiciosHoy = sumCitas(citasHoy.documents);
        const sumOTsHoy = sumOrdenesTrabajo(ordenesTrabajoHoy.documents);
        const sumCatalogoHoy = sumCatalogo(catalogoHoy.documents);

        const totalVentasHoy = sumPosHoy + sumServiciosHoy + sumOTsHoy + sumCatalogoHoy;

        // Desglose Ayer
        const sumPosAyer = ventasAyer.documents.reduce((sum, doc: any) => sum + (doc.total || 0), 0);
        const sumServiciosAyer = sumCitas(citasAyer.documents);
        const sumOTsAyer = sumOrdenesTrabajo(ordenesTrabajoAyer.documents);
        const sumCatalogoAyer = sumCatalogo(catalogoAyer.documents);

        const totalVentasAyer = sumPosAyer + sumServiciosAyer + sumOTsAyer + sumCatalogoAyer;




        // Desglose Semana
        const sumPosSemana = ventasSemana.documents.reduce((sum, doc: any) => sum + (doc.total || 0), 0);
        const sumServiciosSemana = sumCitas(citasSemana.documents);
        const sumOTsSemana = sumOrdenesTrabajo(ordenesTrabajoSemana.documents);
        const sumCatalogoSemana = sumCatalogo(catalogoSemana.documents);

        const totalVentasSemana = sumPosSemana + sumServiciosSemana + sumOTsSemana + sumCatalogoSemana;


        // Desglose por origen (Mes Actual)
        let pos = totalPosMes;
        let servicios = totalCitasMes;
        let ordenesTrabajo = totalOrdenesTrabajoMes;
        let catalogo = totalCatalogoMes;

        // Removing legacy logic that subtracted 'catalogo' from POS since they are now separate collections entirely.
        // If POS still incorrectly contains catalog orders with 'origen: catalogo', we might want to filter them out of POS query specifically,
        // but assuming clean separation for now based on 'pedidos_catalogo' collection usage.


        let progresoMensual = 0;
        if (totalVentasMesAnterior > 0) {
            progresoMensual = ((totalVentasMes - totalVentasMesAnterior) / totalVentasMesAnterior) * 100;
        }


        // --- CLIENTES ---
        const [clientesTotal, clientesNuevos] = await Promise.all([
            databases.listDocuments(DATABASE_ID, COLLECTIONS.CLIENTES, [
                Query.limit(1)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.CLIENTES, [
                Query.greaterThanEqual("$createdAt", startOfMonth),
                Query.limit(1)
            ])
        ]);

        // --- EMPLEADOS ---
        // --- EMPLEADOS ---
        const [empleadosRes, asistenciaHoyRes, permisosRes, vacacionesRes] = await Promise.all([
            databases.listDocuments(DATABASE_ID, COLLECTIONS.EMPLEADOS, [
                Query.equal("activo", true),
                Query.limit(100)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.ASISTENCIAS, [
                Query.greaterThanEqual("fechaHora", startToday),
                Query.limit(500)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.PERMISOS, [
                Query.equal("estado", "APROBADO"),
                Query.greaterThanEqual("fechaFin", startToday), // Only active permissions
                Query.limit(100)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.VACACIONES, [
                Query.equal("estado", "APROBADO"),
                Query.greaterThanEqual("fechaFin", startToday), // Only active vacations
                Query.limit(100)
            ])
        ]);

        // --- INVENTARIO ---
        const productos = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTOS, [
            Query.limit(1000)
        ]);

        let bajoStock = 0;
        let valorInventarioCosto = 0;
        let valorInventarioVenta = 0;

        const categoryMap = new Map<string, number>();
        const alertasStock: any[] = [];

        productos.documents.forEach((p: any) => {
            const stock = p.stock || 0;
            const costo = p.precio_compra || p.precio || 0;
            const precioVenta = p.precio || 0;
            const minStock = p.min_stock || 5;
            const categoria = p.categoria || 'Sin Categoría';

            // Valuation
            valorInventarioCosto += (stock * costo);
            valorInventarioVenta += (stock * precioVenta);

            // Low Stock
            if (stock < minStock) {
                bajoStock++;
                alertasStock.push({
                    id: p.$id,
                    producto: p.nombre,
                    sku: p.sku || 'N/A',
                    stock: stock,
                    minimo: minStock
                });
            }

            // Category Distribution
            categoryMap.set(categoria, (categoryMap.get(categoria) || 0) + 1);
        });

        const distribucionCategorias = Array.from(categoryMap.entries())
            .map(([nombre, cantidad]) => ({ nombre, cantidad, total: 0 }))
            .sort((a, b) => b.cantidad - a.cantidad);

        const metricsInventario: InventoryAdvancedMetrics = {
            distribucionCategorias,
            valoracion: {
                costoTotal: valorInventarioCosto,
                ventaTotal: valorInventarioVenta,
                gananciaEstimada: valorInventarioVenta - valorInventarioCosto
            },
            alertasStock: alertasStock.slice(0, 10) // Top 10 alerts
        };


        // --- ADVANCED METRICS CALCULATION (Using Month Data) ---
        const posMetrics = calculateAdvancedMetrics(ventasMes.documents, 'pos');
        const citasMetrics = calculateAdvancedMetrics(citasMes.documents, 'citas');
        const otsMetrics = calculateAdvancedMetrics(ordenesTrabajoMes.documents, 'ots');
        const catalogoMetrics = calculateAdvancedMetrics(catalogoMes.documents, 'catalogo');

        // Aggregate Global Metrics
        const globalHeatmap = new Array(24).fill(0);
        for (let i = 0; i < 24; i++) {
            globalHeatmap[i] = posMetrics.ventasPorHora[i] + citasMetrics.ventasPorHora[i] + otsMetrics.ventasPorHora[i] + catalogoMetrics.ventasPorHora[i];
        }

        // Aggregate Global Top Products (Merge and Sort)
        const globalProdMap = new Map<string, { count: number, revenue: number }>();
        const mergeProds = (items: MetricItem[]) => {
            items.forEach(i => {
                const curr = globalProdMap.get(i.nombre) || { count: 0, revenue: 0 };
                globalProdMap.set(i.nombre, { count: curr.count + i.cantidad, revenue: curr.revenue + i.total });
            });
        };
        mergeProds(posMetrics.topProductos);
        mergeProds(citasMetrics.topProductos);
        mergeProds(otsMetrics.topProductos);
        mergeProds(catalogoMetrics.topProductos);
        const globalTopProducts = Array.from(globalProdMap.entries())
            .map(([nombre, val]) => ({ nombre, cantidad: val.count, total: val.revenue }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5);

        // Aggregate Global Top Revenue (Merge and Sort)
        const globalRevenueMap = new Map<string, number>();
        const mergeRevenue = (items: MetricItem[]) => {
            items.forEach(i => {
                const curr = globalRevenueMap.get(i.nombre) || 0;
                globalRevenueMap.set(i.nombre, curr + i.total);
            });
        };
        mergeRevenue(posMetrics.topIngresos || []);
        mergeRevenue(citasMetrics.topIngresos || []);
        mergeRevenue(otsMetrics.topIngresos || []);
        // mergeRevenue(catalogoMetrics.topIngresos || []);

        const globalTopIngresos = Array.from(globalRevenueMap.entries())
            .map(([nombre, total]) => ({ nombre, cantidad: 1, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);


        // Aggregate Payment Methods
        const globalMethodsMap = new Map<string, number>();
        const mergeMethods = (items: MetricItem[]) => {
            items.forEach(i => {
                const curr = globalMethodsMap.get(i.nombre) || 0;
                globalMethodsMap.set(i.nombre, curr + i.cantidad);
            });
        };
        mergeMethods(posMetrics.metodosPago);
        mergeMethods(citasMetrics.metodosPago);
        mergeMethods(otsMetrics.metodosPago);
        mergeMethods(catalogoMetrics.metodosPago);
        const globalMethods = Array.from(globalMethodsMap.entries())
            .map(([nombre, cantidad]) => ({ nombre, cantidad, total: 0 }))
            .sort((a, b) => b.cantidad - a.cantidad);

        // Aggregate Clients
        const globalUniqueClients = posMetrics.clientes.totalUnicos + citasMetrics.clientes.totalUnicos + otsMetrics.clientes.totalUnicos + catalogoMetrics.clientes.totalUnicos;


        // --- CUSTOMER ADVANCED METRICS ---
        const allSalesDocs = [
            ...ventasMes.documents,
            ...citasMes.documents,
            ...ordenesTrabajoMes.documents,
            ...catalogoMes.documents
        ];

        // Fix: Fetch actual client profiles to get City data if missing in relation
        const uniqueClientIds = [...new Set(allSalesDocs.map(d => {
            if (d.cliente && d.cliente.$id) return d.cliente.$id;
            if (d.clienteId) return d.clienteId;
            return null;
        }).filter(Boolean))] as string[];

        // Fetch clients in batches
        const clientCityMap = new Map<string, string>();
        if (uniqueClientIds.length > 0) {
            const chunkSize = 100;
            for (let i = 0; i < uniqueClientIds.length; i += chunkSize) {
                const batch = uniqueClientIds.slice(i, i + chunkSize);
                try {
                    const clientsRes = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.CLIENTES,
                        [Query.equal('$id', batch)]
                    );
                    clientsRes.documents.forEach((c: any) => {
                        if (c.ciudad) clientCityMap.set(c.$id, c.ciudad);
                    });
                } catch (e) {
                    console.error("Error fetching client details for metrics:", e);
                }
            }
        }

        const metricsClientes = calculateCustomerMetrics(allSalesDocs, clientesNuevos.total, clientCityMap);

        // --- EMPLOYEE METRICS ---
        const metricsEmpleados = calculateEmployeeMetrics(
            empleadosRes.documents,
            asistenciaHoyRes.documents,
            citasMes.documents,
            ordenesTrabajoMes.documents,
            permisosRes.documents,
            vacacionesRes.documents
        );


        const metricsGlobal: AdvancedMetrics = {
            ticketPromedio: totalVentasMes / (ventasMes.documents.length + citasMes.documents.length + ordenesTrabajoMes.documents.length + catalogoMes.documents.length || 1),
            topProductos: globalTopProducts,
            ventasPorHora: globalHeatmap,
            metodosPago: globalMethods,
            clientes: {
                totalUnicos: globalUniqueClients,
                nuevos: clientesNuevos.total,
                recurrentes: 0
            },
            topIngresos: globalTopIngresos
        };


        return {
            ventas: {
                totalMes: totalVentasMes,
                totalSemana: totalVentasSemana,
                totalAyer: totalVentasAyer,
                totalHoy: totalVentasHoy,
                progresoMensual: parseFloat(progresoMensual.toFixed(1)),
                porOrigen: {
                    pos,
                    servicios,
                    ordenesTrabajo,
                    catalogo
                },
                desgloseMes: {
                    pos: totalPosMes,
                    servicios: totalCitasMes,
                    ordenesTrabajo: totalOrdenesTrabajoMes,
                    catalogo: totalCatalogoMes
                },
                desgloseSemana: {
                    pos: sumPosSemana,
                    servicios: sumServiciosSemana,
                    ordenesTrabajo: sumOTsSemana,
                    catalogo: sumCatalogoSemana
                },
                desgloseHoy: {
                    pos: sumPosHoy,
                    servicios: sumServiciosHoy,
                    ordenesTrabajo: sumOTsHoy,
                    catalogo: sumCatalogoHoy
                },
                desgloseAyer: {
                    pos: sumPosAyer,
                    servicios: sumServiciosAyer,
                    ordenesTrabajo: sumOTsAyer,
                    catalogo: sumCatalogoAyer
                },
                metricsGlobal,
                metricsPorOrigen: {
                    pos: posMetrics,
                    citas: citasMetrics, // Corrected from 'servicios' to 'citas'
                    ordenesTrabajo: otsMetrics,
                    catalogo: catalogoMetrics
                }
            },
            clientes: {
                total: clientesTotal.total,
                nuevosMes: clientesNuevos.total,
                crecimiento: 0, // Placeholder
                activos: metricsClientes.totalActivos,
                metrics: metricsClientes
            },
            empleados: {
                activos: empleadosRes.total, // Usually just 'activos' count
                total: empleadosRes.total,
                metrics: metricsEmpleados
            },
            inventario: {
                totalProductos: productos.total,
                bajoStock,
                valorTotal: valorInventarioCosto,
                metrics: metricsInventario
            }
        };

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Return fallback matching structure
        const emptyMetrics = {
            ticketPromedio: 0,
            topProductos: [],
            ventasPorHora: Array(24).fill(0),
            metodosPago: [],
            clientes: { totalUnicos: 0, nuevos: 0, recurrentes: 0 },
            topIngresos: []
        };
        const emptyCustomerMetrics = { topClientes: [], distribucionCiudades: [], ultimosRegistros: [], totalActivos: 0 };
        const emptyEmployeeMetrics: EmployeeAdvancedMetrics = {
            asistenciaHoy: { presentes: 0, ausentes: 0, tarde: 0, vacaciones: 0, permisos: 0, totalActivos: 0 },
            topRendimiento: [],
            distribucionCargos: [],
            estadoDetallado: [],
            horas: { trabajadas: 0, programadas: 0, extras: 0 },
            costoDiarioEstimado: 0,
            novedades: { vacacionesTomadas: 0, permisosTomados: 0, retardos: 0 }
        };

        return {
            ventas: {
                totalMes: 0,
                totalSemana: 0,
                totalAyer: 0,
                totalHoy: 0,
                progresoMensual: 0,
                porOrigen: { pos: 0, servicios: 0, ordenesTrabajo: 0, catalogo: 0 },
                desgloseMes: { pos: 0, servicios: 0, ordenesTrabajo: 0, catalogo: 0 },
                desgloseSemana: { pos: 0, servicios: 0, ordenesTrabajo: 0, catalogo: 0 },
                desgloseHoy: { pos: 0, servicios: 0, ordenesTrabajo: 0, catalogo: 0 },
                desgloseAyer: { pos: 0, servicios: 0, ordenesTrabajo: 0, catalogo: 0 },
                metricsGlobal: emptyMetrics,
                metricsPorOrigen: { pos: emptyMetrics, citas: emptyMetrics, ordenesTrabajo: emptyMetrics, catalogo: emptyMetrics }
            },
            clientes: {
                total: 0,
                nuevosMes: 0,
                crecimiento: 0,
                activos: 0,
                metrics: emptyCustomerMetrics
            },
            empleados: { activos: 0, total: 0, metrics: emptyEmployeeMetrics },
            inventario: {
                totalProductos: 0,
                bajoStock: 0,
                valorTotal: 0,
                metrics: {
                    distribucionCategorias: [],
                    valoracion: { costoTotal: 0, ventaTotal: 0, gananciaEstimada: 0 },
                    alertasStock: []
                }
            }
        };
    }
}
