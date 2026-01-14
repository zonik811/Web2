import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatearPrecio } from "@/lib/utils";
import type { RendimientoEmpleado } from "@/lib/actions/reportes";

interface TeamPerformanceListProps {
    personal: RendimientoEmpleado[];
}

export function TeamPerformanceList({ personal }: TeamPerformanceListProps) {
    return (
        <Card className="border-none shadow-md">
            <CardHeader>
                <CardTitle>Productividad del Equipo</CardTitle>
                <CardDescription>Rendimiento basado en servicios completados e ingresos generados</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {personal.map((emp) => (
                        <div key={emp.empleadoId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                <Avatar className="h-10 w-10 border border-gray-200">
                                    <AvatarFallback className="bg-slate-50 text-slate-700 font-bold text-sm">
                                        {(emp.nombre || "E").substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-bold text-gray-900">{emp.nombre || "Empleado"}</div>
                                    <div className="text-xs text-gray-500 font-medium">
                                        {emp.serviciosCompletados || 0} servicios completados
                                    </div>
                                </div>
                            </div>
                            <div className="text-right pl-14 sm:pl-0">
                                <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                                    Generado: {formatearPrecio(emp.totalGenerado || 0)}
                                </div>
                            </div>
                        </div>
                    ))}
                    {personal.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No hay datos de rendimiento disponibles.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
