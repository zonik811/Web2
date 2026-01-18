"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    Asistencia,
    ConfiguracionAsistencia,
    RegistrarMarcacionInput,
    TipoMarcacion,
    ResumenAsistenciaDia,
    EstadoAsistencia
} from "@/types";
import { tienePermisoEnFecha } from "./permisos";
import { tieneVacacionesEnFecha } from "./vacaciones";
import { obtenerTurnoActivoEnFecha } from "./turnos";
import { registrarHorasExtras, esFestivo } from "./horas-extras";
import { generarCompensatorio } from "./compensatorios";
import { registrarMovimientoBanco } from "./banco-horas";

/**
 * Obtener configuración de asistencia
 */
export async function obtenerConfiguracionAsistencia(): Promise<ConfiguracionAsistencia> {
    try {
        const config = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.CONFIGURACION_ASISTENCIA,
            'config'
        );
        return config as unknown as ConfiguracionAsistencia;
    } catch (error) {
        console.error("Error obteniendo configuración:", error);
        // Retornar valores por defecto
        return {
            $id: 'config',
            horarioEntrada: '08:00',
            horarioSalida: '18:00',
            minutosTolerancia: 15,
            requiereJustificacion: false
        } as ConfiguracionAsistencia;
    }
}

/**
 * Registrar marcación de asistencia
 */
