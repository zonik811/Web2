import * as XLSX from 'xlsx';
import type { ResumenAsistenciaDia, Empleado } from '@/types';

/**
 * Exportar historial de asistencia a Excel
 */
export function exportarAsistenciaExcel(
    empleado: Empleado,
    resumen: ResumenAsistenciaDia[],
    mes: number,
    año: number,
    totalHoras: number
) {
    // Preparar datos para la hoja
    const data = resumen.map(dia => ({
        'Fecha': new Date(dia.fecha).toLocaleDateString('es-CO', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }),
        'Entrada': dia.entrada
            ? new Date(dia.entrada.fechaHora).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit'
            })
            : '-',
        'Salida': dia.salida
            ? new Date(dia.salida.fechaHora).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit'
            })
            : '-',
        'Horas Trabajadas': dia.horasTrabajadas > 0 ? dia.horasTrabajadas.toFixed(2) : '-',
        'Estado': dia.estado,
        'Minutos Retardo': dia.minutosRetardo || '-',
        'Notas': dia.entrada?.notas || ''
    }));

    // Agregar fila de resumen al final (tipo any para evitar type errors)
    const dataConResumen: any[] = [...data];

    dataConResumen.push({
        'Fecha': '',
        'Entrada': '',
        'Salida': '',
        'Horas Trabajadas': '',
        'Estado': '',
        'Minutos Retardo': '',
        'Notas': ''
    });

    dataConResumen.push({
        'Fecha': 'TOTAL',
        'Entrada': '',
        'Salida': '',
        'Horas Trabajadas': totalHoras.toFixed(2),
        'Estado': `${resumen.length} días`,
        'Minutos Retardo': '',
        'Notas': ''
    });

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataConResumen);

    // Ajustar ancho de columnas
    const colWidths = [
        { wch: 20 }, // Fecha
        { wch: 10 }, // Entrada
        { wch: 10 }, // Salida
        { wch: 15 }, // Horas
        { wch: 12 }, // Estado
        { wch: 15 }, // Retardo
        { wch: 30 }, // Notas
    ];
    ws['!cols'] = colWidths;

    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');

    // Crear hoja de resumen
    const resumenData = [
        ['Empleado', `${empleado.nombre} ${empleado.apellido}`],
        ['Cargo', empleado.cargo],
        ['Período', `${getMesNombre(mes)} ${año}`],
        [''],
        ['Total Horas Trabajadas', totalHoras.toFixed(2)],
        ['Días Trabajados', resumen.length],
        ['Promedio Horas/Día', resumen.length > 0 ? (totalHoras / resumen.length).toFixed(2) : 0],
        ['Días Puntuales', resumen.filter(r => r.estado === 'PRESENTE').length],
        ['Días con Retardo', resumen.filter(r => r.estado === 'RETARDO').length],
        ['Días Ausentes', resumen.filter(r => r.estado === 'AUSENTE').length],
        ['% Puntualidad', resumen.length > 0 ? `${((resumen.filter(r => r.estado === 'PRESENTE').length / resumen.length) * 100).toFixed(1)}%` : '0%']
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    wsResumen['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // Generar archivo
    const nombreArchivo = `Asistencia_${empleado.nombre}_${empleado.apellido}_${getMesNombre(mes)}_${año}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
}

function getMesNombre(mes: number): string {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1];
}

/**
 * Exportar reporte general de asistencia (todos los empleados)
 */
export function exportarAsistenciaGeneral(
    datos: Array<{ empleado: Empleado; totalHoras: number; diasTrabajados: number; puntualidad: number }>,
    mes: number,
    año: number
) {
    const data = datos.map(item => ({
        'Empleado': `${item.empleado.nombre} ${item.empleado.apellido}`,
        'Cargo': item.empleado.cargo,
        'Total Horas': item.totalHoras.toFixed(2),
        'Días Trabajados': item.diasTrabajados,
        'Promedio Horas/Día': item.diasTrabajados > 0 ? (item.totalHoras / item.diasTrabajados).toFixed(2) : 0,
        '% Puntualidad': `${item.puntualidad.toFixed(1)}%`
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    ws['!cols'] = [
        { wch: 30 },
        { wch: 20 },
        { wch: 12 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Reporte General');

    const nombreArchivo = `Reporte_Asistencia_General_${getMesNombre(mes)}_${año}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
}
