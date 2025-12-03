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
10. [Criterios de Matchmaking](#10-criterios-de-matchmaking)

---

## 1. Introducción

Este documento detalla todas las preguntas de las mini-encuestas que deben completar tanto **usuarios (novios)** como **proveedores** para cada una de las 8 categorías del sistema.

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
| `photo_u_style` | ¿Qué estilo fotográfico prefieres? | single | `documentary` (Documental/Natural), `artistic` (Artístico/Creativo), `classic` (Clásico/Tradicional), `editorial` (Editorial/Revista), `candid` (Espontáneo/Candid), `cinematic` (Cinemático) | 25% |
| `photo_u_hours` | ¿Cuántas horas de cobertura necesitas? | single | `4` (4 horas), `6` (6 horas), `8` (8 horas), `10` (10 horas), `full_day` (Día completo +12h) | 15% |
| `photo_u_budget` | ¿Cuál es tu presupuesto para fotografía? | single | `under_500k` (Menos de $500.000), `500k_800k` ($500.000 - $800.000), `800k_1200k` ($800.000 - $1.200.000), `1200k_1800k` ($1.200.000 - $1.800.000), `over_1800k` (Más de $1.800.000) | 20% |
| `photo_u_preboda` | ¿Necesitas sesión pre-boda? | boolean | Sí / No | 5% |
| `photo_u_postboda` | ¿Te interesa sesión post-boda (trash the dress, etc.)? | boolean | Sí / No | 5% |
| `photo_u_second_shooter` | ¿Necesitas segundo fotógrafo? | single | `no` (No necesario), `preferred` (Preferible), `required` (Indispensable) | 5% |
| `photo_u_delivery_time` | ¿En cuánto tiempo necesitas las fotos? | single | `2_weeks` (2 semanas), `1_month` (1 mes), `2_months` (2 meses), `3_months` (3+ meses), `flexible` (Flexible) | 5% |
| `photo_u_delivery_format` | ¿Qué formato de entrega prefieres? | multiple | `digital_hd` (Digital HD), `digital_raw` (Digital RAW), `printed_album` (Álbum impreso), `usb_box` (USB en caja especial), `online_gallery` (Galería online) | 5% |
| `photo_u_photo_count` | ¿Cuántas fotos editadas esperas recibir? | single | `under_200` (Menos de 200), `200_400` (200-400), `400_600` (400-600), `over_600` (Más de 600), `unlimited` (Sin límite) | 5% |
| `photo_u_retouching` | ¿Qué nivel de retoque prefieres? | single | `natural` (Natural/Mínimo), `moderate` (Moderado), `editorial` (Tipo revista/Alto) | 5% |
| `photo_u_locations` | ¿Cuántas locaciones tendrá tu evento? | single | `1` (Solo una), `2` (Dos locaciones), `3_plus` (Tres o más) | 3% |
| `photo_u_priorities` | ¿Qué momentos son más importantes para ti? | multiple | `getting_ready` (Preparativos), `ceremony` (Ceremonia), `portraits` (Retratos de pareja), `family` (Fotos familiares), `party` (Fiesta), `details` (Detalles decoración) | 2% |

### 2.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `photo_p_styles` | ¿Qué estilos fotográficos ofreces? | multiple | `documentary`, `artistic`, `classic`, `editorial`, `candid`, `cinematic` | 25% |
| `photo_p_hours_min` | ¿Cuál es tu cobertura mínima? | number | 1-12 horas | 15% |
| `photo_p_hours_max` | ¿Cuál es tu cobertura máxima? | number | 1-24 horas | - |
| `photo_p_price_min` | Precio mínimo de tu servicio | number | CLP | 20% |
| `photo_p_price_max` | Precio máximo de tu servicio | number | CLP | - |
| `photo_p_preboda` | ¿Ofreces sesión pre-boda? | boolean | Sí / No | 5% |
| `photo_p_preboda_included` | ¿Está incluida en el paquete base? | boolean | Sí / No | - |
| `photo_p_postboda` | ¿Ofreces sesión post-boda? | boolean | Sí / No | 5% |
| `photo_p_second_shooter` | ¿Ofreces segundo fotógrafo? | single | `no` (No), `extra_cost` (Costo adicional), `included` (Incluido en algunos paquetes), `always` (Siempre incluido) | 5% |
| `photo_p_delivery_time` | ¿Cuál es tu tiempo de entrega habitual? | single | `2_weeks`, `1_month`, `2_months`, `3_months` | 5% |
| `photo_p_delivery_formats` | ¿Qué formatos de entrega ofreces? | multiple | `digital_hd`, `digital_raw`, `printed_album`, `usb_box`, `online_gallery` | 5% |
| `photo_p_photo_count_min` | Mínimo de fotos editadas que entregas | number | 50-1000 | 5% |
| `photo_p_photo_count_max` | Máximo de fotos editadas que entregas | number | 100-2000 | - |
| `photo_p_retouching_levels` | ¿Qué niveles de retoque ofreces? | multiple | `natural`, `moderate`, `editorial` | 5% |
| `photo_p_travel` | ¿Viajas fuera de tu región? | boolean | Sí / No | 3% |
| `photo_p_travel_cost` | ¿Cobras adicional por traslado? | single | `no` (No), `yes_km` (Sí, por km), `yes_flat` (Sí, tarifa fija), `negotiable` (Negociable) | - |
| `photo_p_experience_years` | Años de experiencia en bodas | number | 0-30 | 2% |
| `photo_p_weddings_per_year` | ¿Cuántas bodas realizas al año? | number | 1-100 | - |

---

## 3. Videografía

### 3.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `video_u_style` | ¿Qué estilo de video prefieres? | single | `documentary` (Documental), `cinematic` (Cinemático/Película), `narrative` (Narrativo/Historia), `traditional` (Tradicional), `artistic` (Artístico/Experimental) | 25% |
| `video_u_duration` | ¿Qué duración de video final prefieres? | single | `highlight_3` (Highlight 3-5 min), `highlight_10` (Highlight 8-12 min), `medium_20` (Medio 15-25 min), `full_45` (Completo 30-45 min), `full_extended` (Extendido +60 min) | 15% |
| `video_u_budget` | ¿Cuál es tu presupuesto para video? | single | `under_600k` (Menos de $600.000), `600k_1000k` ($600.000 - $1.000.000), `1000k_1500k` ($1.000.000 - $1.500.000), `1500k_2500k` ($1.500.000 - $2.500.000), `over_2500k` (Más de $2.500.000) | 20% |
| `video_u_hours` | ¿Cuántas horas de cobertura necesitas? | single | `4` (4 horas), `6` (6 horas), `8` (8 horas), `10` (10 horas), `full_day` (Día completo) | 10% |
| `video_u_second_camera` | ¿Necesitas segundo camarógrafo? | single | `no` (No necesario), `preferred` (Preferible), `required` (Indispensable) | 5% |
| `video_u_drone` | ¿Te gustaría incluir tomas con drone? | single | `no` (No), `nice_to_have` (Sería bueno), `required` (Indispensable) | 5% |
| `video_u_same_day_edit` | ¿Te interesa un video editado el mismo día? | boolean | Sí / No | 5% |
| `video_u_raw_footage` | ¿Quieres recibir el material sin editar? | boolean | Sí / No | 3% |
| `video_u_social_reel` | ¿Necesitas versión corta para redes sociales? | boolean | Sí / No | 5% |
| `video_u_delivery_time` | ¿En cuánto tiempo necesitas el video? | single | `1_month` (1 mes), `2_months` (2 meses), `3_months` (3 meses), `6_months` (6 meses), `flexible` (Flexible) | 5% |
| `video_u_music_preference` | ¿Tienes preferencia musical para el video? | single | `provider_choice` (Que elija el videógrafo), `romantic` (Romántica/Emotiva), `modern` (Moderna/Pop), `classical` (Clásica), `custom` (Quiero elegir yo) | 2% |

### 3.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `video_p_styles` | ¿Qué estilos de video ofreces? | multiple | `documentary`, `cinematic`, `narrative`, `traditional`, `artistic` | 25% |
| `video_p_durations` | ¿Qué duraciones de video ofreces? | multiple | `highlight_3`, `highlight_10`, `medium_20`, `full_45`, `full_extended` | 15% |
| `video_p_price_min` | Precio mínimo de tu servicio | number | CLP | 20% |
| `video_p_price_max` | Precio máximo de tu servicio | number | CLP | - |
| `video_p_hours_min` | Cobertura mínima | number | 1-12 horas | 10% |
| `video_p_hours_max` | Cobertura máxima | number | 1-24 horas | - |
| `video_p_second_camera` | ¿Ofreces segundo camarógrafo? | single | `no`, `extra_cost`, `included`, `always` | 5% |
| `video_p_drone` | ¿Ofreces tomas con drone? | single | `no`, `extra_cost`, `included` | 5% |
| `video_p_same_day_edit` | ¿Ofreces edición el mismo día? | boolean | Sí / No | 5% |
| `video_p_raw_footage` | ¿Entregas material sin editar? | single | `no`, `extra_cost`, `included` | 3% |
| `video_p_social_reel` | ¿Ofreces versión para redes? | single | `no`, `extra_cost`, `included` | 5% |
| `video_p_delivery_time` | Tiempo de entrega habitual | single | `1_month`, `2_months`, `3_months`, `6_months` | 5% |
| `video_p_equipment` | ¿Qué equipo utilizas? | multiple | `4k` (Cámaras 4K), `cinema_camera` (Cámaras de cine), `gimbal` (Estabilizador/Gimbal), `slider` (Slider), `crane` (Grúa), `lighting` (Iluminación profesional) | 2% |
| `video_p_experience_years` | Años de experiencia en bodas | number | 0-30 | - |

---

## 4. DJ/VJ

### 4.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `dj_u_genres` | ¿Qué géneros musicales te gustan? | multiple | `reggaeton` (Reggaetón), `pop` (Pop Internacional), `pop_latino` (Pop Latino), `cumbia` (Cumbia), `salsa` (Salsa), `bachata` (Bachata), `rock` (Rock), `electronic` (Electrónica), `80s_90s` (80s y 90s), `disco` (Disco), `jazz` (Jazz/Lounge), `romantic` (Baladas/Románticas) | 25% |
| `dj_u_style` | ¿Qué estilo de fiesta prefieres? | single | `elegant` (Elegante/Sofisticado), `party` (Fiesta total), `mixed` (Mezcla de ambos), `chill` (Relajado/Lounge) | 15% |
| `dj_u_budget` | ¿Cuál es tu presupuesto para DJ? | single | `under_400k` (Menos de $400.000), `400k_600k` ($400.000 - $600.000), `600k_900k` ($600.000 - $900.000), `900k_1400k` ($900.000 - $1.400.000), `over_1400k` (Más de $1.400.000) | 20% |
| `dj_u_hours` | ¿Cuántas horas de música necesitas? | single | `3` (3 horas), `4` (4 horas), `5` (5 horas), `6` (6 horas), `unlimited` (Sin límite) | 10% |
| `dj_u_ceremony_music` | ¿Necesitas música para la ceremonia? | boolean | Sí / No | 5% |
| `dj_u_cocktail_music` | ¿Necesitas música para el cóctel? | boolean | Sí / No | 3% |
| `dj_u_mc` | ¿Necesitas que el DJ anime/presente? | single | `no` (No, solo música), `minimal` (Mínimo, solo anuncios), `moderate` (Moderado), `full` (Animación completa) | 10% |
| `dj_u_lighting` | ¿Qué nivel de iluminación necesitas? | single | `basic` (Básica), `standard` (Estándar), `premium` (Premium con efectos), `custom` (Personalizada) | 5% |
| `dj_u_effects` | ¿Qué efectos especiales te interesan? | multiple | `fog` (Máquina de humo), `cold_sparks` (Chispas frías), `laser` (Láser), `confetti` (Confetti), `bubbles` (Burbujas), `none` (Ninguno) | 3% |
| `dj_u_karaoke` | ¿Te gustaría tener karaoke? | boolean | Sí / No | 2% |
| `dj_u_requests` | ¿Permitirás solicitudes de invitados? | single | `no` (No), `limited` (Limitadas), `yes` (Sí, todas) | 2% |
| `dj_u_screens` | ¿Necesitas pantallas/proyección? | single | `no` (No), `one` (Una pantalla), `multiple` (Varias pantallas) | - |
| `dj_u_live_band` | ¿Combinarás con banda en vivo? | boolean | Sí / No | - |
| `dj_u_first_dance_song` | ¿Ya tienes canción para el primer baile? | boolean | Sí / No | - |

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
| `dj_p_backup_equipment` | ¿Tienes equipo de respaldo? | boolean | Sí / No | - |
| `dj_p_experience_years` | Años de experiencia en bodas | number | 0-30 | - |
| `dj_p_weddings_per_year` | Bodas que realizas al año | number | 1-100 | - |
| `dj_p_setup_time` | Tiempo de montaje necesario | single | `1h` (1 hora), `2h` (2 horas), `3h` (3 horas), `4h` (4+ horas) | - |

---

## 5. Banquetería

### 5.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `catering_u_service_type` | ¿Qué tipo de servicio prefieres? | single | `plated` (Servido a la mesa), `buffet` (Buffet), `stations` (Estaciones temáticas), `cocktail` (Cóctel/Finger food), `family_style` (Estilo familiar) | 20% |
| `catering_u_cuisine` | ¿Qué tipo de cocina prefieres? | multiple | `chilean` (Chilena tradicional), `international` (Internacional), `mediterranean` (Mediterránea), `asian` (Asiática/Fusión), `gourmet` (Gourmet/Alta cocina), `comfort` (Comfort food) | 15% |
| `catering_u_budget_pp` | ¿Cuál es tu presupuesto por persona? | single | `under_25k` (Menos de $25.000), `25k_35k` ($25.000 - $35.000), `35k_50k` ($35.000 - $50.000), `50k_70k` ($50.000 - $70.000), `over_70k` (Más de $70.000) | 20% |
| `catering_u_guest_count` | ¿Cuántos invitados tendrás? | single | `under_50` (Menos de 50), `50_100` (50-100), `100_150` (100-150), `150_200` (150-200), `200_300` (200-300), `over_300` (Más de 300) | 10% |
| `catering_u_courses` | ¿Cuántos tiempos de comida? | single | `2` (2 tiempos), `3` (3 tiempos), `4` (4 tiempos), `5_plus` (5 o más tiempos) | 5% |
| `catering_u_cocktail` | ¿Incluirás hora de cóctel? | boolean | Sí / No | 5% |
| `catering_u_dietary` | ¿Necesitas opciones especiales? | multiple | `vegetarian` (Vegetariana), `vegan` (Vegana), `gluten_free` (Sin gluten), `kosher` (Kosher), `halal` (Halal), `none` (Ninguna) | 5% |
| `catering_u_beverages` | ¿Qué bebestibles necesitas? | multiple | `soft_drinks` (Bebidas), `wine` (Vinos), `beer` (Cerveza), `cocktails` (Cócteles), `open_bar` (Barra libre), `premium_liquor` (Licores premium) | 5% |
| `catering_u_tasting` | ¿Quieres degustación previa? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No necesario) | 3% |
| `catering_u_cake` | ¿Incluir torta de novios? | single | `no` (No, tengo otro proveedor), `simple` (Sí, simple), `elaborate` (Sí, elaborada), `dessert_table` (Mesa de postres completa) | 5% |
| `catering_u_staff` | ¿Qué nivel de servicio esperas? | single | `basic` (Básico), `standard` (Estándar), `premium` (Premium/Garzones dedicados) | 5% |
| `catering_u_setup` | ¿Necesitas montaje de mesas? | boolean | Sí / No | 2% |
| `catering_u_late_night` | ¿Necesitas snack de medianoche? | boolean | Sí / No | - |
| `catering_u_children_menu` | ¿Necesitas menú infantil? | boolean | Sí / No | - |
| `catering_u_vendor_meals` | ¿Incluir comida para proveedores? | boolean | Sí / No | - |

