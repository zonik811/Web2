"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Calendar,
    Wrench,
    Car,
    Users,
    UserCircle,
    DollarSign,
    Sparkles,
    BarChart3,
    LogOut,
    TrendingDown,
    Settings,
    Package,
    ShoppingBag,
    Clock,
    ChevronDown,
    Briefcase,
    AlertCircle,
    TrendingUp,
    Tag,
    Truck,
    ShoppingCart,
    ClipboardList,
    LayoutList,
    ScanBarcode,
    Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationToggle } from "@/components/ui/notification-toggle";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = {
    name: string;
    href: string;
    icon: any;
    roles?: string[]; // Roles permitidos para este ítem. Si es undefined, permitido para todos (dentro del admin panel)
};

type NavGroup = {
    title: string;
    items: NavItem[];
    roles?: string[]; // Roles permitidos para este grupo
};

const navigationGroups: NavGroup[] = [
    {
        title: "Taller & Operaciones",
        roles: ["admin", "tecnico"],
        items: [
            { name: "Órdenes de Trabajo", href: "/admin/ordenes-trabajo", icon: Wrench, roles: ["admin", "tecnico"] },
            { name: "Vehículos", href: "/admin/vehiculos", icon: Car, roles: ["admin", "tecnico"] },

        ]
    },
    {
        title: "Inventario & Logística",
        roles: ["admin"],
        items: [
            { name: "Dashboard", href: "/admin/inventario", icon: LayoutDashboard, roles: ["admin"] },
            { name: "Productos", href: "/admin/inventario/productos", icon: Tag, roles: ["admin"] },
            { name: "Proveedores", href: "/admin/inventario/proveedores", icon: Truck, roles: ["admin"] },
            { name: "Compras", href: "/admin/inventario/compras", icon: ShoppingCart, roles: ["admin"] },
        ]
    },
    {
        title: "Servicios",
        roles: ["admin", "tecnico"],
        items: [
            { name: "Agenda de Citas", href: "/admin/citas", icon: Calendar, roles: ["admin", "tecnico"] },
            { name: "Catálogo Servicios", href: "/admin/servicios", icon: Sparkles, roles: ["admin"] },
        ]
    },
    {
        title: "Comercial",
        roles: ["admin", "cajero"],
        items: [
            { name: "Clientes", href: "/admin/clientes", icon: UserCircle, roles: ["admin"] },
            { name: "Ventas", href: "/admin/ventas", icon: ShoppingBag, roles: ["admin"] },
            { name: "POS (Caja)", href: "/admin/ventas/pos", icon: ScanBarcode, roles: ["admin", "cajero"] },
            { name: "Reportes POS", href: "/admin/ventas/reportes", icon: TrendingUp, roles: ["admin"] },
        ]
    },
    {
        title: "RRHH & Asistencia",
        roles: ["admin"],
        items: [
            { name: "Personal", href: "/admin/personal", icon: Users },
            { name: "Tablero Control", href: "/admin/asistencia", icon: Clock },
            { name: "Turnos", href: "/admin/asistencia/turnos", icon: Users },
            { name: "Permisos", href: "/admin/asistencia/permisos", icon: Briefcase },
            { name: "Vacaciones", href: "/admin/asistencia/vacaciones", icon: Calendar },
            { name: "Compensatorios", href: "/admin/asistencia/compensatorios", icon: AlertCircle },
            { name: "Banco de Horas", href: "/admin/asistencia/banco-horas", icon: TrendingUp },
            { name: "Horas Extras", href: "/admin/asistencia/extras", icon: Clock },
        ]
    },
    {
        title: "Finanzas",
        roles: ["admin"],
        items: [
            { name: "Pagos", href: "/admin/pagos", icon: DollarSign },
            { name: "Gastos", href: "/admin/gastos", icon: TrendingDown },
        ]
    },
    {
        title: "Sistema",
        roles: ["admin"],
        items: [
            { name: "Reportes", href: "/admin/reportes", icon: BarChart3 },
            { name: "Gestión de Datos", href: "/admin/configuracion/datos", icon: Database },
            { name: "Configuración", href: "/admin/configuracion", icon: Settings },
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user, role } = useAuth();
    const { config } = useCompany();
    const companyName = config?.nombre || 'DieselParts';

    // Estado para controlar qué grupos están expandidos
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        "Taller & Operaciones": true,
        "Servicios": true,
        "Comercial": false,
        "Finanzas": false,
        "RRHH & Asistencia": true,
        "Sistema": false
    });

    const toggleGroup = (title: string) => {
        setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = "/login";
        } catch (error) {
            console.error("Error cerrando sesión:", error);
        }
    };

    return (
        <div className="flex flex-col h-full w-80 bg-[#0f172a] text-slate-300 border-r border-slate-800/50 shadow-2xl overflow-hidden">
            {/* Logo Area */}
            <div className="relative p-6 pb-8">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
                <div className="relative flex items-center space-x-4">
                    <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">{companyName}</h1>
                        <div className="flex items-center mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Scroll Area */}
            <nav className="flex-1 px-4 pb-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                {/* Main Dashboard Link */}
                <div className="mb-6">
                    <Link href="/admin">
                        <div className={cn(
                            "group relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden",
                            pathname === "/admin"
                                ? "bg-blue-600/10 text-white shadow-inner shadow-blue-500/5"
                                : "hover:bg-slate-800/50 hover:text-white"
                        )}>
                            {/* Active Indicator Line */}
                            {pathname === "/admin" && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"
                                />
                            )}

                            <LayoutDashboard className={cn(
                                "h-5 w-5 mr-3 transition-colors",
                                pathname === "/admin" ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"
                            )} />
                            <span className="font-medium tracking-wide">Dashboard Principal</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Groups */}
                <div className="space-y-6">
                    {navigationGroups.map((group) => {
                        // Verificar si el grupo es permitido
                        if (group.roles && role && !group.roles.includes(role)) {
                            return null;
                        }

                        // Filtrar items permitidos
                        const allowedItems = group.items.filter(item =>
                            !item.roles || (role && item.roles.includes(role))
                        );

                        if (allowedItems.length === 0) return null;

                        return (
                            <div key={group.title} className="space-y-1">
                                <button
                                    onClick={() => toggleGroup(group.title)}
                                    className="flex items-center justify-between w-full px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors group"
                                >
                                    <span>{group.title}</span>
                                    <motion.div
                                        animate={{ rotate: openGroups[group.title] ? 0 : -90 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown className="h-3 w-3 text-slate-600 group-hover:text-slate-400" />
                                    </motion.div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {openGroups[group.title] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-1 pt-1 pb-2">
                                                {allowedItems.map((item) => {
                                                    const isActive = pathname === item.href.split('?')[0];

                                                    return (
                                                        <Link key={item.name} href={item.href}>
                                                            <div className={cn(
                                                                "relative flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 group cursor-pointer",
                                                                isActive
                                                                    ? "bg-slate-800 text-white"
                                                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                                            )}>
                                                                {isActive && (
                                                                    <motion.div
                                                                        layoutId="activeItemIndicator"
                                                                        className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        transition={{ duration: 0.2 }}
                                                                    />
                                                                )}

                                                                <item.icon className={cn(
                                                                    "h-5 w-5 mr-3 transition-transform group-hover:scale-110",
                                                                    isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                                                                )} />
                                                                <span className="text-sm font-medium">{item.name}</span>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {user?.name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <p className="text-sm font-semibold text-white truncate w-32">
                                {user?.name || "Administrador"}
                            </p>
                            <p className="text-xs text-slate-400 truncate w-32">{user?.email}</p>
                        </div>
                    </div>
                    <NotificationToggle />
                </div>

                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full justify-center bg-slate-800 border-slate-700 text-slate-300 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 transition-all duration-300"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}
