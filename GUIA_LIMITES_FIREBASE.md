# 📊 Guía Completa: Límites y Costos de Firebase + Hosting

## 🎯 Resumen Ejecutivo

Tu proyecto usa:
- **Firebase Plan Spark (GRATUITO)** - Backend (base de datos, autenticación)
- **Hostinger** - Hosting del sitio web (HTML, CSS, JS)

Esta guía te explica exactamente cuánto puedes usar gratis y cuándo necesitarías pagar.

---

## 📦 Plan Spark vs Plan Blaze

| Característica | Plan Spark (GRATIS) | Plan Blaze (PAGO) |
|---------------|---------------------|-------------------|
| **Costo mensual base** | $0 | $0 + uso adicional |
| **Firestore** | 1 GB almacenamiento<br>50,000 lecturas/día<br>20,000 escrituras/día<br>20,000 eliminaciones/día | Ilimitado con cargo por uso |
| **Authentication** | 10,000 verificaciones/mes | Ilimitado (gratis) |
| **Hosting** | ❌ NO USA (Hostinger) | ❌ NO USA (Hostinger) |
| **Cloud Functions** | ❌ NO DISPONIBLE | Desde 2,000,000 invocaciones gratis |
| **Cloud Storage** | 5 GB almacenamiento<br>1 GB descarga/día<br>50,000 operaciones/día | 5 GB gratis, luego $0.026/GB |

> **Nota:** Tu sitio web está alojado en Hostinger, por lo que NO usas Firebase Hosting. Firebase solo se usa como backend (base de datos y autenticación).

---

## 📸 IMÁGENES Y ARCHIVOS

### Opción 1: Firebase Storage (Recomendado para producción)

#### Plan Spark (GRATIS)
- **Almacenamiento**: 5 GB
- **Descargas**: 1 GB por día
- **Operaciones**: 50,000 lecturas por día

**¿Cuántas imágenes caben?**
```
Ejemplo con fotos de calidad media (500 KB cada una):
5 GB ÷ 0.5 MB = 10,000 fotos aproximadamente

Ejemplo con fotos de alta calidad (2 MB cada una):
5 GB ÷ 2 MB = 2,500 fotos aproximadamente
```

**Cálculo práctico para tu panadería:**
- **Productos**: 50 productos × 1 MB = 50 MB
- **Cursos**: 20 cursos × 2 MB = 40 MB
- **Banners/promociones**: 10 imágenes × 3 MB = 30 MB
- **Total usado**: ~120 MB de 5 GB disponibles
- **Conclusión**: Con estas cantidades, el plan gratuito es más que suficiente.

#### Plan Blaze (PAGO)
- **Primeros 5 GB**: GRATIS
- **GB adicionales**: $0.026 USD por GB/mes
- **Descargas**: $0.12 USD por GB

**Ejemplo de costos:**
```
Si subes 10 GB de imágenes:
- Primeros 5 GB: $0
- Siguientes 5 GB: 5 × $0.026 = $0.13 USD/mes

Si tus usuarios descargan 50 GB/mes:
- Primeros 10 GB: $0 (incluidos en cuota gratuita de hosting)
- Siguientes 40 GB: 40 × $0.12 = $4.80 USD/mes
```

### Opción 2: URLs Externas (Tu configuración actual)

#### Servicios gratuitos ilimitados:
1. **Google Photos**
   - Almacenamiento: ILIMITADO
   - Velocidad: Excelente
   - Costo: $0

2. **Imgur**
   - Almacenamiento: ILIMITADO
   - Límite: Sin límite de fotos
   - Costo: $0

3. **Google Drive (compartido público)**
   - Almacenamiento: 15 GB gratis
   - Costo adicional: $1.99/mes por 100 GB

**Ventajas:**
- ✅ Completamente gratis
- ✅ Sin límites de Firebase
- ✅ No afecta tu cuota

**Desventajas:**
- ⚠️ Links pueden romperse si borras la foto
- ⚠️ Depende de servicio externo
- ⚠️ Menos control sobre seguridad

