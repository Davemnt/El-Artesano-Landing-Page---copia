# 🚀 Guía de Configuración y Deployment - El Artesano

**Fecha:** 15 de Enero, 2026  
**Proyecto:** El Artesano Landing Page con Firebase

---

## ✅ Estado Actual

### ¿Qué está configurado?

✅ **Credenciales Firebase actualizadas**
- Proyecto: `el-artesano-44216`
- Auth Domain: `el-artesano-44216.firebaseapp.com`
- Las credenciales ya están en [`public/js/firebase-init.js`](public/js/firebase-init.js)

✅ **Reglas de Firestore optimizadas**
- Lectura pública de productos y cursos (sin login)
- Escritura solo para administradores
- Guest checkout habilitado para órdenes
- Ver [`firestore.rules`](firestore.rules)

✅ **Script de datos de muestra**
- Archivo: [`poblar-datos-muestra.html`](poblar-datos-muestra.html)
- 6 productos con imágenes de Unsplash
- 4 cursos con videos de YouTube
- Botón para crear y limpiar datos

---

## 🎯 Pasos para Poner en Marcha

### Paso 1: Iniciar Servidor Local (2 min)

```powershell
# Opción A: Servidor Python (si tienes Python instalado)
python -m http.server 8000

# Opción B: Servidor Node.js (si tienes Node.js)
npx http-server -p 8000

# Opción C: Live Server en VS Code
# Click derecho en index.html → "Open with Live Server"
```

**Abrir en navegador:** http://localhost:8000

---

### Paso 2: Configurar Firebase Console (10 min)

#### 2.1 Habilitar Authentication

```
1. Ir a: https://console.firebase.google.com/project/el-artesano-44216
2. Authentication → Get Started
3. Sign-in method → Habilitar "Email/Password"
4. (Opcional) Habilitar "Google" para login con Google
```

#### 2.2 Crear Firestore Database

```
1. Firestore Database → Create Database
2. Modo: "Producción" (production mode)
3. Ubicación: "southamerica-east1" (São Paulo) o "us-central1"
4. Click "Enable"
```

#### 2.3 Aplicar Reglas de Seguridad

**Opción A: Desde la consola (manual)**

```
1. Firestore Database → Rules
2. Copiar contenido de firestore.rules
3. Pegar y "Publish"
```

**Opción B: Desde terminal (automático)**

```powershell
# Instalar Firebase CLI (solo primera vez)
npm install -g firebase-tools

# Login a Firebase
firebase login

# Seleccionar proyecto
firebase use el-artesano-44216

# Desplegar reglas
firebase deploy --only firestore:rules
```

---

### Paso 3: Poblar Datos de Muestra (3 min)

1. **Abrir:** http://localhost:8000/poblar-datos-muestra.html

2. **Verificar conexión:**
   - Debe decir: "✅ Conectado a Firebase"
   - Si dice error, revisar credenciales en firebase-init.js

3. **Crear datos:**
   - Click en "🚀 Crear Todo (Productos + Cursos)"
   - Esperar a que se creen todos los registros
   - Ver log de confirmación

4. **Verificar en Firebase Console:**
   - Ir a Firestore Database
   - Colecciones: `products` (6 docs) y `courses` (4 docs)

---

### Paso 4: Crear Primer Administrador (5 min)

#### Opción A: Registrarse desde el sitio

```
1. Ir a: http://localhost:8000/login.html
2. Registrarse con email y contraseña
3. Copiar el UID del usuario (ver consola del navegador o Firestore)
4. Ir a Firestore Console → Colección "users" → Documento del usuario
5. Agregar campo:
   {
     "roles": {
       "admin": true
     }
   }
```

#### Opción B: Crear desde Firebase Console

```
1. Firebase Console → Authentication → Add user
   Email: admin@elartesano.com
   Password: [crear contraseña segura]

2. Copiar el UID generado

3. Firestore Database → Collection "users" → Add document
   Document ID: [pegar UID]
   Fields:
   {
     "email": "admin@elartesano.com",
     "displayName": "Administrador",
     "roles": {
       "admin": true
     },
     "createdAt": [Timestamp: now]
   }
```

