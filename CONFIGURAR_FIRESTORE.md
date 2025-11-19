# Cómo Configurar las Reglas de Firestore

## Problema
Error: `Missing or insufficient permissions` al intentar crear notas

## Solución

### Paso 1: Acceder a la Consola de Firebase
1. Ve a https://console.firebase.google.com/
2. Selecciona tu proyecto

### Paso 2: Configurar las Reglas de Firestore
1. En el menú lateral, haz clic en **"Firestore Database"**
2. Ve a la pestaña **"Reglas"** (Rules)
3. Reemplaza las reglas existentes con el siguiente código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para las notas del usuario
    // Ruta: {userId}/journal/notes/{noteId}
    match /{userId}/journal/notes/{noteId} {
      // Permitir lectura y escritura solo si el usuario está autenticado
      // y el userId coincide con el uid del usuario autenticado
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Regla por defecto: denegar todo el resto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Haz clic en **"Publicar"** (Publish)

### Paso 3: Verificar
1. Recarga tu aplicación
2. Intenta crear una nueva nota
3. El error debería desaparecer

## ¿Qué hacen estas reglas?

- **Seguridad**: Solo permiten que usuarios autenticados lean y escriban sus propias notas
- **Validación**: El `userId` en la ruta debe coincidir con el `uid` del usuario autenticado
- **Denegación por defecto**: Cualquier otra ruta está bloqueada por seguridad

## Alternativa: Reglas más permisivas (SOLO PARA DESARROLLO)

Si estás desarrollando y quieres permitir todo temporalmente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **ADVERTENCIA**: Estas reglas permiten que cualquier usuario autenticado pueda leer/escribir TODOS los documentos. NO uses esto en producción.
