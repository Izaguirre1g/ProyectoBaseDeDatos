# 📋 Estructura de Datos y Mapeos

## 🗂️ Tablas principales de la Base de Datos

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO                               │
├─────────────────────────────────────────────────────────┤
│ PK  Id_usuario (INT)                                    │
│     Nombre_usuario (VARCHAR)              ← Que guardamos│
│     Correo_usuario (VARCHAR)              ← Del login    │
│     Contrasena_hash (VARCHAR)             ← Argon2id    │
│ FK  Id_equipo (INT) → EQUIPO                            │
│ FK  Id_rol (INT) → ROL                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    EQUIPO                                │
├─────────────────────────────────────────────────────────┤
│ PK  Id_equipo (INT)                                     │
│     Nombre (VARCHAR)           ← Ej: Ferrari, Mercedes  │
│     Presupuesto (DECIMAL)      ← Total disponible       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    CARRO                                 │
├─────────────────────────────────────────────────────────┤
│ PK  Id_carro (INT)                                      │
│ FK  Id_equipo (INT) → EQUIPO                            │
│     Finalizado (TINYINT)       ← 0 o 1 (5 partes)      │
│     P_total (INT)              ← Potencia total         │
│     A_total (INT)              ← Aerodinámico total     │
│     M_total (INT)              ← Manejo total           │
│ FK  Id_conductor (INT) → USUARIO (opcional)             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    PARTE                                 │
├─────────────────────────────────────────────────────────┤
│ PK  Id_parte (INT)                                      │
│     Nombre (VARCHAR)           ← Ej: V12 Turbo         │
│     Marca (VARCHAR)            ← Ej: Ferrari           │
│     Potencia (INT)             ← Stats (0-400)         │
│     Aerodinamica (INT)         ← Stats (0-100)         │
│     Manejo (INT)               ← Stats (0-300)         │
│     Precio (DECIMAL)           ← Costo                 │
│ FK  Id_categoria (INT) → CATEGORIA                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    CATEGORIA                             │
├─────────────────────────────────────────────────────────┤
│ PK  Id_categoria (INT)                                  │
│     Nombre (VARCHAR)           ← 5 tipos:              │
│                                  1. Power Unit         │
│                                  2. Aerodinámica       │
│                                  3. Caja Cambios       │
│                                  4. Suspensión         │
│                                  5. Neumáticos         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 ESTRUCTURA_CARRO                         │
├─────────────────────────────────────────────────────────┤
│ PK,FK Id_carro (INT) → CARRO    (Relación: 1 a muchos) │
│ PK,FK Id_parte (INT) → PARTE    (Relación: 1 a 1 cat)  │
│                                                         │
│ Nota: Máximo 1 parte por categoría                      │
│       Máximo 5 partes total (1 por categoría)           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 INVENTARIO_TOTAL                         │
├─────────────────────────────────────────────────────────┤
│ PK,FK Id_parte (INT) → PARTE                            │
│     Stock_total (INT)          ← Stock disponible       │
│                                                         │
│ Nota: Se actualiza con SP_RealizarCompra                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 INVENTARIO_EQUIPO                        │
├─────────────────────────────────────────────────────────┤
│ PK,FK Id_equipo (INT) → EQUIPO                          │
│ PK,FK Id_parte (INT) → PARTE                            │
│     Cantidad (INT)             ← Lo que tiene el equipo │
│                                                         │
│ Nota: Se actualiza con SP_RealizarCompra                │
│       Se decrementa con SP_InstalarParteEnCarro         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    PEDIDO                                │
├─────────────────────────────────────────────────────────┤
│ PK  Id_pedido (INT)                                     │
│     Fecha_adquisicion (DATETIME)                        │
│ FK  Id_equipo (INT) → EQUIPO                            │
│     Costo_total (DECIMAL)      ← Total del pedido       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 DETALLE_PEDIDO                           │
├─────────────────────────────────────────────────────────┤
│ PK,FK Id_pedido (INT) → PEDIDO                          │
│ PK,FK Id_parte (INT) → PARTE                            │
│     Cantidad_pedido (INT)      ← Cuántas se compraron   │
│     Precio_unitario (DECIMAL)  ← Precio al momento      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    COMPRA                                │
├─────────────────────────────────────────────────────────┤
│ PK  Id_compra (INT)                                     │
│     Cantidad (INT)             ← Para auditoría         │
│     Fecha_adquisicion (DATETIME)                        │
│ FK  Id_equipo (INT) → EQUIPO                            │
│ FK  Id_parte (INT) → PARTE                              │
│                                                         │
│ Nota: Tabla de auditoría, se llena automáticamente      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔗 Relaciones