### 5.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `catering_p_service_types` | ¿Qué tipos de servicio ofreces? | multiple | `plated`, `buffet`, `stations`, `cocktail`, `family_style` | 20% |
| `catering_p_cuisines` | ¿Qué tipos de cocina ofreces? | multiple | `chilean`, `international`, `mediterranean`, `asian`, `gourmet`, `comfort` | 15% |
| `catering_p_price_pp_min` | Precio mínimo por persona | number | CLP | 20% |
| `catering_p_price_pp_max` | Precio máximo por persona | number | CLP | - |
| `catering_p_guests_min` | Mínimo de invitados que atiendes | number | 10-500 | 10% |
| `catering_p_guests_max` | Máximo de invitados que atiendes | number | 50-1000 | - |
| `catering_p_courses` | ¿Cuántos tiempos ofreces? | multiple | `2`, `3`, `4`, `5_plus` | 5% |
| `catering_p_cocktail` | ¿Ofreces servicio de cóctel? | boolean | Sí / No | 5% |
| `catering_p_dietary` | ¿Qué opciones especiales manejas? | multiple | `vegetarian`, `vegan`, `gluten_free`, `kosher`, `halal` | 5% |
| `catering_p_beverages` | ¿Qué bebestibles ofreces? | multiple | `soft_drinks`, `wine`, `beer`, `cocktails`, `open_bar`, `premium_liquor` | 5% |
| `catering_p_tasting` | ¿Ofreces degustación previa? | single | `yes_free` (Sí, gratis), `yes_paid` (Sí, con costo), `no` (No) | 3% |
| `catering_p_cake` | ¿Ofreces torta de novios? | single | `no`, `simple`, `elaborate`, `dessert_table` | 5% |
| `catering_p_staff_levels` | ¿Qué niveles de servicio ofreces? | multiple | `basic`, `standard`, `premium` | 5% |
| `catering_p_setup` | ¿Ofreces montaje de mesas? | boolean | Sí / No | 2% |
| `catering_p_equipment` | ¿Qué equipamiento incluyes? | multiple | `tables` (Mesas), `chairs` (Sillas), `tableware` (Vajilla), `glassware` (Cristalería), `linens` (Mantelería), `heating` (Calefacción), `tents` (Carpas) | - |
| `catering_p_kitchen_needs` | ¿Qué necesitas del lugar? | multiple | `full_kitchen` (Cocina completa), `basic_kitchen` (Cocina básica), `electricity` (Solo electricidad), `nothing` (Nada, traigo todo) | - |
| `catering_p_experience_years` | Años de experiencia en eventos | number | 0-30 | - |
| `catering_p_events_per_year` | Eventos que realizas al año | number | 1-200 | - |
| `catering_p_certifications` | ¿Tienes certificaciones? | multiple | `health_permit` (Resolución sanitaria), `haccp` (HACCP), `organic` (Orgánico certificado), `none` (Ninguna) | - |

