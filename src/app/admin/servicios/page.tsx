"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Pencil,
    Trash2,
    Briefcase,
    Search,
    Loader2,
    DollarSign,
    CheckCircle2,
    XCircle,
    Image as ImageIcon,
    Clock,
    Save,
    Sparkles,
    Image,
    Home,
    Building2,
    Tag
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { obtenerServiciosAdmin, crearServicio, actualizarServicio, eliminarServicio } from "@/lib/actions/servicios";
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria, type Categoria } from "@/lib/actions/categorias";
import { type Servicio } from "@/types";
import { obtenerURLArchivo } from "@/lib/appwrite";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ServiciosPage() {
    const { toast } = useToast();
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingService, setEditingService] = useState<Servicio | null>(null);
    const [categoriaInputFocus, setCategoriaInputFocus] = useState(false);

    // Form Data
    // Form Data
    const initialFormState = {
        nombre: "",
        descripcion: "",
        descripcionCorta: "",
        categoria: "", // Legacy/Primary
        categorias: [] as string[], // Multi-select
        precioBase: 0,
        unidadPrecio: "servicio" as "servicio" | "hora" | "metrocuadrado",
        duracionEstimada: 60,
        caracteristicas: "",
        requierePersonal: 1,
        activo: true,
        imagen: undefined as File | undefined
    };

    const [formData, setFormData] = useState(initialFormState);
    const [dragActive, setDragActive] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Helper to save category (Create/Update)
    const handleSaveCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            if (editingCategory) {
                // Update
                const res = await actualizarCategoria(editingCategory.$id, newCategoryName);
                if (res.success) {
                    toast({ title: "Categoría actualizada", className: "bg-green-50 border-green-200" });
                } else {
                    toast({ title: "Error", description: res.error, variant: "destructive" });
                }
            } else {
                // Create
                const res = await crearCategoria(newCategoryName);
                if (res.success) {
                    toast({ title: "Categoría creada", className: "bg-green-50 border-green-200" });
                } else {
                    toast({ title: "Error", description: res.error, variant: "destructive" });
                }
            }
            setIsCategoryModalOpen(false);
            cargarDatos(); // Refresh list
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Ocurrió un error inesperado", variant: "destructive" });
        }
    };

    // Helper to delete category
    const handleDeleteCategory = async () => {
        if (!editingCategory) return;
        if (!confirm("¿Estás seguro de que quieres eliminar esta categoría? Desaparecerá de la lista de selección, pero no afectará a los servicios que ya la tienen asignada (aunque no podrán volver a seleccionarla).")) return;

        try {
            const res = await eliminarCategoria(editingCategory.$id);
            if (res.success) {
                toast({ title: "Categoría eliminada", className: "bg-green-50 border-green-200" });
                setIsCategoryModalOpen(false);
                cargarDatos();
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
        }
    };

    // Editing Category Interactions
    const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const toggleCategory = (catName: string) => {
        setFormData(prev => {
            const current = prev.categorias || [];
            if (current.includes(catName)) {
                return { ...prev, categorias: current.filter(c => c !== catName) };
            } else {
                return { ...prev, categorias: [...current, catName] };
            }
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setFormData({ ...formData, imagen: file });
            const url = URL.createObjectURL(file);
            setPreviewImage(url);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, imagen: file });
            const url = URL.createObjectURL(file);
            setPreviewImage(url);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [serviciosData, categoriasData] = await Promise.all([
                obtenerServiciosAdmin(),
                obtenerCategorias()
            ]);
            setServicios(serviciosData);
            setCategorias(categoriasData);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingService(null);
        setFormData(initialFormState);
        setPreviewImage(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (servicio: Servicio) => {
        setEditingService(servicio);

        // Handle migration/fallback for categories
        let currentCats: string[] = [];
        if (servicio.categorias && servicio.categorias.length > 0) {
            currentCats = servicio.categorias;
        } else if (servicio.categoria) {
            currentCats = [servicio.categoria];
        }

        setFormData({
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            descripcionCorta: servicio.descripcionCorta || "",
            categoria: servicio.categoria,
            categorias: currentCats,
            precioBase: servicio.precioBase,
            unidadPrecio: servicio.unidadPrecio,
            duracionEstimada: servicio.duracionEstimada,
            caracteristicas: servicio.caracteristicas.join(", "),
            requierePersonal: servicio.requierePersonal,
            activo: servicio.activo,
            imagen: undefined
        });
        setPreviewImage(null);
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Check if category exists or needs creation
            let categoriaToUse = formData.categoria;
            const existingCat = categorias.find(c => c.nombre.toLowerCase() === categoriaToUse.toLowerCase());

            if (!existingCat && categoriaToUse.trim()) {
                // Auto-create new category
                const newCatRes = await crearCategoria(categoriaToUse);
                if (newCatRes.success && newCatRes.data) {
                    setCategorias(prev => [...prev, newCatRes.data!]);
                    categoriaToUse = newCatRes.data.nombre; // Ensure case consistency
                    toast({ title: "Categoría creada", description: `Se ha creado la categoría "${categoriaToUse}"`, className: "bg-blue-50 border-blue-200" });
                }
            }

            const caracteristicasArray = formData.caracteristicas
                .split(",")
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const payload: any = {
                ...formData,
                categoria: categoriaToUse,
                caracteristicas: caracteristicasArray
            };

            let result;
            if (editingService) {
                result = await actualizarServicio({
                    id: editingService.$id,
                    ...payload
                });
            } else {
                result = await crearServicio(payload);
            }

            if (result.success) {
                toast({
                    title: "Éxito",
                    description: `Servicio ${editingService ? 'actualizado' : 'creado'} correctamente`,
                    className: "bg-green-50 border-green-200"
                });
                setModalOpen(false);
                cargarDatos(); // Refresh both services and categories
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Error al guardar el servicio",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este servicio?")) return;

        try {
            const result = await eliminarServicio(id);
            if (result.success) {
                toast({ title: "Servicio eliminado", className: "bg-green-50 border-green-200" });
                cargarDatos();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    // Filter logic
    const filteredServicios = servicios.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 p-2">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 tracking-tight">
                        Servicios
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Diseña y gestiona el catálogo de experiencias para tus clientes.
                    </p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all hover:scale-105 h-12 px-6 rounded-xl text-base font-semibold"
                >
                    <Plus className="mr-2 h-5 w-5" /> Nuevo Servicio
                </Button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <Input
                        placeholder="Buscar por nombre o categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-gray-200 bg-white shadow-sm focus:border-purple-300 focus:ring-purple-200 transition-all text-base"
                    />
                </div>
            </div>

            {/* Content Card */}
            <Card className="border-0 shadow-xl shadow-gray-100/50 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                            <Loader2 className="h-10 w-10 animate-spin mb-4 text-purple-600" />
                            <p className="font-medium animate-pulse">Cargando catálogo...</p>
                        </div>
                    ) : filteredServicios.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                                <Briefcase className="h-10 w-10 text-purple-200" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Sin servicios aún</h3>
                            <p className="text-gray-500 max-w-sm">
                                Empieza creando tu primer servicio para que aparezca en el catálogo.
                            </p>
                            <Button
                                variant="link"
                                onClick={handleOpenCreate}
                                className="mt-4 text-purple-600 font-semibold"
                            >
                                Crear ahora
                            </Button>
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/80 border-b border-gray-100">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[80px] py-4 pl-6">Imagen</TableHead>
                                        <TableHead className="py-4">Servicio</TableHead>
                                        <TableHead className="py-4">Categoría</TableHead>
                                        <TableHead className="py-4">Precio & Unidad</TableHead>
                                        <TableHead className="py-4">Duración</TableHead>
                                        <TableHead className="py-4">Estado</TableHead>
                                        <TableHead className="py-4 text-right pr-6">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredServicios.map((servicio) => (
                                        <TableRow key={servicio.$id} className="hover:bg-purple-50/30 transition-colors border-b border-gray-50">
                                            <TableCell className="pl-6 py-4">
                                                <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm ring-1 ring-gray-100">
                                                    <AvatarImage src={servicio.imagen ? obtenerURLArchivo(servicio.imagen) : ""} className="object-cover" />
                                                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-purple-100 to-indigo-50 text-purple-600">
                                                        {servicio.nombre.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="font-bold text-gray-800 text-base">{servicio.nombre}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-[200px] font-normal">{servicio.descripcionCorta || "Sin descripción corta"}</div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className="capitalize bg-white border-gray-200 text-gray-600 px-3 py-1 text-xs font-medium rounded-lg">
                                                    {servicio.categoria}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-base bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md w-fit">
                                                        ${servicio.precioBase.toLocaleString()}
                                                    </span>
                                                    <span className="text-xs text-gray-400 mt-1 pl-1">
                                                        / {servicio.unidadPrecio.replace("metrocuadrado", "m²")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center text-gray-600 gap-1.5 bg-gray-50 px-2 py-1 rounded-md w-fit">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-sm font-medium">{servicio.duracionEstimada} min</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {servicio.activo ? (
                                                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50/50 px-2 py-1 rounded-full border border-emerald-100 w-fit">
                                                        <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
                                                        <span className="text-xs font-bold">Activo</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100 w-fit">
                                                        <XCircle className="w-4 h-4 fill-gray-200" />
                                                        <span className="text-xs font-bold">Inactivo</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEdit(servicio)}
                                                        className="h-8 w-8 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-lg transition-all"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(servicio.$id)}
                                                        className="h-8 w-8 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Crear/Editar */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-3xl overflow-hidden border-0 shadow-2xl">

                    {/* Header Modal */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            {editingService ? <Pencil className="w-6 h-6 text-purple-200" /> : <Sparkles className="w-6 h-6 text-purple-200" />}
                            {editingService ? "Editar Servicio" : "Nuevo Servicio"}
                        </DialogTitle>
                        <DialogDescription className="text-purple-100 mt-2 text-base">
                            Configura los detalles del servicio que se mostrarán en el catálogo y en las citas.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 bg-gray-50/50">
                        <Tabs defaultValue="info" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-gray-200/50 rounded-xl">
                                <TabsTrigger value="info" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all duration-200">
                                    <Briefcase className="w-4 h-4 mr-2" /> Información
                                </TabsTrigger>
                                <TabsTrigger value="precios" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all duration-200">
                                    <DollarSign className="w-4 h-4 mr-2" /> Precios
                                </TabsTrigger>
                                <TabsTrigger value="detalles" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all duration-200">
                                    <Image className="w-4 h-4 mr-2" /> Detalles
                                </TabsTrigger>
                            </TabsList>

                            {/* TAB 1: INFORMACIÓN BÁSICA */}
                            <TabsContent value="info" className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre" className="text-gray-700 font-semibold text-lg">Nombre del Servicio *</Label>
                                        <Input
                                            id="nombre"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            required
                                            placeholder="Ej: Limpieza Profunda Premium"
                                            className="h-14 rounded-xl text-lg bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-gray-700 font-semibold block">Categorías</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-purple-600 h-8 px-2 text-xs hover:bg-purple-50"
                                                onClick={() => {
                                                    setEditingCategory(null);
                                                    setNewCategoryName("");
                                                    setIsCategoryModalOpen(true);
                                                }}
                                            >
                                                <Plus className="w-3 h-3 mr-1" /> Nueva Categoría
                                            </Button>
                                        </div>

                                        {/* Selector Visual de Categorías - Full Width */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                            {categorias.map((cat) => {
                                                // Icon mapping rough logic
                                                let Icon = Tag;
                                                const lower = cat.nombre.toLowerCase();
                                                if (lower.includes('residencial') || lower.includes('hogar') || lower.includes('casa')) Icon = Home;
                                                else if (lower.includes('comercial') || lower.includes('oficina') || lower.includes('edificio')) Icon = Building2;
                                                else if (lower.includes('especial') || lower.includes('unico')) Icon = Sparkles;

                                                const isSelected = formData.categorias?.includes(cat.nombre) || formData.categoria === cat.nombre;

                                                return (
                                                    <div
                                                        key={cat.$id}
                                                        onClick={() => toggleCategory(cat.nombre)}
                                                        className={`relative cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] group ${isSelected
                                                            ? 'border-purple-600 bg-purple-50 shadow-md ring-2 ring-purple-100'
                                                            : 'border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm'
                                                            }`}
                                                    >
                                                        <div className={`p-3 rounded-full transition-colors ${isSelected ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
                                                            <Icon className="w-6 h-6" />
                                                        </div>
                                                        <span className={`font-bold text-sm text-center ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                                                            {cat.nombre}
                                                        </span>

                                                        {/* Edit Button (Visible on Hover) */}
                                                        <div
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-full"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingCategory(cat);
                                                                setNewCategoryName(cat.nombre);
                                                                setIsCategoryModalOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="w-3 h-3 text-gray-400 hover:text-purple-600" />
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Add New Card (Alternative access) */}
                                            <div
                                                onClick={() => {
                                                    setEditingCategory(null);
                                                    setNewCategoryName("");
                                                    setIsCategoryModalOpen(true);
                                                }}
                                                className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:border-purple-400 hover:bg-purple-50 group"
                                            >
                                                <div className="p-3 rounded-full bg-gray-50 text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                                                    <Plus className="w-6 h-6" />
                                                </div>
                                                <span className="font-semibold text-sm text-gray-500 group-hover:text-purple-700">
                                                    Crear Nueva
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 px-1">
                                            Selecciona una o más categorías que apliquen a este servicio.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="requierePersonal" className="text-gray-700 font-semibold">Personal Requerido</Label>
                                            <Input
                                                id="requierePersonal"
                                                type="number"
                                                value={formData.requierePersonal}
                                                onChange={(e) => setFormData({ ...formData, requierePersonal: Number(e.target.value) })}
                                                required
                                                min="1"
                                                className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="activo" className="text-gray-700 font-semibold">Visibilidad</Label>
                                            <div className="h-12 flex items-center gap-3 px-4 rounded-xl border border-gray-200 bg-gray-50">
                                                <div className={`w-3 h-3 rounded-full ${formData.activo ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`}></div>
                                                <span className="text-sm font-medium text-gray-600">
                                                    {formData.activo ? 'Servicio Activo y Visible' : 'Servicio Oculto/Inactivo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB 2: PRECIOS */}
                            <TabsContent value="precios" className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                <div className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label htmlFor="precioBase" className="text-gray-700 font-semibold">Precio Base</Label>
                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl group-focus-within:text-purple-600 transition-colors">$</span>
                                                <Input
                                                    id="precioBase"
                                                    type="number"
                                                    value={formData.precioBase}
                                                    onChange={(e) => setFormData({ ...formData, precioBase: Number(e.target.value) })}
                                                    required
                                                    min="0"
                                                    className="h-14 pl-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white font-mono text-2xl font-bold text-gray-800"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 pl-1">Precio mínimo antes de adicionales.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="unidadPrecio" className="text-gray-700 font-semibold">Modo de Cobro</Label>
                                            <select
                                                id="unidadPrecio"
                                                className="flex h-14 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-base focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                                value={formData.unidadPrecio}
                                                onChange={(e) => setFormData({ ...formData, unidadPrecio: e.target.value as any })}
                                                required
                                            >
                                                <option value="servicio">Por Servicio Completo</option>
                                                <option value="hora">Por Hora Trabajada</option>
                                                <option value="metrocuadrado">Por Metro Cuadrado (m²)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="duracionEstimada" className="text-gray-700 font-semibold text-lg">
                                                    Duración Estimada
                                                </Label>
                                                <span className="px-4 py-1 bg-purple-100 text-purple-700 font-bold rounded-full text-sm">
                                                    {Math.floor(formData.duracionEstimada / 60)}h {formData.duracionEstimada % 60}m
                                                </span>
                                            </div>

                                            <Input
                                                id="duracionEstimada"
                                                type="range"
                                                min="15"
                                                max="480"
                                                step="15"
                                                value={formData.duracionEstimada}
                                                onChange={(e) => setFormData({ ...formData, duracionEstimada: Number(e.target.value) })}
                                                className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600 touch-none"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
                                                <span>15m</span>
                                                <span>2h</span>
                                                <span>4h</span>
                                                <span>6h</span>
                                                <span>8h</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB 3: DETALLES */}
                            <TabsContent value="detalles" className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                                        <div className="space-y-2">
                                            <Label htmlFor="descripcionCorta" className="text-gray-700 font-semibold">Resumen Corto</Label>
                                            <Input
                                                id="descripcionCorta"
                                                value={formData.descripcionCorta}
                                                onChange={(e) => setFormData({ ...formData, descripcionCorta: e.target.value })}
                                                placeholder="Ej: Ideal para mudanzas..."
                                                maxLength={60}
                                                className="h-10 rounded-xl bg-gray-50 border-gray-200 text-sm"
                                            />
                                            <p className="text-xs text-right text-gray-400">{formData.descripcionCorta?.length || 0}/60</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="descripcion" className="text-gray-700 font-semibold">Descripción Completa</Label>
                                            <Textarea
                                                id="descripcion"
                                                value={formData.descripcion}
                                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                                required
                                                rows={5}
                                                className="rounded-xl bg-gray-50 border-gray-200 resize-none focus:bg-white min-h-[150px]"
                                                placeholder="Detalla qué incluye el servicio, metodología, garantías, etc."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                                        <Label className="text-gray-700 font-semibold block mb-2">Imagen de Portada</Label>
                                        <div
                                            className={`border-2 border-dashed rounded-2xl h-[240px] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors ${dragActive ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
                                                }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById("file-upload")?.click()}
                                        >
                                            {previewImage ? (
                                                <div className="relative w-full h-full group">
                                                    <img
                                                        src={previewImage}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white font-medium">
                                                        Cambiar Imagen
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600">
                                                        <Image className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-600">
                                                        Arrastra una imagen o haz clic
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        JPG, PNG, WEBP (Max 5MB)
                                                    </p>
                                                </div>
                                            )}
                                            <input
                                                id="file-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 -mx-8 -mb-8 border-t border-gray-100 flex justify-end gap-3 z-10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setModalOpen(false)}
                                className="h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="h-12 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-200 transition-all font-semibold text-white"
                            >
                                {saving ? (
                                    <>
                                        <div className="md:col-span-12">
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span className="text-gray-400">Guardando...</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingService ? "Guardar Cambios" : "Crear Servicio"}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Category Edit Modal */}
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-3xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            {editingCategory
                                ? "Modifica el nombre de la categoría. Esto actualizará todos los servicios relacionados."
                                : "Crea una nueva categoría para tus servicios."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Ej: Residencial"
                                className="h-11 rounded-xl"
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between items-center w-full">
                        {editingCategory ? (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteCategory}
                                className="rounded-xl px-3"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        ) : <div></div>}

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button onClick={handleSaveCategory} className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
                                Guardar
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
