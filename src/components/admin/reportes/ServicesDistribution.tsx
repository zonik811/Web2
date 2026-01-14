import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";
import type { EstadisticaServicio } from "@/lib/actions/reportes";

interface ServicesDistributionProps {
    servicios: EstadisticaServicio[];
}

export function ServicesDistribution({ servicios }: ServicesDistributionProps) {
    // Asegurar datos válidos
    const data = servicios.map(s => ({
        ...s,
        cantidad: s.cantidad || 0
    }));

    return (
        <Card className="border-none shadow-md h-full">
            <CardHeader>
                <CardTitle className="text-base">Distribución por Servicio</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="cantidad"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill || `#${Math.floor(Math.random() * 16777215).toString(16)}`} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function ServicesBarChart({ servicios }: ServicesDistributionProps) {
    const data = servicios.map(s => ({
        ...s,
        cantidad: s.cantidad || 0
    }));

    return (
        <Card className="border-none shadow-md">
            <CardHeader>
                <CardTitle>Análisis de Servicios (Detallado)</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="nombre"
                            type="category"
                            width={120}
                            tick={{ fontSize: 12, fill: "#4B5563" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="cantidad" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={32} background={{ fill: '#F3F4F6' }}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill || "#ec4899"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