---

## 6. Centro de Eventos

### 6.1 Encuesta para Usuarios

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `venue_u_type` | ¿Qué tipo de lugar prefieres? | single | `hacienda` (Hacienda/Campo), `hotel` (Hotel), `restaurant` (Restaurant), `garden` (Jardín/Parque), `beach` (Playa), `winery` (Viña), `loft` (Loft/Industrial), `mansion` (Casona/Mansión), `castle` (Castillo/Palacio) | 20% |
| `venue_u_setting` | ¿Interior o exterior? | single | `indoor` (Interior), `outdoor` (Exterior), `both` (Ambos/Mixto), `flexible` (Flexible según clima) | 15% |
| `venue_u_budget` | ¿Cuál es tu presupuesto para el lugar? | single | `under_1m` (Menos de $1.000.000), `1m_2m` ($1.000.000 - $2.000.000), `2m_4m` ($2.000.000 - $4.000.000), `4m_7m` ($4.000.000 - $7.000.000), `over_7m` (Más de $7.000.000) | 20% |
| `venue_u_capacity` | ¿Cuántos invitados tendrás? | single | `under_50` (Menos de 50), `50_100` (50-100), `100_150` (100-150), `150_200` (150-200), `200_300` (200-300), `over_300` (Más de 300) | 15% |
| `venue_u_exclusivity` | ¿Necesitas exclusividad del lugar? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No necesario) | 5% |
| `venue_u_ceremony_space` | ¿Necesitas espacio para ceremonia? | boolean | Sí / No | 5% |
| `venue_u_parking` | ¿Necesitas estacionamiento? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No necesario, habrá valet) | 5% |
| `venue_u_accommodation` | ¿Necesitas alojamiento para invitados? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No necesario) | 3% |
| `venue_u_catering_policy` | ¿Preferencia de catering? | single | `venue_only` (Solo del lugar), `external_ok` (Puede ser externo), `no_preference` (Sin preferencia) | 5% |
| `venue_u_end_time` | ¿Hasta qué hora necesitas el lugar? | single | `midnight` (Medianoche), `2am` (2:00 AM), `4am` (4:00 AM), `sunrise` (Hasta el amanecer), `flexible` (Flexible) | 5% |
| `venue_u_accessibility` | ¿Necesitas accesibilidad especial? | boolean | Sí / No | 2% |
| `venue_u_rain_plan` | ¿Necesitas plan de lluvia? | single | `required` (Indispensable), `preferred` (Preferible), `not_needed` (No, evento interior) | - |

