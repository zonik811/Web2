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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationToggle } from "@/components/ui/notification-toggle";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";

const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Citas", href: "/admin/citas", icon: Calendar },
    { name: "Órdenes", href: "/admin/ordenes-trabajo", icon: Wrench },
    { name: "Vehículos", href: "/admin/vehiculos", icon: Car },
    { name: "Personal", href: "/admin/personal", icon: Users },
    { name: "Clientes", href: "/admin/clientes", icon: UserCircle },
    { name: "Pagos", href: "/admin/pagos", icon: DollarSign },
    { name: "Gastos", href: "/admin/gastos", icon: TrendingDown },
    { name: "Inventario", href: "/admin/inventario", icon: Package },
    { name: "Ventas", href: "/admin/ventas", icon: ShoppingBag },
    { name: "Servicios", href: "/admin/servicios", icon: Sparkles },
    { name: "Reportes", href: "/admin/reportes", icon: BarChart3 },
    { name: "Configuración", href: "/admin/configuracion", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { config } = useCompany();
    const companyName = config?.nombre || 'DieselParts';

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = "/login";
        } catch (error) {
            console.error("Error cerrando sesión:", error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary rounded-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">{companyName}</h1>
                        <p className="text-xs text-slate-400">Panel Admin</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-slate-700">
                <div className="flex items-center justify-between mb-3 px-2">
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.name || user?.email || "Admin"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <NotificationToggle />
                </div>
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}
