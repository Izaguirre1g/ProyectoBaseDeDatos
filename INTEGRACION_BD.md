# Integración de Base de Datos con Stored Procedures

## Resumen de Cambios Implementados

He actualizado el sistema para integrar los Stored Procedures (SP) de SQL Server directamente en la aplicación. Ahora la información que envías desde la interfaz se guarda en la base de datos y se muestra correctamente.

---

## 🔧 Cambios en el Backend

### 1. **carrosService.js** - Crear Carros
Agregué el método `crearCarro()` que llama a **SP_CrearCarro**:

```javascript
async crearCarro(idEquipo) {
    // Llama al SP que:
    // 1. Valida que el equipo no tenga más de 2 carros
    // 2. Inserta un nuevo carro con valores iniciales (0,0,0)
    // 3. Retorna mensaje de éxito o error
}
```

**Características:**
- Valida límite de 2 carros por equipo
- Retorna el carro creado con ID
- Maneja errores apropiadamente

---

### 2. **carrosService.js** - Instalar Partes
El método `instalarParte()` ya existía y usa **SP_InstalarParteEnCarro**:

```javascript
async instalarParte(idCarro, idParte) {
    // Llama al SP que:
    // 1. Valida que el carro existe
    // 2. Valida que la parte existe
    // 3. Verifica que hay stock en el inventario del equipo
    // 4. Valida que no hay otra parte de la misma categoría
    // 5. Actualiza ESTRUCTURA_CARRO
    // 6. Decrementa INVENTARIO_EQUIPO
    // 7. Recalcula totales (P_total, A_total, M_total)
    // 8. Marca como Finalizado si hay 5 partes
}
```

**Características:**
- Transacción ACID (todo o nada)
- Recalcula automáticamente stats
- Controla una parte por categoría

---

### 3. **partesService.js** - Comprar Partes
El método `comprar()` ya existía y usa **SP_RealizarCompra**:

```javascript
async comprar(idEquipo, idParte, cantidad) {
    // Llama al SP que:
    // 1. Valida cantidad > 0
    // 2. Valida que equipo existe
    // 3. Valida que parte existe
    // 4. Verifica stock disponible en INVENTARIO_TOTAL
    // 5. Verifica presupuesto disponible del equipo
    // 6. TRANSACCIÓN:
    //    - Crea PEDIDO
    //    - Crea DETALLE_PEDIDO
    //    - Actualiza INVENTARIO_TOTAL
    //    - Actualiza INVENTARIO_EQUIPO
    //    - Registra en COMPRA (auditoría)
}
```

**Características:**
- Valida presupuesto antes de comprar
- Crea registro de auditoría
- Retorna ID del pedido generado

---

### 4. **carros.routes.js** - Endpoint Crear Carro

```javascript
POST /api/carros
Body: { idEquipo }

Respuesta:
{
    success: true,
    mensaje: "Carro creado exitosamente.",
    carro: { Id_carro, Id_equipo, Finalizado, M_total, P_total, A_total }
}
```

---

### 5. **carros.routes.js** - Endpoint Instalar Parte

```javascript
POST /api/carros/:id/instalar
Body: { idParte }

Respuesta:
{
    success: true,
    mensaje: "Parte instalada exitosamente. Partes instaladas: 1/5",
    carro: { nuevos valores actualizados }
}
```

---

### 6. **partes.routes.js** - Endpoint Comprar Parte

```javascript
POST /api/partes/comprar
Body: { idEquipo, idParte, cantidad }

Respuesta:
{
    success: true,
    mensaje: "Compra realizada exitosamente...",
    idPedido: 123
}
```

---

## 🎨 Cambios en el Frontend

### 1. **carros.service.js**
Agregué métodos:

```javascript
// Crear nuevo carro
crearCarro(idEquipo)

// Obtener carros por equipo
getByEquipo(idEquipo)

// Obtener configuración de 5 categorías
getConfiguracion(carroId)
```

---

### 2. **partes.service.js**
Actualizé y agregué métodos:

```javascript
// Obtener catálogo con stock
getCatalogo()

// Obtener inventario de equipo
getInventarioEquipo(idEquipo)

// Comprar (actualizado con parámetros correctos)
comprar(idEquipo, idParte, cantidad)

// Verificar disponibilidad antes de comprar
verificarDisponibilidad(idEquipo, idParte, cantidad)
```

---

## 📊 Flujo de Datos: Cómo funciona la integración

### **Crear Carro**
```
Frontend (onClick)
    ↓
carrosService.crearCarro(idEquipo)
    ↓
POST /api/carros → backend
    ↓
carrosService.crearCarro() → SP_CrearCarro
    ↓
Base de Datos: INSERT INTO CARRO
    ↓
Response con nuevo carro
    ↓
Frontend actualiza estado y UI
```

---

### **Comprar Parte**
```
Frontend (Modal Compra)
    ↓
partesService.comprar(idEquipo, idParte, cantidad)
    ↓
POST /api/partes/comprar → backend
    ↓
partesService.comprar() → SP_RealizarCompra
    ↓
Base de Datos:
  1. INSERT PEDIDO
  2. INSERT DETALLE_PEDIDO
  3. UPDATE INVENTARIO_TOTAL
  4. UPDATE INVENTARIO_EQUIPO
  5. INSERT COMPRA (auditoría)
    ↓
Response con resultado
    ↓
Frontend:
  - Muestra toast de éxito
  - Recarga inventario
  - Actualiza presupuesto disponible
```

