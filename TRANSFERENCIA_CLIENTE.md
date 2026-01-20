# 🔄 Transferencia del Proyecto Firebase al Cliente

**Guía completa para entregar el proyecto en la cuenta Firebase del cliente**

---

## 📋 Resumen Ejecutivo

Para traspasar el proyecto, el cliente debe:
1. Crear su propio proyecto Firebase
2. Tú configuras todo en su proyecto
3. Le entregas acceso y documentación

**NO es necesario transferir la cuenta Firebase.** Solo configurar su proyecto.

---

## 🎯 Proceso Completo (Paso a Paso)

### Fase 1: El Cliente Crea su Proyecto Firebase

**El cliente debe hacer:**

#### Paso 1: Crear cuenta Google
- Usar email empresarial preferentemente (ej: contacto@elartesano.com)
- Si ya tiene Gmail personal, puede usarlo

#### Paso 2: Ir a Firebase Console
- **URL:** https://console.firebase.google.com
- Click en "Agregar proyecto" o "Create a project"

#### Paso 3: Crear nuevo proyecto (Pantalla 1)
```
📝 Nombre del proyecto: "El Artesano"
   - Aparecerá un ID generado: el-artesano-xxxxx
   - Este ID es único y permanente
   - ✅ Click "Continuar"
```

#### Paso 4: Google Analytics (Pantalla 2)
```
❌ RECOMENDACIÓN: Desmarcar "Habilitar Google Analytics para este proyecto"

¿Por qué?
✅ Más rápido de configurar
✅ Puedes agregarlo después si lo necesitas
✅ Para analytics web, mejor usar Google Analytics 4 directamente

Si el cliente insiste en activarlo:
✅ Dejar marcado
✅ Seleccionar ubicación: "Estados Unidos"
✅ Aceptar términos y condiciones
```

**✅ Click "Crear proyecto"** (tarda 30-60 segundos)

#### Paso 5: Actualizar a Plan Blaze (Pay as you go)
```
Una vez creado el proyecto:

1. Ir a: ⚙️ Project Settings → Usage and billing
2. Click: "Modify plan"
3. Seleccionar: "Blaze (Pay as you go)"
4. Agregar método de pago (tarjeta de crédito)
5. Confirmar

⚠️ IMPORTANTE: Sin esto, NO funcionan las Cloud Functions

💰 Costo real: $0-10/mes para tráfico bajo
   - Límite gratuito generoso
   - Solo se cobra lo que excede el límite
```

#### Paso 6: Agregarte como colaborador
```
1. Ir a: ⚙️ Project Settings → Users and permissions
2. Click: "Add member"
3. Ingresar tu email: tu-email@gmail.com
4. Seleccionar rol: "Editor" o "Owner"
5. Click "Add member"

Recibirás un email de invitación
✅ Aceptar la invitación
```

**🎯 Proyecto listo para que tú configures todo**

---

### Fase 2: Tú Configuras el Proyecto del Cliente

**Con acceso al proyecto del cliente, configuras:**

#### 1. Firebase Authentication (5 min)

```
Firebase Console → Authentication → Get Started

✅ Habilitar Email/Password
✅ Habilitar Google Sign-In (opcional)
   - Configurar email de soporte
   - Agregar dominio autorizado
```

#### 2. Firestore Database (5 min)

```
Firebase Console → Firestore Database → Create Database

✅ Modo: Producción
✅ Ubicación: us-central1 (o la más cercana)
✅ Esperar a que se cree (2-3 min)
```

**Aplicar reglas de seguridad:**
```bash
# En tu máquina local
firebase use --add
# Seleccionar el proyecto del cliente

firebase deploy --only firestore:rules
```

Esto sube el archivo [`firestore.rules`](firestore.rules) al proyecto.

#### 3. Cloud Functions (10 min)

**Instalar dependencias:**
```bash
cd functions
npm install
```

**Configurar variables de entorno:**
```bash
# Generar clave de cifrado (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copiar el resultado

# Configurar en Firebase
firebase functions:config:set \
  crypto.key="PEGAR_CLAVE_GENERADA_AQUI" \
  mercadopago.access_token="ACCESS_TOKEN_DEL_CLIENTE_MP"
```

**Desplegar funciones:**
```bash
firebase deploy --only functions
```

#### 4. Firebase Hosting (5 min)

```bash
# Desplegar sitio web
firebase deploy --only hosting
```

El sitio estará en: `https://PROYECTO-ID.web.app`

