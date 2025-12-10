# Matri.AI - Correcciones Cliente V3

## Documento de Cambios Implementados

**Fecha:** Diciembre 2025  
**Estado:** ✅ IMPLEMENTADO  
**Versión:** 3.3 (Actualización 10 de Diciembre)

---

## Resumen de Cambios Implementados

Este documento detalla los cambios solicitados por el cliente y su estado de implementación.

### Última Actualización (V3.3) - 10 Diciembre 2025

| #   | Cambio                                                                      | Estado |
| --- | --------------------------------------------------------------------------- | ------ |
| 1   | "Mis Matches" solo muestra categorías con encuestas completadas             | ✅     |
| 2   | Fix tema oscuro: badge de categoría del proveedor ahora se ve correctamente | ✅     |
| 3   | Límite de 3 proveedores activos por categoría (approved + pending)          | ✅     |
| 4   | Modal cuando intenta exceder límite de 3 proveedores activos                | ✅     |

### Actualización Anterior (V3.2) - 9 Diciembre 2025

| #   | Cambio                                                                 | Estado |
| --- | ---------------------------------------------------------------------- | ------ |
| 1   | Email de contacto actualizado a matrimatch.chile@gmail.com (dashboard) | ✅     |
| 2   | Eliminada pregunta de rango de precios del registro de proveedor       | ✅     |
| 3   | Contador "Me interesa/No me interesa" ahora cuenta decisión final      | ✅     |
| 4   | Estado (Aprobado/Rechazado) visible en leads recientes                 | ✅     |
| 5   | Estado del lead visible en popup + formato fecha DD-MM-AAAA            | ✅     |
| 6   | Nueva sección "Disponibilidad" con calendario de bloqueo               | ✅     |
| 7   | Validación de disponibilidad en matching (solo si fecha exacta)        | ✅     |
| 8   | Filtros de leads: por estado y por fecha de evento                     | ✅     |

### Actualización Anterior (V3.1) - 9 Diciembre 2025

| #   | Cambio                                                                     | Estado |
| --- | -------------------------------------------------------------------------- | ------ |
| 1   | Email de contacto actualizado a matrimatch.chile@gmail.com                 | ✅     |
| 2   | Sección Categorías: Tus prioridades + Otras en progreso + DEMÁS CATEGORÍAS | ✅     |
| 3   | Contador de matches muestra x/5 (cantidad real, no 0/5)                    | ✅     |
| 4   | Mis Matches: primero aprobados (te interesan), luego pendientes            | ✅     |
| 5   | Límite de 3 opciones iniciales + máximo 2 extras                           | ✅     |
| 6   | Número de leads unificado en bandeja de entrada                            | ✅     |
| 7   | Badge amarillo no cuenta rechazados                                        | ✅     |
| 8   | Badge de verificación: texto "Proveedor verificado" en azul                | ✅     |

---

### Leyenda de Estados

| Estado | Descripción                                    |
| ------ | ---------------------------------------------- |
| ✅     | Implementado completamente                     |
| ⚠️     | Implementado parcialmente / Requiere revisión  |
| ⏳     | Pendiente de implementación                    |
| ❌     | No implementado (excluido o requiere decisión) |

---

## 1. Terminología

### 1.1 Reemplazar "wizard" por términos más adecuados ✅

**Cambio realizado:**

- "wizard" → "cuestionario" en todas las referencias de la landing page
- Archivos modificados:
  - `src/components/landing/HowItWorks.tsx`
  - `src/components/landing/HowItWorksSteps.tsx`

### 1.2 Cambiar "dashboard" por "Volver al inicio" ✅

**Cambio realizado:**

- "Volver al dashboard" → "Volver al inicio" en botones de navegación
- Archivo modificado: `src/app/dashboard/category/[categoryId]/matches/page.tsx`

---

## 2. Flujo Usuario / Proveedor

### 2.1 Crear versión equivalente para proveedores con switch ✅

**Estado:** Ya implementado

**Funcionalidad existente:**

- Ya existe una landing page separada para proveedores (`/proveedores`)
- Ya existe un flujo de registro separado para proveedores (`/register/provider`)
- Ya existe navegación entre vistas de Novios y Proveedores en la landing page
- El sistema ya diferencia completamente entre usuarios (novios) y proveedores

---

## 3. Pantalla Inicial

### 3.1 Números más legibles ⚠️

**Estado:** Revisión pendiente - Los estilos de opacidad dependen del CSS específico de cada componente.

### 3.2 Agregar "Faltan X días" en contadores ✅

**Cambio realizado:**

