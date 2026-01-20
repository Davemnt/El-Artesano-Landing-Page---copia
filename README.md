# 🥖 El Artesano - Landing Page & E-commerce

Sistema completo de landing page y e-commerce para panadería artesanal con gestión de cursos digitales, sistema de autenticación de dos niveles, pagos con MercadoPago y arquitectura serverless con Firebase.

---

## 📋 Características Principales

### 🎨 Landing Page
- Hero section con imagen de fondo y modo fullscreen
- Catálogo de productos con carga dinámica desde Firestore
- Sistema de cursos online con acceso protegido
- Carrito de compras integrado
- Diseño responsive y moderno

### � Sistema de Compras Dual

#### Productos Físicos (Panadería) - Guest Checkout
- **Compra SIN registro requerido**
- Checkout rápido como invitado
- Solo se solicitan datos de contacto y entrega
- Reducción de fricción en la conversión
- Los datos se guardan en el pedido
- Opción de iniciar sesión para checkout más rápido

#### Cursos Digitales - Registro Obligatorio
- **Requiere cuenta y login**
- Registro automático al comprar
- Acceso recurrente al área de miembros
- Gestión de cursos adquiridos
- Protección de contenido digital

### �🔐 Sistema de Autenticación
- **Login de Usuario**: Registro, login con email/contraseña y Google
- **Login de Administrador**: Acceso restringido con verificación de roles
- Navbar dinámico según estado de autenticación
- Protección de rutas por tipo de usuario
- Recuperación de contraseña

### 👨‍💼 Panel de Administración
- Gestión completa de productos y cursos
- **Gestión de Usuarios**: Registro manual, asignación de cursos, control de accesos
- **Asignación Manual de Cursos**: Dar acceso a cursos sin necesidad de compra
- Subida de cursos con cifrado de video IDs
- Historial de ventas
- Dashboard con métricas
- Control de roles (admin/customer)

### 💳 Sistema de Pagos
- Integración con MercadoPago
- Múltiples métodos de pago
- Webhooks automáticos
- Páginas de confirmación

### 📹 Reproductor de Cursos
- Protección con cifrado AES-256-GCM
- Solo accesible con compra verificada
- Integración con YouTube
- Prevención de compartir enlaces

---

## 🗂️ Estructura del Proyecto

### Páginas Principales

| Archivo | Descripción | Acceso |
|---------|-------------|--------|
| `index.html` | Landing principal con productos y cursos | Público |
| `checkout-producto.html` | **Checkout invitado para productos físicos** | **Público (sin login)** |
| `login.html` | Login/registro de usuarios | Público |
| `admin-login.html` | Login exclusivo para administradores | Público |
| `cursos.html` | Catálogo de cursos | Requiere login |
| `admin-panel.html` | Panel de administración | Requiere admin |
| `admin-crear-curso.html` | Creación/edición de cursos | Requiere admin |
| `ejemplo-curso-player.html` | Reproductor de videos | Requiere compra |
| `ejemplo-comprar-curso.html` | Checkout de curso | **Requiere login obligatorio** |
| `pago-exitoso.html` | Confirmación de pago | Público |
| `pago-fallido.html` | Error en pago | Público |
| `pago-pendiente.html` | Pago pendiente | Público |

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

**Frontend**
- HTML5 semántico
- CSS3 con variables custom y flexbox/grid
- JavaScript ES6+ (Vanilla, sin frameworks)
- Bootstrap 5.2.0 (solo para admin panel)
- AOS Library para animaciones

**Backend Serverless**
- Firebase Cloud Functions (Node.js 18)
- Firebase Authentication (Email/Password + Google OAuth)
- Firestore Database (NoSQL)
- Firebase Hosting

**Pagos**
- MercadoPago SDK v2.0.0
- Webhooks para confirmación automática
- Soporte para tarjeta, transferencia, efectivo

