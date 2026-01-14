"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Briefcase, Award, CreditCard, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParametricList, FieldConfig } from "@/components/admin/config/ParametricList";
import {
    obtenerCargos, crearCargo, actualizarCargo, eliminarCargo,
    obtenerEspecialidades, crearEspecialidad, actualizarEspecialidad, eliminarEspecialidad,
    obtenerMetodosPago, crearMetodoPago, actualizarMetodoPago, eliminarMetodoPago,
    obtenerTiposCliente, crearTipoCliente, actualizarTipoCliente, eliminarTipoCliente
} from "@/lib/actions/parametricas";

export default function ParametricasPage() {
    const [activeTab, setActiveTab] = useState("cargos");
    const [cargos, setCargos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [metodosPago, setMetodosPago] = useState([]);
    const [tiposCliente, setTiposCliente] = useState([]);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        if (activeTab === "cargos") {
            const data = await obtenerCargos();
            setCargos(data as any);
        } else if (activeTab === "especialidades") {
            const data = await obtenerEspecialidades();
            setEspecialidades(data as any);
        } else if (activeTab === "pagos") {
            const data = await obtenerMetodosPago();
            setMetodosPago(data as any);
        } else if (activeTab === "clientes") {
            const data = await obtenerTiposCliente();
            setTiposCliente(data as any);
        }
    };

    const cargoFields: FieldConfig[] = [
        { name: "nombre", label: "Nombre del Cargo", type: "text", required: true, placeholder: "ej. Gerente General" },
        { name: "descripcion", label: "Descripción", type: "text", placeholder: "Breve descripción..." },
        { name: "orden", label: "Orden", type: "number", placeholder: "1" }
    ];

    const especialidadFields: FieldConfig[] = [
        { name: "nombre", label: "Especialidad", type: "text", required: true, placeholder: "ej. Mecánica Diesel" },
        { name: "descripcion", label: "Descripción", type: "text" },
        { name: "orden", label: "Orden", type: "number" }
    ];

    const pagoFields: FieldConfig[] = [
        { name: "nombre", label: "Método de Pago", type: "text", required: true, placeholder: "ej. Transferencia Bancaria" },
        { name: "codigo", label: "Código Interno", type: "text", required: true, placeholder: "TRANSF" },
        { name: "descripcion", label: "Instrucciones", type: "text" },
        { name: "orden", label: "Orden", type: "number" }
    ];

    const clienteFields: FieldConfig[] = [
        { name: "nombre", label: "Tipo de Cliente", type: "text", required: true, placeholder: "ej. Corporativo" },
        { name: "descripcion", label: "Descripción", type: "text" }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/configuracion">
                        <Button variant="ghost" size="icon" className="group rounded-full hover:bg-white hover:shadow-md transition-all">
                            <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración Paramétrica</h1>
                        <p className="text-slate-500 mt-1">Administra las tablas maestras y catálogos del sistema</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-amber-50/50 text-amber-700 px-4 py-2 rounded-full border border-amber-100 text-sm font-medium">
                    <Settings className="h-4 w-4" />
                    <span>Tablas Maestras</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <Tabs defaultValue="cargos" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white/80 p-1 rounded-full border border-slate-200 shadow-sm inline-flex h-auto">
                        <TabsTrigger value="cargos" className="rounded-full px-6 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                            <Briefcase className="h-4 w-4 mr-2" /> Cargos
                        </TabsTrigger>
                        <TabsTrigger value="especialidades" className="rounded-full px-6 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                            <Award className="h-4 w-4 mr-2" /> Especialidades
                        </TabsTrigger>
                        <TabsTrigger value="pagos" className="rounded-full px-6 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                            <CreditCard className="h-4 w-4 mr-2" /> Métodos Pago
                        </TabsTrigger>
                        <TabsTrigger value="clientes" className="rounded-full px-6 py-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                            <Users className="h-4 w-4 mr-2" /> Tipos Cliente
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="cargos" className="space-y-4 outline-none">
                        <ParametricList
                            title="Cargos del Equipo"
                            description="Define los roles laborales disponibles para los miembros del equipo."
                            icon={Briefcase}
                            items={cargos}
                            fields={cargoFields}
                            onAdd={crearCargo}
                            onUpdate={actualizarCargo}
                            onDelete={eliminarCargo}
                            onRefresh={loadData}
                        />
                    </TabsContent>

                    <TabsContent value="especialidades" className="space-y-4 outline-none">
                        <ParametricList
                            title="Especialidades"
                            description="Áreas de especialización para servicios y profesionales."
                            icon={Award}
                            items={especialidades}
                            fields={especialidadFields}
                            onAdd={crearEspecialidad}
                            onUpdate={actualizarEspecialidad}
                            onDelete={eliminarEspecialidad}
                            onRefresh={loadData}
                        />
                    </TabsContent>

                    <TabsContent value="pagos" className="space-y-4 outline-none">
                        <ParametricList
                            title="Métodos de Pago"
                            description="Formas de pago aceptadas en el proceso de checkout y ventas."
                            icon={CreditCard}
                            items={metodosPago}
                            fields={pagoFields}
                            onAdd={crearMetodoPago}
                            onUpdate={actualizarMetodoPago}
                            onDelete={eliminarMetodoPago}
                            onRefresh={loadData}
                        />
                    </TabsContent>

                    <TabsContent value="clientes" className="space-y-4 outline-none">
                        <ParametricList
                            title="Tipos de Cliente"
                            description="Clasificación de clientes para reglas de negocio y reportes."
                            icon={Users}
                            items={tiposCliente}
                            fields={clienteFields}
                            onAdd={crearTipoCliente}
                            onUpdate={(id, data) => actualizarTipoCliente(id, data as any)}
                            onDelete={eliminarTipoCliente}
                            onRefresh={loadData}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
