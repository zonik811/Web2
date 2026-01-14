"use client";

import Link from "next/link";
import { Phone, Mail, Clock, Sparkles } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";

export function Footer() {
    const { config } = useCompany();

    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl">{config?.nombre || "DieselParts"}</h3>
                                <p className="text-sm text-gray-400">{config?.slogan || "Tu socio de confianza"}</p>
                            </div>
                        </div>
                        <p className="text-gray-400 leading-relaxed max-w-md">
                            {config?.nombreCompleto || "DieselParts S.A.S"} - {config?.ciudad || "Bogotá"}, {config?.pais || "Colombia"}.
                            Repuestos de calidad para maquinaria diesel con garantía y servicio profesional.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Contacto</h3>
                        <div className="space-y-3">
                            <a href={`tel:${config?.telefono}`} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group">
                                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                                    <Phone className="h-5 w-5 text-primary group-hover:text-white" />
                                </div>
                                <span>{config?.telefono || "+57 3223238781"}</span>
                            </a>
                            <a href={`mailto:${config?.email}`} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group">
                                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center group-hover:bg-secondary transition-colors">
                                    <Mail className="h-5 w-5 text-secondary group-hover:text-white" />
                                </div>
                                <span>{config?.email || "contacto@dieselparts.com.co"}</span>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Horario</h3>
                        <div className="space-y-2 text-gray-400">
                            <div className="flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-primary" />
                                <span>{config?.horarioDias || "Lunes a Sábado"}</span>
                            </div>
                            <div className="ml-8 text-white font-medium">{config?.horarioHoras || "7:00 AM - 6:00 PM"}</div>
                            {config?.disponibilidad247 && (
                                <div className="mt-4 text-sm">
                                    Disponibilidad 24/7 para emergencias
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
                        <p>© 2026 {config?.nombre || "DieselParts"}. Todos los derechos reservados.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                            <a href="#" className="hover:text-white transition-colors">Términos</a>
                            <Link href="/login" className="hover:text-white transition-colors">Admin</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
