# 💳 Guía de Integración MercadoPago - El Artesano

## 📋 Resumen

Esta guía te explica cómo integrar pagos con MercadoPago en tu aplicación. El flujo completo es:

1. Usuario hace clic en "Comprar Curso"
2. Se crea una orden en Firestore
3. Cloud Function crea una preferencia de pago en MercadoPago
4. Usuario es redirigido a MercadoPago para pagar
5. Webhook recibe notificación de pago
6. Se otorga acceso al curso automáticamente

---

## 🔑 Paso 1: Obtener Credenciales de MercadoPago

### 1.1 Crear cuenta de desarrollador

1. Ve a: https://www.mercadopago.com.ar/developers
2. Inicia sesión con tu cuenta de MercadoPago
3. Ve a "Tus aplicaciones" → "Crear aplicación"
4. Dale un nombre: "El Artesano Landing Page"

### 1.2 Obtener credenciales

Una vez creada la aplicación, verás:

**Credenciales de Prueba** (para desarrollo):
```
Public Key: TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Access Token: TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxxx
```

**Credenciales de Producción** (para sitio real):
```
Public Key: APP-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Access Token: APP-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxxx
```

⚠️ **NUNCA** expongas el Access Token en el frontend. Solo úsalo en Cloud Functions.

---

## ⚙️ Paso 2: Configurar Cloud Functions

### 2.1 Instalar dependencias

Abre terminal en la carpeta `functions/` y ejecuta:

```bash
cd functions
npm install mercadopago
```

### 2.2 Configurar Access Token

En tu terminal:

```bash
firebase functions:config:set mercadopago.access_token="TU-ACCESS-TOKEN-AQUI"
```

Para desarrollo local, crea archivo `.runtimeconfig.json` en `functions/`:

```json
{
  "mercadopago": {
    "access_token": "TEST-tu-access-token-de-prueba"
  }
}
```

### 2.3 Crear Cloud Function

Ya tienes un archivo `functions/index.js`. Agrega estas funciones:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const mercadopago = require('mercadopago');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

// Configurar MercadoPago
mercadopago.configure({
  access_token: functions.config().mercadopago.access_token
});

/**
 * Crear preferencia de pago en MercadoPago
 */
exports.createMercadoPagoPreference = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { orderId, courseId, courseName, price, userEmail } = data;

  // Validar datos
  if (!orderId || !courseId || !price) {
    throw new functions.https.HttpsError('invalid-argument', 'Faltan datos requeridos');
  }

  try {
    // Crear preferencia de pago
    const preference = {
      items: [
        {
          title: courseName,
          unit_price: parseFloat(price),
          quantity: 1,
          currency_id: 'ARS'
        }
      ],
      payer: {
        email: userEmail
      },
      external_reference: orderId, // Importante: guarda el ID de la orden
      notification_url: 'https://us-central1-el-artesano-44216.cloudfunctions.net/mercadoPagoWebhook',
      back_urls: {
        success: 'https://tu-dominio.com/pago-exitoso.html',
        failure: 'https://tu-dominio.com/pago-fallido.html',
        pending: 'https://tu-dominio.com/pago-pendiente.html'
      },
      auto_return: 'approved',
      binary_mode: true // Solo aprobado o rechazado, no pendiente
    };

    const response = await mercadopago.preferences.create(preference);

    // Actualizar orden con preference_id
    await admin.firestore().collection('orders').doc(orderId).update({
      preferenceId: response.body.id,
      status: 'awaiting_payment'
    });

    // Retornar URL de pago
    return {
      init_point: response.body.init_point, // Para web
      sandbox_init_point: response.body.sandbox_init_point, // Para pruebas
      preference_id: response.body.id
    };

  } catch (error) {
    console.error('Error creando preferencia:', error);
    throw new functions.https.HttpsError('internal', 'Error al crear preferencia de pago');
  }
});

/**
 * Webhook para recibir notificaciones de MercadoPago
 */
