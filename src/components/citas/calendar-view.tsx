"use client";

import { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Cita, EstadoCita } from "@/types";
import { nombreCompleto } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { obtenerURLArchivo } from "@/lib/appwrite";
import Link from "next/link";

interface CalendarViewProps {
    citas: Cita[];
    empleadosMap: Record<string, any>; // Map of employee ID to employee object
}

type ViewMode = "month" | "week";

export function CalendarView({ citas, empleadosMap }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>("month");

    // Navigation handlers
    const next = () => {
        if (viewMode === "month") {
            setCurrentDate(addMonths(currentDate, 1));
        } else {
            setCurrentDate(addWeeks(currentDate, 1));
        }
    };

    const prev = () => {
        if (viewMode === "month") {
            setCurrentDate(subMonths(currentDate, 1));
        } else {
            setCurrentDate(subWeeks(currentDate, 1));
        }
    };

    const today = () => setCurrentDate(new Date());

    // Generate days for the grid
    const days = viewMode === "month"
        ? eachDayOfInterval({
            start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
            end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
        })
        : eachDayOfInterval({
            start: startOfWeek(currentDate, { weekStartsOn: 1 }),
            end: endOfWeek(currentDate, { weekStartsOn: 1 })
        });

    const getCitasForDay = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");

        return citas.filter(cita => {
            return cita.fechaCita && cita.fechaCita.split("T")[0] === dateStr;
        }).sort((a, b) => a.horaCita.localeCompare(b.horaCita));
    };

    const getEstadoColor = (estado: EstadoCita) => {
        switch (estado) {
            case EstadoCita.PENDIENTE: return "bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200";
            case EstadoCita.CONFIRMADA: return "bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200";
            case EstadoCita.COMPLETADA: return "bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200";
            case EstadoCita.CANCELADA: return "bg-rose-100 border-rose-200 text-rose-700 hover:bg-rose-200";
            default: return "bg-gray-100 border-gray-200 text-gray-700";
        }
    };

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prev} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold w-48 text-center capitalize">
                        {format(currentDate, viewMode === "month" ? "MMMM yyyy" : "'Semana del' d", { locale: es })}
                    </h2>
                    <Button variant="outline" size="icon" onClick={next} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={today} className="text-sm">
                        Hoy
                    </Button>
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                        <button
                            onClick={() => setViewMode("month")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${viewMode === "month" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Mes
                        </button>
                        <button
                            onClick={() => setViewMode("week")}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${viewMode === "week" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Semana
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card className="overflow-hidden border-gray-200 shadow-sm">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
                        <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>

                <div className={`grid grid-cols-7 ${viewMode === "month" ? "auto-rows-[minmax(120px,auto)]" : "h-[600px]"}`}>
                    {days.map((day, idx) => {
                        const dayCitas = getCitasForDay(day);
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, currentDate);

                        return (
                            <div
                                key={day.toString()}
                                className={`
                                    min-h-[120px] p-2 border-b border-r border-gray-100 relative transition-colors
                                    ${!isCurrentMonth && viewMode === "month" ? "bg-gray-50/50" : "bg-white"}
                                    ${idx % 7 === 6 ? "border-r-0" : ""}
                                    hover:bg-gray-50
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`
                                        text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full
                                        ${isToday ? "bg-primary text-primary-foreground" : "text-gray-700"}
                                    `}>
                                        {format(day, "d")}
                                    </span>
                                    {dayCitas.length > 0 && <span className="text-xs text-gray-400 font-medium">{dayCitas.length} citas</span>}
                                </div>

                                <div className="space-y-1.5">
                                    {dayCitas.map(cita => (
                                        <Link href={`/admin/citas/${cita.$id}`} key={cita.$id}>
                                            <div
                                                className={`
                                                    group px-2 py-1.5 rounded-md border text-xs cursor-pointer transition-all hover:shadow-md
                                                    ${getEstadoColor(cita.estado)}
                                                `}
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="font-bold flex items-center gap-1">
                                                        <Clock className="h-3 w-3 opacity-70" />
                                                        {cita.horaCita}
                                                    </span>
                                                </div>
                                                <div className="font-medium truncate" title={cita.clienteNombre}>
                                                    {cita.clienteNombre}
                                                </div>

                                                {/* Employee Avatars Mini */}
                                                {cita.empleadosAsignados && cita.empleadosAsignados.length > 0 && (
                                                    <div className="flex -space-x-1 mt-1.5">
                                                        {cita.empleadosAsignados.slice(0, 3).map((empId, i) => {
                                                            const emp = empleadosMap[empId];
                                                            if (!emp) return null;
                                                            return (
                                                                <Avatar key={i} className="h-4 w-4 border border-white ring-1 ring-black/5">
                                                                    <AvatarImage src={obtenerURLArchivo(emp.foto)} />
                                                                    <AvatarFallback className="text-[6px] bg-gray-200">
                                                                        {emp.nombre?.[0]}{emp.apellido?.[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