### 6.2 Encuesta para Proveedores

| ID | Pregunta | Tipo | Opciones | Peso |
|----|----------|------|----------|------|
| `venue_p_type` | ¿Qué tipo de lugar eres? | single | `hacienda`, `hotel`, `restaurant`, `garden`, `beach`, `winery`, `loft`, `mansion`, `castle` | 20% |
| `venue_p_settings` | ¿Qué espacios ofreces? | multiple | `indoor`, `outdoor`, `both` | 15% |
| `venue_p_price_min` | Precio mínimo de arriendo | number | CLP | 20% |
| `venue_p_price_max` | Precio máximo de arriendo | number | CLP | - |
| `venue_p_capacity_min` | Capacidad mínima | number | 10-500 | 15% |
| `venue_p_capacity_max` | Capacidad máxima | number | 50-1000 | - |
| `venue_p_exclusivity` | ¿Ofreces exclusividad? | boolean | Sí / No | 5% |
| `venue_p_ceremony_space` | ¿Tienes espacio para ceremonia? | boolean | Sí / No | 5% |
| `venue_p_parking` | ¿Tienes estacionamiento? | single | `yes_free` (Sí, gratis), `yes_paid` (Sí, con costo), `valet` (Servicio valet), `no` (No) | 5% |
| `venue_p_parking_capacity` | Capacidad de estacionamiento | number | 0-500 | - |
| `venue_p_accommodation` | ¿Ofreces alojamiento? | single | `yes` (Sí), `nearby` (Convenio cercano), `no` (No) | 3% |
| `venue_p_accommodation_rooms` | Número de habitaciones | number | 0-100 | - |
| `venue_p_catering_policy` | ¿Política de catering? | single | `exclusive` (Solo nuestro catering), `preferred` (Preferimos el nuestro), `external_ok` (Externo permitido), `no_catering` (No ofrecemos catering) | 5% |
| `venue_p_end_time` | ¿Hasta qué hora pueden estar? | single | `midnight`, `2am`, `4am`, `sunrise`, `flexible` | 5% |
| `venue_p_sound_restrictions` | ¿Hay restricciones de sonido? | boolean | Sí / No | - |
| `venue_p_accessibility` | ¿Tienes accesibilidad? | boolean | Sí / No | 2% |
| `venue_p_rain_plan` | ¿Tienes plan de lluvia? | boolean | Sí / No | - |
| `venue_p_included_services` | ¿Qué servicios incluyes? | multiple | `tables` (Mesas), `chairs` (Sillas), `linens` (Mantelería), `lighting` (Iluminación básica), `sound` (Sonido básico), `coordinator` (Coordinador), `security` (Seguridad), `cleaning` (Limpieza) | - |
| `venue_p_restrictions` | ¿Qué restricciones tienes? | multiple | `no_fireworks` (Sin fuegos artificiales), `no_confetti` (Sin confetti), `no_red_wine` (Sin vino tinto), `no_pets` (Sin mascotas), `no_external_dj` (Sin DJ externo), `none` (Ninguna) | - |

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
| `deco_p_setup_time` | Tiempo de montaje necesario | single | `2h` (2 horas), `4h` (4 horas), `6h` (6 horas), `full_day` (Día completo) | - |
| `deco_p_experience_years` | Años de experiencia | number | 0-30 | - |

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
| `wp_p_events_per_month` | ¿Cuántos eventos manejas por mes? | single | `1` (1), `2_3` (2-3), `4_plus` (4 o más) | - |
| `wp_p_experience_years` | Años de experiencia | number | 0-20 | - |
| `wp_p_certifications` | ¿Tienes certificaciones? | multiple | `wpi` (Wedding Planner Institute), `abc` (ABC Certification), `other` (Otras), `none` (Ninguna) | - |

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
| `makeup_u_location` | ¿Dónde necesitas el servicio? | single | `home` (A domicilio), `salon` (En salón), `venue` (En el lugar del evento), `flexible` (Flexible) | - |

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
| `makeup_p_location` | ¿Dónde ofreces el servicio? | multiple | `home`, `salon`, `venue` | 3% |
| `makeup_p_travel` | ¿Viajas fuera de tu zona? | boolean | Sí / No | - |
| `makeup_p_products` | ¿Qué marcas de productos usas? | multiple | `mac` (MAC), `nars` (NARS), `charlotte_tilbury` (Charlotte Tilbury), `bobbi_brown` (Bobbi Brown), `dior` (Dior), `other_premium` (Otras premium), `mixed` (Variadas) | - |
| `makeup_p_experience_years` | Años de experiencia en novias | number | 0-20 | - |