- Actualizado el texto del countdown para mostrar "Faltan días" en lugar de solo "días"
- Archivo modificado: `src/app/dashboard/page.tsx`

### 3.3 Cambiar texto principal ✅

**Cambio realizado:**

- "Planifica la boda perfecta, sin el estrés." → "Planifica tu boda perfecta, sin estrés."
- Archivo modificado: `src/components/landing/NoviosHero.tsx`

---

## 4. Contacto

### 4.1 Formulario de contacto interno ❌

**Estado:** NO IMPLEMENTADO (por recomendación)

**Justificación del desarrollador:**

- Agregar un sistema de mensajería interna aumenta significativamente la complejidad del sistema
- Potenciales costos adicionales de servidor
- Los mensajes igual terminarían llegando por correo electrónico
- Para un MVP, se recomienda mantener el contacto por email directo

**Decisión requerida:** El cliente debe confirmar si desea proceder con esta implementación a pesar de las consideraciones mencionadas.

---

## 5. Sistema de Proveedores / Leads

### 5a. Lógica de visualización y mensajes

#### Mensaje cuando no hay proveedores ✅

**Cambio realizado:**

- Cuando no hay más proveedores disponibles, se muestra: "No se encontraron más proveedores disponibles"
- Componente modificado: `src/components/matches/ShowMoreButton.tsx`

#### Ocultar leads pendientes al proveedor ✅

**Cambio realizado:**

- Los proveedores ahora solo ven leads con status 'approved', 'rejected' o 'contacted'
- Los leads 'pending' ya no se muestran al proveedor
- Archivo modificado: `src/app/dashboard/provider/page.tsx`

#### Mostrar leads rechazados correctamente ✅

**Cambio realizado:**

- Las estadísticas ahora muestran "Rechazados" en lugar de "Pendientes"
- Los leads rechazados se filtran y muestran correctamente
- Archivo modificado: `src/app/dashboard/provider/page.tsx`

### 5b. Problemas de conteo ❌

**Estado:** NO SE IMPLEMENTA (ya solucionado para cuentas nuevas)

**Nota:** Este problema solo afecta a cuentas antiguas. Las cuentas nuevas calculan correctamente el total de encuestas sobre categorías prioritarias + otras categorías seleccionadas.

### 5c/10. Actualización automática al completar encuesta ✅

**Cambio realizado:**

- Al completar una encuesta de proveedor, se actualiza automáticamente el perfil en el store
- Se agregó llamada a `getProviderProfile` después de guardar la encuesta
- Archivo modificado: `src/app/dashboard/provider/category/[categoryId]/survey/page.tsx`

### 5d. Visualización dentro del lead ✅

**Cambios realizados:**

- El nombre de la pareja ahora se muestra de forma prominente en las tarjetas de leads
- Agregada clase CSS `.leadCoupleName` para destacar el nombre
- El botón "Ver detalles" se movió al footer de la tarjeta para mejor visibilidad
- Archivos modificados:
  - `src/app/dashboard/provider/page.tsx`
  - `src/app/dashboard/provider/page.module.css`

**Nota sobre "comparativa no disponible":** Este mensaje aparece cuando falta el `userSurveyId` en el lead o cuando el proveedor no ha completado la encuesta de esa categoría. El sistema funciona correctamente; el mensaje es informativo.

---

## 6. Página de Categorías

### 6.1 Mostrar solo categorías comenzadas ✅

**Cambio realizado:**

- La sección "Otras categorías" ahora solo muestra categorías que el usuario ha comenzado a completar
- Se filtran categorías basándose en `categorySurveyStatus` (solo muestra 'in_progress', 'completed', 'matches_generated')
- Archivo modificado: `src/app/dashboard/page.tsx`

---

## 7. Eliminación de Preguntas

### 7.1 Eliminar pregunta de estilos al crear proveedores ✅

**Cambio realizado:**

- Eliminado el paso 3 "¿Cuál es tu estilo?" del wizard de registro de proveedores
- El wizard de proveedores ahora tiene 5 pasos en lugar de 6
- Esta pregunta se hace de forma más específica en las encuestas por categoría
- Archivos modificados:
  - `src/app/register/provider/page.tsx`
  - `src/store/wizardStore.ts`

---

## 8. Preguntas Geográficas

### 8.1 Selección múltiple de regiones ✅

**Cambio realizado:**

- La pregunta "¿En qué zonas prestas tus servicios?" ahora permite selección múltiple
- Se agregó campo `workRegions: string[]` al store
- Se mantiene compatibilidad con campo legacy `workRegion`
- Archivos modificados:
  - `src/store/wizardStore.ts`
  - `src/app/register/provider/page.tsx`

