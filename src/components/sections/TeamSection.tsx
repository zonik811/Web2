"use client";

import { useCompany } from "@/context/CompanyContext";
import Image from "next/image";
import { Users, User } from "lucide-react";
import type { EmpresaConfig } from "@/types/nuevos-tipos";

interface TeamSectionProps {
    previewConfig?: Partial<EmpresaConfig>;
}

export function TeamSection({ previewConfig }: TeamSectionProps) {
    const { config: globalConfig } = useCompany();
    const config = previewConfig || globalConfig;

    // Parse team list safely
    const teamList = (config as any)?.team_members ? JSON.parse((config as any).team_members) : [];

    if (!teamList || teamList.length === 0) return null;

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                        Nuestro Equipo
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                        Conoce a los Expertos
                    </h2>
                    <p className="text-lg text-slate-600">
                        Profesionales dedicados listos para brindarte el mejor servicio.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamList.map((member: any, index: number) => (
                        <div
                            key={index}
                            className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
                        >
                            <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-slate-50 group-hover:border-primary/20 transition-colors bg-slate-100 shadow-inner">
                                {member.image ? (
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <User className="h-12 w-12" />
                                    </div>
                                )}
                            </div>

                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                                    {member.name}
                                </h3>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                                    {member.role}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