---

## 10. Criterios de Matchmaking - VERSIÓN AVANZADA

### 10.1 Arquitectura del Sistema de Matchmaking

El sistema de matchmaking ha sido mejorado significativamente para proporcionar scores más precisos y justos. Las mejoras principales incluyen:

1. **Criterios de matching EXPLÍCITOS** por categoría (no automáticos)
2. **Sistema de especificidad**: proveedores nicho obtienen bonus
3. **Mejor comparación de rangos** numéricos con strings de presupuesto
4. **Score de cobertura**: qué tan bien el proveedor cubre las necesidades
5. **Combinación de datos**: wizard inicial + mini-encuestas por categoría

### 10.2 Cálculo del Match Score

```typescript
interface MatchResult {
  score: number;           // Score final (0-100)
  specificityBonus: number; // Bonus por ser especialista (+0 a +10)
  coverageScore: number;   // % de criterios bien cubiertos
  surveyScore: number;     // Score de la mini-encuesta
  wizardScore: number;     // Score del wizard inicial
}

function calculateCombinedMatchScore(
  userSurveyResponses: SurveyResponses,
  providerSurveyResponses: SurveyResponses,
  userWizardProfile: UserWizardProfile,
  providerWizardProfile: ProviderWizardProfile,
  category: CategoryId
): MatchResult {
  // 1. Calcular score de mini-encuesta (70% del total)
  const surveyResult = calculateMatchScore(userSurveyResponses, providerSurveyResponses, category);
  
  // 2. Calcular score del wizard (30% del total)
  const wizardResult = calculateWizardMatchScore(userWizardProfile, providerWizardProfile, category);
  
  // 3. Calcular especificidad del proveedor (bonus +0 a +10)
  const specificityBonus = calculateProviderSpecificity(providerSurveyResponses, category);
  
  // 4. Combinar scores
  const combinedScore = (surveyResult.score * 0.7) + (wizardResult.score * 0.3) + specificityBonus;
  
  return {
    score: Math.min(100, Math.round(combinedScore)),
    specificityBonus,
    coverageScore: surveyResult.coverageScore,
    surveyScore: surveyResult.score,
    wizardScore: wizardResult.score,
  };
}
```

### 10.3 Tipos de Comparación Mejorados

| Tipo | Lógica de Match | Descripción |
|------|-----------------|-------------|
| `single_in_multiple` | 100% si la opción del usuario está en las del proveedor | Usuario elige UNA opción, proveedor ofrece MÚLTIPLES. Bonus si proveedor es especialista (ofrece pocas opciones). |
| `contains` | % de opciones del usuario cubiertas por el proveedor | Múltiple vs múltiple. Score proporcional a cuántas preferencias del usuario cubre el proveedor. |
| `range_overlap` | Calcula superposición de rangos | Mapea strings de presupuesto del usuario a rangos numéricos y compara con min/max del proveedor. |
| `boolean_match` | Si usuario necesita (true), proveedor debe ofrecer | Si usuario no necesita algo, cualquier valor del proveedor es válido. |
| `preference_match` | Mapeo de preferencias a scores | Para campos como "required/preferred/not_needed" vs opciones del proveedor. |
| `exact` | Coincidencia exacta de valores | Para campos donde debe haber match exacto (ej: tipo de venue). |
| `threshold_at_most` | Proveedor debe entregar ANTES o igual | **Para tiempos de entrega**: Si usuario quiere en 2 meses y proveedor entrega en 2 semanas → **100%** (entrega antes = perfecto). |
| `threshold_at_least` | Proveedor debe ofrecer AL MENOS lo que usuario pide | **Para cantidad de fotos, horario de venue, mesas**: Si proveedor puede hacer más de lo que usuario necesita → **100%**. |
| `threshold_can_accommodate` | Proveedor debe poder acomodar lo que usuario necesita | **Para horas de cobertura, capacidad**: Si lo que usuario necesita está dentro del rango del proveedor → **100%**. |

