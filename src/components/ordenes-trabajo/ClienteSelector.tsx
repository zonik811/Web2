"use client";

import { useState, useEffect } from "react";
import { Search, Plus, User, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "use-debounce";
import { buscarClientes } from "@/lib/actions/clientes";
import type { Cliente } from "@/types";

interface ClienteSelectorProps {
    clientes: Cliente[]; // Initial clients (optional usage now)
    clienteSeleccionado?: Cliente | null;
    onClienteSelect: (cliente: Cliente | null) => void;
    onNuevoCliente?: () => void;
}

export function ClienteSelector({
    clientes: initialClientes,
    clienteSeleccionado,
    onClienteSelect,
    onNuevoCliente
}: ClienteSelectorProps) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [debouncedInput] = useDebounce(inputValue, 300);
    const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Effect to search clients
    useEffect(() => {
        const search = async () => {
            // If input is empty, maybe show initial/recent (optional) or nothing
            // For now we will search if length > 1
            if (debouncedInput.length < 2) {
                setClientesEncontrados([]);
                return;
            }

            setIsSearching(true);
            try {
                const results = await buscarClientes(debouncedInput);
                setClientesEncontrados(results);
            } catch (error) {
                console.error("Error searching clients:", error);
            } finally {
                setIsSearching(false);
            }
        };

        search();
    }, [debouncedInput]);


    return (
        <div className="space-y-4">
            <div className="flex gap-2 items-start">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between h-12 text-base px-4 border-2 border-slate-200 hover:border-primary/50"
                        >
                            {clienteSeleccionado ? (
                                <span className="flex items-center gap-2 font-medium text-slate-700">
                                    <User className="h-4 w-4 text-primary" />
                                    {clienteSeleccionado.nombre}
                                </span>
                            ) : (
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Buscar cliente por nombre, teléfono o placa...
                                </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white" align="start">
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Escribe para buscar..."
                                value={inputValue}
                                onValueChange={setInputValue}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    {isSearching ? (
                                        <div className="py-4 text-center text-sm text-muted-foreground">Buscando...</div>
                                    ) : debouncedInput.length < 2 ? (
                                        <div className="py-4 text-center text-sm text-muted-foreground">Escribe al menos 2 caracteres</div>
                                    ) : (
                                        "No se encontraron clientes."
                                    )}
                                </CommandEmpty>
                                <CommandGroup>
                                    {clientesEncontrados.map((cliente) => (
                                        <CommandItem
                                            key={cliente.$id}
                                            value={cliente.nombre}
                                            onSelect={() => {
                                                onClienteSelect(cliente);
                                                setOpen(false);
                                            }}
                                            className="cursor-pointer py-3 px-4"
                                        >
                                            <Check
                                                className={`mr-2 h-4 w-4 ${clienteSeleccionado?.$id === cliente.$id ? "opacity-100" : "opacity-0"
                                                    }`}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{cliente.nombre}</span>
                                                <span className="text-xs text-muted-foreground flex gap-2">
                                                    <span>📞 {cliente.telefono}</span>
                                                    {cliente.email && <span>✉️ {cliente.email}</span>}
                                                </span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {onNuevoCliente && (
                    <Button
                        onClick={onNuevoCliente}
                        className="h-12 w-12 p-0 shrink-0 rounded-xl shadow-sm hover:shadow-md transition-all"
                        variant="default"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                )}
            </div>

            {/* Selected Client Details Card */}
            {clienteSeleccionado && (
                <Card className="border-l-4 border-l-primary bg-slate-50 border-y-0 border-r-0 rounded-l-none shadow-sm animate-in fade-in slide-in-from-top-2">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{clienteSeleccionado.nombre}</h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                                            <span>📞 {clienteSeleccionado.telefono}</span>
                                            <span>✉️ {clienteSeleccionado.email || "Sin email"}</span>
                                            <span className="text-slate-500">📍 {clienteSeleccionado.ciudad || "Sin ciudad"}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-muted-foreground hover:text-destructive"
                                        onClick={() => onClienteSelect(null)}
                                    >
                                        Limpiar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
