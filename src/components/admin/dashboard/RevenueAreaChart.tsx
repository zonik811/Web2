"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Mock Data - To be replaced with real backend daily stats later
const data = [
    { name: "Lun", ingreso: 1200000, gasto: 400000 },
    { name: "Mar", ingreso: 950000, gasto: 300000 },
    { name: "Mie", ingreso: 1400000, gasto: 800000 },
    { name: "Jue", ingreso: 1800000, gasto: 200000 },
    { name: "Vie", ingreso: 2200000, gasto: 500000 },
    { name: "Sab", ingreso: 3100000, gasto: 900000 },
    { name: "Dom", ingreso: 1800000, gasto: 100000 },
];

export function RevenueAreaChart() {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Card className="h-full border-slate-100 shadow-lg shadow-blue-900/5 overflow-hidden">
            <CardHeader className="pb-2 border-b border-slate-50">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" /> Flujo de Ingresos
                        </CardTitle>
                        <CardDescription>
                            Tendencia últimos 7 días
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total esta semana</p>
                        <p className="text-xl font-black text-slate-800">$12,450,000</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 h-[300px] bg-gradient-to-b from-slate-50/50 to-white">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIngreso" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value: number | undefined) => [formatCurrency(value ?? 0), '']}
                        />
                        <Area
                            type="monotone"
                            dataKey="ingreso"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorIngreso)"
                            name="Ingresos"
                        />
                        {/* <Area 
                            type="monotone" 
                            dataKey="gasto" 
                            stroke="#ef4444" 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#colorGasto)" 
                            name="Gastos"
                        /> */}
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
