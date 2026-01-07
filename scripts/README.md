# Scripts de Configuración

Este directorio contiene scripts útiles para configurar y poblar la base de datos de Appwriter.

## Scripts Disponibles

### 1. setup-appwrite.js (EXPERIMENTAL)
Script para crear automáticamente todas las colecciones en Appwrite.

**⚠️ IMPORTANTE:** Este script puede tener problemas con rate limits de Appwrite. Se recomienda crear las colecciones manualmente desde Appwrite Console.

```bash
node scripts/setup-appwrite.js
```

### 2. seed-services.js (RECOMENDADO)
Crea servicios de ejemplo en la colección `servicios`.

**Prerequisito:** La colección `servicios` debe existir en Appwrite.

```bash
node scripts/seed-services.js
```

Este script crea 3 servicios de ejemplo:
- Limpieza Residencial Básica ($50,000)
- Limpieza de Oficinas ($80,000)
- Limpieza Profunda ($150,000)

## Configuración Manual Recomendada

La forma más confiable de configurar Appwrite es hacerlo manualmente desde la consola:

1. **Accede a Appwrite Console:** https://cloud.appwrite.io

2. **Navega a tu proyecto:** ID `695e8be5003357919803`

3. **Ve a Databases** → Tu base de datos ID `695e8da400267ef69bae`

4. **Crea las colecciones** con los siguientes esquemas:

### Colección: servicios

**Permisos:**
- Read: Any
- Create/Update/Delete: Users

**Atributos:**
- `nombre` (String, 100, required)
- `slug` (String, 100, required)
- `descripcion` (String, 1000, required)
- `descripcionCorta` (String, 200, required)
- `categoria` (Enum, required) → opciones: `residencial`, `comercial`, `especializado`
- `precioBase` (Integer, required)
- `unidadPrecio` (Enum, required) → opciones: `hora`, `metrocuadrado`, `servicio`
- `duracionEstimada` (Integer, required)
- `imagen` (String, 255, optional)
- `caracteristicas` (String Array, 5000, required)
- `requierePersonal` (Integer, required)
- `activo` (Boolean, required, default: true)
- `createdAt` (Datetime, required)
- `updatedAt` (Datetime, required)

### Colección: empleados

**Permisos:**
- Read/Create/Update/Delete: Users

**Atributos:**
- `userId` (String, 100, optional)
- `nombre` (String, 50, required)
- `apellido` (String, 50, required)
- `documento` (String, 20, required)
- `telefono` (String, 15, required)
- `email` (String, 100, required)
- `direccion` (String, 200, required)
- `fechaNacimiento` (Datetime, required)
- `fechaContratacion` (Datetime, required)
- `cargo` (Enum, required) → opciones: `limpiador`, `supervisor`, `especialista`
- `especialidades` (String Array, 5000, required)
- `tarifaPorHora` (Integer, required)
- `modalidadPago` (Enum, required) → opciones: `hora`, `servicio`, `fijo_mensual`
- `activo` (Boolean, required, default: true)
- `foto` (String, 255, optional)
- `documentos` (String Array, 5000, optional)
- `calificacionPromedio` (Float, required, default: 0)
- `totalServicios` (Integer, required, default: 0)
- `createdAt` (Datetime, required)
- `updatedAt` (Datetime, required)

### Colección: citas

**Permisos:**
- Read/Update/Delete: Users
- Create: Any (para permitir agendamiento público)

**Atributos:**
- `servicioId` (String, 100, required)
- `clienteId` (String, 100, optional)
- `clienteNombre` (String, 100, required)
- `clienteTelefono` (String, 15, required)
- `clienteEmail` (String, 100, required)
- `direccion` (String, 200, required)
- `ciudad` (String, 100, required)
- `tipoPropiedad` (Enum, required) → opciones: `casa`, `apartamento`, `oficina`, `local`
- `metrosCuadrados` (Integer, optional)
- `habitaciones` (Integer, optional)
- `banos` (Integer, optional)
- `fechaCita` (Datetime, required)
- `horaCita` (String, 10, required)
- `duracionEstimada` (Integer, required)
- `empleadosAsignados` (String Array, 5000, optional)
- `estado` (Enum, required, default: `pendiente`) → opciones: `pendiente`, `confirmada`, `en-progreso`, `completada`, `cancelada`
- `precioCliente` (Integer, required)
- `precioAcordado` (Integer, required)
- `metodoPago` (Enum, required) → opciones: `efectivo`, `transferencia`, `nequi`, `bancolombia`, `por_cobrar`
- `pagadoPorCliente` (Boolean, required, default: false)
- `detallesAdicionales` (String, 500, optional)
- `notasInternas` (String, 500, optional)
- `calificacionCliente` (Integer, optional)
- `resenaCliente` (String, 500, optional)
- `fotosAntes` (String Array, 5000, optional)
- `fotosDespues` (String Array, 5000, optional)
- `createdAt` (Datetime, required)
- `updatedAt` (Datetime, required)
- `completedAt` (Datetime, optional)

### Colección: clientes

**Permisos:**
- Read/Create/Update/Delete: Users

**Atributos:**
- `nombre` (String, 100, required)
- `telefono` (String, 15, required)
- `email` (String, 100, required)
- `direccion` (String, 200, required)
- `ciudad` (String, 100, required)
- `tipoCliente` (Enum, required) → opciones: `residencial`, `comercial`
- `frecuenciaPreferida` (Enum, required) → opciones: `unica`, `semanal`, `quincenal`, `mensual`
- `totalServicios` (Integer, required, default: 0)
- `totalGastado` (Integer, required, default: 0)
- `calificacionPromedio` (Float, required, default: 0)
- `notasImportantes` (String, 500, optional)
- `activo` (Boolean, required, default: true)
- `createdAt` (Datetime, required)
- `ultimoServicio` (String, 100, optional)

### Colección: pagos_empleados

**Permisos:**
- Read/Create/Update/Delete: Users

**Atributos:**
- `empleadoId` (String, 100, required)
- `citaId` (String, 100, optional)
- `periodo` (String, 20, optional)
- `concepto` (Enum, required) → opciones: `servicio`, `anticipo`, `pago_mensual`, `bono`, `deduccion`
- `monto` (Integer, required)
- `fechaPago` (Datetime, optional)
- `metodoPago` (Enum, required) → opciones: `efectivo`, `transferencia`, `nequi`, `bancolombia`
- `estado` (Enum, required, default: `pendiente`) → opciones: `pendiente`, `pagado`, `parcial`
- `comprobante` (String, 255, optional)
- `notas` (String, 500, optional)
- `creadoPor` (String, 100, required)
- `createdAt` (Datetime, required)
- `updatedAt` (Datetime, required)

## Crear Usuario Admin

Una vez creadas las colecciones, crea un usuario admin en Appwrite Auth:

1. Ve a **Auth** en Appwrite Console
2. Click en **Create User**
3. Agrega email y password
4. Este usuario podrá acceder al panel admin en `/login`

## Orden Recomendado

1. ✅ Crear colección `servicios`
2. ✅ Crear colección `empleados`
3. ✅ Crear colección `citas`
4. ✅ Crear colección `clientes`
5. ✅ Crear colección `pagos_empleados`
6. ✅ Configurar permisos en cada colección
7. ✅ Ejecutar `node scripts/seed-services.js` para poblar servicios
8. ✅ Crear usuario admin en Auth
9. ✅ ¡Listo para usar la aplicación!