**Seguridad**
- AES-256-GCM para cifrado de YouTube Video IDs
- Firestore Security Rules (deny-by-default)
- Custom Claims para roles de admin
- CORS configurado en Cloud Functions

### Arquitectura de Datos (Firestore)

**9 Colecciones Principales**:

```
users/                   # Usuarios registrados
├── email, displayName, createdAt
└── role (via custom claims)

### Scripts y Dependencias

**Frontend** (CDN)
- Bootstrap 5.2.0
- RemixIcon 2.5.0
- AOS (Animate On Scroll)
- Firebase SDK 10.7.1

**Backend** (`functions/package.json`)
- firebase-functions: ^5.0.0
- firebase-admin: ^12.0.0
- mercadopago: ^2.0.0

---

## 🔧 Configuración

### 1. Firebase

Editar [`public/js/firebase-init.js`](public/js/firebase-init.js):

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 2. Firebase Authentication

En Firebase Console → Authentication:
- ✅ Habilitar Email/Password
- ✅ Habilitar Google (opcional)

### 3. Firestore Database

1. Crear base de datos en modo producción
2. Aplicar reglas de seguridad desde [`firestore.rules`](firestore.rules)

### 4. Cloud Functions

```bash
cd functions
npm install

# Configurar variables de entorno
firebase functions:config:set \
  crypto.key="TU_CLAVE_32_CARACTERES_AES" \
  mercadopago.access_token="TU_TOKEN_MERCADOPAGO"
```

### 5. Crear Primer Administrador

1. Registrar usuario en `login.html`
2. En Firestore, editar documento del usuario:
```javascript
// Colección: users → Documento del usuario
{
  email: "admin@ejemplo.com",
  displayName: "Admin",
  roles: {
    admin: true  // ← IMPORTANTE
  },
  createdAt: Timestamp
}
```

---

## 🚀 Despliegue

### Firebase Hosting (Recomendado)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Desplegar todo
firebase deploy

# O desplegar por partes
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Hosting Alternativo

1. Desplegar Cloud Functions en Firebase
2. Subir archivos estáticos a cualquier hosting
3. Configurar correctamente las URLs en el código
   - Configura SSL/HTTPS

---

## 📁 Estructura del Proyecto

```
el-artesano/
├── index.html                      # Landing page principal
├── cursos.html                     # Catálogo de cursos
├── admin-login.html                # Login de administradores
├── admin-panel.html                # Panel de administración
├── ejemplo-curso-player.html      # Reproductor seguro de videos
├── ejemplo-comprar-curso.html     # Checkout individual de curso
├── admin-crear-curso.html         # Formulario de creación de cursos
├── pago-exitoso.html              # Página de confirmación
├── pago-fallido.html              # Página de error
├── pago-pendiente.html            # Página de pago pendiente
│
├── public/
│   ├── css/                       # (vacía, no necesaria)
│   └── js/
│       ├── firebase-init.js       # 🔑 Configuración Firebase
│       ├── auth.js                # Registro, login, recuperación
│       ├── payments.js            # Integración MercadoPago
│       └── secure-video-player.js # Reproductor con seguridad
│
├── functions/                      # Cloud Functions
│   ├── index.js                   # 5 funciones serverless
│   ├── package.json               # Dependencias
│   └── src/
│       └── utils/
│           └── crypto-utils.js    # Cifrado AES-256-GCM
│
├── img/                           # Imágenes del sitio
│
├── firestore.rules                # Reglas de seguridad Firestore
├── firestore.indexes.json         # Índices de Firestore
├── firebase.json                  # Configuración de Firebase
├── package.json                   # Dependencias del proyecto
│
└── docs/
    ├── ARQUITECTURA_FIREBASE.md          # 📐 Arquitectura completa
    ├── FIREBASE_SETUP.md                 # 🛠️ Setup técnico
    ├── GUIA_CONFIGURACION_FIREBASE.md    # 📖 Guía paso a paso
    ├── RESUMEN_IMPLEMENTACION.md         # 📝 Resumen funcionalidades
    └── CAMBIOS_FINALES.md                # ✅ Cambios recientes
