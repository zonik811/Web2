import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock } from "lucide-react";

export default function ReportesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
                <p className="text-gray-600 mt-1">
                    Análisis y reportes del negocio
                </p>
            </div>

            <Card className="border-2 border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-6 w-6 text-gray-400" />
                        <span>Módulo en Desarrollo</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Próximamente
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Este módulo incluirá reportes detallados, gráficos y análisis del
                            rendimiento del negocio.
                        </p>
                        <div className="mt-6 space-y-2 text-sm text-gray-500">
                            <p>✓ Ingresos por periodo</p>
                            <p>✓ Servicios más solicitados</p>
                            <p>✓ Rendimiento de empleados</p>
                            <p>✓ Análisis de rentabilidad</p>
                            <p>✓ Exportación a PDF/Excel</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