---

### **Instalar Parte en Carro**
```
Frontend (ArmadoCarro)
    ↓
carrosService.instalarParte(carroId, parteId)
    ↓
POST /api/carros/:id/instalar → backend
    ↓
carrosService.instalarParte() → SP_InstalarParteEnCarro
    ↓
Base de Datos:
  1. INSERT ESTRUCTURA_CARRO
  2. UPDATE INVENTARIO_EQUIPO (cantidad - 1)
  3. DELETE si cantidad = 0
  4. UPDATE CARRO (P_total, A_total, M_total)
  5. UPDATE CARRO (Finalizado = 1 si 5 partes)
    ↓
Response con totales actualizados
    ↓
Frontend:
  - Muestra parte en interfaz
  - Actualiza stats (P, A, M)
  - Recarga inventario disponible
  - Marca como Finalizado si = 5/5
```

---

## 🔄 Tabla de Relación: Frontend ↔ Backend ↔ BD

| Acción en UI | Frontend Service | Backend Route | SP/Query | Tabla(s) |
|---|---|---|---|---|
| Crear Carro | `carrosService.crearCarro()` | `POST /carros` | `SP_CrearCarro` | CARRO |
| Comprar Parte | `partesService.comprar()` | `POST /partes/comprar` | `SP_RealizarCompra` | PEDIDO, DETALLE_PEDIDO, INVENTARIO_TOTAL, INVENTARIO_EQUIPO |
| Instalar Parte | `carrosService.instalarParte()` | `POST /carros/:id/instalar` | `SP_InstalarParteEnCarro` | ESTRUCTURA_CARRO, INVENTARIO_EQUIPO, CARRO |
| Ver Carros | `carrosService.getByEquipo()` | `GET /carros?idEquipo=` | SELECT | CARRO, EQUIPO |
| Ver Catálogo | `partesService.getCatalogo()` | `GET /partes/inventario/total` | SELECT | PARTE, INVENTARIO_TOTAL |
| Ver Inventario | `partesService.getInventarioEquipo()` | `GET /partes/inventario/:idEquipo` | SELECT | INVENTARIO_EQUIPO, PARTE |

---

## ✅ Validaciones que se hacen Automáticamente

### **En SP_CrearCarro:**
- ✓ Máximo 2 carros por equipo
- ✓ Equipo existe
- ✓ Carro se crea con valores iniciales válidos

### **En SP_RealizarCompra:**
- ✓ Cantidad > 0
- ✓ Equipo existe
- ✓ Parte existe
- ✓ Stock disponible en tienda
- ✓ Presupuesto disponible del equipo
- ✓ Crea auditoría de compra

### **En SP_InstalarParteEnCarro:**
- ✓ Carro existe
- ✓ Parte existe
- ✓ Inventario disponible en equipo
- ✓ No hay otra parte de la misma categoría
- ✓ Recalcula automáticamente totales
- ✓ Marca como Finalizado si 5/5

---

## 📝 Ejemplos de Uso

### **Crear Carro desde el Frontend**
```javascript
// En componente (ej: Equipo.jsx)
const crearNuevoCarro = async () => {
    try {
        const resultado = await carrosService.crearCarro(equipoId);
        if (resultado.success) {
            toast({ title: resultado.mensaje, status: 'success' });
            cargarCarros(); // Recargar lista
        } else {
            toast({ title: resultado.mensaje, status: 'error' });
        }
    } catch (error) {
        toast({ title: 'Error', description: error.message, status: 'error' });
    }
};
```

### **Comprar Parte desde el Frontend**
```javascript
// En componente (ej: ModalCompra.jsx)
const realizarCompra = async () => {
    try {
        const resultado = await partesService.comprar(
            equipoId,
            parteSeleccionada.Id_parte,
            cantidadCompra
        );
        if (resultado.success) {
            toast({ title: resultado.mensaje, status: 'success' });
            cargarInventario(); // Recargar inventario
            cargarPresupuesto(); // Actualizar presupuesto
        } else {
            toast({ title: resultado.mensaje, status: 'error' });
        }
    } catch (error) {
        toast({ title: 'Error', description: error.message, status: 'error' });
    }
};
```

### **Instalar Parte en Carro**
```javascript
// En componente (ej: ArmadoCarro.jsx)
const instalarParte = async (parteId) => {
    try {
        const resultado = await carrosService.instalarParte(carroId, parteId);
        if (resultado.success) {
            toast({ title: resultado.mensaje, status: 'success' });
            // Stats se actualizan automáticamente
            setStats({
                P: resultado.carro.P_total,
                A: resultado.carro.A_total,
                M: resultado.carro.M_total
            });
            cargarPartes(); // Recargar UI
        }
    } catch (error) {
        toast({ title: 'Error', description: error.message, status: 'error' });
    }
};
```

---

## 🚀 Próximos Pasos

1. **Prueba los endpoints** con Postman o Thunder Client
2. **Verifica** que los datos se guardan en la BD
3. **Actualiza los componentes** del frontend que usan estas funciones
4. **Agrega manejo de errores** más específicos si es necesario

---

## 📞 Notas Importantes

- Todos los SPs usan transacciones para garantizar integridad
- Las respuestas incluyen mensajes descriptivos
- El frontend debe manejar tanto `success: true` como `success: false`
- Los totales (P, A, M) se recalculan automáticamente en la BD
- El estado Finalizado se actualiza automáticamente cuando hay 5 partes

---

**Última actualización:** 17/01/2026
