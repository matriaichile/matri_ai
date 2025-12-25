# Matri.AI - Documento de Mejoras MVP v1

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Mejoras de Proveedores](#2-mejoras-de-proveedores)
3. [Mejoras de Usuarios (Novios)](#3-mejoras-de-usuarios-novios)
4. [Sistema de Matches - Flujo Mejorado](#4-sistema-de-matches---flujo-mejorado)
5. [Dashboard Administrador - Métricas](#5-dashboard-administrador---métricas)
6. [Orden de Categorías](#6-orden-de-categorías)
7. [Mini Encuestas Pendientes](#7-mini-encuestas-pendientes)
8. [Implementación Técnica](#8-implementación-técnica)

---

## 1. Resumen Ejecutivo

Este documento detalla los ajustes solicitados para el MVP de Matri.AI. Cada punto incluye:
- Descripción del cambio
- Estado actual vs. Estado deseado
- Archivos a modificar
- Prioridad de implementación

### Prioridades

| Prioridad | Descripción |
|-----------|-------------|
| 🔴 Alta | Funcionalidad crítica o bloqueante |
| 🟡 Media | Mejora importante de UX |
| 🟢 Baja | Nice-to-have |

---

## 2. Mejoras de Proveedores

### 2.1 Rango de Precios en CLP 🔴

**Estado Actual:**
- Campo `priceRange` con opciones: "económico", "rango medio", "premium", "de lujo"
- Definido en `src/store/wizardStore.ts` como `PRICE_RANGES_PROVIDER`

**Estado Deseado:**
- Dos campos numéricos: `priceMin` y `priceMax` en CLP
- Rango sugerido: 0 - 100.000.000 CLP
- Formato de visualización con separador de miles

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/store/wizardStore.ts` | Agregar campos `priceMin` y `priceMax` a `ProviderWizardData` |
| `src/store/authStore.ts` | Agregar campos al tipo `ProviderProfile` |
| `src/app/register/provider/page.tsx` | Modificar paso de precios con 2 inputs numéricos |
| `src/app/dashboard/provider/page.tsx` | Mostrar rango de precios en formato CLP |
| `src/lib/firebase/firestore.ts` | Actualizar funciones de guardado/lectura |
| `src/lib/matching/` | Actualizar lógica de matchmaking para comparar rangos |

**Estructura de Datos Nueva:**

```typescript
interface ProviderProfile {
  // ... campos existentes
  priceMin: number;  // Precio mínimo en CLP
  priceMax: number;  // Precio máximo en CLP
  // priceRange: string; // DEPRECAR - mantener por compatibilidad temporal
}
```

**Validaciones:**
- `priceMin` debe ser >= 0
- `priceMax` debe ser > `priceMin`
- Ambos campos obligatorios

---

### 2.2 Portafolio de Fotos (5-10 imágenes) 🟡

**Estado Actual:**
- Campo `portfolioImages: string[]` existe pero sin límite definido en UI

**Estado Deseado:**
- Mínimo 5 fotos, máximo 10 fotos
- Mostrar galería en perfil del proveedor visible para novios
- Permitir reordenar fotos (drag & drop)

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/app/register/provider/page.tsx` | Agregar validación min/max en upload |
| `src/app/dashboard/provider/page.tsx` | Sección de gestión de portafolio |
| `src/components/providers/PortfolioGallery.tsx` | **NUEVO** - Componente galería |
| `src/app/dashboard/category/[categoryId]/matches/page.tsx` | Mostrar galería en panel de detalles |

**UI Sugerida:**
- Grid de imágenes con preview
- Botón "Agregar foto" (deshabilitado si ya hay 10)
- Indicador de progreso: "5/10 fotos mínimas"
- Drag & drop para reordenar

---

### 2.3 Botón de Cerrar Sesión ✅ RESUELTO

**Estado:** El botón de logout ya existe y funciona en el sidebar izquierdo del dashboard de proveedores.

**Ubicación:** Parte inferior del menú lateral izquierdo.

---

### 2.4 Contador de Matches (Métricas de Proveedor) 🟡

**Estado Actual:**
- Se registran leads pero no se muestran métricas detalladas al proveedor

**Estado Deseado:**
- Mostrar en dashboard del proveedor:
  - Cuántas veces fue "ofrecido" (apareció en resultados de match)
  - Cuántas veces marcaron "Me interesa"
  - Cuántas veces marcaron "No me interesa"

**Campos Nuevos en ProviderProfile:**

```typescript
interface ProviderProfile {
  // ... campos existentes
  metrics: {
    timesOffered: number;      // Veces que apareció como match
    timesInterested: number;   // Veces que marcaron "Me interesa"
    timesNotInterested: number; // Veces que marcaron "No me interesa"
  };
}
```

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/store/authStore.ts` | Agregar tipo `ProviderMetrics` |
| `src/lib/firebase/firestore.ts` | Funciones para incrementar métricas |
| `src/app/dashboard/provider/page.tsx` | Mostrar tarjetas de métricas |
| `src/app/dashboard/category/[categoryId]/matches/page.tsx` | Incrementar `timesOffered` al generar matches |

---

### 2.5 Badges de Verificación 🟢

**Estado Actual:**
- No existe sistema de badges

**Estado Deseado:**
- Admin puede otorgar badges como:
  - "Proveedor Verificado" ✓
  - "Destacado" ⭐
  - "Top Performer" 🏆

**Campos Nuevos:**

```typescript
interface ProviderProfile {
  // ... campos existentes
  badges: string[]; // ['verified', 'featured', 'top_performer']
}
```

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/store/authStore.ts` | Agregar campo `badges` |
| `src/app/admin/page.tsx` | UI para asignar badges |
| `src/components/providers/BadgeDisplay.tsx` | **NUEVO** - Mostrar badges |
| `src/app/dashboard/category/[categoryId]/matches/page.tsx` | Mostrar badges en cards |

---

## 3. Mejoras de Usuarios (Novios)

### 3.1 Presupuesto con Slider 🔴

**Estado Actual:**
- Campo `budget` con rangos predefinidos en `BUDGET_RANGES`
- Select con opciones como "Menos de $5.000.000", "$5.000.000 - $10.000.000", etc.

**Estado Deseado:**
- Barra deslizante (slider) de 0 a 100.000.000 CLP
- Usuario puede mover cursor libremente
- Mostrar valor seleccionado en tiempo real

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/store/wizardStore.ts` | Cambiar `budget: string` a `budget: number` |
| `src/store/authStore.ts` | Actualizar tipo en `UserProfile` |
| `src/app/register/user/page.tsx` | Reemplazar select por slider component |
| `src/components/wizard/BudgetSlider.tsx` | **NUEVO** - Componente slider |
| `src/lib/matching/` | Actualizar lógica de matchmaking |

**Componente Slider:**

```typescript
interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;      // default: 0
  max?: number;      // default: 100_000_000
  step?: number;     // default: 500_000 (incrementos de 500k)
  formatValue?: (v: number) => string; // Formato CLP
}
```

**Consideraciones de Matchmaking:**
- Comparar `userBudget` con rango del proveedor `[priceMin, priceMax]`
- Match si: `priceMin <= userBudget <= priceMax`
- Score parcial si está cerca del rango

---

### 3.2 Campo de Comuna 🟡

**Estado Actual:**
- Solo campo `region` (regiones de Chile)

**Estado Deseado:**
- Agregar campo `comuna` adicional
- Idealmente: select dependiente de la región seleccionada

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/store/wizardStore.ts` | Agregar campo `comuna` y constante `COMUNAS` |
| `src/store/authStore.ts` | Agregar a `UserProfile` |
| `src/app/register/user/page.tsx` | Agregar select de comuna después de región |
| `src/app/dashboard/page.tsx` | Mostrar comuna en perfil |

**Estructura de Datos:**

```typescript
// En wizardStore.ts
export const COMUNAS: Record<string, WizardOption[]> = {
  rm: [
    { id: 'santiago', label: 'Santiago' },
    { id: 'providencia', label: 'Providencia' },
    { id: 'las_condes', label: 'Las Condes' },
    // ... más comunas
  ],
  valparaiso: [
    { id: 'valparaiso', label: 'Valparaíso' },
    { id: 'vina_del_mar', label: 'Viña del Mar' },
    // ... más comunas
  ],
  // ... otras regiones
};
```

---

### 3.3 Eliminar Pregunta de Vinculación 🔴

**Estado Actual:**
- Paso 8 del wizard: "¿Qué tan involucrados quieren estar en la organización?"
- Campo `involvementLevel` con opciones 0-100%

**Estado Deseado:**
- Eliminar completamente esta pregunta del wizard
- Mantener campo en BD por compatibilidad (datos existentes)

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/app/register/user/page.tsx` | Eliminar paso de vinculación |
| `src/store/wizardStore.ts` | Actualizar `totalSteps` de 10 a 9 |
| `src/app/dashboard/page.tsx` | No mostrar este campo en perfil |

**Nota:** NO eliminar `involvementLevel` del tipo `UserProfile` para no romper datos existentes.

---

### 3.4 Fecha de Creación de Usuario 🟡

**Estado Actual:**
- Campo `createdAt` existe en el modelo de datos

**Estado Deseado:**
- Asegurar que `createdAt` se guarde correctamente al crear usuario
- **NO mostrar** al usuario, solo para uso interno/admin
- Usar en futuro para mostrar "Miembro desde [fecha]"

**Verificar en:**

| Archivo | Verificación |
|---------|--------------|
| `src/lib/firebase/firestore.ts` | Confirmar que `createdAt` se guarda con `serverTimestamp()` |
| `src/app/admin/page.tsx` | Mostrar fecha de creación en lista de usuarios |

---

## 4. Sistema de Matches - Flujo Mejorado

### 4.1 Acciones: "Me interesa" / "No me interesa" 🔴

**Estado Actual:**
- Botones de aprobar (corazón) y rechazar (X) existen
- Al rechazar, el match se mueve a "Descartados"

**Estado Deseado:**
- Renombrar visualmente:
  - Aprobar → "Me interesa" ❤️
  - Rechazar → "No me interesa" ✕
- Al marcar "No me interesa": mostrar modal para justificar motivo

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/app/dashboard/page.tsx` | Agregar modal de justificación |
| `src/app/dashboard/category/[categoryId]/matches/page.tsx` | Agregar modal de justificación |
| `src/lib/firebase/firestore.ts` | Guardar motivo de rechazo |
| `src/components/matches/RejectReasonModal.tsx` | **NUEVO** - Modal de justificación |

**Estructura de Datos Actualizada para Lead:**

```typescript
interface Lead {
  // ... campos existentes
  rejectionReason?: string; // Motivo si status === 'rejected'
  rejectedAt?: Timestamp;   // Fecha de rechazo
}
```

**Modal de Justificación:**
- Textarea para escribir motivo
- Opciones predefinidas (opcional):
  - "Precio fuera de presupuesto"
  - "Estilo no coincide"
  - "Ubicación no conveniente"
  - "Ya tengo proveedor para esto"
  - "Otro (especificar)"
- Botón "Enviar" para confirmar rechazo

---

### 4.2 Límite de 5 Proveedores por Categoría cada 24 horas 🔴

> ⚠️ **IMPORTANTE: Implementación 100% Local (Sin Cron Jobs)**

**Estado Actual:**
- Se muestran 3 matches iniciales por categoría
- No hay límite de cuántos nuevos proveedores se pueden ver

**Estado Deseado:**
- Máximo 5 proveedores visibles por categoría cada 24 horas
- Al rechazar un match, NO aparece automáticamente uno nuevo
- Debe aparecer botón "Mostrar nuevo proveedor" para ver siguiente
- Solo se muestran proveedores con leads disponibles

**Implementación Técnica (LocalStorage):**

```typescript
// Estructura en localStorage
interface CategoryMatchLimit {
  categoryId: string;
  providersShown: string[];  // IDs de proveedores mostrados
  lastResetTimestamp: number; // Unix timestamp de última búsqueda
}

// Key en localStorage: `matri_match_limits_${userId}`
```

**Lógica de Control:**

```typescript
// utils/matchLimits.ts
const MATCH_LIMIT_PER_CATEGORY = 5;
const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas

function getMatchLimits(userId: string, categoryId: string): CategoryMatchLimit {
  const key = `matri_match_limits_${userId}`;
  const stored = localStorage.getItem(key);
  const limits = stored ? JSON.parse(stored) : {};
  
  const categoryLimit = limits[categoryId] || {
    categoryId,
    providersShown: [],
    lastResetTimestamp: Date.now()
  };
  
  // Verificar si pasaron 24 horas - RESET automático
  if (Date.now() - categoryLimit.lastResetTimestamp >= RESET_INTERVAL_MS) {
    categoryLimit.providersShown = [];
    categoryLimit.lastResetTimestamp = Date.now();
    saveMatchLimits(userId, categoryId, categoryLimit);
  }
  
  return categoryLimit;
}

function canShowMoreProviders(userId: string, categoryId: string): boolean {
  const limits = getMatchLimits(userId, categoryId);
  return limits.providersShown.length < MATCH_LIMIT_PER_CATEGORY;
}

function registerProviderShown(userId: string, categoryId: string, providerId: string): void {
  const limits = getMatchLimits(userId, categoryId);
  if (!limits.providersShown.includes(providerId)) {
    limits.providersShown.push(providerId);
    saveMatchLimits(userId, categoryId, limits);
  }
}

function getRemainingSlots(userId: string, categoryId: string): number {
  const limits = getMatchLimits(userId, categoryId);
  return MATCH_LIMIT_PER_CATEGORY - limits.providersShown.length;
}

function getTimeUntilReset(userId: string, categoryId: string): number {
  const limits = getMatchLimits(userId, categoryId);
  const elapsed = Date.now() - limits.lastResetTimestamp;
  return Math.max(0, RESET_INTERVAL_MS - elapsed);
}
```

**Archivos a Crear/Modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/utils/matchLimits.ts` | **NUEVO** - Funciones de control de límites |
| `src/app/dashboard/category/[categoryId]/matches/page.tsx` | Integrar lógica de límites |
| `src/components/matches/ShowMoreButton.tsx` | **NUEVO** - Botón "Mostrar nuevo proveedor" |

**Flujo de Usuario:**

1. Usuario entra a categoría → Ve hasta 3 matches iniciales (o menos si no hay)
2. Usuario rechaza match → Match se oculta, aparece mensaje:
   - "Has visto X de 5 proveedores hoy"
   - Botón: "Mostrar nuevo proveedor" (si quedan slots)
3. Si ya vio 5 proveedores:
   - Mensaje: "Has alcanzado el límite de 5 proveedores para hoy"
   - "Podrás ver más proveedores en X horas"
4. Después de 24 horas → Reset automático al entrar a la página

**Consideraciones:**
- Los matches ya marcados como "Me interesa" NO cuentan contra el límite
- Solo cuenta proveedores que el usuario ha VISTO (pendientes + rechazados)
- El reset es por categoría, no global

---

## 5. Dashboard Administrador - Métricas

### 5.1 Métricas de Proveedores 🟡

**Estado Deseado:**
Mostrar para cada proveedor en el panel admin:

| Métrica | Descripción |
|---------|-------------|
| Veces ofrecido | Cuántas veces apareció como match |
| "Me interesa" recibidos | Usuarios que marcaron interés |
| "No me interesa" recibidos | Usuarios que rechazaron |
| Tasa de conversión | (Me interesa / Veces ofrecido) × 100 |

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/app/admin/page.tsx` | Agregar columnas de métricas en tabla de proveedores |
| `src/lib/firebase/firestore.ts` | Funciones para obtener métricas agregadas |

**Vista Sugerida:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ Proveedores                                                          │
├─────────────────────────────────────────────────────────────────────┤
│ Nombre          │ Categoría  │ Ofrecido │ Interés │ Rechazo │ Conv. │
├─────────────────────────────────────────────────────────────────────┤
│ Foto Studio Pro │ Fotografía │    45    │   12    │   28    │ 27%   │
│ DJ Master       │ DJ/VJ      │    32    │    8    │   15    │ 25%   │
│ Banquetes Gourm │ Banquetería│    28    │   15    │    5    │ 54%   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Orden de Categorías

### 6.1 Nuevo Orden por Importancia 🟡

**Estado Actual:**
```typescript
// En authStore.ts
export const ALL_CATEGORIES: CategoryId[] = [
  'photography',
  'video',
  'dj',
  'catering',
  'venue',
  'decoration',
  'wedding_planner',
  'makeup',
];
```

**Estado Deseado:**

```typescript
export const ALL_CATEGORIES: CategoryId[] = [
  'catering',        // 1. Banquetera
  'venue',           // 2. Centro de eventos
  'photography',     // 3. Fotografía
  'video',           // 4. Video
  'dj',              // 5. DJ/VJ
  'decoration',      // 6. Decoración
  'entertainment',   // 7. Entretenimiento (NUEVA)
  'makeup',          // 8. Maquillaje
  'dress',           // 9. Vestuario (NUEVA)
  'wedding_planner', // 10. Wedding Planner
];
```

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/store/authStore.ts` | Reordenar `ALL_CATEGORIES` y agregar nuevas |
| `src/store/wizardStore.ts` | Actualizar `PRIORITY_CATEGORIES` y `PROVIDER_CATEGORIES` |
| `src/lib/surveys.ts` | Agregar configuración para nuevas categorías |

---

## 7. Mini Encuestas Pendientes

### 7.1 Categoría: Entretenimiento 🔴

**Estado:** Pendiente de recibir preguntas del cliente.

**Acción Requerida:**
- Cliente debe enviar listado de preguntas para usuarios
- Cliente debe enviar listado de preguntas para proveedores

**Estructura Esperada:**

```typescript
// En CATEGORY_SURVEYS (src/lib/surveys.ts)
entertainment: {
  userQuestions: [
    // Preguntas para novios sobre entretenimiento
  ],
  providerQuestions: [
    // Preguntas para proveedores de entretenimiento
  ],
  matchingCriteria: {
    // Criterios de match específicos
  }
}
```

---

### 7.2 Categoría: Vestuario 🟢

**Estado:** Nueva categoría a agregar.

**Incluye:**
- Vestidos de novia
- Trajes de novio
- Accesorios

---

## 8. Implementación Técnica

### 8.1 Plan de Migración de Datos

Para campos que cambian de tipo (ej: `budget` de string a number):

1. Agregar nuevo campo (`budgetAmount`) sin eliminar el anterior
2. Actualizar UI para usar nuevo campo
3. Script de migración para datos existentes
4. Deprecar campo antiguo en siguiente versión

### 8.2 Orden de Implementación Sugerido

| Fase | Items | Prioridad |
|------|-------|-----------|
| 1 | Eliminar pregunta vinculación, Cerrar sesión (verificar) | 🔴 |
| 2 | Rango precios CLP (proveedores), Presupuesto slider (usuarios) | 🔴 |
| 3 | Sistema de límite 24h con localStorage | 🔴 |
| 4 | Modal de justificación al rechazar | 🔴 |
| 5 | Campo comuna, Métricas de proveedor | 🟡 |
| 6 | Portafolio 5-10 fotos, Badges | 🟡 |
| 7 | Reorden de categorías | 🟡 |
| 8 | Nueva categoría Entretenimiento (cuando lleguen preguntas) | 🔴 |
| 9 | Nueva categoría Vestuario | 🟢 |

### 8.3 Testing Checklist

- [ ] Registro de usuario con nuevo slider de presupuesto
- [ ] Registro de proveedor con rango de precios CLP
- [ ] Edición de perfil usuario (sin campo vinculación)
- [ ] Sistema de matches respeta límite 24h
- [ ] Modal de justificación guarda motivo en BD
- [ ] Métricas de proveedor se actualizan correctamente
- [ ] Badges se muestran en cards de match
- [ ] Galería de portafolio funciona (min 5, max 10)

---

## Anexo A: Análisis de Sistema de Evaluaciones

> **Decisión: Posponer implementación de reviews/estrellas**

### Problema Identificado

Sin verificación de pagos integrada, un sistema de evaluaciones sería vulnerable a fraude:
- Proveedores podrían crear cuentas falsas para auto-calificarse
- No hay forma de verificar si una contratación realmente ocurrió

### Alternativas Implementadas

En lugar de reviews, se implementarán:

1. ✅ **Contador de matches** - Métrica verificable desde BD
2. ✅ **Badges de verificación** - Otorgados manualmente por admin
3. ✅ **Portafolio de trabajos** - Fotos reales del proveedor
4. ❌ **Antigüedad en plataforma** - Descartado por solicitud del cliente

### Condiciones para Futura Implementación

El sistema de evaluaciones será viable cuando exista:
- Integración de pagos (procesamiento de transacciones)
- Sistema de reservas confirmadas por ambas partes

---

*Documento creado: Diciembre 2025*
*Versión: MVP 1.1 - Mejoras solicitadas por cliente*











