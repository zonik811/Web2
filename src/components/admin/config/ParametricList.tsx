"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Loader2, Icon } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FieldConfig {
    name: string;
    label: string;
    type: "text" | "number" | "icon" | "color";
    placeholder?: string;
    required?: boolean;
}

interface ParametricListProps {
    title: string;
    description: string;
    icon: any; // Lucide Icon
    items: any[];
    fields: FieldConfig[];
    onAdd: (data: any) => Promise<{ success: boolean; error?: string }>;
    onUpdate: (id: string, data: any) => Promise<{ success: boolean; error?: string }>;
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
    onRefresh: () => void;
}

export function ParametricList({
    title,
    description,
    icon: IconComponent,
    items,
    fields,
    onAdd,
    onUpdate,
    onDelete,
    onRefresh
}: ParametricListProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null); // If null, adding new. If object, editing.
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const data: any = {};
        fields.forEach(field => {
            const value = formData.get(field.name);
            if (field.type === 'number') {
                data[field.name] = Number(value);
            } else {
                data[field.name] = value;
            }
        });

        try {
            let result;
            if (currentItem) {
                result = await onUpdate(currentItem.$id, data);
            } else {
                result = await onAdd(data);
            }

            if (result.success) {
                toast({
                    title: "Éxito",
                    description: currentItem ? "Elemento actualizado" : "Elemento creado",
                    variant: "default",
                });
                setIsDialogOpen(false);
                onRefresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Ocurrió un error",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este elemento?")) return;

        try {
            const result = await onDelete(id);
            if (result.success) {
                toast({ title: "Eliminado", description: "Elemento eliminado correctamente" });
                onRefresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const openAddDialog = () => {
        setCurrentItem(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (item: any) => {
        setCurrentItem(item);
        setIsDialogOpen(true);
    };

    return (
        <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white ring-1 ring-slate-100 group">
            <CardHeader className="border-b border-slate-50 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                            <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold text-slate-800">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                    <Button
                        onClick={openAddDialog}
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-4 shadow-lg shadow-slate-900/20"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            {fields.map(field => (
                                <TableHead key={field.name} className="font-semibold text-slate-600">{field.label}</TableHead>
                            ))}
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={fields.length + 1} className="text-center py-8 text-muted-foreground">
                                    No hay elementos registrados
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.$id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                    {fields.map(field => (
                                        <TableCell key={field.name} className="font-medium text-slate-700">
                                            {item[field.name]}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                                                onClick={() => openEditDialog(item)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                onClick={() => handleDelete(item.$id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentItem ? 'Editar' : 'Crear'} {title}</DialogTitle>
                        <DialogDescription>
                            Completa los campos abajo
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {fields.map(field => (
                            <div key={field.name} className="space-y-2">
                                <Label htmlFor={field.name}>{field.label}</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type}
                                    defaultValue={currentItem ? currentItem[field.name] : ''}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                />
                            </div>
                        ))}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading} className="bg-slate-900 text-white hover:bg-slate-800">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