---

## 🔥 FIRESTORE (Base de Datos)

### Plan Spark (GRATIS)
- **Almacenamiento**: 1 GB
- **Lecturas**: 50,000 por día
- **Escrituras**: 20,000 por día
- **Eliminaciones**: 20,000 por día

#### ¿Cuánto puedes almacenar?

**Documentos típicos en tu proyecto:**

```javascript
// Producto (ejemplo real)
{
  name: "Pan de Campo",
  description: "Pan artesanal...",
  price: 350,
  imageUrl: "https://...",
  category: "Panes",
  stock: 50,
  createdAt: timestamp
}
// Tamaño aproximado: 0.5 KB
```

**Capacidad estimada:**
```
1 GB = 1,000 MB = 1,000,000 KB

Productos: 1,000,000 KB ÷ 0.5 KB = 2,000,000 productos
Usuarios: 1,000,000 KB ÷ 1 KB = 1,000,000 usuarios
Cursos: 1,000,000 KB ÷ 2 KB = 500,000 cursos
Órdenes: 1,000,000 KB ÷ 3 KB = 333,333 órdenes
```

**Para tu negocio real:**
- 100 productos = 50 KB
- 1,000 usuarios = 1 MB
- 50 cursos = 100 KB
- 10,000 órdenes = 30 MB
- **Total**: ~31 MB de 1 GB (3% usado)

#### ¿Cuántas operaciones puedes hacer?

**Lecturas (50,000/día):**
```
Escenario típico de tu sitio:
- Usuario entra a la página: 50 productos leídos
- Ve cursos: 20 cursos leídos
- Ve "Mis Cursos": 5 cursos leídos
Total por usuario: ~75 lecturas

50,000 ÷ 75 = 666 usuarios pueden entrar por día
= 20,000 usuarios/mes (con el plan gratuito)
```

**Escrituras (20,000/día):**
```
Escrituras comunes:
- Usuario compra curso: 3 escrituras (orden, user_course, actualizar stock)
- Admin crea producto: 1 escritura
- Usuario se registra: 2 escrituras

20,000 ÷ 3 = 6,666 compras por día posibles
= 200,000 compras/mes (más que suficiente para empezar)
```

### Plan Blaze (PAGO)

#### Cuota gratis mensual:
- **Lecturas**: 50,000
- **Escrituras**: 20,000
- **Eliminaciones**: 20,000

#### Costo por operación adicional:
- **Lecturas**: $0.06 USD por 100,000
- **Escrituras**: $0.18 USD por 100,000
- **Eliminaciones**: $0.02 USD por 100,000

**Ejemplo de costos reales:**
```
Si tienes 1,000 ventas diarias:
- Lecturas: 100,000/día = 3,000,000/mes
  Gratis: 50,000
  Cobradas: 2,950,000 × ($0.06/100,000) = $1.77 USD/mes

- Escrituras: 3,000/día = 90,000/mes
  Gratis: 20,000
  Cobradas: 70,000 × ($0.18/100,000) = $0.13 USD/mes

Total Firestore: ~$1.90 USD/mes (con 30,000 órdenes/mes)
```

---

## 🔐 AUTHENTICATION (Usuarios)

### Plan Spark (GRATIS)
- **Verificaciones**: 10,000 por mes
- **Usuarios**: ILIMITADOS

**¿Qué es una "verificación"?**
Cada vez que un usuario inicia sesión o el sistema verifica que su sesión es válida.

**Cálculo práctico:**
```
Usuario típico:
- Inicia sesión 1 vez = 1 verificación
- Navega el sitio (sesión se verifica automáticamente) = 0 verificaciones adicionales
- Cierra sesión y vuelve al día siguiente = 1 verificación

10,000 verificaciones ÷ 2 verificaciones/usuario/mes = 5,000 usuarios activos/mes
```

### Plan Blaze (PAGO)
- **Todas las verificaciones**: GRATIS (sin costo adicional)
- Sin límites