---

## 🔧 Configuración de Firebase

### Paso 1: Editar Credenciales
---

## 🔐 Sistema de Autenticación Dual

### 🍞 Productos Físicos (Panadería)

**NO requiere registro** - Guest Checkout activado

**Flujo de compra:**
1. Cliente agrega productos al carrito
2. Click en "Finalizar Compra"
3. Redirige a `checkout-producto.html`
4. Completa formulario simple:
   - Nombre y apellido
   - Email (para confirmación)
   - Teléfono
   - Dirección de entrega
5. Procesa pago
6. Recibe confirmación por email

**Beneficios:**
- ✅ Conversión más alta (menos fricción)
- ✅ Checkout en 2 minutos
- ✅ Datos guardados en el pedido
- ✅ Opción de crear cuenta (opcional)

### 📚 Cursos Digitales

**Requiere registro obligatorio**

**Flujo de compra:**
1. Usuario intenta comprar curso
2. **Si NO está logueado:** Redirige a `login.html`
3. Debe crear cuenta o iniciar sesión
4. Retorna a página de compra
5. Procesa pago con MercadoPago
6. Acceso automático al área de miembros

**Razones:**
- ✅ Acceso recurrente al contenido
- ✅ Gestión de "Mis Cursos"
- ✅ Protección de contenido digital
- ✅ Historial de compras

### Tipos de Usuario

**Invitado (Guest)**
- Puede comprar productos físicos
- Sin necesidad de cuenta
- Datos guardados solo en el pedido

**Usuario Registrado**
- Puede comprar productos Y cursos
- Área de miembros con sus cursos
- Checkout más rápido (datos pre-llenados)
- Historial de compras

**Administrador**
- Todo lo anterior + acceso al panel admin
- Gestión completa de productos y cursos
- Debe configurarse manualmente en Firestore

### Protección de Rutas

**Público (sin login):**
- `index.html` - Landing page
- `checkout-producto.html` - **Guest checkout para productos físicos**
- `login.html` - Login de usuarios
- `admin-login.html` - Login de administradores

**Requiere Login:**
- `cursos.html` - Catálogo de cursos
- `ejemplo-comprar-curso.html` - **Checkout de cursos (obligatorio)**
- `ejemplo-curso-player.html` - Reproductor de cursos

**Requiere Admin:**
- `admin-panel.html` - Panel de administración
- `admin-crear-curso.html` - Crear/editar cursos

---

## 💳 Sistema de Pagos (MercadoPago)

### Flujo de Compra - Productos Físicos (Guest)

1. Cliente agrega productos al carrito en `index.html`
2. Click en "Finalizar Compra"
3. Redirige a `checkout-producto.html` (sin requerir login)
4. Completa datos de contacto y entrega
5. Sistema crea orden en Firestore con:
   - `isGuest: true`
   - `userId: null` (o userId si está logueado)
   - Datos del cliente en el pedido
6. Genera preferencia de MercadoPago
7. Redirige a pago
8. Webhook confirma y actualiza estado

### Flujo de Compra - Cursos Digitales (Requiere Login)

1. Usuario ve curso en `cursos.html`
2. Click en "Comprar" → **Verifica autenticación**
3. Si NO está logueado: Redirige a `login.html?redirect=...`
4. Después de login, retorna a `ejemplo-comprar-curso.html`
5. Click en "Comprar Ahora"
6. Sistema crea orden con `userId` del usuario
7. Genera preferencia de MercadoPago
8. Redirige a pago
9. Webhook confirma y otorga acceso al curso
10. Usuario puede ver curso en "Mis Cursos"

### Métodos de Pago Soportados

✅ Tarjetas de crédito/débito  
✅ Transferencia bancaria  
✅ Efectivo (Pago Fácil, Rapipago)  

---

