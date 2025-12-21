# 🔐 Implementación de Argon2id - Proyecto F1 Database

## ✅ Lo que se implementó

### 1. **Librería Argon2id instalada**
- Instalada: `argon2` versión 0.44.0
- Removed: `bcrypt` (ya no necesario)

### 2. **Archivo de utilidades de seguridad**
**Ruta:** `backend/src/utils/password.js`
- Función `hashPassword()` - Hashea contraseñas con Argon2id
- Función `verifyPassword()` - Verifica contraseña contra hash
- Parámetros de seguridad recomendados por OWASP:
  - Algoritmo: **Argon2id** (resistente a GPU/ASIC attacks)
  - Memoria: 19456 KB (~19 MB)
  - Time Cost: 2 iteraciones
  - Parallelism: 1 thread
  - Salt: Automático (incluido en el hash)

### 3. **Rutas de autenticación actualizadas**
**Ruta:** `backend/src/routes/auth.routes.js`
- ✅ Las contraseñas de prueba ahora están hasheadas
- ✅ En login, se verifica con `verifyPassword()` (nunca texto plano)
- ✅ Credenciales de usuarios de prueba:
  - `admin@f1.com` / `123456`
  - `engineer@f1.com` / `123456`
  - `driver@f1.com` / `123456`

### 4. **Hashes generados**
Los hashes Argon2id para usuarios de prueba son:

```
admin@f1.com:
$argon2id$v=19$m=19456,t=2,p=1$uAoDVRVV/PyaR/3G8JXn+A$JLcqKtj5Bd2PcJAL134278O5kjhnTZ6KOyEZGojgHP0

engineer@f1.com:
$argon2id$v=19$m=19456,t=2,p=1$+T2AI1BckNFMaOe4E3H4lQ$y9+Ed2TSOU8kLZp0FjZu37is1WeVXLyYs1M/v+9/ULM

driver@f1.com:
$argon2id$v=19$m=19456,t=2,p=1$Zp/BMR21snko8vtsn4A6fA$PIjcjPTusY6ln2in0nDl9PYgN78sDGxGAWcFdARp+iA
```

### 5. **Archivos de utilidad creados**

- **`backend/generate-hashes.js`** - Script para generar nuevos hashes
- **`backend/SECURITY.md`** - Guía completa de seguridad con ejemplos

## 🔒 Características de Seguridad

### ✅ Lo que está implementado:
- ✅ Hash con Argon2id (industria estándar)
- ✅ Salt automático en cada hash
- ✅ Parámetros de costo adecuados (memory, time, parallelism)
- ✅ Contraseñas NUNCA en texto plano
- ✅ Comparación segura con `verifyPassword()`
- ✅ Sesiones con `httpOnly` cookies
- ✅ CORS configurado correctamente
- ✅ CSRF protection (`sameSite: 'lax'`)

### 📋 Lo que ya tenías bien:
- ✅ CORS configurado
- ✅ Sesiones seguras
- ✅ HTTP-only cookies
- ✅ Environment variables

## 🚀 Cómo usar en producción

### Para nuevos usuarios (Registro):
```javascript
const { hashPassword } = require('./src/utils/password');

const plainPassword = 'password123';  // Del formulario
const passwordHash = await hashPassword(plainPassword);

// Guardar en BD:
// INSERT INTO usuarios (email, nombre, password_hash, rol) 
// VALUES (?, ?, ?, ?)
```

### Para verificar login:
```javascript
const { verifyPassword } = require('./src/utils/password');

const isValid = await verifyPassword(password, usuario.passwordHash);
if (!isValid) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
}
```

## 📝 Para cambiar contraseña de usuario:

```javascript
router.post('/change-password', async (req, res) => {
    const { newPassword } = req.body;
    const newHash = await hashPassword(newPassword);
    
    // UPDATE usuarios SET password_hash = ? WHERE id = ?
    // [newHash, req.session.userId]
});
```

## ⚠️ Importante: NUNCA hagas esto:
```javascript
// ❌ INSEGURO
database.insert('usuarios', { email, password: plainPassword });

// ❌ INSEGURO
usuario.password = plainPassword;  // En logs

// ❌ INSEGURO
if (password === usuario.password) { }  // Comparación directa
```

## 🧪 Prueba ahora:

El servidor está corriendo en `http://localhost:3000`

Prueba el login con:
- Email: `admin@f1.com`
- Password: `123456`

## 📚 Recursos:

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Argon2 Official](https://argon2-cffi.readthedocs.io/)
- [npm argon2](https://www.npmjs.com/package/argon2)

---

**Fecha de implementación:** Diciembre 21, 2025
**Algoritmo:** Argon2id v1.3
**Versión Node:** 18+
