import { obtenerOrdenesFiltradas } from "@/lib/actions/ordenes-trabajo";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Calendar, Wrench, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { OrdenesFilters } from "@/components/ordenes-trabajo/OrdenesFilters";

export default async function OrdenesTrabajoPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Resolver searchParams si es una promesa (Next.js 15+) o usar directamente
    const resolvedParams = await Promise.resolve(searchParams);

    const query = typeof resolvedParams.query === 'string' ? resolvedParams.query : undefined;
    const clienteId = typeof resolvedParams.clienteId === 'string' ? resolvedParams.clienteId : undefined;
    const estado = typeof resolvedParams.estado === 'string' ? resolvedParams.estado : undefined;

    const { ordenes, total } = await obtenerOrdenesFiltradas({
        query,
        clienteId,
        estado,
        limit: 50 // Por ahora límite fijo
    });

    // Estadísticas (Cálculo simplificado basado en lo visible o requeriría un endpoint separado para stats reales totales)
    // NOTA: Para stats precisos con filtros, idealmente el backend debería devolverlos.
    // Por ahora mantendremos los contadores basados en la lista retornada para reflejar el contexto actual,
    // o podríamos hacer una llamada separada sin filtros si queremos stats globales.
    // Haremos stats sobre lo filtrado para dar feedback inmediato.
    const stats = {
        total: total,
        activas: ordenes.filter(o => ['COTIZANDO', 'ACEPTADA', 'EN_PROCESO'].includes(o.estado)).length,
        completadas: ordenes.filter(o => o.estado === 'COMPLETADA').length,
        porEntregar: ordenes.filter(o => o.estado === 'COMPLETADA' && !o.fechaRealEntrega).length,
    };

    return (
        <div className="min-h-screen bg-[#F8F9FB] p-6 md:p-8 space-y-8 font-sans">
            {/* Header Clean */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-500">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 w-full flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100/90 tracking-tight absolute blur-xl select-none">Órdenes de Trabajo</h1>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight relative">Órdenes de Trabajo</h1>
                        <p className="text-slate-400 mt-1 font-medium">Gestión completa del taller</p>
                    </div>
                    <Link href="/admin/ordenes-trabajo/nueva">
                        <Button className="rounded-xl px-5 h-11 bg-white hover:bg-slate-50 text-slate-900 border shadow-sm font-semibold transition-all">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Orden
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards - Pastel Flat Design */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500 delay-100">
                <StatCard
                    title="Resultados"
                    value={stats.total}
                    subtitle="Órdenes"
                    icon={Wrench}
                    colorClass="bg-slate-100 text-slate-900"
                    iconColorClass="text-slate-500"
                />
                <StatCard
                    title="En Proceso"
                    value={stats.activas}
                    subtitle="Activas"
                    icon={Clock}
                    colorClass="bg-[#E3F2FD] text-blue-900"
                    iconColorClass="text-blue-500"
                />
                <StatCard
                    title="Completadas"
                    value={stats.completadas}
                    subtitle="Finalizadas"
                    icon={CheckCircle}
                    colorClass="bg-[#E8F5E9] text-green-900"
                    iconColorClass="text-green-500"
                />
                <StatCard
                    title="Por Entregar"
                    value={stats.porEntregar}
                    subtitle="Pendientes"
                    icon={Calendar}
                    colorClass="bg-[#FFF3E0] text-orange-900"
                    iconColorClass="text-orange-500"
                />
            </div>

            {/* Advanced Filters Component */}
            <div className="animate-in fade-in duration-500 delay-200">
                <OrdenesFilters />
            </div>

            {/* Data Table */}
            <Card className="border-none shadow-sm overflow-hidden animate-in fade-in duration-500 delay-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white border-b border-slate-100">
                            <tr>
                                <th className="py-5 px-6 font-bold text-slate-800">N° Orden</th>
                                <th className="py-5 px-6 font-bold text-slate-800">Cliente</th>
                                <th className="py-5 px-6 font-bold text-slate-800">Vehículo</th>
                                <th className="py-5 px-6 font-bold text-slate-800">Ingreso</th>
                                <th className="py-5 px-6 font-bold text-slate-800">Estado</th>
                                <th className="py-5 px-6 font-bold text-slate-800">Prioridad</th>
                                <th className="py-5 px-6 font-bold text-slate-800 text-right">Total</th>
                                <th className="py-5 px-6 font-bold text-slate-800 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {ordenes.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-50">
                                            <Search className="h-12 w-12 text-slate-300 mb-2" />
                                            <p className="text-slate-500 font-medium">No se encontraron órdenes con estos filtros</p>
                                            <p className="text-xs text-slate-400 mt-1">Intenta cambiar los criterios de búsqueda</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                ordenes.map((orden) => (
                                    <tr key={orden.$id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="py-4 px-6 font-bold text-slate-800">
                                            {orden.numeroOrden}
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 font-semibold">
                                            {orden.cliente?.nombre || "N/A"}
                                        </td>
                                        <td className="py-4 px-6">
                                            {orden.vehiculo ? (
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-600 text-[11px] bg-slate-100 px-2 py-0.5 rounded w-fit uppercase tracking-wide">
                                                        {orden.vehiculo.placa}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 capitalize">
                                                        {orden.vehiculo.marca.toLowerCase()} {orden.vehiculo.modelo.toLowerCase()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 font-medium">
                                            {new Date(orden.fechaIngreso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="py-4 px-6">
                                            <EstadoBadge estado={orden.estado} />
                                        </td>
                                        <td className="py-4 px-6">
                                            <PrioridadBadge prioridad={orden.prioridad} />
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-slate-900">
                                            ${orden.total.toLocaleString('es-CO')}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <Link href={`/admin/ordenes-trabajo/${orden.$id}`} className="text-slate-400 hover:text-slate-900 font-semibold text-xs transition-colors">
                                                Ver
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

// --- Helpers ---

function StatCard({ title, value, subtitle, icon: Icon, colorClass, iconColorClass }: any) {
    return (
        <Card className={`border-none shadow-sm ${colorClass} transition-transform hover:-translate-y-1 duration-300`}>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium opacity-80">{title}</span>
                    <div className={`p-2 rounded-lg bg-white/50 ${iconColorClass}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                <div className="space-y-1">
                    <h3 className="text-4xl font-bold tracking-tight">{value}</h3>
                    <p className="text-xs font-medium opacity-60 uppercase tracking-wider">{subtitle}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function EstadoBadge({ estado }: { estado: string }) {
    const estilos: Record<string, { bg: string; text: string; label: string; icon?: any }> = {
        'COTIZANDO': { bg: 'bg-amber-400', text: 'text-white', label: 'Cotizando', icon: Clock },
        'ACEPTADA': { bg: 'bg-blue-500', text: 'text-white', label: 'Aceptada', icon: CheckCircle },
        'EN_PROCESO': { bg: 'bg-indigo-500', text: 'text-white', label: 'En Proceso' },
        'POR_PAGAR': { bg: 'bg-slate-200', text: 'text-slate-600', label: '• POR PAGAR' },
        'COMPLETADA': { bg: 'bg-emerald-500', text: 'text-white', label: 'Completada', icon: CheckCircle },
        'CANCELADA': { bg: 'bg-red-500', text: 'text-white', label: 'Cancelada' },
    };

    const estilo = estilos[estado] || { bg: 'bg-slate-200', text: 'text-slate-800', label: estado };
    const Icon = estilo.icon;

    return (
        <Badge className={`${estilo.bg} ${estilo.text} border-0 rounded-full px-3 py-1 font-bold text-[10px] shadow-sm uppercase tracking-wide`}>
            {Icon && <Icon className="h-3 w-3 mr-1" />}
            {estilo.label}
        </Badge>
    );
}

function PrioridadBadge({ prioridad }: { prioridad: string }) {
    if (prioridad === 'URGENTE') {
        return (
            <Badge className="bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold text-[10px] px-2 py-0.5">
                URGENTE
            </Badge>
        );
    }
    return (
        <div className="inline-flex items-center px-2 py-0.5 rounded-lg border border-slate-200 bg-white text-slate-500 text-[10px] font-semibold border-b-2">
            Normal
        </div>
    );
}
