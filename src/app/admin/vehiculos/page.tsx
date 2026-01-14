import VehiculosPageClient from "./VehiculosPageClient";
import { Suspense } from "react";

export default function VehiculosPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <VehiculosPageClient />
        </Suspense>
    );
}