### 10.3.1 Tipos de Comparación "Threshold" (Umbral) - IMPORTANTE

Estos tipos de comparación son **críticos** para preguntas donde "más es mejor" o "antes es mejor":

#### `threshold_at_most` - Para tiempos de entrega
**Lógica**: El proveedor debe entregar **ANTES O IGUAL** de cuando el usuario lo necesita.

```
Usuario quiere fotos en: 2 meses
Proveedor entrega en: 2 semanas
Resultado: 100% ✅ (entrega ANTES = perfecto)

Usuario quiere fotos en: 1 mes
Proveedor entrega en: 3 meses
Resultado: ~30% ⚠️ (tarda más de lo necesario)
```

#### `threshold_at_least` - Para cantidades y horarios
**Lógica**: El proveedor debe poder ofrecer **AL MENOS** lo que el usuario necesita.

```
Usuario necesita venue hasta: 2am
Venue permite hasta: 4am
Resultado: 100% ✅ (permite MÁS tarde = perfecto)

Usuario quiere: 400 fotos
Proveedor entrega hasta: 800 fotos
Resultado: 100% ✅ (puede dar MÁS = perfecto)
```

#### `threshold_can_accommodate` - Para rangos de servicio
**Lógica**: Lo que el usuario necesita debe estar **DENTRO** del rango del proveedor.

```
Usuario necesita: 8 horas de cobertura
Proveedor ofrece: 4-12 horas
Resultado: 100% ✅ (8 está en el rango = perfecto)

Usuario tiene: 150 invitados
Catering atiende: 50-500 personas
Resultado: 100% ✅ (150 está en el rango = perfecto)
```

### 10.4 Sistema de Especificidad

Los proveedores "nicho" (especializados) obtienen un bonus, mientras que los proveedores "generalistas" (que ofrecen todo) no reciben penalización pero tampoco bonus.

```typescript
// Cálculo de especificidad
function calculateProviderSpecificity(providerResponses, category): number {
  // Para cada pregunta de tipo "multiple":
  // - Si selecciona 1-2 de 6 opciones = muy especialista (0.8-1.0)
  // - Si selecciona 3-4 de 6 opciones = moderadamente especialista (0.4-0.6)
  // - Si selecciona 5-6 de 6 opciones = generalista (0-0.2)
  
  // El bonus máximo es +10 puntos al score final
  return specificityScore * 10;
}
```

**Ejemplo práctico:**
- Fotógrafo que solo hace estilo "documental" → +8-10 puntos de bonus
- Fotógrafo que hace todos los estilos → +0-2 puntos de bonus
- Ambos pueden tener scores altos, pero el especialista tiene ventaja cuando el usuario busca exactamente ese estilo

### 10.5 Mapeo de Rangos de Presupuesto

El sistema mapea los rangos de presupuesto del usuario (strings) a valores numéricos para compararlos con los precios min/max del proveedor:

```typescript
// Ejemplo para Fotografía
const userRangeMapping = {
  'under_500k': { min: 0, max: 500000 },
  '500k_800k': { min: 500000, max: 800000 },
  '800k_1200k': { min: 800000, max: 1200000 },
  '1200k_1800k': { min: 1200000, max: 1800000 },
  'over_1800k': { min: 1800000, max: 10000000 },
};

// Si el rango del usuario se superpone con el rango del proveedor → score alto
// Si no hay superposición → score bajo proporcional a la distancia
```

### 10.6 Pesos por Categoría (Criterios Explícitos)

Los criterios de matching están definidos explícitamente para cada categoría, con mapeos precisos entre preguntas de usuario y proveedor.

#### Fotografía
| Criterio Usuario | Criterio Proveedor | Tipo Match | Peso | Notas |
|------------------|-------------------|------------|------|-------|
| `photo_u_style` | `photo_p_styles` | single_in_multiple | 25% | |
| `photo_u_budget` | `photo_p_price_min/max` | range_overlap | 20% | |
| `photo_u_hours` | `photo_p_hours_min/max` | **threshold_can_accommodate** | 15% | Si usuario quiere 8h y proveedor ofrece 4-12h → 100% |
| `photo_u_preboda` | `photo_p_preboda` | boolean_match | 5% | |
| `photo_u_postboda` | `photo_p_postboda` | boolean_match | 5% | |
| `photo_u_second_shooter` | `photo_p_second_shooter` | preference_match | 5% | |
| `photo_u_delivery_time` | `photo_p_delivery_time` | **threshold_at_most** | 5% | Si usuario quiere en 2 meses y proveedor entrega en 2 semanas → 100% |
| `photo_u_delivery_format` | `photo_p_delivery_formats` | contains | 5% | |
| `photo_u_photo_count` | `photo_p_photo_count_min/max` | **threshold_at_least** | 5% | Si usuario quiere 400 y proveedor entrega hasta 800 → 100% |
| `photo_u_retouching` | `photo_p_retouching_levels` | single_in_multiple | 5% | |

