"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Wrench, Sparkles, CreditCard, Users } from "lucide-react";
import {
    obtenerCargos,
    crearCargo,
    actualizarCargo,
    eliminarCargo,
    obtenerEspecialidades,
    crearEspecialidad,
    actualizarEspecialidad,
    eliminarEspecialidad,
    obtenerMetodosPago,
    crearMetodoPago,
    actualizarMetodoPago,
    eliminarMetodoPago,
    obtenerTiposCliente,
    crearTipoCliente,
    actualizarTipoCliente,
    eliminarTipoCliente
} from "@/lib/actions/parametricas";
import { useToast } from "@/lib/hooks/use-toast";
import { CargosTab } from "./components/CargosTab";
import { EspecialidadesTab } from "./components/EspecialidadesTab";
import { MetodosPagoTab } from "./components/MetodosPagoTab";
import { TiposClienteTab } from "./components/TiposClienteTab";

export default function ParametricasPage() {
    const [cargos, setCargos] = useState<any[]>([]);
    const [especialidades, setEspecialidades] = useState<any[]>([]);
    const [metodosPago, setMetodosPago] = useState<any[]>([]);
    const [tiposCliente, setTiposCliente] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [cargosData, especialidadesData, metodosPagoData, tiposData] = await Promise.all([
                obtenerCargos(),
                obtenerEspecialidades(),
                obtenerMetodosPago(),
                obtenerTiposCliente()
            ]);
            setCargos(cargosData);
            setEspecialidades(especialidadesData);
            setMetodosPago(metodosPagoData);
            setTiposCliente(tiposData);
        } catch (error) {
            toast({ title: "Error", description: "Error cargando datos", variant: "destructive" });
        } finally {
            if (!silent) setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Cargando paramétricas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header con gradiente */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white">Paramétricas</h1>
                            <p className="text-blue-100 text-lg">Gestiona cargos, especialidades y métodos de pago</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs mejorados */}
            <Tabs defaultValue="cargos" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-14 bg-gradient-to-r from-gray-100 to-gray-50 p-1 rounded-xl shadow-inner">
                    <TabsTrigger
                        value="cargos"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all font-semibold"
                    >
                        <Briefcase className="w-5 h-5 mr-2" />
                        Cargos ({cargos.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="especialidades"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all font-semibold"
                    >
                        <Wrench className="w-5 h-5 mr-2" />
                        Especialidades ({especialidades.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="metodos-pago"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all font-semibold"
                    >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Métodos ({metodosPago.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="tipos-cliente"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all font-semibold"
                    >
                        <Users className="w-5 h-5 mr-2" />
                        Tipos Cliente ({tiposCliente.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="cargos" className="mt-6">
                    <CargosTab
                        cargos={cargos}
                        onDataChange={() => loadData(true)}
                        crearCargo={crearCargo}
                        actualizarCargo={actualizarCargo}
                        eliminarCargo={eliminarCargo}
                    />
                </TabsContent>

                <TabsContent value="especialidades" className="mt-6">
                    <EspecialidadesTab
                        especialidades={especialidades}
                        onDataChange={() => loadData(true)}
                        crearEspecialidad={crearEspecialidad}
                        actualizarEspecialidad={actualizarEspecialidad}
                        eliminarEspecialidad={eliminarEspecialidad}
                    />
                </TabsContent>

                <TabsContent value="metodos-pago" className="mt-6">
                    <MetodosPagoTab
                        metodosPago={metodosPago}
                        onDataChange={() => loadData(true)}
                        crearMetodoPago={crearMetodoPago}
                        actualizarMetodoPago={actualizarMetodoPago}
                        eliminarMetodoPago={eliminarMetodoPago}
                    />
                </TabsContent>

                <TabsContent value="tipos-cliente" className="mt-6">
                    <TiposClienteTab
                        tipos={tiposCliente}
                        onDataChange={() => loadData(true)}
                        crearTipo={crearTipoCliente}
                        actualizarTipo={actualizarTipoCliente}
                        eliminarTipo={eliminarTipoCliente}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
