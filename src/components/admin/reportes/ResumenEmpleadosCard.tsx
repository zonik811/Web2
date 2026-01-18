"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, UserCheck, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
    stats: {
        activos: number;
        total: number;
    };
}

export function ResumenEmpleadosCard({ stats }: Props) {
    return (
        <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                        Empleados
                    </CardTitle>
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Briefcase className="h-4 w-4 text-purple-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Empleados Activos</p>
                        <h3 className="text-3xl font-bold text-purple-700">
                            {stats.activos}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            De {stats.total} registrados
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-white/60 p-2 rounded-lg border border-purple-100 flex flex-col items-center justify-center text-center">
                            <UserCheck className="h-4 w-4 text-purple-500 mb-1" />
                            <span className="text-xs text-slate-600">Asistencia Hoy</span>
                            <span className="text-lg font-bold text-slate-900">--</span>
                            {/* Placeholder for attendance */}
                        </div>
                        <div className="bg-white/60 p-2 rounded-lg border border-purple-100 flex flex-col items-center justify-center text-center">
                            <Clock className="h-4 w-4 text-purple-500 mb-1" />
                            <span className="text-xs text-slate-600">Turnos Activos</span>
                            <span className="text-lg font-bold text-slate-900">--</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50" disabled>
                            Próximamente: Detalle
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
