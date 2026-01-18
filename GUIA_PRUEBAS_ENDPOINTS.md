# Guía de Pruebas - Endpoints con Stored Procedures

## 🧪 Cómo probar los endpoints

Puedes usar **Postman**, **Thunder Client**, **Insomnia** o **cURL** para probar estos endpoints.

---

## 1️⃣ CREAR CARRO

### Endpoint
```
POST http://localhost:3000/api/carros
```

### Body (JSON)
```json
{
    "idEquipo": 1
}
```

### Response exitoso
```json
{
    "success": true,
    "mensaje": "Carro creado exitosamente.",
    "carro": {
        "Id_carro": 5,
        "Id_equipo": 1,
        "Finalizado": 0,
        "M_total": 0,
        "P_total": 0,
        "A_total": 0,
        "Equipo": "Ferrari"
    }
}
```

### Response error (equipo con 2 carros)
```json
{
    "success": false,
    "mensaje": "Error: El equipo ya tiene el máximo de 2 carros."
}
```

---

## 2️⃣ COMPRAR PARTE

### Endpoint
```
POST http://localhost:3000/api/partes/comprar
```

### Body (JSON)
```json
{
    "idEquipo": 1,
    "idParte": 3,
    "cantidad": 2
}
```

### Variables
- `idEquipo`: ID del equipo que compra
- `idParte`: ID de la parte a comprar
- `cantidad`: Unidades a comprar

### Response exitoso
```json
{
    "success": true,
    "mensaje": "Compra realizada exitosamente. Equipo: Ferrari. Parte: V12 Turbo. Cantidad: 2. Costo total: $5000. Presupuesto restante: $45000. ID Pedido: 101",
    "idPedido": 101
}
```

### Response error (presupuesto insuficiente)
```json
{
    "success": false,
    "mensaje": "Error: Presupuesto insuficiente. Disponible: $30000, Requerido: $50000"
}
```

### Response error (stock insuficiente)
```json
{
    "success": false,
    "mensaje": "Error: Stock insuficiente. Disponible: 1, Solicitado: 5"
}
```

---

## 3️⃣ INSTALAR PARTE EN CARRO

### Endpoint
```
POST http://localhost:3000/api/carros/:id/instalar
```

### Ejemplo completo
```
POST http://localhost:3000/api/carros/5/instalar
```

### Body (JSON)
```json
{
    "idParte": 3
}
```

### Variables
- `:id` en la URL: ID del carro
- `idParte`: ID de la parte a instalar

### Response exitoso
```json
{
    "success": true,
    "mensaje": "Parte instalada exitosamente. Parte: V12 Turbo (Power Unit). Totales - P: 350, A: 45, M: 200. Partes instaladas: 1/5",
    "carro": {
        "Id_carro": 5,
        "Id_equipo": 1,
        "Finalizado": 0,
        "M_total": 200,
        "P_total": 350,
        "A_total": 45,
        "Equipo": "Ferrari"
    }
}
```

### Response error (categoría duplicada)
```json
{
    "success": false,
    "mensaje": "Error: Ya hay una parte de categoría \"Power Unit\" instalada. Solo se permite una parte por categoría."
}
```

### Response error (sin inventario)
```json
{
    "success": false,
    "mensaje": "Error: El equipo no tiene la parte \"V12 Turbo\" en su inventario. Debe comprarla primero."
}
```

---

## 📊 CONSULTAS (GET) - Obtener Información

### 4️⃣ Obtener todos los carros de un equipo

```
GET http://localhost:3000/api/carros?idEquipo=1
```

Response:
```json
[
    {
        "Id_carro": 1,
        "Id_equipo": 1,
        "Finalizado": 0,
        "M_total": 200,
        "P_total": 350,
        "A_total": 45,
        "Equipo": "Ferrari"
    },
    {
        "Id_carro": 5,
        "Id_equipo": 1,
        "Finalizado": 0,
        "M_total": 0,
        "P_total": 0,
        "A_total": 0,
        "Equipo": "Ferrari"
    }
]
```

---

### 5️⃣ Obtener configuración de 5 categorías

```
GET http://localhost:3000/api/carros/5/configuracion
```

Response:
```json
[
    {
        "Id_categoria": 1,
        "Categoria": "Power Unit",
        "Id_parte": 3,
        "Parte": "V12 Turbo",
        "Marca": "Ferrari",
        "Potencia": 350,
        "Aerodinamica": 45,
        "Manejo": 200,
        "Precio": 2500
    },
    {
        "Id_categoria": 2,
        "Categoria": "Aerodinámica",
        "Id_parte": null,
        "Parte": null,
        "Marca": null
    },
    // ... otras 3 categorías
]
```

---

### 6️⃣ Obtener inventario de un equipo

```
GET http://localhost:3000/api/partes/inventario/1
```

Response:
```json
[
    {
        "Id_equipo": 1,
        "Id_parte": 5,
        "Cantidad": 2,
        "Nombre": "Neumáticos Slick",
        "Marca": "Pirelli",
        "Potencia": 0,
        "Aerodinamica": 0,
        "Manejo": 50,
        "Precio": 800,
        "Categoria": "Neumáticos"
    },
    {
        "Id_equipo": 1,
        "Id_parte": 7,
        "Cantidad": 1,
        "Nombre": "Suspensión DRS",
        "Marca": "Brembo",
        "Potencia": 0,
        "Aerodinamica": 30,
        "Manejo": 150,
        "Precio": 1500,
        "Categoria": "Suspensión"
    }
]
```

