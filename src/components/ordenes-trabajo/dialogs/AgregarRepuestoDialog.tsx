"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Package, AlertCircle } from "lucide-react";
import { agregarRepuesto } from "@/lib/actions/ot-repuestos";
import type { CrearOtRepuestoInput } from "@/types";

interface AgregarRepuestoDialogProps {
    procesoId: string;
    ordenId: string;
    empleadoId: string;
    onRepuestoAgregado: () => void;
}

export function AgregarRepuestoDialog({
    procesoId,
    ordenId,
    empleadoId,
    onRepuestoAgregado
}: AgregarRepuestoDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showConfirmacion, setShowConfirmacion] = useState(false);

    const [formData, setFormData] = useState({
        repuestoId: "temp-id",
        nombreRepuesto: "",
        cantidad: 1,
        precioUnitario: 0
    });

    // --- Lógica de Selección de Productos (Nuevo) ---
    const [productos, setProductos] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState<any>(null);

    // Búsqueda de productos (Carga inicial y filtrado)
    useEffect(() => {
        const searchProducts = async () => {
            setIsSearching(true);
            try {
                const { obtenerProductos } = await import("@/lib/actions/inventario");
                const results = await obtenerProductos(searchTerm);
                setProductos(results);
            } catch (error) {
                console.error("Error buscando productos:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeout = setTimeout(searchProducts, searchTerm ? 500 : 0); // Inmediato si es inicial
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const handleSelectProducto = (producto: any) => {
        setSelectedProducto(producto);
        setFormData({
            ...formData,
            repuestoId: producto.$id,
            nombreRepuesto: producto.nombre,
            precioUnitario: producto.precio_venta || producto.precio || 0,
            cantidad: 1
        });
        setSearchTerm("");
        setProductos([]);
    };

    // Validar Stock
    const stockActual = selectedProducto
        ? (selectedProducto.stock !== undefined ? selectedProducto.stock : selectedProducto.stock_actual)
        : 999;
    const stockDespues = stockActual - formData.cantidad;
    const isStockInsuficiente = formData.cantidad > stockActual;


    const handleVerificar = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmacion(true);
    };

    const handleConfirmar = async () => {
        setLoading(true);

        try {
            // Llamar a agregarRepuesto
            const data: CrearOtRepuestoInput = {
                ordenTrabajoId: ordenId,
                procesoId,
                repuestoId: formData.repuestoId,
                nombreRepuesto: formData.nombreRepuesto,
                cantidad: formData.cantidad,
                precioUnitario: formData.precioUnitario,
                empleadoQueSolicito: empleadoId
            };

            const result = await agregarRepuesto(data);

            if (result.success) {
                // TODO: Descontar de inventario (Feature futura)

                // Limpiar y cerrar
                setFormData({
                    repuestoId: "temp-id",
                    nombreRepuesto: "",
                    cantidad: 1,
                    precioUnitario: 0
                });
                setSelectedProducto(null);
                setSearchTerm("");
                setShowConfirmacion(false);
                setOpen(false);
                onRepuestoAgregado();
            } else {
                alert("Error al agregar repuesto: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const subtotal = formData.cantidad * formData.precioUnitario;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <Package className="h-4 w-4" />
                    Agregar Repuesto
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md overflow-visible">
                <DialogHeader>
                    <DialogTitle>Agregar Repuesto</DialogTitle>
                </DialogHeader>

                {!showConfirmacion ? (
                    <form onSubmit={handleVerificar} className="space-y-4">
                        {/* Selector de Producto */}
                        <div className="space-y-2 relative">
                            <Label htmlFor="buscar-repuesto">Buscar Repuesto *</Label>
                            <div className="relative">
                                <Input
                                    id="buscar-repuesto"
                                    value={selectedProducto ? selectedProducto.nombre : searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setSelectedProducto(null); // Reset al escribir
                                        setFormData(prev => ({ ...prev, repuestoId: "temp-id", nombreRepuesto: e.target.value }));
                                    }}
                                    placeholder="Escribe para buscar..."
                                    className={isStockInsuficiente ? "border-red-500" : ""}
                                    autoComplete="off"
                                />
                                {selectedProducto && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1 h-7 w-7 p-0"
                                        onClick={() => {
                                            setSelectedProducto(null);
                                            setSearchTerm("");
                                            setFormData(prev => ({ ...prev, repuestoId: "temp-id", nombreRepuesto: "", precioUnitario: 0 }));
                                        }}
                                    >
                                        ×
                                    </Button>
                                )}
                            </div>


                            {/* Lista de Resultados */}
                            {!selectedProducto && (
                                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                    {isSearching ? (
                                        <div className="p-2 text-sm text-center text-muted-foreground">Buscando...</div>
                                    ) : productos.length > 0 ? (
                                        productos.map((prod) => (
                                            <div
                                                key={prod.$id}
                                                className="p-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                                                onClick={() => handleSelectProducto(prod)}
                                            >
                                                {prod.imagen ? (
                                                    <img src={prod.imagen} alt={prod.nombre} className="h-8 w-8 rounded object-cover border" />
                                                ) : (
                                                    <div className="h-8 w-8 bg-slate-200 rounded flex items-center justify-center">
                                                        <Package className="h-4 w-4 text-slate-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{prod.nombre}</p>
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Stock: {prod.stock ?? prod.stock_actual}</span>
                                                        <span>${(prod.precio_venta || prod.precio).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-center text-muted-foreground">No se encontraron productos</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedProducto && (
                            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded border">
                                {selectedProducto.imagen && (
                                    <div className="h-12 w-12 relative rounded overflow-hidden border">
                                        <img src={selectedProducto.imagen} alt="Preview" className="h-full w-full object-cover" />
                                    </div>
                                )}
                                <div className="text-sm">
                                    <p className="font-semibold text-green-700">Producto Seleccionado</p>
                                    <p className="text-muted-foreground">Stock Disponible: {stockActual}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cantidad">Cantidad *</Label>
                                <Input
                                    id="cantidad"
                                    type="number"
                                    value={formData.cantidad}
                                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                                    min="1"
                                    className={isStockInsuficiente ? "border-red-500" : ""}
                                    required
                                />
                                {isStockInsuficiente && <p className="text-xs text-red-500">Excede el stock disponible ({stockActual})</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="precio">Precio Unitario *</Label>
                                <Input
                                    id="precio"
                                    type="number"
                                    step="0.01"
                                    value={formData.precioUnitario}
                                    onChange={(e) => setFormData({ ...formData, precioUnitario: parseFloat(e.target.value) || 0 })}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="bg-muted p-3 rounded">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Subtotal:</span>
                                <span className="font-semibold">${subtotal.toLocaleString('es-CO')}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Continuar
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-orange-900">Confirmar Uso de Repuesto</h4>
                                    <div className="text-sm text-orange-800 space-y-1">
                                        <p><strong>Repuesto:</strong> {formData.nombreRepuesto}</p>
                                        <p><strong>Cantidad a usar:</strong> {formData.cantidad} unidades</p>
                                        <div className="pt-2 border-t border-orange-200 mt-2">
                                            <p>Stock actual: <strong>{stockActual} unidades</strong></p>
                                            <p className="text-orange-900 font-semibold">
                                                Después de usar: <strong>{stockDespues} unidades ⬇️</strong>
                                            </p>
                                        </div>
                                        {stockDespues <= 3 && (
                                            <p className="text-red-600 font-semibold pt-2">
                                                ⚠️ Stock bajo - Considerar reponer
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowConfirmacion(false)}>
                                Atrás
                            </Button>
                            <Button onClick={handleConfirmar} disabled={loading}>
                                {loading ? "Confirmando..." : "✓ Confirmar Uso"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
