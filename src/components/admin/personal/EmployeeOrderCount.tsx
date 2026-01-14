"use client";

import { useEffect, useState } from "react";
import { obtenerConteoOrdenesEmpleado } from "@/lib/actions/reportes-empleados";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Loader2 } from "lucide-react";

interface EmployeeOrderCountProps {
    empleadoId: string;
}

export function EmployeeOrderCount({ empleadoId }: EmployeeOrderCountProps) {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        obtenerConteoOrdenesEmpleado(empleadoId)
            .then(setCount)
            .catch(() => setCount(0))
            .finally(() => setLoading(false));
    }, [empleadoId]);

    if (loading) {
        return <Loader2 className="h-3 w-3 animate-spin text-gray-400" />;
    }

    return (
        <div className="flex items-center justify-center gap-1">
            <span className="font-semibold text-gray-700">{count}</span>
        </div>
    );
}
