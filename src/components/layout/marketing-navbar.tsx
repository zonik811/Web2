"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompany } from "@/context/CompanyContext";
import { useAuth } from "@/lib/hooks/useAuth";

export function MarketingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { config, loading } = useCompany();
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Inicio", href: "#" },
        { name: "Servicios", href: "#servicios" },
        { name: "Equipo", href: "#equipo" },
        { name: "Testimonios", href: "#testimonios" },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-white/90 backdrop-blur-md shadow-md py-3"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        {config?.logo ? (
                            <div className="relative h-10 w-auto aspect-[3/1] min-w-[120px]">
                                <img
                                    src={config.logo}
                                    alt={config.nombre || "Logo"}
                                    className="h-full w-full object-contain object-left"
                                />
                            </div>
                        ) : (
                            <>
                                <div className={cn(
                                    "p-2 rounded-xl transition-colors",
                                    isScrolled ? "bg-primary/10" : "bg-white/20 backdrop-blur-sm"
                                )}>
                                    <Sparkles className={cn(
                                        "w-6 h-6",
                                        isScrolled ? "text-primary" : "text-white"
                                    )} />
                                </div>
                                <span className={cn(
                                    "font-bold text-xl",
                                    isScrolled ? "text-gray-900" : "text-white"
                                )}>
                                    {loading ? "Cargando..." : config?.nombre || "DieselParts"}
                                </span>
                            </>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "font-medium hover:text-secondary transition-colors",
                                    isScrolled ? "text-gray-600" : "text-white/90 hover:text-white"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/catalogo">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "font-medium",
                                    isScrolled ? "text-gray-600 hover:text-primary" : "text-white/90 hover:text-white hover:bg-white/10"
                                )}
                            >
                                Catálogo
                            </Button>
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-3 animate-in fade-in">
                                <span className={cn(
                                    "text-sm font-medium",
                                    isScrolled ? "text-slate-700" : "text-white"
                                )}>
                                    Hola, {user.name}
                                </span>
                                <Link href="/admin">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <Link href="/registrarse">
                                    <Button
                                        className={cn(
                                            "font-medium shadow-lg hover:translate-y-[-2px] transition-all",
                                            isScrolled
                                                ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-emerald/25"
                                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                                        )}
                                    >
                                        Registrarse - 4% OFF
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "font-medium",
                                            isScrolled ? "text-gray-600 hover:text-primary hover:bg-primary/5" : "text-white hover:text-white hover:bg-white/20"
                                        )}
                                    >
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Ingresar
                                    </Button>
                                </Link>
                            </>
                        )}

                        <Link href="/agendar">
                            <Button
                                className={cn(
                                    "font-medium shadow-lg hover:translate-y-[-2px] transition-all",
                                    isScrolled
                                        ? "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-primary/25"
                                        : "bg-white text-primary hover:bg-white/90"
                                )}
                            >
                                Agendar Cita
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className={cn("w-6 h-6", isScrolled ? "text-gray-900" : "text-white")} />
                        ) : (
                            <Menu className={cn("w-6 h-6", isScrolled ? "text-gray-900" : "text-white")} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t p-4 shadow-xl animate-in slide-in-from-top-2">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-gray-600 font-medium py-2 hover:text-primary"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <hr className="my-2" />
                        <Link href="/registrarse" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 mb-2">
                                Registrarse - 4% OFF
                            </Button>
                        </Link>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">
                                <LogIn className="w-4 h-4 mr-2" />
                                Iniciar Sesión
                            </Button>
                        </Link>
                        <Link href="/agendar" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full bg-primary mb-2">
                                Agendar Cita
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
