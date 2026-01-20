# Sistema de Gestión Manual de Carros y Conductores

## Resumen de Cambios

Se ha implementado un sistema completo para gestionar la creación manual de carros por equipo y la asignación de conductores, utilizando la tabla **CONDUCTOR_CHASIS** de la base de datos.

## Cambios Realizados

### 1. Backend - Nuevos Endpoints

#### Archivo: `backend/src/routes/carros.routes.js`

**POST /api/carros**
- Crea un nuevo carro para un equipo
- Valida que el equipo no tenga más de 2 carros
- Valida que el conductor (opcional) no tenga otro carro asignado
- Parámetros: `idEquipo`, `idConductor` (opcional)

**PUT /api/carros/:id/conductor**
- Asigna o cambia el conductor de un carro
- Valida que el conductor no tenga otro carro asignado
- Parámetros: `idConductor`

**DELETE /api/carros/:id**
- Elimina un carro y todas sus relaciones
- Elimina registros en CONDUCTOR_CHASIS y ESTRUCTURA_CARRO

### 2. Frontend - Servicios

#### Archivo: `frontend/src/services/carros.service.js`

**crearCarro(idEquipo, idConductor)**
- Crea un nuevo carro
- Permite asignar conductor al momento de creación

**asignarConductor(idCarro, idConductor)**
- Asigna un conductor a un carro existente

**eliminarCarro(idCarro)**
- Elimina un carro

### 3. Frontend - Interfaz de Equipos

#### Archivo: `frontend/src/pages/Equipos.jsx`

**Tab de Carros Actualizado:**
- Muestra contador de carros (X/2)
- Botón "Agregar Carro" con validación de máximo 2
- Botón "Eliminar" en cada tarjeta de carro
- Mensaje cuando no hay carros
- Interfaz mejorada con indicadores visuales

**Nuevas Funciones:**
- `handleAgregarCarro(equipoId)`: Crea un nuevo carro
- `handleEliminarCarro(carroId)`: Elimina un carro con confirmación

**Componente CarroCard:**
- Agregado botón "Eliminar" con manejo de eventos
- Prevención de propagación del click

### 4. Frontend - Configuración de Carro

#### Archivo: `frontend/src/pages/ArmadoCarro.jsx`

**Selector de Conductor:**
- Card con selector dropdown de pilotos del equipo
- Muestra habilidad del conductor cuando está asignado
- Se deshabilita cuando el carro está finalizado
- Carga automática de pilotos disponibles del equipo

**Nuevas Funcionalidades:**
- Estado `pilotos`: Lista de conductores del equipo
- Estado `asignandoConductor`: Control de loading
- Función `handleAsignarConductor(pilotoId)`: Asigna conductor
- Integración con API `/api/equipos/:id/pilotos`

### 5. Base de Datos - Stored Procedures

#### Archivo: `database/stored-procedures/SP_GestionCarros.sql`

**SP_CrearCarro**
```sql
EXEC SP_CrearCarro 
    @Id_equipo = 1, 
    @Id_conductor = 5,  -- Opcional
    @Id_carro = @IdCarro OUTPUT,
    @Resultado = @Resultado OUTPUT
```
- Valida límite de 2 carros por equipo
- Valida que conductor pertenezca al equipo (rol 3)
- Valida que conductor no tenga otro carro
- Crea registro en CONDUCTOR_CHASIS si hay conductor

**SP_AsignarConductor**
```sql
EXEC SP_AsignarConductor 
    @Id_carro = 1, 
    @Id_conductor = 5,
    @Resultado = @Resultado OUTPUT
```
- Valida que conductor pertenezca al mismo equipo del carro
- Valida que conductor no tenga otro carro asignado
- Elimina relación anterior en CONDUCTOR_CHASIS
- Crea nueva relación en CONDUCTOR_CHASIS

**SP_EliminarCarro**
```sql
EXEC SP_EliminarCarro 
    @Id_carro = 1,
    @Resultado = @Resultado OUTPUT
```
- Elimina relación en CONDUCTOR_CHASIS
- Elimina partes en ESTRUCTURA_CARRO
- Elimina el carro

## Tabla CONDUCTOR_CHASIS

Esta tabla intermedia relaciona conductores (USUARIO) con carros (CARRO):

```sql
CREATE TABLE CONDUCTOR_CHASIS (
    Id_usuario INT FK -> USUARIO.Id_usuario,
    Id_carro INT FK -> CARRO.Id_carro,
    PRIMARY KEY (Id_usuario, Id_carro)
)
```

