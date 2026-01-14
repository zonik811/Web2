import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, ShoppingBag, Calendar } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
    const router = useRouter();
    const { user, loading, logout: authLogout } = useAuth();

    const handleLogout = async () => {
        try {
            await authLogout();
            router.push('/');
            router.refresh(); // Refrescar para asegurar limpieza
        } catch (error) {
            console.error("Error logout:", error);
        }
    };

    if (loading) {
        return (
            <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg"></div>
        );
    }

    if (!user) {
        return (
            <div className="flex gap-2">
                <Link href="/registrarse">
                    <Button variant="outline" size="sm">
                        Registrarse
                    </Button>
                </Link>
                <Link href="/login">
                    <Button size="sm">
                        Iniciar Sesión
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <span className="text-white font-medium hidden md:block">
                ¡Hola, {user.name?.split(' ')[0] || 'Usuario'}!
            </span>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                        <User className="h-5 w-5 mr-2" />
                        <span className="hidden md:inline">Mi Cuenta</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/mi-cuenta" className="cursor-pointer">
                            <User className="h-4 w-4 mr-2" />
                            Mi Perfil
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/tienda" className="cursor-pointer">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Catálogo de Productos
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/agendar" className="cursor-pointer">
                            <Calendar className="h-4 w-4 mr-2" />
                            Agendar Servicio
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 cursor-pointer"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
