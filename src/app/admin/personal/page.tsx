"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search, Users as UsersIcon } from "lucide-react";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { obtenerURLArchivo } from "@/lib/appwrite";
import { nombreCompleto } from "@/lib/utils";
import type { Empleado, CargoEmpleado } from "@/types";
import { Input } from "@/components/ui/input";

export default function PersonalPage() {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState<"todos" | "activos" | "inactivos">("activos");

    useEffect(() => {
        cargarEmpleados();
    }, []);

    useEffect(() => {
        filtrarEmpleados();
    }, [empleados, busqueda, filtro]);

    const cargarEmpleados = async () => {
        try {
            setLoading(true);
            const data = await obtenerEmpleados();
            setEmpleados(data);
        } catch (error) {
            console.error("Error cargando empleados:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarEmpleados = () => {
        let filtrados = empleados;

        // Filtro por estado
        if (filtro === "activos") {
            filtrados = filtrados.filter((e) => e.activo);
        } else if (filtro === "inactivos") {
            filtrados = filtrados.filter((e) => !e.activo);
        }

        // Búsqueda por nombre
        if (busqueda) {
            filtrados = filtrados.filter((e) =>
                nombreCompleto(e.nombre, e.apellido)
                    .toLowerCase()
                    .includes(busqueda.toLowerCase())
            );
        }

        setEmpleadosFiltrados(filtrados);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando personal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Personal</h1>
                    <p className="text-gray-600 mt-1">
                        Gestiona tu equipo de trabajo ({empleadosFiltrados.length} empleados)
                    </p>
                </div>
                <Link href="/admin/personal/nuevo">
                    <Button size="lg">
                        <Plus className="h-5 w-5 mr-2" />
                        Nuevo Empleado
                    </Button>
                </Link>
            </div>

            {/* Filtros */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nombre..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={filtro === "activos" ? "default" : "outline"}
                            onClick={() => setFiltro("activos")}
                        >
                            Activos
                        </Button>
                        <Button
                            variant={filtro === "todos" ? "default" : "outline"}
                            onClick={() => setFiltro("todos")}
                        >
                            Todos
                        </Button>
                        <Button
                            variant={filtro === "inactivos" ? "default" : "outline"}
                            onClick={() => setFiltro("inactivos")}
                        >
                            Inactivos
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Tabla de empleados */}
            <Card>
                {empleadosFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                        <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                            {busqueda
                                ? "No se encontraron empleados con ese nombre"
                                : "No hay empleados registrados"}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Empleado</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Especialidades</TableHead>
                                <TableHead>Servicios</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {empleadosFiltrados.map((empleado) => (
                                <TableRow key={empleado.$id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar>
                                                {empleado.foto && (
                                                    <AvatarImage
                                                        src={obtenerURLArchivo(empleado.foto)}
                                                        alt={nombreCompleto(empleado.nombre, empleado.apellido)}
                                                    />
                                                )}
                                                <AvatarFallback>
                                                    {empleado.nombre[0]}
                                                    {empleado.apellido[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">
                                                    {nombreCompleto(empleado.nombre, empleado.apellido)}
                                                </p>
                                                <p className="text-sm text-gray-500">{empleado.telefono}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{empleado.cargo}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {empleado.especialidades.slice(0, 2).map((esp, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {esp}
                                                </Badge>
                                            ))}
                                            {empleado.especialidades.length > 2 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{empleado.especialidades.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {empleado.totalServicios}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={empleado.activo ? "success" : "destructive"}>
                                            {empleado.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/personal/${empleado.$id}`}>
                                            <Button variant="outline" size="sm">
                                                Ver Perfil
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
}
