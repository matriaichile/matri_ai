# Matri.AI - Ajustes de Encuestas y Nuevas Categorías

> **Documento de especificación completa para implementación**
> Fecha: Diciembre 2025

---

## PARTE 1: AJUSTES A ENCUESTAS EXISTENTES

### 1.1 Categoría BANQUETERÍA (catering)

**Archivo:** `src/lib/surveys/catering.ts`

#### ENCUESTA DE USUARIOS (`CATERING_USER_QUESTIONS`)

| # | ID Actual | Acción | Descripción del Cambio |
|---|-----------|--------|------------------------|
| 1 | `catering_u_service_type` | **MODIFICAR** | Cambiar a **selección múltiple** (`type: 'multiple'`). Actualizar opciones: `Coctel / Finger Food`, `Cena (Entrada, fondo y postre)`, `Buffet`, `Estaciones temáticas`, `Extra (Mesón de postres y trasnoches)` |
| 2 | `catering_u_cuisine` | **MODIFICAR** | Mantener múltiple. **AGREGAR** opción: `{ id: 'bbq', label: 'Asados o parrilla' }` |
| 3 | `catering_u_budget_pp` | **MODIFICAR** | **AGREGAR** opción "Omitir": `{ id: 'skip', label: 'Omitir' }` |
| 4 | `catering_u_guest_count` | **ELIMINAR** | Se repite al crear usuario (número de invitados ya se pregunta en wizard) |
| 5 | `catering_u_courses` | **MODIFICAR** | Cambiar texto de pregunta a: `"¿De cuántos tiempos quieres que sea tu cena?"` |
| 6 | `catering_u_cocktail` | **ELIMINAR** | Eliminar esta pregunta |
| 7 | `catering_u_dietary` | **MODIFICAR** | **AGREGAR** opción: `{ id: 'other', label: 'Otra: ¿Cuál?', description: 'Especificar' }` - Considerar cambiar a tipo `text` para la opción "Otra" o agregar campo adicional |
| 8 | `catering_u_beverages` | **MODIFICAR** | **AGREGAR** opción única: `{ id: 'juices', label: 'Jugos / Aguas saborizadas' }` |
| 9 | `catering_u_tasting` | **OK** | Sin cambios |
| 10 | `catering_u_cake` | **MODIFICAR** | Cambiar opciones a solo: `{ id: 'yes', label: 'Sí' }`, `{ id: 'no', label: 'No' }`. Quitar "Mesa de postres" (ya va en preguntas anteriores en service_type) |
| 11 | `catering_u_staff` | **MODIFICAR** | Opciones deben ser: `Básico`, `Estándar`, `Premium`. **ELIMINAR** "Garzones dedicados" de la opción Premium |
| 12 | `catering_u_setup` | **OK** | Sin cambios |
| 13 | **NUEVO** | **AGREGAR** | Nueva pregunta: `catering_u_end_time` - `"¿Hasta qué hora debe estar la banquetera en el evento?"` Opciones: `00:00 – 1:00 am`, `2:00 – 3:00 am`, `4:00 – 5:00 am`, `+5:00 am` |

