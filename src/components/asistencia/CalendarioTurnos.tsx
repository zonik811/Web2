"use client";

import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend } from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Sun, Moon, Sparkles } from "lucide-react";
import type { Turno, AsignacionTurno, Empleado } from "@/types";

interface CalendarioTurnosProps {
    empleados: Empleado[];
    asignaciones: AsignacionTurno[];
    currentDate: Date;
    onCellClick: (empleadoId: string, date: Date, currentAsignacion?: AsignacionTurno) => void;
}

export function CalendarioTurnos({
    empleados,
    asignaciones,
    currentDate,
    onCellClick
}: CalendarioTurnosProps) {
    const [days, setDays] = useState<Date[]>([]);

    useEffect(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        setDays(eachDayOfInterval({ start, end }));
    }, [currentDate]);

    const getAsignacion = (empleadoId: string, date: Date) => {
        return asignaciones.find(a =>
            a.empleadoId === empleadoId &&
            new Date(a.fechaInicio) <= date &&
            new Date(a.fechaFin) >= date
        );
    };

    const getShiftGradient = (turno: Turno) => {
        const nombre = turno.nombre.toLowerCase();
        if (nombre.includes('mañana') || nombre.includes('manana')) {
            return 'from-amber-400 to-orange-500';
        } else if (nombre.includes('tarde')) {
            return 'from-blue-400 to-indigo-500';
        } else if (nombre.includes('noche')) {
            return 'from-indigo-600 to-purple-700';
        }
        return 'from-emerald-400 to-teal-500';
    };

    const getShiftIcon = (turno: Turno) => {
        const nombre = turno.nombre.toLowerCase();
        if (nombre.includes('mañana') || nombre.includes('manana')) {
            return <Sunrise className="h-3 w-3" />;
        } else if (nombre.includes('tarde')) {
            return <Sun className="h-3 w-3" />;
        } else if (nombre.includes('noche')) {
            return <Moon className="h-3 w-3" />;
        }
        return <Sparkles className="h-3 w-3" />;
    };

    const getEmployeeColor = (index: number) => {
        const colors = [
            'from-rose-500 to-pink-500',
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-indigo-500',
            'from-emerald-500 to-teal-500',
            'from-amber-500 to-orange-500',
            'from-violet-500 to-purple-500',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white">
            <div className="relative overflow-x-auto">
                <div className="min-w-[1000px]">
                    {/* Header Row - Days */}
                    <div className="grid grid-cols-[240px_1fr] sticky top-0 z-20 bg-gradient-to-r from-slate-50 to-white border-b-2 border-slate-200">
                        <div className="p-4 font-bold text-sm border-r border-slate-200 flex items-center bg-gradient-to-r from-blue-50 to-purple-50">
                            <span className="text-slate-700 uppercase tracking-wider">Empleado</span>
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(50px, 1fr))` }}>
                            {days.map((day, index) => {
                                const isCurrentDay = isToday(day);
                                const isWeekendDay = isWeekend(day);

                                return (
                                    <motion.div
                                        key={day.toISOString()}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={`text-xs text-center p-3 border-r border-slate-200 last:border-r-0 relative ${isWeekendDay
                                                ? 'bg-slate-50'
                                                : 'bg-white'
                                            } ${isCurrentDay
                                                ? 'bg-gradient-to-b from-blue-100 to-blue-50'
                                                : ''
                                            }`}
                                    >
                                        {isCurrentDay && (
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t" />
                                        )}
                                        <div className={`font-bold capitalize ${isCurrentDay ? 'text-blue-700' : 'text-slate-600'}`}>
                                            {format(day, 'EEE', { locale: es })}
                                        </div>
                                        <div className={`text-base font-semibold mt-1 ${isCurrentDay ? 'text-blue-600' : 'text-slate-700'}`}>
                                            {format(day, 'd')}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Employee Rows */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentDate.toISOString()}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="divide-y divide-slate-200"
                        >
                            {empleados.map((emp, empIndex) => (
                                <motion.div
                                    key={emp.$id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: empIndex * 0.05 }}
                                    className="grid grid-cols-[240px_1fr] group hover:bg-blue-50/30 transition-colors"
                                >
                                    {/* Employee Name Column */}
                                    <div className="p-4 border-r border-slate-200 flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getEmployeeColor(empIndex)} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                            {emp.nombre.charAt(0)}{emp.apellido.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-slate-800 truncate">
                                                {emp.nombre} {emp.apellido}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {emp.cargo || 'Personal'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Days Grid */}
                                    <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(50px, 1fr))` }}>
                                        {days.map((day) => {
                                            const asig = getAsignacion(emp.$id, day);
                                            const turno = asig?.turno;
                                            const isWeekendDay = isWeekend(day);

                                            return (
                                                <motion.div
                                                    key={day.toISOString()}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`
                                                        h-16 border-r border-slate-200 last:border-r-0 
                                                        relative cursor-pointer
                                                        ${isWeekendDay ? 'bg-slate-50/50' : 'bg-white'}
                                                    `}
                                                    onClick={() => onCellClick(emp.$id, day, asig)}
                                                >
                                                    {/* Empty Cell Pattern */}
                                                    {!turno && (
                                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                                        </div>
                                                    )}

                                                    {/* Shift Block */}
                                                    {turno && (
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                            className="absolute inset-1.5 group/shift"
                                                        >
                                                            <div className={`
                                                                h-full w-full rounded-lg bg-gradient-to-br ${getShiftGradient(turno)}
                                                                shadow-md hover:shadow-xl transition-all duration-300
                                                                flex flex-col items-center justify-center text-white
                                                                relative overflow-hidden
                                                                group-hover/shift:scale-110 group-hover/shift:rotate-1
                                                            `}>
                                                                {/* Shimmer Effect */}
                                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/shift:translate-x-full transition-transform duration-700" />

                                                                {/* Content */}
                                                                <div className="relative z-10 flex flex-col items-center gap-0.5">
                                                                    {getShiftIcon(turno)}
                                                                    <span className="text-[10px] font-bold uppercase tracking-wide drop-shadow">
                                                                        {turno.nombre.substring(0, 3)}
                                                                    </span>
                                                                    <span className="text-[9px] opacity-90 font-medium">
                                                                        {turno.horaEntrada.substring(0, 5)}
                                                                    </span>
                                                                </div>

                                                                {/* Tooltip on Hover */}
                                                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover/shift:opacity-100 transition-opacity pointer-events-none z-50">
                                                                    <div className="bg-slate-800 text-white px-3 py-2 rounded-lg shadow-2xl text-xs whitespace-nowrap">
                                                                        <p className="font-bold">{turno.nombre}</p>
                                                                        <p className="text-xs opacity-80">{turno.horaEntrada} - {turno.horaSalida}</p>
                                                                        {asig.notas && (
                                                                            <p className="text-xs italic mt-1 opacity-70">{asig.notas}</p>
                                                                        )}
                                                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Empty State */}
                    {empleados.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-16 text-center bg-white"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-4">
                                <Sparkles className="h-8 w-8 text-blue-600" />
                            </div>
                            <p className="text-slate-600 font-medium">
                                No hay empleados registrados
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                Agrega empleados para comenzar a gestionar turnos
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