#### 5. Configurar Dominio Personalizado (Opcional)

```
Firebase Console → Hosting → Add custom domain

Ejemplo: www.elartesano.com

Seguir instrucciones para:
- Agregar registros DNS (A y CNAME)
- Esperar propagación (24-48 hrs)
- SSL automático incluido
```

---

### Fase 3: Actualizar Credenciales en el Código

**Obtener credenciales del proyecto del cliente:**

```
Firebase Console → Project Settings → General
→ Scroll down → "Your apps"
→ Web app → Config
```

**Copiar el objeto `firebaseConfig`**

**Actualizar archivo [`public/js/firebase-init.js`](public/js/firebase-init.js):**

```javascript
const firebaseConfig = {
  apiKey: "NUEVA_API_KEY_DEL_CLIENTE",
  authDomain: "proyecto-cliente.firebaseapp.com",
  projectId: "proyecto-cliente-id",
  storageBucket: "proyecto-cliente.appspot.com",
  messagingSenderId: "987654321",
  appId: "1:987654321:web:def456"
};
```

**Volver a desplegar:**
```bash
firebase deploy
```

---

### Fase 4: Configurar MercadoPago

**El cliente debe:**

1. **Crear cuenta MercadoPago** (si no tiene)
   - https://www.mercadopago.com.ar

2. **Obtener credenciales**
   - Ir a: Tu negocio → Credenciales
   - Copiar **Access Token de Producción**

3. **Configurar Webhook**
   - URL: `https://us-central1-PROYECTO-ID.cloudfunctions.net/mercadoPagoWebhook`
   - Eventos: Pagos

**Tú actualizas la Cloud Function:**
```bash
firebase functions:config:set \
  mercadopago.access_token="ACCESS_TOKEN_PRODUCCION_DEL_CLIENTE"

firebase deploy --only functions
```

---

### Fase 5: Crear Primer Administrador

**Opción A: El cliente se registra**
```
1. Cliente va a: https://su-sitio.web.app/login.html
2. Se registra con su email empresarial
3. Tú vas a Firestore Console
4. Colección users → Documento del cliente
5. Agregar campo: roles: { admin: true }
```

**Opción B: Tú lo creas**
```
Firebase Console → Authentication → Add user

Email: admin@elartesano.com
Password: [generar segura]

Luego en Firestore:
users → [UID del usuario] → roles: { admin: true }

Enviar credenciales al cliente por canal seguro
```

---

## 📦 Archivos que NO Debes Compartir

### ⛔ Nunca compartas:

- `functions/.env` (si existe)
- Credenciales de MercadoPago
- Access Tokens
- API Keys privadas
- Claves de cifrado

### ✅ Sí debes entregar:

- Todo el código fuente
- `firestore.rules`
- `firebase.json`
- Documentación (README.md, etc.)
- Credenciales del administrador inicial

---

## 📄 Documentación para el Cliente

### Crear archivo: `INSTRUCCIONES_CLIENTE.md`

```markdown
# Instrucciones para el Cliente - El Artesano

## Tu Proyecto Firebase

**URL del Sitio:** https://tu-proyecto.web.app
**Panel Admin:** https://tu-proyecto.web.app/admin-login.html

### Credenciales de Administrador

**Email:** admin@elartesano.com
**Password:** [Se envió por separado]

### Costos Estimados (Firebase Blaze)

**Gratis hasta:**
- 50,000 lecturas/día en Firestore
- 20,000 escrituras/día
- 2 millones de invocaciones de funciones

**Costo promedio mensual:** $5-20 USD para tráfico bajo/medio

### Soporte Firebase

- Documentación: https://firebase.google.com/docs
- Soporte: https://firebase.google.com/support

### Próximos Pasos

1. Cambiar contraseña del administrador
2. Crear productos en el panel admin
3. Crear cursos
4. Probar compras en modo test de MercadoPago
5. Activar modo producción
```

---

## 🔒 Seguridad: Cómo Entregar Credenciales

### ❌ NO enviar por:
- Email sin cifrar
- WhatsApp
- SMS

### ✅ Enviar por:
1. **Password manager compartido** (1Password, LastPass)
2. **Onetimesecret.com** (link que se autodestruye)
3. **Signal/Telegram** (mensajes que se autodestruyen)
4. **En persona** (si es posible)

---

## 🎓 Capacitación al Cliente

### Sesión 1: Panel de Administración (30 min)

