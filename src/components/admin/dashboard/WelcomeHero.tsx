"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Sparkles, Bell } from "lucide-react";

export function WelcomeHero({ userName = "Admin" }: { userName?: string }) {
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Buenos días");
        else if (hour < 18) setGreeting("Buenas tardes");
        else setGreeting("Buenas noches");
    }, []);

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-2xl">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>

            <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                {/* Greeting Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-300 font-medium text-sm uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" /> Centro de Comando
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">{userName}</span>
                    </h1>
                    <p className="text-slate-300 text-lg max-w-lg">
                        Aquí tienes el resumen operativo de hoy, {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}.
                    </p>
                </div>

                {/* Quick Stats / Date Pill */}
                <div className="hidden md:flex flex-col items-end gap-3">
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-sm font-medium">Sistema Operativo</span>
                    </div>

                    {/* Notification Bell (Visual Only for now) */}
                    <button className="relative p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
                        <Bell className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                        <span className="absolute top-2 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
                    </button>
                </div>
            </div>

            {/* Glass Strip at bottom */}
            <div className="bg-white/5 backdrop-blur-sm border-t border-white/5 p-4 flex gap-6 text-sm text-slate-300 overflow-x-auto">
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-emerald-400 font-bold">↑ 12%</span> vs mes anterior
                </div>
                <div className="w-px h-4 bg-white/10"></div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-blue-400 font-bold">8</span> Nuevas OTs
                </div>
                <div className="w-px h-4 bg-white/10"></div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-amber-400 font-bold">3</span> Alertas de Stock
                </div>
            </div>
        </div>
    );
}