```
USUARIO ──────┐
              ├─→ EQUIPO ←──────┬──────── PEDIDO
              └────────────────→ ├─→ INVENTARIO_EQUIPO ←─── PARTE
                                 ├─→ CARRO ────→ ESTRUCTURA_CARRO ←─┘
                                 └─→ COMPRA ───────────────────┘
                                     (auditoría)

                                 INVENTARIO_TOTAL ←──── PARTE ──→ CATEGORIA
```

---

## 📊 Ejemplo de Datos Completos

### Equipo Ferrari quiere armar su carro #1

```javascript
// 1. EQUIPO
{
    Id_equipo: 1,
    Nombre: "Ferrari",
    Presupuesto: 50000
}

// 2. USUARIOS del equipo
{
    Id_usuario: 10,
    Nombre_usuario: "John Leclerc",
    Correo_usuario: "john@ferrari.com",
    Id_equipo: 1,
    Id_rol: 3  // Conductor
}

// 3. CARRO creado
{
    Id_carro: 1,
    Id_equipo: 1,
    Finalizado: 0,
    P_total: 0,
    A_total: 0,
    M_total: 0,
    Id_conductor: 10
}

// 4. PARTES disponibles en tienda
[
    { Id_parte: 1, Nombre: "V12 Turbo", Categoria: "Power Unit", Potencia: 350, Precio: 2500 },
    { Id_parte: 2, Nombre: "DRS System", Categoria: "Aerodinámica", Aerodinamica: 80, Precio: 1800 },
    { Id_parte: 3, Nombre: "C8 Gearbox", Categoria: "Caja Cambios", Manejo: 180, Precio: 2000 },
    { Id_parte: 4, Nombre: "Active Suspension", Categoria: "Suspensión", Manejo: 150, Precio: 2200 },
    { Id_parte: 5, Nombre: "Pirelli Slicks", Categoria: "Neumáticos", Manejo: 100, Precio: 800 }
]

// 5. COMPRA (después de POST /partes/comprar)
{
    Id_pedido: 1,
    Fecha_adquisicion: "2026-01-17 15:30:00",
    Id_equipo: 1,
    Costo_total: 2500
}

// 6. INVENTARIO_TOTAL (después de compra)
[
    { Id_parte: 1, Stock_total: 4 },  // Tenía 5, compró 1
    { Id_parte: 2, Stock_total: 3 },
    { Id_parte: 3, Stock_total: 5 },
    { Id_parte: 4, Stock_total: 2 },
    { Id_parte: 5, Stock_total: 10 }
]

// 7. INVENTARIO_EQUIPO (después de compra)
[
    { Id_equipo: 1, Id_parte: 1, Cantidad: 1 }  // V12 Turbo disponible
]

// 8. ESTRUCTURA_CARRO (después de instalar)
[
    { Id_carro: 1, Id_parte: 1 }  // V12 Turbo en carro #1
]

// 9. CARRO actualizado (después de instalar)
{
    Id_carro: 1,
    Id_equipo: 1,
    Finalizado: 0,
    P_total: 350,  // Potencia del V12
    A_total: 0,
    M_total: 0,
    Id_conductor: 10
}
```

---

## 🔄 Cambios en tablas después de cada operación

### After `SP_CrearCarro`
```
CARRO: INSERT
├─ Id_carro: autoincrementado
├─ Id_equipo: parámetro
├─ Finalizado: 0
├─ P_total: 0
├─ A_total: 0
└─ M_total: 0
```

### After `SP_RealizarCompra`
```
PEDIDO: INSERT
├─ Costo_total: Precio × Cantidad

DETALLE_PEDIDO: INSERT
├─ Cantidad_pedido: parámetro
├─ Precio_unitario: del momento

INVENTARIO_TOTAL: UPDATE
├─ Stock_total -= Cantidad

INVENTARIO_EQUIPO: INSERT o UPDATE
├─ Cantidad += Cantidad

COMPRA: INSERT (auditoría)
└─ Registra quién compró qué

USUARIO (presupuesto): Se recalcula con fn_CalcularPresupuestoEquipo
├─ Total_Aportes - Total_Gastos = Presupuesto_disponible
```

