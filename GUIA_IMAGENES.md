# 📸 Guía para usar imágenes en El Artesano

## ✅ Opción 1: Google Photos (Recomendada)

### Pasos:
1. Ve a [Google Photos](https://photos.google.com)
2. Sube tu imagen
3. Abre la imagen en tamaño completo
4. **Clic derecho** → "Abrir imagen en pestaña nueva"
5. Copia la URL de la barra de direcciones
6. Pega esa URL en el campo "URL de Imagen" del admin panel

**⚠️ Importante:** La URL debe terminar en `.jpg`, `.png`, `.webp`, etc.

---

## ✅ Opción 2: Imgur (Muy fácil y rápido)

### Pasos:
1. Ve a [Imgur.com](https://imgur.com)
2. Haz clic en "New post"
3. Arrastra tu imagen
4. Una vez subida, **clic derecho** sobre la imagen → "Copiar dirección de imagen"
5. Pega esa URL en el admin panel

**✨ Ventajas:** No requiere cuenta, muy rápido, CDN global

---

## ✅ Opción 3: Unsplash (Imágenes de stock gratis)

### Pasos:
1. Ve a [Unsplash.com](https://unsplash.com)
2. Busca la imagen que necesitas (pan, panadería, chef, etc.)
3. Haz clic en la imagen
4. **Clic derecho** → "Copiar dirección de imagen"
5. Pega esa URL en el admin panel

**✨ Ventajas:** Imágenes profesionales gratis, alta calidad

---

## ✅ Opción 4: Google Drive

### Pasos:
1. Sube la imagen a Google Drive
2. **Clic derecho** → "Obtener enlace"
3. Cambia los permisos a "Cualquiera con el enlace"
4. Copia el ID del enlace (ejemplo: `1a2b3c4d5e6f`)
5. Usa este formato:
   ```
   https://drive.google.com/uc?export=view&id=TU_ID_AQUI
   ```

**Ejemplo:**
- Enlace original: `https://drive.google.com/file/d/1a2b3c4d5e6f/view`
- Enlace directo: `https://drive.google.com/uc?export=view&id=1a2b3c4d5e6f`

---

## ❌ Evita:

- Links de Google Photos que empiecen con `https://photos.google.com/share/...`
- Links de Drive como `https://drive.google.com/file/d/.../view`
- Links de redes sociales (Facebook, Instagram, etc.)

---

## 💡 Recomendación

Para este proyecto de prueba, te recomiendo **Imgur** por su simplicidad:
- No requiere cuenta
- Muy rápido
- Links directos
- Sin límites
- CDN rápido y confiable

---

## 🎯 Ejemplo completo de URL válida

```
https://i.imgur.com/abc123.jpg
https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600
https://lh3.googleusercontent.com/abc123def456/photo.jpg
```

Todas estas URLs funcionarán perfectamente en tu admin panel.