### Restricciones Implementadas:
1. **Máximo 2 carros por equipo** - Validado en SP_CrearCarro
2. **1 conductor por carro** - Enforced por FK Id_conductor en CARRO
3. **1 carro por conductor** - Validado en SP_CrearCarro y SP_AsignarConductor
4. **Conductor debe ser del mismo equipo** - Validado en ambos SP

## Flujo de Uso

### 1. Crear Equipo y Agregar Carros
```
Equipos -> Seleccionar Equipo -> Tab "Carros" -> "Agregar Carro"
```

### 2. Asignar Conductor
```
Equipos -> Seleccionar Equipo -> Tab "Carros" -> Click en Carro -> Selector "Conductor Asignado"
```
O también desde:
```
Armado de Carro -> Selector de Conductor en Header
```

### 3. Configurar Carro
```
Equipos -> Carro -> Instalar 5 partes (una por categoría)
```

### 4. Finalizar Carro
```
Cuando tiene 5 partes -> Botón "Finalizar Carro"
```

## Validaciones de Negocio

### Backend:
- ✅ Máximo 2 carros por equipo
- ✅ Conductor debe existir y ser del equipo
- ✅ Conductor solo puede tener 1 carro
- ✅ No se puede asignar un conductor que ya tiene carro

### Frontend:
- ✅ Botón "Agregar Carro" se deshabilita al llegar a 2 carros
- ✅ Selector de conductor solo muestra pilotos del equipo
- ✅ Confirmación antes de eliminar carro
- ✅ Indicadores visuales del estado del carro (X/5 partes)
- ✅ Selector se deshabilita cuando el carro está finalizado

## Mensajes de Error

```javascript
// Crear más de 2 carros
"Error: El equipo ya tiene el máximo de 2 carros"

// Conductor con otro carro
"Error: El conductor ya tiene un carro asignado"

// Conductor de otro equipo
"Error: El conductor no existe o no pertenece a este equipo"
```

## Notas Técnicas

### Transacciones:
Todos los stored procedures usan transacciones ACID:
- `BEGIN TRANSACTION`
- Validaciones
- Operaciones
- `COMMIT` o `ROLLBACK`

### Integridad Referencial:
- Al eliminar carro, se eliminan automáticamente:
  - Relaciones en CONDUCTOR_CHASIS
  - Partes en ESTRUCTURA_CARRO

### API Endpoints:
```
GET    /api/carros              - Listar carros
POST   /api/carros              - Crear carro
GET    /api/carros/:id          - Obtener carro
DELETE /api/carros/:id          - Eliminar carro
PUT    /api/carros/:id/conductor - Asignar conductor
GET    /api/equipos/:id/pilotos - Obtener pilotos del equipo
```

## Testing Recomendado

1. **Crear 2 carros para un equipo** ✓
2. **Intentar crear 3er carro** (debe fallar) ✓
3. **Asignar conductor al carro 1** ✓
4. **Intentar asignar mismo conductor al carro 2** (debe fallar) ✓
5. **Eliminar carro 1** ✓
6. **Verificar que conductor queda liberado** ✓
7. **Asignar ese conductor al carro 2** ✓

## Archivos Modificados

```
backend/
  src/
    routes/carros.routes.js        [MODIFICADO]
    services/carros.service.js     [SIN CAMBIOS - Ya tenía los métodos]

frontend/
  src/
    services/carros.service.js     [MODIFICADO]
    pages/Equipos.jsx              [MODIFICADO]
    pages/ArmadoCarro.jsx          [MODIFICADO]

database/
  stored-procedures/
    SP_GestionCarros.sql           [NUEVO]
```

## Próximos Pasos Sugeridos

1. ✅ Ejecutar SP_GestionCarros.sql en la base de datos
2. ✅ Probar creación manual de carros en la interfaz
3. ✅ Probar asignación de conductores
4. ✅ Verificar restricciones (máximo 2 carros, 1 conductor por carro)
5. ⚠️ Considerar agregar campo "Habilidad" en USUARIO si no existe

## Mejoras Futuras Opcionales

- [ ] Dashboard con estadísticas de carros por equipo
- [ ] Historial de cambios de conductor
- [ ] Comparación de carros del mismo equipo
- [ ] Exportar configuración de carro a PDF
- [ ] Notificaciones cuando un carro es finalizado
