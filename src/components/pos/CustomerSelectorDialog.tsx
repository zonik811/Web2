"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Plus, X } from "lucide-react";
import { buscarClientes, crearClienteRapido, type ClientePOS, type QuickCustomerData } from "@/lib/actions/clientes-pos";
import { cn } from "@/lib/utils";

type CustomerSelectorDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectCustomer: (customer: ClientePOS) => void;
    currentCustomer?: ClientePOS | null;
};

export function CustomerSelectorDialog({ isOpen, onClose, onSelectCustomer, currentCustomer }: CustomerSelectorDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ClientePOS[]>([]);
    const [searching, setSearching] = useState(false);
    const [showQuickForm, setShowQuickForm] = useState(false);

    // Quick form state
    const [quickName, setQuickName] = useState("");
    const [quickPhone, setQuickPhone] = useState("");
    const [quickEmail, setQuickEmail] = useState("");
    const [creating, setCreating] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        const results = await buscarClientes(query);
        setSearchResults(results);
        setSearching(false);
    };

    const handleSelect = (customer: ClientePOS) => {
        onSelectCustomer(customer);
        onClose();
        resetForm();
    };

    const handleQuickCreate = async () => {
        if (!quickName.trim()) {
            alert("El nombre es obligatorio");
            return;
        }

        setCreating(true);
        const data: QuickCustomerData = {
            nombre: quickName,
            telefono: quickPhone || undefined,
            email: quickEmail || undefined
        };

        const result = await crearClienteRapido(data);

        if (result.success && result.clienteId) {
            // Get the newly created customer
            const newCustomer: ClientePOS = {
                $id: result.clienteId,
                nombre: quickName,
                telefono: quickPhone || "",
                email: quickEmail || ""
            };
            handleSelect(newCustomer);
        } else {
            alert(result.error || "Error al crear cliente");
        }

        setCreating(false);
    };

    const resetForm = () => {
        setSearchQuery("");
        setSearchResults([]);
        setQuickName("");
        setQuickPhone("");
        setQuickEmail("");
        setShowQuickForm(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Seleccionar Cliente
                    </DialogTitle>
                </DialogHeader>

                {!showQuickForm ? (
                    <>
                        {/* Search Bar */}
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar por nombre, teléfono o documento..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>

                            {/* Quick Create Button */}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setShowQuickForm(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Cliente Rápido
                            </Button>
                        </div>

                        {/* Search Results */}
                        <div className="mt-4 space-y-2">
                            {searching ? (
                                <p className="text-center text-slate-400 py-8">Buscando...</p>
                            ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                                <p className="text-center text-slate-400 py-8">No se encontraron clientes</p>
                            ) : searchResults.length === 0 ? (
                                <p className="text-center text-slate-400 py-8 text-sm">
                                    Escribe al menos 2 caracteres para buscar
                                </p>
                            ) : (
                                searchResults.map((customer) => (
                                    <button
                                        key={customer.$id}
                                        onClick={() => handleSelect(customer)}
                                        className={cn(
                                            "w-full p-4 border rounded-lg text-left hover:bg-slate-50 transition-colors",
                                            currentCustomer?.$id === customer.$id && "border-blue-500 bg-blue-50"
                                        )}
                                    >
                                        <p className="font-medium text-slate-900">{customer.nombre}</p>
                                        <div className="flex gap-4 mt-1 text-sm text-slate-500">
                                            {customer.telefono && <span>📞 {customer.telefono}</span>}
                                            {customer.email && <span>✉️ {customer.email}</span>}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    /* Quick Create Form */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-slate-900">Crear Cliente Rápido</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowQuickForm(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Nombre Completo *
                                </label>
                                <Input
                                    value={quickName}
                                    onChange={(e) => setQuickName(e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                    className="mt-1"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Teléfono
                                </label>
                                <Input
                                    value={quickPhone}
                                    onChange={(e) => setQuickPhone(e.target.value)}
                                    placeholder="Ej: 3001234567"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={quickEmail}
                                    onChange={(e) => setQuickEmail(e.target.value)}
                                    placeholder="Ej: cliente@email.com"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowQuickForm(false)}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleQuickCreate}
                                disabled={creating || !quickName.trim()}
                                className="flex-1"
                            >
                                {creating ? "Creando..." : "Crear y Seleccionar"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
