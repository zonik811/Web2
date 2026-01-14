"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Search, Filter, X, Check, ChevronsUpDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { buscarClientes } from "@/lib/actions/clientes";
import type { Cliente } from "@/types";

export function OrdenesFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Estado local para inputs
    const [query, setQuery] = useState(searchParams.get("query") || "");
    const [debouncedQuery] = useDebounce(query, 500);
    const [estado, setEstado] = useState(searchParams.get("estado") || "all");

    // Estado para cliente autocomplete
    const [openCliente, setOpenCliente] = useState(false);
    const [clienteInput, setClienteInput] = useState("");
    const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [debouncedClienteInput] = useDebounce(clienteInput, 300);

    // Cargar nombre de cliente inicial si hay ID en URL
    useEffect(() => {
        const clienteId = searchParams.get("clienteId");
        if (clienteId && clienteId !== "all" && !clienteSeleccionado) {
            // Aquí idealmente cargaríamos el cliente por ID, 
            // pero por simplicidad mostraremos el ID o un placeholder hasta que se seleccione otro
            // Para una UX perfecta deberíamos tener un server action obtenerCliente(id) disponible aquí
            // Por ahora dejaremos que el usuario vea que hay un filtro activo
        }
    }, []);

    // Efecto para buscar clientes
    useEffect(() => {
        if (debouncedClienteInput.length < 2) {
            setClientesEncontrados([]);
            return;
        }

        const search = async () => {
            const results = await buscarClientes(debouncedClienteInput);
            setClientesEncontrados(results);
        };
        search();
    }, [debouncedClienteInput]);

    // Efecto principal de filtrado
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (debouncedQuery) {
            params.set("query", debouncedQuery);
        } else {
            params.delete("query");
        }

        if (estado && estado !== "all") {
            params.set("estado", estado);
        } else {
            params.delete("estado");
        }

        if (clienteSeleccionado) {
            params.set("clienteId", clienteSeleccionado.$id);
        } else if (!searchParams.get("clienteId")) {
            // Solo borrar si no había uno (para no borrar el inicial si no hemos seleccionado nada nuevo)
            // Mejor lógica: si clienteSeleccionado es null y query param existe, no hacer nada (mantener)
            // Si explícitamente queremos borrar, necesitamos un botón de "limpiar cliente"
        }

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    }, [debouncedQuery, estado, clienteSeleccionado]);

    const handleClearCliente = () => {
        setClienteSeleccionado(null);
        setClienteInput("");
        const params = new URLSearchParams(searchParams);
        params.delete("clienteId");
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100 mb-6">
            {/* Buscador de Texto */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Buscar por N° Orden..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 border-none shadow-none focus-visible:ring-0 bg-transparent"
                />
            </div>

            <div className="flex gap-2 items-center">
                {/* Filtro de Estado */}
                <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger className="w-[180px] border-none bg-slate-50 hover:bg-slate-100 font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Estado" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="COTIZANDO">Cotizando</SelectItem>
                        <SelectItem value="ACEPTADA">Aceptada</SelectItem>
                        <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                        <SelectItem value="POR_PAGAR">Por Pagar</SelectItem>
                        <SelectItem value="COMPLETADA">Completada</SelectItem>
                        <SelectItem value="CANCELADA">Cancelada</SelectItem>
                    </SelectContent>
                </Select>

                {/* Filtro de Cliente (Autocomplete) */}
                <Popover open={openCliente} onOpenChange={setOpenCliente}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCliente}
                            className="w-[200px] justify-between border-none bg-slate-50 hover:bg-slate-100 font-medium text-slate-600"
                        >
                            <div className="flex items-center gap-2 truncate">
                                <User className="h-4 w-4" />
                                {clienteSeleccionado ? clienteSeleccionado.nombre : (searchParams.get("clienteId") ? "Cliente Filtrado" : "Cliente...")}
                            </div>
                            {clienteSeleccionado || searchParams.get("clienteId") ? (
                                <X
                                    className="ml-2 h-4 w-4 opacity-50 hover:opacity-100 z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClearCliente();
                                    }}
                                />
                            ) : (
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0 bg-white">
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Buscar cliente..."
                                value={clienteInput}
                                onValueChange={setClienteInput}
                            />
                            <CommandList>
                                <CommandEmpty>No encontrado.</CommandEmpty>
                                <CommandGroup>
                                    {clientesEncontrados.map((cliente) => (
                                        <CommandItem
                                            key={cliente.$id}
                                            value={cliente.nombre}
                                            onSelect={() => {
                                                setClienteSeleccionado(cliente);
                                                setOpenCliente(false);
                                            }}
                                        >
                                            <Check
                                                className={`mr-2 h-4 w-4 ${clienteSeleccionado?.$id === cliente.$id ? "opacity-100" : "opacity-0"
                                                    }`}
                                            />
                                            {cliente.nombre}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