---

### Paso 5: Probar Panel Admin (2 min)

1. **Login como admin:**
   - Ir a: http://localhost:8000/admin-login.html
   - Ingresar con credenciales de admin

2. **Verificar acceso:**
   - Debe redirigir a: http://localhost:8000/admin-panel.html
   - Ver lista de productos y cursos

3. **Probar crear producto:**
   - Click "Crear Producto"
   - Llenar formulario
   - Usar URL de imagen de Unsplash
   - Guardar

---

### Paso 6: Probar Flujo de Compra (5 min)

#### A. Guest Checkout (Productos Físicos - SIN LOGIN)

```
1. Ir a: http://localhost:8000/index.html
2. Agregar productos al carrito
3. Click en carrito → "Proceder al Pago"
4. Redirige a checkout-producto.html
5. Llenar datos como invitado
6. Comprar (se crea orden en Firestore con isGuest: true)
```

#### B. Compra de Curso (CON LOGIN OBLIGATORIO)

```
1. Ir a: http://localhost:8000/cursos.html
2. Click "Comprar Curso"
3. Si NO estás logueado → redirige a login.html
4. Registrarse/Login
5. Volver a cursos.html
6. Comprar curso (requiere autenticación)
```

---

## 🌐 Deployment a Firebase Hosting (Opcional)

### Configurar Hosting

```powershell
# 1. Inicializar Firebase en el proyecto
firebase init hosting

# Responder:
# - Public directory: . (raíz del proyecto)
# - Configure as SPA: No
# - Overwrite index.html: No

# 2. Desplegar
firebase deploy --only hosting

# 3. Tu sitio estará en:
# https://el-artesano-44216.web.app
```

---

## 📊 Estructura de Colecciones Firestore

### `products` (Productos Físicos)

```javascript
{
  name: "Pan de Campo",
  description: "Pan artesanal...",
  price: 450,
  imageUrl: "https://...",
  category: "Panes",
  stock: 20,
  createdAt: Timestamp
}
```

### `courses` (Cursos Digitales)

```javascript
{
  name: "Panadería Básica",
  description: "Aprende...",
  price: 4500,
  thumbnailUrl: "https://img.youtube.com/vi/...",
  videoUrl: "https://www.youtube.com/watch?v=...",
  youtubeId: "VIDEO_ID",
  duration: "4 semanas",
  lessons: 12,
  level: "Principiante",
  instructor: "Chef Master",
  published: true,
  createdAt: Timestamp
}
```

### `users` (Usuarios)

```javascript
{
  email: "usuario@email.com",
  displayName: "Juan Pérez",
  roles: {
    admin: false  // true para administradores
  },
  createdAt: Timestamp
}
```

### `orders` (Órdenes de Compra)

```javascript
{
  userId: "USER_UID" | null,  // null si es guest
  isGuest: true | false,
  items: [
    {
      name: "Pan de Campo",
      price: 450,
      quantity: 2
    }
  ],
  total: 950,
  customerInfo: {
    name: "Cliente",
    email: "cliente@email.com",
    phone: "1234567890",
    address: "..."
  },
  paymentMethod: "mercadopago" | "transferencia" | "efectivo",
  status: "pending" | "completed" | "cancelled",
  createdAt: Timestamp
}
```

---

## 🎨 Imágenes para Productos

### Fuentes Gratuitas (Sin atribución requerida)

1. **Unsplash** (Recomendado)
   - https://unsplash.com/s/photos/bread
   - https://unsplash.com/s/photos/bakery
   - Formato URL: `https://images.unsplash.com/photo-XXXXX?w=600`

2. **Pexels**
   - https://www.pexels.com/search/bread/
   - Alta calidad y gratuitas

3. **Pixabay**
   - https://pixabay.com/images/search/bakery/