export async function registrarMarcacion(data: RegistrarMarcacionInput): Promise<{ success: boolean; marcacion?: Asistencia; error?: string }> {
    try {
        const config = await obtenerConfiguracionAsistencia();

        const marcacionData: any = {
            empleadoId: data.empleadoId,
            tipo: data.tipo,
            fechaHora: data.fechaHora || new Date().toISOString(),
            notas: data.notas || '',
        };

        if (data.adminId) {
            marcacionData.marcadoPorAdminId = data.adminId;
        }

        const marcacion = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.ASISTENCIAS,
            ID.unique(),
            marcacionData
        );

        // --- LÓGICA DE BANCO DE HORAS (ENTRADA - RETARDO) ---
        if (data.tipo === 'ENTRADA') {
            try {
                const fechaHora = new Date(marcacionData.fechaHora);
                const fechaStr = fechaHora.toISOString().split('T')[0];

                // Determinar hora entrada esperada
                // Prioridad: Turno > Horario Especial > Config Global
                let horaEntradaEsperadaStr = config.horarioEntrada;
                const turnoAsignado = await obtenerTurnoActivoEnFecha(data.empleadoId, fechaStr);

                if (turnoAsignado) {
                    horaEntradaEsperadaStr = turnoAsignado.horaEntrada;
                } else {
                    const horarioEspecial = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.HORARIOS_EMPLEADO,
                        [Query.equal("empleadoId", data.empleadoId), Query.equal("activo", true), Query.limit(1)]
                    );
                    if (horarioEspecial.documents.length > 0) {
                        horaEntradaEsperadaStr = (horarioEspecial.documents[0] as any).horarioEntrada;
                    }
                }

                const [hEntrada, mEntrada] = horaEntradaEsperadaStr.split(':').map(Number);
                const fechaEntradaEsperada = new Date(fechaHora);
                fechaEntradaEsperada.setHours(hEntrada, mEntrada, 0, 0);

                // Calcular retardo
                const diffMs = fechaHora.getTime() - fechaEntradaEsperada.getTime();
                const diffMinutos = Math.floor(diffMs / (1000 * 60));
                const tolerancia = config.minutosTolerancia || 15;

                if (diffMinutos > tolerancia) {
                    await registrarMovimientoBanco({
                        empleadoId: data.empleadoId,
                        fecha: fechaStr,
                        tipo: 'DEUDA',
                        origen: 'RETARDO',
                        cantidadMinutos: diffMinutos,
                        asistenciaId: marcacion.$id,
                        notas: `Retardo de entrada: ${diffMinutos} minutos (Tol: ${tolerancia})`
                    });
                }
            } catch (err) {
                console.error("Error calculando retardo banco horas:", err);
            }
        }
        // ----------------------------------------------------

        // --- LÓGICA DE HORAS EXTRAS (Solo al marcar SALIDA) ---
        if (data.tipo === 'SALIDA') {
            try {
                const fechaHora = new Date(marcacionData.fechaHora);
                const fechaStr = fechaHora.toISOString().split('T')[0]; // YYYY-MM-DD

                // 1. Determinar hora de salida esperada (Turno > Especial > Global)
                let horaSalidaEsperadaStr = config.horarioSalida;

                const turnoAsignado = await obtenerTurnoActivoEnFecha(data.empleadoId, fechaStr);

                if (turnoAsignado) {
                    horaSalidaEsperadaStr = turnoAsignado.horaSalida;
                } else {
                    const horarioEspecial = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.HORARIOS_EMPLEADO,
                        [
                            Query.equal("empleadoId", data.empleadoId),
                            Query.equal("activo", true),
                            Query.limit(1)
                        ]
                    );
                    if (horarioEspecial.documents.length > 0) {
                        horaSalidaEsperadaStr = (horarioEspecial.documents[0] as any).horarioSalida;
                    }
                }

                const [hSalida, mSalida] = horaSalidaEsperadaStr.split(':').map(Number);
                const fechaSalidaEsperada = new Date(fechaHora);
                fechaSalidaEsperada.setHours(hSalida, mSalida, 0, 0);

                // Calcular diferencia en horas
                // Si fechaSalidaEsperada es mayor a fechaHora (salió antes), diff será negativo
                const diffHoras = (fechaHora.getTime() - fechaSalidaEsperada.getTime()) / (1000 * 60 * 60);

                // Umbral: solo si excede 30 minutos (0.5h) después de la hora salida
                // O usar tolerancia de la config si se prefiere

                // --- DETECTAR DEUDA (Salida Anticipada) ---
                // Si salió ANTES de horaSalidaEsperada - tolerancia (ej: 15 min)
                const toleranciaMinutos = config.minutosTolerancia || 15;
                // diffHoras es negativo si salió antes
                const minutosDiferencia = diffHoras * 60; // ej: -60 min

                if (minutosDiferencia < -toleranciaMinutos) {
                    // SALIÓ TEMPRANO
                    const minutosDeuda = Math.abs(Math.round(minutosDiferencia));
                    try {
                        await registrarMovimientoBanco({
                            empleadoId: data.empleadoId,
                            fecha: fechaStr,
                            tipo: 'DEUDA',
                            origen: 'SALIDA_ANTICIPADA',
                            cantidadMinutos: minutosDeuda,
                            asistenciaId: marcacion.$id,
                            notas: `Salida anticipada: ${minutosDeuda} minutos`
                        });
                    } catch (e) {
                        console.error("Error registrando deuda banco horas", e);
                    }
                }
                // ------------------------------------------

                if (diffHoras >= 0.5) {
                    const horaSalidaNum = fechaHora.getHours();
                    let tipo: 'DIURNA' | 'NOCTURNA' | 'DOMINICAL' | 'FESTIVA' = 'DIURNA';
                    const diaSemana = fechaHora.getDay(); // 0 = Domingo

                    // Validar festivos
                    const esFestivoHoy = await esFestivo(fechaStr);

                    if (diaSemana === 0) {
                        tipo = 'DOMINICAL';
                        // Compensatorio por Domingo
                        try {
                            await generarCompensatorio({
                                empleadoId: data.empleadoId,
                                asistenciaId: marcacion.$id,
                                fechaGanado: fechaStr,
                                motivo: "Trabajo Dominical Automático",
                                diasGanados: 1.0
                            });
                        } catch (e) {
                            console.error("Error generando compensatorio dom:", e);
                        }
                    } else if (esFestivoHoy) {
                        tipo = 'FESTIVA';
                        // Compensatorio por Festivo
                        try {
                            await generarCompensatorio({
                                empleadoId: data.empleadoId,
                                asistenciaId: marcacion.$id,
                                fechaGanado: fechaStr,
                                motivo: "Trabajo en Festivo Automático",
                                diasGanados: 1.0
                            });
                        } catch (e) {
                            console.error("Error generando compensatorio fest:", e);
                        }
                    } else if (horaSalidaNum >= 21 || horaSalidaNum < 6) {
                        tipo = 'NOCTURNA';
                    }

                    // TODO: Validar festivos con colección y generar compensatorio si aplica

                    await registrarHorasExtras({
                        empleadoId: data.empleadoId,
                        asistenciaId: marcacion.$id,
                        fecha: fechaStr,
                        horaInicio: horaSalidaEsperadaStr, // Debió salir A
                        horaFin: fechaHora.toLocaleTimeString('es-CO', { hour12: false, hour: '2-digit', minute: '2-digit' }), // Salió B
                        tipo: tipo,
                        motivo: "Generado automáticamente al registrar salida"
                    });
                }
            } catch (err) {
                console.error("Error calculando horas extras (no bloqueante):", err);
            }
        }
        // -----------------------------------------------------

        return {
            success: true,
            marcacion: marcacion as unknown as Asistencia
        };
    } catch (error: any) {
        console.error("Error registrando marcación:", error);
        return {
            success: false,
            error: error.message || "Error al registrar marcación"
        };
    }
}

