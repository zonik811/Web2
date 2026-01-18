"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Store, Globe, Wrench } from "lucide-react";
import { formatearPrecio } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
    stats: {
        totalMes: number;
        totalAyer: number;
        totalHoy: number;
        progresoMensual: number;
        porOrigen: {
            pos: number;
            servicios: number;
            catalogo: number;
        };
    };
}

export function ResumenVentasCard({ stats }: Props) {
    return (
        <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50 hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                        Ventas Totales
                    </CardTitle>
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Ventas del Mes</p>
                        <h3 className="text-3xl font-bold text-emerald-700">
                            {formatearPrecio(stats.totalMes)}
                        </h3>
                        <p className={`text-xs font-medium mt-1 ${stats.progresoMensual >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {stats.progresoMensual > 0 ? '+' : ''}{stats.progresoMensual}% vs mes anterior
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="bg-white/60 p-2 rounded-lg border border-emerald-100 text-center">
                            <div className="flex justify-center mb-1"><Store className="h-4 w-4 text-blue-500" /></div>
                            <p className="text-[10px] text-slate-500">POS</p>
                            <p className="text-xs font-bold text-slate-800 truncate" title={formatearPrecio(stats.porOrigen.pos)}>
                                {formatearPrecio(stats.porOrigen.pos)}
                            </p>
                        </div>
                        <div className="bg-white/60 p-2 rounded-lg border border-emerald-100 text-center">
                            <div className="flex justify-center mb-1"><Wrench className="h-4 w-4 text-amber-500" /></div>
                            <p className="text-[10px] text-slate-500">Servicios</p>
                            <p className="text-xs font-bold text-slate-800 truncate" title={formatearPrecio(stats.porOrigen.servicios)}>
                                {formatearPrecio(stats.porOrigen.servicios)}
                            </p>
                        </div>
                        <div className="bg-white/60 p-2 rounded-lg border border-emerald-100 text-center">
                            <div className="flex justify-center mb-1"><Globe className="h-4 w-4 text-purple-500" /></div>
                            <p className="text-[10px] text-slate-500">Catálogo</p>
                            <p className="text-xs font-bold text-slate-800 truncate" title={formatearPrecio(stats.porOrigen.catalogo)}>
                                {formatearPrecio(stats.porOrigen.catalogo)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="text-center">
                            <p className="text-xs text-slate-400">Hoy</p>
                            <p className="text-sm font-semibold text-slate-700">{formatearPrecio(stats.totalHoy)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-400">Ayer</p>
                            <p className="text-sm font-semibold text-slate-700">{formatearPrecio(stats.totalAyer)}</p>
                        </div>
                    </div>

                    <Link href="/admin/ventas/reportes" className="block pt-2">
                        <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                            Ver Detalle POS
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
