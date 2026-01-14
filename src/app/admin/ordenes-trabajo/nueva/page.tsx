import { obtenerClientes } from "@/lib/actions/clientes";
import { obtenerVehiculos } from "@/lib/actions/vehiculos";
import NuevaOrdenPageClient from "./NuevaOrdenClient";

export default async function NuevaOrdenPage() {
    const [clientes, vehiculos] = await Promise.all([
        obtenerClientes(),
        obtenerVehiculos()
    ]);

    return (
        <NuevaOrdenPageClient
            clientes={clientes}
            vehiculosIniciales={vehiculos}
        />
    );
}
