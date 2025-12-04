# Matri.AI - Encuestas por Categoría

## Índice

1. [Introducción](#1-introducción)
2. [Fotografía](#2-fotografía)
3. [Videografía](#3-videografía)
4. [DJ/VJ](#4-djvj)
5. [Banquetería](#5-banquetería)
6. [Centro de Eventos](#6-centro-de-eventos)
7. [Decoración](#7-decoración)
8. [Wedding Planner](#8-wedding-planner)
9. [Maquillaje & Peinado](#9-maquillaje--peinado)
10. [Entretenimiento](#10-entretenimiento)
11. [Tortas & Dulces](#11-tortas--dulces)
12. [Transporte](#12-transporte)
13. [Invitaciones](#13-invitaciones)
14. [Vestidos & Trajes](#14-vestidos--trajes)
15. [Criterios de Matchmaking](#15-criterios-de-matchmaking)

---

## 1. Introducción

Este documento detalla todas las preguntas de las mini-encuestas que deben completar tanto **usuarios (novios)** como **proveedores** para cada una de las **13 categorías** del sistema.

### Categorías Disponibles

| ID | Categoría | Icono | Descripción |
|----|-----------|-------|-------------|
| `photography` | Fotografía | 📷 | Captura los mejores momentos de tu día especial |
| `video` | Videografía | 🎬 | Revive tu boda una y otra vez |
| `dj` | DJ / VJ | 🎵 | La música perfecta para tu celebración |
| `catering` | Banquetería | 🍽️ | Delicias gastronómicas para tus invitados |
| `venue` | Centro de Eventos | 🏛️ | El lugar ideal para tu celebración |
| `decoration` | Decoración | 💐 | Transforma el espacio en un sueño |
| `wedding_planner` | Wedding Planner | 📋 | Coordinación profesional de tu evento |
| `makeup` | Maquillaje & Peinado | ✨ | Luce radiante en tu día especial |
| `entertainment` | Entretenimiento | 🎉 | Shows y actividades para tu evento |
| `cakes` | Tortas & Dulces | 🎂 | Tortas de novios y mesas de dulces |
| `transport` | Transporte | 🚗 | Traslado para novios e invitados |
| `invitations` | Invitaciones | 💌 | Invitaciones y papelería de boda |
| `dress` | Vestidos & Trajes | 👗 | El atuendo perfecto para tu día especial |

### Principio de Diseño

Las encuestas están diseñadas para que las respuestas de usuarios y proveedores sean **comparables** y permitan calcular un score de compatibilidad:

| Tipo de Pregunta | Usuario | Proveedor |
|------------------|---------|-----------|
| Selección única | Elige su preferencia | Indica si lo ofrece |
| Selección múltiple | Elige varias opciones | Indica todas las que ofrece |
| Rango numérico | Indica su presupuesto/necesidad | Indica su rango de precios/capacidad |
| Sí/No | Indica si lo necesita | Indica si lo ofrece |

### Formato de las Preguntas

Cada pregunta tiene la siguiente estructura:

```typescript
interface SurveyQuestion {
  id: string;           // Identificador único
  question: string;     // Texto de la pregunta
  type: 'single' | 'multiple' | 'range' | 'boolean' | 'text' | 'number';
  options?: Option[];   // Para single/multiple
  min?: number;         // Para range/number
  max?: number;         // Para range/number
  required: boolean;
  weight: number;       // Peso en el matchmaking (0-100)
}
```

---

## 2. Fotografía

### 2.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `photo_u_style` | ¿Qué estilo fotográfico prefieres? | multiple | `documentary` (Documental/Natural), `artistic` (Artístico/Creativo), `classic` (Clásico/Tradicional), `editorial` (Editorial/Revista), `candid` (Espontáneo/Candid), `cinematic` (Cinemático) | 25% |
| `photo_u_hours` | ¿Cuántas horas de cobertura necesitas? | single | `4` (4 horas), `6` (6 horas), `8` (8 horas), `10` (10 horas), `full_day` (Día completo +12h) | 15% |
| `photo_u_budget` | ¿Cuál es tu presupuesto para fotografía? | single | `under_500k` (Menos de $500.000), `500k_800k` ($500.000 - $800.000), `800k_1200k` ($800.000 - $1.200.000), `1200k_1800k` ($1.200.000 - $1.800.000), `over_1800k` (Más de $1.800.000) | 20% |
| `photo_u_preboda` | ¿Necesitas sesión pre-boda? | boolean | Sí / No | 5% |
| `photo_u_postboda` | ¿Te interesa sesión post-boda (trash the dress, etc.)? | boolean | Sí / No | 5% |
| `photo_u_second_shooter` | ¿Necesitas segundo fotógrafo? | single | `no` (No necesario), `preferred` (Preferible), `required` (Indispensable) | 5% |
| `photo_u_delivery_time` | ¿En cuánto tiempo necesitas las fotos? | single | `2_weeks` (2 semanas), `1_month` (1 mes), `over_1_month` (+1 mes), `indifferent` (Me es indiferente) | 5% |
| `photo_u_delivery_format` | ¿Qué formato de entrega prefieres? | multiple | `digital_hd` (Digital HD), `digital_raw` (Digital RAW), `printed_album` (Álbum impreso), `usb_box` (USB en caja especial), `online_gallery` (Galería online) | 5% |
| `photo_u_photo_count` | ¿Cuántas fotos editadas esperas recibir? | single | `under_200` (Menos de 200), `200_400` (200-400), `400_600` (400-600), `over_600` (Más de 600), `unlimited` (Sin límite) | 5% |
| `photo_u_retouching` | ¿Qué nivel de retoque prefieres? | single | `natural` (Natural/Mínimo), `moderate` (Moderado), `editorial` (Tipo revista/Alto) | 5% |

### 2.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `photo_p_styles` | ¿Qué estilos fotográficos ofreces? | multiple | `documentary`, `artistic`, `classic`, `editorial`, `candid`, `cinematic` | 25% |
| `photo_p_hours_min` | ¿Cuál es tu cobertura mínima? | number | 1-12 horas | 15% |
| `photo_p_hours_max` | ¿Cuál es tu cobertura máxima? | number | 1-24 horas | - |
| `photo_p_price_min` | Precio mínimo de tu servicio | number | CLP | 20% |
| `photo_p_price_max` | Precio máximo de tu servicio | number | CLP | - |
| `photo_p_preboda` | ¿Ofreces sesión pre-boda? | boolean | Sí / No | 5% |
| `photo_p_postboda` | ¿Ofreces sesión post-boda? | boolean | Sí / No | 5% |
| `photo_p_second_shooter` | ¿Ofreces segundo fotógrafo? | single | `no` (No), `extra_cost` (Costo adicional), `included` (Incluido en algunos paquetes), `always` (Siempre incluido) | 5% |
| `photo_p_delivery_time` | ¿Cuál es tu tiempo de entrega habitual? | single | `2_weeks`, `1_month`, `over_1_month` | 5% |
| `photo_p_delivery_formats` | ¿Qué formatos de entrega ofreces? | multiple | `digital_hd`, `digital_raw`, `printed_album`, `usb_box`, `online_gallery` | 5% |
| `photo_p_photo_count_min` | Mínimo de fotos editadas que entregas | number | 50-1000 | 5% |
| `photo_p_photo_count_max` | Máximo de fotos editadas que entregas | number | 100-2000 | - |
| `photo_p_retouching_levels` | ¿Qué niveles de retoque ofreces? | multiple | `natural`, `moderate`, `editorial` | 5% |
| `photo_p_travel` | ¿Viajas fuera de tu región? | boolean | Sí / No | 3% |
| `photo_p_experience_years` | Años de experiencia en bodas | number | 0-30 | 2% |

---

## 3. Videografía

### 3.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `video_u_style` | ¿Qué estilo de video prefieres? | multiple | `documentary` (Documental/Natural), `artistic` (Artístico/Creativo), `classic` (Clásico/Tradicional), `editorial` (Editorial/Revista), `candid` (Espontáneo/Candid), `cinematic` (Cinemático) | 25% |
| `video_u_duration` | ¿Qué duración de video final prefieres? | multiple | `highlight_3` (Highlight 3-5 min), `highlight_10` (Highlight 8-12 min), `medium_20` (Medio 15-25 min), `full_45` (Completo 30-45 min), `full_extended` (Extendido +60 min) | 15% |
| `video_u_budget` | ¿Cuál es tu presupuesto para video? | single | `under_600k` (Menos de $600.000), `600k_1000k` ($600.000 - $1.000.000), `1000k_1500k` ($1.000.000 - $1.500.000), `1500k_2500k` ($1.500.000 - $2.500.000), `over_2500k` (Más de $2.500.000) | 20% |
| `video_u_hours` | ¿Cuántas horas de cobertura necesitas? | single | `4` (4 horas), `6` (6 horas), `8` (8 horas), `10` (10 horas), `full_day` (Día completo) | 10% |
| `video_u_second_camera` | ¿Necesitas segundo camarógrafo? | single | `no` (No necesario), `preferred` (Preferible), `required` (Indispensable) | 5% |
| `video_u_drone` | ¿Te gustaría incluir tomas con drone? | single | `no` (No), `nice_to_have` (Sería bueno), `required` (Indispensable) | 5% |
| `video_u_same_day_edit` | ¿Te interesa un video editado el mismo día? | boolean | Sí / No | 5% |
| `video_u_delivery_time` | ¿En cuánto tiempo necesitas el video? | single | `2_weeks` (2 semanas), `1_month` (1 mes), `over_1_month` (+1 mes), `indifferent` (Me es indiferente) | 5% |

### 3.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `video_p_styles` | ¿Qué estilos de video ofreces? | multiple | `documentary`, `artistic`, `classic`, `editorial`, `candid`, `cinematic` | 25% |
| `video_p_durations` | ¿Qué duraciones de video ofreces? | multiple | `highlight_3`, `highlight_10`, `medium_20`, `full_45`, `full_extended` | 15% |
| `video_p_price_min` | Precio mínimo de tu servicio | number | CLP | 20% |
| `video_p_price_max` | Precio máximo de tu servicio | number | CLP | - |
| `video_p_hours_min` | Cobertura mínima | number | 1-12 horas | 10% |
| `video_p_hours_max` | Cobertura máxima | number | 1-24 horas | - |
| `video_p_second_camera` | ¿Ofreces segundo camarógrafo? | single | `no`, `extra_cost`, `included`, `always` | 5% |
| `video_p_drone` | ¿Ofreces tomas con drone? | single | `no`, `extra_cost`, `included` | 5% |
| `video_p_same_day_edit` | ¿Ofreces edición el mismo día? | boolean | Sí / No | 5% |
| `video_p_delivery_time` | Tiempo de entrega habitual | single | `2_weeks`, `1_month`, `over_1_month` | 5% |
| `video_p_equipment` | ¿Qué equipo utilizas? | multiple | `4k` (Cámaras 4K), `cinema_camera` (Cámaras de cine), `gimbal` (Estabilizador/Gimbal), `slider` (Slider), `crane` (Grúa), `lighting` (Iluminación profesional) | 2% |

---

## 4. DJ/VJ

### 4.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `dj_u_genres` | ¿Qué géneros musicales te gustan? | multiple | `reggaeton` (Reggaetón), `pop` (Pop Internacional), `pop_latino` (Pop Latino), `cumbia` (Cumbia), `salsa` (Salsa), `bachata` (Bachata), `rock` (Rock), `electronic` (Electrónica), `80s_90s` (80s y 90s), `disco` (Disco), `jazz` (Jazz/Lounge), `romantic` (Baladas/Románticas) | 25% |
| `dj_u_style` | ¿Qué estilo de fiesta prefieres? | single | `elegant` (Elegante/Sofisticado), `party` (Fiesta total), `mixed` (Mezcla de ambos), `chill` (Relajado/Lounge) | 15% |
| `dj_u_budget` | ¿Cuál es tu presupuesto para DJ? | single | `under_400k` (Menos de $400.000), `400k_600k` ($400.000 - $600.000), `600k_900k` ($600.000 - $900.000), `900k_1400k` ($900.000 - $1.400.000), `over_1400k` (Más de $1.400.000) | 20% |
| `dj_u_hours` | ¿Cuántas horas de música necesitas? | single | `5` (5 hrs), `6` (6 hrs), `7` (7 hrs), `over_7` (+7 hrs) | 10% |
| `dj_u_ceremony_music` | ¿Necesitas música para la ceremonia? | boolean | Sí / No | 5% |
| `dj_u_cocktail_music` | ¿Necesitas música para el cóctel? | boolean | Sí / No | 3% |
| `dj_u_mc` | ¿Necesitas que el DJ anime/presente? | single | `no` (No, solo música), `minimal` (Mínimo, solo anuncios), `moderate` (Moderado), `full` (Animación completa) | 10% |
| `dj_u_lighting` | ¿Qué nivel de iluminación necesitas? | single | `basic` (Básica), `standard` (Estándar), `premium` (Premium con efectos), `custom` (Personalizada) | 5% |
| `dj_u_effects` | ¿Qué efectos especiales te interesan? | multiple | `fog` (Máquina de humo), `cold_sparks` (Chispas frías), `laser` (Láser), `confetti` (Confetti), `bubbles` (Burbujas), `none` (Ninguno) | 3% |
| `dj_u_karaoke` | ¿Te gustaría tener karaoke? | boolean | Sí / No | 2% |
| `dj_u_requests` | ¿Permitirás solicitudes de invitados? | single | `no` (No), `limited` (Limitadas), `yes` (Sí, todas) | 2% |

### 4.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `dj_p_genres` | ¿Qué géneros musicales dominas? | multiple | `reggaeton`, `pop`, `pop_latino`, `cumbia`, `salsa`, `bachata`, `rock`, `electronic`, `80s_90s`, `disco`, `jazz`, `romantic` | 25% |
| `dj_p_styles` | ¿Qué estilos de fiesta manejas? | multiple | `elegant`, `party`, `mixed`, `chill` | 15% |
| `dj_p_price_min` | Precio mínimo de tu servicio | number | CLP | 20% |
| `dj_p_price_max` | Precio máximo de tu servicio | number | CLP | - |
| `dj_p_hours_min` | Horas mínimas de servicio | number | 1-8 | 10% |
| `dj_p_hours_max` | Horas máximas de servicio | number | 1-12 | - |
| `dj_p_ceremony_music` | ¿Ofreces música para ceremonia? | boolean | Sí / No | 5% |
| `dj_p_cocktail_music` | ¿Ofreces música para cóctel? | boolean | Sí / No | 3% |
| `dj_p_mc_levels` | ¿Qué niveles de animación ofreces? | multiple | `no`, `minimal`, `moderate`, `full` | 10% |
| `dj_p_lighting_levels` | ¿Qué niveles de iluminación ofreces? | multiple | `basic`, `standard`, `premium`, `custom` | 5% |
| `dj_p_effects` | ¿Qué efectos especiales ofreces? | multiple | `fog`, `cold_sparks`, `laser`, `confetti`, `bubbles` | 3% |
| `dj_p_karaoke` | ¿Ofreces karaoke? | boolean | Sí / No | 2% |
| `dj_p_screens` | ¿Ofreces pantallas/proyección? | single | `no`, `one`, `multiple` | 2% |
| `dj_p_equipment_sound` | ¿Qué equipo de sonido tienes? | multiple | `small_100` (Hasta 100 personas), `medium_200` (Hasta 200 personas), `large_400` (Hasta 400 personas), `xlarge` (Más de 400 personas), `subwoofer` (Subwoofers), `wireless_mic` (Micrófonos inalámbricos) | 5% |

---

## 5. Banquetería

### 5.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `catering_u_service_type` | ¿Qué tipo de servicio prefieres? | multiple | `cocktail` (Coctel / Finger Food), `dinner` (Cena - Entrada, fondo y postre), `buffet` (Buffet), `stations` (Estaciones temáticas), `extra` (Extra - Mesón de postres y trasnoches) | 20% |
| `catering_u_cuisine` | ¿Qué tipo de cocina prefieres? | multiple | `chilean` (Chilena tradicional), `international` (Internacional), `mediterranean` (Mediterránea), `asian` (Asiática/Fusión), `gourmet` (Gourmet/Alta cocina), `comfort` (Comfort food), `bbq` (Asados o parrilla) | 15% |
| `catering_u_budget_pp` | ¿Cuál es tu presupuesto por persona? | single | `under_25k` (Menos de $25.000), `25k_35k` ($25.000 - $35.000), `35k_50k` ($35.000 - $50.000), `50k_70k` ($50.000 - $70.000), `over_70k` (Más de $70.000), `skip` (Omitir) | 20% |
| `catering_u_courses` | ¿De cuántos tiempos quieres que sea tu cena? | single | `2` (2 tiempos), `3` (3 tiempos), `4` (4 tiempos), `5_plus` (5 o más tiempos) | 5% |
| `catering_u_dietary` | ¿Necesitas opciones especiales? | multiple | `vegetarian` (Vegetariana), `vegan` (Vegana), `gluten_free` (Sin gluten), `kosher` (Kosher), `halal` (Halal), `none` (Ninguna), `other` (Otra: ¿Cuál?) | 5% |
| `catering_u_beverages` | ¿Qué bebestibles necesitas? | multiple | `soft_drinks` (Bebidas), `juices` (Jugos / Aguas saborizadas), `wine` (Vinos), `beer` (Cerveza), `cocktails` (Cócteles), `open_bar` (Barra libre), `premium_liquor` (Licores premium) | 5% |
| `catering_u_tasting` | ¿Quieres degustación previa? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No necesario) | 3% |
| `catering_u_cake` | ¿Incluir torta de novios? | single | `yes` (Sí), `no` (No) | 5% |
| `catering_u_staff` | ¿Qué nivel de servicio esperas? | single | `basic` (Básico), `standard` (Estándar), `premium` (Premium) | 5% |
| `catering_u_setup` | ¿Necesitas montaje de mesas? | boolean | Sí / No | 2% |
| `catering_u_end_time` | ¿Hasta qué hora debe estar la banquetera en el evento? | single | `0_1am` (00:00 – 1:00 am), `2_3am` (2:00 – 3:00 am), `4_5am` (4:00 – 5:00 am), `over_5am` (+5:00 am) | 5% |

### 5.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `catering_p_service_types` | ¿Qué tipos de servicio ofreces? | multiple | `cocktail`, `dinner`, `buffet`, `stations`, `extra` | 20% |
| `catering_p_cuisines` | ¿Qué tipos de cocina ofreces? | multiple | `chilean`, `international`, `mediterranean`, `asian`, `gourmet`, `comfort`, `bbq` | 15% |
| `catering_p_price_pp_min` | Precio mínimo por persona | number | CLP | 20% |
| `catering_p_price_pp_max` | Precio máximo por persona | number | CLP | - |
| `catering_p_guests_min` | Mínimo de invitados que atiendes | number | 10-500 | 10% |
| `catering_p_guests_max` | Máximo de invitados que atiendes | number | 50-1000 | - |
| `catering_p_courses` | ¿Cuántos tiempos ofreces? | multiple | `2`, `3`, `4`, `5_plus` | 5% |
| `catering_p_dietary` | ¿Qué opciones especiales manejas? | multiple | `vegetarian`, `vegan`, `gluten_free`, `kosher`, `halal`, `other` | 5% |
| `catering_p_beverages` | ¿Qué bebestibles ofreces? | multiple | `soft_drinks`, `juices`, `wine`, `beer`, `cocktails`, `open_bar`, `premium_liquor` | 5% |
| `catering_p_tasting` | ¿Ofreces degustación previa? | single | `yes_free` (Sí, gratis), `yes_paid` (Sí, con costo), `no` (No) | 3% |
| `catering_p_cake` | ¿Ofreces torta de novios? | single | `yes`, `no` | 5% |
| `catering_p_staff_levels` | ¿Qué niveles de servicio ofreces? | multiple | `basic`, `standard`, `premium` | 5% |
| `catering_p_setup` | ¿Ofreces montaje de mesas? | boolean | Sí / No | 2% |
| `catering_p_equipment` | ¿Qué equipamiento incluyes? | multiple | `tables` (Mesas), `chairs` (Sillas), `tableware` (Vajilla), `glassware` (Cristalería), `linens` (Mantelería), `heating` (Calefacción), `tents` (Carpas) | 5% |
| `catering_p_end_time` | ¿Hasta qué hora puedes quedarte en el evento? | single | `0_1am`, `2_3am`, `4_5am`, `over_5am` | 5% |

---

## 6. Centro de Eventos

### 6.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `venue_u_type` | ¿Qué tipo de lugar prefieres? | multiple | `event_hall` (Salón de eventos), `hacienda` (Hacienda/Campo), `hotel` (Hotel), `restaurant` (Restaurant), `garden` (Jardín/Parque), `beach` (Playa), `winery` (Viña), `loft` (Loft/Industrial), `mansion` (Casona/Mansión) | 20% |
| `venue_u_setting` | ¿Interior o exterior? | single | `indoor` (Interior), `outdoor` (Exterior), `both` (Ambos/Mixto) | 15% |
| `venue_u_budget` | ¿Cuál es tu presupuesto para el lugar? | single | `under_1m` (Menos de $1.000.000), `1m_2m` ($1.000.000 - $2.000.000), `2m_4m` ($2.000.000 - $4.000.000), `4m_7m` ($4.000.000 - $7.000.000), `over_7m` (Más de $7.000.000) | 20% |
| `venue_u_exclusivity` | ¿Necesitas exclusividad del lugar? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No necesario) | 5% |
| `venue_u_ceremony_space` | ¿Necesitas espacio para ceremonia? | boolean | Sí / No | 5% |
| `venue_u_parking` | ¿Necesitas estacionamiento? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No necesario) | 5% |
| `venue_u_accommodation` | ¿Necesitas alojamiento para invitados? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No necesario) | 3% |
| `venue_u_catering_policy` | ¿Preferencia de catering? | single | `venue_only` (Solo del lugar), `external_ok` (Puede ser externo), `no_preference` (Sin preferencia) | 5% |
| `venue_u_end_time` | ¿Hasta qué hora necesitas el lugar? | single | `0_1am` (00:00 – 1:00 am), `2_3am` (2:00 – 3:00 am), `4_5am` (4:00 – 5:00 am), `over_5am` (+5:00 am) | 5% |
| `venue_u_accessibility` | ¿Necesitas accesibilidad especial? | boolean | Sí / No | 2% |
| `venue_u_dance_floor` | ¿Tiene pista de baile? | boolean | Sí / No | 5% |
| `venue_u_bridal_suite` | ¿Tiene pieza para novia y novio? | single | `yes` (Sí), `no` (No), `not_needed` (No es necesario) | 3% |

### 6.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `venue_p_type` | ¿Qué tipo de lugar eres? | multiple | `event_hall`, `hacienda`, `hotel`, `restaurant`, `garden`, `beach`, `winery`, `loft`, `mansion` | 20% |
| `venue_p_settings` | ¿Qué espacios ofreces? | multiple | `indoor`, `outdoor`, `both` | 15% |
| `venue_p_price_min` | Precio mínimo de arriendo | number | CLP | 20% |
| `venue_p_price_max` | Precio máximo de arriendo | number | CLP | - |
| `venue_p_capacity_min` | Capacidad mínima | number | 10-500 | 15% |
| `venue_p_capacity_max` | Capacidad máxima | number | 50-1000 | - |
| `venue_p_exclusivity` | ¿Ofreces exclusividad? | boolean | Sí / No | 5% |
| `venue_p_ceremony_space` | ¿Tienes espacio para ceremonia? | boolean | Sí / No | 5% |
| `venue_p_parking` | ¿Tienes estacionamiento? | single | `yes_free` (Sí, gratis), `yes_paid` (Sí, con costo), `valet` (Servicio valet), `no` (No) | 5% |
| `venue_p_accommodation` | ¿Ofreces alojamiento? | single | `yes` (Sí), `nearby` (Convenio cercano), `no` (No) | 3% |
| `venue_p_catering_policy` | ¿Política de catering? | single | `exclusive` (Solo nuestro catering), `preferred` (Preferimos el nuestro), `external_ok` (Externo permitido), `no_catering` (No ofrecemos catering) | 5% |
| `venue_p_end_time` | ¿Hasta qué hora pueden estar? | single | `0_1am`, `2_3am`, `4_5am`, `over_5am` | 5% |
| `venue_p_accessibility` | ¿Tienes accesibilidad? | boolean | Sí / No | 2% |
| `venue_p_dance_floor` | ¿Tienes pista de baile? | boolean | Sí / No | 5% |
| `venue_p_bridal_suite` | ¿Tienes pieza para novia y novio? | boolean | Sí / No | 3% |
| `venue_p_included_services` | ¿Qué servicios incluyes? | multiple | `tables` (Mesas), `chairs` (Sillas), `linens` (Mantelería), `lighting` (Iluminación básica), `sound` (Sonido básico), `coordinator` (Coordinador), `security` (Seguridad), `cleaning` (Limpieza) | 5% |

---

## 7. Decoración

### 7.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `deco_u_style` | ¿Qué estilo de decoración prefieres? | single | `romantic` (Romántico), `rustic` (Rústico), `modern` (Moderno/Minimalista), `classic` (Clásico/Elegante), `bohemian` (Bohemio), `tropical` (Tropical), `vintage` (Vintage), `glamorous` (Glamoroso) | 25% |
| `deco_u_colors` | ¿Qué paleta de colores prefieres? | multiple | `white_green` (Blanco y verde), `pastels` (Pasteles), `bold` (Colores vivos), `earth` (Tonos tierra), `jewel` (Tonos joya), `monochrome` (Monocromático), `custom` (Personalizada) | 15% |
| `deco_u_budget` | ¿Cuál es tu presupuesto para decoración? | single | `under_500k` (Menos de $500.000), `500k_1m` ($500.000 - $1.000.000), `1m_2m` ($1.000.000 - $2.000.000), `2m_4m` ($2.000.000 - $4.000.000), `over_4m` (Más de $4.000.000) | 20% |
| `deco_u_flowers` | ¿Qué tipo de flores prefieres? | multiple | `roses` (Rosas), `peonies` (Peonías), `hydrangeas` (Hortensias), `eucalyptus` (Eucalipto), `wildflowers` (Flores silvestres), `tropical` (Tropicales), `dried` (Flores secas), `no_preference` (Sin preferencia) | 10% |
| `deco_u_bridal_bouquet` | ¿Necesitas ramo de novia? | boolean | Sí / No | 5% |
| `deco_u_ceremony_deco` | ¿Necesitas decoración de ceremonia? | boolean | Sí / No | 5% |
| `deco_u_table_centerpieces` | ¿Qué tipo de centros de mesa? | single | `low` (Bajos), `tall` (Altos), `mixed` (Mixtos), `non_floral` (No florales), `no_preference` (Sin preferencia) | 5% |
| `deco_u_table_count` | ¿Cuántas mesas tendrás? | single | `under_10` (Menos de 10), `10_20` (10-20), `20_30` (20-30), `over_30` (Más de 30) | 5% |
| `deco_u_extras` | ¿Qué elementos adicionales te interesan? | multiple | `arch` (Arco de ceremonia), `backdrop` (Backdrop/Fondo), `hanging` (Instalaciones colgantes), `candles` (Velas), `neon` (Letreros neón), `balloons` (Globos), `none` (Ninguno) | 5% |
| `deco_u_rental` | ¿Necesitas arriendo de mobiliario? | boolean | Sí / No | 5% |

### 7.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `deco_p_styles` | ¿Qué estilos de decoración ofreces? | multiple | `romantic`, `rustic`, `modern`, `classic`, `bohemian`, `tropical`, `vintage`, `glamorous` | 25% |
| `deco_p_color_expertise` | ¿Qué paletas manejas mejor? | multiple | `white_green`, `pastels`, `bold`, `earth`, `jewel`, `monochrome`, `custom` | 15% |
| `deco_p_price_min` | Precio mínimo de servicio | number | CLP | 20% |
| `deco_p_price_max` | Precio máximo de servicio | number | CLP | - |
| `deco_p_flower_types` | ¿Qué tipos de flores trabajas? | multiple | `roses`, `peonies`, `hydrangeas`, `eucalyptus`, `wildflowers`, `tropical`, `dried` | 10% |
| `deco_p_bridal_bouquet` | ¿Ofreces ramo de novia? | boolean | Sí / No | 5% |
| `deco_p_ceremony_deco` | ¿Ofreces decoración de ceremonia? | boolean | Sí / No | 5% |
| `deco_p_centerpiece_types` | ¿Qué tipos de centros de mesa ofreces? | multiple | `low`, `tall`, `mixed`, `non_floral` | 5% |
| `deco_p_table_capacity` | Máximo de mesas que puedes decorar | number | 5-100 | 5% |
| `deco_p_extras` | ¿Qué elementos adicionales ofreces? | multiple | `arch`, `backdrop`, `hanging`, `candles`, `neon`, `balloons` | 5% |
| `deco_p_rental` | ¿Ofreces arriendo de mobiliario? | boolean | Sí / No | 5% |
| `deco_p_rental_items` | ¿Qué mobiliario arriendas? | multiple | `chairs` (Sillas), `tables` (Mesas), `lounge` (Mobiliario lounge), `bars` (Barras), `lighting` (Iluminación), `linens` (Mantelería) | - |

---

## 8. Wedding Planner

### 8.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `wp_u_service_level` | ¿Qué nivel de servicio necesitas? | single | `full` (Planificación completa), `partial` (Planificación parcial), `day_of` (Solo coordinación del día), `consultation` (Solo asesoría) | 25% |
| `wp_u_budget` | ¿Cuál es tu presupuesto para wedding planner? | single | `under_500k` (Menos de $500.000), `500k_1m` ($500.000 - $1.000.000), `1m_2m` ($1.000.000 - $2.000.000), `2m_4m` ($2.000.000 - $4.000.000), `over_4m` (Más de $4.000.000) | 20% |
| `wp_u_months_until` | ¿Cuántos meses faltan para tu boda? | single | `under_3` (Menos de 3 meses), `3_6` (3-6 meses), `6_12` (6-12 meses), `over_12` (Más de 12 meses) | 10% |
| `wp_u_vendor_help` | ¿Necesitas ayuda para encontrar proveedores? | single | `all` (Todos los proveedores), `some` (Algunos proveedores), `none` (Ya tengo mis proveedores) | 15% |
| `wp_u_design_help` | ¿Necesitas ayuda con el diseño/estética? | single | `full` (Diseño completo), `guidance` (Solo orientación), `none` (Ya tengo definido) | 10% |
| `wp_u_budget_management` | ¿Necesitas gestión de presupuesto? | boolean | Sí / No | 5% |
| `wp_u_timeline_management` | ¿Necesitas gestión de cronograma? | boolean | Sí / No | 5% |
| `wp_u_guest_management` | ¿Necesitas gestión de invitados? | boolean | Sí / No | 5% |
| `wp_u_rehearsal` | ¿Necesitas coordinación del ensayo? | boolean | Sí / No | 3% |
| `wp_u_communication_style` | ¿Cómo prefieres comunicarte? | single | `whatsapp` (WhatsApp), `email` (Email), `calls` (Llamadas), `meetings` (Reuniones presenciales), `flexible` (Flexible) | 2% |

### 8.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `wp_p_service_levels` | ¿Qué niveles de servicio ofreces? | multiple | `full`, `partial`, `day_of`, `consultation` | 25% |
| `wp_p_price_min` | Precio mínimo de servicio | number | CLP | 20% |
| `wp_p_price_max` | Precio máximo de servicio | number | CLP | - |
| `wp_p_lead_time_min` | Tiempo mínimo de anticipación | single | `under_3`, `3_6`, `6_12` | 10% |
| `wp_p_vendor_network` | ¿Tienes red de proveedores? | single | `extensive` (Extensa), `moderate` (Moderada), `limited` (Limitada) | 15% |
| `wp_p_design_services` | ¿Ofreces servicios de diseño? | multiple | `full`, `guidance`, `moodboards` (Moodboards), `none` | 10% |
| `wp_p_budget_management` | ¿Ofreces gestión de presupuesto? | boolean | Sí / No | 5% |
| `wp_p_timeline_management` | ¿Ofreces gestión de cronograma? | boolean | Sí / No | 5% |
| `wp_p_guest_management` | ¿Ofreces gestión de invitados? | boolean | Sí / No | 5% |
| `wp_p_rehearsal` | ¿Ofreces coordinación del ensayo? | boolean | Sí / No | 3% |
| `wp_p_team_size` | ¿Cuántas personas en tu equipo el día del evento? | single | `1` (Solo yo), `2` (2 personas), `3_plus` (3 o más) | 2% |
| `wp_p_experience_years` | Años de experiencia | number | 0-20 | - |

---

## 9. Maquillaje & Peinado

### 9.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `makeup_u_style` | ¿Qué estilo de maquillaje prefieres? | single | `natural` (Natural/Fresco), `classic` (Clásico/Elegante), `glamorous` (Glamoroso), `editorial` (Editorial/Dramático), `romantic` (Romántico/Suave), `boho` (Bohemio) | 25% |
| `makeup_u_budget` | ¿Cuál es tu presupuesto? | single | `under_100k` (Menos de $100.000), `100k_200k` ($100.000 - $200.000), `200k_350k` ($200.000 - $350.000), `over_350k` (Más de $350.000) | 20% |
| `makeup_u_trial` | ¿Necesitas prueba de maquillaje? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No necesario) | 10% |
| `makeup_u_hair` | ¿Necesitas servicio de peinado? | boolean | Sí / No | 15% |
| `makeup_u_hair_style` | ¿Qué estilo de peinado prefieres? | single | `updo` (Recogido), `half_up` (Semi-recogido), `down` (Suelto), `braids` (Trenzas), `undecided` (Indecisa) | 10% |
| `makeup_u_extensions` | ¿Necesitas extensiones de cabello? | boolean | Sí / No | 3% |
| `makeup_u_lashes` | ¿Quieres pestañas postizas? | single | `no` (No), `natural` (Naturales), `dramatic` (Dramáticas), `undecided` (Indecisa) | 5% |
| `makeup_u_bridesmaids` | ¿Necesitas servicio para cortejo? | single | `no` (No), `some` (Algunas personas), `full` (Cortejo completo) | 5% |
| `makeup_u_bridesmaids_count` | ¿Cuántas personas del cortejo? | number | 0-15 | - |
| `makeup_u_mothers` | ¿Incluir madres? | boolean | Sí / No | 3% |
| `makeup_u_touch_ups` | ¿Necesitas retoques durante el evento? | single | `no` (No), `kit` (Solo kit de retoque), `person` (Persona presente) | 4% |

### 9.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `makeup_p_styles` | ¿Qué estilos de maquillaje ofreces? | multiple | `natural`, `classic`, `glamorous`, `editorial`, `romantic`, `boho` | 25% |
| `makeup_p_price_bride` | Precio para novia (maquillaje + peinado) | number | CLP | 20% |
| `makeup_p_price_bridesmaid` | Precio por persona del cortejo | number | CLP | - |
| `makeup_p_trial` | ¿Ofreces prueba de maquillaje? | single | `yes_free` (Sí, gratis), `yes_paid` (Sí, con costo), `no` (No) | 10% |
| `makeup_p_hair` | ¿Ofreces servicio de peinado? | boolean | Sí / No | 15% |
| `makeup_p_hair_styles` | ¿Qué estilos de peinado ofreces? | multiple | `updo`, `half_up`, `down`, `braids` | 10% |
| `makeup_p_extensions` | ¿Trabajas con extensiones? | boolean | Sí / No | 3% |
| `makeup_p_lashes` | ¿Ofreces pestañas postizas? | single | `no`, `natural`, `dramatic`, `both` | 5% |
| `makeup_p_team_size` | ¿Cuántas personas en tu equipo? | single | `1` (Solo yo), `2` (2 personas), `3_plus` (3 o más) | 5% |
| `makeup_p_max_clients` | Máximo de personas que atiendes por evento | number | 1-20 | 5% |
| `makeup_p_touch_ups` | ¿Ofreces retoques durante el evento? | single | `no`, `kit`, `person` | 4% |
| `makeup_p_location` | ¿Dónde ofreces el servicio? | multiple | `home` (A domicilio), `salon` (En salón), `venue` (En el lugar del evento) | 3% |
| `makeup_p_travel` | ¿Viajas fuera de tu zona? | boolean | Sí / No | - |

---

## 10. Entretenimiento

### 10.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `ent_u_type` | ¿Qué tipo de entretenimiento buscas? | multiple | `live_band` (Banda en vivo), `solo_artist` (Artista solista), `dancers` (Show de baile), `magician` (Mago/Ilusionista), `comedian` (Comediante/Stand-up), `photo_booth` (Cabina de fotos), `caricaturist` (Caricaturista), `fireworks` (Fuegos artificiales), `casino` (Casino/Juegos), `karaoke_pro` (Karaoke profesional), `mariachi` (Mariachi), `other` (Otro) | 30% |
| `ent_u_moment` | ¿En qué momento del evento necesitas el entretenimiento? | multiple | `ceremony` (Durante la ceremonia), `cocktail` (Durante el cóctel), `dinner` (Durante la cena), `party` (Durante la fiesta), `special_moment` (Momento especial) | 15% |
| `ent_u_duration` | ¿Cuánto tiempo de show necesitas? | single | `30min` (30 minutos), `1hr` (1 hora), `2hr` (2 horas), `3hr` (3 horas), `full_event` (Todo el evento), `flexible` (Flexible) | 10% |
| `ent_u_budget` | ¿Cuál es tu presupuesto para entretenimiento? | single | `under_300k` (Menos de $300.000), `300k_500k` ($300.000 - $500.000), `500k_800k` ($500.000 - $800.000), `800k_1500k` ($800.000 - $1.500.000), `over_1500k` (Más de $1.500.000), `skip` (Omitir) | 20% |
| `ent_u_style` | ¿Qué estilo de entretenimiento prefieres? | single | `elegant` (Elegante/Sofisticado), `fun` (Divertido/Animado), `romantic` (Romántico), `interactive` (Interactivo), `surprise` (Sorpresa) | 10% |
| `ent_u_audience` | ¿Para qué tipo de audiencia es el entretenimiento? | single | `adults_only` (Solo adultos), `family` (Familiar), `mixed` (Mixto) | 5% |
| `ent_u_space` | ¿Tienes espacio adecuado para el show? | single | `yes_stage` (Sí, con escenario), `yes_space` (Sí, espacio amplio sin escenario), `limited` (Espacio limitado), `need_advice` (Necesito asesoría) | 5% |
| `ent_u_equipment` | ¿Necesitas que el proveedor traiga su equipo de sonido? | single | `yes` (Sí, necesito todo el equipo), `partial` (Solo algunos elementos), `no` (No, ya tengo sonido) | 5% |

### 10.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `ent_p_types` | ¿Qué tipo de entretenimiento ofreces? | multiple | `live_band`, `solo_artist`, `dancers`, `magician`, `comedian`, `photo_booth`, `caricaturist`, `fireworks`, `casino`, `karaoke_pro`, `mariachi` | 30% |
| `ent_p_moments` | ¿En qué momentos del evento puedes actuar? | multiple | `ceremony`, `cocktail`, `dinner`, `party`, `special_moment` | 15% |
| `ent_p_duration_min` | Duración mínima de tu show (minutos) | number | 15-240 | 10% |
| `ent_p_duration_max` | Duración máxima de tu show (minutos) | number | 30-480 | - |
| `ent_p_price_min` | Precio mínimo de tu servicio | number | CLP | 20% |
| `ent_p_price_max` | Precio máximo de tu servicio | number | CLP | - |
| `ent_p_styles` | ¿Qué estilos de entretenimiento manejas? | multiple | `elegant`, `fun`, `romantic`, `interactive`, `surprise` | 10% |
| `ent_p_audience` | ¿Para qué audiencias trabajas? | multiple | `adults_only`, `family`, `mixed` | 5% |
| `ent_p_equipment` | ¿Qué equipo incluyes? | multiple | `sound` (Equipo de sonido), `lighting` (Iluminación), `props` (Props/Accesorios), `stage` (Escenario portátil), `none` (Solo el show, sin equipo) | 5% |
| `ent_p_team_size` | ¿Cuántas personas conforman tu show? | single | `1` (Solo yo), `2_3` (2-3 personas), `4_6` (4-6 personas), `over_6` (Más de 6 personas) | 5% |
| `ent_p_travel` | ¿Viajas fuera de tu región? | boolean | Sí / No | - |

---

## 11. Tortas & Dulces

### 11.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `cakes_u_type` | ¿Qué tipo de torta o dulces necesitas? | multiple | `wedding_cake` (Torta de novios tradicional), `naked_cake` (Naked cake), `fondant` (Torta con fondant), `buttercream` (Torta con buttercream), `dessert_table` (Mesa de dulces completa), `cupcakes` (Cupcakes), `macarons` (Macarons), `donuts` (Donuts), `mini_desserts` (Mini postres variados) | 25% |
| `cakes_u_servings` | ¿Para cuántas porciones necesitas la torta? | single | `under_50` (Menos de 50 porciones), `50_100` (50-100 porciones), `100_150` (100-150 porciones), `150_200` (150-200 porciones), `over_200` (Más de 200 porciones), `skip` (Omitir) | 15% |
| `cakes_u_tiers` | ¿Cuántos pisos te gustaría que tenga la torta? | single | `1` (1 piso), `2` (2 pisos), `3` (3 pisos), `4_plus` (4 o más pisos), `no_preference` (Sin preferencia) | 10% |
| `cakes_u_flavor` | ¿Qué sabores prefieres? | multiple | `vanilla` (Vainilla), `chocolate` (Chocolate), `red_velvet` (Red velvet), `lemon` (Limón), `carrot` (Zanahoria), `fruit` (Frutas), `dulce_leche` (Dulce de leche), `coffee` (Café/Moka), `mixed` (Diferentes sabores por piso), `other` (Otro) | 15% |
| `cakes_u_style` | ¿Qué estilo de decoración prefieres? | single | `classic` (Clásico/Elegante), `modern` (Moderno/Minimalista), `rustic` (Rústico), `romantic` (Romántico), `glamorous` (Glamoroso), `whimsical` (Fantasía) | 15% |
| `cakes_u_budget` | ¿Cuál es tu presupuesto para torta/dulces? | single | `under_100k` (Menos de $100.000), `100k_200k` ($100.000 - $200.000), `200k_400k` ($200.000 - $400.000), `400k_600k` ($400.000 - $600.000), `over_600k` (Más de $600.000), `skip` (Omitir) | 15% |
| `cakes_u_dietary` | ¿Necesitas opciones especiales? | multiple | `gluten_free` (Sin gluten), `vegan` (Vegana), `sugar_free` (Sin azúcar), `lactose_free` (Sin lactosa), `none` (Ninguna) | 5% |
| `cakes_u_tasting` | ¿Quieres degustación previa? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No necesario) | 5% |
| `cakes_u_delivery` | ¿Necesitas entrega y montaje en el lugar? | single | `yes` (Sí, entrega y montaje), `delivery_only` (Solo entrega), `pickup` (Yo la retiro) | 5% |

### 11.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `cakes_p_types` | ¿Qué tipo de tortas y dulces ofreces? | multiple | `wedding_cake`, `naked_cake`, `fondant`, `buttercream`, `dessert_table`, `cupcakes`, `macarons`, `donuts`, `mini_desserts` | 25% |
| `cakes_p_servings_min` | Mínimo de porciones que preparas | number | 10-200 | 15% |
| `cakes_p_servings_max` | Máximo de porciones que preparas | number | 50-500 | - |
| `cakes_p_tiers_max` | ¿Hasta cuántos pisos puedes hacer? | single | `1`, `2`, `3`, `4`, `5_plus` | 10% |
| `cakes_p_flavors` | ¿Qué sabores ofreces? | multiple | `vanilla`, `chocolate`, `red_velvet`, `lemon`, `carrot`, `fruit`, `dulce_leche`, `coffee`, `custom` (Sabores personalizados) | 15% |
| `cakes_p_styles` | ¿Qué estilos de decoración manejas? | multiple | `classic`, `modern`, `rustic`, `romantic`, `glamorous`, `whimsical` | 15% |
| `cakes_p_price_min` | Precio mínimo de torta de novios | number | CLP | 15% |
| `cakes_p_price_max` | Precio máximo de torta de novios | number | CLP | - |
| `cakes_p_dietary` | ¿Qué opciones especiales ofreces? | multiple | `gluten_free`, `vegan`, `sugar_free`, `lactose_free`, `none` | 5% |
| `cakes_p_tasting` | ¿Ofreces degustación previa? | single | `yes_free` (Sí, gratis), `yes_paid` (Sí, con costo), `no` (No) | 5% |
| `cakes_p_delivery` | ¿Ofreces entrega y montaje? | single | `yes_included` (Sí, incluido), `yes_extra` (Sí, con costo adicional), `delivery_only` (Solo entrega), `no` (No, solo retiro) | 5% |
| `cakes_p_lead_time` | ¿Con cuánta anticipación necesitas el pedido? | single | `1_week` (1 semana), `2_weeks` (2 semanas), `1_month` (1 mes), `2_months` (2 meses o más) | - |

---

## 12. Transporte

### 12.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `transport_u_type` | ¿Qué tipo de transporte necesitas? | multiple | `bride_groom` (Para novios), `guests` (Para invitados), `bridal_party` (Para cortejo), `family` (Para familia) | 25% |
| `transport_u_vehicle_type` | ¿Qué tipo de vehículo prefieres para los novios? | single | `classic_car` (Auto clásico/Vintage), `luxury_car` (Auto de lujo), `limousine` (Limusina), `convertible` (Convertible), `carriage` (Carruaje), `sports_car` (Auto deportivo), `motorcycle` (Motocicleta), `van` (Van/Minibus), `no_preference` (Sin preferencia) | 20% |
| `transport_u_guest_vehicle` | ¿Qué tipo de transporte necesitas para invitados? | single | `bus` (Bus), `minibus` (Minibus), `vans` (Vans múltiples), `shuttle` (Servicio de shuttle), `not_needed` (No necesito para invitados) | 15% |
| `transport_u_route` | ¿Qué rutas necesitas cubrir? | multiple | `home_ceremony` (Casa → Ceremonia), `ceremony_venue` (Ceremonia → Recepción), `venue_hotel` (Recepción → Hotel/Casas), `hotel_venue` (Hotel → Venue), `full_circuit` (Circuito completo) | 15% |
| `transport_u_budget` | ¿Cuál es tu presupuesto para transporte? | single | `under_200k` (Menos de $200.000), `200k_400k` ($200.000 - $400.000), `400k_700k` ($400.000 - $700.000), `700k_1200k` ($700.000 - $1.200.000), `over_1200k` (Más de $1.200.000), `skip` (Omitir) | 15% |
| `transport_u_decoration` | ¿Quieres decoración en el vehículo de novios? | single | `yes` (Sí, con decoración), `simple` (Decoración simple), `no` (No, sin decoración) | 5% |
| `transport_u_driver` | ¿Necesitas chofer profesional? | single | `yes_formal` (Sí, con uniforme formal), `yes_casual` (Sí, vestimenta casual), `no` (No, manejaré yo) | 5% |
| `transport_u_hours` | ¿Por cuántas horas necesitas el servicio? | single | `2` (2 horas), `4` (4 horas), `6` (6 horas), `8` (8 horas), `full_day` (Día completo) | 5% |

### 12.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `transport_p_service_types` | ¿Qué servicios de transporte ofreces? | multiple | `bride_groom`, `guests`, `bridal_party`, `family` | 25% |
| `transport_p_vehicle_types` | ¿Qué tipos de vehículos tienes disponibles? | multiple | `classic_car`, `luxury_car`, `limousine`, `convertible`, `carriage`, `sports_car`, `motorcycle`, `van`, `bus` | 20% |
| `transport_p_capacity_max` | ¿Cuál es la capacidad máxima de pasajeros que puedes transportar? | number | 2-100 | 15% |
| `transport_p_price_min` | Precio mínimo del servicio | number | CLP | 15% |
| `transport_p_price_max` | Precio máximo del servicio | number | CLP | - |
| `transport_p_decoration` | ¿Ofreces decoración del vehículo? | single | `yes_included` (Sí, incluida), `yes_extra` (Sí, con costo adicional), `no` (No) | 5% |
| `transport_p_driver` | ¿Incluyes chofer profesional? | single | `yes_formal` (Sí, con uniforme formal), `yes_casual` (Sí, vestimenta casual), `optional` (Opcional), `no` (No, solo arriendo vehículo) | 5% |
| `transport_p_hours_min` | Mínimo de horas de servicio | number | 1-12 | 5% |
| `transport_p_hours_max` | Máximo de horas de servicio | number | 2-24 | - |
| `transport_p_extras` | ¿Qué extras ofreces? | multiple | `champagne` (Champagne/Bebidas), `music` (Sistema de música), `red_carpet` (Alfombra roja), `photos` (Sesión de fotos con vehículo), `none` (Sin extras) | 5% |
| `transport_p_travel` | ¿Viajas fuera de tu zona? | boolean | Sí / No | - |

---

## 13. Invitaciones

### 13.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `inv_u_type` | ¿Qué tipo de invitaciones prefieres? | single | `printed` (Impresas/Físicas), `digital` (Digitales), `both` (Ambas), `video` (Video invitación) | 25% |
| `inv_u_quantity` | ¿Cuántas invitaciones necesitas? | single | `under_50` (Menos de 50), `50_100` (50-100), `100_150` (100-150), `150_200` (150-200), `over_200` (Más de 200), `skip` (Omitir) | 15% |
| `inv_u_style` | ¿Qué estilo de diseño prefieres? | single | `classic` (Clásico/Elegante), `modern` (Moderno/Minimalista), `rustic` (Rústico), `romantic` (Romántico), `bohemian` (Bohemio), `glamorous` (Glamoroso), `vintage` (Vintage), `custom` (Personalizado) | 20% |
| `inv_u_extras` | ¿Qué elementos adicionales necesitas? | multiple | `save_the_date` (Save the Date), `rsvp` (Tarjetas RSVP), `menu` (Menú), `place_cards` (Tarjetas de ubicación), `thank_you` (Tarjetas de agradecimiento), `programs` (Programas de ceremonia), `envelope` (Sobres personalizados), `sealing_wax` (Lacre/Sello de cera), `none` (Solo invitaciones) | 15% |
| `inv_u_budget` | ¿Cuál es tu presupuesto para invitaciones? | single | `under_100k` (Menos de $100.000), `100k_200k` ($100.000 - $200.000), `200k_400k` ($200.000 - $400.000), `400k_600k` ($400.000 - $600.000), `over_600k` (Más de $600.000), `skip` (Omitir) | 15% |
| `inv_u_paper` | ¿Qué tipo de papel prefieres? (solo para impresas) | single | `standard` (Estándar), `cotton` (Algodón), `recycled` (Reciclado), `textured` (Texturizado), `transparent` (Acrílico/Transparente), `no_preference` (Sin preferencia) | 5% |
| `inv_u_printing` | ¿Qué técnica de impresión prefieres? | single | `digital` (Digital), `letterpress` (Letterpress), `foil` (Hot stamping/Foil), `embossed` (Embossing), `laser_cut` (Corte láser), `no_preference` (Sin preferencia) | 5% |
| `inv_u_timeline` | ¿Cuándo necesitas las invitaciones? | single | `2_weeks` (2 semanas), `1_month` (1 mes), `2_months` (2 meses), `3_months` (3 meses o más), `flexible` (Flexible) | 5% |

### 13.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `inv_p_types` | ¿Qué tipos de invitaciones ofreces? | multiple | `printed`, `digital`, `video` | 25% |
| `inv_p_styles` | ¿Qué estilos de diseño manejas? | multiple | `classic`, `modern`, `rustic`, `romantic`, `bohemian`, `glamorous`, `vintage`, `custom` | 20% |
| `inv_p_extras` | ¿Qué papelería adicional ofreces? | multiple | `save_the_date`, `rsvp`, `menu`, `place_cards`, `thank_you`, `programs`, `envelope`, `sealing_wax` | 15% |
| `inv_p_price_min` | Precio mínimo por invitación | number | CLP | 15% |
| `inv_p_price_max` | Precio máximo por invitación | number | CLP | - |
| `inv_p_min_quantity` | Cantidad mínima de pedido | number | 10-100 | 15% |
| `inv_p_papers` | ¿Qué tipos de papel trabajas? | multiple | `standard`, `cotton`, `recycled`, `textured`, `transparent` | 5% |
| `inv_p_printing` | ¿Qué técnicas de impresión ofreces? | multiple | `digital`, `letterpress`, `foil`, `embossed`, `laser_cut` | 5% |
| `inv_p_lead_time` | ¿Cuál es tu tiempo de entrega habitual? | single | `1_week` (1 semana), `2_weeks` (2 semanas), `3_weeks` (3 semanas), `1_month` (1 mes), `over_1_month` (Más de 1 mes) | 5% |
| `inv_p_samples` | ¿Ofreces muestras previas? | single | `yes_free` (Sí, gratis), `yes_paid` (Sí, con costo), `digital_only` (Solo prueba digital), `no` (No) | 5% |
| `inv_p_shipping` | ¿Ofreces envío? | single | `yes_included` (Sí, incluido), `yes_extra` (Sí, con costo adicional), `pickup_only` (Solo retiro) | - |

---

## 14. Vestidos & Trajes

### 14.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `dress_u_need` | ¿Qué necesitas para tu boda? | multiple | `bride_dress` (Vestido de novia), `groom_suit` (Traje de novio), `bridesmaids` (Vestidos de damas de honor), `groomsmen` (Trajes de padrinos), `flower_girl` (Vestuario pajes/damitas), `mother_bride` (Vestido madre de la novia), `mother_groom` (Vestido madre del novio), `accessories` (Solo accesorios) | 25% |
| `dress_u_bride_style` | ¿Qué estilo de vestido de novia prefieres? | multiple | `classic` (Clásico/Tradicional), `romantic` (Romántico), `modern` (Moderno/Minimalista), `bohemian` (Bohemio), `glamorous` (Glamoroso), `vintage` (Vintage), `princess` (Princesa), `sexy` (Sensual) | 20% |
| `dress_u_bride_silhouette` | ¿Qué silueta de vestido prefieres? | multiple | `a_line` (Línea A), `ballgown` (Corte princesa/Ball gown), `mermaid` (Sirena), `sheath` (Recto/Columna), `empire` (Imperio), `trumpet` (Trompeta), `tea_length` (Midi/Té), `mini` (Corto), `no_preference` (Sin preferencia) | 15% |
| `dress_u_groom_style` | ¿Qué estilo de traje para el novio? | single | `classic_suit` (Traje clásico), `tuxedo` (Smoking/Tuxedo), `modern` (Moderno/Slim fit), `casual` (Semi-formal), `vintage` (Vintage), `destination` (Para boda destino), `not_needed` (No necesito traje de novio) | 15% |
| `dress_u_service_type` | ¿Qué tipo de servicio prefieres? | single | `buy_new` (Comprar nuevo), `custom` (Diseño a medida), `rent` (Arriendo), `second_hand` (Segunda mano/Outlet), `alterations` (Solo ajustes/arreglos), `no_preference` (Sin preferencia) | 15% |
| `dress_u_budget_bride` | ¿Cuál es tu presupuesto para el vestido de novia? | single | `under_500k` (Menos de $500.000), `500k_1m` ($500.000 - $1.000.000), `1m_2m` ($1.000.000 - $2.000.000), `2m_3m` ($2.000.000 - $3.000.000), `3m_5m` ($3.000.000 - $5.000.000), `over_5m` (Más de $5.000.000), `skip` (Omitir) | 15% |
| `dress_u_budget_groom` | ¿Cuál es tu presupuesto para el traje de novio? | single | `under_200k` (Menos de $200.000), `200k_400k` ($200.000 - $400.000), `400k_700k` ($400.000 - $700.000), `700k_1m` ($700.000 - $1.000.000), `over_1m` (Más de $1.000.000), `skip` (Omitir/No necesito) | 10% |
| `dress_u_timeline` | ¿Cuánto tiempo tienes antes de la boda? | single | `under_3m` (Menos de 3 meses), `3_6m` (3-6 meses), `6_9m` (6-9 meses), `9_12m` (9-12 meses), `over_12m` (Más de 1 año) | 5% |
| `dress_u_accessories` | ¿Qué accesorios necesitas? | multiple | `veil` (Velo), `tiara` (Tiara/Corona), `headpiece` (Tocado/Peineta), `shoes` (Zapatos), `jewelry` (Joyería), `belt` (Cinturón/Faja), `jacket` (Chaqueta/Capa), `none` (Ninguno/Ya los tengo) | 5% |
| `dress_u_fitting` | ¿Necesitas pruebas y ajustes incluidos? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No necesario) | 5% |

### 14.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `dress_p_services` | ¿Qué servicios de vestuario ofreces? | multiple | `bride_dress` (Vestidos de novia), `groom_suit` (Trajes de novio), `bridesmaids` (Vestidos de damas de honor), `groomsmen` (Trajes de padrinos), `flower_girl` (Vestuario pajes/damitas), `mother_outfits` (Vestidos para madres), `accessories` (Accesorios), `shoes` (Zapatos de novia/novio) | 25% |
| `dress_p_bride_styles` | ¿Qué estilos de vestido de novia manejas? | multiple | `classic`, `romantic`, `modern`, `bohemian`, `glamorous`, `vintage`, `princess`, `sexy` | 20% |
| `dress_p_silhouettes` | ¿Qué siluetas de vestido ofreces? | multiple | `a_line`, `ballgown`, `mermaid`, `sheath`, `empire`, `trumpet`, `tea_length`, `mini` | 15% |
| `dress_p_groom_styles` | ¿Qué estilos de traje de novio ofreces? | multiple | `classic_suit`, `tuxedo`, `modern`, `casual`, `vintage`, `destination`, `none` (No ofrezco trajes de novio) | 15% |
| `dress_p_service_types` | ¿Qué tipos de servicio ofreces? | multiple | `buy_new` (Venta de nuevos), `custom` (Diseño a medida), `rent` (Arriendo), `second_hand` (Segunda mano/Outlet), `alterations` (Ajustes y arreglos) | 15% |
| `dress_p_price_bride_min` | Precio mínimo vestido de novia | number | CLP | 15% |
| `dress_p_price_bride_max` | Precio máximo vestido de novia | number | CLP | - |
| `dress_p_price_groom_min` | Precio mínimo traje de novio | number | CLP | 10% |
| `dress_p_price_groom_max` | Precio máximo traje de novio | number | CLP | - |
| `dress_p_accessories` | ¿Qué accesorios ofreces? | multiple | `veil` (Velos), `tiara` (Tiaras/Coronas), `headpiece` (Tocados/Peinetas), `shoes` (Zapatos), `jewelry` (Joyería), `belt` (Cinturones/Fajas), `jacket` (Chaquetas/Capas), `none` (No ofrezco accesorios) | 5% |
| `dress_p_fittings` | ¿Cuántas pruebas incluyes? | single | `1` (1 prueba), `2` (2 pruebas), `3` (3 pruebas), `unlimited` (Ilimitadas hasta quedar perfecto), `extra_cost` (Pruebas adicionales con costo) | 5% |
| `dress_p_alterations` | ¿Incluyes ajustes y arreglos? | single | `yes_included` (Sí, incluidos en el precio), `yes_extra` (Sí, con costo adicional), `basic_only` (Solo ajustes básicos incluidos), `no` (No, deben hacerse aparte) | 5% |
| `dress_p_lead_time` | ¿Cuánto tiempo necesitas de anticipación? | single | `under_2m` (Menos de 2 meses), `2_4m` (2-4 meses), `4_6m` (4-6 meses), `6_9m` (6-9 meses), `over_9m` (Más de 9 meses) | 5% |
| `dress_p_designers` | ¿Trabajas con diseñadores o marcas específicas? | single | `yes_exclusive` (Sí, marcas exclusivas), `yes_various` (Sí, varias marcas), `own_designs` (Diseños propios), `no` (No, sin marca específica) | - |
| `dress_p_appointment` | ¿Cómo funciona la atención? | single | `appointment_only` (Solo con cita previa), `walk_in` (Sin cita, horario tienda), `both` (Ambas opciones), `home_service` (Atención a domicilio) | - |

---

## 15. Criterios de Matchmaking

### 15.1 Arquitectura del Sistema de Matchmaking

El sistema de matchmaking ha sido diseñado para proporcionar scores precisos y justos. Las características principales incluyen:

1. **Criterios de matching EXPLÍCITOS** por categoría (no automáticos)
2. **Sistema de especificidad**: proveedores nicho obtienen bonus
3. **Mejor comparación de rangos** numéricos con strings de presupuesto
4. **Score de cobertura**: qué tan bien el proveedor cubre las necesidades
5. **Combinación de datos**: wizard inicial + mini-encuestas por categoría

### 15.2 Tipos de Comparación

| Tipo | Lógica de Match | Descripción |
|------|-----------------|-------------|
| `single_in_multiple` | 100% si la opción del usuario está en las del proveedor | Usuario elige UNA opción, proveedor ofrece MÚLTIPLES |
| `contains` | % de opciones del usuario cubiertas por el proveedor | Múltiple vs múltiple |
| `range_overlap` | Calcula superposición de rangos | Mapea strings de presupuesto del usuario a rangos numéricos |
| `boolean_match` | Si usuario necesita (true), proveedor debe ofrecer | Si usuario no necesita algo, cualquier valor del proveedor es válido |
| `preference_match` | Mapeo de preferencias a scores | Para campos como "required/preferred/not_needed" |
| `exact` | Coincidencia exacta de valores | Para campos donde debe haber match exacto |
| `threshold_at_most` | Proveedor debe entregar ANTES o igual | Para tiempos de entrega |
| `threshold_at_least` | Proveedor debe ofrecer AL MENOS lo que usuario pide | Para cantidad de fotos, horario de venue, mesas |
| `threshold_can_accommodate` | Proveedor debe poder acomodar lo que usuario necesita | Para horas de cobertura, capacidad |

### 15.3 Sistema de Especificidad

Los proveedores "nicho" (especializados) obtienen un bonus, mientras que los proveedores "generalistas" no reciben penalización pero tampoco bonus.

**Ejemplo práctico:**
- Fotógrafo que solo hace estilo "documental" → +8-10 puntos de bonus
- Fotógrafo que hace todos los estilos → +0-2 puntos de bonus

---

*Documento actualizado: Diciembre 2025*
*Versión: 3.0 - Incluye todas las categorías implementadas*
*Total de categorías: 13*
*Estado: ✅ IMPLEMENTADO*
