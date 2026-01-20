# ✅ Archivos Esenciales del Proyecto

## 📄 Documentación (3 archivos)
- **README.md** - Documentación completa del proyecto
- **INICIO_RAPIDO.md** - Guía rápida para empezar en 5 minutos
- **PLAN_GRATUITO.md** - Guía para usar solo Firebase Spark (100% gratis)

## 🌐 Páginas HTML (11 archivos)

### Públicas (Sin Login)
- **index.html** - Landing page principal con productos y cursos
- **login.html** - Login/registro de usuarios
- **admin-login.html** - Login exclusivo para administradores
- **checkout-producto.html** - Checkout para productos (sin login requerido)

### Requieren Login
- **cursos.html** - Catálogo de cursos (requiere estar logueado)
- **ejemplo-curso-player.html** - Reproductor de videos protegido

### Administrador
- **admin-panel.html** - Panel de administración completo

### Pagos
- **pago-exitoso.html** - Confirmación de pago exitoso
- **pago-fallido.html** - Error en pago
- **pago-pendiente.html** - Pago pendiente de confirmación
- **pago-transferencia.html** - Instrucciones para pago manual

## 📁 Directorios

### public/js/ (4 archivos)
- **firebase-init.js** - Configuración de Firebase
- **auth.js** - Sistema de autenticación
- **payments.js** - Integración con MercadoPago
- **secure-video-player.js** - Reproductor protegido de videos

### functions/ (Backend Firebase)
- **index.js** - Cloud Functions
- **package.json** - Dependencias
- **src/utils/crypto-utils.js** - Cifrado AES-256-GCM

### Configuración
- **firestore.rules** - Reglas de seguridad de Firestore
- **package.json** - Dependencias del proyecto

### Recursos
- **img/** - Imágenes del sitio
- **screenshots/** - Capturas de pantalla

---

## 🎯 Próximos Pasos

1. **Configurar Firebase**
   - Ver [INICIO_RAPIDO.md](INICIO_RAPIDO.md)

2. **Para usar versión gratuita**
   - Ver [PLAN_GRATUITO.md](PLAN_GRATUITO.md)
   - Usar Imgur para imágenes
   - Usar YouTube para videos
   - Confirmación manual de pagos

3. **Crear primer admin**
   - Registrarse en login.html
   - Editar Firestore: `users/{uid}` → agregar `roles: { admin: true }`

4. **Agregar productos**
   - Login en admin-panel.html
   - Crear productos con URLs de imágenes (Imgur/ImgBB)

5. **Gestionar usuarios manualmente**
   - Panel admin → Sección "Gestión de Usuarios"
   - Crear usuarios, asignar cursos, confirmar pagos

---

✅ **Proyecto limpio y listo para usar**
