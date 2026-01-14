import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatearPrecio } from "@/lib/utils";
import type { ClienteTop } from "@/lib/actions/reportes";

interface TopClientsListProps {
    clientes: ClienteTop[];
}

export function TopClientsList({ clientes }: TopClientsListProps) {
    return (
        <Card className="border-none shadow-md">
            <CardHeader>
                <CardTitle>Mejores Clientes</CardTitle>
                <CardDescription>Clientes que más ingresos generan al negocio</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 border-b mb-2 px-2">
                        <div className="col-span-1">#</div>
                        <div className="col-span-11 md:col-span-5">Cliente</div>
                        <div className="col-span-3 text-right hidden md:block">Servicios</div>
                        <div className="col-span-3 text-right hidden md:block">Total Facturado</div>
                    </div>
                    {clientes.map((cliente, i) => (
                        <div key={i} className="grid grid-cols-12 items-center hover:bg-gray-50 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                            <div className="col-span-1 font-bold text-gray-400">#{i + 1}</div>
                            <div className="col-span-11 md:col-span-5 font-medium text-gray-900 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                    {(cliente.nombre || "C").substring(0, 2).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <div>{cliente.nombre || "Cliente Eliminado"}</div>
                                    <div className="md:hidden text-xs text-gray-500 mt-0.5">
                                        {cliente.serviciosContratados || 0} serv. • {formatearPrecio(cliente.totalGastado || 0)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-3 text-right text-gray-600 hidden md:block font-medium">
                                {cliente.serviciosContratados || 0}
                            </div>
                            <div className="col-span-3 text-right font-bold text-gray-900 hidden md:block">
                                {formatearPrecio(cliente.totalGastado || 0)}
                            </div>
                        </div>
                    ))}
                    {clientes.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No hay datos disponibles para este periodo.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
