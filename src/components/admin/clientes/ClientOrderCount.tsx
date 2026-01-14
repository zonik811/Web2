"use client";

import { useEffect, useState } from "react";
import { obtenerConteoOrdenesCliente } from "@/lib/actions/reportes-clientes";
import { Loader2 } from "lucide-react";

interface ClientOrderCountProps {
    clienteId: string;
}

export function ClientOrderCount({ clienteId }: ClientOrderCountProps) {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        obtenerConteoOrdenesCliente(clienteId)
            .then(setCount)
            .catch(() => setCount(0))
            .finally(() => setLoading(false));
    }, [clienteId]);

    if (loading) {
        return <Loader2 className="h-3 w-3 animate-spin text-gray-400 mx-auto" />;
    }

    return (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {count}
        </div>
    );
}