---

## ☁️ CLOUD FUNCTIONS (Funciones en la nube)

### Plan Spark
- ❌ **NO DISPONIBLE**
- No puedes desplegar functions

### Plan Blaze
**Cuota gratis mensual:**
- **Invocaciones**: 2,000,000
- **Tiempo de cómputo**: 400,000 GB-segundos
- **Ancho de banda**: 5 GB

**Costo adicional:**
- **Invocaciones**: $0.40 USD por millón
- **Tiempo de cómputo**: $0.0000025 USD por GB-segundo

**Tu proyecto actual tiene estas functions (NO desplegadas):**
1. `adminCreateUser` - Crear usuarios desde admin
2. `createMercadoPagoPreference` - Crear preferencia de pago
3. `mercadoPagoWebhook` - Recibir notificaciones de pago

**Estimación de uso:**
```
Si vendes 100 cursos/mes:
- createMercadoPagoPreference: 100 invocaciones
- mercadoPagoWebhook: 300 invocaciones (3 por pago)
Total: 400 invocaciones/mes (dentro de cuota gratis de 2M)

Costo: $0 USD/mes (muy por debajo del límite gratuito)
```

---

## 🌐 HOSTING DEL SITIO WEB (Hostinger)

### Tu configuración actual

**Hostinger** aloja tu sitio web (archivos HTML, CSS, JS):
- Dominio personalizado
- SSL incluido
- Velocidad y uptime garantizado por Hostinger
- No consume cuota de Firebase

**Firebase** solo se usa como backend:
- Firestore (base de datos)
- Authentication (login de usuarios)
- Storage (si decides activarlo para imágenes)
- Functions (si actualizas a Blaze)

**Ventajas de esta arquitectura:**
- ✅ Hosting profesional en Hostinger
- ✅ Firebase solo para datos (más eficiente)
- ✅ Puedes cambiar hosting sin afectar datos
- ✅ Escalabilidad independiente

**Consideraciones:**
- Tu plan de Hostinger debe soportar el tráfico web
- Firebase solo cobra por operaciones de base de datos
- No pagas Firebase Hosting (no lo usas)

---

## 🎥 ALMACENAMIENTO DE VIDEOS (Cursos)

## 💰 RESUMEN DE COSTOS REALES

### Escenario 1: Negocio pequeño (Tu situación actual)
```
📊 Métricas mensuales:
- 50 productos en catálogo
- 500 usuarios registrados
- 100 órdenes/mes
- Sitio alojado en Hostinger

Plan Spark (GRATIS):
✅ Firestore: 31 MB de 1 GB usado = 3%
✅ Auth: 1,000 verificaciones de 10,000 = 10%
✅ Hosting: No usa (Hostinger)
⚠️ Storage: No usa (usas URLs externas)
❌ Functions: No disponible

Plan recomendado: SPARK (GRATIS)
Costo total Firebase: $0 USD/mes
Costo Hostinger: Según tu plan contratado
```

### Escenario 2: Negocio en crecimiento
```
📊 Métricas mensuales:
- 200 productos
- 5,000 usuarios activos
- 1,000 órdenes/mes
- Sitio alojado en Hostinger

Plan Blaze necesario para:
✅ Cloud Functions (pagos automáticos)

Costos estimados:
- Firestore: $1.50/mes
- Functions: $0.00 (dentro de cuota gratis)
- Hosting: No usa (Hostinger)
- Storage (si usas): $0.50/mes

Costo total Firebase: ~$2.00 USD/mes
Costo Hostinger: Según tu plan
```

### Escenario 3: Negocio establecido
```
📊 Métricas mensuales:
- 500 productos
- 20,000 usuarios activos
- 5,000 órdenes/mes
- Sitio alojado en Hostinger

Costos estimados:
- Firestore: $8.00/mes
- Functions: $0.50/mes
- Hosting: No usa (Hostinger)
- Storage: $3.00/mes

Costo total Firebase: ~$11.50 USD/mes
Costo Hostinger: Según tu plan
```

