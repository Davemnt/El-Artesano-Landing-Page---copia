# 🧪 Guía de Pruebas - Compra de Productos

## ✅ Problemas Corregidos

### 1. Error al editar productos/cursos
**Problema:** `createdAt: undefined` al actualizar productos  
**Solución:** Eliminado el campo `createdAt` del objeto al actualizar (solo se envía al crear)

### 2. Error `firebase.functions is not a function`
**Problema:** Functions no cargaba correctamente  
**Solución:** Inicialización con try-catch en `firebase-init.js`

---

## 🛒 Cómo Probar la Compra de Productos

### Opción A: Sin Cloud Functions (Simulación)

**Para pruebas rápidas SIN configurar MercadoPago:**

1. **Crear productos en el admin:**
   - Ve a: `admin-panel.html`
   - Inicia sesión como admin
   - Crea 2-3 productos de prueba

2. **Probar el carrito:**
   - Ve a `index.html`
   - Agrega productos al carrito
   - Haz clic en "Ver Carrito"

3. **Simular checkout:**
   - Ir a "Finalizar Compra"
   - Completa el formulario
   - **NOTA:** Fallará al intentar crear preferencia de MercadoPago

4. **Ver orden creada:**
   - Ve a Firebase Console → Firestore → collection `orders`
   - Verás la orden con status "pendiente"

---

### Opción B: Con Emuladores Locales (Recomendado para desarrollo)

**Requisitos:**
- Java instalado (ya lo tienes)
- Emuladores de Firebase configurados (ya están)

**Pasos:**

1. **Abrir terminal nueva y ejecutar:**
   ```powershell
   # Actualizar PATH para esta sesión
   $env:Path += ';C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot\bin'
   
   # Verificar Java
   java -version
   
   # Iniciar emuladores
   firebase emulators:start
   ```

2. **Acceder a la UI de emuladores:**
   - URL: http://localhost:4000
   - Verás Firestore, Functions, etc.

3. **Probar flujo completo:**
   - Ve a: http://127.0.0.1:5000/index.html (hosting emulado)
   - Agrega productos al carrito
   - Finaliza compra
   - **NOTA:** La Cloud Function se ejecutará localmente

---

### Opción C: Con MercadoPago Real (Producción)

**Solo cuando el cliente esté listo con su cuenta:**

1. **Configurar credenciales:**
   - Obtener Public Key y Access Token
   - Actualizar `checkout-producto.html` (si usa SDK directo)
   - O desplegar Cloud Functions con credenciales

2. **Activar plan Blaze en Firebase**

3. **Desplegar a producción:**
   ```bash
   firebase deploy --only functions,hosting
   ```

4. **Configurar webhook en MercadoPago:**
   - URL: https://us-central1-el-artesano-44216.cloudfunctions.net/mercadoPagoWebhook
   - Eventos: Pagos

---

## 🔍 Verificar que todo funciona

### 1. Crear/Editar Productos (✅ CORREGIDO)
- [ ] Crear producto nuevo → OK
- [ ] Editar producto existente → OK (sin error de createdAt)
- [ ] Eliminar producto → OK

### 2. Carrito de Compras
- [ ] Agregar producto al carrito
- [ ] Ver carrito con productos
- [ ] Cambiar cantidades
- [ ] Eliminar del carrito
- [ ] Calcular total correctamente

### 3. Checkout
- [ ] Formulario de checkout se carga
- [ ] Campos obligatorios funcionan
- [ ] Cálculo de envío (gratis si >$1000)
- [ ] Total se calcula bien

### 4. Integración con Firebase
- [ ] Se crea documento en `orders`
- [ ] Datos del cliente se guardan
- [ ] Items del carrito se guardan
- [ ] Timestamp se crea correctamente

---

## 🐛 Problemas Conocidos

### ⚠️ Firebase Functions no disponible en plan Spark
**Error:** `firebase.functions()` puede fallar si no está en plan Blaze

**Soluciones:**
1. Usar emuladores locales (gratis, para desarrollo)
2. Activar plan Blaze (cliente)
3. Migrar a Hotmart (recomendado, ver RECOMENDACION_CLIENTE.md)

---

## 📝 Notas para el Cliente

Si decides continuar con solución custom (no Hotmart):

1. **Necesitarás:**
   - Plan Blaze de Firebase
   - Cuenta de MercadoPago Business
   - Desarrollador para mantenimiento

2. **Costos estimados:**
   - Firebase: $10-50/mes
   - MercadoPago: 5% + comisión
   - Mantenimiento: $XXX/mes

3. **Alternativa recomendada:**
   - Ver `RECOMENDACION_CLIENTE.md`
   - Usar Hotmart para cursos
   - Mantener landing page custom

---

## ✅ Estado Actual

- ✅ Landing page completa
- ✅ Panel admin funcional
- ✅ Gestión de productos (corregida)
- ✅ Gestión de cursos (corregida)
- ✅ Carrito de compras
- ✅ Formulario de checkout
- ⚠️ Integración MercadoPago (requiere plan Blaze)
- ⚠️ Hosting de videos (YouTube sin protección)

---

## 🚀 Próximos Pasos

1. **Probar productos localmente** con emuladores
2. **Presentar opciones al cliente:**
   - Hotmart (recomendado)
   - Custom con plan Blaze
3. **Decidir arquitectura final**
4. **Implementar solución elegida**