#### CÓDIGO ACTUALIZADO - Pregunta 1 (service_type):
```typescript
{
  id: 'catering_u_service_type',
  question: '¿Qué tipo de servicio prefieres?',
  type: 'multiple', // CAMBIO: era 'single'
  options: [
    { id: 'cocktail', label: 'Coctel / Finger Food' },
    { id: 'dinner', label: 'Cena (Entrada, fondo y postre)' },
    { id: 'buffet', label: 'Buffet' },
    { id: 'stations', label: 'Estaciones temáticas' },
    { id: 'extra', label: 'Extra (Mesón de postres y trasnoches)' },
  ],
  required: true,
  weight: 20,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 2 (cuisine):
```typescript
{
  id: 'catering_u_cuisine',
  question: '¿Qué tipo de cocina prefieres?',
  type: 'multiple',
  options: [
    { id: 'chilean', label: 'Chilena tradicional' },
    { id: 'international', label: 'Internacional' },
    { id: 'mediterranean', label: 'Mediterránea' },
    { id: 'asian', label: 'Asiática / Fusión' },
    { id: 'gourmet', label: 'Gourmet / Alta cocina' },
    { id: 'comfort', label: 'Comfort food' },
    { id: 'bbq', label: 'Asados o parrilla' }, // NUEVO
  ],
  required: true,
  weight: 15,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 3 (budget_pp):
```typescript
{
  id: 'catering_u_budget_pp',
  question: '¿Cuál es tu presupuesto por persona?',
  type: 'single',
  options: [
    { id: 'under_25k', label: 'Menos de $25.000' },
    { id: '25k_35k', label: '$25.000 - $35.000' },
    { id: '35k_50k', label: '$35.000 - $50.000' },
    { id: '50k_70k', label: '$50.000 - $70.000' },
    { id: 'over_70k', label: 'Más de $70.000' },
    { id: 'skip', label: 'Omitir' }, // NUEVO
  ],
  required: true,
  weight: 20,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 5 (courses):
```typescript
{
  id: 'catering_u_courses',
  question: '¿De cuántos tiempos quieres que sea tu cena?', // CAMBIO en texto
  type: 'single',
  options: [
    { id: '2', label: '2 tiempos' },
    { id: '3', label: '3 tiempos' },
    { id: '4', label: '4 tiempos' },
    { id: '5_plus', label: '5 o más tiempos' },
  ],
  required: true,
  weight: 5,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 7 (dietary):
```typescript
{
  id: 'catering_u_dietary',
  question: '¿Necesitas opciones especiales?',
  type: 'multiple',
  options: [
    { id: 'vegetarian', label: 'Vegetariana' },
    { id: 'vegan', label: 'Vegana' },
    { id: 'gluten_free', label: 'Sin gluten' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'halal', label: 'Halal' },
    { id: 'none', label: 'Ninguna' },
    { id: 'other', label: 'Otra: ¿Cuál?' }, // NUEVO
  ],
  required: true,
  weight: 5,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 8 (beverages):
```typescript
{
  id: 'catering_u_beverages',
  question: '¿Qué bebestibles necesitas?',
  type: 'multiple',
  options: [
    { id: 'soft_drinks', label: 'Bebidas' },
    { id: 'juices', label: 'Jugos / Aguas saborizadas' }, // NUEVO
    { id: 'wine', label: 'Vinos' },
    { id: 'beer', label: 'Cerveza' },
    { id: 'cocktails', label: 'Cócteles' },
    { id: 'open_bar', label: 'Barra libre' },
    { id: 'premium_liquor', label: 'Licores premium' },
  ],
  required: true,
  weight: 5,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 10 (cake):
```typescript
{
  id: 'catering_u_cake',
  question: '¿Incluir torta de novios?',
  type: 'single',
  options: [
    { id: 'yes', label: 'Sí' },
    { id: 'no', label: 'No' },
  ],
  required: true,
  weight: 5,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 11 (staff):
```typescript
{
  id: 'catering_u_staff',
  question: '¿Qué nivel de servicio esperas?',
  type: 'single',
  options: [
    { id: 'basic', label: 'Básico' },
    { id: 'standard', label: 'Estándar' },
    { id: 'premium', label: 'Premium' }, // CAMBIO: Eliminado "Garzones dedicados"
  ],
  required: true,
  weight: 5,
}
```

#### CÓDIGO NUEVA PREGUNTA 13 (end_time):
```typescript
{
  id: 'catering_u_end_time',
  question: '¿Hasta qué hora debe estar la banquetera en el evento?',
  type: 'single',
  options: [
    { id: '0_1am', label: '00:00 – 1:00 am' },
    { id: '2_3am', label: '2:00 – 3:00 am' },
    { id: '4_5am', label: '4:00 – 5:00 am' },
    { id: 'over_5am', label: '+5:00 am' },
  ],
  required: true,
  weight: 5,
}
```

---

### 1.2 Categoría CENTRO DE EVENTOS (venue)

**Archivo:** `src/lib/surveys/venue.ts`

#### ENCUESTA DE USUARIOS (`VENUE_USER_QUESTIONS`)

| # | ID Actual | Acción | Descripción del Cambio |
|---|-----------|--------|------------------------|
| 1 | `venue_u_type` | **MODIFICAR** | **AGREGAR** opción `{ id: 'event_hall', label: 'Salón de eventos' }`. Cambiar a **selección múltiple** (`type: 'multiple'`) |
| 2 | `venue_u_setting` | **MODIFICAR** | **ELIMINAR** opción "Flexible según clima" |
| 3 | `venue_u_budget` | **OK** | Sin cambios |
| 4 | `venue_u_capacity` | **ELIMINAR** | Ya se pregunta al crear usuario |
| 5 | `venue_u_exclusivity` | **OK** | Sin cambios |
| 6 | `venue_u_ceremony_space` | **OK** | Sin cambios |
| 7 | `venue_u_parking` | **MODIFICAR** | **ELIMINAR** opción "No necesario, habrá valet" - Cambiar a solo "No necesario" |
| 8 | `venue_u_accommodation` | **OK** | Sin cambios |
| 9 | `venue_u_catering_policy` | **OK** | Sin cambios |
| 10 | `venue_u_end_time` | **MODIFICAR** | Cambiar opciones a: `00:00 – 1:00 am`, `2:00 – 3:00 am`, `4:00 – 5:00 am`, `+5:00 am` |
| 11 | `venue_u_accessibility` | **OK** | Sin cambios |
| 12 | **NUEVO** | **AGREGAR** | Nueva pregunta: `venue_u_dance_floor` - `"¿Tiene pista de baile?"` Opciones: `Sí`, `No` |
| 13 | **NUEVO** | **AGREGAR** | Nueva pregunta: `venue_u_bridal_suite` - `"¿Tiene pieza para novia y novio?"` Opciones: `Sí`, `No`, `No es necesario` |

#### CÓDIGO ACTUALIZADO - Pregunta 1 (type):
```typescript
{
  id: 'venue_u_type',
  question: '¿Qué tipo de lugar prefieres?',
  type: 'multiple', // CAMBIO: era 'single'
  options: [
    { id: 'event_hall', label: 'Salón de eventos', description: 'Espacio dedicado a eventos' }, // NUEVO
    { id: 'hacienda', label: 'Hacienda / Campo', description: 'Naturaleza y tradición' },
    { id: 'hotel', label: 'Hotel', description: 'Comodidad y servicios' },
    { id: 'restaurant', label: 'Restaurant', description: 'Gastronomía destacada' },
    { id: 'garden', label: 'Jardín / Parque', description: 'Al aire libre' },
    { id: 'beach', label: 'Playa', description: 'Frente al mar' },
    { id: 'winery', label: 'Viña', description: 'Entre viñedos' },
    { id: 'loft', label: 'Loft / Industrial', description: 'Moderno y urbano' },
    { id: 'mansion', label: 'Casona / Mansión', description: 'Elegancia clásica' },
  ],
  required: true,
  weight: 20,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 2 (setting):
```typescript
{
  id: 'venue_u_setting',
  question: '¿Interior o exterior?',
  type: 'single',
  options: [
    { id: 'indoor', label: 'Interior', description: 'Climatizado' },
    { id: 'outdoor', label: 'Exterior', description: 'Al aire libre' },
    { id: 'both', label: 'Ambos / Mixto', description: 'Ceremonia afuera, fiesta adentro' },
    // ELIMINADO: { id: 'flexible', label: 'Flexible según clima' },
  ],
  required: true,
  weight: 15,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 7 (parking):
```typescript
{
  id: 'venue_u_parking',
  question: '¿Necesitas estacionamiento?',
  type: 'single',
  options: [
    { id: 'required', label: 'Indispensable' },
    { id: 'preferred', label: 'Preferible' },
    { id: 'not_needed', label: 'No necesario' }, // CAMBIO: Eliminado "habrá valet"
  ],
  required: true,
  weight: 5,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 10 (end_time):
```typescript
{
  id: 'venue_u_end_time',
  question: '¿Hasta qué hora necesitas el lugar?',
  type: 'single',
  options: [
    { id: '0_1am', label: '00:00 – 1:00 am' },
    { id: '2_3am', label: '2:00 – 3:00 am' },
    { id: '4_5am', label: '4:00 – 5:00 am' },
    { id: 'over_5am', label: '+5:00 am' },
  ],
  required: true,
  weight: 5,
}
```

#### CÓDIGO NUEVA PREGUNTA 12 (dance_floor):
```typescript
{
  id: 'venue_u_dance_floor',
  question: '¿Tiene pista de baile?',
  type: 'boolean',
  required: true,
  weight: 5,
}
```

#### CÓDIGO NUEVA PREGUNTA 13 (bridal_suite):
```typescript
{
  id: 'venue_u_bridal_suite',
  question: '¿Tiene pieza para novia y novio?',
  type: 'single',
  options: [
    { id: 'yes', label: 'Sí' },
    { id: 'no', label: 'No' },
    { id: 'not_needed', label: 'No es necesario' },
  ],
  required: true,
  weight: 3,
}
```

---

### 1.3 Categoría FOTOGRAFÍA (photography)

**Archivo:** `src/lib/surveys/photography.ts`

#### ENCUESTA DE USUARIOS (`PHOTOGRAPHY_USER_QUESTIONS`)

| # | ID Actual | Acción | Descripción del Cambio |
|---|-----------|--------|------------------------|
| 1 | `photo_u_style` | **MODIFICAR** | Cambiar a **selección múltiple** (`type: 'multiple'`) |
| 2-6 | Varias | **OK** | Sin cambios |
| 7 | `photo_u_delivery_time` | **MODIFICAR** | Cambiar opciones a: `2 semanas`, `1 mes`, `+1 mes`, `Me es indiferente` |
| 8-10 | Varias | **OK** | Sin cambios |
| 11 | `photo_u_priorities` | **ELIMINAR** | Eliminar esta pregunta |

#### CÓDIGO ACTUALIZADO - Pregunta 1 (style):
```typescript
{
  id: 'photo_u_style',
  question: '¿Qué estilo fotográfico prefieres?',
  type: 'multiple', // CAMBIO: era 'single'
  options: [
    { id: 'documentary', label: 'Documental / Natural', description: 'Momentos espontáneos y reales' },
    { id: 'artistic', label: 'Artístico / Creativo', description: 'Composiciones únicas y originales' },
    { id: 'classic', label: 'Clásico / Tradicional', description: 'Elegancia atemporal' },
    { id: 'editorial', label: 'Editorial / Revista', description: 'Estilo de alta moda' },
    { id: 'candid', label: 'Espontáneo / Candid', description: 'Sin poses, 100% natural' },
    { id: 'cinematic', label: 'Cinemático', description: 'Estilo de película' },
  ],
  required: true,
  weight: 25,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 7 (delivery_time):
```typescript
{
  id: 'photo_u_delivery_time',
  question: '¿En cuánto tiempo necesitas las fotos?',
  type: 'single',
  options: [
    { id: '2_weeks', label: '2 semanas' },
    { id: '1_month', label: '1 mes' },
    { id: 'over_1_month', label: '+1 mes' }, // CAMBIO
    { id: 'indifferent', label: 'Me es indiferente' }, // CAMBIO
  ],
  required: true,
  weight: 5,
}
```

---

### 1.4 Categoría VIDEÓGRAFOS (video)

**Archivo:** `src/lib/surveys/video.ts`

#### ENCUESTA DE USUARIOS (`VIDEO_USER_QUESTIONS`)

| # | ID Actual | Acción | Descripción del Cambio |
|---|-----------|--------|------------------------|
| 1 | `video_u_style` | **MODIFICAR** | Cambiar a **selección múltiple** (`type: 'multiple'`). Usar las **mismas opciones** que fotografía |
| 2 | `video_u_duration` | **OK** | Debe ser selección múltiple (ya lo es conceptualmente, verificar) |
| 3-7 | Varias | **OK** | Sin cambios |
| 8 | `video_u_raw_footage` | **ELIMINAR** | Eliminar esta pregunta |
| 9 | `video_u_social_reel` | **ELIMINAR** | Eliminar esta pregunta |
| 10 | `video_u_delivery_time` | **MODIFICAR** | Usar las **mismas opciones** que fotografía: `2 semanas`, `1 mes`, `+1 mes`, `Me es indiferente` |
| 11 | `video_u_music_preference` | **ELIMINAR** | Eliminar esta pregunta |

#### CÓDIGO ACTUALIZADO - Pregunta 1 (style):
```typescript
{
  id: 'video_u_style',
  question: '¿Qué estilo de video prefieres?',
  type: 'multiple', // CAMBIO: era 'single'
  options: [
    // CAMBIO: Mismas opciones que fotografía
    { id: 'documentary', label: 'Documental / Natural', description: 'Momentos espontáneos y reales' },
    { id: 'artistic', label: 'Artístico / Creativo', description: 'Composiciones únicas y originales' },
    { id: 'classic', label: 'Clásico / Tradicional', description: 'Elegancia atemporal' },
    { id: 'editorial', label: 'Editorial / Revista', description: 'Estilo de alta moda' },
    { id: 'candid', label: 'Espontáneo / Candid', description: 'Sin poses, 100% natural' },
    { id: 'cinematic', label: 'Cinemático', description: 'Estilo de película' },
  ],
  required: true,
  weight: 25,
}
```

#### CÓDIGO ACTUALIZADO - Pregunta 10 (delivery_time):
```typescript
{
  id: 'video_u_delivery_time',
  question: '¿En cuánto tiempo necesitas el video?',
  type: 'single',
  options: [
    { id: '2_weeks', label: '2 semanas' },
    { id: '1_month', label: '1 mes' },
    { id: 'over_1_month', label: '+1 mes' },
    { id: 'indifferent', label: 'Me es indiferente' },
  ],
  required: true,
  weight: 5,
}
```

---

### 1.5 Categoría DJ/VJ (dj)

**Archivo:** `src/lib/surveys/dj.ts`

#### ENCUESTA DE USUARIOS (`DJ_USER_QUESTIONS`)

| # | ID Actual | Acción | Descripción del Cambio |
|---|-----------|--------|------------------------|
| 1-3 | Varias | **OK** | Sin cambios |
| 4 | `dj_u_hours` | **MODIFICAR** | Cambiar opciones a: `5 hrs`, `6 hrs`, `7 hrs`, `+7 hrs` |
| 5-11 | Varias | **OK** | Sin cambios |

#### CÓDIGO ACTUALIZADO - Pregunta 4 (hours):
```typescript
{
  id: 'dj_u_hours',
  question: '¿Cuántas horas de música necesitas?',
  type: 'single',
  options: [
    { id: '5', label: '5 hrs' },
    { id: '6', label: '6 hrs' },
    { id: '7', label: '7 hrs' },
    { id: 'over_7', label: '+7 hrs' },
  ],
  required: true,
  weight: 10,
}
```

---

## PARTE 2: NUEVAS CATEGORÍAS

Se deben crear 4 nuevas categorías con sus respectivas encuestas para usuarios y proveedores:

1. **Entretenimiento** (`entertainment`) - Ya existe en el sistema pero sin encuestas
2. **Tortas** (`cakes`) - Nueva categoría
3. **Transporte** (`transport`) - Nueva categoría
4. **Invitaciones** (`invitations`) - Nueva categoría

---

### 2.1 Categoría ENTRETENIMIENTO (entertainment)

**Nuevo archivo:** `src/lib/surveys/entertainment.ts`

> **Nota:** Esta categoría cubre shows, animación, juegos y actividades de entretenimiento para el evento.

#### ENCUESTA DE USUARIOS (`ENTERTAINMENT_USER_QUESTIONS`)

```typescript
export const ENTERTAINMENT_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'ent_u_type',
    question: '¿Qué tipo de entretenimiento buscas?',
    type: 'multiple',
    options: [
      { id: 'live_band', label: 'Banda en vivo', description: 'Música en vivo' },
      { id: 'solo_artist', label: 'Artista solista', description: 'Cantante o músico' },
      { id: 'dancers', label: 'Show de baile', description: 'Bailarines profesionales' },
      { id: 'magician', label: 'Mago / Ilusionista', description: 'Magia y trucos' },
      { id: 'comedian', label: 'Comediante / Stand-up', description: 'Humor en vivo' },
      { id: 'photo_booth', label: 'Cabina de fotos', description: 'Photo booth con props' },
      { id: 'caricaturist', label: 'Caricaturista', description: 'Dibujos en vivo' },
      { id: 'fireworks', label: 'Fuegos artificiales', description: 'Show pirotécnico' },
      { id: 'casino', label: 'Casino / Juegos', description: 'Mesas de casino' },
      { id: 'karaoke_pro', label: 'Karaoke profesional', description: 'Sistema de karaoke' },
      { id: 'mariachi', label: 'Mariachi', description: 'Música mexicana' },
      { id: 'other', label: 'Otro', description: 'Especificar' },
    ],
    required: true,
    weight: 30,
  },
  {
    id: 'ent_u_moment',
    question: '¿En qué momento del evento necesitas el entretenimiento?',
    type: 'multiple',
    options: [
      { id: 'ceremony', label: 'Durante la ceremonia' },
      { id: 'cocktail', label: 'Durante el cóctel' },
      { id: 'dinner', label: 'Durante la cena' },
      { id: 'party', label: 'Durante la fiesta' },
      { id: 'special_moment', label: 'Momento especial', description: 'Entrada, primer baile, etc.' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'ent_u_duration',
    question: '¿Cuánto tiempo de show necesitas?',
    type: 'single',
    options: [
      { id: '30min', label: '30 minutos' },
      { id: '1hr', label: '1 hora' },
      { id: '2hr', label: '2 horas' },
      { id: '3hr', label: '3 horas' },
      { id: 'full_event', label: 'Todo el evento' },
      { id: 'flexible', label: 'Flexible' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'ent_u_budget',
    question: '¿Cuál es tu presupuesto para entretenimiento?',
    type: 'single',
    options: [
      { id: 'under_300k', label: 'Menos de $300.000' },
      { id: '300k_500k', label: '$300.000 - $500.000' },
      { id: '500k_800k', label: '$500.000 - $800.000' },
      { id: '800k_1500k', label: '$800.000 - $1.500.000' },
      { id: 'over_1500k', label: 'Más de $1.500.000' },
      { id: 'skip', label: 'Omitir' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'ent_u_style',
    question: '¿Qué estilo de entretenimiento prefieres?',
    type: 'single',
    options: [
      { id: 'elegant', label: 'Elegante / Sofisticado', description: 'Ambiente refinado' },
      { id: 'fun', label: 'Divertido / Animado', description: 'Mucha energía' },
      { id: 'romantic', label: 'Romántico', description: 'Ambiente íntimo' },
      { id: 'interactive', label: 'Interactivo', description: 'Participación de invitados' },
      { id: 'surprise', label: 'Sorpresa', description: 'Algo inesperado' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'ent_u_audience',
    question: '¿Para qué tipo de audiencia es el entretenimiento?',
    type: 'single',
    options: [
      { id: 'adults_only', label: 'Solo adultos' },
      { id: 'family', label: 'Familiar', description: 'Incluye niños' },
      { id: 'mixed', label: 'Mixto', description: 'Diferentes edades' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'ent_u_space',
    question: '¿Tienes espacio adecuado para el show?',
    type: 'single',
    options: [
      { id: 'yes_stage', label: 'Sí, con escenario' },
      { id: 'yes_space', label: 'Sí, espacio amplio sin escenario' },
      { id: 'limited', label: 'Espacio limitado' },
      { id: 'need_advice', label: 'Necesito asesoría' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'ent_u_equipment',
    question: '¿Necesitas que el proveedor traiga su equipo de sonido?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí, necesito todo el equipo' },
      { id: 'partial', label: 'Solo algunos elementos' },
      { id: 'no', label: 'No, ya tengo sonido' },
    ],
    required: true,
    weight: 5,
  },
];
```

#### ENCUESTA DE PROVEEDORES (`ENTERTAINMENT_PROVIDER_QUESTIONS`)

```typescript
export const ENTERTAINMENT_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'ent_p_types',
    question: '¿Qué tipo de entretenimiento ofreces?',
    type: 'multiple',
    options: [
      { id: 'live_band', label: 'Banda en vivo' },
      { id: 'solo_artist', label: 'Artista solista' },
      { id: 'dancers', label: 'Show de baile' },
      { id: 'magician', label: 'Mago / Ilusionista' },
      { id: 'comedian', label: 'Comediante / Stand-up' },
      { id: 'photo_booth', label: 'Cabina de fotos' },
      { id: 'caricaturist', label: 'Caricaturista' },
      { id: 'fireworks', label: 'Fuegos artificiales' },
      { id: 'casino', label: 'Casino / Juegos' },
      { id: 'karaoke_pro', label: 'Karaoke profesional' },
      { id: 'mariachi', label: 'Mariachi' },
    ],
    required: true,
    weight: 30,
  },
  {
    id: 'ent_p_moments',
    question: '¿En qué momentos del evento puedes actuar?',
    type: 'multiple',
    options: [
      { id: 'ceremony', label: 'Durante la ceremonia' },
      { id: 'cocktail', label: 'Durante el cóctel' },
      { id: 'dinner', label: 'Durante la cena' },
      { id: 'party', label: 'Durante la fiesta' },
      { id: 'special_moment', label: 'Momentos especiales' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'ent_p_duration_min',
    question: 'Duración mínima de tu show (minutos)',
    type: 'number',
    min: 15,
    max: 240,
    required: true,
    weight: 10,
  },
  {
    id: 'ent_p_duration_max',
    question: 'Duración máxima de tu show (minutos)',
    type: 'number',
    min: 30,
    max: 480,
    required: true,
    weight: 0,
  },
  {
    id: 'ent_p_price_min',
    question: 'Precio mínimo de tu servicio (CLP)',
    type: 'number',
    min: 50000,
    max: 5000000,
    step: 25000,
    required: true,
    weight: 20,
  },
  {
    id: 'ent_p_price_max',
    question: 'Precio máximo de tu servicio (CLP)',
    type: 'number',
    min: 50000,
    max: 10000000,
    step: 25000,
    required: true,
    weight: 0,
  },
  {
    id: 'ent_p_styles',
    question: '¿Qué estilos de entretenimiento manejas?',
    type: 'multiple',
    options: [
      { id: 'elegant', label: 'Elegante / Sofisticado' },
      { id: 'fun', label: 'Divertido / Animado' },
      { id: 'romantic', label: 'Romántico' },
      { id: 'interactive', label: 'Interactivo' },
      { id: 'surprise', label: 'Sorpresa' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'ent_p_audience',
    question: '¿Para qué audiencias trabajas?',
    type: 'multiple',
    options: [
      { id: 'adults_only', label: 'Solo adultos' },
      { id: 'family', label: 'Familiar' },
      { id: 'mixed', label: 'Mixto' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'ent_p_equipment',
    question: '¿Qué equipo incluyes?',
    type: 'multiple',
    options: [
      { id: 'sound', label: 'Equipo de sonido' },
      { id: 'lighting', label: 'Iluminación' },
      { id: 'props', label: 'Props / Accesorios' },
      { id: 'stage', label: 'Escenario portátil' },
      { id: 'none', label: 'Solo el show, sin equipo' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'ent_p_team_size',
    question: '¿Cuántas personas conforman tu show?',
    type: 'single',
    options: [
      { id: '1', label: 'Solo yo' },
      { id: '2_3', label: '2-3 personas' },
      { id: '4_6', label: '4-6 personas' },
      { id: 'over_6', label: 'Más de 6 personas' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'ent_p_travel',
    question: '¿Viajas fuera de tu región?',
    type: 'boolean',
    required: true,
    weight: 0,
  },
];
```

---

### 2.2 Categoría TORTAS (cakes)

**Nuevo archivo:** `src/lib/surveys/cakes.ts`

> **Nota:** Esta categoría cubre tortas de novios, mesas de dulces y postres especiales.

#### ENCUESTA DE USUARIOS (`CAKES_USER_QUESTIONS`)

```typescript
export const CAKES_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'cakes_u_type',
    question: '¿Qué tipo de torta o dulces necesitas?',
    type: 'multiple',
    options: [
      { id: 'wedding_cake', label: 'Torta de novios tradicional' },
      { id: 'naked_cake', label: 'Naked cake', description: 'Sin cobertura externa' },
      { id: 'fondant', label: 'Torta con fondant', description: 'Decoración elaborada' },
      { id: 'buttercream', label: 'Torta con buttercream', description: 'Crema de mantequilla' },
      { id: 'dessert_table', label: 'Mesa de dulces completa' },
      { id: 'cupcakes', label: 'Cupcakes' },
      { id: 'macarons', label: 'Macarons' },
      { id: 'donuts', label: 'Donuts' },
      { id: 'mini_desserts', label: 'Mini postres variados' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'cakes_u_servings',
    question: '¿Para cuántas porciones necesitas la torta?',
    type: 'single',
    options: [
      { id: 'under_50', label: 'Menos de 50 porciones' },
      { id: '50_100', label: '50 - 100 porciones' },
      { id: '100_150', label: '100 - 150 porciones' },
      { id: '150_200', label: '150 - 200 porciones' },
      { id: 'over_200', label: 'Más de 200 porciones' },
      { id: 'skip', label: 'Omitir' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_u_tiers',
    question: '¿Cuántos pisos te gustaría que tenga la torta?',
    type: 'single',
    options: [
      { id: '1', label: '1 piso' },
      { id: '2', label: '2 pisos' },
      { id: '3', label: '3 pisos' },
      { id: '4_plus', label: '4 o más pisos' },
      { id: 'no_preference', label: 'Sin preferencia' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'cakes_u_flavor',
    question: '¿Qué sabores prefieres?',
    type: 'multiple',
    options: [
      { id: 'vanilla', label: 'Vainilla' },
      { id: 'chocolate', label: 'Chocolate' },
      { id: 'red_velvet', label: 'Red velvet' },
      { id: 'lemon', label: 'Limón' },
      { id: 'carrot', label: 'Zanahoria' },
      { id: 'fruit', label: 'Frutas' },
      { id: 'dulce_leche', label: 'Dulce de leche' },
      { id: 'coffee', label: 'Café / Moka' },
      { id: 'mixed', label: 'Diferentes sabores por piso' },
      { id: 'other', label: 'Otro' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_u_style',
    question: '¿Qué estilo de decoración prefieres?',
    type: 'single',
    options: [
      { id: 'classic', label: 'Clásico / Elegante', description: 'Tradicional y sofisticado' },
      { id: 'modern', label: 'Moderno / Minimalista', description: 'Líneas limpias' },
      { id: 'rustic', label: 'Rústico', description: 'Natural y campestre' },
      { id: 'romantic', label: 'Romántico', description: 'Flores y detalles delicados' },
      { id: 'glamorous', label: 'Glamoroso', description: 'Dorado, brillos' },
      { id: 'whimsical', label: 'Fantasía', description: 'Creativo y único' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_u_budget',
    question: '¿Cuál es tu presupuesto para torta/dulces?',
    type: 'single',
    options: [
      { id: 'under_100k', label: 'Menos de $100.000' },
      { id: '100k_200k', label: '$100.000 - $200.000' },
      { id: '200k_400k', label: '$200.000 - $400.000' },
      { id: '400k_600k', label: '$400.000 - $600.000' },
      { id: 'over_600k', label: 'Más de $600.000' },
      { id: 'skip', label: 'Omitir' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_u_dietary',
    question: '¿Necesitas opciones especiales?',
    type: 'multiple',
    options: [
      { id: 'gluten_free', label: 'Sin gluten' },
      { id: 'vegan', label: 'Vegana' },
      { id: 'sugar_free', label: 'Sin azúcar' },
      { id: 'lactose_free', label: 'Sin lactosa' },
      { id: 'none', label: 'Ninguna' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'cakes_u_tasting',
    question: '¿Quieres degustación previa?',
    type: 'single',
    options: [
      { id: 'required', label: 'Indispensable' },
      { id: 'preferred', label: 'Preferible' },
      { id: 'not_needed', label: 'No necesario' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'cakes_u_delivery',
    question: '¿Necesitas entrega y montaje en el lugar?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí, entrega y montaje' },
      { id: 'delivery_only', label: 'Solo entrega' },
      { id: 'pickup', label: 'Yo la retiro' },
    ],
    required: true,
    weight: 5,
  },
];
```

#### ENCUESTA DE PROVEEDORES (`CAKES_PROVIDER_QUESTIONS`)

```typescript
export const CAKES_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'cakes_p_types',
    question: '¿Qué tipo de tortas y dulces ofreces?',
    type: 'multiple',
    options: [
      { id: 'wedding_cake', label: 'Torta de novios tradicional' },
      { id: 'naked_cake', label: 'Naked cake' },
      { id: 'fondant', label: 'Torta con fondant' },
      { id: 'buttercream', label: 'Torta con buttercream' },
      { id: 'dessert_table', label: 'Mesa de dulces completa' },
      { id: 'cupcakes', label: 'Cupcakes' },
      { id: 'macarons', label: 'Macarons' },
      { id: 'donuts', label: 'Donuts' },
      { id: 'mini_desserts', label: 'Mini postres variados' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'cakes_p_servings_min',
    question: 'Mínimo de porciones que preparas',
    type: 'number',
    min: 10,
    max: 200,
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_p_servings_max',
    question: 'Máximo de porciones que preparas',
    type: 'number',
    min: 50,
    max: 500,
    required: true,
    weight: 0,
  },
  {
    id: 'cakes_p_tiers_max',
    question: '¿Hasta cuántos pisos puedes hacer?',
    type: 'single',
    options: [
      { id: '1', label: '1 piso' },
      { id: '2', label: '2 pisos' },
      { id: '3', label: '3 pisos' },
      { id: '4', label: '4 pisos' },
      { id: '5_plus', label: '5 o más pisos' },
    ],
    required: true,
    weight: 10,
  },
  {
    id: 'cakes_p_flavors',
    question: '¿Qué sabores ofreces?',
    type: 'multiple',
    options: [
      { id: 'vanilla', label: 'Vainilla' },
      { id: 'chocolate', label: 'Chocolate' },
      { id: 'red_velvet', label: 'Red velvet' },
      { id: 'lemon', label: 'Limón' },
      { id: 'carrot', label: 'Zanahoria' },
      { id: 'fruit', label: 'Frutas' },
      { id: 'dulce_leche', label: 'Dulce de leche' },
      { id: 'coffee', label: 'Café / Moka' },
      { id: 'custom', label: 'Sabores personalizados' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_p_styles',
    question: '¿Qué estilos de decoración manejas?',
    type: 'multiple',
    options: [
      { id: 'classic', label: 'Clásico / Elegante' },
      { id: 'modern', label: 'Moderno / Minimalista' },
      { id: 'rustic', label: 'Rústico' },
      { id: 'romantic', label: 'Romántico' },
      { id: 'glamorous', label: 'Glamoroso' },
      { id: 'whimsical', label: 'Fantasía' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_p_price_min',
    question: 'Precio mínimo de torta de novios (CLP)',
    type: 'number',
    min: 30000,
    max: 1000000,
    step: 10000,
    required: true,
    weight: 15,
  },
  {
    id: 'cakes_p_price_max',
    question: 'Precio máximo de torta de novios (CLP)',
    type: 'number',
    min: 50000,
    max: 2000000,
    step: 10000,
    required: true,
    weight: 0,
  },
  {
    id: 'cakes_p_dietary',
    question: '¿Qué opciones especiales ofreces?',
    type: 'multiple',
    options: [
      { id: 'gluten_free', label: 'Sin gluten' },
      { id: 'vegan', label: 'Vegana' },
      { id: 'sugar_free', label: 'Sin azúcar' },
      { id: 'lactose_free', label: 'Sin lactosa' },
      { id: 'none', label: 'Ninguna' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'cakes_p_tasting',
    question: '¿Ofreces degustación previa?',
    type: 'single',
    options: [
      { id: 'yes_free', label: 'Sí, gratis' },
      { id: 'yes_paid', label: 'Sí, con costo' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'cakes_p_delivery',
    question: '¿Ofreces entrega y montaje?',
    type: 'single',
    options: [
      { id: 'yes_included', label: 'Sí, incluido' },
      { id: 'yes_extra', label: 'Sí, con costo adicional' },
      { id: 'delivery_only', label: 'Solo entrega' },
      { id: 'no', label: 'No, solo retiro' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'cakes_p_lead_time',
    question: '¿Con cuánta anticipación necesitas el pedido?',
    type: 'single',
    options: [
      { id: '1_week', label: '1 semana' },
      { id: '2_weeks', label: '2 semanas' },
      { id: '1_month', label: '1 mes' },
      { id: '2_months', label: '2 meses o más' },
    ],
    required: true,
    weight: 0,
  },
];
```

---

### 2.3 Categoría TRANSPORTE (transport)

**Nuevo archivo:** `src/lib/surveys/transport.ts`

> **Nota:** Esta categoría cubre transporte para novios, invitados y servicios relacionados.

#### ENCUESTA DE USUARIOS (`TRANSPORT_USER_QUESTIONS`)

```typescript
export const TRANSPORT_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'transport_u_type',
    question: '¿Qué tipo de transporte necesitas?',
    type: 'multiple',
    options: [
      { id: 'bride_groom', label: 'Para novios', description: 'Vehículo especial para la pareja' },
      { id: 'guests', label: 'Para invitados', description: 'Traslado de invitados' },
      { id: 'bridal_party', label: 'Para cortejo', description: 'Damas de honor, padrinos' },
      { id: 'family', label: 'Para familia', description: 'Padres y familia cercana' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'transport_u_vehicle_type',
    question: '¿Qué tipo de vehículo prefieres para los novios?',
    type: 'single',
    options: [
      { id: 'classic_car', label: 'Auto clásico / Vintage', description: 'Autos antiguos elegantes' },
      { id: 'luxury_car', label: 'Auto de lujo', description: 'Mercedes, BMW, Audi, etc.' },
      { id: 'limousine', label: 'Limusina', description: 'Limusina tradicional' },
      { id: 'convertible', label: 'Convertible', description: 'Auto descapotable' },
      { id: 'carriage', label: 'Carruaje', description: 'Carruaje con caballos' },
      { id: 'sports_car', label: 'Auto deportivo', description: 'Ferrari, Porsche, etc.' },
      { id: 'motorcycle', label: 'Motocicleta', description: 'Harley, Vespa, etc.' },
      { id: 'van', label: 'Van / Minibus', description: 'Para grupo pequeño' },
      { id: 'no_preference', label: 'Sin preferencia' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'transport_u_guest_vehicle',
    question: '¿Qué tipo de transporte necesitas para invitados?',
    type: 'single',
    options: [
      { id: 'bus', label: 'Bus', description: 'Capacidad 40+ personas' },
      { id: 'minibus', label: 'Minibus', description: 'Capacidad 15-25 personas' },
      { id: 'vans', label: 'Vans múltiples', description: 'Varias vans pequeñas' },
      { id: 'shuttle', label: 'Servicio de shuttle', description: 'Ida y vuelta continuo' },
      { id: 'not_needed', label: 'No necesito para invitados' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'transport_u_route',
    question: '¿Qué rutas necesitas cubrir?',
    type: 'multiple',
    options: [
      { id: 'home_ceremony', label: 'Casa → Ceremonia' },
      { id: 'ceremony_venue', label: 'Ceremonia → Recepción' },
      { id: 'venue_hotel', label: 'Recepción → Hotel/Casas' },
      { id: 'hotel_venue', label: 'Hotel → Venue (invitados)' },
      { id: 'full_circuit', label: 'Circuito completo' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'transport_u_budget',
    question: '¿Cuál es tu presupuesto para transporte?',
    type: 'single',
    options: [
      { id: 'under_200k', label: 'Menos de $200.000' },
      { id: '200k_400k', label: '$200.000 - $400.000' },
      { id: '400k_700k', label: '$400.000 - $700.000' },
      { id: '700k_1200k', label: '$700.000 - $1.200.000' },
      { id: 'over_1200k', label: 'Más de $1.200.000' },
      { id: 'skip', label: 'Omitir' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'transport_u_decoration',
    question: '¿Quieres decoración en el vehículo de novios?',
    type: 'single',
    options: [
      { id: 'yes', label: 'Sí, con decoración' },
      { id: 'simple', label: 'Decoración simple', description: 'Cintas, flores básicas' },
      { id: 'no', label: 'No, sin decoración' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'transport_u_driver',
    question: '¿Necesitas chofer profesional?',
    type: 'single',
    options: [
      { id: 'yes_formal', label: 'Sí, con uniforme formal' },
      { id: 'yes_casual', label: 'Sí, vestimenta casual' },
      { id: 'no', label: 'No, manejaré yo' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'transport_u_hours',
    question: '¿Por cuántas horas necesitas el servicio?',
    type: 'single',
    options: [
      { id: '2', label: '2 horas' },
      { id: '4', label: '4 horas' },
      { id: '6', label: '6 horas' },
      { id: '8', label: '8 horas' },
      { id: 'full_day', label: 'Día completo' },
    ],
    required: true,
    weight: 5,
  },
];
```

#### ENCUESTA DE PROVEEDORES (`TRANSPORT_PROVIDER_QUESTIONS`)

```typescript
export const TRANSPORT_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'transport_p_service_types',
    question: '¿Qué servicios de transporte ofreces?',
    type: 'multiple',
    options: [
      { id: 'bride_groom', label: 'Para novios' },
      { id: 'guests', label: 'Para invitados' },
      { id: 'bridal_party', label: 'Para cortejo' },
      { id: 'family', label: 'Para familia' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'transport_p_vehicle_types',
    question: '¿Qué tipos de vehículos tienes disponibles?',
    type: 'multiple',
    options: [
      { id: 'classic_car', label: 'Auto clásico / Vintage' },
      { id: 'luxury_car', label: 'Auto de lujo' },
      { id: 'limousine', label: 'Limusina' },
      { id: 'convertible', label: 'Convertible' },
      { id: 'carriage', label: 'Carruaje' },
      { id: 'sports_car', label: 'Auto deportivo' },
      { id: 'motorcycle', label: 'Motocicleta' },
      { id: 'van', label: 'Van / Minibus' },
      { id: 'bus', label: 'Bus' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'transport_p_capacity_max',
    question: '¿Cuál es la capacidad máxima de pasajeros que puedes transportar?',
    type: 'number',
    min: 2,
    max: 100,
    required: true,
    weight: 15,
  },
  {
    id: 'transport_p_price_min',
    question: 'Precio mínimo del servicio (CLP)',
    type: 'number',
    min: 50000,
    max: 2000000,
    step: 25000,
    required: true,
    weight: 15,
  },
  {
    id: 'transport_p_price_max',
    question: 'Precio máximo del servicio (CLP)',
    type: 'number',
    min: 100000,
    max: 5000000,
    step: 25000,
    required: true,
    weight: 0,
  },
  {
    id: 'transport_p_decoration',
    question: '¿Ofreces decoración del vehículo?',
    type: 'single',
    options: [
      { id: 'yes_included', label: 'Sí, incluida' },
      { id: 'yes_extra', label: 'Sí, con costo adicional' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'transport_p_driver',
    question: '¿Incluyes chofer profesional?',
    type: 'single',
    options: [
      { id: 'yes_formal', label: 'Sí, con uniforme formal' },
      { id: 'yes_casual', label: 'Sí, vestimenta casual' },
      { id: 'optional', label: 'Opcional' },
      { id: 'no', label: 'No, solo arriendo vehículo' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'transport_p_hours_min',
    question: 'Mínimo de horas de servicio',
    type: 'number',
    min: 1,
    max: 12,
    required: true,
    weight: 5,
  },
  {
    id: 'transport_p_hours_max',
    question: 'Máximo de horas de servicio',
    type: 'number',
    min: 2,
    max: 24,
    required: true,
    weight: 0,
  },
  {
    id: 'transport_p_extras',
    question: '¿Qué extras ofreces?',
    type: 'multiple',
    options: [
      { id: 'champagne', label: 'Champagne / Bebidas' },
      { id: 'music', label: 'Sistema de música' },
      { id: 'red_carpet', label: 'Alfombra roja' },
      { id: 'photos', label: 'Sesión de fotos con vehículo' },
      { id: 'none', label: 'Sin extras' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'transport_p_travel',
    question: '¿Viajas fuera de tu zona?',
    type: 'boolean',
    required: true,
    weight: 0,
  },
];
```

---

### 2.4 Categoría INVITACIONES (invitations)

**Nuevo archivo:** `src/lib/surveys/invitations.ts`

> **Nota:** Esta categoría cubre invitaciones físicas, digitales y papelería de boda.

#### ENCUESTA DE USUARIOS (`INVITATIONS_USER_QUESTIONS`)

```typescript
export const INVITATIONS_USER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'inv_u_type',
    question: '¿Qué tipo de invitaciones prefieres?',
    type: 'single',
    options: [
      { id: 'printed', label: 'Impresas / Físicas', description: 'Invitaciones tradicionales' },
      { id: 'digital', label: 'Digitales', description: 'Para enviar por WhatsApp/Email' },
      { id: 'both', label: 'Ambas', description: 'Físicas + Digitales' },
      { id: 'video', label: 'Video invitación', description: 'Invitación animada en video' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'inv_u_quantity',
    question: '¿Cuántas invitaciones necesitas?',
    type: 'single',
    options: [
      { id: 'under_50', label: 'Menos de 50' },
      { id: '50_100', label: '50 - 100' },
      { id: '100_150', label: '100 - 150' },
      { id: '150_200', label: '150 - 200' },
      { id: 'over_200', label: 'Más de 200' },
      { id: 'skip', label: 'Omitir' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'inv_u_style',
    question: '¿Qué estilo de diseño prefieres?',
    type: 'single',
    options: [
      { id: 'classic', label: 'Clásico / Elegante', description: 'Tradicional y sofisticado' },
      { id: 'modern', label: 'Moderno / Minimalista', description: 'Líneas limpias' },
      { id: 'rustic', label: 'Rústico', description: 'Natural y campestre' },
      { id: 'romantic', label: 'Romántico', description: 'Delicado y femenino' },
      { id: 'bohemian', label: 'Bohemio', description: 'Artístico y libre' },
      { id: 'glamorous', label: 'Glamoroso', description: 'Lujoso con detalles' },
      { id: 'vintage', label: 'Vintage', description: 'Estilo retro' },
      { id: 'custom', label: 'Personalizado', description: 'Diseño único' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'inv_u_extras',
    question: '¿Qué elementos adicionales necesitas?',
    type: 'multiple',
    options: [
      { id: 'save_the_date', label: 'Save the Date' },
      { id: 'rsvp', label: 'Tarjetas RSVP' },
      { id: 'menu', label: 'Menú' },
      { id: 'place_cards', label: 'Tarjetas de ubicación' },
      { id: 'thank_you', label: 'Tarjetas de agradecimiento' },
      { id: 'programs', label: 'Programas de ceremonia' },
      { id: 'envelope', label: 'Sobres personalizados' },
      { id: 'sealing_wax', label: 'Lacre / Sello de cera' },
      { id: 'none', label: 'Solo invitaciones' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'inv_u_budget',
    question: '¿Cuál es tu presupuesto para invitaciones?',
    type: 'single',
    options: [
      { id: 'under_100k', label: 'Menos de $100.000' },
      { id: '100k_200k', label: '$100.000 - $200.000' },
      { id: '200k_400k', label: '$200.000 - $400.000' },
      { id: '400k_600k', label: '$400.000 - $600.000' },
      { id: 'over_600k', label: 'Más de $600.000' },
      { id: 'skip', label: 'Omitir' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'inv_u_paper',
    question: '¿Qué tipo de papel prefieres? (solo para impresas)',
    type: 'single',
    options: [
      { id: 'standard', label: 'Estándar', description: 'Papel couché o similar' },
      { id: 'cotton', label: 'Algodón', description: 'Textura premium' },
      { id: 'recycled', label: 'Reciclado', description: 'Ecológico' },
      { id: 'textured', label: 'Texturizado', description: 'Con relieve' },
      { id: 'transparent', label: 'Acrílico / Transparente' },
      { id: 'no_preference', label: 'Sin preferencia' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_u_printing',
    question: '¿Qué técnica de impresión prefieres?',
    type: 'single',
    options: [
      { id: 'digital', label: 'Digital', description: 'Económica y versátil' },
      { id: 'letterpress', label: 'Letterpress', description: 'Relieve tradicional' },
      { id: 'foil', label: 'Hot stamping / Foil', description: 'Detalles metalizados' },
      { id: 'embossed', label: 'Embossing', description: 'Relieve sin tinta' },
      { id: 'laser_cut', label: 'Corte láser', description: 'Diseños calados' },
      { id: 'no_preference', label: 'Sin preferencia' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_u_timeline',
    question: '¿Cuándo necesitas las invitaciones?',
    type: 'single',
    options: [
      { id: '2_weeks', label: '2 semanas' },
      { id: '1_month', label: '1 mes' },
      { id: '2_months', label: '2 meses' },
      { id: '3_months', label: '3 meses o más' },
      { id: 'flexible', label: 'Flexible' },
    ],
    required: true,
    weight: 5,
  },
];
```

#### ENCUESTA DE PROVEEDORES (`INVITATIONS_PROVIDER_QUESTIONS`)

```typescript
export const INVITATIONS_PROVIDER_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'inv_p_types',
    question: '¿Qué tipos de invitaciones ofreces?',
    type: 'multiple',
    options: [
      { id: 'printed', label: 'Impresas / Físicas' },
      { id: 'digital', label: 'Digitales' },
      { id: 'video', label: 'Video invitación' },
    ],
    required: true,
    weight: 25,
  },
  {
    id: 'inv_p_styles',
    question: '¿Qué estilos de diseño manejas?',
    type: 'multiple',
    options: [
      { id: 'classic', label: 'Clásico / Elegante' },
      { id: 'modern', label: 'Moderno / Minimalista' },
      { id: 'rustic', label: 'Rústico' },
      { id: 'romantic', label: 'Romántico' },
      { id: 'bohemian', label: 'Bohemio' },
      { id: 'glamorous', label: 'Glamoroso' },
      { id: 'vintage', label: 'Vintage' },
      { id: 'custom', label: 'Personalizado' },
    ],
    required: true,
    weight: 20,
  },
  {
    id: 'inv_p_extras',
    question: '¿Qué papelería adicional ofreces?',
    type: 'multiple',
    options: [
      { id: 'save_the_date', label: 'Save the Date' },
      { id: 'rsvp', label: 'Tarjetas RSVP' },
      { id: 'menu', label: 'Menú' },
      { id: 'place_cards', label: 'Tarjetas de ubicación' },
      { id: 'thank_you', label: 'Tarjetas de agradecimiento' },
      { id: 'programs', label: 'Programas de ceremonia' },
      { id: 'envelope', label: 'Sobres personalizados' },
      { id: 'sealing_wax', label: 'Lacre / Sello de cera' },
    ],
    required: true,
    weight: 15,
  },
  {
    id: 'inv_p_price_min',
    question: 'Precio mínimo por invitación (CLP)',
    type: 'number',
    min: 500,
    max: 20000,
    step: 500,
    required: true,
    weight: 15,
  },
  {
    id: 'inv_p_price_max',
    question: 'Precio máximo por invitación (CLP)',
    type: 'number',
    min: 1000,
    max: 50000,
    step: 500,
    required: true,
    weight: 0,
  },
  {
    id: 'inv_p_min_quantity',
    question: 'Cantidad mínima de pedido',
    type: 'number',
    min: 10,
    max: 100,
    required: true,
    weight: 15,
  },
  {
    id: 'inv_p_papers',
    question: '¿Qué tipos de papel trabajas?',
    type: 'multiple',
    options: [
      { id: 'standard', label: 'Estándar' },
      { id: 'cotton', label: 'Algodón' },
      { id: 'recycled', label: 'Reciclado' },
      { id: 'textured', label: 'Texturizado' },
      { id: 'transparent', label: 'Acrílico / Transparente' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_p_printing',
    question: '¿Qué técnicas de impresión ofreces?',
    type: 'multiple',
    options: [
      { id: 'digital', label: 'Digital' },
      { id: 'letterpress', label: 'Letterpress' },
      { id: 'foil', label: 'Hot stamping / Foil' },
      { id: 'embossed', label: 'Embossing' },
      { id: 'laser_cut', label: 'Corte láser' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_p_lead_time',
    question: '¿Cuál es tu tiempo de entrega habitual?',
    type: 'single',
    options: [
      { id: '1_week', label: '1 semana' },
      { id: '2_weeks', label: '2 semanas' },
      { id: '3_weeks', label: '3 semanas' },
      { id: '1_month', label: '1 mes' },
      { id: 'over_1_month', label: 'Más de 1 mes' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_p_samples',
    question: '¿Ofreces muestras previas?',
    type: 'single',
    options: [
      { id: 'yes_free', label: 'Sí, gratis' },
      { id: 'yes_paid', label: 'Sí, con costo' },
      { id: 'digital_only', label: 'Solo prueba digital' },
      { id: 'no', label: 'No' },
    ],
    required: true,
    weight: 5,
  },
  {
    id: 'inv_p_shipping',
    question: '¿Ofreces envío?',
    type: 'single',
    options: [
      { id: 'yes_included', label: 'Sí, incluido' },
      { id: 'yes_extra', label: 'Sí, con costo adicional' },
      { id: 'pickup_only', label: 'Solo retiro' },
    ],
    required: true,
    weight: 0,
  },
];
```

---

## PARTE 3: CAMBIOS EN EL SISTEMA

### 3.1 Actualizar `CategoryId` en `authStore.ts`

```typescript
export type CategoryId = 
  | 'catering'        // 1. Banquetera
  | 'venue'           // 2. Centro de eventos
  | 'photography'     // 3. Fotografía
  | 'video'           // 4. Video
  | 'dj'              // 5. DJ/VJ
  | 'decoration'      // 6. Decoración
  | 'entertainment'   // 7. Entretenimiento
  | 'makeup'          // 8. Maquillaje
  | 'cakes'           // 9. Tortas (NUEVA)
  | 'transport'       // 10. Transporte (NUEVA)
  | 'invitations'     // 11. Invitaciones (NUEVA)
  | 'dress'           // 12. Vestuario
  | 'wedding_planner';// 13. Wedding Planner
```

### 3.2 Actualizar `CATEGORY_INFO` en `authStore.ts`

```typescript
export const CATEGORY_INFO: Record<CategoryId, { id: CategoryId; name: string; icon: string }> = {
  catering: { id: 'catering', name: 'Banquetería', icon: 'utensils' },
  venue: { id: 'venue', name: 'Centro de Eventos', icon: 'building' },
  photography: { id: 'photography', name: 'Fotografía', icon: 'camera' },
  video: { id: 'video', name: 'Videografía', icon: 'video' },
  dj: { id: 'dj', name: 'DJ/VJ', icon: 'music' },
  decoration: { id: 'decoration', name: 'Decoración', icon: 'flower' },
  entertainment: { id: 'entertainment', name: 'Entretenimiento', icon: 'party' },
  makeup: { id: 'makeup', name: 'Maquillaje & Peinado', icon: 'sparkles' },
  cakes: { id: 'cakes', name: 'Tortas & Dulces', icon: 'cake' },           // NUEVA
  transport: { id: 'transport', name: 'Transporte', icon: 'car' },         // NUEVA
  invitations: { id: 'invitations', name: 'Invitaciones', icon: 'mail' },  // NUEVA
  dress: { id: 'dress', name: 'Vestidos & Trajes', icon: 'dress' },
  wedding_planner: { id: 'wedding_planner', name: 'Wedding Planner', icon: 'clipboard' },
};
```

### 3.3 Actualizar `ALL_CATEGORIES` en `authStore.ts`

```typescript
export const ALL_CATEGORIES: CategoryId[] = [
  'catering',        // 1. Banquetera
  'venue',           // 2. Centro de eventos
  'photography',     // 3. Fotografía
  'video',           // 4. Video
  'dj',              // 5. DJ/VJ
  'decoration',      // 6. Decoración
  'entertainment',   // 7. Entretenimiento
  'makeup',          // 8. Maquillaje
  'cakes',           // 9. Tortas (NUEVA)
  'transport',       // 10. Transporte (NUEVA)
  'invitations',     // 11. Invitaciones (NUEVA)
  'dress',           // 12. Vestuario
  'wedding_planner', // 13. Wedding Planner
];
```

### 3.4 Actualizar `src/lib/surveys/index.ts`

```typescript
// Agregar imports
import { ENTERTAINMENT_USER_QUESTIONS, ENTERTAINMENT_PROVIDER_QUESTIONS } from './entertainment';
import { CAKES_USER_QUESTIONS, CAKES_PROVIDER_QUESTIONS } from './cakes';
import { TRANSPORT_USER_QUESTIONS, TRANSPORT_PROVIDER_QUESTIONS } from './transport';
import { INVITATIONS_USER_QUESTIONS, INVITATIONS_PROVIDER_QUESTIONS } from './invitations';

// Agregar a CATEGORY_INFO
entertainment: {
  name: 'Entretenimiento',
  description: 'Shows y actividades para tu evento',
  icon: 'party',
},
cakes: {
  name: 'Tortas & Dulces',
  description: 'Tortas de novios y mesas de dulces',
  icon: 'cake',
},
transport: {
  name: 'Transporte',
  description: 'Traslado para novios e invitados',
  icon: 'car',
},
invitations: {
  name: 'Invitaciones',
  description: 'Invitaciones y papelería de boda',
  icon: 'mail',
},

// Agregar a CATEGORY_SURVEYS
entertainment: {
  categoryId: 'entertainment',
  categoryName: 'Entretenimiento',
  description: 'Cuéntanos sobre el entretenimiento que buscas',
  userQuestions: ENTERTAINMENT_USER_QUESTIONS,
  providerQuestions: ENTERTAINMENT_PROVIDER_QUESTIONS,
},
cakes: {
  categoryId: 'cakes',
  categoryName: 'Tortas & Dulces',
  description: 'Cuéntanos sobre tus preferencias de torta y dulces',
  userQuestions: CAKES_USER_QUESTIONS,
  providerQuestions: CAKES_PROVIDER_QUESTIONS,
},
transport: {
  categoryId: 'transport',
  categoryName: 'Transporte',
  description: 'Cuéntanos sobre tus necesidades de transporte',
  userQuestions: TRANSPORT_USER_QUESTIONS,
  providerQuestions: TRANSPORT_PROVIDER_QUESTIONS,
},
invitations: {
  categoryId: 'invitations',
  categoryName: 'Invitaciones',
  description: 'Cuéntanos sobre tus preferencias de invitaciones',
  userQuestions: INVITATIONS_USER_QUESTIONS,
  providerQuestions: INVITATIONS_PROVIDER_QUESTIONS,
},
```

---

## PARTE 4: RESUMEN DE ARCHIVOS A CREAR/MODIFICAR

### Archivos a CREAR:
1. `src/lib/surveys/entertainment.ts`
2. `src/lib/surveys/cakes.ts`
3. `src/lib/surveys/transport.ts`
4. `src/lib/surveys/invitations.ts`

### Archivos a MODIFICAR:
1. `src/lib/surveys/catering.ts` - Ajustes según feedback
2. `src/lib/surveys/venue.ts` - Ajustes según feedback
3. `src/lib/surveys/photography.ts` - Ajustes según feedback
4. `src/lib/surveys/video.ts` - Ajustes según feedback
5. `src/lib/surveys/dj.ts` - Ajustes según feedback
6. `src/lib/surveys/index.ts` - Agregar nuevas categorías
7. `src/store/authStore.ts` - Agregar nuevos CategoryIds

---

## PARTE 5: NOTAS IMPORTANTES PARA IMPLEMENTACIÓN

### Consideraciones Generales:

1. **Opción "Omitir"**: Se recomienda agregar `{ id: 'skip', label: 'Omitir' }` a todas las preguntas de presupuesto para mayor flexibilidad.

2. **Número de invitados**: Ya NO se pregunta en las encuestas de categoría porque se obtiene del wizard de registro del usuario.

3. **Consistencia de IDs**: Mantener el patrón de naming:
   - Usuario: `{categoria}_u_{concepto}`
   - Proveedor: `{categoria}_p_{concepto}`

4. **Weights (Pesos)**: Los pesos definen la importancia en el matchmaking:
   - 25-30: Muy importante (tipo de servicio, estilo)
   - 15-20: Importante (presupuesto, duración)
   - 5-10: Moderado (extras, preferencias)
   - 0-3: Bajo (información adicional)

5. **Tipos de pregunta**:
   - `single`: Una sola opción
   - `multiple`: Múltiples opciones
   - `boolean`: Sí/No
   - `number`: Valor numérico
   - `text`: Texto libre (usar con moderación)

---

_Documento creado: Diciembre 2025_
_Versión: 1.1_
_Estado: ✅ IMPLEMENTADO_
_Fecha de implementación: Diciembre 2025_

