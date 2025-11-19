# 💰 Sistema de Presupuestos Mensuales

## ✨ Funcionalidad Implementada

Se ha agregado un sistema completo de **Presupuestos Mensuales** que permite establecer límites de gasto por categoría y realizar seguimiento visual de tu progreso.

---

## 🎯 Características Principales

### 1. **Crear Presupuestos por Categoría**
- Selecciona cualquier categoría de gastos
- Define un monto límite
- Establece el período (mensual o anual)
- Configura el umbral de alerta (50% - 100%)

### 2. **Seguimiento Visual en Tiempo Real**
- Barra de progreso con colores dinámicos:
  - 🟢 **Verde (0-70%)**: Vas muy bien
  - 🟠 **Naranja (71-90%)**: ¡Cuidado! Te estás acercando al límite
  - 🔴 **Rojo (91-100%)**: ¡Alerta! Estás cerca del límite
  - ⛔ **Rojo oscuro (>100%)**: ¡Presupuesto excedido!

### 3. **Alertas Inteligentes**
- Notificaciones visuales cuando te acercas al límite
- Alertas configurables (por defecto al 80%)
- Indicadores de presupuestos excedidos

### 4. **Estadísticas Completas**
- Total de presupuestos activos
- Cantidad de presupuestos en riesgo
- Cantidad de presupuestos excedidos
- Progreso detallado por categoría

---

## 📱 Cómo Usar

### **Acceder a Presupuestos**

**Opción 1:** Desde la página de Gastos
- Ve a `/expenses`
- Haz clic en la tarjeta "💰 Gestiona tus Presupuestos"

**Opción 2:** Directamente
- Navega a `/budgets`

---

### **Crear un Nuevo Presupuesto**

1. Haz clic en el botón **"Nuevo Presupuesto"**
2. Completa el formulario:
   - **Categoría**: Selecciona la categoría a controlar
   - **Monto**: Define el límite de gasto
   - **Período**: Mensual o Anual
   - **Año/Mes**: Selecciona el período específico
   - **Umbral de Alerta**: Ajusta el porcentaje (50%-100%)
   - **Estado**: Activo/Desactivado
3. Haz clic en **"Crear Presupuesto"**

---

### **Editar un Presupuesto**

1. En la tarjeta del presupuesto, haz clic en el icono de **editar (✏️)**
2. Modifica los valores (excepto categoría, período, año y mes)
3. Guarda los cambios

---

### **Eliminar un Presupuesto**

1. Haz clic en el icono de **eliminar (🗑️)** en la tarjeta
2. Confirma la eliminación

---

## 🎨 Componentes Creados

### **Archivos Nuevos**

```
src/
├── constants/
│   └── budgets.js                    # Constantes de presupuestos
├── store/
│   └── budgets/
│       ├── budgetsSlice.js          # Redux slice
│       └── thunks.js                # Operaciones asíncronas
├── services/
│   └── localStorage.service.js      # ✏️ Métodos de presupuestos añadidos
└── expenses/
    ├── components/
    │   ├── BudgetProgressBar.jsx    # Barra de progreso
    │   ├── BudgetCard.jsx           # Tarjeta de presupuesto
    │   └── BudgetModal.jsx          # Modal crear/editar
    └── pages/
        └── BudgetsPage.jsx          # Página principal
```

---

## 🔧 Estructura de un Presupuesto

