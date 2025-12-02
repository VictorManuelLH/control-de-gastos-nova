# 🚀 Guía Paso a Paso: Desplegar en Vercel

## Método 1: Usando la Interfaz Web de Vercel (MÁS FÁCIL) ⭐

### Paso 1: Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Sign Up"**
3. Selecciona **"Continue with GitHub"** (recomendado)
4. Autoriza a Vercel para acceder a tu cuenta de GitHub

### Paso 2: Subir tu proyecto a GitHub

**Si no tienes el proyecto en GitHub:**

```bash
# En tu terminal, dentro de la carpeta del proyecto:

# Inicializar git (si no lo has hecho)
git init

# Agregar todos los archivos
git add .

# Crear commit
git commit -m "Deploy: Configuración PWA completa"

# Crear repositorio en GitHub (ve a github.com y crea un nuevo repo)
# Luego conecta tu repo local con GitHub:
git remote add origin https://github.com/TU_USUARIO/control-de-gastos.git
git branch -M main
git push -u origin main
```

### Paso 3: Importar proyecto en Vercel

1. En [vercel.com](https://vercel.com), click en **"Add New..."** → **"Project"**
2. Busca tu repositorio **"control-de-gastos"**
3. Click en **"Import"**

### Paso 4: Configurar el proyecto

Vercel detectará automáticamente que es un proyecto Vite. Verifica:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Paso 5: Desplegar

1. Click en **"Deploy"**
2. Espera 1-2 minutos mientras Vercel construye tu app
3. ¡Listo! Te dará una URL como: `https://control-de-gastos-xxx.vercel.app`

---

## Método 2: Usando Vercel CLI (AVANZADO)

### Paso 1: Instalar Vercel CLI

**Opción A: Instalación Global (Requiere sudo en Mac/Linux)**
```bash
sudo npm install -g vercel
```

**Opción B: Usando npx (Sin instalación)**
```bash
# Puedes usar npx directamente sin instalar
npx vercel
```

### Paso 2: Iniciar sesión

```bash
# Si instalaste globalmente:
vercel login

# O con npx:
npx vercel login
```

Esto abrirá tu navegador para que autorices el login.

### Paso 3: Desplegar (Preview)

```bash
# Desde la carpeta del proyecto:
vercel

# O con npx:
npx vercel
```

Responde las preguntas:
- **Set up and deploy?** → Yes
- **Which scope?** → Selecciona tu cuenta
- **Link to existing project?** → No
- **Project name?** → control-de-gastos (o el que prefieras)
- **In which directory?** → ./ (presiona Enter)
- **Build Command?** → npm run build (presiona Enter)
- **Output Directory?** → dist (presiona Enter)
- **Want to modify settings?** → No

### Paso 4: Desplegar a Producción

```bash
vercel --prod

# O con npx:
npx vercel --prod
```

---

## 🔧 Configuración de Variables de Entorno (Si las necesitas)

### En la Web:

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** → **"Environment Variables"**
3. Agrega tus variables (ej: API keys de Firebase)

### Con CLI:

```bash
vercel env add VITE_FIREBASE_API_KEY
# Pega el valor cuando te lo pida
```

---

## 📱 Probar la PWA después del deploy

### En Android:
1. Abre la URL de Vercel en Chrome
2. Verás un banner: **"Agregar Control de Gastos a la pantalla de inicio"**
3. Toca **"Instalar"**
4. ¡La app aparecerá en tu pantalla de inicio como app nativa!

### En iOS:
1. Abre la URL de Vercel en Safari
2. Toca el botón **Compartir** (cuadro con flecha hacia arriba)
3. Desplaza y toca **"Agregar a pantalla de inicio"**
4. Toca **"Agregar"**
5. ¡La app aparecerá en tu iPhone!

### En Desktop:
1. Abre la URL en Chrome o Edge
2. Busca el ícono **⊕** en la barra de direcciones
3. Click en **"Instalar Control de Gastos"**

---

## 🔄 Actualizaciones Futuras

### Con GitHub (Automático):

Cada vez que hagas push a GitHub, Vercel desplegará automáticamente:

```bash
git add .
git commit -m "Nueva funcionalidad"
git push
```

### Con CLI:

```bash
vercel --prod
```

---

## 🐛 Troubleshooting

### Error: "Build failed"

Verifica que:
- El comando `npm run build` funcione localmente
- Todas las dependencias estén en `package.json`
- No tengas errores de TypeScript/ESLint

```bash
# Prueba el build localmente:
npm run build
```

### Error: "Routes not working"

El archivo `vercel.json` ya está configurado para manejar rutas de React Router.

### Error: "Environment variables not found"

Agrega las variables de entorno en:
Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

---

## 📊 Verificar PWA con Lighthouse

1. Abre tu app desplegada en Vercel
2. Abre DevTools (F12)
3. Ve a **Lighthouse**
4. Selecciona **"Progressive Web App"**
5. Click en **"Generate report"**
6. Deberías obtener 90+ puntos ✅

---

## 🎉 ¡Listo!

Tu aplicación está desplegada en Vercel con:
- ✅ HTTPS automático
- ✅ PWA instalable
- ✅ Service Worker funcionando
- ✅ Actualizaciones automáticas
- ✅ CDN global
- ✅ Analytics gratis

**URL de ejemplo:** `https://control-de-gastos-xxx.vercel.app`

---

## 🔗 Links Útiles

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Documentación Vercel](https://vercel.com/docs)
- [Vercel CLI Docs](https://vercel.com/docs/cli)

---

## 💡 Consejos Finales

1. **Dominio personalizado (Opcional):**
   - Vercel Dashboard → Tu Proyecto → Settings → Domains
   - Agrega tu propio dominio gratis

2. **Analytics:**
   - Vercel ofrece analytics gratis
   - Actívalo en Settings → Analytics

3. **Preview Deployments:**
   - Cada branch de Git tendrá su propia URL de preview
   - Perfecto para probar antes de producción

¡Ahora tu app está en producción! 🚀