## 🎓 Uso del Panel de Administración

### Crear Productos

1. Login en `admin-login.html`
2. Panel → Sección "Productos"
3. Completar formulario (nombre, precio, SKU, imagen)
4. Marcar "Publicar" para mostrar en el sitio
5. Guardar → Aparece automáticamente en index.html

### Crear Cursos

1. Panel → Sección "Cursos"
2. Completar datos del curso
3. **Importante**: YouTube Video ID (11 caracteres)
4. El sistema cifra automáticamente el video ID
5. Marcar "Publicar"
6. Guardar → Aparece en cursos.html

### Gestionar Ventas

- Ver historial de compras aprobadas
- Filtrar por producto/curso
- Datos de compradores

---

## 🛡️ Seguridad

### Videos Protegidos

**Cifrado AES-256-GCM:**
- Video IDs nunca expuestos en cliente
- Almacenados cifrados en Firestore
- Solo descifrados server-side tras validar compra

**Reproductor Seguro:**
- Bloqueo de DevTools (F12, Ctrl+Shift+I)
- Deshabilitación de clic derecho
- Overlay anti-captura
- Prevención de compartir enlaces

### Firestore Rules

```javascript
// videos_private: Completamente inaccesible desde cliente
match /videos_private/{videoId} {
  allow read, write: if false;
}

// Cursos: Solo lectura para autenticados
match /courses/{courseId} {
  allow read: if request.auth != null;
  allow write: if isAdmin();
}
```

---

## 📚 Documentación

### 🚀 Inicio Rápido
- **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** - Setup en 5 minutos y primeros pasos

### � Versión Gratuita (NUEVO)
- **[PLAN_GRATUITO.md](PLAN_GRATUITO.md)** - Cómo usar solo Firebase Spark (100% gratis)


**¿Quieres usar solo la versión gratuita sin pagar nada?**  
✅ **SÍ ES POSIBLE** - Con estas modificaciones:
- Imágenes en Imgur/ImgBB (ilimitado gratis)
- Videos en YouTube (ilimitado gratis)
- Pagos confirmación manual (sin Cloud Functions)
- Firestore Spark Plan (50K lecturas/día gratis)

Ver [PLAN_GRATUITO.md](PLAN_GRATUITO.md) para detalles completos.

**Backend:**
- Firebase Cloud (serverless)
- No necesitas PC encendida 24/7
- Setup en minutos



### 🎯 Lo Más Importante

**¿Puedes registrar usuarios y asignarles cursos manualmente?**  
✅ **SÍ** - Panel completo para:
- Crear usuarios desde el admin
- Asignar cursos con un click
- Gestionar accesos
- Ver cursos de cada usuario

**¿Se puede usar 100% gratis sin pagar hosting/storage?**  
✅ **SÍ** - Con Firebase Spark + Imgur + YouTube
- $0/mes para inicio
- Suficiente para 20-50 ventas/mes
- Ver [PLAN_GRATUITO.md](PLAN_GRATUITO.md)

---

## 🚀 Despliegue Rápido

```bash
# 1. Configurar Firebase
firebase login

# 2. Instalar dependencias
cd functions && npm install && cd ..

# 3. Configurar variables
firebase functions:config:set \
  crypto.key="CLAVE_32_BYTES" \
  mercadopago.access_token="TOKEN_MP"

# 4. Desplegar
firebase deploy
```

---

## 📞 Soporte y Problemas

### Problemas Comunes

**"Firebase is not defined"**
- Verificar que los scripts estén en orden correcto
- Revisar configuración en firebase-init.js

---

## � Soporte y Problemas

### Problemas Comunes

**"Firebase is not defined"**
- Verificar que los scripts estén en orden correcto
- Revisar configuración en firebase-init.js

**"No tienes permisos de administrador"**
- Verificar que el usuario tenga `roles.admin = true` en Firestore
- Cerrar sesión y volver a iniciar sesión