```javascript
{
  id: "budget_1234567890_abc123",
  categoryId: "alimentacion",
  amount: 5000,
  period: "monthly",  // "monthly" | "yearly"
  year: 2025,
  month: 10,          // null si es anual
  alertThreshold: 80, // Alertar al 80%
  enabled: true,      // Activo/Desactivado
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

---

## 🎯 Lógica de Cálculo

El sistema calcula automáticamente:

1. **Total Gastado**: Suma de transacciones de la categoría en el período
2. **Porcentaje Usado**: `(gastado / presupuesto) * 100`
3. **Estado**: Basado en el porcentaje
4. **Restante**: `presupuesto - gastado`

**Filtrado de transacciones:**
- Solo cuenta transacciones tipo `expense`
- Debe coincidir la categoría
- Debe estar dentro del período (año/mes)

---

## 🚨 Sistema de Alertas

### **Niveles de Alerta**

| Estado | Rango | Color | Mensaje |
|--------|-------|-------|---------|
| **SAFE** | 0-70% | 🟢 Verde | Vas muy bien |
| **WARNING** | 71-90% | 🟠 Naranja | ¡Cuidado! Te estás acercando al límite |
| **DANGER** | 91-100% | 🔴 Rojo | ¡Alerta! Estás cerca del límite |
| **EXCEEDED** | >100% | ⛔ Rojo oscuro | ¡Presupuesto excedido! |

---

## 💾 Persistencia

- **LocalStorage**: Los presupuestos se guardan automáticamente en el navegador
- **Sincronización**: Al cerrar sesión, se limpian los datos
- **Recuperación**: Al iniciar sesión, se cargan desde localStorage

---

## 📊 Ejemplo de Uso

### **Caso: Controlar Gastos en Alimentación**

1. Creas un presupuesto:
   - Categoría: Alimentación 🍔
   - Monto: $5,000 MXN
   - Período: Mensual (Noviembre 2025)
   - Alerta: 80%

2. Durante el mes, registras gastos:
   - Día 5: Supermercado $1,500
   - Día 12: Restaurante $800
   - Día 20: Café $200
   - **Total: $2,500 (50% del presupuesto)**
   - Estado: 🟢 **Vas muy bien**

3. Sigues gastando:
   - Día 25: Supermercado $1,800
   - **Total: $4,300 (86% del presupuesto)**
   - Estado: 🟠 **¡Cuidado! Te estás acercando al límite**
   - ⚠️ **Alerta activada** (superaste el 80%)

4. Final del mes:
   - Más gastos: +$1,200
   - **Total: $5,500 (110% del presupuesto)**
   - Estado: ⛔ **¡Presupuesto excedido!**
   - Excedido por: $500

---

## 🔄 Integración con el Sistema

### **Conexión con Redux**

```javascript
// Obtener presupuestos
const { budgets } = useSelector(state => state.budgets);

// Crear presupuesto
dispatch(startNewBudget(budgetData));

// Actualizar presupuesto
dispatch(startUpdatingBudget(updatedBudget));

// Eliminar presupuesto
dispatch(startDeletingBudget());
```

### **Rutas**

- `/budgets` - Página principal de presupuestos
- `/expenses` - Página de gastos (con acceso rápido a presupuestos)

---

## ✅ Validaciones

El sistema valida:

- ✅ No duplicar presupuestos (misma categoría + período)
- ✅ Monto debe ser mayor a 0
- ✅ Categoría debe existir
- ✅ Período debe ser válido

---

## 🎓 Mejoras Futuras Sugeridas

1. **Notificaciones Push**: Alertas en tiempo real
2. **Comparación histórica**: Ver presupuestos de meses anteriores
3. **Presupuesto total**: Límite global para todas las categorías
4. **Gráficas de tendencia**: Evolución del presupuesto
5. **Exportar reportes**: PDF con análisis de presupuestos
6. **Presupuestos compartidos**: Para gastos familiares
7. **Ajuste automático**: Sugerencias basadas en historial
8. **Copiar presupuesto**: Duplicar configuración para otro mes

---

## 🐛 Solución de Problemas

### **Los presupuestos no se guardan**
- Verifica que localStorage esté habilitado en tu navegador
- Revisa la consola del navegador por errores

### **No aparecen las transacciones en el presupuesto**
- Asegúrate de que las transacciones tengan la misma categoría
- Verifica que las fechas coincidan con el período del presupuesto

### **Error al crear presupuesto**
- Verifica que no exista otro presupuesto para esa categoría en el mismo período
- Asegúrate de completar todos los campos requeridos

---

## 📖 Documentación Técnica

### **Constantes**

```javascript
// src/constants/budgets.js
BUDGET_STATUS          // Estados del presupuesto
BUDGET_COLORS          // Colores por estado
BUDGET_MESSAGES        // Mensajes por estado
BUDGET_PERIODS         // Períodos disponibles
getBudgetStatus()      // Función helper para calcular estado
```

### **Redux Actions**

```javascript
addBudget()            // Agregar presupuesto
updateBudget()         // Actualizar presupuesto
deleteBudget()         // Eliminar presupuesto
setActiveBudget()      // Establecer presupuesto activo
clearBudgetsLogout()   // Limpiar al cerrar sesión
```

### **Thunks**

```javascript
startNewBudget()         // Crear nuevo presupuesto
startUpdatingBudget()    // Actualizar presupuesto
startDeletingBudget()    // Eliminar presupuesto
checkBudgetAlerts()      // Verificar alertas
```

---

## 🎉 ¡Listo para Usar!

Tu sistema de presupuestos está completamente configurado y listo para ayudarte a controlar tus gastos de manera efectiva.

**¡Empieza a crear presupuestos y toma control de tus finanzas! 💪💰**

---

**Fecha de implementación:** 2025-11-07
**Versión:** 1.0.0
