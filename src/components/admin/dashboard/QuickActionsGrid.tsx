"use client";

import Link from "next/link";
import {
    CalendarPlus,
    Wrench,
    ShoppingCart,
    Receipt,
    UserPlus,
    PackageSearch,
    ChevronRight,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
    href: string;
    icon: React.ElementType;
    title: string;
    description: string;
    colorClass: string; // Tailwind gradient classes
    iconColor: string;
}

const actions: QuickActionProps[] = [
    {
        href: "/agendar",
        icon: CalendarPlus,
        title: "Nueva Cita",
        description: "Agendar servicio",
        colorClass: "from-blue-50 to-blue-100/50 hover:border-blue-200",
        iconColor: "text-blue-600"
    },
    {
        href: "/admin/ordenes/nueva",
        icon: Wrench,
        title: "Crear OT",
        description: "Ingreso a taller",
        colorClass: "from-violet-50 to-violet-100/50 hover:border-violet-200",
        iconColor: "text-violet-600"
    },
    {
        href: "/admin/pos",
        icon: ShoppingCart,
        title: "Punto de Venta",
        description: "Venta rápida POS",
        colorClass: "from-emerald-50 to-emerald-100/50 hover:border-emerald-200",
        iconColor: "text-emerald-600"
    },
    {
        href: "/admin/gastos",
        icon: Receipt,
        title: "Reg. Gasto",
        description: "Salida de dinero",
        colorClass: "from-rose-50 to-rose-100/50 hover:border-rose-200",
        iconColor: "text-rose-600"
    },
    {
        href: "/admin/clientes",
        icon: UserPlus,
        title: "Nuevo Cliente",
        description: "Registrar datos",
        colorClass: "from-amber-50 to-amber-100/50 hover:border-amber-200",
        iconColor: "text-amber-600"
    },
    {
        href: "/admin/inventario",
        icon: PackageSearch,
        title: "Inventario",
        description: "Consultar stock",
        colorClass: "from-slate-50 to-slate-100/50 hover:border-slate-200",
        iconColor: "text-slate-600"
    }
];

export function QuickActionsGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {actions.map((action, index) => (
                <Link
                    key={index}
                    href={action.href}
                    className={cn(
                        "group relative overflow-hidden rounded-2xl border border-transparent p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br",
                        action.colorClass
                    )}
                >
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className={cn("w-4 h-4", action.iconColor)} />
                    </div>

                    <div className={cn("mb-3 p-3 w-fit rounded-xl bg-white shadow-sm ring-1 ring-black/5", action.iconColor)}>
                        <action.icon className="w-6 h-6" />
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-black transition-colors">
                        {action.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-tight">
                        {action.description}
                    </p>
                </Link>
            ))}
        </div>
    );
}