---

## 9. DJ – Rango de Valores

### 9.1 Ampliar máximo a $15.000.000 ✅

**Cambio realizado:**

- Precio máximo DJ: $5.000.000 → $15.000.000
- Archivo modificado: `src/lib/surveys/dj.ts`

---

## 10. Encuestas Finalizadas

Ver punto 5c - mismo problema de actualización automática.

---

## 11. Casilla de número en "Mis Matches"

### 11.1 Revisar lógica del número en "mismatches" ✅

**Estado:** Revisado

**Análisis realizado:**

- El badge muestra `pendingMatches.length` que cuenta los leads con `status === 'pending'`
- La lógica es correcta: muestra cuántos matches el usuario tiene pendientes de revisar
- Si aparece un "1" cuando no debería haber nada pendiente, podría ser un problema de datos inconsistentes en la cuenta específica

**Recomendación:** Si el problema persiste en la cuenta pruebapipe@gmail.com, verificar manualmente en Firebase si hay leads con status 'pending' que no deberían estar ahí.

---

## 12. Formato Fecha

### 12.1 Formato DD MM AAAA ✅

**Cambio realizado:**

- Se creó utilidad de formateo de fechas: `src/utils/dateFormat.ts`
- Funciones disponibles:
  - `formatDateDDMMYYYY()` - Formato: 08 12 2025
  - `formatDateDash()` - Formato: 08-12-2025
  - `formatDateLong()` - Formato: 8 de diciembre de 2025
  - `formatDateShort()` - Formato: 08 dic 2025

**Nota:** El formato actual en la aplicación ya usa DD-MM-AAAA en la mayoría de lugares.

---

## 13. Nombre de Categoría "Decoración"

### 13.1 Cambiar a "Decoración & Florería" ✅

**Cambio realizado:**

- "Decoración" → "Decoración & Florería" en:
  - `CATEGORY_INFO` (nombre de categoría)
  - `CATEGORY_SURVEYS` (nombre en encuestas)
  - `PRIORITY_CATEGORIES` (categorías de usuario)
- Archivos modificados:
  - `src/lib/surveys/index.ts`
  - `src/store/wizardStore.ts`

---

## 14. SUPERADMIN

### 14.1 "editar número de leads" → "editar número de créditos" ✅

**Cambio realizado:**

- Todas las referencias a "leads" cambiadas a "créditos" en el panel de administración
- Archivo modificado: `src/app/admin/page.tsx`

### 14.2 Mostrar "créditos usados" ✅

**Cambio realizado:**

- "Leads usados" → "Créditos usados"
- Archivo modificado: `src/app/admin/page.tsx`

### 14.3 Filtros por categoría, activo/inactivo, ordenar por créditos ✅

**Cambio realizado:**

- Agregados filtros para proveedores:
  - Filtro por categoría (todas las categorías disponibles)
  - Filtro por estado (Activos, Inactivos, Verificados)
  - Ordenamiento por nombre o créditos disponibles (ascendente/descendente)
- Agregado filtro para usuarios:
  - Ordenamiento por fecha de evento (próximos primero, lejanos primero, por nombre)
- Archivos modificados:
  - `src/app/admin/page.tsx`
  - `src/app/admin/page.module.css`

### 14.4 Clarificar efecto de "VERIFICAR PROVEEDOR" ✅

**Estado:** Implementado

**Funcionalidad:**

- El botón "VERIFICAR PROVEEDOR" agrega/quita el estado `isVerified` del proveedor
- Los proveedores verificados muestran un ícono de check verde (✓) junto a su nombre en:
  - La tabla de proveedores del admin
  - El listado de matches del usuario (con badge inline)
- Solo los Super Admins pueden verificar/desverificar proveedores

### 14.5 Filtrar usuarios por fecha de evento ✅

**Cambio realizado:**

- Agregado filtro de ordenamiento por fecha de evento
- Opciones: "Próximos eventos primero", "Eventos lejanos primero", "Por nombre"
- Los eventos sin fecha definida aparecen al final
- Archivo modificado: `src/app/admin/page.tsx`

### 14.6 Mensaje "proveedores asignados a esta pareja máximo 3" ✅

**Cambio realizado:**

- Actualizado el mensaje en el modal para mostrar "(máximo 3 por categoría)"
- El modal ahora agrupa los matches por categoría
- Cada categoría muestra el conteo actual y el máximo (ej: "Fotografía (2/3 máx.)")
- Se muestra el estado del match (Interesado, Rechazado, Pendiente) junto al proveedor
- Los proveedores verificados muestran el badge de verificación
- Archivo modificado: `src/app/admin/page.tsx`

