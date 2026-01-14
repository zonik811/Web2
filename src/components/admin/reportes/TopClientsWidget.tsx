import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatearPrecio } from "@/lib/utils";
import type { ClienteTop } from "@/lib/actions/reportes";

interface TopClientsWidgetProps {
    clientes: ClienteTop[];
}

export function TopClientsWidget({ clientes }: TopClientsWidgetProps) {
    // Tomar solo top 3 y validar
    const top3 = clientes.slice(0, 3).map(c => ({
        ...c,
        totalGastado: c.totalGastado || 0,
        serviciosContratados: c.serviciosContratados || 0
    }));

    return (
        <Card className="h-full border-none shadow-md">
            <CardHeader>
                <CardTitle className="text-base">Top 3 Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {top3.map((cliente, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm
                            ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                            {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-900">{cliente.nombre || "Cliente Eliminado"}</p>
                            <p className="text-xs text-gray-500">{cliente.serviciosContratados} servicios</p>
                        </div>
                        <div className="font-semibold text-sm text-gray-900">
                            {formatearPrecio(cliente.totalGastado)}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
