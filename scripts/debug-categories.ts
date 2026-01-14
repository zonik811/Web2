
import { obtenerCategorias } from "../src/lib/actions/categorias";

async function main() {
    console.log("Fetching categories...");
    try {
        const categorias = await obtenerCategorias();
        console.log(`Found ${categorias.length} categories:`);
        categorias.forEach(c => console.log(`- ${c.nombre} (ID: ${c.$id})`));
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

main();