exports.mercadoPagoWebhook = functions.https.onRequest(async (req, res) => {
  // Verificar que sea POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // MercadoPago envía el tipo de notificación y el ID
  const { type, data } = req.body;

  console.log('Webhook recibido:', { type, data });

  // Solo procesar notificaciones de pago
  if (type !== 'payment') {
    return res.status(200).send('OK');
  }

  try {
    // Obtener información del pago
    const payment = await mercadopago.payment.get(data.id);
    const paymentData = payment.body;

    console.log('Pago procesado:', paymentData);

    const orderId = paymentData.external_reference;
    const status = paymentData.status; // approved, rejected, pending, etc.

    // Actualizar orden en Firestore
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      console.error('Orden no encontrada:', orderId);
      return res.status(404).send('Order not found');
    }

    const orderData = orderDoc.data();

    // Actualizar estado de la orden
    await orderRef.update({
      paymentId: paymentData.id,
      paymentStatus: status,
      paymentMethod: paymentData.payment_method_id,
      transactionAmount: paymentData.transaction_amount,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    // Si el pago fue aprobado, dar acceso al curso
    if (status === 'approved') {
      await orderRef.update({
        status: 'approved',
        approvedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Crear acceso al curso
      await admin.firestore().collection('user_courses').add({
        userId: orderData.userId,
        courseId: orderData.courseId,
        courseName: orderData.courseName,
        purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
        accessUntil: null, // Acceso ilimitado
        active: true,
        orderId: orderId
      });

      console.log('✅ Acceso al curso otorgado para usuario:', orderData.userId);
    } else if (status === 'rejected') {
      await orderRef.update({
        status: 'failed'
      });
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error('Error procesando webhook:', error);
    return res.status(500).send('Internal Server Error');
  }
});
```

---

## 🚀 Paso 3: Desplegar Cloud Functions

```bash
firebase deploy --only functions
```

---

## 🎨 Paso 4: Actualizar Frontend

### 4.1 Agregar Public Key

Abre `pago-curso.html` y reemplaza:

```javascript
const MP_PUBLIC_KEY = 'TEST-tu-public-key-aqui';
```

Por tu Public Key real.

### 4.2 Descomentar código de producción

En `pago-curso.html`, busca este bloque y descoméntalo:

```javascript
const createPreference = firebase.functions().httpsCallable('createMercadoPagoPreference');
const result = await createPreference({
    orderId: orderRef.id,
    courseId: courseData.id,
    courseName: courseData.name,
    price: courseData.price,
    userEmail: currentUser.email
});

// Redirigir a MercadoPago
window.location.href = result.data.init_point;
```

Y comenta o elimina el código de DEMO.

---

## 🧪 Paso 5: Probar con credenciales de prueba

MercadoPago ofrece tarjetas de prueba:

**Tarjeta aprobada:**
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 11/25
Titular: APRO
```

**Tarjeta rechazada:**
```
Número: 5031 7557 3453 0604
Titular: OTHE
```

Más tarjetas de prueba: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

---

## 🔒 Paso 6: Configurar URLs de retorno

En `functions/index.js`, actualiza las URLs de retorno:

```javascript
back_urls: {
  success: 'https://tu-dominio.com/pago-exitoso.html',
  failure: 'https://tu-dominio.com/pago-fallido.html',
  pending: 'https://tu-dominio.com/pago-pendiente.html'
}
```

---

## 📊 Paso 7: Monitorear pagos

### En Firebase Console:
- Colección `orders`: Ver estado de órdenes
- Colección `user_courses`: Ver accesos otorgados
- Cloud Functions logs: Ver webhooks recibidos

### En MercadoPago:
- Dashboard → Actividad → Ver todos los pagos
- Webhooks → Ver notificaciones enviadas

---

## 🐛 Troubleshooting

### El webhook no se ejecuta:
1. Verifica que la URL del webhook sea pública (no localhost)
2. Revisa logs: `firebase functions:log`
3. Verifica en MercadoPago dashboard si se enviaron notificaciones

### El pago no se aprueba automáticamente:
1. Verifica que el `external_reference` coincida con el `orderId`
2. Revisa los logs de la Cloud Function
3. Verifica reglas de Firestore

### Errores de autenticación:
1. Verifica que el Access Token sea correcto
2. Ejecuta: `firebase functions:config:get`

---

## 💰 Costos

**Firebase:**
- Cloud Functions: Plan Blaze (gratuito hasta 2M invocaciones/mes)
- Firestore: Gratuito hasta 50k lecturas/día

**MercadoPago:**
- Tarjetas de crédito: ~4.99% + $2.99 por transacción
- Tarjetas de débito: ~3.49% + $2.99 por transacción

---

## ✅ Checklist de Producción

- [ ] Obtener credenciales de PRODUCCIÓN de MercadoPago
- [ ] Configurar Access Token en Firebase Functions
- [ ] Actualizar Public Key en frontend
- [ ] Configurar URLs de retorno correctas
- [ ] Probar flujo completo con tarjetas de prueba
- [ ] Verificar que los webhooks se reciban
- [ ] Configurar dominio personalizado
- [ ] Desplegar a producción
- [ ] Realizar compra de prueba real
- [ ] Monitorear logs durante primeros días

---

## 📚 Documentación oficial

- MercadoPago: https://www.mercadopago.com.ar/developers/es/docs
- Firebase Functions: https://firebase.google.com/docs/functions
- Checkout Pro: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing
