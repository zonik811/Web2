"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
    stats: {
        total: number;
        nuevosMes: number;
    };
}

export function ResumenClientesCard({ stats }: Props) {
    return (
        <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Clientes
                    </CardTitle>
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-4 w-4 text-blue-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Clientes</p>
                        <h3 className="text-3xl font-bold text-blue-700">
                            {stats.total}
                        </h3>
                    </div>

                    <div className="bg-white/60 p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Nuevos este mes</p>
                            <p className="text-xl font-bold text-slate-800">+{stats.nuevosMes}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserPlus className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" disabled>
                            Próximamente: Detalle
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
