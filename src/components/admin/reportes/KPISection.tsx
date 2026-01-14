import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, DollarSign, Wallet, TrendingUp } from "lucide-react";
import { formatearPrecio } from "@/lib/utils";
import type { CarteraEstado, EstadoNomina, ReporteFinancieroMes } from "@/lib/actions/reportes";

interface KPISectionProps {
    finanzas: ReporteFinancieroMes[];
    cartera: CarteraEstado | null;
    nomina: EstadoNomina | null;
    selectedMonth: string;
    months: string[];
}

export function KPISection({ finanzas, cartera, nomina, selectedMonth, months }: KPISectionProps) {
    // Validar y calcular totales seguros
    const totalIngresos = finanzas.reduce((acc, curr) => acc + (curr.ingresos || 0), 0);
    const totalGastos = finanzas.reduce((acc, curr) => acc + (curr.gastos || 0), 0);
    const beneficioNeto = totalIngresos - totalGastos;

    // Cálculo seguro de margen
    const margenNeto = totalIngresos > 0
        ? ((beneficioNeto / totalIngresos) * 100).toFixed(1)
        : "0.0";

    // Cálculo seguro de % nómina
    const porcentajeNomina = (nomina?.totalGenerado && nomina.totalGenerado > 0)
        ? Math.round(((nomina.totalPagado || 0) / nomina.totalGenerado) * 100)
        : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cuentas Por Cobrar */}
            <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5" /> Cuentas x Cobrar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                        {formatearPrecio(cartera?.totalPorCobrar || 0)}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <p className="text-xs text-orange-700/80 font-medium">
                            {cartera?.citasPendientesPago || 0} facturas pendientes
                        </p>
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                            {cartera?.antiguedadPromedioDias || 0} dias prom.
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Facturación */}
            <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5" /> Facturación
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                        {formatearPrecio(totalIngresos)}
                    </div>
                    <p className="text-xs text-blue-600/80 mt-2 font-medium">
                        {selectedMonth === 'all' ? 'Total anual acumulado' : `Total ${months[parseInt(selectedMonth)] || ''}`}
                    </p>
                </CardContent>
            </Card>

            {/* Nómina Estimada */}
            <Card className="bg-gradient-to-br from-white to-violet-50 border-violet-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-violet-600 uppercase tracking-widest flex items-center gap-2">
                        <Wallet className="h-3.5 w-3.5" /> Nómina Est.
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                        {formatearPrecio(nomina?.totalGenerado || 0)}
                    </div>
                    <div className="w-full bg-violet-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div
                            className="bg-violet-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${porcentajeNomina}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-violet-600/70 font-medium">Progreso de pago</span>
                        <span className="text-[10px] text-violet-700 font-bold">{porcentajeNomina}% Pagado</span>
                    </div>
                </CardContent>
            </Card>

            {/* Net Profit */}
            <Card className="bg-gradient-to-br from-white to-emerald-50 border-emerald-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5" /> Net Profit
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${beneficioNeto >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {formatearPrecio(beneficioNeto)}
                    </div>
                    <p className="text-xs text-emerald-600/80 mt-2 font-medium">
                        Margen Neto: {margenNeto}%
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
