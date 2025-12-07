# Matri.AI - Correcciones Cliente V2

## Documento de Cambios Finales Aprobados

**Fecha:** Diciembre 2025  
**Estado:** ✅ IMPLEMENTADO  
**Versión:** 2.0

> **Nota de implementación (Dic 2025):** Se han implementado TODOS los cambios aprobados:
>
> **Cambios UI/UX Generales:**
>
> - ✅ Fondos negros más claros (#141414 en lugar de #080808)
> - ✅ Tipografía más grande y títulos más bold
> - ✅ Header sin flecha, nombre destacado en dorado
>
> **Landing Page:**
>
> - ✅ Botón cambiado a "Empieza esta aventura"
>
> **Página Matches (Usuario):**
>
> - ✅ Rediseño completo con header de perfil, countdown, estadísticas y grid de categorías
>
> **Categorías:**
>
> - ✅ "Transporte" renombrado a "Auto de Novios"
>
> **Dashboard Proveedor:**
>
> - ✅ Eliminado bloque "Tu perfil" del overview
> - ✅ "Tasa de interés" cambiado a "Calidad de leads"
> - ✅ Estado de lead: "Aprobado" cambiado a "Interesado"
> - ✅ "Leads" cambiado a "Créditos" en estado de cuenta
> - ✅ Presupuesto total eliminado, solo muestra presupuesto de categoría
>
> **Super Admin:**
>
> - ✅ Panel de configuración de matchmaking (/admin/matchmaking)
> - ✅ Sistema de preguntas excluyentes implementado
> - ✅ Pesos dinámicos configurables por categoría

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Problema Crítico Prioritario](#2-problema-crítico-prioritario)
3. [Cambios Aprobados - Landing Page](#3-cambios-aprobados---landing-page)
4. [Cambios Aprobados - UI/UX General](#4-cambios-aprobados---uiux-general)
5. [Cambios Aprobados - Página Matches](#5-cambios-aprobados---página-matches)
6. [Cambios Aprobados - Página Categorías](#6-cambios-aprobados---página-categorías)
7. [Cambios Aprobados - Encuestas](#7-cambios-aprobados---encuestas)
8. [Cambios Aprobados - Dashboard Proveedor](#8-cambios-aprobados---dashboard-proveedor)
9. [Cambios Aprobados - Leads y Matches](#9-cambios-aprobados---leads-y-matches)
10. [Cambios Aprobados - Super Admin (Matchmaking)](#10-cambios-aprobados---super-admin-matchmaking)
11. [Cambios NO Aprobados](#11-cambios-no-aprobados)
12. [Notas Técnicas Adicionales](#12-notas-técnicas-adicionales)

---

## 1. Resumen Ejecutivo

Este documento detalla las correcciones finales aprobadas para Matri.AI después de la revisión del cliente. Se incluyen ÚNICAMENTE los cambios que serán implementados, con clarificación de cuáles propuestas fueron rechazadas y por qué.

### Leyenda de Prioridades

| Prioridad  | Descripción                                              |
| ---------- | -------------------------------------------------------- |
| 🔴 CRÍTICA | Debe resolverse inmediatamente - Bloquea uso del sistema |
| 🟠 ALTA    | Importante para la experiencia del usuario               |
| 🟡 MEDIA   | Mejora significativa de UX                               |
| 🟢 BAJA    | Nice-to-have                                             |

---

## 2. Problema Crítico Prioritario

### 🔴 Congelamiento de Página

**Problema:** La página se congela y queda inutilizable. Ni siquiera al hacer refresh vuelve a funcionar; se debe cerrar la pestaña y abrirla nuevamente.

**Prioridad:** 🔴 CRÍTICA - Debe resolverse ANTES de cualquier otro cambio.

**Investigar:**

- Memory leaks en componentes React
- Loops infinitos en useEffect
- Problemas con listeners de Firebase no desuscriptos
- Estados que causan re-renders infinitos
- Websockets o conexiones no cerradas correctamente

**Acción requerida:** Debugging profundo del rendimiento de la aplicación.

---

## 3. Cambios Aprobados - Landing Page

### 3.1 Cuadro junto a "Planifica sin estrés" 🟠

**Estado Actual:** Cuadro blanco genérico que no representa el dashboard real.

**Cambio Aprobado:**

- Reemplazar el cuadro blanco con **imágenes reales o muy representativas** del software.
- Mostrar capturas o mockups fieles del dashboard que verá el usuario.

**Nota:** NO se implementará la propuesta original de mostrar categorías interactivas iluminadas. Se usarán imágenes estáticas representativas.

**📎 ADJUNTO:** Se incluirá una imagen de referencia para el diseño esperado de esta sección.

---

### 3.2 Frase Final de la Landing 🟢

**Estado Actual:** "Crea tu usuario o empieza esta aventura"

**Cambio Aprobado:** Dejar solo **"Empieza esta aventura"** (eliminar "crea tu usuario o").

---

## 4. Cambios Aprobados - UI/UX General

### 4.1 Reducir Oscuridad del Negro 🟠

**Estado Actual:** Exceso de negro en los fondos que fatiga la vista.

**Cambio Aprobado:**

- Hacer **TODOS los fondos negros más claros**.
- Mantener estética premium pero reduciendo la carga visual del negro puro.
- Sugerencia: Cambiar de `#000000` a tonos como `#1a1a1a`, `#1f1f1f` o `#242424`.

**Nota:** NO se implementará modo claro/oscuro completo. Solo se suavizarán los fondos oscuros existentes.

---

### 4.2 Tipografías 🟡

**Cambio Aprobado:**

- Aumentar el tamaño del texto base.
- Dar mayor grosor (bold) a los títulos.
- Mantener jerarquía visual clara y fácil de leer.

**Sugerencia de implementación:**

```css
/* Texto base: de 14px a 16px */
/* Títulos: agregar font-weight: 600 o 700 */
```

---

### 4.3 Flecha junto al nombre del proveedor (header) 🟢

**Estado Actual:** En la parte superior derecha aparece el nombre del proveedor con una flecha hacia abajo que no hace nada.

**Cambio Aprobado:**

- Eliminar la flecha que no tiene funcionalidad.
- El nombre del proveedor debe destacar más:
  - Tamaño mayor
  - En tono morado (color de identidad visual)

---

### 4.4 Agregar opción "Contáctanos" / "¿Necesitas ayuda?" 🟡

**Cambio Aprobado:**

- Agregar un enlace/botón visible para que proveedores puedan contactar al equipo.
- Debe abrir un formulario o enlace mailto: que envíe el mensaje directamente al correo del equipo.
- Incluir el comentario específico del usuario.

**Nota:** Más adelante se reemplazará por un bot, pero por ahora debe ser contacto directo por mail.

---

## 5. Cambios Aprobados - Página Matches

### 5.1 Rediseño Completo de Página Matches 🔴

**Problema Actual:**

- La página no tiene utilidad como página de inicio.
- Después de crear perfil, el usuario llega a página vacía.
- Repite información de Categorías.
- Se acumulan MUCHOS matches de forma desordenada.

**Nuevo Diseño Aprobado:**

**📎 ADJUNTO:** Se incluirá una imagen de referencia visual para este diseño.

**Estructura del nuevo Matches:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Foto de perfil]                                                    │
│                           Hola [Nombre del Usuario]                  │
│                           [Fecha del matrimonio]  [✏️ Editar]        │
│  ┌─────────────┐                                                     │
│  │   350 días  │                                                     │
│  │    4 hrs    │  (Cuenta regresiva a la boda)                       │
│  └─────────────┘                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Estadísticas: Servicios | Tareas | Invitados | Invitados       │ │
│  │ contratados | completadas | confirmados | sentados              │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ 🏛️      │  │ 🍽️      │  │ 📷      │  │ 🎥      │            │
│  │Celebrac. │  │Banquete  │  │Fotografía│  │ Video   │            │
│  │ [Buscar] │  │ [Buscar] │  │ [Buscar] │  │ [Buscar]│            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ 🎵      │  │ 🚗      │  │ 💌      │  │ 🎁      │            │
│  │ Música  │  │Auto Nov. │  │Invitac.  │  │Recuerdos │            │
│  │ [Buscar] │  │ [Buscar] │  │ [Buscar] │  │ [Buscar]│            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Comportamiento al hacer clic en una categoría:**

- **Se abre una página o popup** mostrando los matches ESPECÍFICOS de esa categoría.
- Al hacer clic en un proveedor, se despliega su información de contacto.
- Esto evita que se vea desordenado cuando se acumulan muchos matches.

**Inspiración estética:** matrimonios.cl (estilo limpio y atractivo)

---

## 6. Cambios Aprobados - Página Categorías

### 6.1 Renombrar "Transportes" a "Auto de Novios" 🟡

**Motivo:** Los transportes para invitados funcionan mediante alianzas y no como contratación directa. Ese servicio se incorporará más adelante de otra forma.

---

### 6.2 Comportamiento Post-Encuesta 🟠

**Estado Actual:** Después de responder la encuesta, se muestran los proveedores dentro de la categoría.

**Cambio Aprobado:**

- Después de responder la encuesta, **NO** mostrar proveedores dentro de la categoría.
- Los matches corresponden a la página "Matches", para evitar duplicar información.
- Al abrir una categoría ya respondida, mostrar un estado de "completado" y permitir rehacerla.

---

### 6.3 Botón "Eliminar Categoría" / Rehacer Encuesta 🟠

**Cambio Aprobado:**

- Permitir al usuario rehacer la mini-encuesta desde cero.
- **NO** habrá modal preguntando motivo de eliminación (descartado).
- Al rehacer la encuesta: **BORRAR los leads anteriores**, descontando esos leads como si no hubieran existido.

**Importante:** Esto afecta el contador de leads de los proveedores - deben "devolverse" simbólicamente.

---

### 6.4 Contador de Tareas (ELIMINADO) ⚫

**Decisión:** NO habrá contador de tareas dentro de categorías.

**Motivo:** El contador tenía inconsistencias (contaba categorías fuera de preferencias, generando valores como 6/5).

---

## 7. Cambios Aprobados - Encuestas

### 7.1 Visualización de Encuestas Completadas (Proveedores) 🟠

**Problema Actual:** Una encuesta completada no se marca como realizada visualmente.

**Cambio Aprobado:**

- Cambiar color del recuadro (por ejemplo, a verde) cuando está completada.
- Mostrar un check de completado ✓.
- Actualizar el marcador de tareas en la barra lateral ("Encuestas"), especialmente para proveedores con más de un servicio.

**Nota:** El cliente reporta que es "raro" porque los estilos sí existen pero al COMPLETAR no se refleja en la sección de encuestas de proveedores. Requiere investigación.

---

### 7.2 Validación de Campos Numéricos en Encuestas 🔴

**Problema Actual:** Los campos de input numérico en un rango no validan correctamente. Permiten colocar lo que quieran, los números se modifican solos o no dejan borrar.

**Cambio Aprobado:**

- Permitir que el usuario escriba lo que quiera durante la edición.
- Agregar validación al presionar "Siguiente" para verificar que el valor esté en el rango permitido.
- Mostrar mensaje de error claro si el valor está fuera de rango.

**Ejemplo:**

```typescript
// Al hacer clic en "Siguiente"
if (value < minRange || value > maxRange) {
  showError(`El valor debe estar entre ${minRange} y ${maxRange}`);
  return; // No avanzar
}
```

---

### 7.3 Eliminar Pregunta "¿Cuál es tu estilo?" en Creación de Proveedor 🟡

**Motivo:** Se repite en la encuesta específica de cada categoría.

---

### 7.4 Eliminar Pregunta "Precios y ubicación" en Creación de Proveedor 🟡

**Motivo:** Se aborda dentro de la encuesta.

---

### 7.5 Modificar Pregunta de Ubicación 🟡

**Estado Actual:** Se pregunta ubicación simple.

**Cambio Aprobado:** Reemplazar por:

- **"¿En qué regiones prestas servicios?"**
- Con **selección múltiple** de regiones.

---

## 8. Cambios Aprobados - Dashboard Proveedor

### 8.1 Íconos de Categoría en Leads 🟡

**Problema:** Íconos de categoría demasiado pequeños en "leads recientes" y "Mis Leads".

**Cambio Aprobado:**

- Aumentar el tamaño de los íconos.
- Incluir el nombre de la categoría junto al ícono para fácil identificación.

---

### 8.2 Estado del Lead Visible 🟡

**Cambio Aprobado:**

- Mostrar claramente el estado en cada lead: **Pendiente** o **Interesado** ("Me interesa").
- El estado debe ser visible tanto en la lista como dentro del lead seleccionado.

**Nota:** NO hay estado "Rechazado" ni "Aprobado" ya que el sistema de aprobación no se implementará.

---

### 8.3 Cantidad de Leads Recientes 🟢

**Cambio Aprobado:** Mostrar los últimos **5 leads** en la sección de leads recientes, cada uno con su estado.

---

### 8.4 Eliminar Presupuesto Total del Matrimonio 🔴

**Problema Actual:** Se muestra el presupuesto TOTAL del matrimonio en la información del lead.

**Cambio Aprobado:**

- **ELIMINAR completamente** la visualización del presupuesto total.
- Solo mostrar el presupuesto **referente a ESA categoría** si está disponible en la encuesta.

---

### 8.5 Revisar/Eliminar "Detalles de planificación" 🟡

**Problema:** No está claro para qué sirve ni de dónde obtiene la información.

**Acción:** Aclarar su propósito o eliminarlo si no aporta valor.

---

### 8.6 Eliminar Bloque "Tu perfil" de Resumen 🟢

**Estado Actual:** Al final de la página "Resumen" aparece un bloque llamado "Tu perfil".

**Cambio Aprobado:** Eliminar este bloque. La página "Resumen" debe enfocarse solo en los leads.

---

### 8.7 Filtros en Página "Mis Leads" 🟡

**Cambio Aprobado:** Agregar/modificar filtros:

- ✅ Fecha de evento
- ✅ Estado (Pendiente, Interesado)
- ✅ Categoría (mantener existente)

---

### 8.8 Formato de Fechas 🟡

**Cambio Aprobado:**

- Fecha de evento y fecha de creación del lead: formato **DD-MM-AAAA**.
- La fecha de creación debe estar etiquetada explícitamente como "Fecha de creación".

---

### 8.9 Página "Portafolio" - Usabilidad del Recorte 🟡

**Problema:** El ajuste de foto de perfil no es intuitivo.

**Cambio Aprobado:** Mejorar la usabilidad del componente de recorte/ajuste de imagen.

---

### 8.10 Estado de Cuenta - Terminología 🟡

**Estado Actual:** Se usa la palabra "leads" indistintamente.

**Cambio Aprobado:**

- Diferenciar claramente entre **"Crédito"** y **"Lead"**.
- En "Estado de cuenta", reemplazar "leads" por **"créditos"**.
- Recordar: 1 crédito = 1 lead generado.

---

### 8.11 Cambiar "Tasa de interés%" a "Calidad de leads" 🟢

**Estado Actual:** Variable llamada "Tasa de interés%" en el dashboard de estadísticas.

**Cambio Aprobado:** Cambiar el texto/label a **"Calidad de leads"**.

---

## 9. Cambios Aprobados - Leads y Matches

### 9.1 Flujo Actual se Mantiene 🔴

**IMPORTANTE:** El flujo actual de generación de leads **SE MANTIENE TAL CUAL**.

- Al terminar la encuesta, se muestran los proveedores inmediatamente.
- NO se implementará el resumen previo de "Conseguiste X matches perfectos...".
- NO se implementará el sistema de 3 pasos (matches → leads → me interesa).
- El sistema sigue siendo: **Leads** → **"Me interesa"**.

**Única modificación:** Si el usuario quiere rehacer la encuesta, se BORRAN los leads anteriores descontándolos como si no hubieran existido.

---

### 9.2 Información de Encuesta para Proveedores (Mantener) ✅

**Se mantiene:** Los proveedores SÍ pueden ver la información detallada de las coincidencias de encuesta con cada novio.

**NO se implementa:** Los novios NO verán información detallada de coincidencias con proveedores.

**Motivo:** Mostrar puntos de descoincidencia a los novios puede complicar las ventas por un punto menor que se puede gestionar en el proceso de venta.

---

## 10. Cambios Aprobados - Super Admin (Matchmaking)

### 10.1 Panel de Configuración de Pesos de Preguntas 🔴

**Nuevo Feature:** Crear en Super Admin un panel donde se pueda **MODIFICAR el porcentaje/peso de cada pregunta** para el matchmaking.

**Funcionalidad:**

- Ver todas las preguntas de cada categoría.
- Asignar un peso (%) a cada pregunta que afecte el cálculo del match.
- Guardar cambios y que apliquen al algoritmo de matchmaking.

**Interfaz sugerida:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ Configuración de Matchmaking - [Categoría]                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Pregunta 1: "¿Qué estilo de fotografía prefieres?"                  │
│ Peso: [====|========] 15%    [Excluyente: ☐]                        │
│                                                                      │
│ Pregunta 2: "¿Presupuesto para fotografía?"                         │
│ Peso: [========|====] 25%    [Excluyente: ☑]                        │
│                                                                      │
│ Pregunta 3: "¿Cuántas horas de cobertura necesitas?"                │
│ Peso: [=====|=======] 20%    [Excluyente: ☐]                        │
│                                                                      │
│                              [Guardar Configuración]                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 10.2 Sistema de Preguntas Excluyentes 🔴

**CRÍTICO - Nuevo Feature:**

Algunas preguntas deben ser **EXCLUYENTES**. Esto significa que aunque aporten poco al matchmaking por su peso, si NO SE CUMPLE la coincidencia, el resultado es **0% - NO MATCH automático**.

**Ejemplo:**

- Pregunta: "¿Ofrece comida vegana?" (Banquetera)
- Si el proveedor NO ofrece comida vegana y el novio la requiere → **NO MATCH automático (0%)**, sin importar que otras preguntas coincidan perfectamente.

**Implementación:**

1. En el panel de Super Admin, cada pregunta debe tener un toggle: **"Es excluyente"**.
2. Si está marcada como excluyente y NO hay coincidencia, el match score es automáticamente 0%.
3. Estas preguntas pueden tener un peso bajo en el cálculo normal, pero su poder de veto es absoluto.

**Lógica de cálculo:**

```typescript
function calculateMatchScore(userAnswers, providerAnswers, questionConfig) {
  // Primero verificar excluyentes
  for (const question of questionConfig) {
    if (question.isExcluding) {
      const userAnswer = userAnswers[question.id];
      const providerAnswer = providerAnswers[question.id];

      if (!isMatch(userAnswer, providerAnswer)) {
        return 0; // NO MATCH automático
      }
    }
  }

  // Si pasa todas las excluyentes, calcular score normal con pesos
  let totalScore = 0;
  for (const question of questionConfig) {
    const weight = question.weight;
    const matchValue = calculateQuestionMatch(
      userAnswers[question.id],
      providerAnswers[question.id]
    );
    totalScore += weight * matchValue;
  }

  return totalScore;
}
```

---

## 11. Cambios NO Aprobados

Esta sección documenta las propuestas del cliente que fueron **RECHAZADAS** y no serán implementadas.

### ❌ 11.1 Modo Claro/Oscuro Completo

**Propuesta:** Implementar toggle de modo claro/oscuro para toda la página.

**Decisión:** NO se implementará. Solo se suavizarán los fondos oscuros existentes.

---

### ❌ 11.2 Cuadros de Categorías Interactivos en Landing

**Propuesta:** Mostrar cuadros de categorías del dashboard en la landing, iluminados en morado.

**Decisión:** NO se implementará. Se usarán imágenes reales/representativas del software.

---

### ❌ 11.3 Sistema de 3 Pasos (Matches → Leads → Me Interesa)

**Propuesta:** Crear flujo de 3 pasos separando matches, leads y "me interesa".

**Decisión:** NO se implementará. El sistema sigue siendo Leads → "Me interesa".

---

### ❌ 11.4 Resumen Pre-Match ("Conseguiste X matches...")

**Propuesta:** Mostrar resumen del match antes de revelar proveedores con opción de modificar encuesta.

**Decisión:** NO se implementará. El flujo actual se mantiene.

---

### ❌ 11.5 Modal de Motivo al Eliminar Categoría

**Propuesta:** Preguntar motivo de eliminación cuando el usuario elimina una categoría.

**Decisión:** NO se implementará. Se permite eliminar pero sin explicación.

---

### ❌ 11.6 Contador de Tareas Dentro de Categorías

**Propuesta:** Arreglar o eliminar el contador de tareas.

**Decisión:** Se elimina completamente. No habrá tareas dentro de categorías.

---

### ❌ 11.7 Mostrar Info de Encuesta a Novios

**Propuesta:** Los novios puedan ver en qué ítems coinciden o no con cada proveedor.

**Decisión:** NO se implementará. Solo los proveedores verán esta información (como está ahora).

---

### ❌ 11.8 Indicador "Rechazados" en Dashboard de Proveedor

**Propuesta:** Agregar contador de leads rechazados.

**Decisión:** NO se implementará. El sistema de aceptar/rechazar no existe.

---

### ❌ 11.9 Tasa de Éxito / Tasa de Conversión

**Propuesta:** Agregar indicadores de tasa de éxito (Aprobados / Leads totales) y tasa de conversión.

**Decisión:** NO se implementará.

**Motivo:** No podemos medir la tasa de conversión real con certeza porque no procesamos pagos. No hay forma de verificar si se cerró la venta o contratación del servicio.

---

### ❌ 11.10 Sistema de Verificación de Cierre de Venta

**Propuesta:** Implementar forma de verificar si el proveedor cerró la venta.

**Decisión:** NO se implementará actualmente.

**Motivo:** Sin procesamiento de pagos integrado, no hay forma confiable de verificar esto.

---

## 12. Notas Técnicas Adicionales

### 12.1 Prioridad de Implementación

| Orden | Cambio                                       | Prioridad  |
| ----- | -------------------------------------------- | ---------- |
| 1     | Resolver congelamiento de página             | 🔴 CRÍTICA |
| 2     | Panel Super Admin - Pesos de matchmaking     | 🔴 ALTA    |
| 3     | Sistema de preguntas excluyentes             | 🔴 ALTA    |
| 4     | Validación de campos numéricos en encuestas  | 🔴 ALTA    |
| 5     | Eliminar presupuesto total en vista de leads | 🔴 ALTA    |
| 6     | Rediseño página Matches                      | 🟠 ALTA    |
| 7     | Oscurecer menos los fondos negros            | 🟠 ALTA    |
| 8     | Comportamiento post-encuesta en categorías   | 🟠 ALTA    |
| 9     | Encuestas completadas - visualización        | 🟠 ALTA    |
| 10    | Resto de cambios UI/UX                       | 🟡 MEDIA   |

---

### 12.2 Archivos Probables a Modificar

**Super Admin (Matchmaking):**

- Crear: `src/app/admin/matchmaking/page.tsx`
- Crear: `src/lib/matchmaking/config.ts`
- Modificar: Algoritmo de matchmaking existente

**Página Matches:**

- Modificar: `src/app/dashboard/page.tsx` (o equivalente de matches)
- Posible creación de componentes nuevos para grid de categorías

**UI General:**

- Modificar: Variables CSS de colores de fondo
- Modificar: Variables de tipografía

**Encuestas:**

- Modificar: Componentes de input numérico con rango
- Modificar: Lógica de validación de pasos

**Dashboard Proveedor:**

- Modificar: Componentes de visualización de leads
- Modificar: Página de resumen

---

### 12.3 Notas para Implementador

1. **Imagen adjunta:** Este documento va acompañado de una imagen de referencia que muestra el diseño esperado para la nueva página de Matches. La imagen ilustra la estructura de dashboard con categorías organizadas en grid.

2. **Testing:** Después de cada cambio mayor, verificar que no se introduzcan nuevos problemas de rendimiento (dado el issue de congelamiento reportado).

3. **Migración de datos:** El sistema de preguntas excluyentes y pesos requiere una estructura de datos nueva que debe ser retrocompatible con matches existentes.

4. **Variables CSS:** Se recomienda centralizar los cambios de colores de fondo en variables CSS para facilitar futuras modificaciones.

---

_Documento creado: Diciembre 2025_  
_Última actualización: Diciembre 2025_  
_Estado: Pendiente de implementación_
