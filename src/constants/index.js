/**
 * Constantes globales de la aplicación
 */

// Estados de autenticación
export const AUTH_STATUS = {
  CHECKING: 'checking',
  AUTHENTICATED: 'authenticated',
  NOT_AUTHENTICATED: 'not-authenticated'
};

// Configuración de texto
export const TEXT_LIMITS = {
  TITLE_PREVIEW: 17,
  BODY_PREVIEW: 17,
  MAX_TITLE_LENGTH: 100,
  MAX_BODY_LENGTH: 10000
};

// Configuración de Cloudinary
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'dhifdqnya',
  UPLOAD_PRESET: 'react-journal',
  API_URL: 'https://api.cloudinary.com/v1_1/dhifdqnya/upload'
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NO_FILE: 'No hay archivo a subir',
  UPLOAD_FAILED: 'No se pudo subir la imagen',
  LOGIN_FAILED: 'Error al iniciar sesión',
  REGISTER_FAILED: 'Error al registrar usuario'
};

// Mensajes de error de Firebase
export const FIREBASE_ERROR_MESSAGES = {
  'auth/invalid-email': 'El formato del email es inválido',
  'auth/user-disabled': 'Este usuario ha sido deshabilitado',
  'auth/user-not-found': 'No existe usuario con este email',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
  'auth/network-request-failed': 'Error de conexión a internet',
  'default': 'Error desconocido'
};

// Configuración de storage
export const STORAGE_KEYS = {
  NOTES: 'notes',
  ACTIVE_NOTE: 'activeNote',
  EXPENSES: 'expenses',
  BUDGETS: 'budgets',
  USER_PREFERENCES: 'userPreferences'
};

// Configuración de símbolos por defecto
export const DEFAULT_SYMBOLS = ['√', 'π'];

// Configuración de roles de conversación
export const CONVERSATION_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant'
};

// Exportar constantes de gastos
export * from './expenses';

// Exportar constantes de presupuestos
export * from './budgets';

// Exportar constantes de gastos recurrentes
export * from './recurring';