### 14.7 Máximo 3 matches por categoría ✅

**Estado:** Ya implementado correctamente

**Verificación:**

- La constante `MAX_LEADS_PER_CATEGORY = 3` está definida en `src/lib/firebase/firestore.ts`
- La función `generateMatchesForUserSurvey` siempre limita a máximo 3 leads por categoría
- La lógica usa `Math.min(maxMatches, MAX_LEADS_PER_CATEGORY)` para asegurar el límite
- Si hay más de 3 matches en alguna cuenta, son datos históricos previos a esta restricción

---

## 15. Ajustes por Categoría – Encuestas

### A. Fotografía ✅

**Cambios realizados:**

- Estilo fotográfico: 25% → 15%
- Segundo fotógrafo: 5% → 10% (+5%)
- Tiempo de entrega: 5% → 10% (+5%)
- Archivo modificado: `src/lib/surveys/photography.ts`

### B. Videografía ✅

**Cambios realizados:**

- Estilo: 25% → 10%
- Uso de dron: 5% → 10% (+5%)
- Entrega video mismo día: 5% → 10% (+5%)
- Tiempo de entrega: 5% → 10% (+5%)
- Archivo modificado: `src/lib/surveys/video.ts`

### C. DJ / VJ ✅

**Cambios realizados:**

- Estilos musicales: 25% → 10%
- Presupuesto: 20% → 25%
- Música para ceremonia: 5% → 10%
- Efectos especiales: 3% → 8%
- Archivo modificado: `src/lib/surveys/dj.ts`

### D. Banquetería ⚠️

**Estado:** Ya existe opción "bbq" (Asado) en `catering_u_cuisine`

**Nota:** La opción "Asado" ya está disponible como parte de los tipos de cocina. Si se requiere una pregunta separada específica para "Asado", por favor especificar.

### E. Centro de Eventos ✅

**Estado:** La pregunta `venue_u_type` ya permite selección múltiple (`type: 'multiple'`)

**Nota sobre Cajón del Maipo:** La encuesta actual no tiene preguntas específicas de ubicación geográfica más allá de la región. Para llegar a lugares específicos como Cajón del Maipo, se necesitaría agregar una pregunta de ubicación más granular.

### F. Decoración ⚠️

**Estado:** La pregunta `deco_u_bridal_bouquet` ("¿Necesitas ramo de novia?") existe actualmente.

**Decisión requerida:** ¿Mantener o eliminar esta pregunta?

### G. Wedding Planner ✅

Sin cambios requeridos.

### H. Peinado y Maquillaje ✅

Sin cambios requeridos.

---

## Correcciones de Encuestas Específicas

### Auto de Novios ✅

**Cambios realizados:**

- Eliminada primera pregunta (tipo de transporte para invitados)
- Eliminada tercera pregunta
- Modificada pregunta de ruta a opciones simples:
  - "Iglesia → Evento"
  - "Casa → Iglesia"
  - "Ruta completa"
- Reorganizados pesos de preguntas
- Archivo modificado: `src/lib/surveys/transport.ts`

**Nota:** Se mantiene la pregunta de horas de servicio como alternativa a las rutas, según lo sugerido.

### Vestidos y Trajes ✅

**Cambios realizados:**

- Implementada lógica condicional `dependsOn`
- Preguntas sobre vestido de novia solo aparecen si seleccionó "Vestido de novia"
- Preguntas sobre traje de novio solo aparecen si seleccionó "Traje de novio"
- Archivos modificados:
  - `src/lib/surveys/types.ts` (nuevo tipo `QuestionCondition`)
  - `src/lib/surveys/dress.ts`

**Nota:** La lógica condicional `dependsOn` está implementada en el surveyStore. Las preguntas se filtran automáticamente basándose en las respuestas anteriores.

### Invitaciones ✅

**Cambios realizados:**

- Primera pregunta (`inv_u_type`) cambiada de `single` a `multiple`
- Eliminada opción "Ambas" (redundante con selección múltiple)
- Archivo modificado: `src/lib/surveys/invitations.ts`

### Decoración ✅

**Cambios realizados - Nuevas preguntas agregadas:**

**Para usuarios:**

- `deco_u_service_types`: "¿Qué tipo de servicios de decoración necesitas?" (múltiple)
- `deco_u_cocktail_packs`: "¿Qué elementos adicionales te interesan para el cóctel o recepción?" (múltiple)

**Para proveedores:**