**Videos no se reproducen**
- Verificar que el YouTube Video ID sea correcto
- Confirmar que la compra está registrada en Firestore
- Revisar logs de Cloud Functions

**Compra de invitado no funciona**
- Los productos físicos NO requieren login
- Los cursos SÍ requieren login obligatorio
- Verificar que la Cloud Function `createMercadoPagoPreference` esté desplegada

---

## ✨ Características Implementadas

### Sistema de Compras Dual

✅ **Guest Checkout para Productos Físicos**
- Compra sin necesidad de crear cuenta
- Formulario simple de contacto y entrega
- Mejor conversión al reducir fricción
- Datos guardados en el pedido

✅ **Área de Miembros para Cursos**
- Registro obligatorio para cursos
- Acceso recurrente al contenido
- Gestión de "Mis Cursos"
- Protección de contenido digital

✅ **Sistema de Autenticación Flexible**
- Invitados pueden comprar productos
- Usuarios registrados tienen checkout rápido
- Administradores con acceso completo

---

## �📄 Licencia

Este proyecto es privado y confidencial.

---

**Desarrollado para El Artesano** | Enero 2026

### Admin
```
GET    /api/admin/dashboard      # Estadísticas
GET    /api/admin/ventas         # Reporte ventas
```

## 🚀 Deployment

### Opción 1: Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```

### Opción 2: Railway
1. Conecta tu repo de GitHub
2. Agrega variables de entorno
3. Deploy automático

### Opción 3: Render
1. Crea Web Service
2. Conecta repo
3. Build: `npm install`
4. Start: `npm start`

## 🔧 Configuración Adicional

### Webhook de Mercado Pago
1. Ve a tu aplicación en Mercado Pago
2. Configura Webhook URL: `https://tu-dominio.com/api/pagos/webhook`
3. Selecciona eventos: `payment`

### Dominio de Email (Resend)
1. Agrega tu dominio en Resend
2. Configura registros DNS (MX, TXT)
3. Verifica dominio

### WhatsApp Production (Twilio)
1. Solicita aprobación del número
2. Crea templates de mensajes
3. Actualiza variables de entorno

## 🧪 Testing

```bash
# Test completo de compra
1. Registrarse como usuario
2. Agregar productos al carrito
3. Checkout con tarjeta de prueba
4. Verificar email de confirmación
5. Verificar WhatsApp

# Test panel admin
1. Login como admin
2. Crear/editar producto
3. Ver pedidos
4. Cambiar estado de pedido
```

## 📊 Base de Datos Schema

Ver archivo completo en `src/database/schema.sql`

Tablas principales:
- `usuarios` - Usuarios y admins
- `productos` - Catálogo de productos
- `cursos` - Cursos digitales
- `ordenes` - Pedidos
- `orden_items` - Items de cada pedido
- `pagos` - Transacciones
- `usuarios_cursos` - Cursos comprados

## 🆘 Troubleshooting

### Error: "Supabase connection failed"
- Verifica `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- Revisa que el proyecto Supabase esté activo

### Error: "Mercado Pago preferences failed"
- Confirma que `MP_ACCESS_TOKEN` sea válido
- En sandbox, usa credenciales de prueba

### Emails no se envían
- Verifica dominio en Resend
- Revisa que `RESEND_API_KEY` sea correcta
- Chequea límite de 100 emails/día (plan gratuito)

### WhatsApp no funciona
- Confirma que Twilio Sandbox esté activo
- Verifica que el número esté registrado en sandbox
- Revisa formato: `whatsapp:+549...`

## 📝 Licencia

MIT License - El Artesano 2025

## 👨‍💻 Soporte

Para soporte técnico:
- Email: soporte@elartesano.com
- WhatsApp: +54 9 11 1234-5678
- GitHub Issues: [crear issue](https://github.com/tu-usuario/el-artesano/issues)

---

**Desarrollado con ❤️ en Buenos Aires, Argentina**