### After `SP_InstalarParteEnCarro`
```
ESTRUCTURA_CARRO: INSERT
├─ Id_carro: parámetro
└─ Id_parte: parámetro

INVENTARIO_EQUIPO: UPDATE
├─ Cantidad -= 1
├─ DELETE si Cantidad = 0

CARRO: UPDATE
├─ P_total: SUM(PARTE.Potencia) donde instaladas
├─ A_total: SUM(PARTE.Aerodinamica) donde instaladas
├─ M_total: SUM(PARTE.Manejo) donde instaladas
└─ Finalizado: 1 si COUNT(distintas_categorias) = 5
```

---

## 🎯 Restricciones y Validaciones

```
┌────────────────────────────────────────────────┐
│          RESTRICCIÓN: 2 Carros por Equipo      │
├────────────────────────────────────────────────┤
│ SP_CrearCarro valida:                          │
│ COUNT(CARRO where Id_equipo) < 2 ✓             │
│                                                │
│ Si Count >= 2 → RETURN -1 y mensaje error      │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│      RESTRICCIÓN: 1 Parte por Categoría        │
├────────────────────────────────────────────────┤
│ SP_InstalarParteEnCarro valida:                │
│ COUNT(ESTRUCTURA_CARRO.Id_parte                │
│   where Id_carro = X                           │
│   AND Id_categoria = Y) = 0 ✓                  │
│                                                │
│ Si Count >= 1 → RETURN -1 y mensaje error      │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│    RESTRICCIÓN: Stock Disponible en Tienda     │
├────────────────────────────────────────────────┤
│ SP_RealizarCompra valida:                      │
│ INVENTARIO_TOTAL.Stock_total >= Cantidad ✓    │
│                                                │
│ Si Stock < Cantidad → RETURN -1 error          │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│    RESTRICCIÓN: Presupuesto Disponible         │
├────────────────────────────────────────────────┤
│ SP_RealizarCompra valida:                      │
│ fn_CalcularPresupuestoEquipo >= Total ✓       │
│                                                │
│ Si Presupuesto < Total → RETURN -1 error       │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│   RESTRICCIÓN: Stock en Inventario del Equipo  │
├────────────────────────────────────────────────┤
│ SP_InstalarParteEnCarro valida:                │
│ INVENTARIO_EQUIPO.Cantidad >= 1 ✓              │
│                                                │
│ Si Cantidad < 1 → RETURN -1 error              │
└────────────────────────────────────────────────┘
```

---

## 📐 Mapeo Frontend ↔ Categorías BD

```javascript
const CATEGORIA_TO_SLOT = {
    // Lo que viene de la BD → Lo que usa Frontend
    'Power Unit': 'powerUnit',
    'Aerodinámica': 'aerodinamica',
    'Aerodinamica': 'aerodinamica',  // Sin acento también
    'Caja de Cambios': 'cajaCambios',
    'Suspensión': 'suspension',
    'Suspension': 'suspension',  // Sin acento
    'Neumáticos': 'neumaticos',
    'Neumaticos': 'neumaticos'  // Sin acento
};

const SLOT_TO_CATEGORIA = {
    // Lo que usa Frontend → Lo que busca en la BD
    'powerUnit': ['Power Unit'],
    'aerodinamica': ['Aerodinámica', 'Aerodinamica'],
    'cajaCambios': ['Caja de Cambios'],
    'suspension': ['Suspensión', 'Suspension'],
    'neumaticos': ['Neumáticos', 'Neumaticos']
};
```

---

## 🧮 Cálculos Automáticos

### Presupuesto Disponible (fn_CalcularPresupuestoEquipo)
```
PRESUPUESTO_DISPONIBLE = 
    (Total_Aportes de todos los PATROCINADOR)
    -
    (Total_Gastos de todos los PEDIDO)
```

### Totales del Carro (recalculados automáticamente)
```
P_total = SUM(PARTE.Potencia) 
          donde PARTE instalada en ESTRUCTURA_CARRO del carro

A_total = SUM(PARTE.Aerodinamica)
          donde PARTE instalada en ESTRUCTURA_CARRO del carro

M_total = SUM(PARTE.Manejo)
          donde PARTE instalada en ESTRUCTURA_CARRO del carro
```

### Estado Finalizado
```
Finalizado = CASE
    WHEN COUNT(DISTINCT Id_categoria en ESTRUCTURA_CARRO) = 5
    THEN 1
    ELSE 0
END
```

---

**Última actualización:** 17/01/2026
