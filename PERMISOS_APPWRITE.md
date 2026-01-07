# Configurar Permisos de Appwrite

## ⚠️ IMPORTANTE - Configuración de Permisos

Para que la aplicación funcione correctamente, debes configurar los permisos en cada colección de Appwrite.

### Ir a Appwrite Console

1. Ve a https://cloud.appwrite.io
2. Selecciona tu proyecto
3. Ve a **Databases** → Tu base de datos
4. Para **CADA colección** (servicios, empleados, citas, clientes, pagos_empleados):

### Configurar Permisos en la Pestaña "Settings"

Para cada colección, ve a la pestaña **Settings** y configura:

#### Colección: servicios
**Permissions:**
- ✅ Read: `any` (para que el público pueda ver servicios)
- ✅ Create: `users` (solo usuarios autenticados pueden crear)
- ✅ Update: `users` (solo usuarios autenticados pueden actualizar)
- ✅ Delete: `users` (solo usuarios autenticados pueden eliminar)

#### Colección: empleados
**Permissions:**
- ✅ Read: `users` (solo usuarios autenticados)
- ✅ Create: `users`
- ✅ Update: `users`
- ✅ Delete: `users`

#### Colección: citas
**Permissions:**
- ✅ Read: `users` (solo usuarios autenticados pueden leer)
- ✅ Create: `any` (para que el formulario público funcione)
- ✅ Update: `users`
- ✅ Delete: `users`

#### Colección: clientes
**Permissions:**
- ✅ Read: `users`
- ✅ Create: `users`
- ✅ Update: `users`
- ✅ Delete: `users`

#### Colección: pagos_empleados
**Permissions:**
- ✅ Read: `users`
- ✅ Create: `users`
- ✅ Update: `users`
- ✅ Delete: `users`

### Cómo Agregar Permisos

1. Abre la colección
2. Ve a la pestaña **Settings**
3. Busca la sección **Permissions**
4. Click en **+ Add Role**
5. Selecciona:
   - Para "any": **Any**
   - Para "users": **All Users** (o **Users**)
6. Marca los checkboxes correspondientes (Read, Create, Update, Delete)
7. Click en **Update** o **Save**

### Verificación

Después de configurar los permisos:
1. Cierra sesión en la aplicación (http://localhost:3000/login)
2. Vuelve a iniciar sesión con admin@admin.com
3. El dashboard debería cargar sin errores
4. Deberías poder crear empleados y citas

## Problema Común

Si ves el error:
```
The current user is not authorized to perform the requested action
```

Significa que los permisos no están configurados correctamente. Verifica que:
- El usuario esté autenticado (iniciado sesión)
- Los permisos de la colección incluyan `users` con Read/Create/Update/Delete
- Has guardado los cambios en Appwrite Console