---

### 7️⃣ Obtener catálogo con stock total

```
GET http://localhost:3000/api/partes/inventario/total
```

Response:
```json
[
    {
        "Id_parte": 1,
        "Nombre": "Motor V8",
        "Marca": "Mercedes",
        "Potencia": 320,
        "Aerodinamica": 0,
        "Manejo": 180,
        "Precio": 3000,
        "Categoria": "Power Unit",
        "Stock_total": 5
    },
    {
        "Id_parte": 2,
        "Nombre": "Motor V12",
        "Marca": "Ferrari",
        "Potencia": 350,
        "Aerodinamica": 0,
        "Manejo": 200,
        "Precio": 2500,
        "Categoria": "Power Unit",
        "Stock_total": 3
    }
    // ... más partes
]
```

---

### 8️⃣ Verificar disponibilidad ANTES de comprar

```
POST http://localhost:3000/api/partes/verificar-disponibilidad
```

Body:
```json
{
    "idEquipo": 1,
    "idParte": 3,
    "cantidad": 2
}
```

Response:
```json
{
    "Precio": 2500.00,
    "StockDisponible": 5,
    "PresupuestoDisponible": 45000.00,
    "Total": 5000.00,
    "Cantidad": 2,
    "PuedeComprar": 1,
    "Mensaje": "OK"
}
```

Response (sin presupuesto):
```json
{
    "Precio": 2500.00,
    "StockDisponible": 10,
    "PresupuestoDisponible": 3000.00,
    "Total": 5000.00,
    "Cantidad": 2,
    "PuedeComprar": 0,
    "Mensaje": "Presupuesto insuficiente"
}
```

---

## 🔄 Flujo Completo de Ejemplo

### Scenario: Equipo Ferrari arma su primer carro

#### Paso 1: Crear carro
```
POST /api/carros
Body: { "idEquipo": 1 }
→ Retorna: Id_carro = 5
```

#### Paso 2: Verificar disponibilidad de compra
```
POST /api/partes/verificar-disponibilidad
Body: { "idEquipo": 1, "idParte": 3, "cantidad": 1 }
→ Retorna: PuedeComprar = 1, PresupuestoDisponible = $50000
```

#### Paso 3: Comprar parte
```
POST /api/partes/comprar
Body: { "idEquipo": 1, "idParte": 3, "cantidad": 1 }
→ Retorna: success = true, idPedido = 101
→ BD: INVENTARIO_TOTAL se decrementa
→ BD: INVENTARIO_EQUIPO se incrementa
```

#### Paso 4: Ver inventario actualizado
```
GET /api/partes/inventario/1
→ Retorna: Parte 3 con Cantidad = 1 (disponible para instalar)
```

#### Paso 5: Instalar parte en carro
```
POST /api/carros/5/instalar
Body: { "idParte": 3 }
→ Retorna: M_total = 200, P_total = 350, A_total = 45
→ BD: ESTRUCTURA_CARRO insertado
→ BD: INVENTARIO_EQUIPO decrementado
→ BD: CARRO actualizado con nuevos totales
```

#### Paso 6: Ver configuración del carro
```
GET /api/carros/5/configuracion
→ Retorna: 5 categorías con:
   - Power Unit: V12 Turbo instalado
   - Aerodinámica: vacío
   - Caja de Cambios: vacío
   - Suspensión: vacío
   - Neumáticos: vacío
```

#### Pasos 7-10: Repetir compra e instalación para las 4 categorías restantes

#### Paso 11: Verificar que carro está finalizado
```
GET /api/carros?idEquipo=1
→ Retorna: Finalizado = 1 (cuando tiene 5/5 partes)
```

---

## 💾 Tabla de códigos de respuesta

| Código | Significado |
|--------|-----------|
| 201 | Creado exitosamente (POST) |
| 200 | OK (GET, POST exitoso) |
| 400 | Error de validación (parámetros inválidos) |
| 404 | No encontrado |
| 500 | Error interno del servidor |

---

## ⚠️ Errores comunes y soluciones

### Error: "idEquipo, idParte, cantidad son requeridos"
**Causa:** Body del POST está vacío o mal formado
**Solución:** Asegúrate de enviar JSON válido en el body

### Error: "El equipo ya tiene el máximo de 2 carros"
**Causa:** Ya tiene 2 carros y quieres crear uno más
**Solución:** Usa un equipo diferente o elimina un carro primero

### Error: "No tiene la parte en su inventario"
**Causa:** Intentaste instalar sin comprar primero
**Solución:** Compra la parte antes de instalarla

### Error: "Ya hay una parte de categoría X instalada"
**Causa:** Intentaste instalar 2 partes de la misma categoría
**Solución:** Desinstala la otra primero

---

## 📝 Variables de Ejemplo

### IDs comunes para pruebas
```javascript
const EJEMPLO = {
    equipos: [1, 2, 3],  // Ferrari, Mercedes, Red Bull
    partes: [1, 2, 3, 4, 5],  // Motores, aerodinámicos, etc
    carros: [1, 2, 3, 4, 5],  // IDs de carros
    cantidadCompra: 1  // Siempre >= 1
};
```

---

**Última actualización:** 17/01/2026
