import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Clock } from "lucide-react";

export default function ServiciosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Servicios</h1>
                <p className="text-gray-600 mt-1">
                    Catálogo de servicios ofrecidos
                </p>
            </div>

            <Card className="border-2 border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Sparkles className="h-6 w-6 text-gray-400" />
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
                            Este módulo permitirá gestionar el catálogo de servicios, precios,
                            descripciones, imágenes y configuraciones.
                        </p>
                        <div className="mt-6 space-y-2 text-sm text-gray-500">
                            <p>✓ CRUD completo de servicios</p>
                            <p>✓ Configuración de precios y duraciones</p>
                            <p>✓ Upload de imágenes</p>
                            <p>✓ Gestión de características</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
