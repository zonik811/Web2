"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { obtenerClientes } from "@/lib/actions/clientes";
import { formatearPrecio } from "@/lib/utils";
import type { Cliente } from "@/types";

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        cargarClientes();
    }, []);

    useEffect(() => {
        filtrarClientes();
    }, [clientes, busqueda]);

    const cargarClientes = async () => {
        try {
            setLoading(true);
            const data = await obtenerClientes();
            setClientes(data);
        } catch (error) {
            console.error("Error cargando clientes:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarClientes = () => {
        let filtrados = clientes;

        if (busqueda) {
            filtrados = filtrados.filter(
                (c) =>
                    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                    c.telefono.includes(busqueda) ||
                    c.email.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        setClientesFiltrados(filtrados);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando clientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                <p className="text-gray-600 mt-1">
                    Gestiona tu base de clientes ({clientesFiltrados.length} total)
                </p>
            </div>

            {/* Búsqueda */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nombre, teléfono o email..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </Card>

            {/* Tabla de Clientes */}
            <Card>
                {clientesFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                            {busqueda
                                ? "No se encontraron clientes"
                                : "No hay clientes registrados"}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Ciudad</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-center">Servicios</TableHead>
                                <TableHead className="text-right">Total Gastado</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clientesFiltrados.map((cliente) => (
                                <TableRow key={cliente.$id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{cliente.nombre}</p>
                                            <p className="text-sm text-gray-500">{cliente.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm">{cliente.telefono}</p>
                                    </TableCell>
                                    <TableCell>{cliente.ciudad}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{cliente.tipoCliente}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {cliente.totalServicios}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatearPrecio(cliente.totalGastado)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={cliente.activo ? "success" : "destructive"}>
                                            {cliente.activo ? "Activo" : "Inactivo"}
                                        </Badge>
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
