import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { formatearPrecio } from "@/lib/utils";
import type { ReporteFinancieroMes } from "@/lib/actions/reportes";

interface CashFlowChartProps {
    finanzas: ReporteFinancieroMes[];
}

export function CashFlowChart({ finanzas }: CashFlowChartProps) {
    // Validar datos para evitar errores en gráfico
    const data = finanzas.map(f => ({
        ...f,
        ingresos: f.ingresos || 0,
        gastos: f.gastos || 0
    }));

    return (
        <Card className="border-none shadow-md">
            <CardHeader>
                <CardTitle>Flujo de Caja</CardTitle>
                <CardDescription>Ingresos vs Gastos Mensuales</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="mes"
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `$${v / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => [formatearPrecio(value as number), ""]}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar
                            dataKey="ingresos"
                            name="Ingresos"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                        />
                        <Bar
                            dataKey="gastos"
                            name="Gastos"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