---

## 🎓 GESTIÓN DE USUARIOS Y CURSOS

### Cómo agregar usuarios (Configuración actual)

#### Opción 1: Admin Panel (Sin Functions)
**Proceso actual:**
1. Abres [admin-panel.html](admin-panel.html)
2. Click en "Crear Usuario"
3. Llenas email, nombre, contraseña
4. Click en "Asignar Curso" (si aplica)

**Limitación:**
- Te desloguea temporalmente mientras crea el usuario
- Es un workaround por no tener Functions activas

**Costo:** $0 (funciona en plan Spark)

#### Opción 2: Con Cloud Functions (Requiere Blaze)
**Si despliegas las functions:**
1. Usuario hace request desde "Solicitar Acceso"
2. Admin revisa en panel
3. Click en "Aprobar" crea usuario automáticamente
4. Asigna curso directamente

**Ventaja:** No te desloguea, más profesional
**Costo:** $0/mes (dentro de cuota gratis de 2M invocaciones)

### Asignar cursos a usuarios

**Método 1: Al crear usuario**
- En el formulario de "Crear Usuario" hay dropdown de cursos
- Seleccionas el curso antes de crear

**Método 2: Usuario existente**
1. Sección "Usuarios" en admin panel
2. Click en "Asignar Curso" junto al usuario
3. Ingresas el ID del curso
4. Automáticamente se guarda en `user_courses`

**Método 3: Nueva sección "Cursos de Usuarios"**
- Ver todos los cursos asignados
- Revocar acceso (desactivar sin borrar)
- Reactivar acceso
- Eliminar permanentemente

**Estructura en Firestore:**
```
user_courses/
  └── {document_id}
      ├── userId: "abc123"
      ├── courseId: "curso_001"
      ├── active: true
      ├── assignedAt: timestamp
      ├── assignedBy: "admin"
      └── expiresAt: null
```

---

## 📝 ALMACENAMIENTO DE IMÁGENES

### Tu configuración actual (URLs externas)

**Ventajas:**
- ✅ Completamente gratis
- ✅ No consume Firebase Storage
- ✅ No consume Firebase Hosting
- ✅ Fácil de actualizar (solo cambias la URL)

**Cómo usarlo:**
1. Subes foto a Google Photos o Imgur
2. Obtienes link público
3. Copias URL en admin panel al crear producto/curso
4. Firebase solo guarda la URL (texto), no la imagen

**Servicios recomendados:**
```
Google Photos:
- Subir imagen
- Click derecho > "Copiar dirección de imagen"
- Pegar en campo "URL de Imagen"

Imgur:
- Subir imagen a imgur.com
- Click derecho en imagen > "Copiar dirección de imagen"
- Pegar en admin panel
```

### Migración a Firebase Storage (si decides hacerlo)

**Cuándo considerar Storage:**
1. Tienes más de 10,000 imágenes
2. Necesitas control total de seguridad
3. Quieres generar URLs dinámicas
4. Necesitas comprimir/optimizar automáticamente

**Proceso de migración:**
1. Activar Storage en Firebase Console
2. Desplegar `storage.rules` (ya las tienes creadas)
3. Modificar admin panel para subir archivos
4. Migrar URLs existentes (opcional)

**Costo estimado:**
- 1,000 imágenes (1 GB): $0/mes (dentro de 5 GB gratis)
- 10,000 descargas/día: $0/mes (dentro de cuota)

---

## 🚀 RECOMENDACIONES

### Para tu situación actual:

**✅ Mantener:**
1. **Plan Spark (GRATIS)** - Suficiente para empezar
2. **URLs externas para imágenes** - Simple y gratis
3. **Admin panel actual** - Funciona bien

**⚠️ Considerar upgrade a Blaze cuando:**
1. Tengas más de 100 órdenes/mes consistente
2. Quieras pagos automáticos de MercadoPago
3. Necesites crear usuarios sin desloguearte
4. Superes 2,000 visitas/mes