```
✅ Cómo crear productos
✅ Cómo crear cursos
✅ Cómo ver ventas
✅ Cómo gestionar pedidos
```

### Sesión 2: Gestión de Usuarios (15 min)

```
✅ Ver usuarios registrados
✅ Ver compras de usuarios
✅ Soporte a clientes
```

### Sesión 3: MercadoPago (15 min)

```
✅ Ver pagos en MercadoPago
✅ Conciliar con Firebase
✅ Resolver problemas de pago
```

---

## 📊 Checklist de Transferencia

### Antes de la Transferencia

- [ ] Cliente creó proyecto Firebase
- [ ] Cliente te agregó como Editor/Owner
- [ ] Cliente tiene cuenta MercadoPago
- [ ] Cliente actualizó a plan Blaze

### Durante la Configuración

- [ ] ✅ Authentication habilitado
- [ ] ✅ Firestore Database creado
- [ ] ✅ Reglas de seguridad aplicadas
- [ ] ✅ Cloud Functions desplegadas
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Hosting desplegado
- [ ] ✅ Dominio personalizado configurado (opcional)
- [ ] ✅ Credenciales actualizadas en código
- [ ] ✅ MercadoPago webhooks configurados

### Después de la Transferencia

- [ ] ✅ Administrador inicial creado
- [ ] ✅ Credenciales entregadas de forma segura
- [ ] ✅ Documentación entregada
- [ ] ✅ Sesión de capacitación realizada
- [ ] ✅ Todo probado en producción
- [ ] ✅ Cliente puede hacer login como admin
- [ ] ✅ Cliente puede crear productos/cursos

### Finalización

- [ ] ✅ Removerte como colaborador (si acordado)
- [ ] ✅ Entregar acceso completo al cliente
- [ ] ✅ Definir plan de soporte post-lanzamiento

---

## 💰 Costos para el Cliente (Estimados)

### Firebase (Plan Blaze - Pay as you go)

**Costo $0/mes si:**
- Menos de 50,000 visitas/mes
- Uso moderado de funciones

**Costo $10-30/mes para:**
- 100,000-500,000 visitas/mes
- Tráfico medio

**Incluye gratis:**
- Hosting
- SSL automático
- CDN global
- Authentication

### MercadoPago

**Sin costos fijos**
- Solo se paga por transacción aprobada
- ~5-7% por transacción
- El costo lo asume el vendedor o comprador

### Dominio (Opcional)

**$10-20/año**
- .com, .com.ar, etc.
- Renovación anual

---

## 🆘 Soporte Post-Transferencia

### Opción 1: Soporte por Horas

```
Precio sugerido: $50-80 USD/hora

Incluye:
- Resolver problemas técnicos
- Agregar funcionalidades
- Actualizar diseño
- Mantenimiento
```

### Opción 2: Mantenimiento Mensual

```
Precio sugerido: $200-500 USD/mes

Incluye:
- 5-10 horas de soporte
- Monitoreo de errores
- Actualizaciones de seguridad
- Backup de datos
```

### Opción 3: Sin Soporte

```
Cliente gestiona todo
Entregas documentación completa
Sin compromisos posteriores
```

---

## 📞 Información de Contacto (Ejemplo)

```
Desarrollador: [Tu Nombre]
Email: tu@email.com
Teléfono: +54 9 11 xxxx-xxxx
Horas de soporte: Lunes a Viernes 9-18hs
```

---

## 🎯 Resumen: Lo Mínimo Indispensable

**El cliente necesita:**

1. ✅ Proyecto Firebase propio (crear en su cuenta)
2. ✅ Plan Blaze activado
3. ✅ Cuenta MercadoPago
4. ✅ Darte acceso temporal como Editor
5. ✅ Recibir capacitación del panel admin

**Tú debes entregar:**

1. ✅ Código fuente completo
2. ✅ Proyecto configurado en su Firebase
3. ✅ Credenciales del administrador
4. ✅ Documentación clara
5. ✅ Capacitación de 1 hora

**Tiempo total:** 2-3 horas de configuración + 1 hora de capacitación

---

## ✅ Proyecto Transferido

Una vez completado todo:
- ✅ El cliente tiene control total
- ✅ Puede gestionar su sitio sin ti
- ✅ No depende de tu cuenta Firebase
- ✅ Tiene toda la documentación
- ✅ Sabe cómo usar el panel admin

**¡Proyecto entregado exitosamente! 🎉**