/**
 * Actualizar configuración de asistencia
 */
export async function actualizarConfiguracionAsistencia(data: {
    horarioEntrada: string;
    horarioSalida: string;
    minutosTolerancia: number;
    requiereJustificacion: boolean;
}): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.CONFIGURACION_ASISTENCIA,
            'config',
            data
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error actualizando configuración:", error);
        return {
            success: false,
            error: error.message || "Error al actualizar configuración"
        };
    }
}


/**
 * Obtener marcaciones de un empleado en un rango de fechas
 */
export async function obtenerAsistenciasEmpleado(
    empleadoId: string,
    fechaInicio: string,
    fechaFin: string
): Promise<Asistencia[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ASISTENCIAS,
            [
                Query.equal("empleadoId", empleadoId),
                Query.greaterThanEqual("fechaHora", fechaInicio),
                Query.lessThanEqual("fechaHora", fechaFin),
                Query.orderDesc("fechaHora"),
                Query.limit(500)
            ]
        );

        return response.documents as unknown as Asistencia[];
    } catch (error) {
        console.error("Error obteniendo asistencias:", error);
        return [];
    }
}

/**
 * Obtener todas las marcaciones de un día específico
 */
export async function obtenerAsistenciasDia(fecha: string): Promise<Asistencia[]> {
    try {
        // Convertir fecha a inicio y fin del día
        const fechaObj = new Date(fecha);
        const inicioDia = new Date(fechaObj.setHours(0, 0, 0, 0)).toISOString();
        const finDia = new Date(fechaObj.setHours(23, 59, 59, 999)).toISOString();

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ASISTENCIAS,
            [
                Query.greaterThanEqual("fechaHora", inicioDia),
                Query.lessThanEqual("fechaHora", finDia),
                Query.orderDesc("fechaHora"),
                Query.limit(500)
            ]
        );

        return response.documents as unknown as Asistencia[];
    } catch (error) {
        console.error("Error obteniendo asistencias del día:", error);
        return [];
    }
}

/**
 * Obtener resumen de asistencia agrupado por día
 */
