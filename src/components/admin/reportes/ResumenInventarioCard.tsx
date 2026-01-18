"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, BadgeDollarSign } from "lucide-react";
import { formatearPrecio } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
    stats: {
        totalProductos: number;
        stockBajo: number;
        valorTotal: number;
    };
}

export function ResumenInventarioCard({ stats }: Props) {
    return (
        <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-amber-50 hover:shadow-xl transition-all">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Package className="h-5 w-5 text-amber-600" />
                        Inventario
                    </CardTitle>
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Package className="h-4 w-4 text-amber-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Valor Total Estimado</p>
                        <h3 className="text-2xl font-bold text-amber-700 truncate" title={formatearPrecio(stats.valorTotal)}>
                            {formatearPrecio(stats.valorTotal)}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {stats.totalProductos} productos registrados
                        </p>
                    </div>

                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-red-600 font-bold mb-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Stock Bajo
                            </p>
                            <p className="text-xl font-bold text-red-700">{stats.stockBajo}</p>
                        </div>
                        <div className="text-right">
                            <Link href="/admin/inventario/productos" className="text-xs text-red-600 underline hover:text-red-800">
                                Ver productos
                            </Link>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50" disabled>
                            Próximamente: Detalle
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
