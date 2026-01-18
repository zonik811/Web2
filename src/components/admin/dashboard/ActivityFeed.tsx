"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, Clock, AlertTriangle, UserPlus, ShoppingBag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Mock Data - To be replaced
const activities = [
    {
        id: 1,
        type: "OTA_CREATED",
        title: "Nueva OT #4521",
        description: "Diagnóstico frenos - Mazda 3",
        time: "Hace 10 min",
        icon: Clock,
        color: "text-blue-500",
        bg: "bg-blue-100"
    },
    {
        id: 2,
        type: "STOCK_LOW",
        title: "Alerta de Stock",
        description: "Aceite Sintético 5W30 < 3 und",
        time: "Hace 45 min",
        icon: AlertTriangle,
        color: "text-amber-500",
        bg: "bg-amber-100"
    },
    {
        id: 3,
        type: "POS_SALE",
        title: "Venta POS #902",
        description: "Kit Limpieza + Ambientador",
        time: "Hace 1 hora",
        icon: ShoppingBag,
        color: "text-emerald-500",
        bg: "bg-emerald-100"
    },
    {
        id: 4,
        type: "APPOINTMENT_DONE",
        title: "Cita Completada",
        description: "Lavado Premium - Juan Perez",
        time: "Hace 2 horas",
        icon: CheckCircle,
        color: "text-slate-500",
        bg: "bg-slate-100"
    },
    {
        id: 5,
        type: "CLIENT_NEW",
        title: "Nuevo Cliente",
        description: "Maria Gonzalez registrado",
        time: "Hace 3 horas",
        icon: UserPlus,
        color: "text-violet-500",
        bg: "bg-violet-100"
    }
];

export function ActivityFeed() {
    return (
        <Card className="h-full border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-50">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" /> Actividad Reciente
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-4">
                        {activities.map((item, index) => (
                            <div key={item.id} className="relative flex gap-4 group">
                                {/* Timeline Line */}
                                {index !== activities.length - 1 && (
                                    <div className="absolute left-[19px] top-10 bottom-[-16px] w-[2px] bg-slate-100 group-hover:bg-slate-200 transition-colors"></div>
                                )}

                                {/* Icon Bubble */}
                                <div className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm z-10 transition-transform group-hover:scale-110",
                                    item.bg
                                )}>
                                    <item.icon className={cn("w-5 h-5", item.color)} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{item.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
