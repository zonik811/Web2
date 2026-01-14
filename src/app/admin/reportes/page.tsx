"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    obtenerResumenFinanciero,
    obtenerEstadisticasServicios,
    obtenerRendimientoPersonal,
    obtenerMejoresClientes,
    obtenerCartera,
    obtenerEstadoNomina,
    type ReporteFinancieroMes,
    type EstadisticaServicio,
    type RendimientoEmpleado,
    type ClienteTop,
    type CarteraEstado,
    type EstadoNomina
} from "@/lib/actions/reportes";

// Componentes modulares
import { KPISection } from "@/components/admin/reportes/KPISection";
import { CashFlowChart } from "@/components/admin/reportes/CashFlowChart";
import { TopClientsWidget } from "@/components/admin/reportes/TopClientsWidget";
import { ServicesDistribution, ServicesBarChart } from "@/components/admin/reportes/ServicesDistribution";
import { TopClientsList } from "@/components/admin/reportes/TopClientsList";
import { TeamPerformanceList } from "@/components/admin/reportes/TeamPerformanceList";

export default function ReportesPage() {
    // State for data
    const [finanzas, setFinanzas] = useState<ReporteFinancieroMes[]>([]);
    const [servicios, setServicios] = useState<EstadisticaServicio[]>([]);
    const [personal, setPersonal] = useState<RendimientoEmpleado[]>([]);
    const [clientes, setClientes] = useState<ClienteTop[]>([]);
    const [cartera, setCartera] = useState<CarteraEstado | null>(null);
    const [nomina, setNomina] = useState<EstadoNomina | null>(null);

    // State for filters
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [loading, setLoading] = useState(true);

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    useEffect(() => {
        cargarDatos();
    }, [selectedYear, selectedMonth]);

    const cargarDatos = async () => {
        try {
            setLoading(true);

            // Calculate date range based on filters
            const year = parseInt(selectedYear);
            let startDate: Date;
            let endDate: Date;

            if (selectedMonth === "all") {
                startDate = new Date(year, 0, 1);
                endDate = new Date(year, 11, 31, 23, 59, 59);
            } else {
                const month = parseInt(selectedMonth); // 0-11
                startDate = new Date(year, month, 1);
                endDate = new Date(year, month + 1, 0, 23, 59, 59);
            }

            // Parallel fetching
            const [
                finanzasData,
                serviciosData,
                personalData,
                clientesData,
                carteraData,
                nominaData
            ] = await Promise.all([
                obtenerResumenFinanciero(year),
                obtenerEstadisticasServicios(startDate, endDate),
                obtenerRendimientoPersonal(startDate, endDate),
                obtenerMejoresClientes(startDate, endDate),
                obtenerCartera(startDate, endDate),
                obtenerEstadoNomina(startDate, endDate)
            ]);

            setFinanzas(finanzasData || []);
            setServicios(serviciosData || []);
            setPersonal(personalData || []);
            setClientes(clientesData || []);
            setCartera(carteraData);
            setNomina(nominaData);

        } catch (error) {
            console.error("Error cargando reportes:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 p-6 max-w-[1600px] mx-auto">
            {/* Header and Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reportes Avanzados</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">
                        Inteligencia de negocios y análisis detallado
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center px-3 text-gray-400">
                        <Calendar className="h-4 w-4" />
                    </div>

                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 bg-transparent h-9 text-sm font-medium">
                            <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todo el Año</SelectItem>
                            {months.map((m, i) => (
                                <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="w-px h-4 bg-gray-200" />

                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px] border-none shadow-none focus:ring-0 bg-transparent h-9 text-sm font-medium">
                            <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* KPI Cards */}
                    <KPISection
                        finanzas={finanzas}
                        cartera={cartera}
                        nomina={nomina}
                        selectedMonth={selectedMonth}
                        months={months}
                    />

                    {/* Tabs Section */}
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="bg-gray-100/80 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto justify-start border border-gray-200/50">
                            <TabsTrigger value="overview" className="rounded-lg px-6 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Resumen General</TabsTrigger>
                            <TabsTrigger value="clients" className="rounded-lg px-6 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Mejores Clientes</TabsTrigger>
                            <TabsTrigger value="services" className="rounded-lg px-6 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Servicios</TabsTrigger>
                            <TabsTrigger value="team" className="rounded-lg px-6 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Desempeño Equipo</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <CashFlowChart finanzas={finanzas} />
                                </div>
                                <div className="space-y-6">
                                    <TopClientsWidget clientes={clientes} />
                                    <ServicesDistribution servicios={servicios} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="clients" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <TopClientsList clientes={clientes} />
                        </TabsContent>

                        <TabsContent value="services" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <ServicesBarChart servicios={servicios} />
                        </TabsContent>

                        <TabsContent value="team" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <TeamPerformanceList personal={personal} />
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}