- `deco_p_service_types`: "¿Qué tipo de servicios ofreces?" (múltiple)
  - Opciones: Decoración completa ceremonia/recepción, decoración cóctel, ambientación temática, producción de detalles, flores/arreglos florales, iluminación decorativa, otros
- `deco_p_cocktail_packs`: "¿Ofreces packs o servicios adicionales pensados para el cóctel o recepción?" (múltiple)

  - Opciones: Fotos colgantes, quitasoles, sombreros, abanicos, decoración mesas cóctel, señalética personalizada

- Archivo modificado: `src/lib/surveys/decoration.ts`

---

## Otras Categorías

### Tortas y Dulces ❌

**Recomendación del cliente:** Eliminar categoría

**Estado:** No implementado - Requiere decisión final y migración de datos existentes

---

## Elementos Pendientes que Requieren Decisión

1. **Contacto interno:** ¿Proceder con formulario interno o mantener email?
2. **Decoración - Ramo de novia:** ¿Mantener o eliminar la pregunta?
3. **Tortas y Dulces:** ¿Confirmar eliminación de la categoría?
4. **Verificar proveedor:** ¿Qué distintivo visual mostrar?
5. **Cajón del Maipo:** ¿Agregar pregunta de ubicación específica en Centro de Eventos?

---

## Notas Técnicas

### Archivos Principales Modificados

```
src/components/landing/HowItWorks.tsx
src/components/landing/HowItWorksSteps.tsx
src/components/landing/NoviosHero.tsx
src/app/dashboard/page.tsx
src/app/dashboard/provider/page.tsx
src/app/dashboard/provider/page.module.css
src/app/dashboard/provider/category/[categoryId]/survey/page.tsx
src/app/dashboard/category/[categoryId]/matches/page.tsx
src/app/admin/page.tsx
src/app/admin/page.module.css
src/app/register/provider/page.tsx
src/store/wizardStore.ts
src/store/surveyStore.ts
src/lib/surveys/index.ts
src/lib/surveys/types.ts
src/lib/surveys/dj.ts
src/lib/surveys/photography.ts
src/lib/surveys/video.ts
src/lib/surveys/transport.ts
src/lib/surveys/dress.ts
src/lib/surveys/decoration.ts
src/lib/surveys/invitations.ts
src/components/matches/ShowMoreButton.tsx
src/utils/dateFormat.ts (nuevo)
```

### Lógica Condicional Implementada

El sistema de preguntas condicionales (`dependsOn`) está completamente implementado:

1. ✅ Función `shouldShowQuestion()` evalúa si una pregunta debe mostrarse
2. ✅ El store filtra preguntas dinámicamente basándose en las respuestas
3. ✅ Al cambiar una respuesta, se recalculan las preguntas visibles
4. ✅ Los campos ocultos no afectan la validación

Archivos clave:

- `src/lib/surveys/types.ts` - Define `QuestionCondition`
- `src/store/surveyStore.ts` - Implementa la lógica de filtrado

---

## Cambios V3.1 - Detalle Técnico (9 Diciembre 2025)

### 1. Email de Contacto ✅

**Archivo:** `src/components/landing/Footer.tsx`

**Cambio:** Email actualizado de `hola@matrimatch.com` a `matrimatch.chile@gmail.com`

---

### 2. Sección Categorías - Panel Novios ✅

**Archivo:** `src/app/dashboard/page.tsx`

**Cambios:**

- Se muestran ahora 3 secciones:
  1. **Tus prioridades** - Categorías prioritarias del usuario
  2. **Otras categorías en progreso** - Categorías que ha comenzado pero no son prioritarias
  3. **Demás categorías** - TODAS las categorías restantes (aunque no haya respondido nada)

---

### 3. Contador de Matches ✅

**Archivos:**

- `src/components/matches/ShowMoreButton.tsx`
- `src/utils/matchLimits.ts`

**Cambio:** El contador ahora muestra `x/5` donde `x` es la cantidad real de matches (leads) que tiene el usuario, no siempre 0/5. Solo muestra 0/5 cuando se reinician los matches cada 24 horas.

---

### 4. Orden de Matches ✅

**Archivo:** `src/app/dashboard/category/[categoryId]/matches/page.tsx`

**Cambio:** Los matches ahora se muestran en este orden:

1. **Proveedores de interés** (aprobados) - Lo más importante
2. **Posibles matches** (pendientes)
3. **Descartados** (rechazados)

---

### 5. Límite de Opciones ✅

**Archivos:**

