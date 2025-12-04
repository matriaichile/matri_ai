# Matri.AI - Checklist de Implementación MVP v1

> **Documento de seguimiento para las mejoras solicitadas**
> Última actualización: Diciembre 2025

---

## 📋 Estado General

| Prioridad | Total | Completadas | Pendientes |
| --------- | ----- | ----------- | ---------- |
| 🔴 Alta   | 6     | 6           | 0          |
| 🟡 Media  | 5     | 5           | 0          |
| 🟢 Baja   | 2     | 1           | 1          |

---

## ✅ Checklist de Implementación

### Fase 1: Cambios Críticos del Wizard

#### 1.1 Eliminar Pregunta de Vinculación 🔴 ✅ COMPLETADO

- [x] Eliminar paso 9 del wizard de usuarios (`involvementLevel`)
- [x] Actualizar `totalSteps` de 10 a 9 en `wizardStore.ts`
- [x] Ajustar numeración de pasos en `register/user/page.tsx`
- [x] Mantener campo en BD para compatibilidad con datos existentes
- [ ] Ocultar campo en dashboard del usuario (pendiente verificar)

**Archivos modificados:**

- `src/store/wizardStore.ts` ✅
- `src/app/register/user/page.tsx` ✅

#### 1.2 Presupuesto con Slider (Usuarios) 🔴 ✅ COMPLETADO

- [x] Crear componente `BudgetSlider.tsx`
- [x] Agregar campo `budgetAmount: number` (manteniendo `budget: string` para compatibilidad)
- [x] Implementar slider de 0 a 100.000.000 CLP
- [x] Formato con separador de miles
- [x] Actualizar validaciones
- [ ] Actualizar lógica de matchmaking (pendiente)

**Archivos creados/modificados:**

- `src/components/wizard/BudgetSlider.tsx` ✅ (NUEVO)
- `src/components/wizard/BudgetSlider.module.css` ✅ (NUEVO)
- `src/store/wizardStore.ts` ✅
- `src/store/authStore.ts` ✅
- `src/app/register/user/page.tsx` ✅
- `src/lib/firebase/firestore.ts` ✅

#### 1.3 Rango de Precios en CLP (Proveedores) 🔴 ✅ COMPLETADO

- [x] Agregar campos `priceMin` y `priceMax` a `ProviderWizardData`
- [x] Agregar campos a `ProviderProfile`
- [x] Crear componente `PriceRangeInput.tsx` con 2 inputs
- [x] Validar que `priceMax > priceMin`
- [ ] Actualizar lógica de matchmaking (pendiente)
- [x] Mantener `priceRange` para compatibilidad temporal

**Archivos creados/modificados:**

- `src/components/wizard/PriceRangeInput.tsx` ✅ (NUEVO)
- `src/components/wizard/PriceRangeInput.module.css` ✅ (NUEVO)
- `src/store/wizardStore.ts` ✅
- `src/store/authStore.ts` ✅
- `src/app/register/provider/page.tsx` ✅
- `src/lib/firebase/firestore.ts` ✅

---

### Fase 2: Mejoras de Ubicación

#### 2.1 Campo de Comuna 🟡

- [ ] Crear constante `COMUNAS` con comunas por región
- [ ] Agregar campo `comuna` a `UserWizardData` y `UserProfile`
- [ ] Implementar select dependiente (cambia al seleccionar región)
- [ ] Actualizar wizard de usuario
- [ ] Mostrar en dashboard

**Archivos a modificar:**

- `src/store/wizardStore.ts`
- `src/store/authStore.ts`
- `src/app/register/user/page.tsx`
- `src/app/dashboard/page.tsx`

---

### Fase 3: Sistema de Matches Mejorado

#### 3.1 Modal de Justificación al Rechazar 🔴 ✅ COMPLETADO

- [x] Crear componente `RejectReasonModal.tsx`
- [x] Agregar campo `rejectionReason` al tipo `Lead`
- [x] Agregar campo `rejectedAt` al tipo `Lead`
- [x] Implementar opciones predefinidas + "Otro"
- [x] Crear función `rejectLeadWithReason` en Firestore
- [x] Integrar en página de matches (dashboard y matches por categoría)

**Archivos creados/modificados:**

- `src/components/matches/RejectReasonModal.tsx` ✅ (NUEVO)
- `src/components/matches/RejectReasonModal.module.css` ✅ (NUEVO)
- `src/components/matches/index.ts` ✅ (NUEVO)
- `src/lib/firebase/firestore.ts` ✅
- `src/app/dashboard/page.tsx` ✅
- `src/app/dashboard/category/[categoryId]/matches/page.tsx` ✅

#### 3.2 Límite de 5 Proveedores cada 24 horas 🔴 ✅ COMPLETADO

