"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    MoreHorizontal,
    Edit,
    Trash2,
    CheckCircle2,
    X,
    Building2,
    Home
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
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { obtenerClientes, crearCliente, actualizarCliente, eliminarCliente } from "@/lib/actions/clientes";
import { obtenerTiposCliente } from "@/lib/actions/parametricas";
import { formatearPrecio, formatearFecha } from "@/lib/utils";
import type { Cliente } from "@/types";
import { TipoCliente, FrecuenciaCliente } from "@/types";

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    const [tiposCliente, setTiposCliente] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Filtros
    const [filters, setFilters] = useState({
        search: "",
        ciudad: "todas",
        tipo: "todos"
    });

    // Estado del formulario
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
            // Comparación laxa para soportar tipos antiguos vs nuevos IDs
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

    // Stats Dinámicos
    const totalClientes = clientes.length;
    const clientesActivos = clientes.filter(c => c.activo).length;
    // Agrupamos por tipo (normalizando strings)
    const statsPorTipo = clientes.reduce((acc: any, curr) => {
        const tipo = curr.tipoCliente || 'Sin Tipo';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Clientes</h1>
                    <p className="text-gray-500 mt-1">Administra tu base de datos de clientes y contactos</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                >
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
                </Button>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 p-8 bg-white/10 rounded-full blur-2xl"></div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-blue-100 font-medium text-sm flex items-center">
                            <User className="mr-2 h-4 w-4" /> Total Clientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold">{totalClientes}</div>
                        <p className="text-blue-100/80 text-sm mt-1">{clientesActivos} activos actualmente</p>
                    </CardContent>
                </Card>

                {/* Stats for Types - Dynamic now */}
                {Object.entries(statsPorTipo).slice(0, 2).map(([tipo, count], idx) => (
                    <Card key={tipo} className="border-none shadow-md bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-gray-500 font-medium text-sm flex items-center capitalize">
                                {idx === 0 ? <Home className="mr-2 h-4 w-4" /> : <Building2 className="mr-2 h-4 w-4" />}
                                {tipo}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900">{count as number}</div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${totalClientes ? ((count as number) / totalClientes) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {/* Fill empty card if fewer than 2 types */}
                {Object.keys(statsPorTipo).length < 2 && (
                    <Card className="border-none shadow-md bg-gray-50/50 border-dashed border-2 border-gray-200 flex items-center justify-center">
                        <p className="text-gray-400 text-sm">Más estadísticas pronto...</p>
                    </Card>
                )}
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filtrar:</span>
                </div>

                <div className="flex gap-2">
                    <select
                        value={filters.ciudad}
                        onChange={(e) => setFilters({ ...filters, ciudad: e.target.value })}
                        className="h-9 px-3 bg-gray-50 border-gray-200 border rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-w-[140px]"
                    >
                        <option value="todas">Todas las Ciudades</option>
                        {ciudades.map(ciudad => (
                            <option key={ciudad} value={ciudad}>{ciudad}</option>
                        ))}
                    </select>

                    <select
                        value={filters.tipo}
                        onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                        className="h-9 px-3 bg-gray-50 border-gray-200 border rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-w-[140px]"
                    >
                        <option value="todos">Todos los Tipos</option>
                        {tiposCliente.map(t => (
                            <option key={t.$id} value={t.nombre}>{t.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block"></div>

                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nombre, teléfono o email..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full h-9 pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                </div>
            </div>

            {/* Clients Table */}
            <Card className="border-none shadow-md overflow-hidden bg-white">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="font-semibold text-gray-600 pl-6">Cliente</TableHead>
                                <TableHead className="font-semibold text-gray-600">Contacto</TableHead>
                                <TableHead className="font-semibold text-gray-600">Ubicación</TableHead>
                                <TableHead className="font-semibold text-gray-600">Tipo</TableHead>
                                <TableHead className="font-semibold text-gray-600 text-center">Servicios</TableHead>
                                <TableHead className="font-semibold text-gray-600 text-right pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                        Cargando clientes...
                                    </TableCell>
                                </TableRow>
                            ) : filteredClientes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                        <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <User className="h-8 w-8 text-gray-300" />
                                        </div>
                                        <p className="font-medium text-gray-900">No se encontraron clientes</p>
                                        <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClientes.map((cliente) => (
                                    <TableRow
                                        key={cliente.$id}
                                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                        onClick={() => window.location.href = `/admin/clientes/${cliente.$id}`}
                                    >
                                        <TableCell className="pl-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                    {cliente.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {cliente.nombre}
                                                    </div>
                                                    <div className="text-xs text-gray-500">ID: ...{cliente.$id.slice(-4)}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="h-3 w-3 mr-2" /> {cliente.telefono}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Mail className="h-3 w-3 mr-2" /> {cliente.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700">{cliente.ciudad}</span>
                                                <span className="text-xs text-gray-500 truncate max-w-[150px]" title={cliente.direccion}>
                                                    {cliente.direccion}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                                                {cliente.tipoCliente || 'Sin Asignar'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {cliente.totalServicios || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 group-hover:text-gray-600">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(cliente)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(cliente.$id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog Premium */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Modifica los datos del cliente seleccionado." : "Ingresa la información para registrar un nuevo cliente."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider border-b pb-1">Información Personal</h3>
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
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider border-b pb-1">Ubicación y Perfil</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label>Dirección</Label>
                                    <div className="relative mt-1.5">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
                                        <option value="Pereira" />
                                        <option value="Manizales" />
                                    </datalist>
                                </div>

                                <div>
                                    <Label>Tipo Cliente</Label>
                                    <div className="relative mt-1.5">
                                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 z-10" />
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        placeholder="Preferencias, accessos, etc."
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
                        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
                            {isEditing ? "Guardar Cambios" : "Crear Cliente"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
