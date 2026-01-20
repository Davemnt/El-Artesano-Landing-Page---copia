# 🚀 Guía de Inicio Rápido - El Artesano

**Última actualización:** Enero 15, 2026

Esta guía te ayudará a probar todas las funcionalidades del sitio en 10 minutos.

---

## 📋 Lo Que Puedes Probar

### 🛒 Sistema de Compras Dual

1. **Productos Físicos (Panadería)** - Compra sin registro
2. **Cursos Digitales** - Requiere cuenta de usuario

### 🔐 Sistema de Autenticación

1. **Usuario Normal** - Comprar cursos y productos
2. **Administrador** - Gestión completa del sitio

---

## ⚡ Demo Rápida (10 minutos)

### Paso 1: Configurar Firebase (2 min)

1. **Editar credenciales** en [`public/js/firebase-init.js`](public/js/firebase-init.js):

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_DE_FIREBASE",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

2. **Habilitar Authentication** en Firebase Console:
   - Email/Password ✓
   - Google (opcional) ✓

3. **Crear Firestore Database** en modo producción

### Paso 2: Iniciar el Sitio (1 min)

**Opción A: Servidor Local Simple**
```powershell
# Desde la raíz del proyecto
npx serve . -l 5000
```

**Opción B: Live Server de VS Code**
- Click derecho en `index.html` → "Open with Live Server"

**Opción C: Firebase Hosting**
```powershell
firebase deploy
```

### Paso 3: Probar Compra SIN Registro (2 min)

**Demo: Guest Checkout para Productos**

1. Abrir `http://localhost:5000/index.html`
2. Scroll a la sección "Productos"
3. Click en "Comprar" en cualquier producto
4. Se abre el modal del carrito
5. Click en "Finalizar Compra"
6. **Redirige a `checkout-producto.html`**
7. Completar formulario (sin crear cuenta):
   - Nombre: Juan
   - Apellido: Pérez
   - Email: test@ejemplo.com
   - Teléfono: 1234567890
   - Dirección: Calle 123
   - Ciudad: Buenos Aires
   - Provincia: BA
   - CP: 1000

✅ **Resultado:** Compra procesada sin necesidad de crear cuenta

### Paso 4: Crear Usuario Normal (2 min)

1. Ir a `http://localhost:5000/login.html`
2. Tab "Registrarse"
3. Completar formulario:
   - Nombre: Usuario Test
   - Email: usuario@test.com
   - Contraseña: test123456
4. Click en "Crear Cuenta"
5. **Automáticamente redirige a `cursos.html`**

✅ **Resultado:** Usuario normal creado y logueado

### Paso 5: Probar Compra de Curso CON Login (2 min)

**Demo: Cursos Requieren Autenticación**

1. En `cursos.html`, click en "Comprar" de cualquier curso
2. **Si NO estás logueado:** Redirige automáticamente a `login.html`
3. Después de login, retorna a la página de compra
4. Ver detalles del curso en `ejemplo-comprar-curso.html`
5. Click en "Comprar Ahora"
6. Redirige a MercadoPago para pago

✅ **Resultado:** Solo usuarios con cuenta pueden comprar cursos

### Paso 6: Crear Administrador (1 min)

1. **Firebase Console** → Firestore Database
2. Colección `users`
3. Buscar el documento de tu usuario (UID)
4. **Agregar/Editar campo:**
   ```javascript
   roles: {
     admin: true
   }
   ```
5. Guardar cambios

✅ **Resultado:** Usuario convertido en administrador

### Paso 7: Acceder al Panel Admin (2 min)

1. Ir a `http://localhost:5000/admin-login.html`
2. Iniciar sesión con las credenciales del admin
3. **Redirige a `admin-panel.html`**

**En el panel puedes:**
- ✅ Crear productos físicos
- ✅ Crear cursos digitales
- ✅ Ver historial de ventas
- ✅ Gestionar contenido

---

## 🎬 Escenarios de Demo Completos

### Demo 1: Cliente que Compra Pan (Guest)

**Sin necesidad de cuenta**

```
1. Visitar index.html
2. Agregar "Pan de Masa Madre" al carrito
3. Agregar "Facturas" al carrito
4. Click en carrito (🛒)
5. Click "Finalizar Compra"
6. Completar datos de entrega
7. Procesar pago
8. Recibir confirmación
```

**Tiempo:** 2-3 minutos
**Login:** NO requerido ✅

### Demo 2: Estudiante que Compra Curso

**Requiere crear cuenta**

```
1. Visitar cursos.html (requiere login)
2. Si no tiene cuenta: Redirige a login.html
3. Crear cuenta nueva
4. Retorna a cursos.html
5. Click en "Comprar" en un curso
6. Ver detalles en ejemplo-comprar-curso.html
7. Click "Comprar Ahora"
8. Pagar en MercadoPago
9. Acceso automático al curso
10. Ver curso en "Mis Cursos"
```

**Tiempo:** 5 minutos
**Login:** OBLIGATORIO ✅

### Demo 3: Administrador Gestiona Sitio

**Requiere rol admin**

```
1. Ir a admin-login.html
2. Iniciar sesión con cuenta admin
3. En admin-panel.html:
   - Crear nuevo producto
   - Crear nuevo curso con video
   - Ver ventas realizadas
   - Publicar/despublicar contenido
```

**Tiempo:** 5 minutos
**Rol:** Administrador ✅

---

## 🔍 Pruebas Específicas

### Probar: Guest Checkout

**Archivo:** `checkout-producto.html`

**Pasos:**
1. Agregar productos al carrito en index.html
2. Click "Finalizar Compra"
3. Verificar que NO solicita login
4. Completar formulario de invitado
5. Ver que hay opción para "iniciar sesión" (opcional)