- [x] Crear utilidad `matchLimits.ts` con lógica de localStorage
- [x] Implementar funciones: `canShowMoreProviders`, `registerProviderShown`, `getTimeUntilReset`
- [x] Implementar `formatTimeUntilReset`, `getRemainingSlots`, `unregisterProviderShown`
- [x] Crear componente `ShowMoreButton.tsx`
- [x] Integrar en página de matches por categoría
- [x] Mostrar mensaje cuando se alcanza el límite
- [x] Mostrar tiempo restante para reset
- [x] Crear función `generateNewMatchForUser` en Firestore

**Archivos creados:**

- `src/utils/matchLimits.ts` ✅ (NUEVO)
- `src/components/matches/ShowMoreButton.tsx` ✅ (NUEVO)
- `src/components/matches/ShowMoreButton.module.css` ✅ (NUEVO)

---

### Fase 4: Métricas y Orden

#### 4.1 Métricas de Proveedor 🟡 ✅ COMPLETADO (Backend)

- [x] Agregar tipo `ProviderMetrics` a `authStore.ts`
- [x] Agregar campo `metrics` a `ProviderProfile`
- [x] Crear funciones para incrementar métricas en Firestore
- [x] Crear `incrementProviderMetric`, `incrementTimesOffered`
- [x] Crear `approveLeadWithMetrics` (incrementa `timesInterested`)
- [x] Integrar en `rejectLeadWithReason` (incrementa `timesNotInterested`)
- [ ] Incrementar `timesOffered` al generar matches (pendiente)
- [ ] Mostrar métricas en dashboard del proveedor (pendiente UI)

**Archivos modificados:**

- `src/store/authStore.ts` ✅
- `src/lib/firebase/firestore.ts` ✅

#### 4.2 Reordenar Categorías 🟡 ✅ COMPLETADO

- [x] Actualizar `ALL_CATEGORIES` con nuevo orden
- [x] Actualizar `PRIORITY_CATEGORIES`
- [x] Actualizar `PROVIDER_CATEGORIES`
- [x] Agregar categoría `entertainment` (pendiente encuestas del cliente)
- [x] Agregar categoría `dress` (vestuario)
- [x] Actualizar `CATEGORY_INFO` con nuevas categorías
- [x] Actualizar tipo `CategoryId`

**Nuevo orden implementado:**

1. Banquetería (catering)
2. Centro de Eventos (venue)
3. Fotografía (photography)
4. Video (video)
5. DJ/VJ (dj)
6. Decoración (decoration)
7. Entretenimiento (entertainment) - NUEVA
8. Maquillaje (makeup)
9. Vestuario (dress) - NUEVA
10. Wedding Planner (wedding_planner)

**Archivos modificados:**

- `src/store/authStore.ts` ✅
- `src/store/wizardStore.ts` ✅

---

### Fase 5: Funcionalidades Pospuestas (Para Después del MVP)

#### 5.1 Portafolio de Fotos y Videos (5-10 elementos) 🟡 ✅ COMPLETADO

> **Decisión técnica implementada:**
>
> - ✅ Usar **Cloudflare R2** (bucket S3-compatible, sin egress fees)
> - ✅ Servir medios públicamente a través de **Cloudflare Workers Proxy**
> - ✅ Bucket creado: `matrimatch-media`
> - ✅ Custom domain configurado: `www.matrimatch.cl`
>
> **Especificaciones implementadas:**
>
> - Límite de peso por archivo: **10MB máximo** (imágenes y videos)
> - Mínimo 5 elementos recomendado, máximo 10 por proveedor
> - Formatos de imagen permitidos: JPG, PNG, WebP
> - Formatos de video permitidos: MP4, WebM, MOV
> - Compresión automática de imágenes en cliente (canvas resize)
> - Streaming de video con soporte de Range requests
> - Reproductor de video integrado con controles (play/pause, volumen, fullscreen)
> - Drag & drop para reordenar elementos

**Tareas completadas:**

- [x] Crear cuenta/bucket en Cloudflare R2 (`matrimatch-media`)
- [x] Crear Cloudflare Worker proxy con soporte de video streaming (`cloudflare-worker/r2-proxy.js`)
- [x] Crear API route para upload (`/api/upload-portfolio`)
- [x] Implementar compresión de imágenes en cliente (canvas API)
- [x] Crear componente `PortfolioUploader.tsx` con soporte de imágenes y videos
- [x] Crear componente `PortfolioGallery.tsx` con reproductor de video integrado
- [x] Agregar validación min/max en UI (5-10 elementos)
- [x] Implementar drag & drop para reordenar (nativo HTML5)
- [x] Agregar indicador de progreso de upload (XMLHttpRequest)
- [x] Integrar en dashboard de proveedor (nueva sección "Portafolio")
- [x] Mostrar galería en panel de detalles del match (integrado en ambos dashboards)
- [x] Soporte de videos con reproductor personalizado (play/pause, barra de progreso, volumen, fullscreen)

