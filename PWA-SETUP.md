# Configuración PWA - Control de Gastos

## ✅ Cambios Realizados

### 1. **Manifest.json actualizado** (`public/manifest.json`)
   - Nombre: "Control de Gastos"
   - Descripción completa
   - Iconos configurados (192x192 y 512x512)
   - Colores de tema (#667eea)
   - Orientación portrait
   - Categorías: finance, productivity

### 2. **Vite Config mejorado** (`vite.config.js`)
   - Service Worker con autoUpdate
   - Cache de fuentes de Google
   - Runtime caching configurado
   - Máximo 5MB de archivos en cache
   - DevOptions habilitado para desarrollo

### 3. **Meta Tags agregados** (`index.html`)
   - Meta tags PWA estándar
   - Meta tags específicos para iOS (Apple)
   - Meta tags para Android
   - Links a iconos y manifest

### 4. **Componente InstallPWA** (`src/components/InstallPWA.jsx`)
   - Banner de instalación inteligente
   - Detecta cuando la app ya está instalada
   - Permite cerrar el prompt
   - Guarda preferencia del usuario

---

## 🚀 Cómo Probar la PWA

### Opción 1: Localmente (Requiere HTTPS o localhost)

1. **Construir la aplicación:**
   ```bash
   npm run build
   ```

2. **Servir la versión de producción:**
   ```bash
   npm run preview
   ```

3. **Abrir en el navegador:**
   - Ve a: `http://localhost:4173`
   - Abre las DevTools (F12)
   - Ve a la pestaña "Application" > "Manifest"
   - Verifica que el manifest esté correcto

### Opción 2: Desplegar en un servidor con HTTPS

Las PWA **requieren HTTPS** para funcionar (excepto en localhost). Opciones gratuitas:

#### A) **Vercel** (Recomendado - Más fácil)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Producción
vercel --prod
```

#### B) **Netlify**
1. Crear cuenta en [netlify.com](https://netlify.com)
2. Arrastra la carpeta `dist` a su panel
3. O usa Netlify CLI:
```bash
npm i -g netlify-cli
netlify deploy --dir=dist --prod
```

#### C) **GitHub Pages**
1. Instalar gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Agregar en `package.json`:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

3. Actualizar `vite.config.js` con tu repo:
```javascript
export default defineConfig({
  base: '/nombre-de-tu-repo/',
  // resto de la configuración...
})
```

4. Desplegar:
```bash
npm run deploy
```

---

## 📱 Instalar en Dispositivos Móviles

### Android (Chrome)

1. Abre la app en Chrome
2. Aparecerá un banner "Instalar app"
3. O ve a **⋮ (menú) > Agregar a pantalla de inicio**
4. La app se instalará como una aplicación nativa

### iOS (Safari)

1. Abre la app en Safari
2. Toca el botón **Compartir** (cuadro con flecha)
3. Desplaza y toca **"Agregar a pantalla de inicio"**
4. La app aparecerá en tu pantalla de inicio

### Desktop (Chrome/Edge)

1. Busca el ícono ⊕ en la barra de direcciones
2. Click en "Instalar Control de Gastos"
3. La app se abrirá en su propia ventana

---

## 🔍 Verificar que la PWA funciona

### Lighthouse Audit (Recomendado)

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña **"Lighthouse"**
3. Selecciona **"Progressive Web App"**
4. Click en **"Generate report"**
5. Deberías obtener un puntaje alto (90+)

### Checklist Manual

- [ ] Manifest.json se carga correctamente
- [ ] Service Worker se registra
- [ ] Los iconos se muestran
- [ ] El color del tema se aplica (#667eea)
- [ ] La app se puede instalar
- [ ] Funciona offline (después de la primera carga)
- [ ] Las fuentes se cachean correctamente

---

## 🛠️ Troubleshooting

### La app no se puede instalar

1. **Verifica HTTPS:** La PWA requiere HTTPS (excepto localhost)
2. **Limpia caché:**
   - Chrome DevTools > Application > Storage > Clear site data
3. **Verifica manifest:**
   - DevTools > Application > Manifest
   - Todos los campos deben estar presentes
4. **Verifica iconos:**
   - Los iconos deben ser accesibles
   - Tamaños: 192x192 y 512x512

### El Service Worker no se actualiza

1. **Desregistrar SW antiguo:**
   - DevTools > Application > Service Workers
   - Click en "Unregister"
2. **Hard reload:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

### La app no funciona offline

1. Verifica que el service worker esté activo
2. Recarga la página al menos una vez para cachear recursos
3. DevTools > Application > Cache Storage
4. Verifica que los archivos estén cacheados

---

## 📊 Características de la PWA

✅ **Instalable** - Se puede agregar a la pantalla de inicio
✅ **Funciona Offline** - Cachea recursos para uso sin conexión
✅ **Rápida** - Cache de fuentes y assets
✅ **Actualizaciones automáticas** - El SW se actualiza solo
✅ **Responsive** - Funciona en todos los dispositivos
✅ **Segura** - Requiere HTTPS
✅ **Notificación de instalación** - Banner personalizado

---

## 🎨 Personalización

### Cambiar colores del tema

Edita `vite.config.js` y `manifest.json`:
```javascript
theme_color: '#667eea',        // Color de la barra superior
background_color: '#667eea',   // Color de la splash screen
```

### Cambiar iconos

Reemplaza los archivos en `public/icons/`:
- `pwa-192x192.png` (192x192 píxeles)
- `pwa-512x512.png` (512x512 píxeles)

Puedes generar iconos en: https://realfavicongenerator.net/

### Modificar el comportamiento offline

Edita la sección `workbox` en `vite.config.js` para cambiar estrategias de cache.

---

## 📚 Recursos

- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [MDN - Progressive Web Apps](https://developer.mozilla.org/es/docs/Web/Progressive_web_apps)
- [Vite Plugin PWA Docs](https://vite-plugin-pwa.netlify.app/)
- [Workbox Docs](https://developer.chrome.com/docs/workbox/)

---

## ✨ Próximos Pasos

1. **Desplegar en producción** con HTTPS
2. **Probar en dispositivos reales** (Android/iOS)
3. **Ejecutar Lighthouse Audit** para verificar score
4. **Agregar notificaciones push** (opcional)
5. **Implementar sync en background** (opcional)

---

¡Tu aplicación ahora es una Progressive Web App completa! 🎉