**Resultado Esperado:**
- ✅ Permite compra sin crear cuenta
- ✅ Guarda datos en el pedido
- ✅ Si usuario está logueado, pre-llena datos

### Probar: Protección de Cursos

**Archivo:** `ejemplo-comprar-curso.html`

**Pasos:**
1. Cerrar sesión (si está logueado)
2. Ir directo a `ejemplo-comprar-curso.html?id=CURSO_ID`
3. Verificar redirección automática a login

**Resultado Esperado:**
- ✅ Redirige a login.html si no está autenticado
- ✅ Muestra mensaje: "Debes iniciar sesión para comprar cursos"
- ✅ Después de login, retorna a la página de compra

### Probar: Panel Admin

**Archivo:** `admin-panel.html`

**Pasos:**
1. Intentar acceder sin ser admin
2. Debe redirigir a index.html
3. Login como admin
4. Verificar acceso completo

**Resultado Esperado:**
- ✅ Bloquea acceso a no-administradores
- ✅ Permite crear/editar productos
- ✅ Permite crear/editar cursos

---

## 📊 Checklist de Funcionalidades

### Sistema de Compras

- [ ] ✅ Productos físicos: Compra sin registro (Guest Checkout)
- [ ] ✅ Cursos: Requiere login obligatorio
- [ ] ✅ Carrito de compras funcional
- [ ] ✅ Integración con MercadoPago
- [ ] ✅ Webhooks de confirmación

### Autenticación

- [ ] ✅ Registro de usuarios en login.html
- [ ] ✅ Login con email/contraseña
- [ ] ✅ Login con Google (opcional)
- [ ] ✅ Recuperación de contraseña
- [ ] ✅ Navbar dinámico según estado

### Protección de Rutas

- [ ] ✅ index.html - Público
- [ ] ✅ checkout-producto.html - Público (guest)
- [ ] ✅ cursos.html - Requiere login
- [ ] ✅ ejemplo-comprar-curso.html - Requiere login
- [ ] ✅ admin-panel.html - Requiere admin
- [ ] ✅ ejemplo-curso-player.html - Requiere compra

### Panel Admin

- [ ] ✅ Crear/editar productos
- [ ] ✅ Crear/editar cursos
- [ ] ✅ Ver historial de ventas
- [ ] ✅ Gestionar publicaciones

---

## 📖 Documentación Relacionada

| Archivo | Contenido |
|---------|-----------|
| [README.md](README.md) | Documentación completa del proyecto |
| [FIREBASE_SETUP.md](FIREBASE_SETUP.md) | Configuración técnica de Firebase |
| [firestore.rules](firestore.rules) | Reglas de seguridad de Firestore |

---

## 🆘 Problemas Comunes

### "Firebase is not defined"

**Causa:** Scripts no cargados correctamente

**Solución:**
```html
<!-- Orden correcto en el HTML -->
<script src="firebase-app-compat.js"></script>
<script src="firebase-auth-compat.js"></script>
<script src="firebase-firestore-compat.js"></script>
<script src="public/js/firebase-init.js"></script>
```

### "No tienes permisos de administrador"

**Causa:** Usuario no tiene rol admin en Firestore

**Solución:**
1. Firebase Console → Firestore
2. Colección `users` → Tu documento
3. Agregar: `roles: { admin: true }`
4. Cerrar sesión y volver a iniciar

### Página de compra de curso redirige a login

**Causa:** Funcionamiento correcto - cursos requieren login

**Solución:**
- Crear cuenta en login.html
- Iniciar sesión
- Automáticamente retornará a la página de compra

### Products no aparecen en index.html

**Causa:** No hay productos creados o no están publicados

**Solución:**
1. Login como admin
2. admin-panel.html → Productos
3. Crear producto
4. Marcar "Publicar"
5. Guardar

---

## ✨ Tips para la Demo

### Para Cliente Final

1. **Mostrar Guest Checkout primero**
   - Enfatizar que NO necesita crear cuenta para pan
   - Mostrar lo rápido que es el proceso

2. **Luego mostrar cursos**
   - Explicar por qué SÍ requiere cuenta
   - Beneficio: acceso permanente al contenido

3. **Demostrar área de miembros**
   - Ver "Mis Cursos"
   - Acceso al reproductor

### Para Desarrollador

1. **Revisar Firebase Console**
   - Verificar Authentication habilitado
   - Verificar Firestore creado
   - Verificar reglas de seguridad aplicadas

2. **Probar webhooks localmente**
   - Usar Firebase Emulators
   - Configurar ngrok para MercadoPago

3. **Deployment**
   - `firebase deploy --only hosting`
   - `firebase deploy --only functions`
   - `firebase deploy --only firestore:rules`

---

## 🚀 Siguiente Paso

Después de la demo, consultar [FIREBASE_SETUP.md](FIREBASE_SETUP.md) para deployment completo en producción.

---

**¿Todo funcionando?** 🎉 ¡El sitio está listo para producción!

### Videos no se reproducen
- Verificar que el usuario tenga acceso en Firestore → `user_courses`
- ID del documento debe ser: `{userId}_{courseId}`

### No aparece el panel admin
- Verificar que tu usuario tenga `roles.admin: true` en Firestore

---

## 💡 Tu Pregunta Respondida

**"¿Puedo registrar manualmente a las personas y darles acceso a cursos que pagaron?"**

**✅ SÍ**, ahora tienes:
- Formulario para crear usuarios desde el admin
- Asignación de cursos con un click
- Gestión completa de accesos
- Todo desde el navegador, sin código

---

## 📞 Comandos Útiles

```powershell
# Ver logs de errores
firebase functions:log

# Redesplegar reglas
firebase deploy --only firestore:rules

# Ver estado de emuladores
http://localhost:4000
```

---

¡Todo listo para probar! 🎉