#### Videografía
| Criterio Usuario | Criterio Proveedor | Tipo Match | Peso | Notas |
|------------------|-------------------|------------|------|-------|
| `video_u_style` | `video_p_styles` | single_in_multiple | 25% | |
| `video_u_budget` | `video_p_price_min/max` | range_overlap | 20% | |
| `video_u_duration` | `video_p_durations` | single_in_multiple | 15% | |
| `video_u_hours` | `video_p_hours_min/max` | **threshold_can_accommodate** | 10% | Si usuario quiere 8h y proveedor ofrece 4-12h → 100% |
| `video_u_second_camera` | `video_p_second_camera` | preference_match | 5% | |
| `video_u_drone` | `video_p_drone` | preference_match | 5% | |
| `video_u_same_day_edit` | `video_p_same_day_edit` | boolean_match | 5% | |
| `video_u_raw_footage` | `video_p_raw_footage` | preference_match | 3% | |
| `video_u_social_reel` | `video_p_social_reel` | preference_match | 5% | |
| `video_u_delivery_time` | `video_p_delivery_time` | **threshold_at_most** | 5% | Si usuario quiere en 3 meses y proveedor entrega en 1 mes → 100% |

#### DJ/VJ
| Criterio Usuario | Criterio Proveedor | Tipo Match | Peso | Notas |
|------------------|-------------------|------------|------|-------|
| `dj_u_genres` | `dj_p_genres` | contains | 25% | |
| `dj_u_budget` | `dj_p_price_min/max` | range_overlap | 20% | |
| `dj_u_style` | `dj_p_styles` | single_in_multiple | 15% | |
| `dj_u_hours` | `dj_p_hours_min/max` | **threshold_can_accommodate** | 10% | Si usuario quiere 5h y proveedor ofrece 3-8h → 100% |
| `dj_u_mc` | `dj_p_mc_levels` | single_in_multiple | 10% | |
| `dj_u_ceremony_music` | `dj_p_ceremony_music` | boolean_match | 5% | |
| `dj_u_lighting` | `dj_p_lighting_levels` | single_in_multiple | 5% | |
| `dj_u_cocktail_music` | `dj_p_cocktail_music` | boolean_match | 3% | |
| `dj_u_effects` | `dj_p_effects` | contains | 3% | |
| `dj_u_karaoke` | `dj_p_karaoke` | boolean_match | 2% | |

#### Banquetería
| Criterio Usuario | Criterio Proveedor | Tipo Match | Peso | Notas |
|------------------|-------------------|------------|------|-------|
| `catering_u_service_type` | `catering_p_service_types` | single_in_multiple | 20% | |
| `catering_u_budget_pp` | `catering_p_price_pp_min/max` | range_overlap | 20% | |
| `catering_u_cuisine` | `catering_p_cuisines` | contains | 15% | |
| `catering_u_guest_count` | `catering_p_guests_min/max` | **threshold_can_accommodate** | 10% | Si usuario tiene 150 invitados y proveedor atiende 50-500 → 100% |
| `catering_u_courses` | `catering_p_courses` | single_in_multiple | 5% | |
| `catering_u_cocktail` | `catering_p_cocktail` | boolean_match | 5% | |
| `catering_u_dietary` | `catering_p_dietary` | contains | 5% | |
| `catering_u_beverages` | `catering_p_beverages` | contains | 5% | |
| `catering_u_cake` | `catering_p_cake` | exact | 5% | |
| `catering_u_staff` | `catering_p_staff_levels` | single_in_multiple | 5% | |
| `catering_u_tasting` | `catering_p_tasting` | preference_match | 3% | |
| `catering_u_setup` | `catering_p_setup` | boolean_match | 2% | |

#### Centro de Eventos
| Criterio Usuario | Criterio Proveedor | Tipo Match | Peso | Notas |
|------------------|-------------------|------------|------|-------|
| `venue_u_type` | `venue_p_type` | exact | 20% | |
| `venue_u_budget` | `venue_p_price_min/max` | range_overlap | 20% | |
| `venue_u_capacity` | `venue_p_capacity_min/max` | **threshold_can_accommodate** | 15% | Si usuario tiene 150 invitados y venue tiene capacidad 50-300 → 100% |
| `venue_u_setting` | `venue_p_settings` | single_in_multiple | 15% | |
| `venue_u_exclusivity` | `venue_p_exclusivity` | preference_match | 5% | |
| `venue_u_ceremony_space` | `venue_p_ceremony_space` | boolean_match | 5% | |
| `venue_u_parking` | `venue_p_parking` | preference_match | 5% | |
| `venue_u_catering_policy` | `venue_p_catering_policy` | exact | 5% | |
| `venue_u_end_time` | `venue_p_end_time` | **threshold_at_least** | 5% | Si usuario quiere hasta 2am y venue permite hasta 4am → 100% |
| `venue_u_accommodation` | `venue_p_accommodation` | preference_match | 3% | |
| `venue_u_accessibility` | `venue_p_accessibility` | boolean_match | 2% | |

#### Decoración
| Criterio Usuario | Criterio Proveedor | Tipo Match | Peso | Notas |
|------------------|-------------------|------------|------|-------|
| `deco_u_style` | `deco_p_styles` | single_in_multiple | 25% | |
| `deco_u_budget` | `deco_p_price_min/max` | range_overlap | 20% | |
| `deco_u_colors` | `deco_p_color_expertise` | contains | 15% | |
| `deco_u_flowers` | `deco_p_flower_types` | contains | 10% | |
| `deco_u_bridal_bouquet` | `deco_p_bridal_bouquet` | boolean_match | 5% | |
| `deco_u_ceremony_deco` | `deco_p_ceremony_deco` | boolean_match | 5% | |
| `deco_u_table_centerpieces` | `deco_p_centerpiece_types` | single_in_multiple | 5% | |
| `deco_u_table_count` | `deco_p_table_capacity` | **threshold_at_least** | 5% | Si usuario tiene 25 mesas y proveedor puede hacer hasta 50 → 100% |
| `deco_u_extras` | `deco_p_extras` | contains | 5% | |
| `deco_u_rental` | `deco_p_rental` | boolean_match | 5% | |