- `src/utils/matchLimits.ts` - Nuevas constantes `INITIAL_MATCHES_COUNT = 3` y `EXTRA_MATCHES_ALLOWED = 2`
- `src/app/dashboard/category/[categoryId]/survey/page.tsx` - Genera máximo 3 iniciales
- `src/components/matches/ShowMoreButton.tsx` - Controla que solo puede pedir 2 extras

**Regla:** 3 matches iniciales + máximo 2 extras si rechaza = 5 total máximo

---

### 6. Unificación de Conteo de Leads ✅

**Archivo:** `src/app/dashboard/provider/page.tsx`

**Cambio:** El badge de "Mis Leads" ahora muestra `totalLeads` (total visible) en lugar de solo `approvedLeads`, unificando el número con lo que se muestra dentro de la sección.

---

### 7. Badge Amarillo - No Contar Rechazados ✅

**Archivo:** `src/app/dashboard/page.tsx`

**Cambio:** El badge amarillo de cantidad de matches por categoría ahora filtra los rechazados:

```javascript
const categoryMatches = matches.filter(
  (m) => m.category === categoryId && m.status !== "rejected"
);
```

---

### 8. Badge de Verificación Mejorado ✅

**Archivos:**

- `src/app/dashboard/category/[categoryId]/matches/page.tsx`
- `src/app/dashboard/category/[categoryId]/matches/page.module.css`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/page.module.css`

**Cambio:** El badge de verificación ahora muestra el texto "Proveedor verificado" en color azul (#3b82f6) con fondo semitransparente, más visible y distintivo que el pequeño check amarillo anterior.

**Nuevos estilos CSS:**

- `.verifiedBadgeText` - Para tarjetas de matches
- `.verifiedBadgeTextLarge` - Para modales de detalles

---

---

## Cambios V3.2 - Detalle Técnico (9 Diciembre 2025)

### 1. Email de Contacto en Dashboard ✅

**Archivo:** `src/components/dashboard/DashboardHeader.tsx`

**Cambio:** Se actualizó la constante `CONTACT_EMAIL` de `matriaichile@gmail.com` a `matrimatch.chile@gmail.com` para unificar el email en toda la aplicación.

---

### 2. Eliminación de Pregunta de Precios en Registro ✅

**Archivo:** `src/app/register/provider/page.tsx`

**Cambio:** Se eliminó el componente `PriceRangeInput` del paso 3 del wizard de registro de proveedores. La pregunta de rango de precios ahora solo se hace en las encuestas específicas de cada categoría.

**Validación actualizada:** Solo se requiere que el proveedor seleccione al menos una región de trabajo.

---

### 3. Contador de Métricas con Decisión Final ✅

**Archivo:** `src/lib/firebase/firestore.ts`

**Cambios:**

- `approveLeadWithMetrics()` ahora verifica el estado anterior del lead
- `rejectLeadWithReason()` ahora verifica el estado anterior del lead
- Nueva función `decrementProviderMetric()` para ajustar métricas cuando el usuario cambia de opinión

**Lógica:**

- Si el lead estaba `pending` y se aprueba → incrementa `timesInterested`
- Si el lead estaba `pending` y se rechaza → incrementa `timesNotInterested`
- Si el lead estaba `approved` y se rechaza → decrementa `timesInterested`, incrementa `timesNotInterested`
- Si el lead estaba `rejected` y se aprueba → decrementa `timesNotInterested`, incrementa `timesInterested`
- Si el lead ya tenía el mismo estado → no se modifican métricas

---

### 4. Estado Visible en Leads Recientes ✅

**Archivo:** `src/app/dashboard/provider/page.tsx`

**Cambio:** Se agregó un badge de estado (`Interesado`, `Rechazado`, `Contactado`, `Pendiente`) en las tarjetas de leads recientes de la sección Overview.

---

### 5. Estado en Popup y Formato Fecha ✅

**Archivos:**

- `src/app/dashboard/provider/page.tsx`
- `src/app/dashboard/provider/page.module.css`

**Cambios:**

- Agregado badge de estado en el header del modal de detalles del lead
- Fechas formateadas a DD-MM-AAAA usando `toLocaleDateString('es-CL', {...})`

**Nuevos estilos CSS:**

- `.leadStatusBadge` - Base para badges de estado
- `.leadStatusApproved` - Verde para interesados
- `.leadStatusRejected` - Rojo para rechazados
- `.leadStatusContacted` - Azul para contactados
- `.leadStatusPending` - Púrpura para pendientes

---

### 6. Sección de Disponibilidad ✅

**Archivos modificados:**

- `src/store/authStore.ts` - Agregado campo `blockedDates?: string[]` a `ProviderProfile`
- `src/components/dashboard/Sidebar.tsx` - Agregada sección "Disponibilidad" con icono `CalendarX`
- `src/app/dashboard/provider/page.tsx` - Implementada UI del calendario anual
- `src/app/dashboard/provider/page.module.css` - Estilos para calendario y controles
- `firestore.rules` - Nueva función `isOnlyAvailabilityUpdate()` y regla de actualización

**Funcionalidades:**

- Calendario anual interactivo para bloquear días no disponibles
- Selector de año para navegar entre años
- Leyenda explicativa (Disponible, Bloqueado, Fecha pasada)
- Botón para guardar cambios
- Mensaje informativo sobre la lógica de bloqueo

**Reglas Firestore:**

```javascript
function isOnlyAvailabilityUpdate() {
  return request.resource.data
    .diff(resource.data)
    .affectedKeys()
    .hasOnly(["blockedDates", "updatedAt"]);
}
```

---

### 7. Validación de Disponibilidad en Matching ✅

**Archivo:** `src/lib/firebase/firestore.ts`

**Cambios:**

- Nueva función `isProviderAvailableOnDate()` para verificar disponibilidad
- `getAvailableProvidersForCategory()` ahora acepta `eventDate` e `isDateTentative`
- `generateMatchesForUserSurvey()` pasa la fecha del evento a las funciones de filtrado

**Lógica crítica:**

- Si `isDateTentative === true` → NO se filtra por disponibilidad (permite todos los proveedores)
- Si `isDateTentative === false` → SE filtra por disponibilidad (excluye proveedores que bloquearon esa fecha)

---

### 8. Filtros de Leads ✅

**Archivos:**

- `src/app/dashboard/provider/page.tsx`
- `src/app/dashboard/provider/page.module.css`

**Cambios:**

- Estados agregados: `statusFilter` y `sortByEventDate`
- UI con selectores para:
  - Filtrar por estado: Todos / Interesado / Rechazado
  - Ordenar por fecha: Sin ordenar / Más próximos primero / Más lejanos primero
- Función `filteredLeads` actualizada para aplicar ambos filtros

**Nuevos estilos CSS:**

- `.leadsFilters` - Contenedor de filtros
- `.filterGroup` - Grupo de label + select
- `.filterLabel` - Etiqueta del filtro
- `.filterSelect` - Selector estilizado

---

---

## Cambios V3.3 - Detalle Técnico (10 Diciembre 2025)

### 1. Sección "Mis Matches" - Solo Categorías Completadas ✅

**Archivo:** `src/app/dashboard/page.tsx`

**Cambio:** La sección "Mis Matches" ahora solo muestra las categorías donde el usuario YA completó la encuesta (`completed` o `matches_generated`). Si no hay ninguna categoría completada, muestra un mensaje con botón para ir a "Categorías".

**Nuevos estilos CSS:** `src/app/dashboard/page.module.css`

- `.emptyMatchesMessage` - Contenedor del mensaje vacío
- `.emptyMatchesIcon` - Icono decorativo
- `.emptyMatchesTitle` - Título del mensaje
- `.emptyMatchesText` - Texto explicativo
- `.emptyMatchesButton` - Botón para ir a Categorías

---

### 2. Fix Dark Theme - Badge de Categoría en Matches ✅

**Archivos:**

- `src/app/dashboard/page.module.css`
- `src/app/dashboard/category/[categoryId]/matches/page.module.css`

**Cambio:** El badge de categoría (`.matchCategory`) ahora usa fondo oscuro semitransparente (`rgba(0, 0, 0, 0.7)`) y texto blanco (`#ffffff`) que funciona correctamente en ambos temas (claro y oscuro).