**💡 Optimizaciones sin costo:**
1. Comprimir imágenes antes de subir a Google Photos
2. Usar lazy loading en imágenes
3. Minimizar consultas a Firestore (cachear datos)
4. Implementar paginación en listas largas

### Monitoreo de uso:

**Firebase Console > Usage:**
- Revisa cada semana tus métricas
- Alerta si llegas al 80% de algún límite
- Gráficas te muestran tendencias

**Límites que monitorear:**
- Firestore reads: 50k/día
- Auth verifications: 10k/mes
- Hosting transfer: 360 MB/día

---

## 📞 Próximos pasos

### Ahora mismo (Plan Spark):
```bash
# Tu proyecto funciona así:
✅ Usuarios pueden registrarse (solicitar acceso)
✅ Admin aprueba manualmente
✅ Admin asigna cursos
✅ Usuarios ven sus cursos
✅ Videos se reproducen (YouTube)
✅ Pagos en modo demo (sin procesamiento real)
```

### Si decides actualizar a Blaze:
```bash
# 1. En Firebase Console:
#    - Ir a "Usage and billing"
#    - Click "Modify plan"
#    - Seleccionar Blaze

# 2. Desplegar functions:
cd functions
npm install
firebase deploy --only functions

# 3. Configurar MercadoPago:
firebase functions:config:set mercadopago.access_token="TU_ACCESS_TOKEN"

# 4. ¡Listo! Pagos automáticos funcionando
```

**Costo inicial estimado:** $2-5 USD/mes

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo probar Blaze sin que me cobren?**
R: Sí, Blaze incluye cuota gratis. Solo pagas si la superas. Con tu tráfico actual, probablemente pagues $0-2 USD/mes.

**P: ¿Qué pasa si supero los límites gratis?**
R: Plan Spark: Firebase detiene las operaciones hasta el día siguiente. Plan Blaze: Continúa funcionando y te cobran el excedente.

**P: ¿Cuánto cuesta realmente Firebase para un negocio pequeño?**
R: Spark: $0. Blaze con tráfico moderado: $2-10 USD/mes.

**P: ¿Necesito tarjeta de crédito para Spark?**
R: No, Spark es completamente gratis sin necesidad de tarjeta.

**P: ¿Puedo volver a Spark después de Blaze?**
R: Sí, puedes downgrade en cualquier momento, pero perderás Cloud Functions.

**P: ¿Las URLs externas de imágenes afectan mi cuota?**
R: No, solo guardan texto. La imagen está en Google Photos/Imgur, no en Firebase.

---

## 📊 Tabla Comparativa Final

| Característica | Plan Spark | Plan Blaze | Tu Uso Actual |
|----------------|------------|------------|---------------|
| **Costo base** | $0 | $0 + uso | $0 |
| **Firestore** | 1 GB, 50k reads/día | Ilimitado | ~31 MB |
| **Auth** | 10k/mes | Ilimitado gratis | ~500/mes |
| **Storage** | 5 GB | 5 GB gratis + pago | 0 (usas URLs) |
| **Functions** | ❌ No | ✅ Sí (2M gratis) | 0 (no desplegadas) |
| **Hosting** | ❌ No usa | ❌ No usa | Hostinger |
| **Usuarios** | Ilimitados | Ilimitados | ~500 |
| **Recomendado para** | Desarrollo, MVP | Producción | ✅ Perfecto ahora |

---

**Última actualización:** Enero 2026  
**Proyecto:** El Artesano - Landing Page  
**Plan actual:** Spark (Gratuito) + Hostinger  
**Hosting:** Hostinger (sitio web) + Firebase (backend)  
**Videos:** Ver [GUIA_VIDEOS_CURSOS.md](GUIA_VIDEOS_CURSOS.md) para opciones de hosting seguro  
**Próximo milestone:** 100 órdenes/mes → Considerar Blaze
