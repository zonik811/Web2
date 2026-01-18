"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Search,
    Plus,
    Filter,
    MapPin,
    Briefcase,
    User,
    Phone,
    Mail,
    Edit,
    Trash2,
    Building2,
    Home,
    Users,
    TrendingUp
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { obtenerClientes, crearCliente, actualizarCliente, eliminarCliente } from "@/lib/actions/clientes";
import { obtenerTiposCliente } from "@/lib/actions/parametricas";
import type { Cliente } from "@/types";
import { FrecuenciaCliente } from "@/types";
import { ExportExcelButton } from "@/components/ui/ExportExcelButton";
import { ClientOrderCount } from "@/components/admin/clientes/ClientOrderCount";
import { motion } from "framer-motion";

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    const [tiposCliente, setTiposCliente] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [filters, setFilters] = useState({
        search: "",
        ciudad: "todas",
        tipo: "todos"
    });

    const [formData, setFormData] = useState({
        id: "",
        nombre: "",
        telefono: "",
        email: "",
        direccion: "",
        ciudad: "",
        tipoCliente: "",
        frecuenciaPreferida: FrecuenciaCliente.UNICA,
        notasImportantes: ""
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        aplicarFiltros();
    }, [filters, clientes]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [data, tipos] = await Promise.all([
                obtenerClientes(),
                obtenerTiposCliente()
            ]);
            setClientes(data);
            setTiposCliente(tipos);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let resultado = [...clientes];

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            resultado = resultado.filter(c =>
                c.nombre.toLowerCase().includes(searchLower) ||
                c.email.toLowerCase().includes(searchLower) ||
                c.telefono.includes(searchLower)
            );
        }

        if (filters.ciudad !== "todas") {
            resultado = resultado.filter(c => c.ciudad === filters.ciudad);
        }

        if (filters.tipo !== "todos") {
            resultado = resultado.filter(c =>
                c.tipoCliente?.toLowerCase() === filters.tipo.toLowerCase() ||
                tiposCliente.find(t => t.$id === filters.tipo && t.nombre.toLowerCase() === c.tipoCliente?.toLowerCase())
            );
        }

        setFilteredClientes(resultado);
    };

    const handleEdit = (cliente: Cliente) => {
        setFormData({
            id: cliente.$id,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email,
            direccion: cliente.direccion,
            ciudad: cliente.ciudad,
            tipoCliente: cliente.tipoCliente || "",
            frecuenciaPreferida: cliente.frecuenciaPreferida || FrecuenciaCliente.UNICA,
            notasImportantes: cliente.notasImportantes || ""
        });
        setIsEditing(true);
        setShowDialog(true);
    };

    const handleCreate = () => {
        setFormData({
            id: "",
            nombre: "",
            telefono: "",
            email: "",
            direccion: "",
            ciudad: "",
            tipoCliente: tiposCliente.length > 0 ? tiposCliente[0].nombre : "Residencial",
            frecuenciaPreferida: FrecuenciaCliente.UNICA,
            notasImportantes: ""
        });
        setIsEditing(false);
        setShowDialog(true);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                nombre: formData.nombre,
                telefono: formData.telefono,
                email: formData.email,
                direccion: formData.direccion,
                ciudad: formData.ciudad,
                tipoCliente: formData.tipoCliente,
                frecuenciaPreferida: formData.frecuenciaPreferida,
                notasImportantes: formData.notasImportantes
            };

            if (isEditing) {
                await actualizarCliente(formData.id, payload);
            } else {
                await crearCliente(payload);
            }
            setShowDialog(false);
            cargarDatos();
        } catch (error) {
            console.error("Error guardando cliente:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar este cliente?")) {
            try {
                await eliminarCliente(id);
                cargarDatos();
            } catch (error) {
                console.error("Error eliminando cliente:", error);
            }
        }
    };

    const ciudades = Array.from(new Set(clientes.map(c => c.ciudad))).filter(Boolean).sort();

    const totalClientes = clientes.length;
    const clientesActivos = clientes.filter(c => c.activo).length;
    const statsPorTipo = clientes.reduce((acc: any, curr) => {
        const tipo = curr.tipoCliente || 'Sin Tipo';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Cargando clientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
            {/* Epic Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-rose-50/50" />
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

                <div className="relative px-6 pt-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                                    <Users className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                                        Gestión de Clientes
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">
                                        Administra tu base de datos de clientes y contactos ({filteredClientes.length} clientes)
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider">Total Clientes</p>
                                                <p className="text-5xl font-black mt-2">{totalClientes}</p>
                                                <p className="text-xs text-purple-100 mt-1">{clientesActivos} activos</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <User className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {Object.entries(statsPorTipo).slice(0, 2).map(([tipo, count], idx) => (
                                <motion.div
                                    key={tipo}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                >
                                    <Card className="shadow-lg border-slate-200">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 ${idx === 0 ? 'bg-blue-100' : 'bg-green-100'} rounded-xl`}>
                                                    {idx === 0 ? (
                                                        <Home className="h-6 w-6 text-blue-600" />
                                                    ) : (
                                                        <Building2 className="h-6 w-6 text-green-600" />
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-slate-600 capitalize">{tipo}</p>
                                                    <p className="text-3xl font-black text-slate-900 mt-1">{count as number}</p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-green-500'}`}
                                                    style={{ width: `${totalClientes ? ((count as number) / totalClientes) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}

                            {Object.keys(statsPorTipo).length < 2 && (
                                <Card className="shadow-lg border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center">
                                    <p className="text-slate-400 text-sm">Más estadísticas pronto...</p>
                                </Card>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-3"
                        >
                            <div className="flex gap-3">
                                <ExportExcelButton
                                    data={filteredClientes}
                                    fileName="Reporte_Clientes"
                                    mapData={(c) => ({
                                        Nombre: c.nombre,
                                        Telefono: c.telefono,
                                        Email: c.email,
                                        Direccion: c.direccion,
                                        Ciudad: c.ciudad,
                                        Tipo: c.tipoCliente,
                                        Servicios: c.totalServicios || 0,
                                        Activo: c.activo ? "Si" : "No",
                                        Notas: c.notasImportantes
                                    })}
                                    className="bg-white text-purple-700 border-purple-200 hover:bg-purple-50 shadow-sm"
                                />
                                <Button
                                    size="lg"
                                    onClick={handleCreate}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Nuevo Cliente
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Filters Toolbar */}
                    <Card className="shadow-lg border-slate-200 mb-6">
                        <CardContent className="p-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Filter className="h-4 w-4" />
                                    <span className="text-sm font-medium">Filtrar:</span>
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={filters.ciudad}
                                        onChange={(e) => setFilters({ ...filters, ciudad: e.target.value })}
                                        className="h-10 px-3 bg-slate-50 border-slate-300 border rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none min-w-[140px]"
                                    >
                                        <option value="todas">Todas las Ciudades</option>
                                        {ciudades.map(ciudad => (
                                            <option key={ciudad} value={ciudad}>{ciudad}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={filters.tipo}
                                        onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                                        className="h-10 px-3 bg-slate-50 border-slate-300 border rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none min-w-[140px]"
                                    >
                                        <option value="todos">Todos los Tipos</option>
                                        {tiposCliente.map(t => (
                                            <option key={t.$id} value={t.nombre}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block" />

                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        placeholder="Buscar por nombre, teléfono o email..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="pl-11 h-10 bg-slate-50 border-slate-300 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clients Table */}
                    <Card className="shadow-xl border-slate-200">
                        {filteredClientes.length === 0 ? (
                            <CardContent className="p-12">
                                <div className="text-center">
                                    <div className="bg-slate-50 p-6 rounded-full shadow-inner inline-block mb-4">
                                        <User className="h-16 w-16 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">No se encontraron clientes</h3>
                                    <p className="text-slate-500 mb-6">Intenta ajustar los filtros de búsqueda</p>
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent className="p-6">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-800">Base de Clientes</h3>
                                    <p className="text-sm text-slate-500 mt-1">Listado completo de contactos y clientes</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gradient-to-r from-slate-50 to-purple-50">
                                            <TableRow>
                                                <TableHead className="pl-6 py-4 font-bold text-slate-700">Cliente</TableHead>
                                                <TableHead className="font-bold text-slate-700">Contacto</TableHead>
                                                <TableHead className="font-bold text-slate-700">Ubicación</TableHead>
                                                <TableHead className="font-bold text-slate-700">Tipo</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">Servicios</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">Órdenes</TableHead>
                                                <TableHead className="text-right pr-6 font-bold text-slate-700">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredClientes.map((cliente, index) => (
                                                <motion.tr
                                                    key={cliente.$id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="hover:bg-purple-50/50 transition-colors border-b border-slate-100 last:border-0 group cursor-pointer"
                                                    onClick={() => window.location.href = `/admin/clientes/${cliente.$id}`}
                                                >
                                                    <TableCell className="pl-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                                {cliente.nombre.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                                                                    {cliente.nombre}
                                                                </div>
                                                                <div className="text-xs text-slate-500">ID: ...{cliente.$id.slice(-4)}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col space-y-1">
                                                            <div className="flex items-center text-sm text-slate-700">
                                                                <Phone className="h-3 w-3 mr-2 text-green-600" />
                                                                {cliente.telefono}
                                                            </div>
                                                            <div className="flex items-center text-sm text-slate-500">
                                                                <Mail className="h-3 w-3 mr-2 text-blue-600" />
                                                                {cliente.email}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-slate-700">{cliente.ciudad}</span>
                                                            <span className="text-xs text-slate-500 truncate max-w-[150px]" title={cliente.direccion}>
                                                                {cliente.direccion}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-purple-100 text-purple-700 border-purple-300 capitalize font-semibold px-3 py-1">
                                                            {cliente.tipoCliente || 'Sin Asignar'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className="bg-blue-100 text-blue-700 border-blue-300 font-bold px-3 py-1">
                                                            {cliente.totalServicios || 0}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <ClientOrderCount clienteId={cliente.$id} />
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all shadow-sm">
                                                                    <Edit className="h-5 w-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(cliente); }}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600 focus:text-red-600"
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(cliente.$id); }}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Modifica los datos del cliente seleccionado." : "Ingresa la información para registrar un nuevo cliente."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider border-b pb-1">Información Personal</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label>Nombre Completo</Label>
                                    <Input
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        placeholder="Ej: Juan Pérez"
                                        className="mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label>Teléfono</Label>
                                    <div className="relative mt-1.5">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            value={formData.telefono}
                                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                            placeholder="300 123 4567"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Email</Label>
                                    <div className="relative mt-1.5">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="juan@ejemplo.com"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider border-b pb-1">Ubicación y Perfil</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label>Dirección</Label>
                                    <div className="relative mt-1.5">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            value={formData.direccion}
                                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                            placeholder="Calle 123 # 45-67"
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Ciudad</Label>
                                    <Input
                                        list="ciudades-list"
                                        value={formData.ciudad}
                                        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                        placeholder="Escribe o selecciona..."
                                        className="mt-1.5"
                                    />
                                    <datalist id="ciudades-list">
                                        <option value="Bogotá" />
                                        <option value="Medellín" />
                                        <option value="Cali" />
                                        <option value="Barranquilla" />
                                        <option value="Cartagena" />
                                        <option value="Bucaramanga" />
                                    </datalist>
                                </div>

                                <div>
                                    <Label>Tipo Cliente</Label>
                                    <div className="relative mt-1.5">
                                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-10" />
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={formData.tipoCliente}
                                            onChange={(e) => setFormData({ ...formData, tipoCliente: e.target.value })}
                                        >
                                            <option value="" disabled>Seleccionar Tipo</option>
                                            {tiposCliente.length > 0 ? (
                                                tiposCliente.map(t => (
                                                    <option key={t.$id} value={t.nombre}>{t.nombre}</option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="Residencial">Residencial</option>
                                                    <option value="Comercial">Comercial</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <Label>Notas Adicionales</Label>
                                    <Input
                                        value={formData.notasImportantes}
                                        onChange={(e) => setFormData({ ...formData, notasImportantes: e.target.value })}
                                        placeholder="Preferencias, accesos, etc."
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 min-w-[150px]"
                        >
                            {isEditing ? "Guardar Cambios" : "Crear Cliente"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