---

### 3. Límite de 3 Proveedores Activos por Categoría ✅

**Archivos:**

- `src/utils/matchLimits.ts` - Nueva constante `MAX_ACTIVE_MATCHES_PER_CATEGORY = 3`
- `src/app/dashboard/category/[categoryId]/matches/page.tsx` - Lógica de validación
- `src/components/matches/ShowMoreButton.tsx` - Props y validación adicional

**Cambio:** Ahora se limita a **máximo 3 proveedores activos** (approved + pending) por categoría. Los proveedores rechazados NO cuentan hacia este límite.

**Reglas implementadas:**

- Si el usuario tiene 3 matches activos (approved o pending), NO puede:
  - Solicitar un nuevo proveedor ("Mostrar nuevo proveedor")
  - Recuperar un proveedor descartado ("Recuperar")
- Para agregar un nuevo proveedor, debe primero descartar uno de los activos
- Se muestra un modal explicativo cuando intenta exceder el límite

**Protección contra race conditions (acciones simultáneas):**

- Se agregó estado global `isModifyingActiveMatches` que bloquea TODAS las acciones que modifican matches activos
- Cuando se está procesando "Mostrar nuevo proveedor", los botones de "Recuperar" se deshabilitan automáticamente
- Cuando se está procesando "Recuperar", el botón de "Mostrar nuevo proveedor" se deshabilita automáticamente
- Esto evita que el usuario pueda hacer "trampa" ejecutando múltiples acciones a la vez para tener más de 3 matches activos