**Archivos creados:**

- `src/lib/cloudflare/r2.server.ts` - Cliente R2 para servidor
- `src/lib/cloudflare/r2.client.ts` - Funciones de upload para cliente
- `src/app/api/upload-portfolio/route.ts` - API de upload/delete/reorder
- `src/components/portfolio/PortfolioUploader.tsx` - Componente de carga
- `src/components/portfolio/PortfolioUploader.module.css` - Estilos
- `src/components/portfolio/PortfolioGallery.tsx` - Componente de galería
- `src/components/portfolio/PortfolioGallery.module.css` - Estilos
- `src/components/portfolio/index.ts` - Exports
- `cloudflare-worker/r2-proxy.js` - Worker proxy para R2

**Archivos modificados:**

- `src/store/authStore.ts` - Nuevo tipo `PortfolioImage`
- `src/lib/firebase/firestore.ts` - Función `updateProviderPortfolioImages`
- `src/components/dashboard/Sidebar.tsx` - Nueva sección "Portafolio"
- `src/app/dashboard/provider/page.tsx` - Integración del portafolio
- `src/app/dashboard/provider/page.module.css` - Estilos de sección

**Configuración pendiente (manual):**

- [ ] Configurar variables de entorno R2 en `.env.local`
- [ ] Desplegar Worker proxy en Cloudflare
- [ ] Configurar CORS policy en R2 bucket

#### 5.2 Badges de Verificación 🟢 ✅ COMPLETADO (Básico)

- [x] Agregar campo `isVerified` a `ProviderProfile`
- [x] Crear UI en admin para toggle de verificación (solo super admin)
- [x] Mostrar badge verificado en tabla de proveedores del admin
- [ ] Mostrar badges en cards de match (pendiente UI en dashboard de usuario)

---

### Fase 6: Panel Admin

#### 6.1 Métricas en Panel Admin 🟡 ✅ COMPLETADO

- [x] Agregar columnas de métricas en tabla de proveedores
- [x] Mostrar: Veces ofrecido, Me interesa, No me interesa, Tasa de conversión
- [x] Agregar badge de verificación con toggle (solo super admin)
- [x] Crear función `updateProviderVerification` en admin-firestore
- [x] Agregar campo `isVerified` a `ProviderProfile`

**Archivos modificados:**

- `src/app/admin/page.tsx` ✅
- `src/app/admin/page.module.css` ✅
- `src/lib/firebase/admin-firestore.ts` ✅
- `src/store/authStore.ts` ✅

---

### Fase 7: Nuevas Categorías (Pendiente Info del Cliente)

#### 7.1 Categoría Entretenimiento 🔴 - BLOQUEADO

> ⏳ **Esperando**: Preguntas del cliente para usuarios y proveedores

- [ ] Recibir preguntas del cliente
- [ ] Crear archivo `entertainment.ts` en surveys
- [ ] Agregar a `CATEGORY_SURVEYS`
- [ ] Agregar a `ALL_CATEGORIES`

#### 7.2 Categoría Vestuario 🟢

- [ ] Crear archivo `dress.ts` en surveys
- [ ] Definir preguntas para usuarios
- [ ] Definir preguntas para proveedores
- [ ] Agregar a `CATEGORY_SURVEYS`
- [ ] Agregar a `ALL_CATEGORIES`

---

## 📝 Notas de Implementación

### Migración de Datos

Para campos que cambian de tipo (ej: `budget` de string a number):

1. Agregar nuevo campo sin eliminar el anterior
2. Actualizar UI para usar nuevo campo
3. Script de migración para datos existentes
4. Deprecar campo antiguo en siguiente versión

### Consideraciones de Matchmaking

- Comparar `userBudget` con rango del proveedor `[priceMin, priceMax]`
- Match perfecto si: `priceMin <= userBudget <= priceMax`
- Score parcial si está cerca del rango (±20%)

### Sistema de Límite 24h

- Implementación 100% local con localStorage
- No requiere cron jobs ni backend adicional
- Reset automático al entrar a la página después de 24h
- Los matches "Me interesa" NO cuentan contra el límite

---

## 🧪 Testing Checklist

- [ ] Registro de usuario con nuevo slider de presupuesto
- [ ] Registro de proveedor con rango de precios CLP
- [ ] Edición de perfil usuario (sin campo vinculación)
- [ ] Sistema de matches respeta límite 24h
- [ ] Modal de justificación guarda motivo en BD
- [ ] Métricas de proveedor se actualizan correctamente
- [ ] Nuevo orden de categorías se refleja en toda la app

---

_Checklist creado: Diciembre 2025_
_Versión: MVP 1.1_