export async function obtenerResumenAsistenciaPorDia(
    empleadoId: string,
    fechaInicio: string,
    fechaFin: string
): Promise<ResumenAsistenciaDia[]> {
    try {
        const marcaciones = await obtenerAsistenciasEmpleado(empleadoId, fechaInicio, fechaFin);
        const config = await obtenerConfiguracionAsistencia();

        // Agrupar por día
        const marcacionesPorDia = new Map<string, Asistencia[]>();

        marcaciones.forEach(m => {
            const fecha = m.fechaHora.split('T')[0]; // YYYY-MM-DD
            if (!marcacionesPorDia.has(fecha)) {
                marcacionesPorDia.set(fecha, []);
            }
            marcacionesPorDia.get(fecha)!.push(m);
        });

        // Obtener permisos del empleado en el rango de fechas
        const permisosEmpleado = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PERMISOS,
            [
                Query.equal("empleadoId", empleadoId),
                Query.equal("estado", "APROBADO"),
                Query.greaterThanEqual("fechaFin", fechaInicio), // Permisos que terminan en o después de la fecha de inicio
                Query.lessThanEqual("fechaInicio", fechaFin), // Permisos que empiezan en o antes de la fecha de fin
                Query.limit(100)
            ]
        );

        // Convertir a resumen
        const resumen: ResumenAsistenciaDia[] = [];

        // Primero procesar marcaciones existentes
        for (const [fecha, marcaciones] of marcacionesPorDia.entries()) {
            const entrada = marcaciones.find(m => m.tipo === 'ENTRADA');
            const salida = marcaciones.find(m => m.tipo === 'SALIDA');

            let horasTrabajadas = 0;
            if (entrada && salida) {
                const diff = new Date(salida.fechaHora).getTime() - new Date(entrada.fechaHora).getTime();
                horasTrabajadas = diff / (1000 * 60 * 60);
            }

            // Determinar estado
            let estado: EstadoAsistencia = 'AUSENTE';
            let minutosRetardo: number | undefined;

            if (entrada) {
                const horaEntrada = new Date(entrada.fechaHora);

                // 1. Buscar turno asignado (Prioridad Alta)
                const turnoAsignado = await obtenerTurnoActivoEnFecha(empleadoId, fecha);

                let horarioAUsar = config.horarioEntrada;

                if (turnoAsignado) {
                    horarioAUsar = turnoAsignado.horaEntrada;
                } else {
                    // 2. Buscar horario especial (Prioridad Media)
                    const horarioEspecial = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.HORARIOS_EMPLEADO,
                        [
                            Query.equal("empleadoId", empleadoId),
                            Query.equal("activo", true),
                            Query.limit(1)
                        ]
                    );

                    if (horarioEspecial.documents.length > 0) {
                        const horario = horarioEspecial.documents[0] as any;
                        horarioAUsar = horario.horarioEntrada;
                    }
                }

                const [horaConfig, minConfig] = horarioAUsar.split(':').map(Number);
                const horarioEsperado = new Date(horaEntrada);
                horarioEsperado.setHours(horaConfig, minConfig, 0, 0);

                const diffMinutos = (horaEntrada.getTime() - horarioEsperado.getTime()) / (1000 * 60);

                if (diffMinutos > config.minutosTolerancia) {
                    estado = 'RETARDO';
                    minutosRetardo = Math.floor(diffMinutos);
                } else {
                    estado = 'PRESENTE';
                }
            }

            resumen.push({
                fecha,
                entrada,
                salida,
                horasTrabajadas: Number(horasTrabajadas.toFixed(2)),
                estado,
                minutosRetardo
            });
        }

        // Ahora agregar días con permisos aprobados que no tienen marcación
        const permisos = permisosEmpleado.documents as unknown as any[];
        for (const permiso of permisos) {
            const fechaInicioPerm = new Date(permiso.fechaInicio);
            const fechaFinPerm = new Date(permiso.fechaFin);

            // Iterar cada día del permiso
            for (let d = new Date(fechaInicioPerm); d <= fechaFinPerm; d.setDate(d.getDate() + 1)) {
                const fechaPermiso = d.toISOString().split('T')[0];

                // Solo agregar si no existe ya una marcación para ese día
                const yaExiste = resumen.some(r => r.fecha === fechaPermiso);
                if (!yaExiste) {
                    resumen.push({
                        fecha: fechaPermiso,
                        entrada: undefined,
                        salida: undefined,
                        horasTrabajadas: 0,
                        estado: 'PERMISO',
                        minutosRetardo: undefined
                    });
                }
            }
        }

        // También agregar días con vacaciones aprobadas
        const tieneVacaciones = await tieneVacacionesEnFecha(empleadoId, fechaInicio);
        if (tieneVacaciones) {
            // Obtener todas las vacaciones aprobadas del empleado
            const vacacionesResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.VACACIONES,
                [
                    Query.equal("empleadoId", empleadoId),
                    Query.equal("estado", "APROBADO"),
                    Query.limit(100)
                ]
            );

            for (const vacacion of vacacionesResponse.documents as unknown as any[]) {
                const fechaInicioVac = new Date(vacacion.fechaInicio);
                const fechaFinVac = new Date(vacacion.fechaFin);

                // Iterar cada día de vacaciones
                for (let d = new Date(fechaInicioVac); d <= fechaFinVac; d.setDate(d.getDate() + 1)) {
                    const fechaVacacion = d.toISOString().split('T')[0];

                    // Solo agregar si no existe ya
                    const yaExiste = resumen.some(r => r.fecha === fechaVacacion);
                    if (!yaExiste) {
                        resumen.push({
                            fecha: fechaVacacion,
                            entrada: undefined,
                            salida: undefined,
                            horasTrabajadas: 0,
                            estado: 'VACACIONES',
                            minutosRetardo: undefined
                        });
                    }
                }
            }
        }

        return resumen.sort((a, b) => b.fecha.localeCompare(a.fecha));
    } catch (error) {
        console.error("Error generando resumen:", error);
        return [];
    }
}

/**
 * Calcular horas trabajadas en un mes
 */
export async function calcularHorasTrabajadasMes(empleadoId: string, mes: number, año: number): Promise<number> {
    try {
        const fechaInicio = new Date(año, mes - 1, 1).toISOString();
        const fechaFin = new Date(año, mes, 0, 23, 59, 59).toISOString();

        const resumen = await obtenerResumenAsistenciaPorDia(empleadoId, fechaInicio, fechaFin);

        return resumen.reduce((total, dia) => total + dia.horasTrabajadas, 0);
    } catch (error) {
        console.error("Error calculando horas:", error);
        return 0;
    }
}
