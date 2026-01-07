import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock } from "lucide-react";

export default function PagosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
                <p className="text-gray-600 mt-1">
                    Módulo de pagos a empleados
                </p>
            </div>

            <Card className="border-2 border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-6 w-6 text-gray-400" />
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
                            Este módulo permitirá gestionar los pagos a empleados, calcular pendientes,
                            registrar pagos con comprobantes y ver el historial completo.
                        </p>
                        <div className="mt-6 space-y-2 text-sm text-gray-500">
                            <p>✓ Cálculo automático de pendientes</p>
                            <p>✓ Registro de pagos con comprobante</p>
                            <p>✓ Historial de pagos por empleado</p>
                            <p>✓ Reportes de pagos</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