### Ejemplos de URLs para Productos

```javascript
// Pan
imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"

// Medialunas/Croissants
imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600"

// Empanadas
imageUrl: "https://images.unsplash.com/photo-1599974793548-1f368851a3c4?w=600"

// Tartas
imageUrl: "https://images.unsplash.com/photo-1619740455993-32e5f752498b?w=600"

// Pan Integral
imageUrl: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600"
```

---

## 🎥 Videos de YouTube para Cursos

### Cómo obtener el YouTube ID

```
URL completa: https://www.youtube.com/watch?v=Kl5q0vhBMNM
YouTube ID: Kl5q0vhBMNM (lo que viene después de "v=")

URL corta: https://youtu.be/Kl5q0vhBMNM
YouTube ID: Kl5q0vhBMNM (lo último de la URL)
```

### Thumbnail automático de YouTube

```javascript
// Formato de thumbnail
thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`

// Ejemplo
youtubeId: "Kl5q0vhBMNM"
thumbnailUrl: "https://img.youtube.com/vi/Kl5q0vhBMNM/maxresdefault.jpg"
```

### Canales recomendados para videos de panadería

- **Recetas de cocina** (general)
- **Gordon Ramsay** (profesional)
- **Tasty** (visual y atractivo)
- **Babish Culinary Universe** (alta calidad)

---

## 🛠️ Troubleshooting

### Error: "Firebase not defined"

**Solución:**
- Verificar que los scripts de Firebase estén antes de firebase-init.js
- Verificar que la URL sea correcta en index.html: `/public/js/firebase-init.js`

### Error: "Permission denied" al leer productos

**Solución:**
```powershell
# Verificar y redesplegar reglas
firebase deploy --only firestore:rules
```

O aplicar manualmente desde Firebase Console:
- Firestore Database → Rules → Cambiar a lectura pública

### No se ven productos en index.html

**Solución:**
1. Abrir consola del navegador (F12)
2. Verificar errores
3. Verificar que existan productos en Firestore
4. Ejecutar: `poblar-datos-muestra.html` para crear datos

### No puedo acceder al admin panel

**Solución:**
1. Verificar que el usuario tenga `roles.admin: true` en Firestore
2. Cerrar sesión y volver a entrar
3. Verificar en consola del navegador los datos del usuario

---

## 📝 Checklist Final

Antes de entregar al cliente:

- [ ] ✅ Firebase configurado (Auth + Firestore)
- [ ] ✅ Reglas de Firestore aplicadas
- [ ] ✅ Datos de muestra creados
- [ ] ✅ Administrador creado
- [ ] ✅ Productos visibles en index.html
- [ ] ✅ Cursos visibles en cursos.html
- [ ] ✅ Guest checkout funciona (sin login)
- [ ] ✅ Compra de cursos requiere login
- [ ] ✅ Panel admin accesible
- [ ] ✅ Crear/editar productos funciona
- [ ] ✅ Imágenes cargan correctamente
- [ ] ✅ Videos de YouTube reproducen
- [ ] ✅ Sitio desplegado en Firebase Hosting (opcional)

---

## 🎉 ¡Listo!

El proyecto está completamente funcional. Ahora puedes:

1. **Seguir agregando productos** desde el panel admin
2. **Agregar cursos** con videos de YouTube
3. **Probar compras** como guest y usuario registrado
4. **Personalizar diseño** según necesidades del cliente
5. **Desplegar a producción** cuando esté listo

---

## 📞 Soporte

Si tienes problemas:

1. **Revisar consola del navegador** (F12 → Console)
2. **Revisar Firebase Console** → Errores en Firestore
3. **Verificar reglas de seguridad**
4. **Verificar credenciales en firebase-init.js**

**Documentación oficial:**
- Firebase: https://firebase.google.com/docs
- Firestore: https://firebase.google.com/docs/firestore
- Authentication: https://firebase.google.com/docs/auth

---

**Última actualización:** 15 de Enero, 2026  
**Versión:** 1.0