#### Wedding Planner
| Criterio Usuario | Criterio Proveedor | Tipo Match | Peso | Notas |
|------------------|-------------------|------------|------|-------|
| `wp_u_service_level` | `wp_p_service_levels` | single_in_multiple | 25% | |
| `wp_u_budget` | `wp_p_price_min/max` | range_overlap | 20% | |
| `wp_u_vendor_help` | `wp_p_vendor_network` | preference_match | 15% | |
| `wp_u_design_help` | `wp_p_design_services` | contains | 10% | |
| `wp_u_budget_management` | `wp_p_budget_management` | boolean_match | 5% | |
| `wp_u_timeline_management` | `wp_p_timeline_management` | boolean_match | 5% | |
| `wp_u_guest_management` | `wp_p_guest_management` | boolean_match | 5% | |
| `wp_u_rehearsal` | `wp_p_rehearsal` | boolean_match | 3% | |

#### Maquillaje & Peinado
| Criterio Usuario | Criterio Proveedor | Tipo Match | Peso | Notas |
|------------------|-------------------|------------|------|-------|
| `makeup_u_style` | `makeup_p_styles` | single_in_multiple | 25% | |
| `makeup_u_budget` | `makeup_p_price_bride` | range_overlap | 20% | |
| `makeup_u_hair` | `makeup_p_hair` | boolean_match | 15% | |
| `makeup_u_trial` | `makeup_p_trial` | preference_match | 10% | |
| `makeup_u_hair_style` | `makeup_p_hair_styles` | single_in_multiple | 10% | |
| `makeup_u_lashes` | `makeup_p_lashes` | preference_match | 5% | |
| `makeup_u_touch_ups` | `makeup_p_touch_ups` | exact | 4% | |
| `makeup_u_extensions` | `makeup_p_extensions` | boolean_match | 3% | |
| `makeup_u_bridesmaids` | `makeup_p_max_clients` | **threshold_at_least** | 5% | Si usuario necesita 8 personas y proveedor atiende hasta 15 → 100% |

---

## Anexo: Estructura de Datos TypeScript

### Tipos para Encuestas

```typescript
// Tipo de pregunta
type QuestionType = 'single' | 'multiple' | 'range' | 'boolean' | 'text' | 'number';

// Opción de respuesta
interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

// Definición de pregunta
interface SurveyQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  required: boolean;
  weight: number; // 0-100
}

// Respuestas guardadas
interface SurveyResponse {
  id: string;
  entityId: string; // userId o providerId
  entityType: 'user' | 'provider';
  category: string;
  responses: Record<string, string | string[] | number | boolean>;
  completedAt: Timestamp;
}

// Categoría con sus preguntas
interface CategorySurveyConfig {
  categoryId: string;
  categoryName: string;
  userQuestions: SurveyQuestion[];
  providerQuestions: SurveyQuestion[];
}
```

### Tipos para Matching Avanzado

```typescript
// Criterio de matching explícito
interface ExplicitMatchCriterion {
  userQuestionId: string;
  providerQuestionId: string;
  weight: number;
  matchType: 'exact' | 'contains' | 'range_overlap' | 'boolean_match' | 'single_in_multiple' | 'preference_match';
  // Para rangos numéricos, mapeo de opciones del usuario a valores
  userRangeMapping?: Record<string, { min: number; max: number }>;
  // Para preference_match
  preferenceMapping?: Record<string, number>;
}

// Resultado del matching
interface MatchResult {
  providerId: string;
  userId: string;
  category: CategoryId;
  matchScore: number;          // Score final (0-100)
  matchDetails: MatchDetail[]; // Detalles por criterio
  specificityBonus: number;    // Bonus por ser especialista (+0 a +10)
  coverageScore: number;       // % de criterios bien cubiertos
  createdAt: Date;
}

// Detalle de un criterio
interface MatchDetail {
  criterionId: string;
  userQuestionId: string;
  providerQuestionId: string;
  userValue: string | string[] | number | boolean | undefined;
  providerValue: string | string[] | number | boolean | undefined;
  score: number;               // Score del criterio (0-1)
  weight: number;              // Peso del criterio
  matchType: string;           // Tipo de comparación usado
  explanation?: string;        // Explicación legible
}

// Perfiles del wizard
interface UserWizardProfile {
  budget: string;
  guestCount: string;
  region: string;
  eventStyle: string;
  ceremonyTypes: string[];
  priorityCategories: string[];
  involvementLevel: string;
}

interface ProviderWizardProfile {
  serviceStyle: string;
  priceRange: string;
  workRegion: string;
  acceptsOutsideZone: boolean;
  categories: string[];
}
```

---

## Anexo: Ejemplos de Cálculo de Match

### Ejemplo 1: Proveedor Especialista vs Generalista

**Usuario busca:** Fotografía documental, presupuesto $800k-1.2M

**Proveedor A (Especialista):**
- Estilos: solo "documental"
- Precio: $700k - $1M
- Score base: 95%
- Bonus especificidad: +8%
- **Score final: 100%** (capped)

**Proveedor B (Generalista):**
- Estilos: todos los 6 estilos
- Precio: $500k - $2M
- Score base: 90%
- Bonus especificidad: +1%
- **Score final: 91%**

### Ejemplo 2: Match de Rango de Presupuesto

**Usuario:** "500k_800k" → se mapea a { min: 500000, max: 800000 }

**Proveedor:** price_min: 400000, price_max: 900000

**Cálculo:**
- Superposición: 500000 - 800000 (todo el rango del usuario)
- Score: 100% (superposición completa)

**Proveedor alternativo:** price_min: 900000, price_max: 1500000

**Cálculo:**
- No hay superposición
- Gap: 100000 (900k - 800k)
- Score: ~50% (penalización por estar fuera del rango)

---

*Documento actualizado: Diciembre 2025*
*Versión: 2.0 - Sistema de Matchmaking Avanzado*