**Modal de límite:**

- Título: "Límite de proveedores alcanzado"
- Explica que tiene 3 proveedores activos (máximo permitido)
- Indica cómo puede agregar más (descartando uno primero)

**Nuevos estilos CSS:**

- `.limitModalIcon` - Icono del modal
- `.limitModalHint` - Texto de ayuda
- `.limitModalButton` - Botón de confirmación
- `.revertButtonDisabledLimit` - Estilo para botón recuperar deshabilitado
- `.detailsRecoverButtonDisabled` - Estilo para botón en panel de detalles

---

---

## Cambios V3.4 - Detalle Técnico (10 Diciembre 2025)

### 1. Fecha en Sidebar Novios - Formato DD-MM-AA ✅

**Archivo:** `src/components/dashboard/Sidebar.tsx`

**Cambio:** La fecha del evento en el sidebar de novios ahora se muestra en formato DD-MM-AA en lugar de mostrar el año completo primero.

---

### 2. Sección de Visibilidad Eliminada del Dashboard Proveedor ✅

**Archivo:** `src/app/dashboard/provider/page.tsx`

**Cambio:** Se eliminó completamente la sección "Tu visibilidad" del dashboard de resumen de proveedores, ya que el cliente solicitó quitarla.

---

### 3. Corrección de Conteo de Leads ✅

**Archivo:** `src/app/dashboard/provider/page.tsx`

**Problema:** El total de leads mostraba 9 pero la suma por categorías daba 11.

**Causa:** `leadsByCategory` usaba `leads` (todos los leads incluyendo pending), mientras que `totalLeads` usaba `visibleLeads` (excluyendo pending).

**Solución:** Ahora `leadsByCategory` usa `visibleLeads` para mantener consistencia con el total mostrado.

---

### 4. Estilos de Dropdowns Personalizados ✅

**Archivo:** `src/app/dashboard/provider/page.module.css`

**Cambio:** Los dropdowns de filtros en la sección de leads ahora tienen estilos personalizados que coinciden con el tema de la aplicación:

- Fondo oscuro/claro según el tema
- Iconos de flecha personalizados en color dorado
- Bordes y sombras coherentes con el diseño

---

### 5. Badge de Verificación en Header y Perfil ✅

**Archivos:**

- `src/components/dashboard/DashboardHeader.tsx`
- `src/components/dashboard/DashboardHeader.module.css`
- `src/app/dashboard/provider/page.tsx`
- `src/app/dashboard/provider/page.module.css`

**Cambios:**

- Se agregó prop `isVerified` al componente `DashboardHeader`
- Cuando un proveedor está verificado, se muestra un badge azul "Verificado" junto a su nombre en el header
- También se muestra el estado de verificación en la sección "Estado de cuenta" del perfil

---

### 6. CRÍTICO: Sistema de Créditos - Prevención de Leads con Créditos = 0 ✅

**Archivo:** `src/lib/firebase/firestore.ts`

**Problema:** Un proveedor con límite de 10 créditos tenía 11 leads, resultando en -1 créditos disponibles.

**Cambios realizados:**

1. **`createCategoryLead`**: Validación mejorada que verifica `creditsAvailable = leadLimit - leadsUsed > 0` antes de crear cualquier lead. Si no hay créditos, el lead NO se crea y se lanza un error.

2. **`getAvailableProvidersForCategory`**: El filtrado ahora excluye proveedores donde `creditsAvailable <= 0`, con logging para diagnóstico.

3. **`generateMatchesForUserSurvey` (fallback)**: Los proveedores sin créditos son excluidos del fallback también.

4. **`generateNewMatchForUser`**: Validación mejorada para nuevos matches adicionales.

**Logs agregados:** Se agregaron logs detallados (`🚫`, `✅`, `📊`) para poder diagnosticar problemas de créditos en producción.

---

_Documento creado: Diciembre 2025_  
_Última actualización: 10 Diciembre 2025 (V3.4)_  
_Desarrollador: MatriMatch Development Team_
