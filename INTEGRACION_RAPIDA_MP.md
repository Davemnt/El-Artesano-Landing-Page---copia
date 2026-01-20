# 🚀 Integración MercadoPago - Guía Rápida

## 📌 Resumen del Error en Consola

Los errores 404 que ves son de miniaturas de YouTube:
- `https://img.youtube.com/vi/K15q8vhRMM9/maxresdefault.jpg`
- Estos IDs de YouTube son inválidos o las miniaturas no existen
- **Solución**: Usa URLs de YouTube válidas al crear cursos

---

## 💳 Integración MercadoPago - Pasos Simples

### 1️⃣ Obtener Credenciales (5 minutos)

1. Ve a: https://www.mercadopago.com.ar/developers
2. Crea una aplicación llamada "El Artesano"
3. Copia tus credenciales:

```
🔑 Public Key (para frontend): TEST-xxxxxxxx
🔐 Access Token (para backend): TEST-xxxxxxxxxxxx
```

---

### 2️⃣ Configurar en tu Proyecto (10 minutos)

**A. Instalar dependencia:**
```bash
cd functions
npm install mercadopago
```

**B. Configurar Access Token:**
```bash
firebase functions:config:set mercadopago.access_token="TU-ACCESS-TOKEN-AQUI"
```

**C. Para desarrollo local, crear archivo `functions/.runtimeconfig.json`:**
```json
{
  "mercadopago": {
    "access_token": "TEST-tu-access-token-de-prueba"
  }
}
```

---

### 3️⃣ Actualizar tu Código (5 minutos)

**En `pago-curso.html`, línea ~178:**

Cambiar:
```javascript
const MP_PUBLIC_KEY = 'TEST-tu-public-key-aqui';
```

Por tu Public Key real:
```javascript
const MP_PUBLIC_KEY = 'TEST-1234567890-abcdef';
```

**Activar integración real (línea ~242):**

Descomentar este bloque:
```javascript
const createPreference = firebase.functions().httpsCallable('createMercadoPagoPreference');
const result = await createPreference({
    orderId: orderRef.id,
    courseId: courseData.id,
    courseName: courseData.name,
    price: courseData.price,
    userEmail: currentUser.email
});

window.location.href = result.data.init_point;
```

Y comentar el código que dice "DEMO".

---

### 4️⃣ Desplegar Functions (2 minutos)

```bash
firebase deploy --only functions
```

---

### 5️⃣ Probar con Tarjetas de Prueba

**Tarjeta APROBADA:**
```
Número: 5031 7557 3453 0604
CVV: 123
Vencimiento: 11/25
Titular: APRO
```

**Tarjeta RECHAZADA:**
```
Número: 5031 7557 3453 0604
Titular: OTHE
```

Más tarjetas: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

---

## 🎯 Flujo Completo

```
Usuario → Clic "Comprar" 
  ↓
Crear orden en Firestore
  ↓
Cloud Function crea preferencia MP
  ↓
Redirige a MercadoPago → Usuario paga
  ↓
Webhook recibe notificación
  ↓
Si aprobado → Dar acceso al curso
  ↓
Usuario ve curso en "Mis Cursos"
```

---

## ✅ Ya tienes implementado:

✅ Cloud Functions preparadas (`functions/index.js`)
✅ Webhook configurado
✅ Frontend listo (`pago-curso.html`)
✅ Base de datos configurada

**Solo necesitas:**
1. Credenciales de MercadoPago
2. Configurar Access Token
3. Actualizar Public Key
4. Desplegar functions
5. ¡Probar!

---

## 🐛 Si algo falla:

**Ver logs:**
```bash
firebase functions:log
```

**Verificar config:**
```bash
firebase functions:config:get
```

**Probar localmente:**
```bash
cd functions
npm run serve
```

---

## 📞 Soporte

- MercadoPago: https://www.mercadopago.com.ar/developers/panel/support
- Firebase: https://firebase.google.com/support
- Documentación completa: Ver archivo `GUIA_MERCADOPAGO.md`

---

## 💡 Modo DEMO Actual

Actualmente el sistema está en modo DEMO:
- ✅ Crea órdenes en Firestore
- ✅ Simula pagos aprobados
- ✅ Otorga acceso a cursos
- ❌ NO cobra dinero real
- ❌ NO redirige a MercadoPago

Perfecto para probar el sitio sin configurar pagos reales.
