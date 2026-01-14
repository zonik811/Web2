import { obtenerOrdenConDetalles } from "@/lib/actions/ordenes-trabajo";
import { obtenerClientes } from "@/lib/actions/clientes";
import { obtenerVehiculos } from "@/lib/actions/vehiculos";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import OrdenDetalleClient from "./OrdenDetalleClient";
import { notFound } from "next/navigation";

export default async function OrdenDetallePage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const orden = await obtenerOrdenConDetalles(id);

        const [clientes, vehiculos, empleados] = await Promise.all([
            obtenerClientes(),
            obtenerVehiculos(),
            obtenerEmpleados({ activo: true, cargo: 'Técnico' }) // Filtrar por "Técnico" (case sensitive en Appwrite)
        ]);

        const cliente = clientes.find(c => c.$id === orden.clienteId);
        const vehiculo = vehiculos.find(v => v.$id === orden.vehiculoId);

        return (
            <OrdenDetalleClient
                orden={orden}
                cliente={cliente}
                vehiculo={vehiculo}
                empleados={empleados}
            />
        );
    } catch (error) {
        console.error("Error cargando orden:", error);
        notFound();
    }
}
